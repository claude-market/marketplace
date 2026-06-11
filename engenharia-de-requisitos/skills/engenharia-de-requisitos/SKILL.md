---
name: engenharia-de-requisitos
description: Use when the user is doing requirements engineering, business analysis, or software engineering tasks that involve discovering, specifying, validating, or managing software requirements. Triggers include (EN): requirements elicitation, stakeholder interviews, writing user stories, defining acceptance criteria, writing BDD scenarios, writing EARS statements, Planning Poker estimation, prototype validation of requirements, building a backlog (Epic → Feature → US → AC → Task), refining FRs/NFRs, requirement↔code↔test traceability, requirements change management, business analysis (AS-IS / TO-BE), professional computing ethics. Triggers (PT-BR): levantar requisitos, entrevistar stakeholders, escrever user stories, definir critérios de aceitação, escrever cenários BDD, escrever requisitos em EARS, estimar com Planning Poker, validar requisitos com protótipos, montar backlog (Epic → Feature → US → CA → Task), refinar RFs/RNFs, rastreabilidade requisito↔código↔teste, gestão de mudança de requisitos, análise de negócios (AS-IS / TO-BE), ética profissional em computação. Applies to new projects (no requirements yet) and to evolutions (changes in existing requirements). Not the right skill for pure code implementation — it is for the STAGE BEFORE (discovering what to build) and AFTER (validating that what was built is correct).
language: en-CA
available_translations:
  - pt-BR
content_status:
  en-CA: complete — entry point (SKILL.md w/ mandatory §0 first-run structure check + §3.1 SDD alignment, README.md, CHANGELOG.md), references/ (14 files, incl. 10-estrutura-projeto.md + 11-ears.md + 12-sdd-interop.md + 13-confiabilidade-seguranca.md), examples/ (8 files — incl. worked case studies for SaaS multi-tenant, fintech/payments, and government services + feature-step-defs/ — 6-stack BDD step-def skeletons), and assets/ (scaffold-structure.sh — GREENFIELD/HAS-STRUCTURE/LOOSE-FILES/LEGACY-MONOLITH · project-to-sdd.sh — OpenSpec/Spec Kit projection). Brazilian acronyms (RF, RNF, G, CA, US, EP-NN, etc.) and domain terms in *italic+quotes* preserved by design.
  pt-BR: complete — translations/pt-BR/ is now a full pt-BR mirror of v1.13.x: SKILL.md (with the mandatory §0 first-run structure check + §3.1 SDD alignment + the EARS subsection in Phase B), references 01–13, and examples (8 files + feature-step-defs/ 6-stack BDD bindings), all in Brazilian Portuguese. en-CA at the repo root stays the authoritative, linted source; references 01–09 carry only cosmetic blank-line-lint drift from en-CA (structure, headings, code fences and RF/CA identifiers verified identical — no content gap). Brazilian acronyms and *italic+quotes* domain terms preserved by design.
source: https://github.com/seekdevcore/sk-requirements-engineering-theskill
risk: safe
license: CC-BY-SA-4.0
date_added: 2026-06-01
version: 1.13.0
---

# Requirements Engineering (RE) + Business Analysis + Professional Ethics

> Skill built from the 11 lectures of the ERS course (*Engenharia de Requisitos de Software* / Software Requirements Engineering) of *"IFPB"* Campus João Pessoa (Prof. Dr. *"Juliana Dantas Ribeiro Viana de Medeiros"*), Sommerville 10e (Ch. 4), Pressman, Wiegers, Falbo, BABOK, and the SBC 002/2024 Code of Ethics. **Note on terminology**: the original source course is in Brazilian Portuguese; this default English content keeps Brazilian domain-specific terms in *"pt-BR with italics + quotes"* (e.g., *"IFPB"*, *"Interpop"*, *"ABCD"*, *"Bolsa Atleta"*). Gherkin keywords are translated to Given/When/Then; the pt-BR equivalents (Dado/Quando/Então) are available in `translations/pt-BR/`.

---

## 0. FIRST ACTION — structure-state check (MANDATORY, runs once per project, before anything else)

> 🔴 **This is not optional and it is not last — it is the FIRST thing this skill does the moment it is applied to a project/folder, before producing or editing a single requirement.** Just as elicitation precedes specification, the on-disk structure precedes the first requirement. **The user does not have to ask for it.** Detecting that the structure is missing *is itself the instruction to build it*. Skipping this step is the #1 failure mode of older versions of this skill — they wrote a loose `REQUISITOS*.md` and never built the traceability spine, leaving every later artifact homeless.

**Why first.** A requirement with nowhere to live is an orphan. The on-disk structure — `docs/requirements/` (the *why/what*) + `docs/backlog/` (the *who/what/when*) + ADRs, everything under a single `docs/` root (§5 Phase B + [`references/10-estrutura-projeto.md`](references/10-estrutura-projeto.md)) — **is** the physical source of truth (§2.1, rule zero). If it does not exist, traceability is impossible and the backlog has no anchor. So the structure comes **before** the first interview note.

### The protocol (run in order — do NOT skip to elicitation)

