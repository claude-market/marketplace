# 10 — On-disk project structure (requirements / backlog / specs / ADRs)

> This reference turns the abstract hierarchy of [`SKILL.md §2.1`](../SKILL.md) (*"the requirements document is the source of truth"*) and [`§5 Phase B`](../SKILL.md) into a **concrete folder layout on disk**, ready to drop into any repository. It is the physical materialization of the traceability spine: *requirement → Epic → Feature → CA · US → Task → Sprint → commit*.
>
> The canonical reference implementation is the *"Interpop"* project (`docs/requirements/`, `docs/backlog/`, `docs/specs/`, `docs/planning/adrs/`). Naming conventions in pt-BR follow [`05-convencoes-interpop.md`](05-convencoes-interpop.md). The companion scaffolder [`assets/scaffold-structure.sh`](../assets/scaffold-structure.sh) creates this layout in a new project **and reorganizes** an existing one.
>
> **Two standing rules (apply every time):**
>
> 1. **Single root named `docs/`.** The entire structure lives under one root directory called `docs/` (`docs/requirements/`, `docs/backlog/`, `docs/specs/`, `docs/planning/adrs/`). Never scatter requirement/backlog files at the repo root.
> 2. **Always detect before acting — and this is the FIRST action, automatic, every time the skill touches a project.** Before creating anything, inspect the target: if a structure (or loose requirement/backlog files) already exists → **analyze and reorganize**; if a single monolithic requirements doc from an older skill version exists with no spine → **migrate** (§8.1); if nothing exists → **create the standard default**. The scaffolder does this classification automatically (§7); you do the content adaptation (§9). The user never has to *ask* for the structure — its absence is the trigger to build it ([`SKILL.md §0`](../SKILL.md)).
>
> **Two layers of templates — do not confuse them.** The [`examples/`](../examples/) folder holds the **Interpop-filled** documents (`template-documento-requisitos.md`, `template-backlog-openproject.md`, the case studies) — a *concrete reference* showing the standard fully applied. The [`assets/templates/`](../assets/templates/) folder holds **generic, placeholder-based** templates the scaffolder materializes — the *adaptive* layer, meant to be filled with **your** project's modules, personas, and domain (§9). Interpop = "here is what done looks like"; generic templates = "here is your starting point".

---

## 1. Why an on-disk structure at all

A backlog living only inside an issue tracker (OpenProject, Jira, GitHub Projects) has three failure modes RE cannot tolerate:

1. **No version history of *why*.** A tracker shows the current state of a card, not the chain of edits that justified it. Git gives every requirement a `git log`.
2. **No source of truth.** When the tracker and the conversation disagree, nobody wins. A file committed to the repo, reviewed in a PR, *is* the agreement (`SKILL.md §2.1`, rule zero).
3. **No co-location with code.** The requirement that justifies a line of code should be one relative link away, not behind a login.

So the document is **plain Markdown in the repo**, and the tracker (if any) mirrors it — never the other way around.

### The three pillars (separation of concerns)

| Folder | Answers | Audience | Must NOT contain |
|---|---|---|---|
| `requirements/` | **WHY / WHAT** — what need does the system meet? | client, PO, auditor | the *how* (no stack, no endpoint, no table) |
| `backlog/` | **WHO does WHAT, WHEN** — what work is planned / in progress / done? | team, PO | business rationale that belongs in `requirements/` |
| `specs/` | **HOW** — the technical design that realizes a feature (SDD only) | engineers | product justification (that lives upstream) |

Cross-cutting both: **ADRs** record the *decisions* taken along the way (two-tier scheme — §5).

---

## 2. The traceability spine (the contract between folders)

```
Requirement (RF / RNF)              ← requirements/
  ↓ realized by
Epic (EP-NN)                        ← backlog/epics/
  ↓ decomposed into
Feature (F-NN)                      ← backlog/features/
  ↓ accepted when
Acceptance Criterion (CA01..CANN)   ← inside the Feature file
  ↓ illustrated by
User Story (USNN.M) + BDD scenarios ← inside the Feature file
  ↓ implemented by
Task (TNN.M.K / TX-NN)              ← inside the Feature file
  ↓ delivered in
Sprint                              ← backlog/sprints/
  ↓ materialized in
Commit (SHA)                        ← cross-ref in the Task
```

