#!/usr/bin/env python3
"""Tests for file_usage_audit.py — stdlib only, no pytest dependency.
Run: python3 tools/cantos/test_file_usage_audit.py  (exit 0 = pass)."""

import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import file_usage_audit as fua  # noqa: E402


def test_iter_read_paths_counts_reads():
    with tempfile.TemporaryDirectory() as d:
        dirp = Path(d)
        line = json.dumps({
            "timestamp": "2026-06-02T10:00:00Z",
            "message": {"role": "assistant", "content": [
                {"type": "tool_use", "name": "Read",
                 "input": {"file_path": "/abs/references/gotchas.md"}},
                {"type": "tool_use", "name": "Grep",
                 "input": {"pattern": "x"}},
            ]},
        })
        (dirp / "s1.jsonl").write_text(line + "\n")
        assert list(fua.iter_read_paths(dirp)) == [
            ("/abs/references/gotchas.md", "2026-06-02T10:00:00Z")
        ]


def test_iter_read_paths_ignores_non_read_and_bad_json():
    with tempfile.TemporaryDirectory() as d:
        dirp = Path(d)
        (dirp / "s.jsonl").write_text(
            "not json\n"
            + json.dumps({"message": {"content": [
                {"type": "tool_use", "name": "Bash", "input": {"command": "ls"}}
            ]}}) + "\n"
        )
        assert list(fua.iter_read_paths(dirp)) == []


def test_iter_read_paths_missing_dir_is_empty():
    assert list(fua.iter_read_paths(Path("/no/such/dir/xyz"))) == []


if __name__ == "__main__":
    failures = 0
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print(f"PASS {name}")
            except AssertionError as e:
                failures += 1
                print(f"FAIL {name}: {e}")
    sys.exit(1 if failures else 0)
