---
name: ste-write
description: >
  Clear Answer: write, rewrite, and check text in short, plain English
  (Simplified Technical English, ASD-STE100). Load this when the user asks for a
  clear answer, plain English, short replies, to write or rewrite in STE, to
  check STE compliance, apply ASD-STE100, or simplify technical documentation.
  Commands: /clear-on, /clear-off, /clear-mode, /clear-check, /clear-rewrite,
  /clear-init (each has a /ste-* alias).
---

# Simplified Technical English (STE)

Simplified Technical English (ASD-STE100) is a controlled-English standard for
technical text that is short, direct, and unambiguous. Use it to write or rewrite
text so any reader, including a non-native reader, parses it the same way.

The plugin bundles a zero-dependency Python linter that is the objective
pass/fail gate. The rules and the substitution dictionary live on disk, so they
cost no model-context tokens.

## Commands

Each command has two names: the Clear Answer name and a legacy `/ste-*` alias.
Both do the same thing.

- `/clear-on`, `/clear-off` (aliases `/ste-on`, `/ste-off`): turn Clear Answer
  dialogue mode on or off. While on, every reply is written in short, plain
  English and gated by the linter.
- `/clear-mode off|prose|strict` (alias `/ste-mode`): set the mode and strictness.
- `/clear-check` (alias `/ste-check`): check a file or text and report the
  violations.
- `/clear-rewrite` (alias `/ste-rewrite`): rewrite text with a before and after.
- `/clear-init` (alias `/ste-init`): add the rules to the project's CLAUDE.md.

## When the user asks for STE without a command

Apply STE to the relevant text, then lint it before you present it:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/ste_lint.py" --profile full --pretty <<'EOF'
<your text>
EOF
```

Rewrite until `passed` is true. For a rewrite task, show a before and after. For
a compliance check, report the violations. For a dialogue request, keep replies
short and gated.

## The rules you write by

- One instruction per sentence. Keep sentences within the profile limit (chat 25
  words, full 20).
- Use the active voice. Write instructions as commands ("Open the valve").
- Use simple tenses only: present, past, future, imperative, infinitive.
- Do NOT use perfect tenses ("have done"), progressive ("is running"), passive
  voice in instructions, or semicolons.
- Do NOT use contractions. Write "do not", not "don't".
- Do NOT stack more than three nouns in a row.
- Prefer single verbs over phrasal verbs ("remove" not "take off").
- Keep paragraphs to six sentences or fewer, one topic each.
- Cut hedging and filler. Say the thing.

See `${CLAUDE_PLUGIN_ROOT}/references/writing-rules.md` for the condensed rule set
and `${CLAUDE_PLUGIN_ROOT}/scripts/ste_lint.py` for exactly what the gate
enforces.

## Scope

The linter enforces the deterministic rules plus a curated substitution
dictionary (`scripts/ste_dictionary.py`), verified in part against ASD-STE100
Issue 9. This is a seed set, not the full ~900-word official dictionary. Do not
claim full dictionary conformance yet. A user can extend it with a
`.ste-dict.txt` in the project (word list) or an imported official cache; the
linter merges both automatically.
