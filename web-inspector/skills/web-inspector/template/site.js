// Shared helpers: decide whether a URL belongs to the site being tested.
// "example.com" and "www.example.com" (and http/https) count as the same site, and so do
// localhost, 127.0.0.1 and [::1] (all "this computer") on the same port.

const fs = require('fs');
const path = require('path');

const LOOPBACK = /^(localhost|127(\.\d+){3}|\[::1\])$/;
const bareHost = (u) => {
  const url = new URL(u);
  const host = LOOPBACK.test(url.hostname) ? 'localhost' : url.hostname.replace(/^www\./, '');
  return `${host}:${url.port}`;
};

function sameSite(a, b) {
  try {
    return bareHost(a) === bareHost(b);
  } catch {
    return false;
  }
}

// Detects bot-protection / challenge pages (Cloudflare and similar) so the tests can stop and say so
// instead of reporting the challenge page as the website.
function looksLikeBotCheck(status, headers, title) {
  if (![403, 429, 503].includes(status)) return false;
  if (headers['cf-mitigated'] || headers['cf-chl-bypass']) return true;
  return /just a moment|attention required|checking your browser|access denied|verify you are human|ddos protection/i.test(title || '');
}

// The pages to check: the URLs given as-is, or, when only the site's address is given, that page plus the
// pages the last `npm run scan` of the same site found (saved in results/pages.json as paths like "/login").
// Used by lighthouse.js and visual.js so a plain `npm run lighthouse -- <site>` covers the whole site.
function pagesToCheck(urls, maxPages, resultsDir) {
  let pages = urls;
  if (urls.length === 1) {
    try {
      const saved = JSON.parse(fs.readFileSync(path.join(resultsDir, 'pages.json'), 'utf8'));
      if (sameSite(saved.start, urls[0])) {
        const full = saved.pages.map((p) => (/^https?:/.test(p) ? p : saved.site + p));
        pages = [...new Set([urls[0], ...full])];
      }
    } catch {
      // No saved scan (or it is for another site): just use the URLs given.
    }
  }
  return pages.slice(0, maxPages);
}

module.exports = { sameSite, looksLikeBotCheck, pagesToCheck };
