# 12 — SDD interop (OpenSpec · Spec Kit) — **optional execution-layer bridge**

> **When to use this reference**: when the project already runs — or wants to run — a Spec-Driven Development
> (SDD) execution loop (OpenSpec or GitHub Spec Kit) and you want this skill to *feed* that loop instead of
> competing with it. This skill owns the **quality of the requirement** (elicitation, EARS phrasing, ACs,
> validation, ethics, traceability); the SDD framework owns the **execution cycle** (spec → code → review).
> This file is the bridge. **Optional** — skip entirely if the project has no SDD framework (§6).

> **The two frameworks (durable reference links — repos may move, so learn them from source):**
>
> - **OpenSpec** (Fission-AI) — change-folder model with delta specs (`ADDED`/`MODIFIED`/`REMOVED`) and
>   archiving. Repo: <https://github.com/Fission-AI/OpenSpec>.
> - **GitHub Spec Kit** — a four-phase `Spec → Plan → Tasks → Implement` loop with a write-once
>   `constitution.md`. Repo: <https://github.com/github/spec-kit>.
>
> Both assume a coding agent implements *from* the spec. If a link 404s, search the org/name — the model
> below is framework-shape, not version-pinned.

---

## 1. The division of labour

This skill and an SDD framework are **different categories**, not competitors:

| Concern | Owner |
|---------|-------|
| *What* to build and *why* (elicitation, FR/NFR, business rules) | **this skill** (§1–§2) |
| Precise, testable phrasing (EARS) | **this skill** (§11) |
| Acceptance criteria + BDD | **this skill** (§4) |
| Requirement quality gates (Sommerville 5 + Falbo 7) | **this skill** (§6) |
| Ethics review (SBC 002/2024) | **this skill** (§9) |
| Traceability spine (RTM) | **this skill** (§7) |
| Driving spec → plan → tasks → code | **SDD framework** |
| Change tracking at the file level, archiving | **SDD framework** (esp. OpenSpec) |
| Slash commands, agent orchestration | **SDD framework** |

**Principle**: keep this skill's `docs/requirements/` + `docs/backlog/` spine as the **source of truth for the
requirement**. The SDD framework's `specs/` (or `openspec/`) folder is a *projection* of that truth into the
framework's execution format — generated from it, never the other way around.

---

## 2. Artifact crosswalk

How this skill's artifacts map onto each framework's expected files.

| This skill | OpenSpec | Spec Kit |
|------------|----------|----------|
| `RF-NN` (functional req., business language) | `specs/<cap>/spec.md` → "Requirements" | `spec.md` → functional requirements section |
| `RNF-NN` (non-functional req.) | `spec.md` → "Non-functional / constraints" | `spec.md` → NFR / constraints |
| EARS statement (§11) | requirement line inside `spec.md` | requirement line inside `spec.md` |
| `CANN` (acceptance criteria — `CA01`, no hyphen, per `05-convencoes-interpop.md`) | `spec.md` → "Scenarios / acceptance" | `spec.md` → acceptance criteria |
| BDD `Cenário` (Gherkin) | scenario block in `spec.md` | scenario block, feeds `/speckit` tasks |
| `G-NN` (business rule) | captured in `design.md` rationale | captured in `plan.md` constraints |
| `EP`/`F` hierarchy | one change folder per `F` | one feature dir per `F` |
| Design decision / ADR (§10) | `design.md` | `plan.md` + `constitution.md` |
| `T`/`TX` (tasks) | `tasks.md` checklist | `tasks.md` checklist |
| RTM (§7) | implicit via change folders | implicit via feature dirs |
| Scope "out of scope" note | `proposal.md` → out-of-scope | `spec.md` → non-goals |

> **ID preservation rule** (same spirit as `05-convencoes-interpop.md`): when an `RF-NN` is projected into a
> framework file, **keep the `RF-NN` identifier inline** (e.g. as a heading prefix or a trailing tag
> `[RF-21]`). The framework may not have a native ID slot — embed it so the RTM survives the round-trip.

---

## 3. OpenSpec mapping

OpenSpec organizes each change in its own folder:

```
openspec/changes/<feature-slug>/
├── proposal.md   ← why + what changes + in-scope / out-of-scope
├── specs/        ← requirements + user scenarios
├── design.md     ← technical approach (your ADR content)
└── tasks.md      ← implementation checklist (your T / TX)
```

### 3.1 Projection recipe (this skill → OpenSpec)

