// Runs the fast request users and the real browser users at the same time,
// then gives one PASSED / FAILED verdict from the raw results.
// Usage: node run-all.js <smoke|medium|heavy> <target-url> [--show]
// --show opens visible Chrome windows (slowed down) so you can watch the browser users.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { sameSite } = require('./site');
const { esc, barChart, writeHtmlReport } = require('./report-html');

// Pass/fail rules. Every response that is not 2xx/3xx counts as an error,
// plus network errors (timeouts, refused connections).
const LIMITS = {
  p95Ms: 1000, // 95% of requests must be faster than this
  maxErrorRatePct: 1, // fast users: max % of requests that may fail
};
// The PC running the test is overloaded if its CPU stays above this for 10+ seconds.
const PC_BUSY_PCT = 90;

const show = process.argv.includes('--show');
const [env, target] = process.argv.slice(2).filter((a) => a !== '--show');
if (!['smoke', 'medium', 'heavy'].includes(env) || !/^https?:\/\//.test(target || '')) {
  console.error('Usage: node run-all.js <smoke|medium|heavy> <https://your-site.com> [--show]');
  process.exit(1);
}

const resultsDir = path.join(__dirname, 'results');
fs.mkdirSync(resultsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const issuesFile = path.join(resultsDir, `browser-issues-${env}-${stamp}.log`);

// Which pages and APIs to load: from the last site scan of this site, else the homepage only.
let scan = null;
try {
  scan = JSON.parse(fs.readFileSync(path.join(resultsDir, 'pages.json'), 'utf8'));
  if (!sameSite(scan.start, target) && !sameSite(scan.site, target)) scan = null;
} catch {
  scan = null;
}
const loadTargets = scan ? { pages: scan.pages, paths: [...new Set([...scan.pages, ...scan.apis])] } : { pages: [], paths: ['/'] };
fs.writeFileSync(path.join(resultsDir, 'load-targets.json'), JSON.stringify(loadTargets, null, 2));

const artilleryBin = path.join(__dirname, 'node_modules', 'artillery', 'bin', 'run');
const showOverrides = {
  config: { engines: { playwright: { launchOptions: { channel: 'chrome', headless: false, slowMo: 400 } } } },
};

function run(name, file, extraArgs = []) {
  const output = path.join(resultsDir, `${name}-${env}-${stamp}.json`);
  const args = [artilleryBin, 'run', file, '-e', env, '--target', target, '--output', output, ...extraArgs];
  const child = spawn(process.execPath, args, {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, ISSUES_FILE: issuesFile },
  });
  return new Promise((resolve) => child.on('exit', (code) => resolve({ name, code, output })));
}

// Samples this PC's CPU every 5 seconds while the test runs.
function watchCpu() {
  const snapshot = () =>
    os.cpus().reduce(
      (t, c) => {
        const s = c.times;
        t.idle += s.idle;
        t.total += s.user + s.nice + s.sys + s.idle + s.irq;
        return t;
      },
      { idle: 0, total: 0 },
    );
  const samples = [];
  let last = snapshot();
  const timer = setInterval(() => {
    const now = snapshot();
    samples.push(100 - (100 * (now.idle - last.idle)) / (now.total - last.total));
    last = now;
  }, 5000);
  return () => {
    clearInterval(timer);
    let streak = 0;
    let overloaded = false;
    for (const pct of samples) {
      streak = pct > PC_BUSY_PCT ? streak + 1 : 0;
      if (streak >= 2) overloaded = true;
    }
    const max = samples.length ? Math.max(...samples) : 0;
    const avg = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
    return { max, avg, overloaded };
  };
}

function readAggregate(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')).aggregate;
  } catch {
    return null;
  }
}

const isBad = (code) => Number(code) >= 400;
const pct = (n, total) => (total ? (100 * n) / total : 0);

