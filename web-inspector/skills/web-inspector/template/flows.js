const fs = require('fs');
const path = require('path');
const { sameSite, looksLikeBotCheck } = require('./site');

// run-all.js gives each run its own log file.
const ISSUES_FILE = process.env.ISSUES_FILE || path.join(__dirname, 'results', 'browser-issues.log');
const MAX_PAGES = 3;
const SKIP_LINK = /logout|log-out|signout|sign-out|delete|remove|unsubscribe|add-to-cart|cart\/add|\.(pdf|zip|exe|dmg|mp4|mp3|docx?|xlsx?)(\?|$)/i;

// Pages found by the last site scan (written by run-all.js), if any.
let scannedPages = [];
try {
  scannedPages = JSON.parse(fs.readFileSync(path.join(__dirname, 'results', 'load-targets.json'), 'utf8')).pages || [];
} catch {
  // none: follow links instead
}

// Writes each problem once, so the log stays readable under load.
const seen = new Set();
function logIssue(kind, detail) {
  const line = `${kind}: ${detail}`;
  if (seen.has(line)) return;
  seen.add(line);
  fs.mkdirSync(path.dirname(ISSUES_FILE), { recursive: true });
  fs.appendFileSync(ISSUES_FILE, `${new Date().toISOString()} ${line}\n`);
}

const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

async function realUser(page, vuContext, events, test) {
  const target = vuContext.vars.target;
  // Learn the real site address before the first page loads (example.com -> www.example.com),
  // so the site's own files are not mistaken for third-party ones.
  const probe = await page.request.get(target).catch(() => null);
  let site = probe ? new URL(probe.url()).origin : target;
  // Problems from other sites (ads, analytics, widgets) are counted separately and do not fail the test.
  const counter = (url, name) => events.emit('counter', `browser.${url && !sameSite(url, site) ? 'thirdparty_' : ''}${name}`, 1);

  // Alerts and confirms would freeze the browser, so dismiss them.
  page.on('dialog', (dialog) => dialog.dismiss().catch(() => {}));
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || /Failed to load resource/.test(msg.text())) return;
    const where = msg.location()?.url;
    counter(where, 'console_errors');
    logIssue('console error', `${msg.text()}${where ? ` (${where})` : ''}`);
  });
  page.on('pageerror', (err) => {
    events.emit('counter', 'browser.js_exceptions', 1);
    logIssue('javascript exception', err.message);
  });
  page.on('requestfailed', (req) => {
    const err = req.failure()?.errorText || '';
    if (err.includes('ERR_ABORTED')) return; // normal when moving to the next page
    counter(req.url(), 'requests_failed');
    logIssue(`request failed${sameSite(req.url(), site) ? '' : ' (third-party)'}`, `${req.url()} (${err})`);
  });
  page.on('response', (res) => {
    if (res.status() < 400) return;
    counter(res.url(), `http_${res.status()}`);
    logIssue(`http ${res.status()}${sameSite(res.url(), site) ? '' : ' (third-party)'}`, res.url());
  });

  let response;
  await test.step('open_homepage', async () => {
    response = await page.goto(target, { waitUntil: 'load' });
  });
  if (response && looksLikeBotCheck(response.status(), response.headers(), await page.title())) {
    events.emit('counter', 'browser.blocked_by_bot_protection', 1);
    logIssue('blocked by bot protection', `${target} returned HTTP ${response.status()}`);
    return;
  }
  site = new URL(page.url()).origin;

  // Visit a few more pages like a person browsing around: pages from the last scan, else links on the homepage.
  let next = scannedPages.filter((p) => p !== '/').map((p) => new URL(p, site).href);
  if (!next.length) {
    const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
    next = links.filter((href) => sameSite(href, site) && !href.includes('#') && !SKIP_LINK.test(href));
  }
  for (const href of shuffle([...new Set(next)]).slice(0, MAX_PAGES)) {
    await page.waitForTimeout(1000 + Math.random() * 2000);
    await test.step(`visit_${new URL(href).pathname.replace(/\W+/g, '_') || 'root'}`, async () => {
      await page.goto(href, { waitUntil: 'load' });
    });
  }
}

module.exports = { realUser };
