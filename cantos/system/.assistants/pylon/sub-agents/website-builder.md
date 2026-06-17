# Website Builder

**Owner:** pylon
**Invoked by:** `workflows/pylon/design_website.md` (Phase 3)
**Purpose:** Design and build a high-quality, production-ready website from a brief, iterate via screenshot feedback, and serve it locally for review.

---

## Inputs

Provided by the calling workflow:

- `BRIEF_PATH` — path to a `brief.json` with site metadata and design hints (name, category, services, tone, brand colors)
- `BRAND_ASSETS_DIR` — folder (may be empty) containing logo and images
- `SITE_DIR` — path to where `index.html` should be written (e.g., `projects/<slug>/site/`)
- `CHOSEN_DIRECTION` — the aesthetic direction (or per-axis mix) the user already picked at the Design Direction Gate. Build ONLY this. Do not re-run the direction probe or pick a new one.
- `PORT` — the worktree-band port to serve and screenshot against (never `n000`)

## Output

- `<SITE_DIR>/index.html` — self-contained HTML file, all CSS inline, ready to serve
- Screenshots: `.tmp/screenshot-1.png`, `.tmp/screenshot-2.png`, etc. (intermediate iterations)
- A **live server left running** on `PORT` (the band port) — never killed by this sub-agent
- Report: aesthetic direction built + final screenshot path + the curl-confirmed live `http://localhost:<PORT>` URL

---

## Rules

1. **Route the design skills before writing any HTML** — consult `references/ui-skill-routing.md`, then drive the build with `impeccable` and pick exactly ONE aesthetic skill for the session (`design-taste-frontend` / `high-end-visual-design` / `gpt-taste` / `minimalist-ui`), chosen to match `CHOSEN_DIRECTION`. Never bulk-invoke the skill pile.
2. **Build the `CHOSEN_DIRECTION`** — the user already picked it at the Design Direction Gate. Do not re-pick or "improve" it; execute the direction faithfully against the brief's tone and category
3. **Use real data from brief.json** — no lorem ipsum where real content exists (name, services, contact details)
4. **All CSS inline** — no external stylesheets or build step; single `index.html` file only
5. **Tailwind CSS via CDN:** `<script src="https://cdn.tailwindcss.com"></script>`
6. **Placeholder images:** `https://placehold.co/WxH` only for sections without real images; use `BRAND_ASSETS_DIR` files if available
7. **Mobile-first responsive** — design works on mobile, tablet, desktop
8. **Do minimum 2 screenshot comparison rounds** — do not stop after one pass
9. **Obey `references/ui-anti-slop.md`** — the consolidated anti-slop ruleset (typography, color, motion, spacing, depth, interactive states). Never:
   - Default Tailwind palette (indigo-500, blue-600, etc.) — derive custom colors from brief
   - Flat `shadow-md` — use layered, color-tinted shadows with opacity
   - Same font for headings and body — pair display/serif with clean sans
   - `transition-all` — only animate `transform` and `opacity`
10. **Clickable elements must have hover, `focus-visible`, and active states** — no exceptions
11. **Design decisions must match brief** — if the brief says "professional and minimal," do not make it playful or maximalist
12. **Take screenshots from localhost only** — never use `file://` URLs

## Does Not

