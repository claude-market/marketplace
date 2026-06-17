# System Audit Workflow

**Owner:** Cantos
**Accessible by:** All assistants
**References:** `references/brain-file-architecture.md`, `references/doc-best-practices.md`, `.assistants/cantos/cantos.md`
**Model:** Two-stage sub-agent pipeline dispatched via the Agent (Task) tool — a Haiku gatherer collects system state, a Sonnet reasoner produces findings, then Cantos applies and reports fixes. Both sub-agents ship with the template and are symlinked into `.claude/agents/`, so they spawn by name on any user's Claude Code with no extra setup.

---

## Objective

Audit **every artifact that makes the Cantos system work** along two axes, and fix what falls short of a high-quality bar:

1. **Content effectiveness** — for each artifact, is its content genuinely effective at producing its intended outcome? (Vague rules, bloat, contradictions, staleness, ceiling violations, dead prose.)
2. **Routing / activation / memory** — does the right file actually get loaded, called, or remembered when relevant? The worst failure mode is a useful artifact that exists but never fires (a skill whose trigger won't match, a tool that's never wired, a reference no one can discover, a brain file over the ceiling that loses adherence).

Scope covers: `CLAUDE.md`, `CLAUDE.local.md`, all `.assistants/*/*.md` brain files, `.assistants/*/sub-agents/`, `.claude/agents/` (the dispatch symlinks), `.claude/skills/`, `.claude/rules/`, `.claude/settings*.json` (hooks), `context/`, `references/`, `tools/`, `workflows/`, `registry/index.md`, `decisions/log.md`, and the cross-session memory plumbing (Active Issues blocks, the brain-update hook).

---

## The Orchestration Model

Run this as a two-stage sub-agent pipeline dispatched with the Agent (Task) tool, then apply fixes directly. Both stages spawn by name (`system-audit-gatherer`, `system-audit-reasoner`) because the template ships their symlinks in `.claude/agents/`; if a name doesn't resolve, spawn the same sub-agent by reading `.assistants/cantos/sub-agents/<name>.md` into a Task brief.

### Stage 1 — Gather (read-only)

Spawn the **`system-audit-gatherer`** sub-agent (Haiku). It scans every system artifact and returns a single structured JSON package — raw content plus quantitative measurements (line counts, mtimes, paragraph fingerprints, a cross-file mention index, Auto-updates stats, override declarations). It collects; it does not judge. Optionally spawn **`memory_gatherer`** in parallel (read its file into a Task brief — it has no symlink by design) to add the auto-memory state; include its output as a second input to the reasoner.

Everything that must be in scope is enumerated in the concern map below. The gatherer reads all of it so the reasoner never has to touch the filesystem.

### Stage 2 — Reason (analysis, no file reads)

Pass the gatherer's JSON (plus any `memory_gatherer` output) to the **`system-audit-reasoner`** sub-agent (Sonnet). It produces a numbered findings list across three axes, each finding carrying: `axis` (content | routing | memory), `file` (the single file a fix would edit, or NONE), `severity`, `issue`, `evidence` (line refs / quotes — no hand-waving), `proposedFix` (a concrete edit, not a vague suggestion). The reasoner self-culls: it respects declared overrides and applies the false-positive guardrails below, so it rejects plausible-but-wrong findings before they reach you.

Concern map — the checklist the gatherer must cover and the reasoner evaluates against (adjust as the system grows):

| Concern | Audits | Watch for |
| --- | --- | --- |
| brain-files | CLAUDE.md, CLAUDE.local.md, every `.assistants/*/*.md` | **200-line hard ceiling**, vague/duplicate/contradictory rules, Auto-updates bloat, scope drift vs active projects |
| rules | `.claude/rules/*.md` | auto-load correctness (no `paths:`), overlap with brain prose, broken sentences, dead weight |
| context | `context/*.md` | factual contradictions across files, staleness, undated claims, @-import resolution |
| references | `references/*.md` + subdirs | staleness, false maps, self-contradiction, **registry discoverability** (every ref indexed with a "Consult when" trigger) |
| skills | `.claude/skills/*/SKILL.md` | **does the `description` trigger fire on the right keywords?**, invented frontmatter fields CC ignores, `allowed-tools` comma-syntax, overlap hazards |
| sub-agents | `.assistants/*/sub-agents/` + `.claude/agents/` | **dispatch model match** (frontmatter+symlink vs prose template), missing symlinks, name-field convention, owner-header drift, registry `Symlinked` accuracy |
| workflows | `workflows/**` | dead skill paths (`.claude/skills/X.md` → `X/SKILL.md`), stale naming, `git add -A` (forbidden), registration + brain-file table row |
| tools | `tools/**` | wiring (is the hook/tool actually called?), registration, brain-file table row, tracked cruft (`__pycache__`, `.DS_Store`) |
| routing-registry | `registry/index.md` vs disk | **orphans** (exists, unindexed) and **ghosts** (indexed, missing); every row has a trigger + correct path + accurate flags |
| memory-hooks | `.claude/settings*.json`, `tools/cantos/brain_update_hook.py`, Active Issues, `decisions/log.md` | dead capabilities (built but unwired), project scaffolding in system settings, queue-consumer robustness |
| claude-md-routing | routing claims in CLAUDE.md + cantos.md | every assistant/path/@-import resolves; assistant + project routing matches reality |

