// Builds the self-contained HTML reports (no internet needed to open them; light and dark mode).
const fs = require('fs');

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Horizontal bar chart. rows: [{ label, value, display, level: 'good' | 'warn' | 'bad' }]
// `limit` draws a dashed line, e.g. the 1000 ms pass/fail limit.
function barChart(rows, { limit, limitLabel } = {}) {
  if (!rows.length) return '';
  const max = Math.max(...rows.map((r) => r.value), limit || 0) || 1;
  const pct = (v) => `${Math.max(0.5, (100 * v) / max).toFixed(2)}%`;
  return `<div class="chart">${rows
    .map(
      (r) => `<div class="row"><div class="label" title="${esc(r.label)}">${esc(r.label)}</div>
      <div class="track">${limit ? `<div class="limit" style="left:${pct(limit)}" title="${esc(limitLabel || '')}"></div>` : ''}
      <div class="bar ${r.level || 'good'}" style="width:${pct(r.value)}"></div></div>
      <div class="value">${esc(r.display ?? r.value)}</div></div>`,
    )
    .join('')}${limit ? `<div class="legend">dashed line: ${esc(limitLabel || `limit ${limit}`)}</div>` : ''}</div>`;
}

function writeHtmlReport(file, { title, verdict, subtitle = '', summary = [], sections = [] }) {
  const v = String(verdict || '');
  const vClass = /^PASSED/.test(v) ? 'good' : /^BLOCKED/.test(v) ? 'warn' : 'bad';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--bg:#f7f7f5;--card:#fff;--text:#1d1d1b;--muted:#6b6b66;--line:#e2e2dc;--good:#2f8a4c;--warn:#b7791f;--bad:#c2410c;--track:#eeeeea}
@media (prefers-color-scheme: dark){:root{--bg:#171716;--card:#21211f;--text:#ecece8;--muted:#a3a39c;--line:#363633;--good:#4fb36f;--warn:#e0a43c;--bad:#f07a4a;--track:#2c2c29}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1000px;margin:0 auto;padding:24px 16px 48px}h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:0 0 10px}
.muted{color:var(--muted)}.good{color:var(--good)}.warn{color:var(--warn)}.bad{color:var(--bad)}
.verdict{display:inline-block;font-weight:700;padding:4px 12px;border-radius:999px;border:2px solid currentColor;margin:10px 0 16px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:18px}
.card,.section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}
.card .big{font-size:24px;font-weight:700}.section{margin-bottom:14px;overflow-wrap:anywhere}
ul{padding-left:20px;margin:6px 0}li{margin:2px 0}code{font-size:13px}
.chart .row{display:grid;grid-template-columns:minmax(80px,30%) 1fr 90px;gap:8px;align-items:center;margin:4px 0}
.chart .label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.chart .value{font-size:13px;text-align:right}
.chart .track{position:relative;height:14px;background:var(--track);border-radius:4px}
.chart .bar{height:100%;border-radius:4px}.bar.good{background:var(--good)}.bar.warn{background:var(--warn)}.bar.bad{background:var(--bad)}
.chart .limit{position:absolute;top:-3px;bottom:-3px;border-left:2px dashed var(--muted)}.legend{font-size:12px;color:var(--muted);margin-top:4px}
table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;padding:5px 8px;border-bottom:1px solid var(--line)}
</style></head><body><main>
<h1>${esc(title)}</h1>${subtitle ? `<div class="muted">${esc(subtitle)}</div>` : ''}
<div class="verdict ${vClass}">${esc(v)}</div>
<div class="cards">${summary.map(([big, label, cls]) => `<div class="card"><div class="big ${cls || ''}">${esc(big)}</div><div class="muted">${esc(label)}</div></div>`).join('')}</div>
${sections.map((s) => `<section class="section"><h2>${esc(s.heading)}</h2>${s.html}</section>`).join('\n')}
<p class="muted">Generated ${esc(new Date().toISOString())} by web-inspector.</p>
</main></body></html>`;
  fs.writeFileSync(file, html);
}

module.exports = { esc, barChart, writeHtmlReport };
