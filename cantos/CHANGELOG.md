# Changelog

All notable changes to the cantos plugin are documented here. This project follows [semantic versioning](https://semver.org).

## 1.0.0 — 2026-06-16

Initial public release.

- One-command install as a self-marketplace: `/plugin marketplace add ne11nn/cantos-plugin` then `/plugin install cantos@cantos-plugin`.
- `/cantos:init` scaffolds the full writable system into a project (refusing on any file collision) and runs a setup interview to personalize it.
- `/cantos:start` runs the orchestrator for one session without writing anything.
- SessionStart hook announces the system and stays silent inside an already-scaffolded checkout.
- Surfaced skills (design and UI, motion, frontend engineering, codebase architecture, research, writing-craft) and the `browser-agent`; the full system and all skills ship under `system/`.
