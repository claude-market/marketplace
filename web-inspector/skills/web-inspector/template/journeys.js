// Click-and-type journeys: runs the plain-word steps in journeys.txt in real Chrome.
// A journey fails when a step cannot be done, an expectation is not met, or the site itself throws a
// JavaScript error or answers 4xx/5xx while the journey runs.
//
// Usage: node journeys.js <url> [--file journeys.txt] [--auth auth.json] [--show]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { sameSite } = require('./site');
const { writeHtmlReport, esc } = require('./report-html');

const STEP_TIMEOUT_MS = 10000;

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const show = argv.includes('--show');
const file = flag('--file') || path.join(__dirname, 'journeys.txt');
const authFile = flag('--auth');
const valueIdx = new Set(['--file', '--auth'].map((f) => argv.indexOf(f) + 1).filter((i) => i > 0));
const target = argv.find((a, i) => !a.startsWith('--') && !valueIdx.has(i));
if (!/^https?:\/\//.test(target || '')) {
  console.error('Usage: node journeys.js <https://your-site.com> [--file journeys.txt] [--auth auth.json] [--show]');
  process.exit(1);
}

// ---- parse journeys.txt
function tokens(line) {
  return [...line.matchAll(/"([^"]*)"|(\S+)/g)].map((m) => (m[1] !== undefined ? { quoted: true, v: m[1] } : { quoted: false, v: m[2] }));
}
function parse(text) {
  const journeys = [];
  let current = null;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const j = line.match(/^journey:\s*(.+)$/i);
    if (j) {
      current = { name: j[1].trim(), steps: [] };
      journeys.push(current);
      return;
    }
    if (!current) {
      current = { name: 'Journey 1', steps: [] };
      journeys.push(current);
    }
    current.steps.push({ line: i + 1, text: line, t: tokens(line) });
  });
  return journeys;
}

