#!/usr/bin/env python3
"""agent-guardrails policy engine.

Invoked by Claude Code hooks: ``guard.py --event pre-bash|pre-edit|post|stop``.
Reads the hook JSON from stdin. Exit 2 (plus stderr reason and a JSON deny
decision on stdout) blocks a PreToolUse call; exit 0 allows it.
Standard library only.
"""
import argparse
import datetime
import fnmatch
import json
import os
import re
import shlex
import sys

PREFIX = "[agent-guardrails]"
PLUGIN_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALLOW_MARKER = "guardrails:allow"

# ---------------------------------------------------------------- config

def deep_merge(base, over):
    out = dict(base)
    for k, v in over.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def _read_json(path):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if not isinstance(data, dict):
        raise ValueError("config root must be an object")
    return data


def project_dir(payload=None):
    d = os.environ.get("CLAUDE_PROJECT_DIR")
    if not d and isinstance(payload, dict):
        d = payload.get("cwd")
    return d or os.getcwd()


def load_config(payload=None):
    """Return (config, warnings). First project config found is merged over defaults."""
    warnings = []
    try:
        cfg = _read_json(os.path.join(PLUGIN_ROOT, "config", "default.json"))
    except Exception as exc:  # pragma: no cover - broken install
        warnings.append("default config unreadable: %s" % exc)
        cfg = {"rules": {}, "audit": {"enabled": True}}
    candidates = []
    env_dir = os.environ.get("CLAUDE_PROJECT_DIR")
    if env_dir:
        candidates.append(os.path.join(env_dir, ".claude", "guardrails.json"))
    candidates.append(os.path.join(os.getcwd(), ".claude", "guardrails.json"))
    if isinstance(payload, dict) and payload.get("cwd"):
        candidates.append(os.path.join(payload["cwd"], ".claude", "guardrails.json"))
    for path in candidates:
        if os.path.isfile(path):
            try:
                cfg = deep_merge(cfg, _read_json(path))
            except Exception as exc:
                warnings.append("invalid config %s: %s (using defaults)" % (path, exc))
            break
    return cfg, warnings


def rule_cfg(cfg, name):
    r = (cfg.get("rules") or {}).get(name) or {}
    return r if isinstance(r, dict) else {}

# ---------------------------------------------------------------- audit

SECRET_PATTERNS = [
    ("aws-access-key", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("private-key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----")),
    ("github-token", re.compile(r"ghp_[A-Za-z0-9]{36}")),
    ("github-pat", re.compile(r"github_pat_[A-Za-z0-9_]{20,}")),
    ("slack-token", re.compile(r"xox[baprs]-[A-Za-z0-9-]{8,}")),
    ("stripe-live-key", re.compile(r"sk_live_[A-Za-z0-9]{8,}")),
    ("generic-credential", re.compile(
        r"(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][^'\"]{12,}", re.I)),
]


def redact(text):
    """Remove secret-looking values from text destined for the audit log."""
    if not text:
        return text
    for _name, rx in SECRET_PATTERNS:
        if _name == "generic-credential":
            text = rx.sub(lambda m: m.group(1) + "=[REDACTED]", text)
        else:
            text = rx.sub("[REDACTED]", text)
    return text


def truncate(text, n=200):
    text = " ".join(str(text).split())
    return text if len(text) <= n else text[: n - 3] + "..."


def audit_path(cfg, payload):
    a = cfg.get("audit") or {}
    p = a.get("path") or ".claude/guardrails-audit.jsonl"
    if not os.path.isabs(p):
        p = os.path.join(project_dir(payload), p)
    return p


