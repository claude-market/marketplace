import json
import os
import subprocess
import sys
import unittest

from helpers import ROOT, run_guard, bash, tmpdir, rmdir

REPORT = os.path.join(ROOT, "scripts", "report.py")
INIT = os.path.join(ROOT, "scripts", "init_config.py")


def run(script, *args, project):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=project)
    return subprocess.run([sys.executable, script, *args], capture_output=True, text=True, env=env, cwd=project)


class TestReport(unittest.TestCase):
    def setUp(self):
        self.proj = tmpdir()
        for i in range(2):
            run_guard("post", {"session_id": "s1", "tool_name": "Bash", "tool_input": {"command": "ls -la"}}, self.proj)
        run_guard("post", {"session_id": "s1", "tool_name": "Edit", "tool_input": {"file_path": "src/a.py", "new_string": "x"}}, self.proj)
        run_guard("pre-bash", bash("git reset --hard"), self.proj)
        run_guard("stop", {"session_id": "s1"}, self.proj)
        with open(os.path.join(self.proj, ".claude", "guardrails-audit.jsonl"), "a") as fh:
            fh.write("not json\n")

    def tearDown(self):
        rmdir(self.proj)

    def test_json(self):
        r = run(REPORT, "--json", project=self.proj)
        self.assertEqual(r.returncode, 0, r.stderr)
        d = json.loads(r.stdout)
        self.assertEqual(d["by_tool"], {"Bash": 2, "Edit": 1})
        self.assertEqual(d["blocks_by_rule"], {"destructive_shell": 1})
        self.assertEqual(d["files_touched"], [{"file": "src/a.py", "count": 1}])
        self.assertEqual(d["top_commands"][0], {"command": "ls -la", "count": 2})
        self.assertEqual(d["unparseable_lines"], 1)
        self.assertTrue(d["first"] and d["last"])

    def test_markdown(self):
        r = run(REPORT, project=self.proj)
        self.assertEqual(r.returncode, 0)
        for s in ("# agent-guardrails audit report", "## Blocks by rule", "destructive_shell",
                  "## Files touched", "src/a.py", "## Top commands", "Time range"):
            self.assertIn(s, r.stdout)

    def test_session_filter_and_missing_log(self):
        d = json.loads(run(REPORT, "--json", "--session", "nope", project=self.proj).stdout)
        self.assertEqual(d["records"], 0)
        empty = tmpdir()
        try:
            r = run(REPORT, project=empty)
            self.assertEqual(r.returncode, 0)
            self.assertIn("No audit log", r.stdout)
        finally:
            rmdir(empty)


class TestInit(unittest.TestCase):
    def test_init_writes_and_refuses_overwrite(self):
        proj = tmpdir()
        try:
            r = run(INIT, "--policy", "oss-maintainer", project=proj)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertTrue(os.path.isfile(os.path.join(proj, ".claude", "guardrails.json")))
            self.assertTrue(os.path.isfile(os.path.join(proj, ".claude", "guardrails.example.jsonc")))
            self.assertEqual(run(INIT, project=proj).returncode, 1)
            self.assertEqual(run(INIT, "--force", project=proj).returncode, 0)
            self.assertEqual(run(INIT, "--policy", "nope", project=proj).returncode, 1)
        finally:
            rmdir(proj)


if __name__ == "__main__":
    unittest.main()


class TestReportFollowsConfig(unittest.TestCase):
    def setUp(self):
        self.proj = tmpdir()

    def tearDown(self):
        rmdir(self.proj)

    def test_default_log_uses_audit_path(self):
        cfg = {"audit": {"path": "logs/agent-audit.jsonl"}}
        run_guard("post", {"session_id": "s9", "tool_name": "Bash", "tool_input": {"command": "ls"}}, self.proj, cfg)
        self.assertTrue(os.path.isfile(os.path.join(self.proj, "logs", "agent-audit.jsonl")))
        self.assertFalse(os.path.exists(os.path.join(self.proj, ".claude", "guardrails-audit.jsonl")))
        r = run(REPORT, "--json", project=self.proj)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(json.loads(r.stdout)["by_tool"], {"Bash": 1})