> **Scaffold it automatically** with `bash assets/project-to-sdd.sh <F-NN> --target openspec --apply` — it
> reads the feature file, preserves the `[RF-NN]` tags, and writes the folder below (dry-run by default; never
> overwrites). Then fill the EARS prose and run `check_projection_drift`. The steps below are what it generates:

1. One OpenSpec **change folder per Feature (`F-NN`)**. Slug = feature name.
2. `proposal.md`:
   - "Why" ← the `EP` goal + the `G-NN` business rules that motivate it.
   - "In scope" ← the `RF-NN` covered by this `F`.
   - "Out of scope" ← explicitly list adjacent `RF` *not* in this change (OpenSpec's highest-value field).
3. `specs/spec.md`:
   - Each `RF-NN` → a requirement section, phrased in **EARS** (§11), with the `[RF-NN]` tag preserved.
   - Each `CANN` → a scenario / acceptance entry.
   - Each `Cenário` (Gherkin) → a scenario block.
4. `design.md` ← your tier-1/tier-2 ADR content (§10).
5. `tasks.md` ← your `T`/`TX` items, in checklist form.

### 3.2 Delta specs — the change-management win

OpenSpec marks spec sections as **`ADDED` / `MODIFIED` / `REMOVED`** and merges deltas into the primary spec
on archive. This is exactly the **change + traceability** concern of `07-mudanca-rastreabilidade.md`, but
executed at the file level. Recommended workflow:

- Treat an OpenSpec *delta* as the on-disk form of an RTM change entry.
- When an `RF-NN` changes, the delta's `MODIFIED` marker **is** the change record — point your RTM at the
  change folder instead of duplicating prose.
- On `archive`, the delta merges into the source-of-truth spec; your RTM row closes. No duplicate truth.

The cleanest interop of the two — OpenSpec's brownfield/legacy support also aligns with the `LEGACY-MONOLITH`
migration path (`10-estrutura-projeto.md §8.1`).

---

## 4. Spec Kit mapping

Spec Kit runs a four-phase loop with fixed artifacts:

```
Spec → Plan → Tasks → Implement
 │       │       │
 ▼       ▼       ▼
spec.md  plan.md tasks.md   (+ .specify/memory/constitution.md, once)
```

### 4.1 Projection recipe (this skill → Spec Kit)

> **Scaffold it automatically** with `bash assets/project-to-sdd.sh <F-NN> --target speckit --apply` (writes
> `specs/<slug>/{spec,plan,tasks}.md` + `.specify/memory/constitution.md` once; `[RF-NN]` tags preserved;
> dry-run by default). Then fill the EARS prose and run `check_projection_drift`.

1. **`constitution.md` (once per project)** ← your hard conventions (`05-convencoes-interpop.md` 10 rules) +
   the SBC ethics guardrails (§9). The natural home for "rules the agent must always follow".
2. **`spec.md` (per feature)** ← `RF`/`RNF` as requirements (EARS-phrased), `CANN` as acceptance criteria,
   `Cenário` as scenarios, `[RF-NN]` tags kept.
3. **`plan.md`** ← your ADR / design decisions (§10) + `G-NN` business-rule constraints.
4. **`tasks.md`** ← your `T`/`TX` decomposition.

### 4.2 Watch-outs

- **Token cost**: Spec Kit re-reads spec + plan + tasks every turn (a measurable API-spend bump vs ad-hoc
  prompting). Keep `spec.md` tight — your EARS phrasing helps, since one `SHALL`/`DEVE` per line is denser
  than prose.
- **Rigid phase gates**: Spec Kit expects the phases in order. Run this skill's §0 → validation (elicit →
  specify → validate) *fully* before `specify`, so you don't hit a gate with an unvalidated requirement.
- **`constitution.md` is write-once**: durable rules (naming, ethics) there; volatile detail in per-feature `spec.md`.

---

## 5. Round-trip integrity (don't break the RTM)

The one rule that keeps interop safe:

> **The requirement's source of truth stays in `docs/requirements/`.** The framework folder is generated
> *from* it. When the framework's spec changes during implementation, reconcile back: update the `RF-NN`,
> re-run `validate_ears` / `validate_acceptance_criterion`, then re-project.

Anti-pattern: editing `spec.md` inside the framework and letting the `RF-NN` in `docs/requirements/` drift
stale. That silently breaks the `RF ↔ EP ↔ F` traceability the §0 structure work exists to protect.

