// Full-site bug scan: one real Chrome visits every page it can find (links plus sitemap.xml; buttons are
// not clicked) and records everything that goes wrong. Run this BEFORE the load tests: it finds the bugs
// that exist even with one visitor, and saves the pages and APIs it found so the load test can use them.
//
// Usage: node scan.js <url> [--max-pages N] [--auth auth.json] [--no-external] [--no-a11y] [--show]
//   --auth         use a login saved with `npm run login` (scans pages behind the login)
//   --no-external  skip checking links that point to other websites
//   --no-a11y      skip the accessibility check
//   --fail-on-new  exit with an error when a problem is new since the last scan (for CI)
//
// Safe for live sites: it only opens pages. It never clicks buttons, submits forms or types,
// and skips links that look like logout / delete / cart actions / downloads.
const fs = require('fs');
const path = require('path');
const tls = require('tls');
const { chromium } = require('playwright');
const { sameSite, looksLikeBotCheck } = require('./site');
const { esc, barChart, writeHtmlReport } = require('./report-html');
const { fixFor } = require('./fixes');

const SLOW_PAGE_MS = 3000; // a page taking longer than this to load is an error
const PAGE_TIMEOUT_MS = 30000;
const MOBILE = { width: 375, height: 812 };
const MAX_SITEMAPS = 10;
const MAX_EXTERNAL_LINKS = 200;
const HEAVY_PAGE_BYTES = 3 * 1024 * 1024; // whole page download
const LARGE_IMAGE_BYTES = 500 * 1024; // one image
const CERT_WARN_DAYS = 21;
const A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const SECURITY_HEADERS = ['content-security-policy', 'x-content-type-options', 'referrer-policy'];
// Core Web Vitals thresholds (Google): good / poor boundaries.
const LCP_GOOD_MS = 2500;
const LCP_POOR_MS = 4000;
const CLS_GOOD = 0.1;
const CLS_POOR = 0.25;
const KEYBOARD_TABS = 12; // how many times Tab is pressed on each page
const MAX_FILES_PER_ISSUE = 10; // cache / compression problems list at most this many files
const COMPRESS_MIN_BYTES = 1500;
const META_DESCRIPTION = { min: 50, max: 160 };
// Phone check: Lighthouse's mobile settings (slow 4G network, CPU 4x slower than this computer).
const PHONE = { latencyMs: 150, downKbps: 1638, upKbps: 750, cpuSlowdown: 4 };
const PHONE_TIMEOUT_MS = 45000;
const MAX_PHONE_PAGES = 10;
const SKIP_LINK =
  /logout|log-out|signout|sign-out|delete|remove|unsubscribe|add-to-cart|cart\/add|\.(pdf|zip|rar|7z|exe|dmg|apk|mp4|mp3|mov|avi|docx?|xlsx?|pptx?|csv)(\?|$)/i;

// ---- arguments
const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const show = argv.includes('--show');
const checkExternal = !argv.includes('--no-external');
const checkA11y = !argv.includes('--no-a11y');
const checkMobile = !argv.includes('--no-phone');
const failOnNew = argv.includes('--fail-on-new');
const maxPages = Number(flag('--max-pages') || 100);
const authFile = flag('--auth');
const valueIdx = new Set(['--max-pages', '--auth'].map((f) => argv.indexOf(f) + 1).filter((i) => i > 0));
const target = argv.find((a, i) => !a.startsWith('--') && !valueIdx.has(i));
if (!/^https?:\/\//.test(target || '')) {
  console.error('Usage: node scan.js <https://your-site.com> [--max-pages N] [--auth auth.json] [--no-external] [--no-a11y] [--fail-on-new] [--show]');
  process.exit(1);
}
let storageState;
if (authFile) {
  try {
    // Strip a byte-order mark: files re-saved by some Windows editors start with one.
    storageState = JSON.parse(fs.readFileSync(authFile, 'utf8').replace(/^﻿/, ''));
  } catch (err) {
    console.error(`Login file ${authFile} ${err.code === 'ENOENT' ? 'not found' : 'is not valid'}. Create it with: npm run login -- ${target}`);
    process.exit(1);
  }
}
const axeSource = checkA11y ? fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8') : '';

// ---- issue collection: the same broken image on 20 pages is one line listing those pages.
// `subject` is what the issue is about (usually a URL); it stays the same between runs even when the
// detail has numbers in it (load times, sizes), so runs can be compared.
const fileIssueCount = { cache: 0, compress: 0 };
const issues = new Map();
function add(severity, type, detail, pageUrl, subject = detail) {
  const key = `${type}|${detail}`;
  if (!issues.has(key)) issues.set(key, { severity, type, detail, subject, pages: new Set() });
  if (pageUrl) issues.get(key).pages.add(pageUrl);
}