def write_audit(cfg, payload, record):
    a = cfg.get("audit") or {}
    if a.get("enabled") is False:
        return
    try:
        path = audit_path(cfg, payload)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception as exc:
        sys.stderr.write("%s audit: could not write log (%s)\n" % (PREFIX, exc))


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def summarize_tool(payload):
    """Return (summary, command, file) - all redacted, never full contents."""
    ti = payload.get("tool_input") or {}
    if not isinstance(ti, dict):
        ti = {}
    tool = payload.get("tool_name") or ""
    command = fpath = None
    if tool == "Bash" or "command" in ti:
        command = truncate(redact(str(ti.get("command", ""))))
        summary = command
    elif ti.get("file_path") or ti.get("path"):
        fpath = str(ti.get("file_path") or ti.get("path"))
        size = 0
        if "content" in ti:
            size = len(str(ti.get("content", "")))
        elif "new_string" in ti:
            size = len(str(ti.get("new_string", "")))
        elif isinstance(ti.get("edits"), list):
            size = sum(len(str(e.get("new_string", ""))) for e in ti["edits"] if isinstance(e, dict))
        summary = "%s (%d chars)" % (truncate(fpath, 150), size) if size else truncate(fpath, 150)
    else:
        summary = truncate(", ".join(sorted(ti.keys()))) if ti else ""
    return summary, command, fpath


def make_record(payload, event, decision, rule=None, reason=None):
    summary, command, fpath = summarize_tool(payload)
    rec = {
        "ts": now_iso(),
        "session_id": payload.get("session_id"),
        "event": event,
        "tool_name": payload.get("tool_name"),
        "summary": summary,
        "decision": decision,
        "rule": rule,
    }
    if command:
        rec["command"] = command
    if fpath:
        rec["file"] = fpath
    if reason:
        rec["reason"] = truncate(redact(reason), 300)
    return rec

# ---------------------------------------------------------------- globs

_glob_cache = {}


def glob_to_regex(pat):
    if pat in _glob_cache:
        return _glob_cache[pat]
    i, out = 0, ""
    while i < len(pat):
        c = pat[i]
        if pat.startswith("**/", i):
            out += "(?:.*/)?"
            i += 3
        elif pat.startswith("**", i):
            out += ".*"
            i += 2
        elif c == "*":
            out += "[^/]*"
            i += 1
        elif c == "?":
            out += "[^/]"
            i += 1
        else:
            out += re.escape(c)
            i += 1
    rx = re.compile(out + r"\Z", re.S)
    _glob_cache[pat] = rx
    return rx


def match_glob(pat, path):
    """Slash-less patterns match any path component; others match the whole path."""
    pat = pat.strip()
    if not pat:
        return False
    if pat.startswith("./"):
        pat = pat[2:]
    if "/" not in pat:
        rx = glob_to_regex(pat)
        return any(rx.match(part) for part in path.split("/") if part)
    return bool(glob_to_regex(pat).match(path))


def match_any(pats, path):
    return any(match_glob(p, path) for p in (pats or []))


def rel_path(fp, payload):
    cwd = (payload.get("cwd") if isinstance(payload, dict) else None) or os.getcwd()
    root = project_dir(payload)
    full = os.path.normpath(fp if os.path.isabs(fp) else os.path.join(cwd, fp))
    try:
        r = os.path.relpath(full, root)
        if not r.startswith(".."):
            return r.replace(os.sep, "/")
    except ValueError:
        pass
    return full.replace(os.sep, "/")

# ---------------------------------------------------------------- rules: shell

REGEX_DESTRUCTIVE = [
    ("rm -rf on root, home or working directory", re.compile(
        r"\brm\s+(?:-{1,2}[A-Za-z-]+\s+)*?(?:-[A-Za-z]*[rR][A-Za-z]*|--recursive)\s+(?:-{1,2}[A-Za-z-]+\s+)*"
        r"[\"']?(?:/|/\*|~|~/|~/\*|\$HOME|\$\{HOME\}|\.|\./|\./\*|\.\.|\*)[\"']?(?=\s|$|;|&|\|)")),
    ("DROP TABLE/DATABASE", re.compile(r"\bdrop\s+(?:table|database|schema)\b", re.I)),
    ("truncate", re.compile(r"(?:^|[;&|(]\s*|\bsudo\s+)truncate\s+\S|\btruncate\s+table\b", re.I)),
    ("mkfs", re.compile(r"\bmkfs(?:\.\w+)?\b")),
    ("dd if=", re.compile(r"\bdd\s+(?:\S+\s+)*?if=")),
    ("chmod -R 777", re.compile(r"\bchmod\s+(?:-\w+\s+)*(?:-\w*R\w*|--recursive)\s+(?:-\w+\s+)*(?:0?777|a\+rwx)\b")),
    ("pipe remote script to shell", re.compile(
        r"\b(?:curl|wget)\b[^|;&\n]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh|dash|ksh)\b")),
    ("fork bomb", re.compile(r":\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:")),
]

