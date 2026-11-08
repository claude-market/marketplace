#!/usr/bin/env python3
"""Write .claude/guardrails.json and a commented guardrails.example.jsonc."""
import argparse
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dir", help="project directory (default: $CLAUDE_PROJECT_DIR or cwd)")
    ap.add_argument("--policy", help="starter policy: strict-fintech, oss-maintainer, agency-client-work")
    ap.add_argument("--force", action="store_true", help="overwrite existing files")
    args = ap.parse_args(argv)
    proj = args.dir or os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    if args.policy:
        src = os.path.join(ROOT, "config", "policies", args.policy + ".json")
        if not os.path.isfile(src):
            print("Unknown policy '%s'." % args.policy, file=sys.stderr)
            return 1
    else:
        src = os.path.join(ROOT, "config", "default.json")
    outdir = os.path.join(proj, ".claude")
    os.makedirs(outdir, exist_ok=True)
    targets = [(src, os.path.join(outdir, "guardrails.json")),
               (os.path.join(ROOT, "config", "guardrails.example.jsonc"),
                os.path.join(outdir, "guardrails.example.jsonc"))]
    status = 0
    for s, d in targets:
        if os.path.exists(d) and not args.force:
            print("Exists, not overwritten (use --force): %s" % d)
            status = 1 if d.endswith("guardrails.json") else status
            continue
        shutil.copyfile(s, d)
        print("Wrote %s" % d)
    return status


if __name__ == "__main__":
    sys.exit(main())
