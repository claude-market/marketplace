# Tactical Gotchas

Library-specific quirks, environment-specific issues, and narrow tool gotchas worth not hitting twice. This file does NOT load at session start — any assistant reads it on demand when working with the named library/tool/environment.

If a gotcha here generalizes into a cross-cutting principle, migrate it into the relevant brain-file section. If it becomes irrelevant (library version change, tool retired), delete it. Gotchas should rot out of this file the same way they would rot in a brain file — but here they don't tax every session.

## Audio / Web Audio

### smplr instruments + Tone.js routing — context-mismatch bug

Don't route smplr instruments through a `Tone.Channel`. smplr's internal node graph can't connect through Tone's `standardized-audio-context` wrappers and throws `"A value with the given key could not be found"` at construction time.

**Fix:** use native `GainNode` + `StereoPannerNode` for per-part routing. Keep `Tone.Transport` for timing.

```ts
const gain = ctx.createGain()
const panner = ctx.createStereoPanner()
gain.connect(panner)
panner.connect(ctx.destination)
// smplr instrument destination = gain (a real Web Audio node, not Tone-wrapped)
```

## CSS / Tailwind

### Tailwind v4 — utilities live inside cascade layers

Tailwind v4 generates every utility inside `@layer utilities { }`. Any CSS rule written outside a layer silently overrides every Tailwind utility, because un-layered rules beat layered ones at the cascade.

**Fix:** never write un-layered global resets. Use `@layer base { }` for resets, or rely on Tailwind's preflight.

```css
/* Wrong — overrides every Tailwind utility */
* { margin: 0; padding: 0; }

/* Right */
@layer base {
  * { margin: 0; padding: 0; }
}
```

### Global focus rings — use `:focus-visible`, not `:focus`

A rule like `input:focus { outline: 2px solid ... }` fires on **mouse click**, not just keyboard nav, so clicking any input draws the ring. Most visible as an ugly box hugging a custom radio/checkbox card on selection.

**Fix:** scope the focus ring to `:focus-visible` so pointer clicks don't trigger it; keyboard Tab still does. Keep inputs consistent with buttons/links on the same rule.

```css
/* Wrong — ring shows on mouse click too */
input:focus, button:focus-visible { outline: 2px solid var(--accent); }

/* Right */
input:focus-visible, button:focus-visible { outline: 2px solid var(--accent); }
```

Verify both paths in-browser: mouse click (no ring) AND Tab (ring present — accessibility preserved).

### `object-fit: cover` grids crop the subject, not just the edges

In a fixed-cell masonry/photo grid (`object-fit: cover` + `grid-auto-rows` / fixed aspect cells), every source whose aspect ratio differs from the cell is center-cropped. A **square (1:1) or landscape source dropped into a portrait-ish or landscape cell loses its top and bottom** — a head-up subject (a face looking up, a tall hat) renders **headless**. The file loads fine (`naturalWidth > 0`), there is no overflow and no console error, so automated "images render / no broken / no overflow" checks all pass while the composition is visibly broken — the kind of defect a human catches before a probe does.

**Fix / discipline:** when adding images to a cover-crop grid, screenshot the rendered grid and inspect **each tile's subject framing** — not only that the image loaded. Prefer sources whose aspect ratio is close to the cell's; for off-ratio keepers, set a subject-aware `object-position` (e.g. `object-position: 50% 25%`) or give that tile a matching cell span.

### Swapping a block element for `inline-flex` reflows its sibling beside it

Replacing a block-level element (e.g. a `<p class="blurb">`) with an `inline-flex` (or `inline-block`) box makes any following inline-level sibling — a link that is `display:inline-block`, for example — flow onto the **same line, to the right of it**, instead of stacking below. The old block forced a line break; the new inline box does not. No overflow, no console error: it just looks unbalanced (button floating beside a callout). This is desktop-only — mobile wraps so it looks fine and hides the bug.

