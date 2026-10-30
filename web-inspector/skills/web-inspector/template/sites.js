// Checks several websites you own in one go and writes one summary: which sites pass, how many errors and
// warnings each has, and what is new or fixed since the last time. Each site is scanned on its own, so the
// "new / fixed" comparison stays per site.
//
// Usage: node sites.js --i-own-this [sites.txt] [--no-external] [--no-phone] [--max-pages N]
//   sites.txt  one address per line (default: sites.txt next to this file); lines starting with # are skipped
//   Other options are passed on to scan.js.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { esc, writeHtmlReport } = require('./report-html');

const argv = process.argv.slice(2);
if (!argv.includes('--i-own-this')) {
  console.error('Refused. Add --i-own-this to confirm you own every site in the list or have written permission to test it.');
  process.exit(2);
}
const rest = argv.filter((a) => a !== '--i-own-this');
const listArg = rest.find((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const listFile = path.resolve(listArg || path.join(__dirname, 'sites.txt'));
const passOn = rest.filter((a) => a !== listArg);
if (!fs.existsSync(listFile)) {
  console.error(`List not found: ${listFile}`);
  process.exit(1);
}
const sites = fs
  .readFileSync(listFile, 'utf8')
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => /^https?:\/\//.test(l));
if (!sites.length) {
  console.error(`No websites in ${listFile}. Add one address per line, for example https://my-site.com`);
  process.exit(1);
}

const resultsDir = path.join(__dirname, 'results');
const latestFor = (site) => {
  if (!fs.existsSync(resultsDir)) return null;
  const files = fs.readdirSync(resultsDir).filter((f) => /^scan-.*\.json$/.test(f)).sort().reverse();
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf8'));
      if (data.target === site) return { file: f, data };
    } catch {}
  }
  return null;
};

const rows = [];
for (const site of sites) {
  console.log(`\n=== ${site} ===`);
  const run = spawnSync(process.execPath, [path.join(__dirname, 'scan.js'), site, ...passOn], { stdio: 'inherit' });
  const got = latestFor(site);
  const issues = got?.data.issues || [];
  rows.push({
    site,
    exit: run.status,
    verdict: run.status === 3 ? 'BLOCKED' : got ? got.data.overall : 'COULD NOT SCAN',
    errors: issues.filter((i) => i.severity === 'error').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
    newIssues: got?.data.comparison?.newIssues ?? null,
    fixed: got?.data.comparison?.fixedIssues ?? null,
    report: got ? got.file.replace(/\.json$/, '.html') : null,
  });
}

const failed = rows.filter((r) => r.verdict !== 'PASSED');
const verdict = failed.length ? `FAILED: ${failed.length} of ${rows.length} sites need attention` : `PASSED: all ${rows.length} sites`;
const lines = ['# Summary of all sites', '', verdict, ''];
for (const r of rows) {
  lines.push(`- ${r.verdict.padEnd(8)} ${r.site}  errors ${r.errors}, warnings ${r.warnings}${r.newIssues !== null ? `, new ${r.newIssues}, fixed ${r.fixed}` : ''}${r.report ? `  (${r.report})` : ''}`);
}
console.log('\n' + lines.join('\n'));
fs.mkdirSync(resultsDir, { recursive: true });
const base = path.join(resultsDir, `sites-${new Date().toISOString().replace(/[:.]/g, '-')}`);
fs.writeFileSync(`${base}.md`, lines.join('\n') + '\n');
writeHtmlReport(`${base}.html`, {
  title: 'Summary of all sites',
  subtitle: `${rows.length} sites`,
  verdict,
  summary: [
    [rows.length - failed.length, 'passed', 'good'],
    [failed.length, 'need attention', failed.length ? 'bad' : 'good'],
  ],
  sections: [
    {
      heading: 'Sites',
      html: `<table><tr><th>Site</th><th>Result</th><th>Errors</th><th>Warnings</th><th>New</th><th>Fixed</th><th>Report</th></tr>${rows
        .map(
          (r) =>
            `<tr><td>${esc(r.site)}</td><td class="${r.verdict === 'PASSED' ? 'good' : 'bad'}">${esc(r.verdict)}</td><td>${r.errors}</td><td>${r.warnings}</td><td>${r.newIssues ?? '-'}</td><td>${r.fixed ?? '-'}</td><td>${r.report ? `<a href="${encodeURI(r.report)}">open</a>` : '-'}</td></tr>`,
        )
        .join('')}</table>`,
    },
  ],
});
console.log(`\nReport: ${base}.html`);
process.exit(failed.length ? 1 : 0);
