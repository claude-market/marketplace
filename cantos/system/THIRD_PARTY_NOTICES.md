# Third-Party Notices

The MIT [LICENSE](LICENSE) in this repository covers the Cantos system's own files — `CLAUDE.md`, the assistant brain files, workflows, tools, references, rules, and templates authored for this project. It does **not** blanket-relicense the third-party skills vendored under `.claude/skills/`. Each bundled skill keeps whatever license and provenance it shipped with; this file catalogs what each one declares, taken directly from its `SKILL.md` frontmatter and credits.

Where a skill declares no license, it is bundled as-is, its provenance is unverified, and it is **not** covered by this repository's MIT grant. Treat those as "verify before reuse" — confirm the original source and license yourself before redistributing them or building a commercial product on top of them. If you are unsure about a skill, the safe move is to delete it from `.claude/skills/` before you publish or ship.

## Skills with a declared license or provenance

| Skill | License | Provenance / credit |
| --- | --- | --- |
| `impeccable` | Apache 2.0 | Declared in frontmatter: "Based on Anthropic's frontend-design skill." |
| `ux-heuristics` | MIT | Declared in frontmatter (`author: wondelai`). Credits in the skill body: based on usability principles from Steve Krug (*Don't Make Me Think*) and Jakob Nielsen's *10 Usability Heuristics for User Interface Design* (Nielsen Norman Group). |

## Skills bundled as-is (no declared license, provenance unverified)

The following skills ship without a license field in their `SKILL.md` frontmatter. They are bundled as-is and their provenance is unverified. Verify the original source and license before commercial reuse:

- `ai-detect`
- `design-sub-agent`
- `design-taste-frontend`
- `emil-design-eng` (encodes design philosophy attributed to Emil Kowalski; no license declared)
- `full-output-enforcement`
- `generate-daily-schedule`
- `gpt-taste`
- `grill-with-docs`
- `high-end-visual-design`
- `improve-codebase-architecture`
- `market-research`
- `minimalist-ui`
- `motion-animations`
- `name-session`
- `nodejs-expert`
- `playwright-cli`
- `redesign-existing-projects`
- `scroll-video`
- `skill-builder`
- `ui-refactor`
- `ui-ux-pro-max`
- `wrap`
- `write-like-me`

Several of these encode named methodologies or individuals' published philosophies (for example `emil-design-eng`, and the various design-taste skills). Naming a person or framework is attribution, not a license grant. If you redistribute or build a commercial product on top of these, trace each skill back to its origin and confirm you have the right to do so.

## Runtime and external services

- **Claude Code** by Anthropic is the runtime. Cantos is an architecture pattern layered on top of it, not a fork.
- Some tools and skills call external services that have their own terms (for example GPTZero for the optional AI-detection step, and the NVIDIA NIM Flux endpoint for image generation). Those services are not part of this template and are governed by their own terms of use.

## Reporting

If you believe a bundled skill is misattributed or its license is stated incorrectly here, open an issue on the repository so it can be corrected.
