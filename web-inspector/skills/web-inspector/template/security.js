// Safe security check for a website YOU OWN. It is read-only: it looks at the headers, cookies, forms and
// a short list of files that should never be public. It never sends attack traffic (no SQL injection, no
// XSS payloads, no password guessing, no fuzzing). For deep active testing, use OWASP ZAP (see README).
//
// Usage: node security.js <url> --i-own-this [--auth auth.json]
//   --i-own-this is required: it is your statement that you own this site or have written permission.
const fs = require('fs');
const path = require('path');
const tls = require('tls');
const { chromium } = require('playwright');
const { sameSite } = require('./site');
const { esc, writeHtmlReport } = require('./report-html');

// Files that should never be readable by the public. Checked with a plain GET (read-only).
const SENSITIVE_PATHS = [
  { p: '/.env', why: 'environment file: often holds database passwords and API keys' },
  { p: '/.git/config', why: 'Git config: exposes the repository and its history' },
  { p: '/.git/HEAD', why: 'Git repository is downloadable (source code and secrets)' },
  { p: '/.svn/entries', why: 'SVN repository metadata' },
  { p: '/.htaccess', why: 'Apache config' },
  { p: '/config.php.bak', why: 'backup of a config file (often readable as plain text)' },
  { p: '/config.php~', why: 'editor backup of a config file' },
  { p: '/wp-config.php.bak', why: 'WordPress config backup with database credentials' },
  { p: '/.DS_Store', why: 'macOS folder index: reveals file names' },
  { p: '/phpinfo.php', why: 'PHP info page: exposes server configuration' },
  { p: '/server-status', why: 'Apache status page: exposes requests and internals' },
  { p: '/.well-known/security.txt', why: null, expectedOk: true }, // good to HAVE; informational only
  { p: '/backup.sql', why: 'database dump' },
  { p: '/db.sql', why: 'database dump' },
  { p: '/.env.local', why: 'environment file with secrets' },
];
const SENSITIVE_BODY = /(DB_PASSWORD|DB_USER|API_KEY|SECRET|BEGIN RSA|password\s*=|\[core\]|ref:\s|<\?php)/i;

const argv = process.argv.slice(2);
const flag = (n) => {
  const i = argv.indexOf(n);
  return i >= 0 ? argv[i + 1] : undefined;
};
const authFile = flag('--auth');
const valueIdx = new Set(['--auth'].map((f) => argv.indexOf(f) + 1).filter((i) => i > 0));
const target = argv.find((a, i) => !a.startsWith('--') && !valueIdx.has(i));
if (!/^https?:\/\//.test(target || '')) {
  console.error('Usage: node security.js <https://your-site.com> --i-own-this [--auth auth.json]');
  process.exit(1);
}
if (!argv.includes('--i-own-this')) {
  console.error(
    'Refused. This checks a site you own. Add --i-own-this to confirm you own this site or have written\n' +
      'permission to test it. Scanning a site without permission can be illegal.',
  );
  process.exit(2);
}

const issues = [];
const add = (severity, title, detail, where) => issues.push({ severity, title, detail, where });

function checkCert(host, port) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: false, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      const proto = socket.getProtocol();
      socket.end();
      resolve({ error: socket.authorizationError && String(socket.authorizationError), proto, validTo: cert && cert.valid_to });
    });
    socket.on('error', (e) => resolve({ error: e.message }));
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ error: 'timed out' });
    });
  });
}

