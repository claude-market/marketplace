#!/usr/bin/env python3
"""
file_usage_audit.py — On-demand instruction-file usage auditor for the Cantos system.

Scans this project's Claude Code session transcripts and reports how often each
ON-DEMAND instruction/reference file has been Read across all sessions, plus a
NEVER-READ list of files that exist on disk but no recorded session ever consulted.

Why on-demand only: @-imported files (brain files, CLAUDE.md imports, rules) load
every session unconditionally — "are they used?" is already answered (always, by
force). The files where usage is a real question are the on-demand ones:
references/*, workflows/*, .claude/skills/*, .assistants/*/sub-agents/*,
projects/*/context.md. A Read tool call records the absolute file_path; @-imports
do NOT appear as Reads, so this tracker sees exactly the trackable (prunable)
surface and nothing it cannot.

Usage:
    python3 tools/cantos/file_usage_audit.py          # full report
    python3 tools/cantos/file_usage_audit.py --json   # machine-readable
    python3 tools/cantos/file_usage_audit.py --never  # only the dead-file list

Usage is counted from two tool calls: the Read tool (file_path) AND the Skill
tool (a local skill invoked by name loads its SKILL.md WITHOUT a Read, so a
Read-only scan would wrongly flag every actively-used skill as dead). Both are
folded into the counts below.

Limitations:
    - Blind to @-imported files (by design — they aren't usage-gated).
    - Named sub-agents dispatched via the Task tool (subagent_type) do not appear
      as Reads, and the subagent_type -> file mapping is ambiguous (many are
      built-in agents), so a sub-agent's count reflects only prose-template reads
      by path. A "never read" sub-agent may still be dispatched by name — treat the
      sub-agent rows as a floor, not a verdict.
    - "Never read" means the file's trigger never fired in a recorded session; it
      is a candidate for migration/pruning, NOT an automatic delete. Human judgment
      at /wrap or audit_brain_files decides.

This is Option A (retroactive transcript scan) from the 2026-06-02 file-usage
investigation. Option B — a live PostToolUse hook appending each Read to
logs/cantos/file-usage.jsonl, rolled up here — is documented but intentionally
unwired (same opt-in posture as brain_update_hook.py). To activate it later: add a
PostToolUse hook matching "Read" in .claude/settings.json that appends
{timestamp, file_path} to logs/cantos/file-usage.jsonl, and add a --live mode here
that reads that log instead of the transcripts.
"""

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def _transcript_dir():
    """Locate ~/.claude/projects/<slug> for this project.

    Claude Code's slug replaces every non-alphanumeric run in the absolute
    path with a single hyphen (so `claude_code` -> `claude-code`, not
    `claude_code`). Derive that, and fall back to a name-suffix glob if the
    exact slug ever differs.
    """
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", str(PROJECT_ROOT))
    base = Path.home() / ".claude" / "projects"
    candidate = base / slug
    if candidate.is_dir():
        return candidate
    if base.is_dir():
        matches = sorted(base.glob(f"*{PROJECT_ROOT.name}"))
        if matches:
            return matches[0]
    return candidate


TRANSCRIPT_DIR = _transcript_dir()

# The on-demand instruction surface — files where "is this used?" is a real
# question. Globs are relative to PROJECT_ROOT.
ON_DEMAND_GLOBS = [
    "references/*.md",
    "workflows/*/*.md",
    ".claude/skills/*/SKILL.md",
    ".assistants/*/sub-agents/*.md",
    "projects/*/context.md",
]

# @-imported / always-loaded files — excluded from the dead-file verdict because
# they load every session by force, not by choice.
ALWAYS_LOADED = {
    "references/claude-code-foundations.md",
    "references/brain-file-architecture.md",
    "references/system-architecture.md",
    "references/wat-framework.md",
    "references/doc-best-practices.md",
}


def _iter_tool_uses(transcript_dir, tool_name):
    """Yield (input_dict, timestamp) for every tool_use of `tool_name` across all transcripts."""
    transcript_dir = Path(transcript_dir)
    if not transcript_dir.is_dir():
        return
    needle = f'"{tool_name}"'
    for jsonl in sorted(transcript_dir.glob("*.jsonl")):
        try:
            with jsonl.open() as f:
                for raw in f:
                    raw = raw.strip()
                    # Cheap pre-filter before the JSON parse.
                    if not raw or '"tool_use"' not in raw or needle not in raw:
                        continue
                    try:
                        entry = json.loads(raw)
                    except json.JSONDecodeError:
                        continue
                    ts = entry.get("timestamp", "")
                    msg = entry.get("message", entry)
                    content = msg.get("content", "")
                    if not isinstance(content, list):
                        continue
                    for block in content:
                        if (isinstance(block, dict)
                                and block.get("type") == "tool_use"
                                and block.get("name") == tool_name):
                            yield (block.get("input") or {}), ts
        except OSError:
            continue