**Hard rule — bidirectional links.** Every node names its **parent** and its **children** via a relative link. A requirement file carries a `## Realized by` section listing the Epics/Features that execute it; an Epic file carries both `## Requirements realized (↑)` and `## Features under this Epic (↓)`. Without bidirectional traceability, changing one requirement becomes "which modules do I touch?" guesswork — the exact failure `SKILL.md §8 anti-pattern 8` warns against.

---

## 3. `requirements/` — the "WHY / WHAT"

```
requirements/
├── README.md                  purpose + traceability spine + conventions + how-to-add
├── personas-e-cenarios.md     canonical personas; every US references one
├── RF/                        Functional Requirements (one file per module)
│   ├── RF-001-<module>.md
│   └── RF-NNN-<module>.md
└── RNF/                       Non-Functional Requirements (cross-cutting)
    ├── RNF-perf.md
    ├── RNF-security.md
    ├── RNF-a11y.md
    ├── RNF-lgpd.md
    └── RNF-availability.md
```

**RF file anatomy** (see the full *"Interpop"* example `RF-007`):

- Header block: `Tipo` · `Prioridade` (🔴/🟠/🟡/🟢) · `Status`.
- `## Enunciado de negócio` — one quoted paragraph, pt-BR business language, **no technical term** (`SKILL.md §5 naming rule 2`).
- `## Justificativa` — why the requirement exists (product impact, KPI).
- `## Realizado por (↓)` — table of Epics/Features executing it (bidirectional link down).
- `## RNFs que limitam este RF` — which non-functional constraints bound it.
- `## Restrições e fora-de-escopo` — explicit boundaries.

**RNF file anatomy** adds a **mandatory metrics table** — every NFR must be *quantitative* (`SKILL.md §4.2`, golden rule). "Fast" is a wish; "p95 ≤ 300ms server at 50k articles" is a requirement. Each metric row carries an `Alvo` (target) and a `Quando medir` (how/where measured), plus a `## Como verificar` gates table.

**ID rule**: `RF-NNN`, `RNF-<slug>`. Immutable after creation. A discontinued requirement becomes `RF-NNN-deprecated.md` — it never disappears (kept for audit).

> ⚠️ **One file per MODULE, not one file per requirement (the most common point of confusion).** Each `RF/`
> file documents a whole **module** (one Epic / bounded context / app), and is named by its **first**
> requirement: `RF-01-<module>.md` holds `RF-01..RF-04`; `RF-05-<module>.md` holds `RF-05..RF-08`; and so on.
> The individual requirements live as `### RF-NN` sections **inside** the file. Therefore a folder listing
> `RF-01, RF-05, RF-09…` is **not** missing `RF-02/03/04` — those are sections of the first file. **Gaps in the
> *filenames* are module boundaries (contiguous ranges), never missing requirements.** A reader who counts
> files counts *modules*; to count requirements, `grep -c '^### RF-' RF/*.md`. (One-file-per-requirement is a
> valid variant, but the default — and what the scaffolder/Adaptation-protocol assume — is one-file-per-module.
> The same logic applies to `RNF/`: group by quality attribute or by Sommerville class, not necessarily one file per `RNF-NN`.)

---

## 4. `backlog/` — the "WHO does WHAT, WHEN"

```
backlog/
├── README.md          purpose + naming table + IDs + priority + Definition of Done + close workflow
├── glossario.md       domain vocabulary (every US/CA/ADR must use these terms)
├── epics/             one file per Epic — description + child Features list
│   └── EP-NN-<slug>.md
├── features/          one file per Feature — description + CAs + USs (with BDD) + Tasks
│   └── F-NN-<slug>.md
├── sprints/           one file per Sprint — temporal execution (US/Task mapping)
│   └── sprint-N-<slug>.md
└── done/              closed Epics/Features — files are MOVED here (git mv), not copied
```

**Why `done/` moves instead of copies.** `git mv` preserves history and keeps `features/` showing only live work. Copying duplicates truth and rots.

**Feature file anatomy** (see *"Interpop"* `F-30`):

- Header: `Tipo` · `Epic pai` (link ↑) · `Sprint de execução` (link) · `Status` · `Prioridade`.
- `## Descrição (visão de produto)` — business-language paragraph. A Feature **never** carries BDD (`SKILL.md §8 anti-pattern 11`).
- `## Requisitos atendidos (↑)` — links to the RF/RNF it realizes.
- `## Critérios de Aceitação` — `CA01..CANN` table, each with a "Como verificar" column and a status.
- `## User Stories` — each `USNN.M` carries the Connextra template **in the body** (not the title) + `### Cenários BDD (Gherkin pt-BR)` fenced blocks.
- `## Tasks` — the only level where technical terms are allowed.