const fillRandom = (s) => s.replace(/\{random\}/g, () => String(Math.floor(Math.random() * 1e9)));
const isCss = (t) => !t.quoted && /^[#.\[]/.test(t.v);

// Finds an element the way a person would describe it: by its text, label or placeholder.
async function findClickable(page, t) {
  if (isCss(t)) return page.locator(t.v).first();
  for (const make of [
    () => page.getByRole('button', { name: t.v }),
    () => page.getByRole('link', { name: t.v }),
    () => page.getByRole('menuitem', { name: t.v }),
    () => page.getByRole('tab', { name: t.v }),
    () => page.getByText(t.v),
  ]) {
    const loc = make();
    if (await loc.count()) return loc.first();
  }
  throw new Error(`nothing to click with the text "${t.v}"`);
}
async function findField(page, t) {
  if (isCss(t)) return page.locator(t.v).first();
  for (const make of [
    () => page.getByLabel(t.v),
    () => page.getByPlaceholder(t.v),
    () => page.locator(`[name="${t.v.replace(/"/g, '\\"')}"]`),
    () => page.getByRole('textbox', { name: t.v }),
    () => page.getByRole('combobox', { name: t.v }),
  ]) {
    const loc = make();
    if (await loc.count()) return loc.first();
  }
  throw new Error(`no field labelled "${t.v}"`);
}

async function runStep(page, step, resultsDir, journeyIndex) {
  const [cmd, ...rest] = step.t;
  const word = cmd.v.toLowerCase();
  const arg = (n) => {
    if (!rest[n]) throw new Error(`missing value in: ${step.text}`);
    return rest[n];
  };
  switch (word) {
    case 'open':
      await page.goto(new URL(arg(0).v, target).href, { waitUntil: 'load', timeout: 30000 });
      return;
    case 'click':
      await (await findClickable(page, arg(0))).click();
      await page.waitForLoadState('load').catch(() => {});
      return;
    case 'fill': {
      // fill "Label" with "value"
      const value = rest[1] && rest[1].v.toLowerCase() === 'with' ? arg(2) : arg(1);
      await (await findField(page, arg(0))).fill(fillRandom(value.v));
      return;
    }
    case 'select': {
      const value = rest[1] && rest[1].v.toLowerCase() === 'option' ? arg(2) : arg(1);
      await (await findField(page, arg(0))).selectOption({ label: value.v }).catch(async () => (await findField(page, arg(0))).selectOption(value.v));
      return;
    }
    case 'check':
      await (await findField(page, arg(0))).check();
      return;
    case 'press':
      await page.keyboard.press(arg(0).v);
      await page.waitForLoadState('load').catch(() => {});
      return;
    case 'wait':
      if (/^\d+$/.test(arg(0).v)) await page.waitForTimeout(Number(arg(0).v));
      else if (arg(0).v.toLowerCase() === 'for' && rest[1] && rest[1].v.toLowerCase() === 'text') await page.getByText(arg(2).v).first().waitFor({ timeout: STEP_TIMEOUT_MS });
      else throw new Error(`unknown wait: ${step.text}`);
      return;
    case 'expect': {
      const what = arg(0).v.toLowerCase();
      if (what === 'text') {
        await page.getByText(arg(1).v).first().waitFor({ timeout: STEP_TIMEOUT_MS }).catch(() => {
          throw new Error(`the page does not show "${arg(1).v}"`);
        });
      } else if (what === 'no' && rest[1] && rest[1].v.toLowerCase() === 'text') {
        await page.waitForTimeout(500);
        if (await page.getByText(arg(2).v).count()) throw new Error(`the page shows "${arg(2).v}", which it should not`);
      } else if (what === 'url') {
        await page.waitForURL((u) => u.href.includes(arg(1).v), { timeout: STEP_TIMEOUT_MS }).catch(() => {
          throw new Error(`the address is ${page.url()}, which does not contain "${arg(1).v}"`);
        });
      } else if (what === 'title') {
        const title = await page.title();
        if (!title.includes(arg(1).v)) throw new Error(`the title is "${title}", which does not contain "${arg(1).v}"`);
      } else throw new Error(`unknown expectation: ${step.text}`);
      return;
    }
    case 'screenshot': {
      const name = (rest[0] ? rest[0].v : `step-${step.line}`).replace(/[^\w-]+/g, '_');
      await page.screenshot({ path: path.join(resultsDir, `journey-${journeyIndex + 1}-${name}.png`), fullPage: true });
      return;
    }
    default:
      throw new Error(`unknown step "${cmd.v}" (see the list at the top of journeys.txt)`);
  }
}

(async () => {
  if (!fs.existsSync(file)) {
    console.error(`No journeys file: ${file}`);
    process.exit(1);
  }
  const journeys = parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
  if (!journeys.length) {
    console.log(`No journeys written yet in ${file}. Open it, follow the example, then run this again.`);
    process.exit(0);
  }
  let storageState;
  if (authFile) storageState = JSON.parse(fs.readFileSync(authFile, 'utf8').replace(/^﻿/, ''));

  const resultsDir = path.join(__dirname, 'results');
  fs.mkdirSync(resultsDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: !show, slowMo: show ? 300 : 0 });

  // Learn the real site address first (example.com -> www.example.com, http -> https), so the site's own
  // errors after a redirect are not mistaken for third-party ones.
  const probe = await browser.newContext({ ignoreHTTPSErrors: true });
  const first = await probe.request.get(target, { timeout: 30000 }).catch(() => null);
  const siteOrigin = first ? new URL(first.url()).origin : target;
  await probe.close();
  const isOurs = (u) => sameSite(u, target) || sameSite(u, siteOrigin);
  console.log(`Running ${journeys.length} journey(s) on ${target}...\n`);
  const results = [];

  for (const [index, journey] of journeys.entries()) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, ...(storageState ? { storageState } : {}) });
    const page = await context.newPage();
    page.setDefaultTimeout(STEP_TIMEOUT_MS);
    const problems = [];
    const thirdParty = [];
    page.on('dialog', (d) => d.accept().catch(() => {}));
    page.on('pageerror', (err) => problems.push(`JavaScript exception: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() !== 'error' || /Failed to load resource/.test(msg.text())) return;
      const where = msg.location()?.url;
      (where && !isOurs(where) ? thirdParty : problems).push(`Console error: ${msg.text()}`);
    });
    page.on('response', (res) => {
      if (res.status() < 400) return;
      (isOurs(res.url()) ? problems : thirdParty).push(`HTTP ${res.status()}: ${res.url()}`);
    });

    const started = Date.now();
    let failedStep = null;
    let error = null;
    for (const step of journey.steps) {
      try {
        await runStep(page, step, resultsDir, index);
      } catch (err) {
        failedStep = step;
        error = err.message.split('\n')[0];
        break;
      }
    }
    let screenshot = null;
    if (failedStep || problems.length) {
      screenshot = `journey-${index + 1}-failed.png`;
      await page.screenshot({ path: path.join(resultsDir, screenshot), fullPage: true }).catch(() => (screenshot = null));
    }
    await context.close();
    const passed = !failedStep && !problems.length;
    const r = { name: journey.name, passed, seconds: (Date.now() - started) / 1000, failedStep, error, problems: [...new Set(problems)], thirdParty: [...new Set(thirdParty)], screenshot };
    results.push(r);
    console.log(`${passed ? 'PASSED' : 'FAILED'}  ${journey.name} (${r.seconds.toFixed(1)} s)`);
    if (failedStep) console.log(`  x line ${failedStep.line}: ${failedStep.text}\n    ${error}`);
    for (const p of r.problems) console.log(`  x ${p}`);
    for (const p of r.thirdParty) console.log(`  - third-party (not your site): ${p}`);
  }
  await browser.close();

  const failed = results.filter((r) => !r.passed).length;
  const overall = failed ? 'FAILED' : 'PASSED';
  console.log(`\nOVERALL: ${overall} (${results.length - failed} of ${results.length} journeys passed)`);

  const base = path.join(resultsDir, `journeys-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.writeFileSync(`${base}.json`, JSON.stringify({ target, ranAt: new Date().toISOString(), overall, journeys: results }, null, 2));
  writeHtmlReport(`${base}.html`, {
    title: `Journeys: ${target}`,
    verdict: overall,
    summary: [[`${results.length - failed} / ${results.length}`, 'journeys passed']],
    sections: results.map((r) => ({
      heading: `${r.passed ? 'PASSED' : 'FAILED'}: ${r.name}`,
      html:
        (r.failedStep ? `<p class="bad">Stopped at line ${r.failedStep.line}: <code>${esc(r.failedStep.text)}</code><br>${esc(r.error)}</p>` : '') +
        (r.problems.length ? `<ul>${r.problems.map((p) => `<li class="bad">${esc(p)}</li>`).join('')}</ul>` : '') +
        (r.thirdParty.length ? `<p class="muted">Third-party (not your site):</p><ul>${r.thirdParty.map((p) => `<li class="muted">${esc(p)}</li>`).join('')}</ul>` : '') +
        (r.screenshot ? `<p><img src="${esc(r.screenshot)}" alt="Screenshot when the journey failed" style="max-width:100%;border:1px solid var(--line)"></p>` : '') +
        `<p class="muted">${r.seconds.toFixed(1)} s</p>`,
    })),
  });
  console.log(`Report saved: ${base}.html (and .json)`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('Journeys crashed:', err);
  process.exit(2);
});