function judgeLoad(agg) {
  const c = agg.counters || {};
  const requests = c['http.requests'] || 0;
  const problems = [];
  const facts = [];

  const badCodes = Object.entries(c).filter(([k]) => /^http\.codes\.\d+$/.test(k) && isBad(k.split('.')[2]));
  const networkErrors = Object.entries(c).filter(([k]) => k.startsWith('errors.'));
  const badTotal = badCodes.reduce((n, [, v]) => n + v, 0);
  const netTotal = networkErrors.reduce((n, [, v]) => n + v, 0);
  const errorRate = pct(badTotal + netTotal, requests + netTotal);

  facts.push(`users ${c['vusers.created'] || 0}, requests ${requests}, failed users ${c['vusers.failed'] || 0}`);
  facts.push(`error rate ${errorRate.toFixed(2)}% (limit ${LIMITS.maxErrorRatePct}%)`);
  const blockedCount = ['403', '429', '503'].reduce((n, code) => n + (c[`http.codes.${code}`] || 0), 0);
  if (requests && blockedCount / requests > 0.5) {
    problems.push(
      `${pct(blockedCount, requests).toFixed(0)}% of requests were refused (403/429/503): the site's bot protection, firewall or rate limit ` +
        'is blocking the test. Let it through on the site\'s side, or test a staging copy',
    );
  }
  if (errorRate > LIMITS.maxErrorRatePct) {
    problems.push(`error rate ${errorRate.toFixed(2)}% is over the ${LIMITS.maxErrorRatePct}% limit`);
  }
  for (const [k, v] of badCodes) {
    const code = k.split('.')[2];
    let note = '';
    if (code === '429' || code === '403') note = ' (likely blocked by rate limiting / firewall, not the app itself)';
    facts.push(`  HTTP ${code}: ${v}${note}`);
  }
  for (const [k, v] of networkErrors) facts.push(`  network error ${k.slice(7)}: ${v}`);

  // Which pages the bad responses came from.
  for (const [k, v] of Object.entries(c)) {
    const m = k.match(/^endpoint\|(.+)\|(\d+)$/);
    if (m && isBad(m[2])) facts.push(`  -> ${m[1]} returned ${m[2]} x${v}`);
  }

  const rt = (agg.summaries || {})['http.response_time'];
  if (rt) {
    facts.push(`response time median ${rt.median} ms, p95 ${rt.p95} ms (limit ${LIMITS.p95Ms}), max ${rt.max} ms`);
    if (rt.p95 > LIMITS.p95Ms) problems.push(`p95 response time ${rt.p95} ms is over ${LIMITS.p95Ms} ms`);
  }
  for (const [k, v] of Object.entries(agg.summaries || {})) {
    const m = k.match(/^endpoint_time\|(.+)$/);
    if (m) facts.push(`  ${m[1]} p95 ${Math.round(v.p95)} ms`);
  }
  if (!requests) problems.push('no requests were made (is the site reachable?)');
  return { problems, facts };
}

function judgeBrowser(agg) {
  const c = agg.counters || {};
  const problems = [];
  const facts = [];
  facts.push(`browser users ${c['vusers.created'] || 0}, failed ${c['vusers.failed'] || 0}`);

  if (c['browser.blocked_by_bot_protection']) {
    problems.push('blocked by bot protection (challenge page): let the test through on the site\'s side, or test staging');
  }
  if (c['vusers.failed']) problems.push(`${c['vusers.failed']} browser user(s) could not finish (page timeout or crash)`);
  if (c['browser.js_exceptions']) problems.push(`${c['browser.js_exceptions']} JavaScript exception(s)`);
  if (c['browser.requests_failed']) problems.push(`${c['browser.requests_failed']} network request(s) failed in the browser`);
  if (c['browser.console_errors']) problems.push(`${c['browser.console_errors']} console error(s) logged by the site`);
  for (const [k, v] of Object.entries(c)) {
    const m = k.match(/^browser\.http_(\d+)$/);
    if (m) problems.push(`${v} browser response(s) with HTTP ${m[1]}`);
    // Ads, analytics and widgets from other sites: reported, but not the site's own failure.
    const t = k.match(/^browser\.thirdparty_(.+)$/);
    if (t) facts.push(`third-party (not your site) ${t[1].replace('http_', 'HTTP ')}: ${v}`);
  }
  for (const [k, v] of Object.entries(agg.summaries || {})) {
    const m = k.match(/^browser\.page\.(TTFB|FCP)\.(.+)$/);
    if (m) facts.push(`  ${m[1]} ${m[2]} p95 ${v.p95} ms`);
  }
  if (!c['vusers.created']) problems.push('no browser users ran');
  return { problems, facts };
}

if (show && env !== 'smoke') {
  console.warn('Warning: --show with more than the smoke profile opens many Chrome windows and may slow this PC.\n');
}
console.log(`Testing ${target} with the "${env}" profile${show ? ' (visible Chrome windows)' : ''}...`);
console.log(
  scan
    ? `Using ${scan.pages.length} page(s) and ${scan.apis.length} API(s) found by the last site scan.\n`
    : 'No site scan found for this site: load testing the homepage only. Run `npm run scan -- <url>` first for full coverage.\n',
);
const browserArgs = show ? ['--overrides', JSON.stringify(showOverrides)] : [];
const stopCpu = watchCpu();