This reconciliation is **automated (advisory)** by the MCP tool
`check_projection_drift(requirements_dir, projection_dir)` — it reports, it never blocks. Its findings:

| Finding | What it detects | Granularity |
|---|---|---|
| `missing_in_projection` | an `RF/RNF` in `docs/` absent (by tag) from every framework spec | per-RF (exact) |
| `duplicated_in_projection` | an `RF/RNF` tag appearing in **more than one** spec file (should be exactly one) | per-RF (exact) |
| `orphan_in_projection` | a requirement-looking spec line with **no** `RF-NN` tag (un-elicited req.) | per-line (exact) |
| `ears_weakened` | a requirement line using a **weak modal** and no `SHALL`/`DEVE` | per-line (exact) |
| `ca_without_scenario` | the source has `CANN` ids but the projection has **no** `Scenario`/`Cenário` block **at all** | **coarse / global** (not per-CA) |

> **Honest scope notes** (so you don't over-trust the tool):
>
> - `ca_without_scenario` is a **coarse, global** check — it fires only when the projection contains *no*
>   scenario block whatsoever, not per individual `CANN`. Treat it as a smell, not a precise gap list.
> - `ears_weakened` is **tag/keyword-based**. In **pt-BR**, `DEVE` is the EARS *obligation* (not a weak
>   modal), so the weak-modal set is `should/must/will` (EN) + `deveria/pode/poderá/irá/vai` (pt-BR) — it does
>   **not** treat `DEVE` as weak. A correctly-phrased `O SISTEMA DEVE …` line is never flagged.
> - **Whole-dir vs per-feature**: the tool compares the **entire** `docs/requirements/` against the
>   projection. The adapter (`assets/project-to-sdd.sh`) projects **one Feature at a time**, so running drift
>   right after projecting a single `F-NN` will list every *other* feature's RF as `missing_in_projection` —
>   expected, not a defect. Run drift against the **full** projection (all features projected), or read the
>   `missing` list as "RFs not yet projected".

The tool is tag-based (anchored on `RF-NN`), stdlib-only, and EN+pt-BR aware. It defaults to
`docs/requirements` ↔ `openspec`; pass `projection_dir="specs"` (or `.specify`) for Spec Kit. Run it after
each projection and again before `archive`/`implement`. In a **consumer project** you can wire it into CI as a
**non-blocking advisory** step (the skill's own repo has no projection, so it ships no such CI gate):

```yaml
# consumer project — .github/workflows/quality.yml (advisory, never blocks)
- name: projection drift (advisory)
  run: |
    uv run python -c "from requirements_engineering_mcp.server import _check_projection_drift as c; \
      import json; r=c(); print(json.dumps(r, indent=2, ensure_ascii=False)); \
      print('::warning::drift' if not r['ok'] else 'in sync')"
  continue-on-error: true
```

---

## 6. When NOT to use a framework

Don't add an SDD framework when:

- the work is pure requirements discovery/validation with no code yet — this skill alone is the right tool;
- the project is too small to amortize the framework's setup + token overhead;
- the team has no agent-execution loop (the frameworks assume a coding agent implements from the spec).

In those cases, stay with this skill's `docs/` spine and skip §3–§5 entirely.

---

## 7. Summary

This skill is the **methodology and quality layer**; OpenSpec / Spec Kit are the **execution layer**. Project
requirements *down* into the framework, never let the framework own the requirement. OpenSpec's delta model is
the more natural fit for this skill's change/traceability discipline; Spec Kit's `constitution.md` is the
natural home for the hard conventions and ethics rules. Either way, the `RF-NN` identifier and the EARS
phrasing are what carry the rigor across the boundary — preserve both. The `check_projection_drift` MCP tool
(§5) keeps the round-trip honest.

---

*Cross-references: `05-convencoes-interpop.md` (hard rules, ID preservation), `07-mudanca-rastreabilidade.md`
(RTM, change management), `09-etica-sbc.md` (ethics guardrails), `10-estrutura-projeto.md` (docs/ spine,
LEGACY-MONOLITH), `11-ears.md` (EARS phrasing), `../assets/project-to-sdd.sh` (projection scaffolder),
`../mcp-server/README.md` (`check_projection_drift`). External frameworks (durable links — repos may move):
**OpenSpec** <https://github.com/Fission-AI/OpenSpec>, **GitHub Spec Kit** <https://github.com/github/spec-kit>.
Adopted here as an **optional** execution-layer bridge.*