_SEG_SPLIT = re.compile(r"\s*(?:&&|\|\||;|\||\n)\s*")


def _tokens(seg):
    try:
        return shlex.split(seg)
    except ValueError:
        return seg.split()


def _git_calls(command):
    """Yield (subcommand, args) for each git invocation in the command line."""
    for seg in _SEG_SPLIT.split(command):
        toks = _tokens(seg)
        if "git" not in toks:
            continue
        i = toks.index("git") + 1
        while i < len(toks) and toks[i].startswith("-"):
            i += 2 if toks[i] in ("-C", "-c", "--git-dir", "--work-tree") else 1
        if i < len(toks):
            yield toks[i], toks[i + 1:]


def _branch_name(ref):
    ref = ref.lstrip("+")
    if ":" in ref:
        ref = ref.split(":", 1)[1]
    if ref.startswith("refs/heads/"):
        ref = ref[len("refs/heads/"):]
    return ref


def branch_protected(name, protected):
    """True if name equals a protected entry or matches one as an fnmatch glob (e.g. release/*)."""
    for p in protected or []:
        if not isinstance(p, str):
            continue
        if name == p or (any(c in p for c in "*?[") and fnmatch.fnmatchcase(name, p)):
            return True
    return False


def git_findings(command, protected):
    found = []
    prot = protected or []
    for sub, args in _git_calls(command):
        flags = [a for a in args if a.startswith("-")]
        pos = [a for a in args if not a.startswith("-")]
        if sub == "push":
            force = any(f in ("-f", "--force") or f.startswith("--force-with-lease")
                        or (not f.startswith("--") and "f" in f[1:]) for f in flags)
            delete = "--delete" in flags or any(not f.startswith("--") and "d" in f[1:] for f in flags)
            refspecs = pos[1:]
            hit = False
            for ref in refspecs:
                plus = ref.startswith("+")
                is_del = ref.startswith(":") or delete
                name = _branch_name(ref)
                if (force or plus or is_del) and (branch_protected(name, prot) or name == "HEAD"):
                    found.append("git push --force/delete targeting protected branch '%s'" % name)
                    hit = True
            if force and not refspecs and not hit:
                found.append("git push --force without an explicit non-protected branch")
            elif force and ("--all" in flags or "--mirror" in flags):
                found.append("git push --force with --all/--mirror")
        elif sub == "reset" and "--hard" in flags:
            found.append("git reset --hard (discards uncommitted work)")
        elif sub == "clean":
            letters = "".join(f[1:] for f in flags if not f.startswith("--"))
            force = "f" in letters or "--force" in flags
            if force and "d" in letters:
                found.append("git clean -fd (deletes untracked files)")
        elif sub == "branch":
            hard = "-D" in flags or ("--delete" in flags and ("--force" in flags or "-f" in flags))
            bad = [p for p in pos if branch_protected(p, prot)]
            if hard and bad:
                found.append("git branch -D on protected branch '%s'" % bad[0])
    return found


def check_destructive(cfg, command):
    rc = rule_cfg(cfg, "destructive_shell")
    for pat in rc.get("allow_patterns") or []:
        try:
            if re.search(pat, command):
                return []
        except re.error:
            continue
    found = [d for d, rx in REGEX_DESTRUCTIVE if rx.search(command)]
    found += git_findings(command, cfg.get("protected_branches") or [])
    for pat in rc.get("extra_patterns") or []:
        try:
            if re.search(pat, command):
                found.append("custom pattern /%s/" % pat)
        except re.error:
            continue
    return found


def check_scope_shell(cfg, command):
    """Blocked commands match on word boundaries: "ssh" matches "ssh host" but not "ssh-keygen" or "sshfs"."""
    rc = rule_cfg(cfg, "scope_shell")
    norm = " ".join(command.lower().split())
    out = []
    for b in rc.get("blocked_commands") or []:
        nb = " ".join(str(b).lower().split())
        if nb and re.search(r"(?<![\w.-])" + re.escape(nb) + r"(?![\w-])", norm):
            out.append(b)
    return out

