# Memory Gatherer

> Prose prompt-template (`Symlinked = N`): no YAML frontmatter, no `.claude/agents/` symlink. Spawned by reading this file into a Task brief, not by name. Suggested model when spawning: Haiku (read-only data collection); grant it Read, Bash, and Glob.

**Owner:** Cantos
**Invoked by:** `workflows/cantos/system_audit.md` Stage 1 — OPTIONAL. Spawned only when an audit also wants to check auto-memory state. It has no `.claude/agents/` symlink (`Symlinked = N`); spawn it by reading this file into a Task brief, in parallel with the main `system-audit-gatherer`.
**Model:** Haiku (read-only, data collection only)
**Purpose:** Read every auto-memory file Claude Code maintains for this project so the reasoner can detect drift, orphaned entries, and overlap with brain-file Auto-updates.

> **Scope note — this is NOT a core stage of the audit pipeline.** The two-stage audit is `system-audit-gatherer` → `system-audit-reasoner`; this sub-agent is an optional adjunct that inspects Claude Code's auto-memory. Auto-memory is part of the *brain-update / self-update* mechanism, which ships **disabled by default** (`autoMemoryEnabled: false` in `.claude/settings.json`, and the `Stop`-hook brain-update queue is unwired — see `.assistants/cantos/cantos.md` → "Continuous Self-Updating"). When that mechanism stays off, project-wide memory is expected to be absent and this gatherer mostly confirms the empty state; it becomes load-bearing only if a user turns auto-memory on. Do not treat it as a mandatory step of every audit.

---

## Context — two memory mechanisms exist

Claude Code has TWO distinct auto-memory mechanisms. This sub-agent audits both.

**1. Project-wide auto memory.** Claude Code can maintain a project `memory/` directory at repo root, governed by the `autoMemoryEnabled` setting in `.claude/settings.json`. If the project has retired this mechanism (`autoMemoryEnabled: false`, directory removed), the expected state is absent — any reappearance is a re-accumulation event the reasoner should flag. If the mechanism is active, every file in `memory/` is fair game for drift and overlap analysis.

**2. Sub-agent auto memory (ACTIVE — not governed by `autoMemoryEnabled`).** Per Anthropic's [sub-agent memory docs](https://code.claude.com/docs/en/sub-agents#enable-persistent-memory), individual sub-agents can maintain their own auto-memory at `.claude/agent-memory/<sub-agent-name>/`. The `autoMemoryEnabled` setting does NOT govern this. Each sub-agent has its own `MEMORY.md` index plus topic files. This is a common blind spot — sub-agent auto-memory can accumulate without ever being reviewed.

This sub-agent functions as a **watchdog for both**. Project-wide memory should match the project's configured policy (absent if retired). Sub-agent memory should stay lean and align with each sub-agent's purpose; anything stale, orphaned, or contradicting the sub-agent's `.md` file is flagged.

---

## Inputs