let siteOrigin = new URL(target).origin; // replaced by the real origin after redirects (e.g. www)
const isOurs = (u) => sameSite(u, siteOrigin);
const isLocal = (u) => /^(localhost|127\.|\[::1\])/.test(new URL(u).hostname);
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
// Keyboard check: press Tab through the page. Finds focus that cannot be seen and keyboard traps.
async function keyboardCheck(page) {
  await page.evaluate(() => {
    document.activeElement?.blur?.();
    window.scrollTo(0, 0);
  });
  const stops = [];
  for (let i = 0; i < KEYBOARD_TABS; i++) {
    await page.keyboard.press('Tab');
    const stop = await page
      .evaluate(() => {
        let el = document.activeElement;
        if (!el || el === document.body || el === document.documentElement) return null;
        // Inside a widget (iframe or shadow DOM, e.g. a captcha) the page keeps reporting the same outer element
        // while Tab moves within it, so look inside where possible and skip what cannot be seen.
        if (el.tagName === 'IFRAME') return { skip: true };
        while (el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
        if (el.shadowRoot || el.tagName === 'IFRAME') return { skip: true };
        const look = () => {
          const s = getComputedStyle(el);
          return { outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0, shadow: s.boxShadow !== 'none', sig: [s.backgroundColor, s.borderColor, s.color, s.textDecorationLine].join('|') };
        };
        const focused = look();
        el.blur();
        const plain = look();
        el.focus();
        const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('href') || el.name || '').trim().slice(0, 40);
        return { id: el.tagName.toLowerCase() + '|' + (el.id || '') + '|' + name, label: el.tagName.toLowerCase() + (name ? ` "${name}"` : ''), visible: focused.outline || focused.shadow || focused.sig !== plain.sig };
      })
      .catch(() => null);
    if (stop) stops.push(stop.skip ? { id: `skip${i}`, label: 'widget', visible: true } : stop);
  }
  return stops;
}

function canonical(href) {
  try {
    const u = new URL(href, siteOrigin);
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = '';
    return isOurs(u.href) ? siteOrigin + u.pathname + u.search : u.href;
  } catch {
    return null;
  }
}

async function readSitemaps(request) {
  const found = new Set();
  const sitemapUrls = new Set([`${siteOrigin}/sitemap.xml`]);
  const robots = await request.get(`${siteOrigin}/robots.txt`).catch(() => null);
  if (robots && robots.ok()) {
    for (const m of (await robots.text()).matchAll(/^\s*sitemap:\s*(\S+)/gim)) sitemapUrls.add(m[1]);
  }
  const queue = [...sitemapUrls];
  for (let n = 0; queue.length && n < MAX_SITEMAPS; n++) {
    const res = await request.get(queue.shift()).catch(() => null);
    if (!res || !res.ok()) continue;
    for (const m of (await res.text()).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
      const loc = m[1].replace(/&amp;/g, '&');
      if (/\.xml(\.gz)?(\?|$)/i.test(loc)) queue.push(loc);
      else found.add(loc);
    }
  }
  return [...found];
}

// Links to other websites: a 404/410 is a broken link on our page; other refusals (403, 429, 999...)
// usually mean that site blocks automated checks, so they are only "could not verify".
async function checkExternalLinks(request, links) {
  const list = [...links.entries()].slice(0, MAX_EXTERNAL_LINKS);
  let next = 0;
  async function worker() {
    while (next < list.length) {
      const [url, pages] = list[next++];
      let res = await request.head(url, { timeout: 10000, failOnStatusCode: false }).catch((e) => e);
      if (!(res instanceof Error) && [403, 405, 501].includes(res.status())) {
        res = await request.get(url, { timeout: 10000, failOnStatusCode: false }).catch((e) => e);
      }
      for (const p of pages) {
        if (res instanceof Error) add('warning', 'External link could not be reached', `${url} (${res.message.split('\n')[0]})`, p);
        else if ([404, 410].includes(res.status())) add('error', `Broken external link (HTTP ${res.status()})`, url, p);
        else if (res.status() >= 400) add('warning', `External link could not be verified (HTTP ${res.status()})`, url, p);
      }
    }
  }
  await Promise.all(Array.from({ length: 5 }, worker));
  return links.size;
}

const CERT_ERRORS = {
  DEPTH_ZERO_SELF_SIGNED_CERT: 'self-signed certificate (browsers show a security warning)',
  SELF_SIGNED_CERT_IN_CHAIN: 'self-signed certificate in the chain',
  CERT_HAS_EXPIRED: 'certificate has expired',
  ERR_TLS_CERT_ALTNAME_INVALID: 'certificate is for a different domain name',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'incomplete certificate chain (missing intermediate certificate)',
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: 'incomplete certificate chain (missing intermediate certificate)',
};

function vitalsIssues(url, vitals, where, { lcp = true, cls = true } = {}) {
  const s = (ms) => `${(ms / 1000).toFixed(1)} s`;
  if (lcp && vitals.lcp > LCP_POOR_MS) {
    add('warning', 'Core Web Vitals: poor LCP', `${url} main content appeared after ${s(vitals.lcp)}${where} (good: under ${LCP_GOOD_MS / 1000} s)`, url, url);
  } else if (lcp && vitals.lcp > LCP_GOOD_MS) {
    add('warning', 'Core Web Vitals: LCP needs improvement', `${url} main content appeared after ${s(vitals.lcp)}${where} (good: under ${LCP_GOOD_MS / 1000} s)`, url, url);
  }
  if (!cls) return;
  if (vitals.cls > CLS_POOR) {
    add('warning', 'Core Web Vitals: poor CLS', `${url} layout jumps while loading (CLS ${vitals.cls.toFixed(2)}${where}, good: under ${CLS_GOOD})`, url, url);
  } else if (vitals.cls > CLS_GOOD) {
    add('warning', 'Core Web Vitals: CLS needs improvement', `${url} layout jumps while loading (CLS ${vitals.cls.toFixed(2)}${where}, good: under ${CLS_GOOD})`, url, url);
  }
}

