#!/usr/bin/env python3
"""Summarise the agent-guardrails audit log as Markdown (or JSON with --json)."""
import argparse
import collections
import json
import os
import sys


def default_log():
    """The log the hooks write: `audit.path` from the merged config, relative to the project directory."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    try:
        import guard  # same scripts directory
        cfg, _warnings = guard.load_config()
        return guard.audit_path(cfg, None)
    except Exception:
        base = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
        return os.path.join(base, ".claude", "guardrails-audit.jsonl")


def load(path, session=None):
    records, bad = [], 0
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except ValueError:
                bad += 1
                continue
            if not isinstance(r, dict):
                bad += 1
                continue
            if session and r.get("session_id") != session:
                continue
            records.append(r)
    return records, bad


def summarize(records, bad=0, top=10):
    by_event = collections.Counter(r.get("event") or "?" for r in records)
    by_tool = collections.Counter(r.get("tool_name") for r in records
                                  if r.get("event") == "post" and r.get("tool_name"))
    blocked = [r for r in records if r.get("decision") == "block"]
    warned = [r for r in records if r.get("decision") == "warn" and r.get("rule")]
    blocks_by_rule = collections.Counter(r.get("rule") or "?" for r in blocked)
    warns_by_rule = collections.Counter(r.get("rule") for r in warned)
    files = collections.Counter(r["file"] for r in records
                                if r.get("file") and r.get("event") == "post")
    cmds = collections.Counter(r["command"] for r in records
                               if r.get("command") and r.get("event") == "post")
    stamps = sorted(r["ts"] for r in records if r.get("ts"))
    sessions = {r.get("session_id") for r in records if r.get("session_id")}
    return {
        "records": len(records),
        "unparseable_lines": bad,
        "sessions": len(sessions),
        "first": stamps[0] if stamps else None,
        "last": stamps[-1] if stamps else None,
        "by_event": dict(by_event),
        "by_tool": dict(by_tool.most_common()),
        "blocks": len(blocked),
        "blocks_by_rule": dict(blocks_by_rule.most_common()),
        "warnings_by_rule": dict(warns_by_rule.most_common()),
        "recent_blocks": [{"ts": r.get("ts"), "rule": r.get("rule"), "summary": r.get("summary")}
                          for r in blocked[-5:]],
        "files_touched": [{"file": f, "count": c} for f, c in files.most_common(top)],
        "top_commands": [{"command": c, "count": n} for c, n in cmds.most_common(top)],
    }


def _esc(s):
    return str(s).replace("|", "\\|").replace("`", "'")


def render(s):
    out = ["# agent-guardrails audit report", ""]
    if not s["records"]:
        return "\n".join(out + ["No audit records found."]) + "\n"
    out += ["- Time range: %s to %s" % (s["first"], s["last"]),
            "- Records: %d across %d session(s)" % (s["records"], s["sessions"]),
            "- Blocked tool calls: %d" % s["blocks"]]
    if s["unparseable_lines"]:
        out.append("- Skipped unparseable lines: %d" % s["unparseable_lines"])
    out += ["", "## Events", "", "| Event | Count |", "|---|---|"]
    out += ["| %s | %d |" % (k, v) for k, v in sorted(s["by_event"].items())]
    out += ["", "## Tool calls by tool", "", "| Tool | Count |", "|---|---|"]
    out += ["| %s | %d |" % (k, v) for k, v in s["by_tool"].items()] or ["| (none) | 0 |"]
    out += ["", "## Blocks by rule", "", "| Rule | Blocks |", "|---|---|"]
    out += ["| %s | %d |" % (k, v) for k, v in s["blocks_by_rule"].items()] or ["| (none) | 0 |"]
    if s["warnings_by_rule"]:
        out += ["", "## Warnings by rule", "", "| Rule | Warnings |", "|---|---|"]
        out += ["| %s | %d |" % (k, v) for k, v in s["warnings_by_rule"].items()]
    if s["recent_blocks"]:
        out += ["", "## Most recent blocks", ""]
        out += ["- %s `%s`: %s" % (b["ts"], b["rule"], _esc(b["summary"])) for b in s["recent_blocks"]]
    out += ["", "## Files touched", ""]
    out += ["- `%s` (%d)" % (_esc(f["file"]), f["count"]) for f in s["files_touched"]] or ["- (none)"]
    out += ["", "## Top commands", ""]
    out += ["- `%s` (%d)" % (_esc(c["command"]), c["count"]) for c in s["top_commands"]] or ["- (none)"]
    return "\n".join(out) + "\n"


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--log", help="path to audit log (default: audit.path from .claude/guardrails.json, else .claude/guardrails-audit.jsonl in the project)")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    ap.add_argument("--session", help="only this session id")
    ap.add_argument("--top", type=int, default=10, help="rows in top lists (default 10)")
    args = ap.parse_args(argv)
    path = args.log or default_log()
    if not os.path.isfile(path):
        msg = "No audit log found at %s (it is created on the first tool call)." % path
        if args.json:
            print(json.dumps({"error": msg}))
        else:
            print(msg)
        return 0
    records, bad = load(path, args.session)
    s = summarize(records, bad, args.top)
    print(json.dumps(s, indent=2) if args.json else render(s), end="" if not args.json else "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