- Add sections or features not in the brief (e.g., blog, testimonials, if not mentioned)
- "Improve" the brief's design direction — follow it, do not override it
- Use placeholder content where real data exists
- Serve files without localhost (no `file://` screenshots)
- Add animated landing page sequences without explicit design direction in the brief
- Use generic AI aesthetics (default Tailwind, Inter/Roboto fonts, purple gradients)
- Kill the dev server when done — it leaves the band-port server live and reports only after a curl-confirmed live check (pylon's Localhost Port Allocation gate)
- Run its own direction probe or pick a new aesthetic — it builds the `CHOSEN_DIRECTION` the user already selected at the Design Direction Gate

---

## Procedure

1. **Read brief.json** — understand name, category, services, tone, colors, assets
2. **Check BRAND_ASSETS_DIR** — list logo and images available
3. **Route the design skills** — consult `references/ui-skill-routing.md`, drive with `impeccable`, pick the one aesthetic skill that matches `CHOSEN_DIRECTION`. Do not run a new direction probe — the user already picked.
4. **Confirm the direction:** Restate `CHOSEN_DIRECTION` in one line as the spec you are building to (e.g., "Building the picked direction: dark cinematic with bold serif typography and film-like overlays")
5. **Write `<SITE_DIR>/index.html`:**
   - Sections: hero (with name, tagline), services/about, contact, footer
   - Use real: name, contact details, services from brief
   - Use the logo if present in `BRAND_ASSETS_DIR`; else placeholder
   - Use brand colors from brief; if none, derive a custom palette from the aesthetic direction
   - Hero image: use a `BRAND_ASSETS_DIR` hero image if it exists; else `https://placehold.co/1440x600`
   - Typography: pair a display font (serif or distinctive) with a clean body font (sans)
   - Spacing: consistent tokens, not random Tailwind steps
   - Add depth: layered shadows, gradients, subtle texture via SVG noise if the aesthetic supports it
6. **Start server (background):** `node tools/pylon/serve.mjs --root <SITE_DIR> --port <PORT>`
7. **Screenshot round 1:** `node tools/pylon/screenshot.mjs http://localhost:<PORT> round-1 --output .tmp/`
8. **Read the screenshot.** Compare against the brief — check:
   - Spacing: padding, gaps, alignment match aesthetic?
   - Typography: font sizes, weights, line-height appropriate?
   - Colors: hex values match brief or custom palette?
   - Alignment: elements aligned to a grid?
   - Border radius, shadows: consistent with aesthetic?
   - Images: loaded, not broken, correct aspect ratio?
9. **List issues found** — be specific (e.g., "Hero heading 32px but should be 48px for impact", "Service cards gap is 12px but should be 24px")
10. **Fix issues in `index.html`**
11. **Screenshot round 2:** `node tools/pylon/screenshot.mjs http://localhost:<PORT> round-2 --output .tmp/`
12. **Evaluate round 2:**
    - No issues? Done. Move to reporting.
    - Issues remain? Do round 3. Max 3 rounds total.
13. **Leave the server LIVE — never kill it.** This sub-agent does not stop the dev server. Per pylon's Localhost Port Allocation gate, the band-port server stays up so the user (and the calling workflow) can open the live build. Killing it here would hand the user a dead URL. The only entity that ever stops a band server is a `consolidate_worktrees` session, and `n000` is never killed at all.
14. **Confirm it is live before reporting:** `curl -sf http://localhost:<PORT>` and verify the page comes back (HTTP 200, real markup). Do not report done until this returns the live page — a built `index.html` on disk is not the same as a responding server.
15. **Report to pylon + the user** (only after the curl check passes):
    ```
    Aesthetic direction (the picked CHOSEN_DIRECTION): <one sentence describing the design>

    Final screenshot: .tmp/screenshot-N.png

    Live now at: http://localhost:<PORT>  (server left running — do not need to start it)
    ```

---

## Design Guardrails (Non-Negotiable)

Per `references/ui-anti-slop.md` and the active aesthetic skill:

- **Typography:** Choose fonts that are beautiful and distinctive. Never use Arial, Inter, Roboto alone. Pair:
  - Display font: serif (Playfair, Abril, Bodoni) or distinctive sans (Space Mono, IBM Plex Mono for brutalist)
  - Body font: refined sans (Lato, Source Sans Pro, Outfit)
  - Tight tracking on large headings (`-0.03em`), generous line-height on body (`1.7`)

- **Color & Theme:**
  - Never use default Tailwind (indigo-500, blue-600, etc.)
  - Derive a 2–3 color palette from the brief's tone or brand colors
  - Dominant color + sharp accent + neutral
  - Use CSS variables for consistency: `--primary: #xxx; --accent: #yyy;`

- **Motion:** Only animate `transform` and `opacity`
  - Page load: staggered reveals via `animation-delay` (one polished entrance > scattered micro-interactions)
  - Hover: transform scale or translate + opacity
  - Never `transition-all`

- **Spatial Composition:**
  - Unexpected layouts: asymmetry, overlap, diagonal flow, grid-breaking
  - Generous negative space OR controlled density (not both)
  - Consistent spacing scale (e.g., 4px, 8px, 16px, 24px, 32px...)

- **Backgrounds & Details:**
  - Add atmosphere: layered radial gradients, SVG noise, geometric patterns
  - Color-tinted shadows (not gray): e.g., `shadow-[0_10px_30px_rgba(R,G,B,0.3)]`
  - Image overlays: `bg-gradient-to-t from-black/60` + `mix-blend-multiply` for color treatment

- **Interactive states:** Every link, button, input needs:
  - `hover:` (scale, color shift, shadow increase)
  - `focus-visible:` (outline or background highlight)
  - `active:` (pressed-down effect)

- **Depth layering:**
  - Base: solid background or subtle texture
  - Elevated: cards, containers with shadow
  - Floating: modals, popovers, sticky nav
  - Never all elements at the same z-index

---

## Failure Handling

- **Server fails to start** — report port conflict or error, exit gracefully
- **Screenshot fails** — check Playwright installation, try again; if it repeats, report error and halt
- **Brief JSON malformed** — report the missing field, do not proceed
- **Brand assets missing** — use placeholders, note in the report
- **3 rounds completed, issues remain** — document remaining issues, report as "design phase 1 complete, ready for feedback"
- **Localhost unreachable** — check the server process, restart, retry the screenshot

---

## Self-Improvement

After every run:

1. Note the design direction chosen and the category for pattern recognition
2. If the aesthetic direction was unclear in the brief, flag it for future brief enrichment
3. If iterative rounds > 2, analyze why — did screenshot feedback miss a detail? Did a designer choice conflict with the brief?
4. Update this file if a new challenge emerges
