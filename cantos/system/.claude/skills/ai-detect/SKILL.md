---
name: ai-detect
argument-hint: "<file-path>"
description: |
  Automates GPTZero AI detection pipeline for a given file. OPT-IN and external: it
  uploads the draft text to a third-party site (gptzero.me) and requires the user's
  GPTZero login, so it must only run with the user's explicit consent for that draft and
  never on sensitive text. Opens a headed browser session, scans the file in GPTZero
  advanced mode, extracts AI-flagged and borderline-human sentences, runs Opus analysis
  to diagnose patterns, then updates the AI-writing pattern catalog
  (references/signs-of-ai-writing.md) and fixes the file. A local manual fallback exists
  for when the user declines the external scan. Use when scanning a draft for AI
  detection and remediation.
tools: Bash, Read, Write, Edit, Agent
---

# Skill: ai-detect

Invocation: `/ai-detect <file-path>`

Three-phase pipeline: browser scan (Haiku) → deep pattern analysis (Opus) → file updates (Sonnet).

---

## Privacy and Consent (Non-Negotiable)

This skill **uploads the full draft text to a third-party website (`gptzero.me`)** and requires the user's own **GPTZero login** in the browser window. The draft leaves the local machine. Before any upload:

1. State plainly that running this skill sends the draft's text to GPTZero (gptzero.me), an external service, and needs the user to be logged in there.
2. Ask the user to confirm they want to scan **this specific draft** externally. This is opt-in — never run it by default.
3. **Never scan sensitive, confidential, or private text** (anything the user hasn't agreed to share externally — personal records, unpublished/embargoed work, client or third-party material) without an explicit go-ahead for that exact text. When in doubt, ask.
4. If the user declines, do not open the browser or upload anything. Use the manual fallback below instead.

### Manual fallback (when the user declines external scan)

Stay entirely local — no upload:

1. Read the draft and apply `references/signs-of-ai-writing.md` by hand, flagging each passage that matches a catalogued pattern.
2. Rewrite the flagged passages using the `write-like-me` skill (if installed) so the prose matches the user's own voice; otherwise rewrite to remove the catalogued tells while preserving citations, statistics, and word limits.
3. Report which patterns were found and what was changed. Skip Phases 1–3 entirely — they exist only for the external GPTZero pipeline.

---

## Phase 1 — Browser Scan (Haiku)

Only reach this phase after the Privacy and Consent gate above has passed (user explicitly agreed to upload this draft to GPTZero). If consent was not given, stop and run the manual fallback instead.

Spawn a **Haiku** agent for all browser work. Pass it the file path and content.

The Haiku agent should:

1. Read the file at the given path — extract plain text (strip markdown formatting and headers for paste)
2. Open a **headed** (non-headless) Playwright browser via the playwright-cli skill
3. Navigate to `gptzero.me`. Take a snapshot to check login state
4. If not logged in: output "Please log in to GPTZero in the browser window, then confirm here." Wait for user confirmation before continuing
5. Navigate to the document scanner (Dashboard → Detect). Take a snapshot
6. Find and click "Deep Analysis" or "Advanced Analysis" mode if visible. Take a snapshot to confirm
7. Locate the text input area. Clear it. Paste the plain text content
8. Click the Scan or Analyze button. Poll for results every 5 seconds (max 60 seconds total)
9. Once results appear, extract from the DOM:
   - Overall AI probability score (%)
   - Each AI-flagged sentence + all reason tags + probability score
   - Human-rated sentences where AI probability is ≥ 10% only (skip any sentence rated ≥ 90% human — those are clean)
10. Save raw results to `/tmp/gptzero-raw-<timestamp>.md`:

```
# GPTZero Raw Results — [timestamp]

## Overall Score: [X]% AI

## AI-Flagged Sentences

### Sentence 1
**Text:** [full sentence]
**AI Probability:** [X]%
**Reasons:**
- [Reason tag]: [explanation]
- [Reason tag]: [explanation]

### Sentence 2
...

## Borderline Human Sentences (10–90% human)

### Sentence 1
**Text:** [full sentence]
**Human Probability:** [X]%
**Reasons:**
- [Reason tag]: [explanation]
```

11. Return the raw results file path to the calling skill

---

## Phase 2 — Opus Analysis

Spawn the `ai-pattern-analyzer` sub-agent (`.assistants/folio/sub-agents/ai-pattern-analyzer.md`).

Pass in the prompt:
- Raw results file path from Phase 1
- Project root path (for locating `references/signs-of-ai-writing.md`)
- The original scanned file path
- Output path: `/tmp/ai-pattern-analysis-<same-timestamp>.md`

Wait for the sub-agent to write the tmp output file before proceeding to Phase 3.

---

## Phase 3 — Sonnet Updates

Spawn a **Sonnet** agent with:
- Opus analysis file path: `/tmp/ai-pattern-analysis-<timestamp>.md`
- AI-writing pattern catalog path: `references/signs-of-ai-writing.md`
- Original scanned file path

The Sonnet agent should:

1. Read the Opus analysis
2. Add new/patched patterns from the "Catalog gaps" section to `references/signs-of-ai-writing.md` — file them under the most fitting category with a before/after example
3. Rewrite AI-flagged sentences in the original file using the concrete rewrites from the Opus analysis — preserve all citations, statistics, and word limits exactly
4. Update `~/.claude/agent-memory/ai-pattern-analyzer/patterns.md` — change `catalog_status: pending` to `patched (signs-of-ai-writing.md)` for any pattern just added to the catalog
5. If the original file is an essay: verify word count with `wc -w` stays within the stated limit ±10%; report if out of range
6. Report: patterns added to the catalog (`references/signs-of-ai-writing.md`), sentences fixed in draft (count), memory entries updated

---

## Notes

- Phase 1 always uses **Haiku** — browser navigation does not require reasoning depth
- Phase 2 always uses **Opus** — pattern diagnosis requires deep causal reasoning
- Phase 3 always uses **Sonnet** — file editing with strong instruction-following
- Tmp files from Phases 1–2 are not cleaned up automatically; delete manually if needed
- If GPTZero login fails or the scan times out, Phase 1 should report clearly before Phases 2–3 proceed