# ---------------------------------------------------------------- rules: edit

def new_contents(tool_input):
    """All text the tool call would introduce."""
    parts = []
    for key in ("content", "new_string"):
        if isinstance(tool_input.get(key), str):
            parts.append(tool_input[key])
    for e in tool_input.get("edits") or []:
        if isinstance(e, dict) and isinstance(e.get("new_string"), str):
            parts.append(e["new_string"])
    return "\n".join(parts)


def scan_secrets_modes(cfg, text):
    """Return [(name, mode)] of matched patterns. Built-in, extra_patterns and string
    entries use the rule's mode; object entries in `patterns` may set their own."""
    rc = rule_cfg(cfg, "secrets_in_content")
    default_mode = rc.get("mode", "block")
    pats = [(n, rx, default_mode) for n, rx in SECRET_PATTERNS]
    entries = [(None, p, None) for p in rc.get("extra_patterns") or []]
    for p in rc.get("patterns") or []:
        if isinstance(p, str):
            entries.append((None, p, None))
        elif isinstance(p, dict) and isinstance(p.get("regex"), str):
            mode = p.get("mode")
            entries.append((p.get("name"), p["regex"], mode if mode in ("block", "warn") else None))
    for name, regex, mode in entries:
        try:
            pats.append((name or "custom", re.compile(regex), mode or default_mode))
        except re.error:
            continue
    marker_ok = bool(rc.get("inline_allow_marker", False))
    found = []
    for line in text.splitlines():
        if marker_ok and ALLOW_MARKER in line:
            continue
        for name, rx, mode in pats:
            if rx.search(line) and (name, mode) not in found:
                found.append((name, mode))
    return found


def scan_secrets(cfg, text):
    names = []
    for name, _mode in scan_secrets_modes(cfg, text):
        if name not in names:
            names.append(name)
    return names


def always_protected(cfg, payload):
    """Files the agent may never edit regardless of the policy's `paths` list: the active policy and the audit log."""
    pats = [".claude/guardrails.json", ".claude/guardrails.*.json"]
    a = cfg.get("audit") or {}
    p = a.get("path") or ".claude/guardrails-audit.jsonl"
    if os.path.isabs(p):
        try:
            r = os.path.relpath(p, project_dir(payload))
        except ValueError:
            r = ".."
        p = None if r.startswith("..") else r
    if p:
        p = os.path.normpath(p).replace(os.sep, "/")
        if p.startswith("./"):
            p = p[2:]
        pats.append(p)
    return pats


def check_paths(cfg, payload, rel):
    rc = rule_cfg(cfg, "protected_paths")
    out = []
    if match_any(rc.get("allow_paths"), rel):
        return out
    scope = rc.get("scope") or {}
    scope_allows = bool(scope.get("enabled") and scope.get("allowed_paths")
                        and match_any(scope["allowed_paths"], rel))
    hit = next((p for p in rc.get("paths") or [] if match_glob(p, rel)), None)
    if hit and scope_allows and rc.get("allow_paths_override_scope", False):
        hit = None  # opt-in: scope.allowed_paths overrides protected globs
    if hit:
        out.append(("protected_paths", "'%s' matches protected path '%s'" % (rel, hit)))
    else:
        always = next((p for p in always_protected(cfg, payload) if match_glob(p, rel)), None)
        if always:
            out.append(("protected_paths", "'%s' is a guardrails file (%s) and is always protected" % (rel, always)))
    if scope.get("enabled") and scope.get("allowed_paths") and not match_any(scope["allowed_paths"], rel):
        out.append(("protected_paths", "'%s' is outside the allowed scope %s" % (rel, scope["allowed_paths"])))
    return out

# ---------------------------------------------------------------- decisions

HINT = ("Policy: .claude/guardrails.json (%s). "
        "Agent: do not change the policy; take a safer approach or ask the user.")