def iter_read_paths(transcript_dir):
    """Yield (abs_file_path, timestamp) for every Read tool_use across all transcripts."""
    for inp, ts in _iter_tool_uses(transcript_dir, "Read"):
        fp = inp.get("file_path", "")
        if fp:
            yield fp, ts


def iter_skill_invocations(transcript_dir):
    """Yield (skill_name, timestamp) for every Skill tool_use.

    Only bare local skill names are yielded; plugin skills ("plugin:skill") are
    skipped because they have no local SKILL.md under .claude/skills/.
    """
    for inp, ts in _iter_tool_uses(transcript_dir, "Skill"):
        name = (inp.get("skill") or "").strip()
        if name and ":" not in name:
            yield name, ts


def rel_to_project(abs_path):
    """Return the project-relative path string, or None if outside the project."""
    try:
        return str(Path(abs_path).resolve().relative_to(PROJECT_ROOT))
    except (ValueError, OSError):
        return None


def collect_on_demand_files():
    """All on-demand instruction files that exist on disk (project-relative)."""
    found = set()
    for glob in ON_DEMAND_GLOBS:
        for p in PROJECT_ROOT.glob(glob):
            rel = rel_to_project(p)
            if rel and rel not in ALWAYS_LOADED:
                found.add(rel)
    return found


def build_report():
    counts = defaultdict(int)
    last_seen = {}

    def bump(rel, ts):
        counts[rel] += 1
        if ts and (rel not in last_seen or ts > last_seen[rel]):
            last_seen[rel] = ts

    # Read tool — direct file opens (references, workflows, sub-agent prose templates, contexts).
    for abs_fp, ts in iter_read_paths(TRANSCRIPT_DIR):
        rel = rel_to_project(abs_fp)
        if rel is not None:
            bump(rel, ts)

    # Skill tool — a local skill loads its SKILL.md without a Read; count it as usage.
    for skill_name, ts in iter_skill_invocations(TRANSCRIPT_DIR):
        rel = f".claude/skills/{skill_name}/SKILL.md"
        if (PROJECT_ROOT / rel).is_file():
            bump(rel, ts)

    on_disk = collect_on_demand_files()
    used = {f: counts[f] for f in on_disk if counts.get(f, 0) > 0}
    never = sorted(f for f in on_disk if counts.get(f, 0) == 0)
    ranked = sorted(used.items(), key=lambda kv: (-kv[1], kv[0]))
    n_sessions = len(list(TRANSCRIPT_DIR.glob("*.jsonl"))) if TRANSCRIPT_DIR.is_dir() else 0
    return {
        "ranked": [
            {"file": f, "reads": n, "last_read": last_seen.get(f, "")[:10]}
            for f, n in ranked
        ],
        "never_read": never,
        "on_demand_total": len(on_disk),
        "transcript_count": n_sessions,
    }


def main():
    args = set(sys.argv[1:])
    report = build_report()

    if "--json" in args:
        print(json.dumps(report, indent=2))
        return

    if "--never" in args:
        print(f"NEVER-READ on-demand files "
              f"({len(report['never_read'])} of {report['on_demand_total']}):")
        for f in report["never_read"]:
            print(f"  {f}")
        return

    print(f"File-usage audit — {report['transcript_count']} sessions scanned, "
          f"{report['on_demand_total']} on-demand files on disk\n")
    print("Most-read on-demand files (reads | last read | file):")
    for row in report["ranked"][:25]:
        print(f"  {row['reads']:>4}  {row['last_read'] or '----------':>10}  {row['file']}")
    print(f"\nNEVER read in any recorded session ({len(report['never_read'])}):")
    for f in report["never_read"]:
        print(f"  {f}")
    print("\nNote: counts fold in both Read and Skill tool calls. @-imported files "
          "are excluded (they load every session by force). Named sub-agents "
          "dispatched via Task under-count (see header). A never-read file is a "
          "migration/prune CANDIDATE — its trigger may simply never have fired. "
          "Human judgment decides.")


if __name__ == "__main__":
    main()