**Fix / discipline:** if a replacement element must sit on its own line with following content below it, make it block-level — `display:flex` (centered via `max-width` + `margin:auto`), not `display:inline-flex`. Internal flex layout (tag + text, `flex-wrap`) is identical between the two; only the outer flow differs. Always screenshot the changed CTA/section at **desktop**, not just mobile — narrow viewports wrap inline elements and mask this.

### Global `.toolbar { grid-area: <name> }` leaks into a new sibling shell that reuses the class

Building a second top-level shell (e.g. a new route next to `/`) and reusing a low-level class like `.toolbar` for the new shell drags the OLD shell's `grid-area: toolbar` along — even though the new shell defines its own `grid-template-rows: auto auto 1fr` with no named areas. Result: child elements get placed into an implicit named-area grid (computed `grid-template-rows: 860px 0 0 0 40px`), the layout flips vertically (header at bottom, body on top), and there is no console error to point at.

**Fix / discipline:** scope-reset the inherited grid-area in the new shell — `.<new-shell> .toolbar { grid-area: auto; }` — OR namespace the class entirely (`.edu-toolbar`). The first is one line and preserves the toolbar's existing styles; the second is cleaner long-term. When a Next.js project ships one global stylesheet, any class on a page-shell descendant whose styles include `grid-area`, `grid-row`, or `grid-column` will conflict with any *other* shell that uses the same class without an override.

## Dev server / localhost

### A 200 on a reused dev-server port is NOT proof you're testing your branch

Stop-hooks and parallel sessions can hold a port and serve **stale or wrong-checkout code**; `curl` returning 200 looks correct while the page is from a different worktree. Before trusting any verification on a port that's already listening:

```bash
lsof -i :<port> | grep LISTEN          # get the PID
lsof -p <PID> | grep cwd               # confirm cwd matches THIS worktree's checkout
```

If the cwd doesn't match, do NOT reuse the server — pick a different free port and start your own. This silently renders another session's build into a verification cycle if unchecked.

### Bind to `0.0.0.0` (not `127.0.0.1`) to preview on a real device

Loopback (`127.0.0.1` / `localhost`) is unreachable from other devices on the LAN. To preview on a phone/tablet, bind the dev server to `0.0.0.0` and use the machine's LAN-IP URL (`ipconfig getifaddr en0` on macOS), not `localhost:<port>`.

### Diagnostic servers die the moment their purpose is served

Any extra dev server spun up beyond the one-per-worktree-session rule (e.g. a regression baseline on the base commit, a side-by-side comparison) gets killed the moment its purpose is served — never left running into the next exchange. When asked "why so many ports," the answer is usually parallel worktree sessions each owning one server; map every listener (`lsof … cwd`) before explaining, and only ever kill servers you started.

### `SessionStart` / `UserPromptSubmit` auto-spawn hooks run from the MAIN repo path, NOT your worktree

When a project's `.claude/settings.local.json` defines a hook that auto-spawns a dev server, the hook command `cd`s into the **primary checkout**, not the worktree where the session is happening. Editing files in the worktree and refreshing the auto-spawned port appears to do nothing because the server is compiling the main checkout. Symptom: a screenshot shows the OLD HTML even though grep on the worktree file confirms your edit landed.

Fix: spin a separate dev server from the worktree on a different port (`./node_modules/.bin/next dev -p <port>`) and test against that. The auto-spawned server is for whoever owns main; worktree sessions stay on their own port the whole time. Confirm cwd before reusing any port (see the `lsof … cwd` recipe above).

### A `curl`/`wget`-intercepting sandbox hook breaks localhost API smoke — use Python urllib

Some sandbox/PreToolUse hooks rewrite any `curl`/`wget` command to their own fetch tools, which can't reach the host's localhost dev server for a stateful request — a `POST` to `/api/...` never lands, and the Bash call returns a redirect notice instead of the server's response. For live localhost API smoke (e.g. POSTing to verify a route against a real backend), drive the request from `python3` urllib instead, which such hooks usually do not intercept:

```python
import json, urllib.request
req = urllib.request.Request("http://localhost:3000/api/foo", method="POST",
    data=json.dumps(body).encode(), headers={"content-type": "application/json"})
print(json.loads(urllib.request.urlopen(req, timeout=75).read()))
```