**Naming + IDs + priority + Definition of Done**: governed by `backlog/README.md` (the scaffolder seeds the full table). Recap of the hard rules:

| Level | Allowed in title | Forbidden in title |
|---|---|---|
| Epic / Feature / US / CA / RF / RNF | noun + adjective, business language | infinitive verb, technical term |
| Task | **technical terms OK** | — (operational level) |

---

## 5. ADRs — the two-tier scheme (the part most projects get wrong)

*"Interpop"* keeps Architecture Decision Records (MADR format) in **two tiers, sharing one continuous global numbering**:

```
planning/adrs/                       ← TIER 1: PROJECT-level (cross-cutting decisions)
├── README.md                          catalog table + convention
├── ADR-001-<slug>.md   …  ADR-014     (transversal: queue, hosting, versioning, ethics…)
└── ADR-NNN-<slug>.md

specs/<feature>/adrs/                ← TIER 2: FEATURE/SPEC-level (decisions local to one feature)
├── INDEX.md                           catalog grouped BY LAYER (SW/DB/algo/BE/FE/UI/sec/test)
├── tracker.md                         live ADR ↔ Task ↔ Test cross-reference
├── ADR-015-<slug>.md  …  ADR-045      (continues the SAME sequence from tier 1)
└── ADR-NNN-<slug>.md
```

### The five rules that make this work

1. **One global sequence, across both tiers.** Project ADRs run `001..014`; the first feature's ADRs continue at `015`, not restart at `001`. A reader citing "ADR-021" never has to ask "which adrs/ folder?". The number is globally unique.
2. **Tier by scope, not by number.** A decision that affects the whole system (hosting, API versioning, async queue) lives in `planning/adrs/`. A decision local to one feature (this feature's index strategy, this feature's throttle) lives in that feature's `specs/<feature>/adrs/`.
3. **Never renumber. Never edit a decided ADR.** ADR-005 is ADR-005 forever. To change a decision, write a **new** ADR and mark the old one `Superseded by ADR-NNN` (`planning/adrs/README.md` convention). The audit trail stays clean.
4. **Variant tag when one number resolves parallel-layer decisions.** When the same architectural moment forces a coordinated decision across layers, suffix the layer: `ADR-030-DB`, `ADR-030-FE`, `ADR-030-UI`. They share the number because they are one decision with three faces.
5. **Two indexes per feature tier.** `INDEX.md` groups ADRs **by architectural layer** (so a reviewer reads all DB decisions together); `tracker.md` is the **living** ADR↔Task↔Test matrix, updated as PRs close.

### ADR file anatomy (MADR-lite — `ADR-001` template)

```markdown
# ADR-NNN: <imperative decision title>

## Status
Accepted | Proposed | Superseded by ADR-MMM | Deprecated
(+ one line: what supersedes/refines it, with a link)

## Context
The forces at play. Options considered (numbered list, each with its trade-off).

## Decision
The option chosen, stated in one sentence, plus the key parameters.

## Consequences
**Positivas:** … **Negativas / trade-offs aceitos:** …

## Cross-ref
Where it is implemented (file paths) · source · ADRs it refines/supersedes.
```

### When a project does NOT use SDD

If you adopt only `requirements/` + `backlog/` (no `specs/`), you keep **only tier 1** — `planning/adrs/`. All ADRs are project-level. The two-tier split is a benefit you unlock when feature-scoped technical design (SDD) earns its own folder.

---

## 6. `specs/` — the "HOW" (SDD only)

> **Spec-Driven Development**: before implementing a non-trivial feature, you write a design spec that the implementation must satisfy — design first, code second, with the spec as the contract. Adopt `specs/` when features are large enough that the *how* deserves its own reviewed artifact (multi-layer features, performance-critical paths, anything you want specialists to design before a line is written).

