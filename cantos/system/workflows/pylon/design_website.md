# design_website

Runs the full pipeline from a brief (business/topic name, optional reference URL) to a production-ready, locally-served website. Use when the user wants a polished site built end to end — a landing page, portfolio, marketing site, or any single-page web build that should reach finished quality, not a rough draft.

**This workflow routes through pylon's non-negotiable gates in order.** It is not a shortcut around them. Each phase below maps to a gate in `.assistants/pylon/pylon.md`; do not skip a gate because the brief looks small. If the work is genuinely trivial (one-line CSS, a copy nudge, a contained bugfix), this is the wrong workflow — make that call and edit directly.

---

## Inputs

| Input | Required | Description |
|---|---|---|
| `TOPIC` | Yes | What the site is for — a business name, project, person, or product. Drives the slug and the content. |
| `REFERENCE_URL` | No | An existing website or page to research for brand, tone, services, or visual cues. |
| `REFERENCE_IMAGE` | No | A screenshot, mockup, or inspiration image the build should match. If present, the Visual Verification Gate (Phase 6) is mandatory. |

The localhost port is NOT an input. It is allocated in Phase 1 per pylon's Localhost Port Allocation gate — never hard-code `3000` or any default.

If the user gives a verbal request without these, infer `TOPIC` from the request and ask whether there's a reference URL or reference image to research before building.

---

## Output

- `projects/<slug>/context.md` — project context generated from `.claude/templates/context-template.md`, including Owner, Constraints, the `## Active Issues` block, and the port-allocation metadata
- `projects/<slug>/brief.json` — name, category, services, brand colors, tone (from research)
- `projects/<slug>/brand_assets/` — folder with logo, images (if any found)
- `projects/<slug>/inspiration/` — folder holding any reference image in scope (Visual Verification Gate)
- `projects/<slug>/site/index.html` — the designed website, ready to serve
- `.tmp/screenshot-*.png` — preview-gallery and verification screenshots (never committed)
- **Closing Report to the user** — pylon's Closing Report format, leading with the live `http://localhost:<main port>` URL

---

## Steps

### Phase 0: Pre-Task Gate (isolation)

Before writing or editing any project file, satisfy pylon's **Pre-Task Gate**:

1. Run `git worktree list` and `git status`.
2. If already in a linked worktree, proceed. Otherwise create one (`git worktree add ../<slug> -b <slug>`) and do all build work there.
3. Surface to the user first if there are unmerged worktree branches AND main has uncommitted WIP touching their files.

All build code in this workflow lives on the worktree branch. Documentation (`projects/<slug>/context.md`, `decisions/log.md`) commits to `main` per pylon's "How to Operate" rule 1.

### Phase 1: Allocate and register the port band (Localhost Port Allocation gate)

1. Derive the project slug from `TOPIC` — lowercase, hyphenate, no spaces or special characters (e.g. "Dream Studio Production" → `dream-studio`).
2. Allocate the project's localhost digit `n` (1–9). Check pylon's allocation registry (the table in `.assistants/pylon/pylon.md` → Localhost Port Allocation) for digits already taken; pick the lowest free one. This fixes the whole `n000`–`n999` band:
   - **`n000`** — main port, the constant canonical live preview of the finished build. The finished site lands here (Phase 6). Never killed.
   - **`n001`–`n999`** — worktree band. The direction previews (Phase 3) and the in-progress build serve here, on the lowest free port (`lsof -i :<port> | grep LISTEN` first).
3. Register the allocation in BOTH places, in the same edit:
   - Add a row to pylon's allocation registry table (`Project | Digit | Main port | Worktree band`).
   - Mirror that one line into `projects/<slug>/context.md` (written in Phase 2).
4. Read the port from the registry table, never from a session/compaction summary.

### Phase 2: Generate the project context