HINT_DESTRUCTIVE = ('a human can add a regex to rules.destructive_shell.allow_patterns, '
                    'or set rules.destructive_shell.mode to "warn"')
HINT_SCOPE = "a human can remove it from rules.scope_shell.blocked_commands"
HINT_PATHS = ("a human can add this file to rules.protected_paths.allow_paths, "
              "or adjust rules.protected_paths.paths / scope.allowed_paths")
HINT_SECRETS = "a human can add the path to rules.secrets_in_content.ignore_paths"
HINT_SECRETS_MARKER = HINT_SECRETS + ", or mark the line with '%s'" % ALLOW_MARKER


def reason_text(rule, detail, hint):
    return "%s %s: %s %s" % (PREFIX, rule, detail, HINT % hint)


_SHELL_RM_CLAUDE = re.compile(r"\b(?:rm|rmdir|mv)\b[^|;&\n]*(?<![\w.-])\.claude/?(?=[\s;&|'\"]|$)")


def guardrails_needles(cfg, payload):
    """(path, regex) pairs for the guardrails files a shell command must not name.
    `protected_paths.allow_paths` exempts a file here exactly as it does for Edit/Write."""
    rc = rule_cfg(cfg, "protected_paths")
    allow = rc.get("allow_paths") or []
    out = []
    for p in always_protected(cfg, payload):
        if p in allow or (not any(c in p for c in "*?[") and match_any(allow, p)):
            continue
        rx = re.escape(os.path.basename(p)).replace(r"\*", r"[\w.-]+")
        out.append((p, re.compile(r"(?<![\w.-])" + rx + r"(?![\w-])")))
    return out


def check_shell_guardrails(cfg, payload, command):
    """A shell command that names the policy or the audit log is refused, whether it reads or
    writes: the agent can read the policy with the Read tool, and the Edit/Write protection of
    these files would mean little if `echo > .claude/guardrails.json` went through."""
    for p, rx in guardrails_needles(cfg, payload):
        if rx.search(command):
            return ["command refers to guardrails file '%s'" % p]
    if _SHELL_RM_CLAUDE.search(command):
        return ["command removes or moves the .claude directory (policy and audit log)"]
    return []


def evaluate(cfg, payload, event):
    """Return list of (rule, mode, reason) findings."""
    ti = payload.get("tool_input")
    ti = ti if isinstance(ti, dict) else {}
    findings = []
    if event == "pre-bash":
        command = str(ti.get("command") or "")
        rc = rule_cfg(cfg, "destructive_shell")
        if rc.get("enabled", True):
            for d in check_destructive(cfg, command):
                findings.append(("destructive_shell", rc.get("mode", "block"), reason_text(
                    "destructive_shell", "blocked - " + d + ".",
                    HINT_DESTRUCTIVE)))
        rc = rule_cfg(cfg, "scope_shell")
        if rc.get("enabled", False):
            for b in check_scope_shell(cfg, command):
                findings.append(("scope_shell", rc.get("mode", "block"), reason_text(
                    "scope_shell", "blocked - command contains banned text '%s'." % b,
                    HINT_SCOPE)))
        rc = rule_cfg(cfg, "protected_paths")
        if rc.get("enabled", True):
            for d in check_shell_guardrails(cfg, payload, command):
                findings.append(("protected_paths", rc.get("mode", "block"), reason_text(
                    "protected_paths", "blocked - " + d + ".", HINT_PATHS)))
    elif event == "pre-edit":
        fp = ti.get("file_path") or ti.get("path")
        rel = rel_path(str(fp), payload) if fp else None
        rc = rule_cfg(cfg, "protected_paths")
        if rel and rc.get("enabled", True):
            for rule, detail in check_paths(cfg, payload, rel):
                findings.append((rule, rc.get("mode", "block"), reason_text(
                    rule, "blocked - " + detail + ".",
                    HINT_PATHS)))
        rc = rule_cfg(cfg, "secrets_in_content")
        if rc.get("enabled", True) and not (rel and match_any(rc.get("ignore_paths"), rel)):
            hits = scan_secrets_modes(cfg, new_contents(ti))
            for mode in ("block", "warn"):
                names = []
                for n, m in hits:
                    if m == mode and n not in names:
                        names.append(n)
                if names:
                    findings.append(("secrets_in_content", mode, reason_text(
                        "secrets_in_content", "blocked - content looks like a secret (%s) in '%s'; value not shown." % (
                            ", ".join(names), rel or "?"),
                        HINT_SECRETS_MARKER if rc.get("inline_allow_marker") else HINT_SECRETS)))
    return findings