// Measures LCP and CLS once the page has loaded (buffered entries include everything since navigation).
const VITALS_SCRIPT = () =>
  new Promise((resolve) => {
    const out = { lcp: null, cls: 0 };
    try {
      new PerformanceObserver((list) => {
        const e = list.getEntries();
        if (e.length) out.lcp = e[e.length - 1].startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // older browsers: no vitals
    }
    setTimeout(() => resolve(out), 250);
  });

// Opens pages again as a mid-range phone on a slow 4G network (Lighthouse's mobile settings), because
// that is how Google measures Core Web Vitals and how many real visitors see the site.
async function measurePhoneVitals(browser, storageState, pages) {
  const context = await browser.newContext({
    viewport: MOBILE,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true,
    ...(storageState ? { storageState } : {}),
  });
  const results = [];
  for (const url of pages) {
    const page = await context.newPage();
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: PHONE.latencyMs,
      downloadThroughput: (PHONE.downKbps * 1024) / 8,
      uploadThroughput: (PHONE.upKbps * 1024) / 8,
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: PHONE.cpuSlowdown });
    try {
      await page.goto(url, { waitUntil: 'load', timeout: PHONE_TIMEOUT_MS });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      const vitals = await page.evaluate(VITALS_SCRIPT);
      results.push({ url, ...vitals });
      // CLS from the phone only when the desktop pass did not already flag it for this page.
      const clsFlagged = [...issues.values()].some((i) => /CLS/.test(i.type) && i.subject === url);
      vitalsIssues(url, vitals, ' on a phone (slow 4G)', { lcp: true, cls: !clsFlagged });
    } catch {
      add('warning', 'Very slow on phones', `${url} did not finish loading within ${PHONE_TIMEOUT_MS / 1000} s on a phone (slow 4G)`, url, url);
      results.push({ url, lcp: null, cls: 0, timedOut: true });
    }
    await page.close();
    process.stdout.write('p');
  }
  await context.close();
  return results;
}

function checkCertificate(host, port) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: false, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      const code = socket.authorizationError && String(socket.authorizationError);
      // Hostname mismatch is not part of authorizationError; check it separately.
      const nameError = cert && cert.subject ? tls.checkServerIdentity(host, cert) : null;
      const error = code ? CERT_ERRORS[code] || code : nameError ? CERT_ERRORS.ERR_TLS_CERT_ALTNAME_INVALID : null;
      socket.end();
      resolve({ authorized: !error, error, validTo: cert && cert.valid_to });
    });
    socket.on('error', (err) => resolve({ authorized: false, error: err.message || err.code }));
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ authorized: false, error: 'timed out' });
    });
  });
}

async function checkHttps(request, mainHeaders) {
  const url = new URL(siteOrigin);
  if (url.protocol === 'http:') {
    if (!isLocal(siteOrigin)) add('error', 'Site not using HTTPS', `${siteOrigin} is served over plain HTTP`);
  } else {
    const cert = await checkCertificate(url.hostname, Number(url.port) || 443);
    if (!cert.authorized) add('error', 'Invalid HTTPS certificate', `${url.hostname}: ${cert.error}`);
    else if (cert.validTo) {
      const days = Math.floor((new Date(cert.validTo) - Date.now()) / 86400000);
      if (days < CERT_WARN_DAYS) add('warning', 'HTTPS certificate expires soon', `${url.hostname} expires in ${days} day(s) (${cert.validTo})`, null, url.hostname);
    }
    if (!isLocal(siteOrigin)) {
      const plain = await request.get(`http://${url.host}/`, { maxRedirects: 0, timeout: 10000, failOnStatusCode: false }).catch(() => null);
      const location = plain && plain.headers()['location'];
      if (plain && !(plain.status() >= 300 && plain.status() < 400 && /^https:/i.test(location || ''))) {
        add('warning', 'HTTP does not redirect to HTTPS', `http://${url.host}/ answered HTTP ${plain.status()} instead of redirecting`);
      }
    }
    if (!mainHeaders['strict-transport-security']) add('warning', 'Missing security header', 'strict-transport-security (HSTS)');
  }
  for (const h of SECURITY_HEADERS) if (!mainHeaders[h]) add('warning', 'Missing security header', h);
  if (!mainHeaders['x-frame-options'] && !/frame-ancestors/i.test(mainHeaders['content-security-policy'] || '')) {
    add('warning', 'Missing security header', 'x-frame-options (or CSP frame-ancestors): page can be framed by other sites');
  }
}

