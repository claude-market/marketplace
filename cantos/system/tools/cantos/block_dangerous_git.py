#!/usr/bin/env python3
"""PreToolUse(Bash) guardrail for the Cantos repo.

Blocks the destructive, hard-to-recover git operations that can wipe another
session's work — without touching the operations pylon and Cantos rely on
every task. Normal `git push`, `git commit`, and soft/mixed `git reset` (recoverable
via reflog) are intentionally allowed. This is the SECOND layer behind worktree
isolation (Pre-Task / Pre-Maintenance gates): when parallel sessions run, a
concurrent session can reset a shared branch and discard another session's
commits, which is why this exists.

Reads the Claude Code hook event JSON on stdin. Exit 2 + stderr message = blocked.
Uses only the stdlib (python3) — no jq dependency that could silently fail.

Matching notes — the patterns are written to survive the known bypasses:
  * Global options BEFORE the subcommand (`git -C . reset --hard`,
    `git --git-dir=/x reset --hard`, `git -c k=v push --force`). The
    subcommand is reached through an "options gap" so `git` need not sit
    immediately before `reset` / `push` / etc.
  * Force pushes expressed as a `+refspec` (`git push origin +main:main`)
    and `--force-with-lease`, not just `--force` / `-f`.
  * `[^\n|&;]*` keeps each match inside a single shell command segment so a
    dangerous flag must belong to the same git invocation, not a later one.

Run `python block_dangerous_git.py --selftest` for the adversarial self-test.
"""
import sys
import json
import re

# Options that may legally sit between `git` and its subcommand. Matching this
# gap lets the patterns fire on `git -C . reset --hard`, `git --git-dir=x push
# --force`, `git -c user.name=y commit`, etc. Git's pre-subcommand options take
# their value either attached (`-C/path`, `--git-dir=x`, `-cuser.name=y`) or as
# the next whitespace-separated token (`-C .`, `-c user.name=y`,
# `--git-dir /x`). We model both. The gap stays inside one command segment
# (no \n | & ;) so it cannot leak across `&&`, `;`, or a pipe. The separate
# value token is restricted to [^\s|&;] so it cannot swallow the subcommand
# across a separator.
_GLOBAL_OPT = (
    r"(?:"
    r"-[Cc]\s+[^\s|&;]+"                       # -C <path> / -c <name=val>
    r"|--(?:git-dir|work-tree|namespace|exec-path)(?:=\S+|\s+[^\s|&;]+)"
    r"|-[A-Za-z]\S*"                            # attached short option (-C., -cx=y)
    r"|--[A-Za-z][\w-]*(?:=\S+)?"               # long option, attached value or none
    r")"
)
GAP = r"(?:\s+" + _GLOBAL_OPT + r")*"

# Each entry: (compiled regex, human reason). Patterns are anchored on `git`,
# allow a global-option gap, then the dangerous subcommand + flag.
PATTERNS = [
    # Force-push: --force / --force-with-lease / -f (in a bundled short flag),
    # OR a +refspec push such as `git push origin +main:main`.
    (re.compile(
        r"\bgit" + GAP + r"\s+push\b[^\n|&;]*"
        r"(?:\s(?:--force(?:-with-lease)?(?:=\S+)?\b|-[A-Za-z]*f[A-Za-z]*\b)"
        r"|\s\+\S+)"),
     "force-push (rewrites remote history — covers --force, --force-with-lease, -f, and +refspec)"),
    (re.compile(r"\bgit" + GAP + r"\s+reset\b[^\n|&;]*\s--hard\b"),
     "reset --hard (discards commits AND uncommitted working-tree changes)"),
    (re.compile(r"\bgit" + GAP + r"\s+clean\b[^\n|&;]*-[a-zA-Z]*f"),
     "clean -f (deletes untracked files — can wipe another session's WIP)"),
    (re.compile(r"\bgit" + GAP + r"\s+branch\b[^\n|&;]*\s-D\b"),
     "branch -D (force-deletes a branch, possibly unmerged)"),
    (re.compile(r"\bgit" + GAP + r"\s+checkout\b[^\n|&;]*\s(?:--\s+)?\.(?:\s|$)"),
     "checkout . (discards ALL uncommitted working-tree changes)"),
    (re.compile(r"\bgit" + GAP + r"\s+restore\b[^\n|&;]*\s(?:--\s+)?\.(?:\s|$)"),
     "restore . (discards ALL uncommitted working-tree changes)"),
]


def reason_blocked(command):
    """Return the human reason string if the command is destructive, else None."""
    for pat, why in PATTERNS:
        if pat.search(command):
            return why
    return None


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # Unrecognized payload — never block on parse failure.

    cmd = (data.get("tool_input") or {}).get("command") or ""
    if not isinstance(cmd, str) or not cmd.strip():
        sys.exit(0)

    why = reason_blocked(cmd)
    if why:
        sys.stderr.write(
            "BLOCKED: this command matches a destructive git pattern — " + why + ".\n"
            "Command: " + cmd + "\n"
            "Parallel Cantos sessions may be running; destructive git ops on a shared branch "
            "can wipe another session's commits, so you do not have authority to run this. "
            "Use worktree isolation instead. If it is genuinely required, ask the user to "
            "run it themselves.\n"
        )
        sys.exit(2)
    sys.exit(0)


def _selftest():
    """Adversarial self-test. Run `python block_dangerous_git.py --selftest`.

    Exits 0 if all expectations hold, 1 otherwise. Covers the documented
    bypasses (global options before the subcommand, +refspec, --force-with-lease)
    and confirms ordinary git stays allowed.
    """
    BLOCK = [
        "git reset --hard HEAD",
        "git -C . reset --hard HEAD",
        "git --git-dir=/repo/.git reset --hard",
        "git push --force",
        "git push -f origin main",
        "git push --force-with-lease",
        "git push origin +main:main",
        "git -c user.name=x push --force origin main",
        "git clean -fd",
        "git branch -D feature",
        "git checkout .",
        "git checkout -- .",
        "git restore .",
    ]
    ALLOW = [
        "git commit -m 'wip'",
        "git push origin main",
        "git push -u origin feature",
        "git status",
        "git reset HEAD~1",
        "git reset --soft HEAD~1",
        "git reset --mixed HEAD",
        "git checkout main",
        "git checkout -b feature",
        "git restore --staged file.py",
        "git log --oneline",
        "git diff",
    ]
    failures = []
    for c in BLOCK:
        if reason_blocked(c) is None:
            failures.append("SHOULD BLOCK but allowed: " + c)
    for c in ALLOW:
        r = reason_blocked(c)
        if r is not None:
            failures.append("SHOULD ALLOW but blocked (" + r + "): " + c)
    if failures:
        for f in failures:
            sys.stderr.write(f + "\n")
        sys.stderr.write("SELFTEST FAILED: %d case(s)\n" % len(failures))
        sys.exit(1)
    sys.stdout.write("SELFTEST PASSED: %d block + %d allow cases\n"
                     % (len(BLOCK), len(ALLOW)))
    sys.exit(0)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--selftest":
        _selftest()
    main()
