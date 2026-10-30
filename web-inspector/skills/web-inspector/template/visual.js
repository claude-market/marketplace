// Visual comparison: takes screenshots of your pages (phone and desktop) and compares them with the
// ones saved last time, so you notice when a change broke how a page LOOKS (a layout that shifted,
// a missing image, a button that moved).
//
// Usage: node visual.js <url> [more urls...] [--update] [--max-pages N] [--threshold P] [--auth auth.json]
//   (first run)     saves the screenshots as the "approved" look
//   (later runs)    compares with the approved look and writes images showing what changed
//   --update        approve the current look as the new baseline (use after a change you wanted)
//   --threshold P   percent of changed pixels that counts as a difference (default 0.5)
//
// Pages with ads, clocks or rotating banners change by themselves: expect differences there.
// Read-only: it only opens pages and takes pictures.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const { pagesToCheck } = require('./site');
const { esc, writeHtmlReport } = require('./report-html');

const VIEWPORTS = [
  { name: 'phone', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 800 },
];
const MAX_HEIGHT = 6000; // very long pages are cut here so the pictures stay small

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const update = argv.includes('--update');
const maxPages = Number(flag('--max-pages') || 5);
const threshold = Number(flag('--threshold') || 0.5);
const authFile = flag('--auth');
const valueIdx = new Set(['--max-pages', '--threshold', '--auth'].map((f) => argv.indexOf(f) + 1).filter((i) => i > 0));
const urls = argv.filter((a, i) => /^https?:\/\//.test(a) && !valueIdx.has(i));
if (!urls.length) {
  console.error('Usage: node visual.js <https://your-site.com> [more urls] [--update] [--max-pages N] [--threshold P] [--auth auth.json]');
  process.exit(1);
}
let storageState;
if (authFile) {
  try {
    storageState = JSON.parse(fs.readFileSync(authFile, 'utf8').replace(/^﻿/, ''));
  } catch (err) {
    console.error(`Login file ${authFile} ${err.code === 'ENOENT' ? 'not found' : 'is not valid'}.`);
    process.exit(1);
  }
}

const slug = (url, vp) => (new URL(url).host + new URL(url).pathname + new URL(url).search).replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').slice(0, 80) + `-${vp}`;

// Compare two PNGs; if the page got taller or shorter, the extra part counts as changed.
function compare(basePng, nowPng) {
  const w = Math.max(basePng.width, nowPng.width);
  const h = Math.max(basePng.height, nowPng.height);
  const pad = (png) => {
    const out = new PNG({ width: w, height: h });
    out.data.fill(0); // transparent: never equals real page pixels
    PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
    return out;
  };
  const a = pad(basePng);
  const b = pad(nowPng);
  const diff = new PNG({ width: w, height: h });
  const changed = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 });
  return { changedPct: (100 * changed) / (w * h), diff, sizeChanged: basePng.height !== nowPng.height || basePng.width !== nowPng.width };
}

(async () => {
  const pages = pagesToCheck(urls, maxPages, path.join(__dirname, 'results'));

  const root = path.join(__dirname, 'results', 'visual');
  const dirs = { baseline: path.join(root, 'baseline'), current: path.join(root, 'current'), diff: path.join(root, 'diff') };
  Object.values(dirs).forEach((d) => fs.mkdirSync(d, { recursive: true }));

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const rows = [];
  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, storageState, reducedMotion: 'reduce' });
      for (const url of pages) {
        const name = slug(url, vp.name);
        const row = { url, viewport: vp.name, name };
        try {
          const page = await context.newPage();
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => page.waitForTimeout(1000));
          await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
          // Scroll once so lazy-loaded images appear, then back to the top.
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 600) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 80));
            }
            window.scrollTo(0, 0);
          });
          await page.waitForTimeout(400);
          const height = await page.evaluate(() => document.documentElement.scrollHeight);
          const shot = await page.screenshot(
            height > MAX_HEIGHT ? { fullPage: true, clip: { x: 0, y: 0, width: vp.width, height: MAX_HEIGHT } } : { fullPage: true },
          );
          await page.close();
          const nowFile = path.join(dirs.current, `${name}.png`);
          fs.writeFileSync(nowFile, shot);
          const baseFile = path.join(dirs.baseline, `${name}.png`);
          if (update || !fs.existsSync(baseFile)) {
            fs.writeFileSync(baseFile, shot);
            row.status = 'saved';
          } else {
            const { changedPct, diff, sizeChanged } = compare(PNG.sync.read(fs.readFileSync(baseFile)), PNG.sync.read(shot));
            row.changedPct = Number(changedPct.toFixed(2));
            row.sizeChanged = sizeChanged;
            if (changedPct >= threshold || sizeChanged) {
              fs.writeFileSync(path.join(dirs.diff, `${name}.png`), PNG.sync.write(diff));
              row.status = 'changed';
            } else {
              row.status = 'same';
            }
          }
        } catch (err) {
          row.status = 'error';
          row.error = String(err.message || err).split('\n')[0];
        }
        rows.push(row);
        console.log(`${row.status.toUpperCase().padEnd(8)} ${vp.name.padEnd(8)} ${url}${row.changedPct !== undefined ? `  (${row.changedPct}% changed)` : ''}`);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const changed = rows.filter((r) => r.status === 'changed');
  const errors = rows.filter((r) => r.status === 'error');
  const saved = rows.filter((r) => r.status === 'saved');
  const verdict = errors.length ? `FAILED: ${errors.length} pictures could not be taken` : changed.length ? `FAILED: ${changed.length} pages look different` : saved.length === rows.length ? 'PASSED: first run, current look saved as the baseline' : 'PASSED: nothing looks different';

  const lines = ['# Visual comparison', '', `Verdict: ${verdict}`, ''];
  for (const r of rows) lines.push(`- ${r.status}: ${r.url} (${r.viewport})${r.changedPct !== undefined ? ` ${r.changedPct}% changed` : ''}${r.error ? ` ${r.error}` : ''}`);
  if (changed.length) lines.push('', `Pictures of the changes: ${dirs.diff}`, 'If a change is wanted, approve it with: npm run visual -- <url> --update');
  console.log('\n' + lines.join('\n'));

  const rel = (d, n) => encodeURI(`${path.basename(root)}/${d}/${n}.png`);
  const base = path.join(__dirname, 'results', `visual-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.writeFileSync(`${base}.md`, lines.join('\n') + '\n');
  writeHtmlReport(`${base}.html`, {
    title: 'Visual comparison',
    subtitle: `${pages.length} pages, phone and desktop`,
    verdict,
    summary: [
      [String(changed.length), 'look different', changed.length ? 'bad' : 'good'],
      [String(rows.filter((r) => r.status === 'same').length), 'look the same', 'good'],
      [String(saved.length), 'newly saved'],
    ],
    sections: [
      {
        heading: 'Pages',
        html: `<table><tr><th>Page</th><th>Device</th><th>Result</th></tr>${rows
          .map((r) => `<tr><td>${esc(r.url)}</td><td>${r.viewport}</td><td class="${r.status === 'changed' || r.status === 'error' ? 'bad' : 'good'}">${r.status}${r.changedPct !== undefined ? ` (${r.changedPct}%)` : ''}${r.status === 'changed' ? ` <a href="${rel('diff', r.name)}">see what changed</a>` : ''}</td></tr>`)
          .join('')}</table>`,
      },
    ],
  });
  console.log(`\nReport: ${base}.html`);
  process.exit(changed.length || errors.length ? 1 : 0);
})();