Readiness-polling (`urllib.request.urlopen(base + "/route")` in a retry loop) and version-marker checks work the same way.

## Static / offline tools

### A local tool must not hotlink a CDN for its core content

A "localhost" or single-file tool that pulls its essential assets (images, fonts, data) from a runtime CDN looks done in testing but renders **blank/broken the moment there's no internet or the network blocks that host** — and many networks are restricted. The localhost server itself keeps returning 200, so "it's offline" reads as a server problem when the real cause is dead external `<img>`/asset requests.

**Fix / discipline:** for any tool meant to be used locally or offline, bundle the core assets into the file. For a handful of small images, inline them as base64 data URIs (download once, build a `{url: dataURI}` map, resolve from it with the CDN as an unused fallback). Verify by blocking the CDN in the browser (e.g. `page.route('**host**', r => r.abort())`) and confirming 0 broken images — don't trust a render on a machine that happens to have connectivity.

## Deployment / Vercel

### New Vercel projects ship SSO-protected — production returns 401 until you disable it

A freshly created Vercel project can deploy with **Vercel Authentication on by default** (`ssoProtection.deploymentType = "all_except_custom_domains"`). The deploy reports `READY`, but every `*.vercel.app` URL returns **HTTP 401** and serves a `vercel.com/sso` login wall — so the public can't open it. There is no CLI flag to toggle this; use the REST API with the CLI's own token:

```bash
# token the CLI stored at login lives in the Vercel CLI's auth.json
TOKEN=$(node -e "const fs=require('fs');process.stdout.write(JSON.parse(fs.readFileSync('<path-to>/com.vercel.cli/auth.json','utf8')).token)")
# projectId + orgId(teamId) are in ./.vercel/project.json after the first deploy
curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/$PROJ?teamId=$TEAM" \
  -d '{"ssoProtection":null,"passwordProtection":null}'
```

Then re-`curl` the production alias and confirm 200 + a real app marker (not `vercel.com/sso`) before reporting done. First deploy may also fail once with a transient `"Internal Server Error" / deploy_failed` — just re-run `vercel deploy --prod`.

### A Next.js route doing slow LLM calls needs `export const maxDuration` (default 10s kills it → non-JSON page)

A Next.js App Router route handler (`app/api/.../route.ts`) defaults to Vercel's **10s** serverless function limit. A route that makes a slow LLM call (commonly ~8-14s) gets killed mid-flight and Vercel returns a **non-JSON gateway/timeout page** — so a client doing `await res.json()` throws a raw `SyntaxError` ("Unexpected token <") that surfaces to the user as a "malformed JSON" error. Fix: `export const maxDuration = 60` (and `export const runtime = 'nodejs'` if streaming a `ReadableStream`) at the top of the route. Local `next dev` ignores `maxDuration`, so this bug is **prod-only** and won't reproduce on localhost. Defense-in-depth: guard the client `res.json()` too (read `res.text()`, try/catch the parse, show a friendly message) so neither a timeout page nor a provider hiccup ever renders a raw parse error.

### Linked static site → `npx vercel deploy`, not an MCP deploy tool

For a linked static site (has `site/.vercel/project.json`), deploy with:

```bash
npx vercel deploy --prod --yes --cwd <site>
```

Deterministic against the linked project. A param-less Vercel MCP deploy tool has an ambiguous "current project" in a monorepo and can deploy the wrong subproject. Prefer the CLI.

Replace symlinks with real file copies first, then verify the production alias serves the new build (`curl` a unique marker) before reporting done — Vercel does not follow symlinks in static deployments.

### Subdirectory pages need `trailingSlash: true`

Vercel deployments with subdirectory pages (e.g., `/v1/`, `/v2/`) break relative asset paths unless `vercel.json` sets `"trailingSlash": true`. Without it, `/v2` resolves CSS/JS relative to `/`, not `/v2/`.

```json
{ "trailingSlash": true }
```

### `vercel env pull` returns empty strings for encrypted secrets