(async () => {
  console.log(`Scanning ${target} (up to ${maxPages} pages)${authFile ? ' as a logged-in user' : ''}${show ? ' with a visible window' : ''}...`);
  const browser = await chromium.launch({ channel: 'chrome', headless: !show, slowMo: show ? 200 : 0 });
  // Certificate problems are reported by the HTTPS check; ignoring them here lets the rest be scanned.
  const context = await browser.newContext({ ignoreHTTPSErrors: true, ...(storageState ? { storageState } : {}) });
  const page = await context.newPage();
  let currentUrl = target;
  const apis = new Set();
  const externalLinks = new Map(); // url -> pages that link to it

  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  page.on('pageerror', (err) => add('error', 'JavaScript exception', err.message, currentUrl));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    // Broken resources are reported with their URL by the response handler and favicon check.
    if (/Failed to load resource/.test(msg.text())) return;
    const where = msg.location()?.url;
    if (where && !isOurs(where)) add('warning', 'Third-party console error', `${msg.text()} (${where})`, currentUrl);
    else add('error', 'Console error', `${msg.text()}${where ? ` (${where})` : ''}`, currentUrl);
  });
  page.on('request', (req) => {
    // Mixed content: an HTTPS page loading files over plain HTTP (browsers block or warn).
    if (currentUrl.startsWith('https:') && req.url().startsWith('http:') && !req.isNavigationRequest()) {
      add('error', 'Mixed content (HTTP file on HTTPS page)', req.url(), currentUrl);
    }
  });
  page.on('requestfailed', (req) => {
    const err = req.failure()?.errorText || '';
    if (err.includes('ERR_ABORTED')) return; // normal when moving to the next page
    if (isOurs(req.url())) add('error', 'Request failed', `${req.url()} (${err})`, currentUrl);
    else add('warning', 'Third-party request failed', `${req.url()} (${err})`, currentUrl);
  });
  page.on('response', (res) => {
    const req = res.request();
    if (req.isNavigationRequest()) return;
    const kind = req.resourceType();
    const ours = isOurs(res.url());
    if (ours && ['fetch', 'xhr'].includes(kind) && req.method() === 'GET') {
      const u = new URL(res.url());
      apis.add(u.pathname + u.search);
    }
    if (ours && res.status() === 200 && !isLocal(siteOrigin)) {
      const h = res.headers();
      const asset = ['script', 'stylesheet', 'font', 'image'].includes(kind);
      const size = Number(h['content-length'] || 0);
      const text = ['script', 'stylesheet'].includes(kind) || /text|json|xml|svg/.test(h['content-type'] || '');
      if (asset && !h['cache-control'] && !h.expires && fileIssueCount.cache++ < MAX_FILES_PER_ISSUE) {
        add('warning', 'Performance: file without cache rules', `${res.url()} has no Cache-Control header, so browsers download it again on every visit`, currentUrl, res.url());
      }
      if (text && size > COMPRESS_MIN_BYTES && !h['content-encoding'] && fileIssueCount.compress++ < MAX_FILES_PER_ISSUE) {
        add('warning', 'Performance: file not compressed', `${res.url()} (${kb(size)}) is sent without gzip/brotli`, currentUrl, res.url());
      }
    }
    if (res.status() < 400) return;
    if (ours) add('error', `Broken ${kind} (HTTP ${res.status()})`, res.url(), currentUrl);
    else add('warning', `Third-party ${kind} broken (HTTP ${res.status()})`, res.url(), currentUrl);
  });

  // Learn the real site address before the first page loads (example.com -> www.example.com, http -> https),
  // so the first page's own files are not mistaken for third-party ones.
  const probe = await context.request.get(target, { timeout: PAGE_TIMEOUT_MS }).catch(() => null);
  if (probe) siteOrigin = new URL(probe.url()).origin;

  const queue = [{ url: canonical(target), referrer: null }];
  const seen = new Set([queue[0].url]);
  const stats = [];
  const okPages = [];
  const vitalsByPage = [];
  const titles = new Map(); // title -> pages, to find duplicates
  const descriptions = new Map(); // meta description -> pages
  let usedSitemap = false;
  let mainHeaders = null;

  while (queue.length && stats.length < maxPages) {
    const { url, referrer } = queue.shift();
    currentUrl = url;
    const before = issues.size;
    const started = Date.now();
    let response;
    try {
      response = await page.goto(url, { waitUntil: 'load', timeout: PAGE_TIMEOUT_MS });
    } catch (err) {
      add('error', 'Page did not load', `${url} (${err.message.split('\n')[0]})`, referrer, url);
      process.stdout.write('x');
      if (stats.length === 0) break;
      continue;
    }
    const loadMs = Date.now() - started;
    const status = response ? response.status() : 0;
    const title = await page.title().catch(() => '');

    // Bot protection: stop with a clear message instead of reporting the challenge page.
    if (looksLikeBotCheck(status, response ? response.headers() : {}, title)) {
      add('error', 'Blocked by bot protection', `${url} returned HTTP ${status} "${title}"`, url);
      if (stats.length === 0) break;
      continue;
    }

    // First page: confirm the real site address (a JavaScript redirect is only visible here).
    if (stats.length === 0) {
      siteOrigin = new URL(page.url()).origin;
      if (siteOrigin !== new URL(target).origin) console.log(`(redirected to ${siteOrigin})`);
      mainHeaders = response ? response.headers() : {};
    }
    const finalUrl = canonical(page.url());
    if (finalUrl && finalUrl !== url) {
      if (!isOurs(finalUrl)) {
        add('warning', 'Link redirects off-site', `${url} -> ${page.url()}`, referrer);
        continue;
      }
      seen.add(finalUrl);
    }
    stats.push({ url: finalUrl || url, loadMs });

    if (status >= 400) {
      add('error', `Broken page (HTTP ${status})`, url, referrer || '(start page)');
      process.stdout.write('x');
    } else {
      okPages.push(new URL(finalUrl || url).pathname + new URL(finalUrl || url).search);
      if (loadMs > SLOW_PAGE_MS) add('error', 'Slow page', `${url} took ${(loadMs / 1000).toFixed(1)} s to load`, url, url);

      // Let late scripts and API calls finish so their errors are caught.
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Core Web Vitals, measured before the mobile resize below (resizing would count as layout shift).
      // Lab values from this computer: real visitors on slower phones and networks will see higher numbers.
      const vitals = await page.evaluate(VITALS_SCRIPT).catch(() => ({ lcp: null, cls: 0 }));
      vitalsByPage.push({ url, ...vitals });
      // Load speed (LCP) is judged on the phone when that check is on (closer to real visitors). Layout jumps
      // (CLS) are reported from this measurement too: on a slow phone a jump can happen before the first paint
      // and go unseen, but desktop visitors still see it.
      vitalsIssues(url, vitals, '', { lcp: !checkMobile, cls: true });

      // SEO basics.
      const seo = await page.evaluate(() => ({
        description: (document.querySelector('meta[name="description"]')?.content || '').trim(),
        h1: document.querySelectorAll('h1').length,
        robots: document.querySelector('meta[name="robots"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        viewport: !!document.querySelector('meta[name="viewport"]'),
        ogTitle: !!document.querySelector('meta[property="og:title"]'),
        ogImage: !!document.querySelector('meta[property="og:image"]'),
      }));
      const noindex = /noindex/i.test(seo.robots) || /noindex/i.test((response && response.headers()['x-robots-tag']) || '');
      if (noindex) add('warning', 'SEO: page hidden from search engines (noindex)', url, url);
      if (!seo.description) add('warning', 'SEO: missing meta description', url, url);
      else if (seo.description.length < META_DESCRIPTION.min || seo.description.length > META_DESCRIPTION.max) {
        add('warning', 'SEO: meta description length', `${url} has ${seo.description.length} characters (best: ${META_DESCRIPTION.min}-${META_DESCRIPTION.max})`, url, url);
      } else (descriptions.get(seo.description) || descriptions.set(seo.description, []).get(seo.description)).push(url);
      if (seo.h1 === 0) add('warning', 'SEO: no <h1> heading', url, url);
      else if (seo.h1 > 1) add('warning', 'SEO: more than one <h1> heading', `${url} has ${seo.h1}`, url, url);
      if (!seo.viewport) add('warning', 'SEO: no viewport meta tag', `${url} will look zoomed-out on phones`, url, url);
      if (!seo.ogTitle || !seo.ogImage) add('warning', 'SEO: missing social share tags', `${url} has no ${[!seo.ogTitle && 'og:title', !seo.ogImage && 'og:image'].filter(Boolean).join(' / ')} (links shared on WhatsApp, Facebook, etc. show no preview)`, url, url);
      if (seo.canonical && !isOurs(seo.canonical)) add('warning', 'SEO: canonical link points to another site', `${url} -> ${seo.canonical}`, url, url);
      const info = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        const nav = performance.getEntriesByType('navigation')[0];
        return {
          title: document.title.trim(),
          links: [...document.querySelectorAll('a[href], area[href]')].map((a) => a.href),
          pageBytes: entries.reduce((n, e) => n + (e.encodedBodySize || 0), nav ? nav.encodedBodySize || 0 : 0),
          largeImages: entries
            .filter((e) => e.initiatorType === 'img' || /\.(png|jpe?g|gif|webp|avif|bmp|tiff?)(\?|$)/i.test(e.name))
            .map((e) => ({ url: e.name, bytes: e.encodedBodySize || 0 })),
        };
      });
      // With the accessibility check on, axe reports this (document-title) along with alt text and more.
      if (!info.title && !checkA11y) add('warning', 'Missing page title', url, url);
      if (info.title) (titles.get(info.title) || titles.set(info.title, []).get(info.title)).push(url);

      // Page weight (only counts files whose size the browser can see: same-site, or third-party files that allow it).
      if (info.pageBytes > HEAVY_PAGE_BYTES) add('warning', 'Heavy page', `${url} downloads ${(info.pageBytes / 1048576).toFixed(1)} MB`, url, url);
      for (const img of info.largeImages) {
        if (img.bytes > LARGE_IMAGE_BYTES) add('warning', 'Large image', `${img.url} (${kb(img.bytes)})`, url, img.url);
      }

      // Accessibility (WCAG 2.x A/AA rules via axe-core). page.evaluate is not limited by the site's CSP.
      if (checkA11y) {
        const violations = await page
          .evaluate(async ({ src, tags }) => {
            if (!window.axe) (0, eval)(src);
            const r = await window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
            return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, example: String(v.nodes[0]?.target?.[0] || '') }));
          }, { src: axeSource, tags: A11Y_TAGS })
          .catch((err) => [{ id: 'axe-failed', impact: 'minor', help: `accessibility check could not run: ${err.message.split('\n')[0]}`, count: 0, example: '' }]);
        for (const v of violations) {
          const severity = v.impact === 'critical' ? 'error' : 'warning';
          add(severity, `Accessibility (${v.impact || 'unknown'}): ${v.id}`, `${v.help}${v.example ? ` - e.g. ${v.example}` : ''}`, url);
        }
      }

      // Keyboard: can you see where you are, and can you get out again?
      if (checkA11y) {
        const stops = await keyboardCheck(page);
        const hidden = stops.filter((st) => !st.visible);
        if (stops.length >= 3 && hidden.length === stops.length) {
          add('warning', 'Accessibility: keyboard focus not visible', `${url}: pressing Tab shows no outline or change on ${hidden.slice(0, 3).map((st) => st.label).join(', ')}`, url, url);
        }
        for (let i = 0; i + 4 < stops.length; i++) {
          if ([1, 2, 3, 4].every((k) => stops[i].id === stops[i + k].id)) {
            add('warning', 'Accessibility: keyboard trap', `${url}: Tab cannot leave ${stops[i].label}`, url, url);
            break;
          }
        }
        await page.evaluate(() => document.activeElement?.blur?.()).catch(() => {});
      }

      // Mobile layout: does the page scroll sideways on a phone-size screen?
      const desktop = page.viewportSize();
      await page.setViewportSize(MOBILE);
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) add('warning', 'Mobile layout overflow', `${url} is ${overflow}px wider than a ${MOBILE.width}px phone screen`, url, url);
      await page.setViewportSize(desktop);

      for (const href of info.links) {
        const next = canonical(href);
        if (!next) continue;
        if (!isOurs(next)) {
          if (!externalLinks.has(next)) externalLinks.set(next, new Set());
          externalLinks.get(next).add(url);
          continue;
        }
        if (seen.has(next) || SKIP_LINK.test(next)) continue;
        seen.add(next);
        queue.push({ url: next, referrer: url });
      }
      process.stdout.write(issues.size === before ? '.' : 'x');
    }

    // After the first page, add pages from sitemap.xml: finds pages that menus reach with buttons or JavaScript.
    if (!usedSitemap) {
      usedSitemap = true;
      const fromSitemap = await readSitemaps(context.request);
      let added = 0;
      for (const loc of fromSitemap) {
        const next = canonical(loc);
        if (!next || !isOurs(next) || seen.has(next) || SKIP_LINK.test(next)) continue;
        seen.add(next);
        queue.push({ url: next, referrer: 'sitemap.xml' });
        added++;
      }
      if (fromSitemap.length) process.stdout.write(`(sitemap: +${added})`);
    }
  }

  const blocked = [...issues.values()].find((i) => i.type === 'Blocked by bot protection');
  let externalChecked = 0;
  let phoneVitals = [];
  if (stats.length && !blocked) {
    // SEO across pages: search engines treat pages with the same title or description as near-duplicates.
    for (const [title, pages] of titles) if (pages.length > 1) for (const p of pages) add('warning', 'SEO: duplicate page title', `"${title}"`, p);
    for (const [desc, pages] of descriptions) if (pages.length > 1) for (const p of pages) add('warning', 'SEO: duplicate meta description', `"${desc.slice(0, 60)}..."`, p);
    const robots = await context.request.get(`${siteOrigin}/robots.txt`).catch(() => null);
    if (robots && robots.ok()) {
      // A "User-agent: *" group with "Disallow: /" hides the whole site from search engines.
      const groups = (await robots.text()).split(/\n(?=\s*user-agent:)/i);
      if (groups.some((g) => /user-agent:\s*\*/i.test(g) && /^\s*disallow:\s*\/\s*$/im.test(g))) {
        add('warning', 'SEO: robots.txt blocks all search engines', `${siteOrigin}/robots.txt has "Disallow: /" for every crawler`);
      }
    }

    // Favicon: browsers request it on every visit.
    const fav = await context.request.get(`${siteOrigin}/favicon.ico`).catch(() => null);
    const iconLink = await page.evaluate(() => !!document.querySelector('link[rel~="icon"]')).catch(() => false);
    if (!iconLink && (!fav || fav.status() >= 400)) add('warning', 'Missing favicon', `${siteOrigin}/favicon.ico (HTTP ${fav ? fav.status() : 'no response'})`);
    await checkHttps(context.request, mainHeaders || {});
    if (checkExternal && externalLinks.size) {
      process.stdout.write(`(checking ${Math.min(externalLinks.size, MAX_EXTERNAL_LINKS)} external links)`);
      externalChecked = await checkExternalLinks(context.request, externalLinks);
    }
    if (checkMobile && okPages.length) {
      const phonePages = [...new Set(okPages)].slice(0, MAX_PHONE_PAGES).map((p) => siteOrigin + p);
      process.stdout.write(`(phone speed check: ${phonePages.length} pages)`);
      phoneVitals = await measurePhoneVitals(browser, storageState, phonePages);
    }
  }
  await browser.close();

  // Save what was found so the load test hits real pages and APIs of this site.
  const resultsDir = path.join(__dirname, 'results');
  fs.mkdirSync(resultsDir, { recursive: true });
  if (okPages.length) {
    fs.writeFileSync(
      path.join(resultsDir, 'pages.json'),
      JSON.stringify({ start: target, site: siteOrigin, pages: [...new Set(okPages)], apis: [...apis] }, null, 2),
    );
  }

  // ---- report
  const list = [...issues.values()];
  const errors = list.filter((i) => i.severity === 'error');
  const warnings = list.filter((i) => i.severity === 'warning');
  let overall = errors.length ? 'FAILED' : 'PASSED';
  if (blocked) overall = 'BLOCKED (not tested)';
  else if (!stats.length) overall = 'FAILED (site could not be reached)';

  const lines = [`# Site scan: ${target}`, ''];
  if (siteOrigin !== new URL(target).origin) lines.push(`Redirected to: ${siteOrigin}`);
  lines.push(`Pages scanned: ${stats.length}${queue.length ? ` (stopped at --max-pages ${maxPages}; ${queue.length} more found)` : ''}`);
  if (okPages.length) {
    lines.push(`Same-site APIs seen: ${apis.size}`);
    lines.push(`External links checked: ${checkExternal ? Math.min(externalChecked, MAX_EXTERNAL_LINKS) : 'skipped (--no-external)'}`);
    lines.push(`Accessibility check: ${checkA11y ? 'WCAG 2.x A/AA (axe-core)' : 'skipped (--no-a11y)'}`);
  }
  if (stats.length) {
    const slowest = [...stats].sort((a, b) => b.loadMs - a.loadMs)[0];
    const avg = stats.reduce((n, s) => n + s.loadMs, 0) / stats.length;
    lines.push(`Page load: average ${Math.round(avg)} ms, slowest ${slowest.loadMs} ms (${slowest.url})`);
  }
  // Core Web Vitals: phone (slow 4G) when measured, else this computer.
  const vitalsShown = phoneVitals.length ? phoneVitals : vitalsByPage;
  const vitalsWhere = phoneVitals.length ? 'phone on slow 4G, Lighthouse settings' : 'lab, this computer';
  const withLcp = vitalsShown.filter((v) => v.lcp != null);
  if (withLcp.length) {
    const worstLcp = withLcp.reduce((a, b) => (b.lcp > a.lcp ? b : a));
    const worstCls = [...vitalsShown, ...vitalsByPage].reduce((a, b) => (b.cls > a.cls ? b : a));
    lines.push(
      `Core Web Vitals (${vitalsWhere}): worst LCP ${(worstLcp.lcp / 1000).toFixed(1)} s (${worstLcp.url}), ` +
        `worst CLS ${worstCls.cls.toFixed(2)} (${worstCls.url})`,
    );
  }
  lines.push(`Errors: ${errors.length}   Warnings: ${warnings.length}`, '');

  // Compare with the previous scan of the same site: what is new, what got fixed.
  const resultsFiles = fs.readdirSync(resultsDir).filter((f) => /^scan-.*\.json$/.test(f)).sort();
  let previous = null;
  for (const f of resultsFiles.reverse()) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf8'));
      if (data.issues && sameSite(data.site, siteOrigin) && !/BLOCKED/.test(data.overall)) {
        previous = { file: f, data };
        break;
      }
    } catch {
      // unreadable old report: skip it
    }
  }
  const compareKey = (i) => `${i.type}|${i.subject}`;
  let comparison = null;
  let added = [];
  let fixed = [];
  if (previous && !blocked) {
    const before = new Map(previous.data.issues.map((i) => [compareKey(i), i]));
    const now = new Map(list.map((i) => [compareKey(i), i]));
    added = [...now].filter(([k]) => !before.has(k)).map(([, i]) => i);
    fixed = [...before].filter(([k]) => !now.has(k)).map(([, i]) => i);
    comparison = { previousScan: previous.data.scannedAt || previous.file, newIssues: added.length, fixedIssues: fixed.length, unchanged: now.size - added.length };
    lines.push(`## Compared with the last scan (${comparison.previousScan})`, '');
    lines.push(`New problems: ${added.length}   Fixed: ${fixed.length}   Still there: ${comparison.unchanged}`, '');
    for (const i of added.slice(0, 30)) lines.push(`- NEW ${i.severity}: ${i.type} - ${i.detail}`);
    for (const i of fixed.slice(0, 30)) lines.push(`- FIXED: ${i.type} - ${i.detail}`);
    if (added.length + fixed.length) lines.push('');
  }
  if (blocked) {
    lines.push(
      '!! The site answered with a bot-protection / challenge page, so it could not be tested.',
      '   If this is your site, let the test through on your side (allow-list your IP, or a WAF skip rule),',
      '   or test a staging copy without protection. The kit does not try to get past bot checks.',
      '',
    );
  }
  // Advice is the same for every item of one kind, except security headers (one tip per header).
  const byTypeFix = (type, items) => (type === 'Missing security header' ? null : fixFor(type, items[0].detail));
  for (const [title, group] of [['ERRORS (must fix)', errors], ['WARNINGS (should fix, or not yours to fix)', warnings]]) {
    if (!group.length) continue;
    lines.push(`## ${title}`, '');
    const byType = {};
    for (const i of group) (byType[i.type] ||= []).push(i);
    for (const [type, items] of Object.entries(byType)) {
      lines.push(`### ${type} (${items.length})`);
      const typeFix = byTypeFix(type, items);
      if (typeFix) lines.push(`How to fix: ${typeFix}`);
      for (const i of items) {
        const pages = [...i.pages];
        const on = pages.length ? ` - on ${pages.slice(0, 3).join(', ')}${pages.length > 3 ? ` and ${pages.length - 3} more` : ''}` : '';
        const headerFix = type === 'Missing security header' ? fixFor(type, i.detail) : null;
        lines.push(`- ${i.detail}${on}${headerFix ? `
  How to fix: ${headerFix}` : ''}`);
      }
      lines.push('');
    }
  }
  lines.push(`OVERALL: ${overall}${warnings.length && !blocked ? ` (${warnings.length} warning(s))` : ''}`);

  const base = path.join(resultsDir, `scan-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.writeFileSync(`${base}.md`, lines.join('\n') + '\n');
  // Machine-readable copy, for CI or other tools.
  fs.writeFileSync(
    `${base}.json`,
    JSON.stringify(
      {
        target,
        site: siteOrigin,
        scannedAt: new Date().toISOString(),
        overall,
        pagesScanned: stats.length,
        coreWebVitals: { thisComputer: vitalsByPage, phone: phoneVitals },
        comparison,
        issues: list.map((i) => ({ severity: i.severity, type: i.type, detail: i.detail, subject: i.subject, pages: [...i.pages], fix: fixFor(i.type, i.detail) })),
      },
      null,
      2,
    ),
  );

  // HTML report with charts, to open in a browser or send to someone.
  const issueList = (items) =>
    `<ul>${items
      .map((i) => {
        const pages = [...(i.pages || [])];
        const fix = fixFor(i.type, i.detail);
        return `<li class="${i.severity === 'error' ? 'bad' : 'warn'}"><b>${esc(i.type)}</b>: ${esc(i.detail)}${fix ? `<br><span class="muted">How to fix: ${esc(fix)}</span>` : ''}${
          pages.length ? `<br><span class="muted">on ${pages.slice(0, 5).map(esc).join(', ')}${pages.length > 5 ? ` and ${pages.length - 5} more` : ''}</span>` : ''
        }</li>`;
      })
      .join('')}</ul>`;
  const level = (v, good, poor) => (v > poor ? 'bad' : v > good ? 'warn' : 'good');
  const shortUrl = (u) => u.replace(siteOrigin, '') || '/';
  const sections = [];
  if (blocked) sections.push({ heading: 'Blocked by bot protection', html: `<p class="warn">${esc(lines.filter((l) => l.startsWith('!!') || l.startsWith('   ')).join(' '))}</p>` });
  if (comparison) {
    sections.push({
      heading: `Compared with the last scan (${comparison.previousScan})`,
      html:
        `<p>New problems: <b class="${added.length ? 'bad' : 'good'}">${added.length}</b> &nbsp; Fixed: <b class="good">${fixed.length}</b> &nbsp; Still there: ${comparison.unchanged}</p>` +
        (added.length > 15
          ? '<p class="muted">Most problems are new since the last scan: see the full lists below.</p>'
          : added.length
            ? `<p><b>New</b></p>${issueList(added)}`
            : '') +
        (fixed.length ? `<p><b>Fixed</b></p><ul>${fixed.map((i) => `<li class="good">${esc(i.type)}: ${esc(i.detail)}</li>`).join('')}</ul>` : ''),
    });
  }
  if (withLcp.length) {
    sections.push({
      heading: `Core Web Vitals (${vitalsWhere})`,
      html:
        '<p class="muted">LCP: how long until the main content shows. Good: under 2.5 s.</p>' +
        barChart(
          withLcp.map((v) => ({ label: shortUrl(v.url), value: v.lcp, display: `${(v.lcp / 1000).toFixed(1)} s`, level: level(v.lcp, LCP_GOOD_MS, LCP_POOR_MS) })),
          { limit: LCP_GOOD_MS, limitLabel: 'good below 2.5 s' },
        ) +
        '<p class="muted">CLS: how much the layout jumps while loading. Good: under 0.1.</p>' +
        barChart(
          vitalsShown.map((v) => ({ label: shortUrl(v.url), value: v.cls, display: v.cls.toFixed(2), level: level(v.cls, CLS_GOOD, CLS_POOR) })),
          { limit: CLS_GOOD, limitLabel: 'good below 0.1' },
        ),
    });
  }
  if (stats.length) {
    sections.push({
      heading: 'Page load time (this computer)',
      html: barChart(
        stats.map((s) => ({ label: shortUrl(s.url), value: s.loadMs, display: `${s.loadMs} ms`, level: level(s.loadMs, 1000, SLOW_PAGE_MS) })),
        { limit: SLOW_PAGE_MS, limitLabel: 'error above 3 s' },
      ),
    });
  }
  if (errors.length) sections.push({ heading: `Errors: must fix (${errors.length})`, html: issueList(errors) });
  if (warnings.length) sections.push({ heading: `Warnings: should fix, or not yours to fix (${warnings.length})`, html: issueList(warnings) });
  writeHtmlReport(`${base}.html`, {
    title: `Site scan: ${target}`,
    subtitle: siteOrigin !== new URL(target).origin ? `Redirected to ${siteOrigin}` : '',
    verdict: overall,
    summary: [
      [stats.length, 'pages scanned'],
      [errors.length, 'errors', errors.length ? 'bad' : 'good'],
      [warnings.length, 'warnings', warnings.length ? 'warn' : 'good'],
      [apis.size, 'APIs seen'],
    ],
    sections,
  });

  console.log('\n\n' + lines.join('\n'));
  console.log(`\nReport saved: ${base}.html (open in a browser), plus .md and .json`);
  process.exit(blocked ? 3 : errors.length || !stats.length || (failOnNew && added.length) ? 1 : 0);
})().catch((err) => {
  console.error('Scan crashed:', err);
  process.exit(2);
});
