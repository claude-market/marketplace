# UI Skill Routing

Pylon consults this before any UI task. The blocking exclusion rules live in Pylon's brain-file `## UI Skill Routing (Non-Negotiable)` gate; this file is the lookup table. "Use the UI skills" means route per this table — never bulk-invoke the whole pile (the aesthetic skills issue contradictory mandates).

Load mode: on-demand.

## Decision table

| Task type | Primary (drives) | Support | Notes |
|-----------|------------------|---------|-------|
| New UI build from scratch | `impeccable` | one aesthetic skill only if a direction is named; `full-output-enforcement` for spotless mandates | With zero project context, run `impeccable` on its defaults. `ui-ux-pro-max` optional up front for palette/style/stack ideas. |
| Polish / harden existing build | `impeccable` (polish/harden) | `emil-design-eng`, `ui-refactor` | Impeccable's strongest native lane. |
| Redesign shipped client site | `redesign-existing-projects` | one aesthetic skill as the target look; `ux-heuristics` if usability is in scope | Not `impeccable` — workflow-driver collision. |
| Tactical fix (spacing/color/hierarchy) | `ui-refactor` | `ux-heuristics` | Do not escalate to an aesthetic skill for a localized fix. |
| Usability / heuristic audit | `ux-heuristics` | `ui-refactor` (for the visual fixes it defers) | Pure audit; no aesthetic skill. |
| Motion / scroll choreography | `motion-animations` (Framer) or `gpt-taste` (only if GSAP scrolltelling is explicitly wanted) | `emil-design-eng`; `scroll-video` only for scroll-scrubbed video | Pick exactly one motion engine. |
| Spotless / no-placeholder output | layer `full-output-enforcement` | — | Always-safe add-on, conflicts with nothing. |

## Aesthetic-skill selection

At most one per session. Pick by named direction:

- `minimalist-ui` — editorial/restraint, warm-monochrome, serif heroes.
- `high-end-visual-design` — agency-premium, cinematic, double-bezel.
- `design-taste-frontend` — Vercel-core React, dial-driven, Framer.
- `gpt-taste` — GSAP editorial/maximal, AIDA structure.

When no direction is named, read the intended aesthetic from `projects/<name>/context.md`. Never guess and never stack two.

## Always-safe to layer

`full-output-enforcement`, `ui-refactor`, `ux-heuristics`, `emil-design-eng` (as a motion-quality lens), `motion-animations` (within the Framer path). These never conflict with the primary.

## Every UI task

Obeys `references/ui-anti-slop.md` regardless of which skills route in.