`vercel env pull --environment=production .env.local` overwrites the local file with a Vercel-formatted env file, but Encrypted-marked variables come back as `KEY=""` (empty quoted string). The CLI does NOT decrypt encrypted env vars during pull — only plain ones. The pulled file LOOKS complete (all keys present) but is missing every actual secret. The downstream feature breaks silently because empty strings are valid env values.

**Recovery options:**
- For endpoints whose URL is reproducible from a deploy command: redeploy and capture the printed URL.
- For other secrets: paste from the provider's dashboard, OR copy `.env.local` from another working checkout BEFORE running `vercel env pull`.
- NEVER use `vercel env pull` to recover a secret — it cannot return one.

If you must run `vercel env pull` for other reasons (e.g. to capture non-secret build flags like `VERCEL_GIT_COMMIT_*`), back up the local `.env.local` first and merge the diff manually.

### `BUILD_ERROR: npm install exited with 1` → deploy with `--prebuilt`

A first-time Vercel deploy on a Vite/TS site can fail at the install step with `npm error Invalid Version:` even when the local lockfile installs cleanly. Vercel's build sandbox uses a stricter npm parser than the local one and can reject lockfiles that resolve fine locally.

**Fix:** build the `.vercel/output` directory locally and deploy the prebuilt artifact — bypasses Vercel's install entirely:

```bash
npx vercel build --prod --yes        # writes .vercel/output/
npx vercel deploy --prod --prebuilt --yes
```

The `--prebuilt` flag tells Vercel "upload my output, don't run install or build." Reliable even when the standard `vercel deploy --prod` install path errors out.

### CSP — allowlist analytics beacons, and `fetch()` is `connect-src` not `form-action`

A `_headers` / response-header CSP is **only enforced on the live host** — a local `python3 -m http.server` ignores it entirely, so a too-strict CSP passes every local check and only breaks live. Always re-run the sweep against the deployed URL asserting **0 CSP violations** (console `Refused to` / `violates the following Content Security Policy`). Two common misses:

- **Analytics beacons** auto-inject a script (needs `script-src`) and beacon to a collector host (needs `connect-src`). When analytics is enabled the beacon appears with no code change, so a CSP written before enabling it blocks it.
- **`fetch()` form submissions are governed by `connect-src`, NOT `form-action`.** `form-action` only covers full-page `<form>` navigations. An AJAX form posting to a third-party endpoint needs that host in `connect-src`; allowing it only in `form-action` silently blocks the fetch.

Build the CSP against exactly what the pages load: fonts (`fonts.googleapis.com` style + `fonts.gstatic.com` font), any Maps iframe origin (`frame-src https://www.google.com`), analytics, and every `fetch` endpoint. Inline `style=""` attributes force `style-src 'unsafe-inline'`; a `<script type="application/ld+json">` block is data, NOT subject to `script-src`. Removing an unused CDN lets `script-src` stay strict with no `'unsafe-inline'`.

## npm

### Corrupted shared cache blocks `npm install`

A fresh worktree's `npm install` can fail repeatedly with `EACCES` / `EEXIST` on a file under `~/.npm/_cacache` (e.g. `npm error syscall rename … _cacache/tmp → _cacache/content-v2/…`). It persists across retries and is not a sandbox issue — the shared cache file is corrupted or contended by another concurrent npm.

Fix: install with an isolated cache dir so the bad shared cache is bypassed:

```bash
npm install --cache /tmp/npm-cache-<slug> --no-audit --no-fund
```

Don't waste cycles retrying the default cache or running `npm cache clean --force` (same permission wall). Common when multiple parallel worktree sessions install at once.

### Worktree with identical lockfile — symlink, don't reinstall

When a worktree's `package-lock.json` is byte-identical to the main checkout's (no dep changes on the branch), skip `npm install` entirely — symlink `node_modules` from the main checkout. Faster than the isolated-cache fix above, and sidesteps the EACCES path altogether.

```bash
# from inside the worktree's project dir
diff /path/to/main/projects/<x>/package-lock.json ./package-lock.json \
  && ln -s /path/to/main/projects/<x>/node_modules ./node_modules
```