(async () => {
  console.log(`Security check (read-only) on ${target} ...\n`);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const storageState = authFile ? JSON.parse(fs.readFileSync(authFile, 'utf8').replace(/^﻿/, '')) : undefined;
  const context = await browser.newContext({ ignoreHTTPSErrors: true, ...(storageState ? { storageState } : {}) });

  // Which pages to look at: from the last scan, else the homepage.
  let pages = ['/'];
  try {
    const saved = JSON.parse(fs.readFileSync(path.join(__dirname, 'results', 'pages.json'), 'utf8'));
    if (sameSite(saved.site, target) && saved.pages?.length) pages = saved.pages.slice(0, 15);
  } catch {
    /* homepage only */
  }

  // --- 1. Main response: headers, cookies, information disclosure
  const home = await context.request.get(target, { timeout: 20000 });
  const origin = new URL(home.url()).origin;
  const h = home.headers();
  const isLocal = /^(localhost|127\.|\[?::1)/.test(new URL(origin).hostname);

  if (new URL(origin).protocol === 'http:' && !isLocal) add('high', 'Site not using HTTPS', `${origin} is served over plain HTTP, so traffic can be read or changed in transit.`, origin);

  const wantHeaders = {
    'strict-transport-security': ['HSTS', 'tells browsers to always use HTTPS (only applies on an HTTPS site)'],
    'content-security-policy': ['Content-Security-Policy', 'the main defence against cross-site scripting (XSS)'],
    'x-content-type-options': ['X-Content-Type-Options', 'stops the browser guessing file types (set to nosniff)'],
    'referrer-policy': ['Referrer-Policy', 'controls how much of your URLs leak to other sites'],
  };
  for (const [key, [name, why]] of Object.entries(wantHeaders)) {
    if (key === 'strict-transport-security' && new URL(origin).protocol !== 'https:') continue;
    if (!h[key]) add('medium', `Missing security header: ${name}`, why, origin);
  }
  if (!h['x-frame-options'] && !/frame-ancestors/i.test(h['content-security-policy'] || '')) {
    add('medium', 'Missing clickjacking protection', 'No X-Frame-Options or CSP frame-ancestors: another site can load your pages inside an invisible frame to trick users.', origin);
  }

  // Information disclosure: version numbers help an attacker find known exploits.
  for (const key of ['server', 'x-powered-by', 'x-aspnet-version', 'x-generator']) {
    if (h[key] && /\d/.test(h[key])) add('low', 'Software version exposed', `The "${key}" header reveals "${h[key]}". Hiding the version makes it harder to target known exploits.`, origin);
  }

  // Cookies: flags that protect the session.
  const setCookie = home.headersArray().filter((x) => x.name.toLowerCase() === 'set-cookie');
  for (const c of setCookie) {
    const nameOnly = c.value.split('=')[0];
    const v = c.value.toLowerCase();
    const sessionish = /sess|token|auth|sid|login/i.test(nameOnly);
    if (!/httponly/.test(v)) add(sessionish ? 'high' : 'medium', 'Cookie without HttpOnly', `"${nameOnly}" can be read by JavaScript, so an XSS bug could steal it. Add the HttpOnly flag${sessionish ? ' (this looks like a session cookie).' : '.'}`, origin);
    if (new URL(origin).protocol === 'https:' && !/secure/.test(v)) add(sessionish ? 'high' : 'medium', 'Cookie without Secure', `"${nameOnly}" can be sent over plain HTTP. Add the Secure flag.`, origin);
    if (!/samesite/.test(v)) add('low', 'Cookie without SameSite', `"${nameOnly}" has no SameSite flag, which helps against cross-site request forgery (CSRF). Set SameSite=Lax or Strict.`, origin);
  }

  // --- 2. HTTPS certificate and protocol
  if (new URL(origin).protocol === 'https:') {
    const u = new URL(origin);
    const cert = await checkCert(u.hostname, Number(u.port) || 443);
    if (cert.error) add('high', 'HTTPS certificate problem', `${u.hostname}: ${cert.error}`, origin);
    else if (cert.validTo) {
      const days = Math.floor((new Date(cert.validTo) - Date.now()) / 86400000);
      if (days < 0) add('high', 'HTTPS certificate has expired', `${u.hostname} expired on ${cert.validTo}.`, origin);
      else if (days < 21) add('medium', 'HTTPS certificate expires soon', `${u.hostname} expires in ${days} day(s).`, origin);
    }
    if (cert.proto && /TLSv1(\.[01])?$/.test(cert.proto)) add('medium', 'Old TLS version', `The server negotiated ${cert.proto}. Turn off TLS 1.0/1.1 and use TLS 1.2+.`, origin);
  }

  // --- 3. Exposed sensitive files (read-only GETs of a short, well-known list)
  process.stdout.write(`Checking ${SENSITIVE_PATHS.length} common sensitive paths...`);
  let hasSecurityTxt = false;
  for (const { p, why, expectedOk } of SENSITIVE_PATHS) {
    const res = await context.request.get(origin + p, { timeout: 10000, failOnStatusCode: false, maxRedirects: 0 }).catch(() => null);
    if (!res) continue;
    if (expectedOk) {
      if (res.status() < 400) hasSecurityTxt = true;
      continue;
    }
    if (res.status() >= 400 || res.status() >= 300) continue;
    const body = (await res.text().catch(() => '')).slice(0, 2000);
    // Only flag if it really looks like the sensitive file, not a catch-all 200 page.
    if (SENSITIVE_BODY.test(body) || p.includes('.git') || p.includes('.sql') || p.includes('.env') || p.includes('.DS_Store')) {
      add('high', 'Sensitive file is public', `${origin}${p} is readable — ${why}. Block it or remove it from the web root.`, origin + p);
    }
  }
  console.log(' done');
  if (!hasSecurityTxt && new URL(origin).protocol === 'https:') add('low', 'No security.txt', 'Optional: add /.well-known/security.txt so researchers know how to report issues.', origin);

  // --- 4. Per-page checks in a real browser: directory listing, forms, mixed content
  const page = await context.newPage();
  const mixed = new Set();
  page.on('request', (req) => {
    if (page.url().startsWith('https:') && req.url().startsWith('http:') && !req.isNavigationRequest()) mixed.add(req.url());
  });
  for (const p of pages) {
    const url = origin + p;
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 20000 });
    } catch {
      continue;
    }
    const info = await page.evaluate(() => {
      const listing = /Index of \//.test(document.body?.innerText || '') && !!document.querySelector('a[href="../"], a[href="?C=N;O=D"]');
      const forms = [...document.querySelectorAll('form')].map((f) => ({
        method: (f.method || 'get').toLowerCase(),
        action: f.getAttribute('action') || '',
        hasPassword: !!f.querySelector('input[type="password"]'),
        hasHidden: !!f.querySelector('input[type="hidden"]'),
        autocompleteOff: /off/i.test(f.querySelector('input[type="password"]')?.getAttribute('autocomplete') || ''),
      }));
      return { listing, forms };
    });
    if (info.listing) add('medium', 'Directory listing is on', `${url} shows a list of files. Turn off auto-indexing on the server.`, url);
    for (const f of info.forms) {
      if (f.hasPassword && url.startsWith('http:')) add('high', 'Password field on an HTTP page', `A login/password form on ${url} is not on HTTPS, so credentials travel in the clear.`, url);
      if (f.method === 'post' && !f.hasHidden) add('low', 'Form may lack a CSRF token', `A POST form on ${url} has no hidden field. If it changes data, check it has CSRF protection.`, url);
    }
  }
  for (const m of mixed) add('medium', 'Mixed content', `An HTTPS page loads ${m} over plain HTTP. Browsers block or warn on this.`, m);

  await browser.close();

  // --- report
  const order = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);
  const counts = { high: 0, medium: 0, low: 0 };
  for (const i of issues) counts[i.severity]++;
  const overall = counts.high ? 'FAILED' : counts.medium ? 'REVIEW' : 'PASSED';

  const lines = [`# Security check (read-only): ${target}`, ''];
  lines.push('This is a safe surface check (headers, cookies, exposed files, HTTPS, forms). It is NOT a full');
  lines.push('penetration test: it does not try injection, XSS, authentication or other attacks. For that, run');
  lines.push('OWASP ZAP against a staging copy (see README).', '');
  lines.push(`High: ${counts.high}   Medium: ${counts.medium}   Low: ${counts.low}`, '');
  for (const sev of ['high', 'medium', 'low']) {
    const group = issues.filter((i) => i.severity === sev);
    if (!group.length) continue;
    lines.push(`## ${sev.toUpperCase()}`, '');
    for (const i of group) lines.push(`- ${i.title}: ${i.detail}${i.where ? ` [${i.where}]` : ''}`);
    lines.push('');
  }
  lines.push(`OVERALL: ${overall}`);

  const resultsDir = path.join(__dirname, 'results');
  fs.mkdirSync(resultsDir, { recursive: true });
  const base = path.join(resultsDir, `security-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.writeFileSync(`${base}.md`, lines.join('\n') + '\n');
  fs.writeFileSync(`${base}.json`, JSON.stringify({ target, site: origin, overall, counts, issues }, null, 2));
  const sevClass = { high: 'bad', medium: 'warn', low: 'muted' };
  writeHtmlReport(`${base}.html`, {
    title: `Security check: ${target}`,
    subtitle: 'Read-only surface check — not a full penetration test.',
    verdict: overall,
    summary: [
      [counts.high, 'high', counts.high ? 'bad' : 'good'],
      [counts.medium, 'medium', counts.medium ? 'warn' : 'good'],
      [counts.low, 'low'],
    ],
    sections: ['high', 'medium', 'low']
      .filter((sev) => issues.some((i) => i.severity === sev))
      .map((sev) => ({
        heading: sev.toUpperCase(),
        html: `<ul>${issues.filter((i) => i.severity === sev).map((i) => `<li class="${sevClass[sev]}"><b>${esc(i.title)}</b>: ${esc(i.detail)}${i.where ? `<br><span class="muted">${esc(i.where)}</span>` : ''}</li>`).join('')}</ul>`,
      })),
  });

  console.log('\n' + lines.join('\n'));
  console.log(`\nReport saved: ${base}.html (and .md, .json)`);
  process.exit(counts.high ? 1 : 0);
})().catch((err) => {
  console.error('Security check crashed:', err);
  process.exit(3);
});
