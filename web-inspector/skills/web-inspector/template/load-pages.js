// Picks which page or API each fast-user request goes to.
// run-all.js writes results/load-targets.json from the last site scan (or just "/" if there was none).
const fs = require('fs');
const path = require('path');

let paths = ['/'];
try {
  const saved = JSON.parse(fs.readFileSync(path.join(__dirname, 'results', 'load-targets.json'), 'utf8'));
  if (Array.isArray(saved.paths) && saved.paths.length) paths = saved.paths;
} catch {
  // no list: homepage only
}

// Runs before each request: swaps in a random page.
function pickPage(requestParams, context, events, next) {
  const pick = paths[Math.floor(Math.random() * paths.length)];
  requestParams.url = requestParams.url.replace(/\/__page__$/, pick);
  context.vars.picked = pick;
  return next();
}

// Runs after each response: records status and time per real page, read by run-all.js.
function recordPage(requestParams, response, context, events, next) {
  const page = context.vars.picked || '/';
  events.emit('counter', `endpoint|${page}|${response.statusCode}`, 1);
  const ms = response.timings && response.timings.phases && response.timings.phases.total;
  if (typeof ms === 'number') events.emit('histogram', `endpoint_time|${page}`, ms);
  return next();
}

module.exports = { pickPage, recordPage };