Promise.all([run('load', 'load.yml'), run('browser', 'browser.yml', browserArgs)]).then((results) => {
  const cpu = stopCpu();
  let allPassed = true;
  console.log('\n================ VERDICT ================');
  const parts = [];
  let loadAgg = null;

  for (const r of results) {
    const agg = readAggregate(r.output);
    if (r.name === 'load') loadAgg = agg;
    let verdict;
    if (!agg) {
      verdict = { problems: [`the test did not run correctly (exit code ${r.code}); see the output above`], facts: [] };
    } else {
      verdict = r.name === 'load' ? judgeLoad(agg) : judgeBrowser(agg);
    }
    const passed = verdict.problems.length === 0;
    allPassed = allPassed && passed;
    const label = r.name === 'load' ? 'Fast request users' : 'Real browser users';
    parts.push({ label, passed, ...verdict });
    console.log(`\n${label}: ${passed ? 'PASSED' : 'FAILED'}`);
    for (const p of verdict.problems) console.log(`  x ${p}`);
    for (const f of verdict.facts) console.log(`  - ${f}`);
    console.log(`  raw data: ${r.output}`);
  }

  if (fs.existsSync(issuesFile)) console.log(`\nBrowser problems with URLs: ${issuesFile}`);

  console.log(`\nThis PC during the test: CPU avg ${cpu.avg.toFixed(0)}%, max ${cpu.max.toFixed(0)}%`);
  if (cpu.overloaded) {
    console.log(
      `  ! WARNING: this PC's CPU stayed above ${PC_BUSY_PCT}%, so the results may be measuring this PC, not the website.` +
        '\n    Use a smaller profile or run the test from a stronger machine before trusting the numbers.',
    );
  }

  const overall = `${allPassed ? 'PASSED' : 'FAILED'}${cpu.overloaded ? ' (results unreliable: PC overloaded)' : ''}`;
  console.log(`\nOVERALL: ${overall}`);

  // HTML report with charts.
  const htmlFile = path.join(resultsDir, `load-report-${env}-${stamp}.html`);
  const sections = parts.map((p) => ({
    heading: `${p.label}: ${p.passed ? 'PASSED' : 'FAILED'}`,
    html:
      (p.problems.length ? `<ul>${p.problems.map((x) => `<li class="bad">${esc(x)}</li>`).join('')}</ul>` : '<p class="good">No problems.</p>') +
      (p.facts.length ? `<ul>${p.facts.map((x) => `<li class="muted">${esc(x.trim())}</li>`).join('')}</ul>` : ''),
  }));
  if (loadAgg) {
    const c = loadAgg.counters || {};
    const times = Object.entries(loadAgg.summaries || {})
      .map(([k, v]) => [k.match(/^endpoint_time\|(.+)$/), v])
      .filter(([m]) => m)
      .map(([m, v]) => ({ label: m[1], value: v.p95, display: `${Math.round(v.p95)} ms`, level: v.p95 > LIMITS.p95Ms ? 'bad' : v.p95 > LIMITS.p95Ms / 2 ? 'warn' : 'good' }))
      .sort((a, b) => b.value - a.value);
    const perPage = {};
    for (const [k, v] of Object.entries(c)) {
      const m = k.match(/^endpoint\|(.+)\|(\d+)$/);
      if (!m) continue;
      perPage[m[1]] ||= { total: 0, bad: 0 };
      perPage[m[1]].total += v;
      if (Number(m[2]) >= 400) perPage[m[1]].bad += v;
    }
    const errorRows = Object.entries(perPage)
      .map(([label, s]) => ({ label, value: (100 * s.bad) / s.total, display: `${s.bad} of ${s.total}`, level: s.bad ? 'bad' : 'good' }))
      .sort((a, b) => b.value - a.value);
    sections.unshift(
      { heading: 'Response time per page/API (95% of requests faster than)', html: barChart(times, { limit: LIMITS.p95Ms, limitLabel: `limit ${LIMITS.p95Ms} ms` }) },
      { heading: 'Failed requests per page/API', html: barChart(errorRows) },
    );
  }
  sections.push({
    heading: 'This computer during the test',
    html: `<p>CPU average ${cpu.avg.toFixed(0)}%, highest ${cpu.max.toFixed(0)}%.</p>${
      cpu.overloaded ? '<p class="bad">The CPU stayed above 90%: these results may measure this computer, not the website.</p>' : ''
    }`,
  });
  const lc = (loadAgg && loadAgg.counters) || {};
  writeHtmlReport(htmlFile, {
    title: `Load test (${env}): ${target}`,
    verdict: overall,
    summary: [
      [lc['vusers.created'] || 0, 'fast users'],
      [lc['http.requests'] || 0, 'requests'],
      [parts.filter((p) => !p.passed).length, 'parts failed', allPassed ? 'good' : 'bad'],
    ],
    sections,
  });
  console.log(`Report saved: ${htmlFile}`);
  process.exit(allPassed ? 0 : 1);
});
