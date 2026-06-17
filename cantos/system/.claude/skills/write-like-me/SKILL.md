---
name: write-like-me
description: |
  Write or rewrite text in the user's own voice, using the style profiles learned
  from their samples (references/writing-voice/profile-professional.md and
  profile-creative.md) and actively avoiding the tells in
  references/signs-of-ai-writing.md. Use when the user asks to write in their voice,
  sound like them, humanize a draft, or make text read less like AI.
tools: Read, Write, Edit
---

# Skill: write-like-me

Invocation: `/write-like-me`, or triggers like "write this in my voice", "sound like me", "humanize this", "make this less AI", "draft as me", "in my words".

Produces text that reads like the USER wrote it: it matches their learned style and avoids AI-writing tells. This is the generative end of the writing pipeline — the opposite of `ai-detect`, which scans and scores. Use them together: write in voice here, verify the score with `/ai-detect` if the stakes are high.

---

## Inputs

- The text to write (a brief or outline) or rewrite (an existing draft).
- Register: `professional` or `creative`. If the user does not say, infer it (formal / work / academic → professional; personal / casual / narrative → creative) and state which you chose.

---

## Step 1 — Load the voice

1. Read `references/writing-voice/profile-{register}.md`.
2. If it is still the placeholder (no profile has been generated), STOP. Tell the user folio needs to learn their voice first, and offer to run `workflows/folio/analyze_writing_voice.md`. Do not fabricate a voice from nothing — a guessed voice is worse than asking.
3. Read `references/signs-of-ai-writing.md` — the catalog of tells to avoid.

---

## Step 2 — Write in voice

Draft (or rewrite) applying, in priority order:

1. The profile's **Do this** patterns — reproduce the user's real habits: cadence, diction, stance, structure, openings and closings.
2. The profile's **Never do this** list — do not introduce habits the user never uses.
3. Against every tell in `references/signs-of-ai-writing.md` — no significance inflation, no rule-of-three, no negative parallelisms ("not just X, but Y"), no em-dash overuse, no elegant variation, no copula avoidance, no mechanical transition uniformity, no perfect uniform polish, no filler phrases.

When rewriting, preserve the user's meaning and every fact. Change only the expression.

---

## Step 3 — Self-audit before returning

Re-read the draft against three checklists and fix every miss:

- **Profile match** — does it hit the profile's signature patterns? If a stranger held it next to the samples, would it pass as the same author?
- **Absent list** — did anything from **Never do this** sneak in?
- **AI tells** — walk each category in `signs-of-ai-writing.md` and strip any tell that appears.

Real writing is uneven. Vary sentence length, leave a rough edge, and resist polishing every clause to the same shine — uniform polish is itself a tell.

---

## Step 4 — Deliver

Return the text, plus one line stating the register used and anything you were unsure about (e.g. a claim you could not source in their voice). Offer an optional `/ai-detect` scan to confirm the detection score when it matters.

---

## Resync

If the output keeps missing the voice, the profile is thin or stale. Point the user to re-run `workflows/folio/analyze_writing_voice.md` with more samples.