Only safe when the diff is empty. If the branch adds or bumps a dep, the lockfile differs → fall back to the isolated-cache install.

### `.env.local` doesn't follow a worktree — copy into the app dir (`site/`), not the worktree root

Worktrees don't include uncommitted files, and `.env.local` is git-ignored, so a fresh worktree has no env file at all. The dev server returns "No API key" until the env lands. Next.js loads `.env.local` from `process.cwd()` of the `next dev` invocation — which for a typical layout is `projects/<name>/site/`, NOT the worktree root.

Two failure modes seen:

1. Symlinking `.env.local` at the worktree root, then `cd site && npx next dev` — Next reads cwd, file isn't in cwd, env not loaded.
2. Copying `.env.local` to the worktree root without a `cd` first (because Bash cwd reset between calls) — same outcome.

Recipe (run from worktree's `site/`):

```bash
cp /path/to/main/projects/<name>/site/.env.local .env.local
ls -la .env.local   # must be in $(pwd), not one level up
```

Symlinking from main is cleaner if you also want main-side edits to flow into the worktree, but a copy is safer when the worktree may diverge.

### Bash tool's cwd resets between calls

Each Bash tool invocation starts at a fresh cwd (typically the worktree root or the original cwd of the session) — a `cd` in one call does NOT persist to the next call. So `cd site && next dev -p 3003` works for that one server launch, but the next Bash call to `lsof` or `npm test` runs from the worktree root again. Long-running background commands keep their cwd; new Bash calls don't.

Recipe: chain everything that depends on the cwd into a single `cd <dir> && cmd1 && cmd2 && cmd3` call, OR use absolute paths, OR prefix every command with `cd <dir> &&`. The recurring failure mode is starting a dev server from `site/`, killing it later, then restarting from a Bash call that's actually at the worktree root → next finds no `app/` directory and dies with "Couldn't find any `pages` or `app` directory".

## Next.js

### Turbopack infers the wrong workspace root from a worktree path

A Next.js 16 app run from a git worktree (e.g. `.claude/worktrees/<x>/.../site`) fails at first compile: *"Next.js inferred your workspace root, but it may not be correct … files outside of the project directory will not be compiled."* Turbopack walks up for a lockfile and picks a parent above the app, so the page never serves (dev) or the build aborts.

Fix: pin the root in the app's `next.config.mjs`:

```js
import { fileURLToPath } from 'node:url'
const nextConfig = { turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) } }
```

Deterministic regardless of checkout location; valid with `noEmit`/SWC builds. Pin this in any Next 16 app expected to run from a worktree.

### `next build` corrupts a live `next dev` server's `.next`

Running `npm run build` (or `next build`) while a `next dev` server is still serving the same directory overwrites `.next` with production artifacts. The dev server then can't resolve its own client chunks: symptoms range from a half-render (shell paints, dynamically-imported components never hydrate) to a hard `500` with `Error: Cannot find module './<NNN>.js'` showing the Next error overlay or a blank/white screen — and it is INTERMITTENT (only requests needing a clobbered chunk fail, so it comes and goes). Looks like a code regression; it's the clobbered `.next`. **This bites most often via a "just verify the production build" step run mid-session** — running `next build` as a verification while the session's own dev server is up is the exact trap.

A worse fingerprint of the same family: `GET /route` returns **200** but **every** `/_next/static/chunks/*.js` returns **404**, so the document title paints but `document.body.innerText` is empty and nothing hydrates — total blank page, not a half-render. A `next build` is not required to cause it: a stale/corrupted webpack pack cache (the dev log spews `PackFileCacheStrategy … doesn't lead to expected result` warnings) after a heavy merge + long-lived dev process produces the identical all-chunks-404 blank. Same fix — `rm -rf .next` + restart `next dev`. Confirm recovery by asserting a real rendered DOM node mounts and console errors are 0, not just that the route returns 200 (a 200 with 404'd chunks is the broken state).

Fix: never `build` against a dir with a live dev server. Sequence the production-build check BEFORE starting the dev server for the session, or stop the dev server first (or build in a separate worktree/port). If it already happened: kill the dev server's LISTEN process only (not the browser's ESTABLISHED connections that also show on `lsof -ti :<port>`), `rm -rf .next`, restart `next dev`, re-warm.

### `next dev` route table wedges after long HMR + eval cycles → `/api/*` returns 404

A long-running `next dev` process eventually loses its API-route registration after many file edits + HMR triggers. The route file still exists on disk and still compiles cleanly (the dev log shows `✓ Compiled /api/foo in 26ms`), but every subsequent POST returns 404 in milliseconds — far faster than a real handler would respond. The tell in the dev log is a `✓ Compiled /_not-found in 267ms (1523 modules)` line interleaved with the API hits; from that line onward, the route is gone. This recurs on long sessions that run 20+ request batches against the same route.

**Recovery:** stop the dev server, `rm -rf .next`, restart `next dev`. Route table rebuilds clean.

**Prevention:** for any session that mixes many file edits with batch evals against the same route, plan a mid-session restart at a clean checkpoint. Don't trust silence — verify with a real round-trip curl before declaring an eval result.

### React StrictMode double-invokes state updaters — keep them pure (or every action fires twice in dev)

`reactStrictMode` defaults to **true** in Next 13+ App Router. In dev (only), React intentionally double-invokes `useState`/`useReducer` updater functions to surface impurity. If an updater has side effects, they run twice — and if one of those side effects is *another* `setState`, the two invocations can both commit. Symptom: every keypress places TWO items. Root cause in one case: a `setState(prev => { const next = apply(prev); pushHistory(prev, next); return next })` whose `pushHistory` itself called `setState(next)` — a re-entrant update *inside* the updater. **Prod (StrictMode off) was unaffected** — but localhost dev previews show it, so it reads as a hard bug.

**Rule:** state updaters MUST be pure — no `setState`, no ref mutation that another path reads, no stateful id generation relied upon for the commit. If every caller already `return`s the new value, a nested `setState` is redundant → make the helper record-only. Verify any "add one" action by triggering it ONCE and asserting the count rose by exactly one (a Playwright probe counting the real elements catches it; unit tests of the pure reducer do not).

## React

### `onClickCapture` does not fire when a descendant's native handler calls `e.stopPropagation()`

React 17+ delegates synthetic events at the React root, in the **bubble** phase. A native `addEventListener('click', …)` attached to a descendant DOM node fires *before* the bubbling click reaches the React root — and if that native handler calls `e.stopPropagation()`, the native event never reaches the root, so React never dispatches any synthetic event (capture **or** bubble) to any ancestor. The result: an `onClickCapture` on a parent that you expect to intercept every click silently never fires for clicks inside that descendant. Fix: don't rely on a React capture handler as a backstop — fix the leaf handler instead (have its own click handler commit the action), or attach a true-native capture listener at `document`/`window` with `addEventListener('click', fn, true)` if you genuinely need an above-everything intercept. React's synthetic `e.stopPropagation()` also only stops *synthetic* propagation; to stop native bubbling from inside a React handler, use `e.nativeEvent.stopImmediatePropagation()`.

### A click is dropped when the element under the cursor is rebuilt between mousedown and mouseup

Chromium only fires a `click` when the mousedown and mouseup targets share a common ancestor. If a re-render replaces the element under the cursor between the two presses, there is no common ancestor and the browser dispatches NO click at all — the action is silently dropped and the only symptom is "I had to click twice." This happens when a render routine does `div.innerHTML = ''` then rebuilds child nodes on every hover/ghost re-render, so a hover landing mid-press orphans a few percent of clicks. Fix: make the volatile rendered layer ignore pointer events (`el.style.pointerEvents = 'none'`) so mousedown/up/click always target the STABLE container that carries the listeners. Safe whenever hit-testing is coordinate-based (compute coords + DOM hit-test) rather than dependent on a child being the event target — and it produces an EMPTY boundary trace (no handler fires), the signature that separates it from a handler-logic bug.

## Shell / macOS environment

### macOS has no GNU `timeout`; zsh uses `$pipestatus`, not `${PIPESTATUS[0]}`

`timeout <n> <cmd>` is GNU coreutils — **not present on stock macOS**. `timeout 240 npx tsc` does not run the command; it dies with `command not found: timeout`, and a trailing `| tail` masks the failure so the pipeline reads as green (exit 0 from `tail`). To bound a long command's runtime: prefer the Bash tool's own `timeout` parameter; otherwise `( cmd ) & p=$!; ( sleep N && kill $p ) &`, or install coreutils and use `gtimeout`. Never wrap a verification command in `timeout` on macOS.

Separately, in **zsh** the pipe-status array is `$pipestatus` (lowercase, **1-indexed**); `${PIPESTATUS[0]}` (bash, 0-indexed) is empty there, so a guard like `${PIPESTATUS[0]:-$?}` silently falls back to `$?` = the *last* pipe element's status (usually `tail`/`grep` = 0) and reports a pass that never happened. Capture a specific stage in zsh with `cmd | tail; echo ${pipestatus[1]}`. Always confirm a tool's real exit code before claiming it passed.

### When the Bash tool runs under zsh — no bash arrays, no auto word-splitting

If the Bash tool's shell is zsh (common on macOS), bash-isms fail in two silent ways. (1) `declare -A m=(...)`, `${!m[@]}`, and prefix expansion like `${arr[@]/#/refs/tags/}` raise `bad substitution` — zsh associative arrays use `typeset -A` and `${(k)m}`, and there is no `${arr[@]/#/x}` form. (2) **zsh does not word-split unquoted variables.** `for x in $PAIRS; do …` iterates *once* over the whole string, not over each word — a real bug where a loop creates a tag named for the last entry pointing at the first entry's commit. For any loop over a list, either force splitting with `${=VAR}` / `setopt sh_word_split`, or — safer for a small fixed set — drop the loop and write each command explicitly. Always verify the result of a scripted batch (e.g. `git for-each-ref` after creating tags) before acting on it.

### macOS permanently holds ports :5000 and :7000 (ControlCenter / AirPlay Receiver)

On macOS, `ControlCenter` (the AirPlay Receiver) listens on `*:5000` **and** `*:7000` whenever AirPlay Receiver is enabled (the macOS default). A dev server bound to 5000 either fails to bind or — worse — the browser silently hits Apple's AirTunes service and gets confusing `403`s. Never pick 5000 (or 7000) as a project's main port or any dev port. Confirm with `lsof -nP -iTCP:5000 -sTCP:LISTEN` (shows `ControlCe`). To actually free 5000: System Settings → General → AirDrop & Handoff → AirPlay Receiver → Off.

## Claude Code / MCP

### `/doctor` "setup issue: MCP" → an HTTP MCP server's bearer-token env var is unset

When `/doctor` flags an MCP setup issue, run `claude mcp list` to see which server is `✗ Failed to connect`. HTTP MCP servers that authenticate with a header like `Authorization: Bearer ${SOME_TOKEN}` fail silently when that env var is unset — they send an empty token and the handshake fails. Diagnose with `claude mcp get <server>` (shows the header) and check the var. Fix: store the token in the `env` block of `~/.claude/settings.json` (global, not the repo) — more reliable than a shell rc file because Claude Code injects it regardless of launch method, and it's where MCP `${VAR}` headers resolve from. **MCP servers connect at startup, so a restart is required** before the server reconnects and the warning clears. Validate a token before storing it (a quick authenticated `curl` against the provider's API: `200` = good). A `Needs authentication` status (vs `Failed to connect`) is a separate, benign OAuth-not-signed-in state — ignore unless you actually use that server.

### A `context-mode`-style plugin intercepts `curl`/`wget` in Bash

With a context-mode plugin active, plain `curl`/`wget` in the Bash tool get redirected to a guidance message instead of executing (even with `dangerouslyDisableSandbox`). To make a raw HTTP call, use `command curl ...` inside the plugin's shell-exec primitive (e.g. `ctx_execute(language: "shell")`), or call the plugin's fetch primitive (e.g. `ctx_fetch_and_index`).