### Stage 3 — Fix and report (Cantos, directly)

Take the reasoner's confirmed findings and apply them yourself, in file order so no two edits touch the same file at once. Each fix meets a high-quality bar (actually trims over-ceiling files, doesn't just annotate), and you skip anything that's wrong on closer inspection — re-read the file before editing if a finding looks borderline. High-judgment files (CLAUDE.md, brain-file trims, governance docs, this workflow) you always handle directly rather than delegating. If a confirmed-fix set is large and cleanly partitioned by file, you may spawn one fix sub-agent per file (one file per agent, conflict-free without locks); the default is to apply them inline.

---

## Execution Notes (hard-won)

- **The reasoner returns findings; Cantos owns the edits.** The two sub-agents are read-only (gatherer) and reason-only (reasoner) by design — neither writes files. All edits happen in Stage 3, under Cantos's judgment, so a flaky sub-agent run can never corrupt the working tree.
- **Keep the full finding objects, not just counts.** Hold onto the reasoner's complete confirmed-finding list (axis, file, evidence, proposedFix) so you can apply or review fixes even if Stage 3 is interrupted and resumed in a later session.
- **If Stage 3 is multi-file maintenance, isolate first.** Applying confirmed fixes edits 2+ instruction files, so the Pre-Maintenance Gate in `.assistants/cantos/cantos.md` applies — work in a git worktree, not on a shared `main` branch. (The gather and reason stages are read-only and exempt.)
- **The orchestrator handles this file.** Don't let a fix sub-agent rewrite `workflows/cantos/system_audit.md`; Cantos owns its evolution (see "Improve This Workflow").

---

## False-Positive Guardrails (do NOT flag these)

The reasoner applies these and you double-check them before fixing — calibrate to them:

- **Prose prompt-template sub-agents** (e.g. cantos's `memory_gatherer`) have no frontmatter and no symlink **by design** (`Symlinked = N`). That is the documented convention, not a broken-dispatch defect.
- **`.claude/agents/*.md` are symlinks to the already-indexed `.assistants/*/sub-agents/` sources.** The registry's `Symlinked` column surfaces them; do not propose a second table.
- **A skill or capability indexed via a reference doc rather than a top-level `SKILL.md`** is still discoverable through that reference; do not demand a Skills-table row for it.
- **Already-ignored, untracked cruft** (`.DS_Store`, stale tool logs) is housekeeping, not a system-health finding.
- **The user's personal context files** (`context/me.md`, `context/work.md`) are descriptive, not routing-critical — don't rewrite them to match a sandbox's MCP list.

---

## The Zero-Finding Standard

A correct audit leaves the system such that an immediate re-run finds no *content* or *routing* defects. Before closing out:

- Re-read every changed file and confirm the fix is correct on both sides of any cross-reference (registry ↔ disk, brain file ↔ workflow).
- Confirm every brain file is under the 200-line ceiling.
- Confirm `git status` shows only intended changes; the working tree is not carrying half-applied edits.

Efficiency/recommendation items (hook activation, optional cleanups the user must decide on) are exempt — surface them, don't force them.

---

## Output

1. All verified, in-scope defects fixed directly, to a high-quality bar.
2. A clear summary: what was audited, what was broken/ineffective, what changed, and confirmation that important artifacts are now correctly routed and will fire when needed.
3. An entry in `decisions/log.md`: `[YYYY-MM-DD] AUDIT: N findings, M confirmed, K fixed; <one-line of what changed>.`
4. Items that need the user (e.g. wiring the brain-update hook, accepting a recommendation) surfaced explicitly.

---

## Improve This Workflow

After every run, update this file: refine the concern map if the gatherer missed a category, add any new false-positive class the reasoner should learn (and mirror it into the reasoner's guardrails), and record any new execution gotcha. Every run should make the next run sharper. This is the mechanism by which the audit compounds.
