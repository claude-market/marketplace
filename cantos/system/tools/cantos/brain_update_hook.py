#!/usr/bin/env python3
"""
Brain file proposal hook — Stop hook for the Cantos system.

What it does:
  1. Reads hook data from stdin (Claude Code Stop hook format).
  2. Loads the session transcript.
  3. Signal-word scan (free) — exits if no feedback signals.
  4. Haiku triage call — extracts candidate rules from the transcript.
  5. Appends candidates to a REVIEW QUEUE at `.tmp/brain-update-queue.md`.

What it does NOT do:
  - Auto-append to any brain file's `## Auto-updates` section.
  - Decide which file the rule belongs to.

The next `/wrap` reads the queue, runs every proposal through the
three-question routing test from `references/brain-file-architecture.md`,
and routes it to the proper home (prose section, gate, gotchas, project
context, workflow, skill, or — last resort — Auto-updates).

This was changed because the old auto-append behavior bypassed the
routing test and produced bullet rot. The queue keeps the safety net
without short-circuiting the discipline.
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

# ── Signal words that suggest feedback or a new rule was given ──────────────
SIGNAL_WORDS = [
    "don't", "do not", "doesn't", "always", "never", "instead",
    "from now on", "you should", "remember", "stop doing", "stop ",
    "don't do", "make sure", "not like that", "wrong", "incorrect",
    "actually", "no not", "prefer", "rather", "next time",
    "going forward", "in the future", "correction", "wrong approach",
    "bad idea", "not ideal",
]

PROJECT_ROOT = Path(__file__).parent.parent.parent
QUEUE_PATH = PROJECT_ROOT / ".tmp" / "brain-update-queue.md"

# Map an assistant name to its brain file — Haiku tags the proposal so
# the next wrap knows roughly which assistant it concerns, but routing
# inside that assistant (prose / gate / gotchas / Auto-updates) is the
# wrap's decision, not the hook's.
ASSISTANT_BRAINS = {
    "folio": ".assistants/folio/folio.md",
    "lyren": ".assistants/lyren/lyren.md",
    "pylon": ".assistants/pylon/pylon.md",
    "cantos": "CLAUDE.md",
}


def load_transcript(transcript_path: str) -> str:
    """Extract assistant-visible text from the JSONL transcript."""
    try:
        lines = []
        with open(transcript_path) as f:
            for raw in f:
                raw = raw.strip()
                if not raw:
                    continue
                try:
                    entry = json.loads(raw)
                except json.JSONDecodeError:
                    continue
                msg = entry.get("message", entry)
                role = msg.get("role", "")
                content = msg.get("content", "")
                if isinstance(content, str) and content:
                    lines.append(f"{role}: {content[:500]}")
                elif isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict) and block.get("type") == "text":
                            text = block.get("text", "")[:500]
                            if text:
                                lines.append(f"{role}: {text}")
        return "\n".join(lines[-120:])
    except Exception:
        return ""


def has_signal(text: str) -> bool:
    lower = text.lower()
    return any(word in lower for word in SIGNAL_WORDS)


def run_haiku_triage(transcript: str) -> dict | None:
    """
    Ask Haiku to extract candidate rules. Does NOT route them — wrap
    does the routing via the three-question test.

    Returns dict with keys: candidates (list of {assistant, content,
    evidence}). Returns None on API error.
    """
    try:
        import anthropic
    except ImportError:
        return None

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    assistant_list = "\n".join(
        f"  - {name}" for name in ASSISTANT_BRAINS.keys()
    )

    prompt = f"""You are scanning a Claude Code conversation for candidate brain-file rules.

Available assistants:
{assistant_list}

Conversation (recent portion):
---
{transcript[-3000:]}
---

Your job: extract any new behavioral rule, correction, or operating pattern that an assistant should permanently remember — so it doesn't make the same mistake or miss the same preference again.

Qualify ONLY if:
- The user gave an explicit correction ("no, do it this way", "don't do X")
- The user stated a strong preference that wasn't followed
- A clear new operating rule emerged from the session
- The user said to remember something specific

Do NOT qualify for:
- Task completions (the user got what they wanted without correction)
- General information exchange
- Clarifying questions answered
- Routine workflow steps

For each qualifying rule, tag the assistant it concerns (best guess — wrap will re-route if wrong) and write the rule in one or two concise sentences as a direct instruction. Also include 1-2 lines of evidence (the user's actual words that revealed the rule) so wrap can route it correctly.

You are NOT deciding where in the brain file the rule goes — wrap handles that. Just surface the candidate.

Respond with JSON only (no markdown):
{{"candidates": [{{"assistant": "<name>", "content": "<rule as instruction>", "evidence": "<user's actual words>"}}]}}

If nothing qualifies:
{{"candidates": []}}"""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception:
        return None


def append_to_queue(candidates: list[dict], session_id: str) -> int:
    """
    Append candidates to the review queue at .tmp/brain-update-queue.md.
    Returns the number of candidates appended.
    """
    if not candidates:
        return 0

    QUEUE_PATH.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    block_lines = [
        "",
        f"## {timestamp} — session {session_id[:8] if session_id else 'unknown'}",
        "",
    ]
    appended = 0
    for c in candidates:
        assistant = (c.get("assistant") or "").strip().lower()
        content = (c.get("content") or "").strip()
        evidence = (c.get("evidence") or "").strip()
        if not content:
            continue
        brain = ASSISTANT_BRAINS.get(assistant, "?")
        block_lines.append(f"- **assistant:** {assistant or '?'}  ")
        block_lines.append(f"  **likely brain:** `{brain}`  ")
        block_lines.append(f"  **proposed rule:** {content}  ")
        if evidence:
            block_lines.append(f"  **evidence:** {evidence}  ")
        block_lines.append("  **status:** PROPOSED — route via the three-question test in `references/brain-file-architecture.md` on next /wrap.")
        block_lines.append("")
        appended += 1

    if appended == 0:
        return 0

    # Initialize queue file with a header on first write.
    if not QUEUE_PATH.exists():
        header = (
            "# Brain Update Queue\n\n"
            "Proposed brain-file rules surfaced automatically by the Stop hook.\n"
            "Each entry is a CANDIDATE — not yet applied. The next `/wrap` should\n"
            "review every entry, route it via the three-question test in\n"
            "`references/brain-file-architecture.md`, then move applied entries to\n"
            "an `## Applied` section at the bottom (or delete if discarded).\n"
        )
        QUEUE_PATH.write_text(header)

    with QUEUE_PATH.open("a") as f:
        f.write("\n".join(block_lines))
    return appended


def main():
    try:
        hook_data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, Exception):
        hook_data = {}

    transcript_path = hook_data.get("transcript_path", "")
    session_id = hook_data.get("session_id", "")

    if not transcript_path or not Path(transcript_path).exists():
        sys.exit(0)

    transcript = load_transcript(transcript_path)
    if not transcript:
        sys.exit(0)

    if not has_signal(transcript):
        sys.exit(0)

    result = run_haiku_triage(transcript)
    if not result:
        sys.exit(0)

    candidates = result.get("candidates", [])
    if not isinstance(candidates, list) or not candidates:
        sys.exit(0)

    appended = append_to_queue(candidates, session_id)
    if appended > 0:
        print(json.dumps({
            "systemMessage": (
                f"Brain update queue: {appended} candidate(s) appended to "
                f".tmp/brain-update-queue.md. Run /wrap to route them via the "
                f"three-question test."
            )
        }))

    sys.exit(0)


if __name__ == "__main__":
    main()