```
specs/
├── README.md                     SDD methodology + index of feature specs
└── <feature-slug>/               one folder per feature spec
    ├── DESIGN.md                 the design contract (architecture, data model, layers)
    ├── BACKLOG.md                spec-local task breakdown (mirrors backlog/features/F-NN)
    ├── TEST-STRATEGY.md          how this feature is tested (ties to docs/tests/)
    ├── SECURITY-REVIEW.md        threat model + mitigations
    ├── REVIEW-PHASE-N.md         design review rounds (optional)
    ├── _specialist-outputs/      raw outputs from per-domain architects (optional)
    └── adrs/                     TIER-2 ADRs for THIS feature (INDEX.md + tracker.md + ADR-NNN)
```

**The relationship to `backlog/`**: `specs/<feature>/` is the *how*; `backlog/features/F-NN` is the *what/when*. They cross-link. The Epic file's `## ADRs relacionadas` section points into `specs/<feature>/adrs/`. A feature can have a backlog entry without a spec (small features); a spec always has a backlog entry (you still plan the work).

**Do not** put product justification in `specs/` — that is upstream in `requirements/`. `specs/` starts from "we are building F-NN; here is how".

---

## 7. Running the scaffolder (detect → create → reorganize)

The scaffolder runs the same three steps every time, in order: **(1) detect** the target and classify it (GREENFIELD / HAS-STRUCTURE / LOOSE-FILES / **LEGACY-MONOLITH**), **(2) create** any missing folder/template (never overwriting), **(3) reorganize** loose files into place (auto-enabled when detection finds any). Root defaults to `docs/`; dry-run is the default.

> **LEGACY-MONOLITH** is the verdict for a project carrying its requirements as a **single loose document** (e.g. `REQUISITOS_UNIFICADO.md`, `requisitos.md`, a filled `template-documento-requisitos.md`) with **no `docs/` spine** — the typical output of a pre-structure version of this skill. The scaffolder **creates the structure but never auto-splits the monolith** (splitting prose into per-module RF/RNF needs judgment); it reports the file and the migration is yours to run (§8.1).

```bash
SC=~/.claude/skills/engenharia-de-requisitos/assets/scaffold-structure.sh

# preview — classifies the target and prints the plan; touches nothing
bash "$SC"

# create / fill / reorganize (with specs/ + tier-2 ADRs) — idempotent, safe to re-run
bash "$SC" --with-specs --apply

# requirements + backlog only (no SDD) — ADRs stay single-tier in planning/adrs/
bash "$SC" --no-specs --apply

# force or suppress the move-loose-files step explicitly
bash "$SC" --reorganize --apply      # force even if detection is unsure
bash "$SC" --no-reorganize --apply   # create-only, never move
```

The scaffolder copies the **generic templates** from [`assets/templates/`](../assets/templates/): each folder's `README.md`, a `_TEMPLATE.md` per artifact type (RF, RNF, Epic, Feature, Sprint, ADR), and the ADR `README.md` / `INDEX.md` / `tracker.md`. It **never overwrites** an existing file — it skips and reports. Because it is idempotent, the *same command* both bootstraps a greenfield repo and fills gaps in a half-built one.

After scaffolding, **do not stop at empty folders**: run the Adaptation Protocol (§9) to fill the templates with this project's reality, then the **first real RE action** — elicitation (`02-elicitacao.md`), the first `RF-001`, the Epic that realizes it. Folders without requirements are empty theatre.

---

## 8. Reorganizing an EXISTING project

When a project already has scattered requirement/backlog files (loose `RF-*.md` at the docs root, ADRs inline in a monolithic planning doc, a flat `backlog.md`), detection classifies the target as **LOOSE-FILES** and reorganize runs automatically:

```bash
SC=~/.claude/skills/engenharia-de-requisitos/assets/scaffold-structure.sh

# preview — lists every loose file it found and the moves it would make; nothing changes
bash "$SC"

# execute (uses `git mv` inside a git repo to preserve history)
bash "$SC" --apply
```

What reorganize does (conservative — only unambiguous matches):

- `RF-*.md` / `RNF-*.md` loose under the root → `requirements/RF|RNF/`.
- `EP-*.md` → `backlog/epics/`, `F-*.md` → `backlog/features/`, `sprint-*.md` → `backlog/sprints/`.
- `ADR-*.md` loose under the root or planning → `planning/adrs/` (tier 1). Feature-scoped ADRs already under a `specs/<feature>/` subtree are left in place (tier 2).
- Anything ambiguous is **reported, not moved** — you decide.

