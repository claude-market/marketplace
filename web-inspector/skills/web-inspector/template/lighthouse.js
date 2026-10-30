// Google Lighthouse scores (0-100) for Performance, Accessibility, SEO and Best Practices, on a phone
// (slow 4G) by default. These are the same numbers PageSpeed Insights shows, so they can be compared
// with other tools. Uses the pages found by the last `npm run scan` (or the URLs you pass).
//
// Usage: node lighthouse.js <url> [more urls...] [--desktop] [--max-pages N] [--min-score N]
//   --desktop      score as a desktop computer instead of a phone
//   --max-pages N  how many pages to score (default 5; each takes about 30 seconds)
//   --min-score N  a page with any score under N fails the run (default 90)
//
// Read-only: it only opens pages in a fresh Chrome. Run it on sites you own.
const fs = require('fs');
const path = require('path');
const net = require('net');
const { chromium } = require('playwright');
const { pagesToCheck } = require('./site');
const { esc, barChart, writeHtmlReport } = require('./report-html');

const CATEGORIES = ['performance', 'accessibility', 'seo', 'best-practices'];
const LABEL = { performance: 'Performance', accessibility: 'Accessibility', seo: 'SEO', 'best-practices': 'Best practices' };
const GOOD = 90;
const OK = 50;

// A free port on this computer for Chrome's debugging connection (a fixed one could already be taken).
const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer().once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const desktop = argv.includes('--desktop');
const maxPages = Number(flag('--max-pages') || 5);
const minScore = Number(flag('--min-score') || GOOD);
const valueIdx = new Set(['--max-pages', '--min-score'].map((f) => argv.indexOf(f) + 1).filter((i) => i > 0));
const urls = argv.filter((a, i) => /^https?:\/\//.test(a) && !valueIdx.has(i));
if (!urls.length) {
  console.error('Usage: node lighthouse.js <https://your-site.com> [more urls] [--desktop] [--max-pages N] [--min-score N]');
  process.exit(1);
}

const level = (s) => (s >= GOOD ? 'good' : s >= OK ? 'warn' : 'bad');

(async () => {
  // The home page plus the pages the last scan found (or just the URLs given).
  const pages = pagesToCheck(urls, maxPages, path.join(__dirname, 'results'));

  let lighthouse;
  try {
    ({ default: lighthouse } = await import('lighthouse'));
  } catch {
    console.error('Lighthouse is not installed. Run: npm install');
    process.exit(1);
  }

  // Lighthouse drives a normal Chrome over its debugging port; keep that port on this computer only.
  const debugPort = await freePort();
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [`--remote-debugging-port=${debugPort}`, '--remote-debugging-address=127.0.0.1'],
  });
  const rows = [];
  try {
    for (const url of pages) {
      console.log(`Scoring ${url} ...`);
      try {
        const flags = {
          port: debugPort,
          output: 'json',
          logLevel: 'error',
          onlyCategories: CATEGORIES,
          formFactor: desktop ? 'desktop' : 'mobile',
          screenEmulation: desktop
            ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
            : undefined,
          throttlingMethod: 'simulate',
        };
        const run = await lighthouse(url, flags);
        const lhr = run.lhr;
        if (lhr.runtimeError) throw new Error(lhr.runtimeError.message);
        const scores = {};
        for (const c of CATEGORIES) scores[c] = Math.round((lhr.categories[c].score ?? 0) * 100);
        const worst = Object.values(lhr.audits)
          .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'manual')
          .sort((a, b) => a.score - b.score)
          .slice(0, 5)
          .map((a) => a.title);
        rows.push({ url, scores, worst });
      } catch (err) {
        rows.push({ url, error: String(err.message || err).split('\n')[0] });
      }
    }
  } finally {
    await browser.close();
  }

  // ---- report
  const ok = rows.filter((r) => r.scores);
  const avg = (c) => (ok.length ? Math.round(ok.reduce((n, r) => n + r.scores[c], 0) / ok.length) : 0);
  const low = ok.filter((r) => CATEGORIES.some((c) => r.scores[c] < minScore));
  const verdict = !ok.length ? 'FAILED: no page could be scored' : low.length ? `FAILED: ${low.length} of ${ok.length} pages score under ${minScore}` : `PASSED: all pages score ${minScore} or more`;
  const device = desktop ? 'desktop' : 'phone (slow 4G)';

  const lines = [`# Lighthouse scores (${device})`, '', `Verdict: ${verdict}`, ''];
  for (const r of rows) {
    if (r.error) {
      lines.push(`- ${r.url}: could not be scored (${r.error})`);
      continue;
    }
    lines.push(`- ${r.url}: ` + CATEGORIES.map((c) => `${LABEL[c]} ${r.scores[c]}`).join(', '));
    if (r.worst.length) lines.push(`    to improve: ${r.worst.join('; ')}`);
  }
  console.log('\n' + lines.join('\n'));

  const resultsDir = path.join(__dirname, 'results');
  fs.mkdirSync(resultsDir, { recursive: true });
  const base = path.join(resultsDir, `lighthouse-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.writeFileSync(`${base}.md`, lines.join('\n') + '\n');
  fs.writeFileSync(`${base}.json`, JSON.stringify({ device, verdict, rows }, null, 2));
  writeHtmlReport(`${base}.html`, {
    title: 'Lighthouse scores',
    subtitle: `${device}, ${rows.length} pages`,
    verdict,
    summary: CATEGORIES.map((c) => [ok.length ? String(avg(c)) : '-', `${LABEL[c]} (average)`, level(avg(c))]),
    sections: [
      ...CATEGORIES.map((c) => ({
        heading: LABEL[c],
        html: barChart(
          ok.map((r) => ({ label: r.url, value: r.scores[c], display: String(r.scores[c]), level: level(r.scores[c]) })),
          { limit: minScore, limitLabel: `pass mark ${minScore}` },
        ) || '<p class="muted">No data.</p>',
      })),
      {
        heading: 'What to improve first',
        html:
          rows.map((r) => `<p><b>${esc(r.url)}</b><br>${r.error ? `could not be scored: ${esc(r.error)}` : r.worst.length ? `<ul>${r.worst.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : '<span class="good">nothing major</span>'}</p>`).join('') || '',
      },
    ],
  });
  console.log(`\nReport: ${base}.html`);
  process.exit(ok.length && !low.length ? 0 : 1);
})();
