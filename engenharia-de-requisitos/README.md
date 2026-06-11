# Engenharia de Requisitos (Requirements Engineering)

**Loads canonical knowledge of Requirements Engineering, Business Analysis, and Professional Ethics into any Claude Code session — the stage BEFORE code (discover what to build) and AFTER (validate it was built right).**

## Overview

A single, self-contained **skill** that condenses a full university Requirements Engineering course plus the canonical bibliography of the field into an immediately usable methodology. It is not a code-generation plugin — it is the discipline that decides *what* to build and *whether the right thing was built*.

Built from:

- The 11-lecture **ERS course** of *IFPB* (Instituto Federal da Paraíba), Campus João Pessoa, by **Prof. Dr. Juliana Dantas Ribeiro Viana de Medeiros** ([Lattes](http://lattes.cnpq.br/9730254173461923) · [ORCID](https://orcid.org/0000-0001-8387-4616)) — whose doctoral thesis is *"An approach to support the Requirements Specification in Agile Software Development."*
- The canonical bibliography: **Sommerville** 10e (Ch. 4 + Part 2 dependability/security), **Pressman**, **Wiegers & Beatty**, **Cohn** (*User Stories Applied*), **Robertson** (VOLERE), **Hull/Jackson/Dick**, **Falbo** (UFES), **BABOK v3**, and the **SBC 002/2024** Code of Ethics.

## What it gives Claude

- **A mandatory first action** (§0): detect/scaffold the on-disk traceability spine (`docs/requirements/` + `docs/backlog/` + two-tier ADRs) — including migrating a legacy single-file requirements doc.
- **The full RE process**: elicitation (6 techniques), specification (Epic → Feature → CA · User Story · BDD), estimation (Planning Poker), validation (Sommerville 5 + Falbo 7), change management + traceability.
- **Acceptance Criteria + BDD** (declarative AC + `Given/When/Then`), the `[...]` sub-rule convention, and an optional **EARS** precision layer (5 patterns, EN + pt-BR).
- **Dependability & security requirements** — quantitative reliability (`POFOD`/`ROCOF`/`MTTF`/`AVAIL`), hazard-driven safety, risk-driven information-security, and resilience (the 4R).
- **Spec-Driven Development interop** (OpenSpec / GitHub Spec Kit) with a projection adapter and a drift checker.
- **Business analysis** (BABOK, AS-IS → TO-BE) and a **professional-ethics** layer (SBC 002/2024).
- **14 reference documents**, **8 worked case studies** (doping control, editorial moderation, SaaS multi-tenant, fintech/payments, government services), and **`.feature` step-definition bindings for 6 stacks** (pytest-bdd, behave, cucumber-js, cucumber-playwright, Reqnroll/SpecFlow, Behat).
- **Bilingual**: en-CA default with a complete pt-BR mirror under `skills/engenharia-de-requisitos/translations/pt-BR/`.

## Installation

```bash
/plugin marketplace add claude-market/marketplace
/plugin install engenharia-de-requisitos
```

## Usage

The skill auto-triggers when a session involves discovering, specifying, validating, or managing software requirements. Example prompts:

- "Help me elicit requirements and build a backlog for this project."
- "Write the acceptance criteria and BDD scenarios for this feature."
- "Phrase this requirement in EARS and define quantitative reliability NFRs."
- "Set up the `docs/` requirements + backlog + ADR structure for this repo."

## Components

| Component | What it is |
|---|---|
| `skills/engenharia-de-requisitos/SKILL.md` | 10-section entry-point map of the whole methodology |
| `skills/engenharia-de-requisitos/references/` | 14 deep-dive references (fundamentals → ethics → on-disk structure → EARS → SDD interop → dependability/security) |
| `skills/engenharia-de-requisitos/examples/` | 8 worked case studies + ready templates + 6-stack `.feature` step-defs |
| `skills/engenharia-de-requisitos/assets/` | Structure scaffolder + SDD projection adapter + generic templates |
| `skills/engenharia-de-requisitos/translations/pt-BR/` | Full Brazilian-Portuguese mirror |

## Requirements

- Claude Code (skill auto-loads; no external dependencies for the skill itself).
- Optional: the upstream project also ships an MCP server with advisory validators (`validate_user_story`, `validate_acceptance_criterion`, `validate_ears`, `check_projection_drift`) — see the source repository.

## Source & maintenance

Canonical, continuously-maintained source: **<https://github.com/seekdevcore/sk-requirements-engineering-theskill>** (this is a vendored copy at v1.13.0). Issues and updates are tracked there.

## License

Released under **[Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)** — appropriate for a knowledge/methodology corpus derived from openly-licensed course material. Attribution to the source instructor (Prof. Dr. Juliana Dantas Ribeiro Viana de Medeiros, IFPB) is required per the license. See `LICENSE`.