### 8.1 Migrating a LEGACY-MONOLITH (upgrading from a pre-`docs/` skill version)

The most common reorganization in practice: a project where an **older version of this skill** produced requirements as one loose document (e.g. `REQUISITOS_UNIFICADO.md`) and stopped there — no `requirements/RF`, no `backlog/`, no traceability spine. Detection classifies it **LEGACY-MONOLITH**. Because splitting prose safely needs judgment, the scaffolder **reports but does not auto-split** it. Run the migration yourself:

1. **Scaffold the spine** (`bash "$SC" --apply`) so the empty tree exists to receive the split.
2. **Read the monolith and decompose it** along its natural module boundaries:
   - one `requirements/RF/RF-NNN-<module>.md` per functional area / Epic block (preserve the original `RF-NN` IDs *inside* the files so existing cross-references survive);
   - one `requirements/RNF/RNF-<slug>.md` (or one per Sommerville class) for the non-functional requirements, each with its **quantitative** metric table;
   - seed `requirements/personas-e-cenarios.md` from the stakeholders/roles the monolith names;
   - seed `backlog/glossario.md` from the monolith's glossary/domain terms.
3. **Keep the original monolith as a consolidated overview** — do **not** delete it. Move it under `docs/requirements/` and add a banner linking *into* the split (it now carries the analysis/feasibility/phasing narrative that does not fit the per-file split, while the split carries the granular source of truth). This avoids duplicate-truth: prose narrative lives in the overview, atomic requirements live in the split.
4. **Backfill traceability** (§9 Step 2.7): if Epics/Features already exist, write them under `backlog/` and link `RF ↔ EP ↔ F` both ways.
5. Run the checklist below.

> Greenfield projects skip this entirely. This subsection exists so that **upgrading an old project is a one-pass, automatic migration** — exactly what [`SKILL.md §0`](../SKILL.md) mandates as the first action.

**Manual checklist after any reorganization** (the scaffolder moves files; it cannot rewrite cross-links for you):

- [ ] Every moved file's relative links (`../../requirements/...`) still resolve.
- [ ] Each `RF`/`RNF` has a `## Realized by` section; each Epic links up to its requirements and down to its Features.
- [ ] ADRs that were inline in a monolith are promoted one-file-per-ADR (see `planning/adrs/README.md` rationale — each decision gets its own URL + `git log`).
- [ ] The global ADR numbering has no gaps and no duplicates across both tiers.
- [ ] `backlog/README.md` top line records `Last requirements-document check: DD/MM/YYYY` (`SKILL.md §2.1`).

---

## 9. Adaptation protocol — making the generic templates fit THIS project

The scaffolder drops **generic, placeholder-filled** templates. They are a skeleton, not a deliverable. The standard is non-negotiable; the *content* must be adapted to the host project. Run this protocol right after scaffolding (or when reorganizing an existing project). **Analyze first; create the default only when there is nothing to analyze.**

### Step 1 — Detect the project (read before writing)

| Probe | How | Feeds |
|---|---|---|
| **Language** | README / code comments / commit messages → pt-BR or English? | language of all seeded prose |
| **Modules / apps** | `apps/*`, `src/*`, packages, bounded contexts, top-level domains | one `RF-NNN-<module>.md` per module |
| **Roles / auth tiers** | auth code, permission enums, role tables (`admin`/`editor`/`user`…) | personas in `personas-e-cenarios.md` |
| **Domain entities** | models / schema / ER diagram (the recurring nouns) | the `glossario.md` terms |
| **Stack** | manifest files (`package.json`, `pyproject.toml`, `go.mod`…) | technical context for `specs/` + ADRs |
| **Existing docs** | any `RF-*`, `ADR-*`, `backlog.md`, design docs already present | what to **reorganize** vs create |
| **NFR signals** | CI gates, perf budgets, `LGPD`/GDPR/compliance mentions, a11y targets | which `RNF-<slug>.md` to instantiate |

### Step 2 — Adapt the seeds (existing project)