1. **Analyze the project automatically — gain context before asking the user anything you can read yourself.** Inspect what is already there: a `references/` folder, any existing requirements / spec / proposal documents (`.md`, `.pdf`, `.docx`), the `README`, source modules, roles/auth tiers, domain entities, stack manifests. This is Step 1 of the Adaptation protocol ([`references/10-estrutura-projeto.md §9`](references/10-estrutura-projeto.md)). Read first; ask only what the project cannot tell you.
2. **Detect the structure state.** Run the scaffolder in dry-run — it classifies the target and touches nothing:

   ```bash
   SC=~/.claude/skills/engenharia-de-requisitos/assets/scaffold-structure.sh
   bash "$SC"            # detect + preview only
   ```

   Verdicts: **GREENFIELD** (no `docs/` spine) · **HAS-STRUCTURE** (already laid out) · **LOOSE-FILES** (stray `RF-*`/`RNF-*`/`EP-*`/`F-*`/… outside their homes) · **LEGACY-MONOLITH** (a single requirements document — e.g. `REQUISITOS*.md`, `requisitos.md`, a filled `template-documento-requisitos.md` — produced by a pre-`docs/` version of this skill and never split into the spine).

3. **Settle two decisions with the user before scaffolding — infer first, recommend a default, ask only when genuinely ambiguous (never interrogate on obvious cases).** Each is the user's call because each changes the shape of the repository:

   - **(a) `specs/` vs `--no-specs` — this fixes the ADR tiering.** Infer from the §10 decision table ([`references/10-estrutura-projeto.md §10`](references/10-estrutura-projeto.md)): a solo/small project whose features fit in one head → **`--no-specs`** (single-tier ADRs, all in `planning/adrs/`); features spanning ≥3 layers, perf/security-critical, design-first (SDD), or under audit/regulatory pressure → **`--with-specs`** (two-tier ADRs: `planning/adrs/` + `specs/<feature>/adrs/`, one continuous global numbering). Clear signals → state the chosen default and proceed. **Ambiguous → `AskUserQuestion`**, because the choice decides where *every future ADR* lives. ⚠️ The scaffolder defaults to `--with-specs`; pass `--no-specs` explicitly when the lighter layout was chosen.

   - **(b) Backfill of undocumented work — ONLY on an existing project (HAS-STRUCTURE / LOOSE-FILES / LEGACY-MONOLITH), never greenfield.** When the project already has code/features that shipped *without* the RE documentation this skill defines, **`AskUserQuestion`** whether to **backfill** it: retroactively write the `RF`/`RNF` for what already exists, the Epics/Features for what already shipped, and wire `RF ↔ EP ↔ F` both ways ([`references/10-estrutura-projeto.md §9 Step 2.7`](references/10-estrutura-projeto.md)). Backfill can be large, so offer the scope explicitly: **(1)** full backfill of all undone documentation now · **(2)** seed only the parts the current task touches · **(3)** structure only, backfill later. Recommend **(2)** unless the user wants a complete retroactive map. Greenfield has nothing to backfill — skip this question entirely.

4. **Act on the verdict — never stop at "well, it already has a doc"** (run `--apply` with the flag chosen in 3a):

   | Verdict | Mandatory action |
   |---|---|
   | **GREENFIELD** | `bash "$SC" --apply` (± `--with-specs`/`--no-specs` per 3a) → create the standard structure, then adapt the seeds (§9). No backfill (nothing pre-existing). |
   | **HAS-STRUCTURE** | Re-apply (idempotent) to fill only gaps; never overwrite. Offer backfill (3b) for undocumented existing work. |
   | **LOOSE-FILES** | Re-apply → auto-reorganizes the stray files into the tree (ref §8). Offer backfill (3b). |
   | **LEGACY-MONOLITH** | **Migrate.** Scaffold, then **split** the monolithic document into per-module `RF-*` / `RNF-*` files, personas, and glossary — keeping the original monolith as a consolidated overview that links *into* the split. Offer backfill (3b) for code/features that shipped beyond what the monolith documents. Upgrade path for any pre-structure project. |

5. **Adapt the generic seeds to THIS project** (Adaptation protocol, [`references/10-estrutura-projeto.md §9`](references/10-estrutura-projeto.md)): one `RF` per real module, personas from real roles, glossary from real domain entities, only the RNFs that apply (quantitative). **Never commit placeholder files** (`<...>`, `RF-NNN`, `EP-NN`).
6. **Only now** proceed to whatever the user asked — elicitation, a new feature, a backlog refinement. The structure already exists to receive it.

> **Migration trigger (the exact bug this section closes).** If a project contains requirements as a **single loose file** *and* has **no `docs/` spine**, you are looking at output from a version of this skill that predated the on-disk structure. The correct response is to run the migration in step 3 **immediately and automatically** — not to ask "do you want a structure?". The absence of the spine is the trigger.

---

## 1. When this skill applies (triggers)

Invoke **before**:

- Starting a new product without written requirements
- Adding a substantial feature to an existing product
- Discussing what will be delivered in a sprint
- Writing or refactoring user stories, acceptance criteria, BDD scenarios
- Estimating story effort (Planning Poker, Story Points)
- Evaluating whether a proposed requirement is complete / correct / consistent / realistic / necessary / prioritizable / verifiable
- Deciding between build vs. buy (feasibility study)
- Eliciting non-functional requirements (performance, security, usability, accessibility, regulatory compliance)
- Discussing traceability between requirement ↔ test ↔ code
- **Being applied to a project for the first time (or migrating one from an older skill version)** — the on-disk structure check in **[§0](#0-first-action--structure-state-check-mandatory-runs-once-per-project-before-anything-else)** is the mandatory first action; it is not just one trigger among many
- Setting up or **reorganizing the on-disk documentation structure** of a project (`requirements/` + `backlog/` + `specs/` + ADRs) — see [references/10-estrutura-projeto.md](references/10-estrutura-projeto.md) + the scaffolder [assets/scaffold-structure.sh](assets/scaffold-structure.sh)
- Supporting business analysis (mapping AS-IS, designing TO-BE)
- Decisions with an ethical component: privacy, ML/AI, system decommissioning, failure to design for inclusion

**Do NOT invoke** for purely implementation tasks (coding, debugging, refactoring already-specified code). For those, use programming/debugging skills — RE comes **before** (what / why) and **after** (was the right thing delivered?), not in the middle (how to code it).

---

## 2. Central premise (non-negotiable)

> **Bad requirement = bad product.** No matter how good the implementation: if the requirement is wrong, ambiguous, incomplete, or unfeasible, the delivered system does not solve the real problem. Sommerville (4.5): *"The cost of fixing a requirements problem by changing the system is normally much greater than fixing design or coding errors."*

For this reason, RE is the highest-leverage stage of the software cycle. **Don't skip it.** Even in small agile projects, every backlog card is a requirement — only the level of formalism and the review cycle change.

### 2.1 The requirements document is the source of truth (rule zero)

**The backlog NEVER changes unless the requirements document changes first.** The backlog is a materialization of the document — it organizes, slices, and prioritizes — but it does not decide scope on its own.

This means:

- 🔁 **Before touching any Epic/Feature/CA/RNF in the backlog, verify whether the requirements document was changed.** The client may ask to add/alter/remove requirements during the project — those changes must propagate first to the document, then to the backlog.
- 📎 The backlog **references back** to the document (every Epic/Feature/CA has an `Origin (requirements)` field pointing to the corresponding `RF-NN`/`RNF-NN`).
- ⚠️ A change appearing directly in the backlog without a documented origin is **suspect**: either it is *scope creep* (scope growing without approval), or it is purely technical refinement (should become a Task, not a Feature). In either case, record it in the document first.
- 📅 The requirements document has a **revision history** (version, date, author, change, impact on backlog). Without it, nobody remembers what was agreed in a three-sprint-old WhatsApp conversation.

**Practical pattern**: the `BACKLOG.md` has at its top a link to the `REQUISITOS.md` + the date of the last check (`Last requirements-document check: DD/MM/YYYY — no changes`).

Ready-to-copy templates in [examples/template-documento-requisitos.md](examples/template-documento-requisitos.md) and [examples/template-backlog-openproject.md](examples/template-backlog-openproject.md).

---

## 3. The process (territory map)

Sommerville and the *"IFPB"* course adopt the **iterative spiral process** (Fig 4.6 of the book):

```
                ┌─────────────────────────┐
                ↓                         │
   ┌──────────────────┐         ┌──────────────────┐
   │  Elicitation &   │ ──────→ │  Requirements    │
   │  analysis        │         │  specification   │
   │  (discovery)     │         │  (documentation) │
   └──────────────────┘         └──────────────────┘
                ↑                         │
                │                         ↓
                │              ┌──────────────────┐
                └────────────  │  Requirements    │
                               │  validation      │
                               │  (verification)  │
                               └──────────────────┘
                                         │
                                         ↓
                                Requirements document
```

Crossing the 3 phases, **two continuous processes**:

- **Change management** (Sommerville 4.6): requirements change — always. A process is needed to assess impact + cost before accepting.
- **Traceability**: every requirement has an ID; every design decision, test, and line of code must be linkable back to the requirement that justifies its existence.

Sub-process within Elicitation (Sommerville Fig 4.7):
**Discovery → Classification/Organization → Prioritization/Negotiation → Documentation** (in a loop, with continuous feedback).

### 3.1 Alignment with Spec-Driven Development (Requirements → Design → Tasks)

The 2026 SDD tools (AWS *Kiro*, GitHub *Spec Kit*) converged on a three-phase vocabulary. This skill already
produces every one of those artifacts — the table below is a **traceability alignment**, a *re-labeling* that
lets the skill plug into the SDD ecosystem. It is **NOT a waterfall gate**: the spiral above still rules
(elicitation iterates, design evolves, INVEST + sprints/ondas stay agile). Use the SDD names when talking to
SDD tooling; use the RE process when actually working.

| SDD phase | "the spec is the prompt" → produces | Where it already lives in this skill |
|---|---|---|
| **Requirements** | *what* to build | `docs/requirements/` (`RF`/`RNF`) + `docs/backlog/` (Epic→Feature→CA·US·BDD) — Phase A/B, optionally phrased in EARS (§5 Phase B, [`references/11-ears.md`](references/11-ears.md)) |
| **Design** | *how* to build it | the **ADRs** — `docs/planning/adrs/` (tier-1) + `docs/specs/<feature>/adrs/` (tier-2), one global numbering ([`references/10-estrutura-projeto.md §5`](references/10-estrutura-projeto.md)) |
| **Tasks** | *in what order* | the `T`/`TX` Tasks inside each Feature (`docs/backlog/features/F-NN.md`) |

> ADRs live in `docs/planning/adrs/` (+ `docs/specs/<feature>/adrs/`) — **not** a flat `docs/adr/`. Keep the
> two-tier scheme; the SDD framing does not change the on-disk paths.

**Actually running an SDD framework?** When the project uses **OpenSpec** or **GitHub Spec Kit** as its
execution loop, [`references/12-sdd-interop.md`](references/12-sdd-interop.md) is the bridge: the artifact
crosswalk, the projection recipes (`docs/` → framework files, `[RF-NN]` tags preserved), and the **advisory
MCP tool `check_projection_drift`** that keeps the `docs/requirements/` source of truth and the framework
projection in sync (reports missing/duplicated/orphan/EARS-weakened drift, never blocks). **Generate ↔
verify**: `assets/project-to-sdd.sh <F-NN> --target openspec|speckit` scaffolds the projection (preserving
`[RF-NN]` tags); `check_projection_drift` then confirms nothing drifted. Optional — skip if there is no SDD
framework.

---

## 4. Concepts you need before any action

### 4.1 User requirement vs. system requirement

| Level | Language | Audience | Example |
|---|---|---|---|
| **User** | Natural, high level | Client, manager, end user | "The system shall generate a monthly report of prescriptions per clinic." |
| **System** | Detailed, measurable | Developer, architect, tester | "1.1 On the last business day of the month, generate a summary with medication name, quantity of prescriptions, total dose, and cost, with access restricted by control list." |

Both coexist in the document. The user understands the top one; the developer implements the bottom one.

### 4.2 Functional Requirement (FR — `RF` in the conventions) vs. Non-Functional (NFR — `RNF`)

- **FR (`RF`)**: what the system **does**. Inputs, outputs, behaviour, exceptions.
- **NFR (`RNF`)**: constraints on **how** the system functions. Sommerville classification (Fig 4.3):
  - **Product** — performance, reliability, security, usability, accessibility
  - **Organizational** — operational process, development standard, environment
  - **External** — regulatory, legislative (*"LGPD"* / GDPR), ethical

> **NFRs are frequently MORE CRITICAL than FRs.** Sommerville (4.1.2): *"Failure to meet a non-functional requirement may mean that the entire system becomes unusable."* System works but is slow → nobody uses it. System works but leaks data → *"LGPD"* fine + shutdown.

**Golden rule of NFR: it must be quantitative.** "Easy to use" ❌ → "User must complete task X in ≤2 min after 1h of training, with ≤2 errors/h" ✅. See metrics in [references/01-fundamentos.md](references/01-fundamentos.md). For the **dependability/security** NFR families — reliability (`POFOD`/`ROCOF`/`MTTF`/`AVAIL`), safety (hazard-driven), information security (risk-driven asset→threat→control), and resilience (RTO/RPO + the 4R) — and how to phrase each as a quantitative, EARS-able, traceable `RNF`, see [references/13-confiabilidade-seguranca.md](references/13-confiabilidade-seguranca.md).

### 4.3 Stakeholders

All people affected by the system. Not only end users. Mentcare example (Sommerville): patients, family members, doctors, nursing staff, receptionists, IT, ethics manager, administrative managers, records control. **Forgotten stakeholder = forgotten requirement = guaranteed rework.**

### 4.4 Feasibility study (3 questions, BEFORE anything else)

1. Does the system contribute to the organization's objectives?
2. Does it fit the schedule and budget using current technology?
3. Does it integrate with the other systems in use?

Any "no" → question whether the project should proceed.

---

## 5. Detail per phase (entry points for `references/`)

### Phase A — ELICITATION (discover)

6 techniques, choose by context. Full table + when to use in [references/02-elicitacao.md](references/02-elicitacao.md):

| Technique | Good for | Limitation |
|---|---|---|
| Interviews | Qualitative depth, "the why and the how" | Interviewer skill; biases |
| Questionnaires | Quantitative breadth, dispersed stakeholders | Low depth; superficial answers |
| Workshops / Brainstorming | Consensus, innovation, conflicts | Groupthink, dominance of vocal participants |
| Ethnography | Implicit requirements, real processes | Expensive, poor for radical innovation |
| Document analysis | Formal rules, legacy systems | Outdated docs; "how it should be" ≠ "how it is" |
| Stories and scenarios | Exploratory discussion with lay stakeholders | Not executable specification |

**Always combine 2+ techniques.** Interview → questionnaire (qualitative generates quantitative). Document analysis + observation (formal vs. real).

### Phase B — SPECIFICATION (document)

**Backlog hierarchy** (*"IFPB"* course, OpenProject — full version, reflecting multiple root Epics, nested Epics, and BDD in the Description field):

```
📄 Requirements Document (SOURCE OF TRUTH — always check before touching anything)
    │
    ▼
PROJECT (= repository/context in OpenProject — NOT an EPIC)
    │
    ├─ 🟦 ROOT EPIC #1                               ← one front of the project
    │   └─ 🟦 SUB EPIC                               ← sub-domain (module, area)
    │       └─ 🟦 SUB-SUB EPIC                       ← sub-sub-domain
    │           └─ 🟦 SUB-SUB-SUB EPIC               ← IFPB reaches 4 levels
    │               └─ 🟩 FEATURE                    ← customer-deliverable
    │                   ├─ 📋 CA group "CA - <Theme A>"   ← ACs always grouped
    │                   │    ├─ ✅ CA01 - self-sufficient rule
    │                   │    ├─ ✅ CA02 - self-sufficient rule
    │                   │    └─ ✅ CA03 - rule with sub-rules [...]
    │                   ├─ 📋 CA group "CA - <Theme B>"
    │                   │    └─ ✅ CA04 - ...
    │                   └─ 🟦 USER STORY                 ← slice of 1 sprint
    │                       ├─ 🎬 BDD: Scenario 1 (happy)  ┐
    │                       ├─ 🎬 BDD: Scenario 2 (error)  │ ← content of the
    │                       └─ 🎬 BDD: Scenario 3 (alt.)   ┘   "Description" field
    │                                                          of the US (not cards)
    │                       └─ 🔧 TASK                       ← technical unit
    │                                                          (technical terms OK)
    │
    ├─ 🟦 ROOT EPIC #2                               ← another front (sibling)
    │   └─ ... (same internal structure)
    │
    └─ 🟦 ROOT EPIC #N                               ← other fronts (siblings)
        └─ ...
```

> **🔴 Rule: multiple root Epics, no single "Project-Epic"**. A project typically has **several Epics at the top level, siblings to each other**, without a common parent node. Each root Epic is an **independent front** (platform, operational area, cross-cutting module). The "product" as a whole is the **context/repository** of the project in OpenProject — not an item of the hierarchy. Forcing everything under a single "Product Epic" creates an empty parent node and disrupts navigation. Real examples: *"Controle de Dopagem"* has `EPIC APLICAÇÃO WEB` · `EPIC APLICAÇÃO MOBILE` · `EPIC ATIVIDADES DE APOIO` (3 siblings); *"Interpop"* has `EP-10 Busca` · `EP-09 Filtros` · `EP-15 Newsletter` · `EP-20 Moderação` (several siblings). Detail in [`examples/template-backlog-openproject.md §3`](examples/template-backlog-openproject.md).

**Ready-to-copy templates:**

- 📋 [`examples/template-backlog-openproject.md`](examples/template-backlog-openproject.md) — complete backlog with *"Busca Editorial Interpop"* filled in + *"Cadastro de Atletas"* showing 4 levels of Epic
- 📋 [`examples/template-documento-requisitos.md`](examples/template-documento-requisitos.md) — requirements document (IEEE 830 + Sommerville + Wiegers)
- 🎬 [`examples/template-user-story.feature`](examples/template-user-story.feature) — ready Gherkin file with 4 scenarios + Scenario Outline + sample step definitions (Python + TypeScript). Full **step-def bindings for 6 stacks** (pytest-bdd · behave · cucumber-js · cucumber-playwright · Reqnroll/SpecFlow · Behat) in [`examples/feature-step-defs/`](examples/feature-step-defs/) — write the Gherkin once, bind it in any test stack
- 📚 **Worked case studies** (end-to-end, domain-shaped) in [`examples/`](examples/): *"Controle de Dopagem"*, *"Interpop"* moderation, **SaaS multi-tenant** (*"GestorPro"*), **fintech/payments** (*"PagLeve"*), **government services** (*"Portal do Cidadão"*) — each runs problem → `RF`/`RNF`/`G` → Epics/Features/CA/US+BDD → validation → traceability → ethics, surfacing that domain's specific NFRs (tenant isolation · PCI/idempotency · accessibility/LGPD)

**On-disk project structure (folders, not just files) + scaffolder:**

> ⚠️ This is the same structure that **[§0](#0-first-action--structure-state-check-mandatory-runs-once-per-project-before-anything-else)** requires you to detect and build **as the first action** on any project. The detail below is the *how*; §0 is the *when* (always, first).

The templates above (in `examples/`) are single Interpop-filled files. To lay out an entire **repository** so the traceability spine is physical — everything under one root named **`docs/`**: `requirements/` (the *why/what*) · `backlog/` (the *who/what/when*) · `specs/` (the *how*, SDD) · two-tier ADRs (`planning/adrs/` project-level + `specs/<feature>/adrs/` feature-level, **one continuous global numbering**) — read [`references/10-estrutura-projeto.md`](references/10-estrutura-projeto.md). It documents each folder's purpose, the two-tier ADR scheme, **how to adopt/reorganize**, and the **Adaptation protocol** (§9) — analyze the host project's modules/roles/domain and fit the generic templates to it (or create the default when greenfield).

Two template layers: [`examples/`](examples/) = Interpop-filled *concrete reference*; [`assets/templates/`](assets/templates/) = **generic, adaptive** templates the scaffolder materializes. The scaffolder [`assets/scaffold-structure.sh`](assets/scaffold-structure.sh) runs **detect → create → reorganize** every time (root defaults to `docs/`; dry-run by default; never overwrites; auto-reorganizes loose files via `git mv`):

```bash
SC=assets/scaffold-structure.sh
bash "$SC"                       # detect + preview (touches nothing)
bash "$SC" --with-specs --apply  # create/fill/reorganize, with SDD (idempotent)
bash "$SC" --no-specs --apply    # requirements + backlog only (single-tier ADRs)
# then follow the Adaptation protocol (ref §9): fill the seeds with THIS project's reality
```

**Critical distinction Feature ↔ User Story** (hard rule — anti-pattern "Feature with BDD" in [04-bdd-criterios-aceitacao.md §7.7](references/04-bdd-criterios-aceitacao.md)):

- **Feature** has a **description in business language** (a paragraph in plain language explaining the customer-deliverable) + **ACs**. It NEVER has BDD.
- **User Story** has **BDD** (`Given/When/Then`, in the "Description" field itself — not as child cards) + **inherited ACs** via traceability. Never has its own ACs.

**Extended rule: ALL artifacts have descriptions in business language.** Epic, Feature, User Story, CA, **RF**, RNF, business rule (G) — all described in plain language without technical terms (no URL, no method name, no table name, no stack). Read by: client, PO, junior developer, auditor — all without a technical glossary. Endpoints and libraries only appear in **Tasks**.

**`[...]` convention for ACs with sub-rules** (hard rule — detail in [04-bdd §2.5](references/04-bdd-criterios-aceitacao.md)):

When an AC needs sub-rules to be fully testable, **end the title with `[...]`** and detail in the item body (the "description" field in OpenProject) opening with `Rules to be applied:` + bullets. An AC without `[...]` must be **self-sufficient in the title**.

```
Example AC with [...] (must open the item):
  CA09 - The FEDERATION combobox must apply the fill-in and validation
         rules as detailed [...]
  Body:
    Rules to be applied:
    - Must only be enabled if a CONFEDERATION is selected.
    - Must only display ACTIVE Federations.
    - In ALPHABETICAL order.
    - ...

Example self-sufficient AC (without [...]):
  CA05 - The CPF field is not mandatory. But if filled, must be in the
         format XXX.XXX.XXX-XX. If the CPF is invalid, show an error message.
```

Whoever reads the backlog in list mode sees the `[...]` and knows they must click. No ambiguity.

**User Story title rule**: on the card, use a **short descriptive title** ("US Basic Athlete Listing"). DO NOT write the entire Connextra template ("As an editor, I want …, so that …") in the title — that template exists for **conversation**, not for cards. Detail in [references/03-especificacao.md](references/03-especificacao.md).

---

#### 🔴 Naming conventions *"Interpop"* / *"IFPB"* (hard rule — applies to every pt-BR project of this author)

Applies to ALL titles of Epic, Feature, User Story, CA, **RF**, RNF, business rule (G). **Tasks may violate** (technical terms are allowed there).

1. **No infinitive verbs** in titles. Use a descriptive noun/gerund.
   - ❌ `List user reservations` → ✅ `Listing of user reservations`
   - ❌ `Search articles` → ✅ `Article search`
   - ❌ `Register athlete` → ✅ `Athlete registration`

2. **No technical terms** in titles nor descriptions of Epic/Feature/US/CA/**RF**/RNF/G. Technical terms only appear in Tasks. Applies both to the **backlog** (Epic/Feature/US/CA) and to the **requirements document** (RF/RNF/G) — both are read by stakeholders, not by developers.
   - ❌ `REST endpoint for search` → ✅ `Article search by text`
   - ❌ `useSearch hook with TanStack` → ✅ `Real-time presentation of results`
   - ❌ `Migration of search_index table` → ✅ (not a Feature; becomes a technical Task)
   - ❌ CA: `Endpoint POST /api/v1/bans/ returns 400 if hierarchy violated` → ✅ `When an administrator tries to ban another administrator, the system rejects the operation with the message "Operação não permitida".`

3. **Plain language, simple, direct** — whoever reads must understand without technical context.

4. **All artifacts have descriptions in business language.** Epic, Feature, US, CA, **RF**, RNF, business rule (G). Read by any stakeholder (PO, client, junior developer, auditor) without needing a glossary. No URLs, no method names, no stack. Endpoints and libraries only in Tasks. **RF ↔ Feature relationship**: RF is the requirement declared in the document; Feature is its incremental materialization in the backlog (with traceability via the `Origin (requirements)` field).

5. **ACs always grouped** under a `CA - <Theme>` title, even for a Feature with a single AC. Grouping maintains visual consistency in OpenProject and facilitates future insertion (see template in [examples/template-backlog-openproject.md](examples/template-backlog-openproject.md) §4).

6. **Technical configurations are NOT Features** (ESLint, environment variables, folder creation, JSON files, Vite config, lint config, docker-compose). These go as **cross-cutting Tasks** (`TX-NN`), grouped for technical-team visibility, outside the Feature hierarchy. The master rule: **Feature = customer-deliverable**. If it is not deliverable to the end customer, it is not a Feature.

7. ***"Interpop"* priority scale** (applied at ALL levels: Epic, Feature, US, CA, Task):
   - 🔴 **Immediate** — blocks other items; must be done in the current sprint
   - 🟠 **High** — current sprint or next
   - 🟡 **Normal** — prioritized backlog
   - 🟢 **Low** — nice to have, no deadline

   > MoSCoW (Must/Should/Could/Won't) is a theoretical equivalent, but the *"Interpop"* team uses Immediate/High/Normal/Low. Use this scale in this author's Brazilian projects.

8. **Stable IDs** (*"Interpop"* format — kept in pt-BR for retro-compatibility with existing projects):
   - `EP-NN` (Epic, may be nested: `EP-NN.M`, `EP-NN.M.K`) · `F-NN` (Feature) · `CANN` (Acceptance Criterion) · `USNN.M` (User Story) · `TNN.M.K` (Task) · `TX-NN` (cross-cutting Task) · `G-NN` (business rule)
   - IDs are eternal (they do not get renumbered when content changes); the artifact version changes.

**Full `BACKLOG.md` template** + examples from *"SIRA"* and *"Interpop"* projects in [references/05-convencoes-interpop.md](references/05-convencoes-interpop.md).

**Acceptance Criteria + BDD are complementary, not competing:**

- **CA (AC)** is a declarative rule per feature: "CA05 — The CPF field is not mandatory. If filled, must be in the format XXX.XXX.XXX-XX." A list of testable rules.
- **BDD** is an executable scenario per user story: "GIVEN the user is logged in and has permission / WHEN they access the administrative menu > Athletes / THEN the system displays the basic list of athletes."

CA defines the **invariant**; BDD defines the **interaction**. Use both. Detail in [references/04-bdd-criterios-aceitacao.md](references/04-bdd-criterios-aceitacao.md).

**EARS — optional precision layer.** When a requirement must be unambiguous for an AI implementer, for an
edge/error case, or for a regulated feature, phrase it (in the RF **body**, never the business title) using one
of the five EARS templates — `WHEN/QUANDO <trigger> THE SYSTEM SHALL/O SISTEMA DEVE <response>` (+ `WHILE/ENQUANTO`,
`IF…THEN/SE…ENTÃO`, `WHERE/ONDE`, ubiquitous). One `SHALL`/`DEVE` per statement → one `CA` group → one or more
`Cenário`. **EARS is opt-in** and coexists with the business-language `RF` + BDD; it never replaces them. Full
patterns (EN + pt-BR), anti-patterns, and the `RF → EARS → CA → Gherkin` pipeline in [references/11-ears.md](references/11-ears.md).

### Phase C — ESTIMATION (sizing)

Story Points (abstract measure of complexity) + Planning Poker (Fibonacci: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89 + `?` + 100).

- `?` = missing understanding → talk to the PO
- `100` = a disguised epic → slice into stories
- 0 and 1/2 do not enter the 1st round — reserved for trivial future items (label, color change)

Procedure: choose a guide story (simplest = 1 pt) → estimate the rest proportionally (not the next number on the scale). Detail in [references/05-estimativa.md](references/05-estimativa.md).

### Phase D — VALIDATION (check that it's the right thing)

**Sommerville's 5 checks:** validity · consistency · completeness · realism · verifiability.

**Falbo's 7 dimensions (per requirement):** complete · correct · consistent · realistic · necessary · prioritizable · verifiable.

**3 techniques:** requirement reviews (walkthrough), prototyping (lo-fi → hi-fi), generation of test cases from the requirement.

Prototypes are the most effective tool because the user SEES the result. Start on paper/whiteboard, evolve to Figma when necessary. Detail in [references/06-validacao.md](references/06-validacao.md).

### Phase E — CHANGE + TRACEABILITY (maintain coherence)

**Enduring** requirements (central activities; change slowly) vs. **volatile** requirements (support; change frequently). Differentiate when prioritizing architecture.

Formal change process (Sommerville Fig 4.19):
**Identified problem → analysis/specification → impact + cost analysis → implementation** (with rollback on the requirements document synchronized with the code).

Traceability: every requirement ID → design → code → test. Without it, changing 1 requirement turns into "which modules do I touch?". Detail in [references/07-mudanca-rastreabilidade.md](references/07-mudanca-rastreabilidade.md).

---

## 6. Cross-cutting layer: the business analyst

In small teams, dev + PO accumulate the role. In larger teams, there is a dedicated analyst. BABOK (Business Analysis Body of Knowledge) defines 6 knowledge areas: planning, elicitation, lifecycle management, strategy analysis, requirements analysis and solution design, evaluation. Central flow: **AS-IS** (current process) → **TO-BE** (desired process) → GAP analysis → system requirements that cover the GAP. Detail in [references/08-analista-negocios.md](references/08-analista-negocios.md).

---

## 7. Cross-cutting layer: professional ethics

> This is an **non-negotiable** layer. It is not above the others — it is below all of them. *"SBC"* Code 002/2024 (pt-BR version of IFIP, adapted from ACM): *"The Computing profession as a whole benefits when the ethical decision-making process occurs in a responsible and transparent manner."*

Principles that most apply to RE:

- **1.1 Human well-being** — "the needs of the less favoured must receive greater attention"
- **1.2 Avoid harm** — report system risks even if it delays delivery
- **1.6 Privacy** — minimal collection, consent, defined retention (*"LGPD"* / GDPR)
- **2.5 Comprehensive evaluation** — **ML systems require continuous risk re-evaluation**
- **2.6 Work only in areas of competence** — communicate limitations to the client
- **2.9 Robust and secure systems** — *"when misuse or harm is foreseen or unavoidable, **the best option may be to not implement the system**"*
- **3.1 Public good at the centre** — explicitly cites *"requirements analysis"* as a moment of ethical evaluation

Detail and application in [references/09-etica-sbc.md](references/09-etica-sbc.md).

---

## 8. Frequent anti-patterns (avoid these)

1. **Skipping elicitation** — "I already know what the client wants" → rework cost 10× to 200× the cost of fixing in the right phase
2. **Connextra in the title** — "As [X], I want [Y] so that [Z]" in the card title becomes unreadable; use it in the description/conversation field, not in the title
3. **Qualitative NFR** — "must be fast" is not a requirement, it is a wish. Always quantify
4. **CA and BDD competing** — writing only one of the two. They are complementary layers (invariant × interaction)
5. **Storyteller without stakeholder** — writing requirements alone. Requirement without an owner = requirement nobody validates
6. **Accepting everything without prioritizing** — a 200-item backlog without order is the same as an empty backlog
7. **Forgetting change** — designing architecture assuming requirements do not change → total rewrite in 6 months
8. **Ignoring traceability** — impossible to analyze change impact without ID/link between artifacts
9. **Ethics as an afterthought** — ethical issues should enter acceptance criteria, not a separate document nobody reads
10. **Ethnography in an innovative project** — ethnography is great for replacement systems; terrible for products that do not yet exist (Nokia × Apple)
11. **Feature with BDD instead of description** — pasting `GIVEN/WHEN/THEN` directly into the Feature instead of the business-language paragraph. Result: non-technical stakeholders do not read it, ACs become orphans, Sprint Planning stalls. BDD lives in the **User Story**. Detail and ❌/✅ examples in [04-bdd-criterios-aceitacao.md §7.7](references/04-bdd-criterios-aceitacao.md)
12. **Backlog without origin in the requirements document** — an Epic/Feature/CA that appears in the backlog without `Origin (requirements)` pointing to `RF-NN`/`RNF-NN` is silent scope creep or technical refinement misplaced. Every change is born in the document; the backlog only materializes (see §2.1).
13. **Technical term in an AC** — `CA: The endpoint POST /api/v1/bans/ returns HTTP 400 if hierarchy violated` forces the auditor/client to open a glossary. Rewrite in business language: `CA: When an administrator tries to ban another administrator, the system rejects the operation with the message "Operação não permitida".` Endpoint and HTTP status go in the Task.

---

## 9. Application checklist (use per feature)

Before accepting a feature in the backlog, validate Falbo's 7 dimensions:

- [ ] **Complete** — describes the entire functionality/rule/restriction
- [ ] **Correct** — describes exactly what is to be built
- [ ] **Consistent** — unambiguous, does not conflict with another requirement
- [ ] **Realistic** — implementable given what we know of the platform
- [ ] **Necessary** — client needs OR external/standard requirement
- [ ] **Prioritizable** — has a clear order vs. other items
- [ ] **Verifiable** — possible to write a test that proves the implementation

Failed ≥1 → not ready. Return to the stakeholder.

### Additional naming checklist (hard rule — *"Interpop"*)

Before accepting Epic/Feature/US in the backlog:

- [ ] Title **DOES NOT begin with an infinitive verb** (no `List`/`Create`/`Search`/`Register`/`Configure`/`Implement`)
- [ ] Title **does NOT contain technical terms** (no `endpoint`/`hook`/`migration`/`API`/`schema`/`config`)
- [ ] Title in **plain language** readable by a non-technical stakeholder
- [ ] Item **is customer-deliverable** (if it is a technical configuration, move it to a cross-cutting Task `TX-NN`)
- [ ] Priority declared (🔴 Immediate / 🟠 High / 🟡 Normal / 🟢 Low)
- [ ] **Feature** has a **paragraph description** · **User Story** has **BDD `Given/When/Then`** (do not swap)
- [ ] Every User Story has **explicitly associated ACs** (traceable relation)
- [ ] Every Task has a **Task ID** (`TNN.M.K` or `TX-NN`) so it appears in commit/PR

Failed ≥1 → not ready. Fix it before moving to implementation.

---

## 10. Primary source and canonical bibliography

### 10.1 Author of the source material (primary corpus of this skill)

The primary corpus of this skill — all 11 processed lectures (LECTURE 0 to 10, including 09.2) — was created and taught by **Prof. Dr. *"Juliana Dantas Ribeiro Viana de Medeiros"*** ([Lattes](http://lattes.cnpq.br/9730254173461923) · [ORCID 0000-0001-8387-4616](https://orcid.org/0000-0001-8387-4616)).

Why this matters for the reliability of what this skill claims:

- **Ph.D. in Software Engineering** (UFPE 2017) with a sandwich period at **Universidade Nova de Lisboa** (2016, Erasmus Mundus BEMUNDUS scholarship), supervised by Alexandre Marcos Lins de Vasconcelos with co-supervision by Miguel Goulão (UNL) and Carla Schuenemann.
- **Doctoral thesis**: *"An approach to support the Requirements Specification in Agile Software Development"* — the **exact subject** this skill condenses.
- **Active research line**: *"Requirements Engineering in Agile Projects"* (since 2014, *"IFPB"*).
- **Coordinator of *"CNPq"* DTI-A project 487777/2013-1** — *"Sistema de Informação Integrado para Controle de Dopagem"* (2014–2015), which is the **origin of the main case study** in [`examples/caso-controle-dopagem.md`](examples/caso-controle-dopagem.md).
- **20+ years of industrial experience** in software project management and development: *"DATAPREV"* (*"Ministério do Trabalho"*, 2006–2013), *"CESAR"* (Recife, 2005–2006), *"CAGEPA"*, *"Ministério Público da Paraíba"*, *"Prefeitura de João Pessoa"* (tax systems *"IPTU"*/*"ITBI"*/*"Taxa de Lixo"*, 1997–2005), and collaborations with *"Multilaser"* and *"CPM Braxis"*.
- **Tenured Professor (Dedicação Exclusiva)** at *"IFPB"* Campus João Pessoa since 2006 (entry via public competition, **1st place**); active researcher at the *"EMBRAPII"* hub at *"IFPB"*; also affiliated with UFCG since 2020.
- M.Sc. in Computer Science (UFPE 2001, *"CNPq"* scholarship, dissertation on ISO 9001:2000 in software companies) and B.Sc. in Computer Science (UFPB 1997).

> **Academic citation**: Medeiros, J. D. R. V. de. *Engenharia de Requisitos de Software* [course material, lectures 0–10]. *"IFPB"* Campus João Pessoa, 2025. Lattes: http://lattes.cnpq.br/9730254173461923. ORCID: https://orcid.org/0000-0001-8387-4616.

### 10.2 Canonical bibliography (complements the primary corpus)

- **Sommerville, I.** *Software Engineering*, 10th ed. Pearson, 2019 — base of the course (Ch. 4 is the pivot)
- **Pressman, R.** *Software Engineering: A Practitioner's Approach*, 9th ed. McGraw-Hill, 2021 — complementary view (7 stages of RE)
- **Wiegers, K. & Beatty, J.** *Software Requirements*, 3rd ed. Microsoft Press
- **Cohn, M.** *User Stories Applied*, 2004 — standard reference for US
- **Robertson, S. & Robertson, J.** *Mastering the Requirements Process* (VOLERE method)
- **Hull, E., Jackson, K., Dick, J.** *Requirements Engineering*, 4th ed. Springer
- **IIBA.** *BABOK Guide* v3 — business analysis
- **Falbo, R. A.** Lecture notes — Software Requirements Engineering (UFES)
- **SBC.** Resolution 002/2024 — Code of Ethics and Professional Conduct
- **Valente, M. T.** *Engenharia de Software Moderna*, 2020 ([engsoftmoderna.info](https://engsoftmoderna.info)) — ch. 3 (MVP + A/B Testing)

---

**To detail any point above, go directly to the corresponding `references/` file.** This `SKILL.md` is the map; the detail lives there. Do not try to substitute the canonical readings: this skill condenses for immediate use, but important decisions deserve the full book.
