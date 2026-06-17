# Workflow: Writing Review

**Owner:** folio
**Purpose:** Full review-execute loop for a written draft. Parameterized by draft path, criteria, and tone. Runs parallel research per criterion, loops through reviewer and executor until the draft passes, humanizes the final output, and presents a changelog.

---

## Parameters

Provided at runtime by Folio. All three are required.

| Parameter | Type | Example |
|---|---|---|
| `draft_path` | file path | `projects/<project>/drafts/draft_1.md` |
| `criteria` | list of objects | see below |
| `tone` | `professional` or `casual` | `professional` |

Each criterion object has three fields:
- `name` — display name (e.g., "Active Voice")
- `slug` — file-safe identifier, lowercase, hyphens only (e.g., `active-voice`)
- `description` — what the criterion means in context (1–3 sentences)

---

## Pre-conditions

Before starting, verify:
1. `draft_path` exists and is readable
2. `.tmp/` directory exists at project root
3. At least one criterion is provided

If any pre-condition fails, halt and tell the user what is missing.

---

## Step 0: Backup

Copy `{draft_path}` → `.tmp/draft_original.md`.

This is the pre-review snapshot used for the final changelog diff. Do not modify it at any point during the workflow.

---

## Step 1: Parallel Research

Spawn one `writing-researcher` sub-agent per criterion. All spawns go in a single message (parallel).

For each criterion, pass to the researcher:
- Criterion `name`, `slug`, `description`
- Essay type: the kind of writing (read from the active project's `context.md` if available, otherwise infer from `draft_path`)

Expected outputs: `.tmp/research-{slug}.md` for each criterion.

Wait for all researchers to complete before proceeding to Step 2.

---

## Step 2: Review-Execute Loop

```
N = 1
MAX_ITERATIONS = 5

LOOP:

  [2a] Spawn writing-reviewer sub-agent
       Prompt includes:
         - draft_path
         - list of .tmp/research-{slug}.md paths (all criteria)
         - list of criteria names
         - iteration number N
       Expected output: .tmp/writing-review-{N}.md

  [2b] Read the first line of .tmp/writing-review-{N}.md
       Parse STATUS value

  [2c] If STATUS == "STATUS: APPROVED":
         Break loop → proceed to Step 3

  [2d] If N >= MAX_ITERATIONS:
         Break loop with message to the user:
         "Max iterations reached (5). Proceeding with best available draft."
         → proceed to Step 3

  [2e] If N > 1:
         Read .tmp/execution-status-{N-1}.md
         If STATUS is ERROR: halt and report the error to the user

  [2f] Spawn writing-executor sub-agent
       Prompt includes:
         - draft_path
         - review file path: .tmp/writing-review-{N}.md
         - iteration number N
       Expected output: modified draft_path + .tmp/execution-status-{N}.md

  [2g] N = N + 1
       Continue loop
```

---

## Step 3: Humanize

The `ai-detect` skill **uploads the draft text to a third-party site (gptzero.me) and requires a GPTZero login**, so this workflow must never send the draft externally on its own. Pick the path explicitly:

1. **Default — local, no upload.** Apply `references/signs-of-ai-writing.md` to `{draft_path}` by hand, then rewrite flagged passages with the `write-like-me` skill (if installed) to match the user's voice, or rewrite to remove the catalogued tells otherwise. Preserve citations, statistics, and word limits exactly.
2. **External scan — only with explicit consent.** If the user has agreed to scan **this specific draft** with GPTZero, and the draft is not sensitive/confidential, run the shipped `ai-detect` skill on `{draft_path}`; it scans and remediates the flagged sentences. After it returns, apply `references/signs-of-ai-writing.md` to any sentences that still read as AI. Do not invoke `ai-detect` without that explicit go-ahead — its own Privacy and Consent gate also blocks the upload.

If an automated humanizer rewrite skill has been added as a companion, invoke it here with tone `{tone}` (it stays local; no external upload).

For `professional` tone: academic register is preserved. The goal is clear, confident, non-AI-sounding prose — not stripping formal constructions required for the rubric.

For `casual` tone: conversational register. Use for blog posts, emails, or non-academic contexts.

---

## Step 4: Changelog

Generate a paragraph-level diff of `.tmp/draft_original.md` vs `{draft_path}`.

Present to the user:

```
## What Changed

### Criterion: {name}
- [Description of change 1]
- [Description of change 2]

### Humanizer
- [Description of humanizer changes]

## Word Count
Before: N words
After: N words
[Warning if over the project's word limit, if one is set in context.md]
```

Keep descriptions concise — one line per change, stating what was altered and why (which criterion it addressed). Do not quote every change in full. If a section had no changes, omit it.

---

## Edge Cases

- **Reviewer approves on iteration 1:** Skip executor entirely. Proceed to Step 3.
- **Executor skips issues:** Log in execution status file. These are surfaced in the changelog as "not applied."
- **Draft word count increases above limit:** Flag in changelog. The user decides whether to trim.
- **Research file missing for a criterion:** Reviewer will note this and proceed from internal knowledge. Not a blocker.
- **Humanizer changes affect citations:** Citations are protected by executor constraints already applied. If humanizer touches parenthetical citations, flag it in the changelog.

---

## Self-Improvement

After running this workflow:
- If the reviewer consistently flags the same issue type across sessions, consider adding it to `writing-reviewer` memory proactively before the first iteration
- If the executor skips issues frequently (location not found), the reviewer may be quoting too little context — note this and update the reviewer's system prompt to quote more surrounding text
- If word count consistently grows past limits after humanizer, add a word count guard to Step 3

Update this file immediately when any edge case or failure reveals a gap.