1. **Localize** the seeded prose to the project's language.
2. **One RF per real module**: rename `RF/_TEMPLATE.md` into `RF-001-<module>.md … RF-NNN-<module>.md`, one per detected module — each with a business-language enunciado (no jargon).
3. **Personas from roles**: turn each auth tier / user type into a `P-NN` persona.
4. **Glossary from entities**: seed `glossario.md` with the recurring domain nouns (alphabetical), each defined in business language.
5. **RNFs that actually apply**: instantiate only the `RNF-<slug>.md` the project needs (perf, security, a11y, privacy, availability…), each with **quantitative** targets pulled from real budgets/gates.
6. **Reorganize** loose pre-existing artifacts into the tree (the scaffolder moves files; you fix the cross-links — §8 checklist).
7. **Backfill traceability** where history allows: if Epics/Features already shipped, write them retroactively and link `RF ↔ EP ↔ F` both ways. On an **existing** project, this backfill is **offered to the user as an explicit first-run question** ([`SKILL.md §0 step 3b`](../SKILL.md)) — full backfill now / seed only what the current task touches / structure-only-now — because it can be a large effort and is the user's call (greenfield has nothing to backfill).

### Step 3 — Create the default (greenfield, nothing to analyze)

When the project is empty or pre-code (no modules, no roles, no domain yet):

1. Keep the generic placeholders **as a checklist**, not as final content.
2. Seed a **minimal personas file** from the intended audience (even if just "anonymous user" + "admin").
3. Create `RF-001` for the single most important capability the product must have — the rest follow from elicitation (`02-elicitacao.md`).
4. Leave `glossario.md` with the few domain terms you already know; grow it as the domain emerges.
5. Choose `--with-specs` vs `--no-specs` per §10.

### Hard rule — never ship placeholders

A committed file still containing `<...>`, `RF-NNN`, `EP-NN`, or `# Requisitos — <NOME DO PROJETO>` is an unfinished requirement, not a template. Either fill it or delete it. The generic templates exist to be **consumed**, not committed verbatim.

---

## 10. Decision: do you need `specs/`?

> **This decision is surfaced at first-run** ([`SKILL.md §0 step 3a`](../SKILL.md)): it is genuinely the user's call because it **fixes the ADR tiering** — `--no-specs` keeps ADRs single-tier (`planning/adrs/`), `--with-specs` makes them two-tier (`planning/adrs/` + `specs/<feature>/adrs/`). Infer from the signals below; recommend the default; **ask the user only when the signals are ambiguous**. ⚠️ The scaffolder defaults to `--with-specs` — pass `--no-specs` explicitly for the lighter layout.

| Signal | Recommendation |
|---|---|
| Solo/small project, features fit in one head | `requirements/` + `backlog/` only. Single-tier ADRs. |
| Features span ≥3 layers (DB + backend + frontend) or are performance/security-critical | Add `specs/` + tier-2 ADRs. |
| You want specialists to design before implementation (design-first) | `specs/` is mandatory — it is the SDD contract. |
| Regulatory/audit pressure (you must show *why a design was chosen*) | `specs/` + ADRs give you the paper trail. |

You can start without `specs/` and add it later for the first feature that earns it — the scaffolder's `--with-specs` is additive and idempotent.

---

## 11. Cross-references

- [`SKILL.md §2.1`](../SKILL.md) — the document is the source of truth (rule zero).
- [`SKILL.md §5 Phase B`](../SKILL.md) — backlog hierarchy (Epic → Feature → CA · US → Task).
- [`05-convencoes-interpop.md`](05-convencoes-interpop.md) — full naming conventions, IDs, priority scale.
- [`04-bdd-criterios-aceitacao.md`](04-bdd-criterios-aceitacao.md) — CA vs BDD, the `[...]` convention.
- [`07-mudanca-rastreabilidade.md`](07-mudanca-rastreabilidade.md) — change management + traceability theory.
- [`examples/template-documento-requisitos.md`](../examples/template-documento-requisitos.md) — single-file requirements document (alternative to the `requirements/` folder split, for tiny projects).
- [`examples/template-backlog-openproject.md`](../examples/template-backlog-openproject.md) — tracker-side mirror of `backlog/`.
- [`assets/scaffold-structure.sh`](../assets/scaffold-structure.sh) — the scaffolder + reorganizer (detect → create → reorganize).
- [`assets/templates/`](../assets/templates/) — the **generic, adaptive** template tree the scaffolder materializes (distinct from the Interpop-filled [`examples/`](../examples/)).

---

*The folder layout is a means, not an end. Its only job is to make the traceability spine (§2) physical so that a change to any requirement is one `grep` away from every artifact it touches. If the structure ever fights traceability, fix the structure — never the traceability.*