def deny(reason):
    out = {"hookSpecificOutput": {"hookEventName": "PreToolUse",
                                  "permissionDecision": "deny",
                                  "permissionDecisionReason": reason}}
    sys.stdout.write(json.dumps(out) + "\n")
    sys.stderr.write(reason + "\n")
    sys.stdout.flush()
    sys.stderr.flush()
    return 2


def session_summary(cfg, payload):
    path = audit_path(cfg, payload)
    sid = payload.get("session_id")
    calls = blocks = warns = 0
    files = set()
    try:
        with open(path, "r", encoding="utf-8") as fh:
            for line in fh:
                try:
                    r = json.loads(line)
                except ValueError:
                    continue
                if r.get("session_id") != sid or r.get("event") == "stop":
                    continue
                if r.get("event") == "post":
                    calls += 1
                    if r.get("file"):
                        files.add(r["file"])
                if r.get("decision") == "block":
                    blocks += 1
                elif r.get("decision") == "warn":
                    warns += 1
    except OSError:
        pass
    return "session summary: %d tool calls, %d blocked, %d warnings, %d files touched" % (
        calls, blocks, warns, len(files))


def run(event, raw):
    payload = None
    try:
        payload = json.loads(raw) if raw.strip() else None
    except ValueError:
        payload = None
    cfg, warnings = load_config(payload if isinstance(payload, dict) else None)
    is_pre = event in ("pre-bash", "pre-edit")
    stub = payload if isinstance(payload, dict) else {}
    for w in warnings:
        sys.stderr.write("%s warning: %s\n" % (PREFIX, w))
        write_audit(cfg, stub, make_record(stub, "warning", "warn", None, w))

    if not isinstance(payload, dict):
        msg = "empty or non-JSON hook input"
        write_audit(cfg, stub, make_record(stub, "warning", "warn", "input", msg))
        if is_pre and cfg.get("fail_closed"):
            return deny("%s fail_closed: blocked - %s. %s" % (PREFIX, msg, HINT % "a human can set fail_closed to false"))
        sys.stderr.write("%s warning: %s; allowing (fail open)\n" % (PREFIX, msg))
        return 0

    if event == "post":
        write_audit(cfg, payload, make_record(payload, "post", "allow"))
        return 0
    if event == "stop":
        rec = make_record(payload, "stop", "allow")
        rec["summary"] = session_summary(cfg, payload)
        write_audit(cfg, payload, rec)
        return 0

    findings = evaluate(cfg, payload, event)
    blocks = [f for f in findings if f[1] != "warn"]
    for rule, mode, reason in findings:
        if mode == "warn":
            sys.stderr.write(reason.replace("blocked - ", "warning - ") + "\n")
            write_audit(cfg, payload, make_record(payload, event, "warn", rule, reason))
    if blocks:
        rule, _mode, reason = blocks[0]
        write_audit(cfg, payload, make_record(payload, event, "block", rule, reason))
        return deny(reason)
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(description="agent-guardrails hook handler")
    ap.add_argument("--event", required=True, choices=["pre-bash", "pre-edit", "post", "stop"])
    args = ap.parse_args(argv)
    try:
        raw = sys.stdin.read()
    except Exception:
        raw = ""
    try:
        return run(args.event, raw)
    except Exception as exc:  # never crash the agent loop by accident
        sys.stderr.write("%s internal error: %s\n" % (PREFIX, exc))
        try:
            cfg, _ = load_config(None)
        except Exception:
            cfg = {}
        if args.event.startswith("pre-") and cfg.get("fail_closed"):
            return deny("%s fail_closed: blocked - internal error (%s)." % (PREFIX, exc))
        return 0


if __name__ == "__main__":
    sys.exit(main())