1. Create the project folder `projects/<slug>/`.
2. Generate `projects/<slug>/context.md` from `.claude/templates/context-template.md`. Fill, at minimum:
   - **Project** — the topic name.
   - **Agent owner** — pylon.
   - **Objective** — what the site is for, one line.
   - **Current stage** — "Design direction (awaiting user pick)" at this point.
   - **Owner** — who the site is for (the user, or the client/stakeholder whose vision the build must honor).
   - **Constraints** — any standing requirements stated so far (brand colors, banned patterns, must-have sections, tone). These are durable rules; persist them here the moment the user states them (pylon's Live Rule Capture gate).
   - **Port metadata** — the project's digit, main port (`n000`), and worktree band, mirrored from Phase 1's registry row. Also note the app's tab dev-label abbreviation + env var so worktree-band tabs are self-identifying.
   - **`## Active Issues`** — the mandatory block from the template. Seed it with the live open thread, e.g. `- [OPEN] Awaiting user direction pick before build code is written. (since <date>)`.

### Phase 3: Research

1. Build `projects/<slug>/brief.json` with the fields the build needs: `name`, `category`, `services` (or key offerings/sections), `tone`, `colors`.
   - If `REFERENCE_URL` is given, validate it is reachable, then fetch it (WebFetch) and pull brand tone, services, palette, and any logo/imagery. If invalid, note it in `context.md` and proceed on `TOPIC` alone.
   - Otherwise use WebSearch to gather what the site needs about `TOPIC`.
   - Save any usable logo or imagery to `projects/<slug>/brand_assets/` (create the folder even if empty).
   - If `REFERENCE_IMAGE` was provided in the repo root this session, `git mv` it into `projects/<slug>/inspiration/` now (Visual Verification Gate, step 1).
2. **Enrichment check.** If the brief has fewer than 3 key services/sections or `tone` is missing, use WebSearch to fill the critical gaps only — do not rewrite the brief. Note enrichment in `context.md`.

### Phase 4: Design Direction Gate (Non-Negotiable — user picks before build code)

Run pylon's **Design Direction Gate**. Build code cannot be written until the user picks.

1. Route the design skills: consult `references/ui-skill-routing.md`, then run `impeccable shape` — discovery interview, then visual-direction probes. Render the directions, never just describe them. Obey `references/ui-anti-slop.md`.
2. Serve **3–4 distinct directions** (each with its own color, typography, style anchors, and a real example layout drawn from the brief) as one side-by-side gallery on the **worktree-band port** (never `n000`). `curl`-confirm the gallery responds, then hand the user the `http://localhost:<band port>` URL.
   - For 3D / video / heavy-interaction surfaces where quarter-size tiles are unevaluable, use the equivalent form: a top-of-app variant switcher driving `data-layout` over the same live app, so each direction gets the full canvas. State which form you used in one line.
3. **WAIT for the user to pick.** The user picks a whole direction or mixes per axis. A direction matched in your head is not a substitute — do not write build code until the pick lands.
4. Record the chosen direction in `projects/<slug>/context.md` and update Active Issues (the "awaiting direction pick" thread is now resolved; replace it with the build thread).

### Phase 5: Build the selected direction (website-builder sub-agent)

1. Spawn the `website-builder` sub-agent (`.assistants/pylon/sub-agents/website-builder.md`) with:
   - `BRIEF_PATH`: `projects/<slug>/brief.json`
   - `SITE_DIR`: `projects/<slug>/site/`
   - `BRAND_ASSETS_DIR`: `projects/<slug>/brand_assets/`
   - `CHOSEN_DIRECTION`: the direction (or per-axis mix) the user picked in Phase 4
   - `PORT`: the **worktree-band** port from Phase 1 (the build serves on the band while it is in progress, not on `n000`)
2. Wait for completion. The sub-agent builds only the chosen direction, uses real brief data, runs its own screenshot feedback loop (min 2 rounds, max 3), and **leaves its dev server live** on the band port — it does not kill the server.
3. Verify output:
   - `projects/<slug>/site/index.html` exists.
   - The band-port server is live (`curl -sf http://localhost:<band port>` returns the page).
   - At least 2 screenshot rounds were completed and the chosen direction is documented.

### Phase 6: Visual Verification Gate (only if a reference image is in scope)

If `REFERENCE_IMAGE` (or any image in `projects/<slug>/inspiration/` or referenced in `context.md`) is in scope, run pylon's **Visual Verification Gate**:

1. List every reference image in scope.
2. Playwright-screenshot the current build at the relevant viewport (save to `/tmp/`, not the repo).
3. In the same response, read the reference image AND the screenshot, and write out the deltas explicitly — typography, spacing, layout, color, density, structural elements.
4. If any delta exists, iterate (change code → re-screenshot → re-diff) until the deltas are gone or the user explicitly accepts the remaining ones.
5. Cannot report done until step 3 has been performed at least once this task.

If no reference image is in scope, skip this phase and say so in the Closing Report.

### Phase 7: Go live on the main port + Closing Report

1. Once the build is accepted, bring it live on the project's **`n000` main port** so the user has the canonical preview. Start (or restart) the main-port server against `projects/<slug>/site/` and `curl -sf http://localhost:<n000>` to confirm it responds. Leave both the band server (still active session) and the `n000` server running — never kill `n000`.
2. Per pylon's "How to Operate" rule 1: the build stays on the worktree branch (committed + pushed), NOT merged to `main`. Documentation edits (`context.md`) go to `main`. Do not offer to merge — merging is a dedicated consolidate session (`workflows/pylon/consolidate_worktrees.md`).
3. Post pylon's **Closing Report**:
   - **Live at** — `http://localhost:<n000>` (the finished build), curl-confirmed. Also state the band port if the worktree server is still up.
   - **What changed** — the site that now exists, in plain language, plus the chosen aesthetic direction in one sentence.
   - **Saved** — branch + pushed yes/no; note that the task session does not merge to `main`.
   - **What's next** — remaining work or "nothing outstanding."
   - **Behind the scenes** (skip if no problems) — problems hit + fixes + what proved them, and where each guard was logged so it can't recur.

---

## Checklist

- [ ] Pre-Task Gate satisfied — build work is in an isolated worktree
- [ ] Project digit allocated and registered in pylon's allocation table AND mirrored in `context.md`
- [ ] `projects/<slug>/context.md` generated from the template with Owner, Constraints, port metadata, and a seeded `## Active Issues` block
- [ ] `brief.json` written with core fields (name, category, services, tone, at least 1 color)
- [ ] Brand assets folder created (even if empty); reference image moved to `inspiration/` if provided
- [ ] Design Direction Gate run — 3–4 directions served on the band port, curl-confirmed, URL handed over
- [ ] User PICKED a direction before any build code was written
- [ ] `website-builder` built only the chosen direction; `index.html` written; band server left live
- [ ] At least 2 screenshot rounds completed
- [ ] Visual Verification Gate run if a reference image is in scope (deltas written out)
- [ ] Finished build live on `n000`, curl-confirmed; `n000` never killed
- [ ] Closing Report posted, leading with the live `n000` URL

---

## Notes

- If `TOPIC` has special characters, sanitize to a lowercase hyphenated slug (e.g. "A&B Studio Inc." → `ab-studio`).
- The reference URL is optional; research still proceeds on `TOPIC` alone.
- Brief enrichment is lightweight — fill critical gaps only, do not rewrite.
- The website-builder iterates up to 3 rounds; if issues remain after 3, report as "design phase complete, ready for feedback" and keep the band server live.
- Once the user sees the site they can request changes; log feedback and any durable constraint in `projects/<slug>/context.md` the moment it is stated (Live Rule Capture gate).
- Never hand the user a band-port URL whose tab is indistinguishable from `n000` — set the dev-label env var (Phase 2 port metadata).

---

## Self-Improvement

After each run:

1. **Design quality:** Did the chosen direction match the topic's category and tone?
2. **Gate adherence:** Did the user actually pick before build code was written? If not, the Design Direction Gate leaked — tighten it.
3. **Iteration count:** Did the build take 2 rounds or 3? Why?
4. **Research accuracy:** Did research get all needed fields from the reference URL or web?
5. Update this file if a step consistently fails or a new pattern emerges (e.g. "always add a portfolio section for production companies").

**Known issues & workarounds:**
- (None yet — will be updated after first runs)
