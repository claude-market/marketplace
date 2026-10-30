// Active security scan: launches OWASP ZAP (a well-known, free security tool), lets IT attack the site
// (SQL injection, XSS and more), then rewrites its findings in this kit's plain-words style.
//
// This is NOT read-only like `security.js` — ZAP sends real attack traffic. Only ever point it at a
// STAGING copy of a site you own, never your live site: it can create junk data, trip alarms, or (rarely)
// break something fragile.
//
// Usage: node zap.js <url> --i-own-this --staging
//   --i-own-this  your statement that you own this site or have written permission to test it
//   --staging     your statement that this URL is a test/staging copy, not the live site
// Needs Docker Desktop installed and running (https://www.docker.com/products/docker-desktop). This
// script does not write any attack code itself: ZAP's own, independently-built scanner does the testing.
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const { esc, writeHtmlReport } = require('./report-html');

const ZAP_IMAGE = 'zaproxy/zap-stable';
const RISK_ORDER = ['High', 'Medium', 'Low', 'Informational'];

const argv = process.argv.slice(2);
const target = argv.find((a) => /^https?:\/\//.test(a));
const usage =
  'Usage: node zap.js <https://staging.your-site.com> --i-own-this --staging\n' +
  '  --i-own-this   you own this site or have written permission to test it\n' +
  '  --staging      this is a staging/test copy, NOT the live site\n' +
  'Needs Docker Desktop running: https://www.docker.com/products/docker-desktop';
if (!target) {
  console.error(usage);
  process.exit(1);
}
if (!argv.includes('--i-own-this')) {
  console.error('Refused. Add --i-own-this to confirm you own this site or have written permission to test it.\n' + usage);
  process.exit(2);
}
if (!argv.includes('--staging')) {
  console.error(
    'Refused. This is an ACTIVE scan: it sends real attack traffic (SQL injection, XSS and more), which can\n' +
      'create junk data or break something fragile. Point it at a staging/test copy, never your live site,\n' +
      'then add --staging to confirm that this URL is that staging copy.\n' + usage,
  );
  process.exit(2);
}

try {
  execSync('docker info', { stdio: 'ignore' });
} catch {
  console.error(
    'Docker is not installed or not running. ZAP runs inside Docker, so this needs Docker Desktop:\n' +
      '  1. Install it: https://www.docker.com/products/docker-desktop\n' +
      '  2. Start it (it must be running, not just installed)\n' +
      '  3. Run this command again',
  );
  process.exit(3);
}

console.log(`Pulling the ZAP image (first run only, can take a few minutes) ...`);
const resultsDir = path.join(__dirname, 'results');
fs.mkdirSync(resultsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const base = path.join(resultsDir, `zap-${stamp}`);
const reportJson = `zap-${stamp}.json`;

console.log(`Starting ZAP's active scan of ${target} — this attacks the site on purpose and can take a while`
  + ' (minutes to an hour, depending on the site).');
const run = spawnSync(
  'docker',
  [
    'run', '--rm', '-v', `${resultsDir.replace(/\\/g, '/')}:/zap/wrk:rw`,
    '-t', ZAP_IMAGE,
    'zap-full-scan.py', '-t', target, '-J', reportJson, '-I',
  ],
  { stdio: 'inherit' },
);
// zap-full-scan.py exits non-zero when it found alerts above its default threshold; that is expected.
const reportFile = path.join(resultsDir, reportJson);
if (!fs.existsSync(reportFile)) {
  console.error(`\nZAP did not produce a report (exit code ${run.status}). The site may have blocked it, or`
    + ' the scan failed to start. See the ZAP output above.');
  process.exit(run.status || 4);
}

const zap = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const alerts = (zap.site || []).flatMap((s) =>
  (s.alerts || []).map((a) => ({
    risk: a.riskdesc?.split(' ')[0] || 'Informational',
    name: a.name,
    count: (a.instances || []).length,
    desc: (a.desc || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    solution: (a.solution || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    examples: (a.instances || []).slice(0, 3).map((i) => i.uri),
  })),
);
const counts = Object.fromEntries(RISK_ORDER.map((r) => [r, alerts.filter((a) => a.risk === r).length]));
const overall = counts.High ? 'FAILED' : counts.Medium ? 'FAILED' : 'PASSED';

const lines = [
  `# Active security scan (ZAP): ${target}`,
  '',
  'This scan sent real attack traffic (SQL injection, XSS and more) at a staging copy. It is much deeper',
  'than the read-only `security` check, and found real vulnerabilities rather than just missing settings.',
  '',
  `High: ${counts.High}   Medium: ${counts.Medium}   Low: ${counts.Low}   Informational: ${counts.Informational}`,
  '',
];
for (const risk of RISK_ORDER) {
  const group = alerts.filter((a) => a.risk === risk);
  if (!group.length) continue;
  lines.push(`## ${risk} (${group.length})`, '');
  for (const a of group) {
    lines.push(`- ${a.name} (${a.count} place(s), e.g. ${a.examples[0] || target})`);
    if (a.solution) lines.push(`  Fix: ${a.solution.slice(0, 200)}`);
  }
  lines.push('');
}
lines.push(`OVERALL: ${overall}`);
console.log('\n' + lines.join('\n'));

fs.writeFileSync(`${base}.md`, lines.join('\n') + '\n');
const sevClass = { High: 'bad', Medium: 'warn', Low: 'muted', Informational: 'muted' };
writeHtmlReport(`${base}.html`, {
  title: `Active security scan (ZAP): ${target}`,
  subtitle: 'ZAP sent real attack traffic to this staging copy — a deeper check than the read-only security scan.',
  verdict: overall,
  summary: RISK_ORDER.map((r) => [counts[r], r.toLowerCase(), counts[r] && r !== 'Informational' && r !== 'Low' ? 'bad' : counts[r] ? 'warn' : 'good']),
  sections: RISK_ORDER.filter((r) => counts[r]).map((risk) => ({
    heading: `${risk} (${counts[risk]})`,
    html: `<ul>${alerts.filter((a) => a.risk === risk).map((a) =>
      `<li class="${sevClass[risk]}"><b>${esc(a.name)}</b> (${a.count} place(s))<br>${esc(a.desc.slice(0, 300))}${a.solution ? `<br><span class="muted">Fix: ${esc(a.solution.slice(0, 300))}</span>` : ''}${a.examples.length ? `<br><span class="muted">e.g. ${a.examples.map(esc).join(', ')}</span>` : ''}</li>`
    ).join('')}</ul>`,
  })),
});
console.log(`\nReport saved: ${base}.html (and .md). Raw ZAP report: ${reportFile}`);
process.exit(counts.High || counts.Medium ? 1 : 0);