- Read access to `memory/` in the project root (state depends on the project's `autoMemoryEnabled` policy)
- Read access to `.claude/agent-memory/` (active sub-agent auto-memory)
- Read access to `.claude/agents/` (sub-agent definition files — cross-reference target)
- Read access to the project's `.gitignore` and `git ls-files`

---

## Output

A JSON object with the structure below — two top-level sections, `project_memory` and `subagent_memory`.

---

## Rules

**Read-only.** No edits, no deletions.

**Whole-directory scan for each location.** Don't skip files because they look stale — staleness is what the reasoner is looking for.

**No reasoning.** Do not classify a file as drift or duplicate. Just measure.

---

## Procedure

### Part A — Project-wide auto-memory (retirement watchdog)

1. **Resolve the memory directory.** Default location: `memory/` at repo root. Expected result: does not exist.

2. **If it DOES exist:** list all files via `Glob: memory/**/*.md`. For each:
   - `path` (relative to repo root)
   - `content` — full text
   - `line_count`, `word_count`
   - `last_modified` — fs mtime via `stat -f %Sm -t %Y-%m-%d <path>`
   - `tracked_in_git` — boolean from `git ls-files --error-unmatch <path>`
   - `type` — derive from filename prefix (`MEMORY.md` → index; `user_*` → user; `feedback_*` → feedback; `project_*` → project; `reference_*` → reference; else `other`)
   - `first_100_chars` — normalized (lowercase, strip markdown) for fingerprint comparison
   - `fingerprint` — hash of sorted 5-word shingles
   - **`reaccumulation_event: true`** — flag for the reasoner

3. **MEMORY.md index extraction (if present).** Parse `memory/MEMORY.md`, return each indexed entry and whether the referenced file actually exists on disk.

4. **Git status.** Run `git status --short memory/` and `git ls-files memory/`. Report tracked vs untracked.

### Part B — Sub-agent auto-memory (active, must stay lean)

1. **List every sub-agent memory directory** via `Glob: .claude/agent-memory/*/`. Each directory is a sub-agent's memory home.

2. **For each sub-agent directory:**
   - `subagent_name` — directory name (e.g. `browser-agent`)
   - `definition_exists` — does `.claude/agents/<subagent_name>.md` resolve? (symlinks count.) Flag orphans where memory exists but the definition is gone.
   - `memory_md_present` — does `MEMORY.md` exist? It's the index Claude Code reads first.
   - `total_files` — count of `.md` files in the directory
   - For each `.md` file in the directory:
     - `path`, `content`, `line_count`, `word_count`, `last_modified`, `tracked_in_git`
     - `first_100_chars` (normalized) and `fingerprint` (same algorithm as Part A)
     - `is_memory_index` — true if filename is `MEMORY.md`

3. **MEMORY.md index parsing.** For each sub-agent's `MEMORY.md`, extract the list of referenced files and check each one resolves on disk (broken-link detection).

4. **Size check.** Anthropic loads the first 200 lines (or 25KB) of each `MEMORY.md` at sub-agent startup. Flag any `MEMORY.md` over 200 lines so the reasoner knows the tail is being silently truncated.

5. **Cross-reference with brain file Auto-updates.** Implicit — the reasoner combines fingerprints from this output with the main gatherer's `paragraph_fingerprints` to spot overlap.

---

## Output JSON Schema

```json
{
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "project_memory": {
    "memory_dir_present": true|false,
    "reaccumulation_event": true|false,
    "files": [
      {
        "path": "memory/<filename>.md",
        "type": "index|user|feedback|project|reference|other",
        "content": "...",
        "line_count": N,
        "word_count": N,
        "last_modified": "YYYY-MM-DD",
        "tracked_in_git": true|false,
        "first_100_chars": "...",
        "fingerprint": "<hash>"
      }
    ],
    "memory_md_index": {
      "present": true|false,
      "entries": [
        { "name": "...", "description": "...", "path_reference": "...", "file_exists_on_disk": true|false }
      ]
    },
    "git_status": {
      "tracked_files": ["..."],
      "untracked_files": ["..."],
      "total_files_on_disk": N
    }
  },
  "subagent_memory": {
    "subagents": [
      {
        "subagent_name": "browser-agent",
        "definition_exists": true|false,
        "memory_md_present": true|false,
        "memory_md_line_count": N,
        "memory_md_overflow_warning": true|false,
        "total_files": N,
        "files": [
          {
            "path": ".claude/agent-memory/<subagent>/<filename>.md",
            "is_memory_index": true|false,
            "content": "...",
            "line_count": N,
            "word_count": N,
            "last_modified": "YYYY-MM-DD",
            "tracked_in_git": true|false,
            "first_100_chars": "...",
            "fingerprint": "<hash>"
          }
        ],
        "memory_md_referenced_files": [
          { "name": "...", "description": "...", "path_reference": "...", "file_exists_on_disk": true|false }
        ]
      }
    ],
    "orphaned_memory_dirs": [
      "<subagent_name>"
    ]
  },
  "errors": ["..."]
}
```

`orphaned_memory_dirs` lists sub-agent memory directories whose corresponding `.claude/agents/<name>.md` definition no longer exists — the sub-agent was renamed or deleted but its memory stayed. The reasoner flags these for cleanup.

Return ONLY this JSON object, no narrative.

---

## Self-Improvement

If the reasoner needs additional memory measurements (e.g., last-accessed time, content length distribution, or per-file fingerprint granularity), add to procedure here. Note open additions:

- **Memory access logging:** would require a hook on Read tool calls that touch `memory/`. Not yet implemented.
- **Cross-machine drift:** memory is machine-local; cross-machine drift would require comparing this output to a snapshot from another machine. Out of scope.
