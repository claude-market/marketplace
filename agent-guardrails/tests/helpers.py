import json
import os
import subprocess
import sys
import tempfile
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUARD = os.path.join(ROOT, "scripts", "guard.py")


class Result:
    def __init__(self, cp):
        self.code, self.out, self.err = cp.returncode, cp.stdout, cp.stderr


def run_guard(event, payload, project, config=None, raw=None):
    """Run guard.py as a subprocess. `project` is a temp dir used as CLAUDE_PROJECT_DIR."""
    if config is not None:
        os.makedirs(os.path.join(project, ".claude"), exist_ok=True)
        with open(os.path.join(project, ".claude", "guardrails.json"), "w") as fh:
            json.dump(config, fh)
    env = dict(os.environ, CLAUDE_PROJECT_DIR=project)
    data = raw if raw is not None else json.dumps(payload)
    cp = subprocess.run([sys.executable, GUARD, "--event", event], input=data,
                        capture_output=True, text=True, env=env, cwd=project, timeout=30)
    return Result(cp)


def bash(cmd, sid="s1"):
    return {"session_id": sid, "hook_event_name": "PreToolUse", "tool_name": "Bash",
            "tool_input": {"command": cmd}}


def write(path, content, sid="s1"):
    return {"session_id": sid, "hook_event_name": "PreToolUse", "tool_name": "Write",
            "tool_input": {"file_path": path, "content": content}}


def audit_lines(project):
    p = os.path.join(project, ".claude", "guardrails-audit.jsonl")
    if not os.path.exists(p):
        return []
    with open(p) as fh:
        return [json.loads(l) for l in fh if l.strip()]


def tmpdir():
    return tempfile.mkdtemp(prefix="ag-test-")


def rmdir(d):
    shutil.rmtree(d, ignore_errors=True)
