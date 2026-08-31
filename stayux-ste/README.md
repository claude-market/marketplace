# Stayux Clear Answer

**Clear Answer** makes Claude reply in short, plain English, both in the dialogue
and on your documents. It is a **plain-English and technical-clarity linter**,
**compatible with Simplified Technical English (ASD-STE100)**. The shipped rules
and word list are original, aligned with the Google (CC BY 4.0) and Microsoft
style guides; **bring your own** official ASD-STE100 copy for full conformance. On
Claude Code it is a bundle of `clear-*` commands (with `ste-*` aliases) plus an
auto-loading skill; on Desktop it is a single uploaded skill. A fast,
deterministic, zero-dependency Python linter sits at its core as the pass/fail
gate.

> The repo and plugin id stay `stayux-ste` for install stability. The product
> name is Stayux Clear Answer.

## Two ways to use it

**1. Optimize the model's output, in the dialogue.**
For product managers, designers, and anyone who wants less verbose answers. Turn
Clear Answer mode on and Claude writes its replies in short, clear, controlled
English. One install, then `/clear-on`.

**2. Produce clearer documentation, on your own content.**
For developers and technical writers. Check, rewrite, and standardize technical
docs with `/clear-check`, `/clear-rewrite`, and `/clear-init`. A Desktop and API build
brings the same to non-developers.

Both share one core: a **Claude Code plugin** (the `ste-*` commands) and a
**zero-dependency Python linter** with a curated dictionary that act as the
objective pass/fail gate.

> **Unofficial.** Not affiliated with or endorsed by ASD. See [NOTICE](NOTICE).
> "Simplified Technical English" and "ASD-STE100" are trademarks of ASD
> (EUTM 017966390). This tool does not include or download ASD's copyrighted
> dictionary.

## Contents

- [Two ways to use it](#two-ways-to-use-it)
- [Why](#why), and the [token economy](#token-economy-measured)
- [What it checks](#what-it-checks)
- [Install](#install): [Claude Code](#claude-code-plugin), [Claude Desktop](#claude-desktop-download-the-skill)
- [Before and after](#before-and-after)
- [The linter directly](#the-linter-directly)
- [The dictionary](#the-dictionary)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [License](#license)

## Why

Most STE helpers are LLM-only: they load the rule set (and often a dictionary
reference) into the model's context and reason over it every turn. This project
moves the deterministic rules **and the substitution dictionary into Python**.
The model never holds them in context. It calls the linter as a subprocess and
reads back a small pass/fail result. So the rules and the dictionary cost **no
model-context tokens**, and the dictionary can grow toward the full standard
without adding any context cost. The AI layer only handles the judgment rules on
top.

To be precise about what *does* cost tokens: turning the skill on loads
`SKILL.md` once, and each draft-check adds a small lint round-trip. Those are
fixed and small. The part that scales, the rules and the ~900-word-scale
dictionary, stays out of context.

### Token economy (measured)

Counts use the `o200k_base` BPE tokenizer as a proxy for Claude's, which is not
public, so treat them as approximate, not exact.

| Item | Tokens | In model context? |
|---|---:|---|
| `ste-write` skill body, when it loads | ~680 | yes |
| Lint round-trip, clean pass | ~50 | yes (per check) |
| Lint round-trip, many violations | ~270 | yes (per failing check) |
| Rule engine + dictionary + rules reference | ~3,455 | **no** (read by Python) |

The last row is the point: that material never enters the context window. An
LLM-only skill would load and reason over the equivalent every turn.

Claude Code reports its own projection. Run `claude plugin details stayux-ste`: it
shows about 429 tokens always-on for the whole plugin (every command and skill
description, so Claude knows when to use each), plus an on-invoke cost each time a
command fires (for example `/clear-on` about 400, `/clear-check` about 320). Those are
estimates too. They measure a different thing from the table above: the always-on
figure is all seven descriptions loaded up front, while the table is one flow, a
skill body plus its lint round-trips.

## What it checks

Deterministic rules (errors fail the gate):
- Sentence length (chat ≤ 25 words, full ≤ 20)
- Paragraph length (≤ 6 sentences; lists parsed separately)
- Semicolons (banned)
- Contractions (`don't` becomes `do not`)
- Progressive tense (`is running`) and perfect tense (`has done`)

Advisory (warnings that never fail the gate):
- Passive voice, phrasal verbs
- Joined imperatives (one instruction per sentence: no `and`/`then`)
- Unapproved words, with a suggested plain-English swap (curated seed map)
- Wordiness and filler phrases (for example "it is important to note that"),
  seeded from the FOSS prose linters write-good and proselint
- Words removed from the ASD-STE100 word list (Issue 9)

## Install

Pick your client. Claude Code installs the plugin; Claude Desktop downloads the
skill.

### Claude Code (plugin)

The repo doubles as a plugin marketplace:

```
/plugin marketplace add stayukasabov/Stayux-Clear-Answer
/plugin install stayux-ste@stayux
```

Update later with `/plugin update stayux-ste`, then restart Claude Code to apply.

Commands. Each has a Clear Answer name and a legacy `/ste-*` alias; both do the
same thing.

- `/clear-on`, `/clear-off` (aliases `/ste-on`, `/ste-off`): turn Clear Answer
  dialogue mode on or off. While on, the assistant drafts each reply, gates it
  through the linter, and rewrites until it passes.
- `/clear-mode off|prose|strict` (alias `/ste-mode`): set strictness (prose uses
  the chat profile, strict uses the full profile).
- `/clear-check` (alias `/ste-check`): check a file or text and report the
  violations.
- `/clear-rewrite` (alias `/ste-rewrite`): rewrite text with a before and after.
- `/clear-init` (alias `/ste-init`): add the rules to the project's CLAUDE.md.

The plugin also loads automatically when you ask for a clear answer, plain
English, or STE. See the skill at
[`skills/ste-write/SKILL.md`](skills/ste-write/SKILL.md).

### Claude Desktop (download the skill)

No build needed. You download the ready skill and upload it once:

1. Download `stayux-ste.zip` from the
   [latest release](https://github.com/stayukasabov/Stayux-Clear-Answer/releases/latest).
2. In Claude Desktop or claude.ai, open **Settings > Capabilities > Skills** and
   upload the zip, then enable it.
3. Ask Claude for a clear answer, for example "reply in plain English" or
   "reply in STE".
4. Turn it off with words when you are done: "clear answer off" or "reply in
   normal prose". Desktop has no slash commands, so on and off are both spoken.

Custom skills need code execution, on the Pro, Max, Team, or Enterprise plans.
Full notes are in [`desktop/README.md`](desktop/README.md).

## Before and after

The same question, answered with the skill off (Claude's normal prose) and on.

**You:** The API returns 502 sometimes right after a deploy. What should I check?

**Clear Answer off (default):**

> Intermittent 502s just after a deploy usually mean traffic reaches new
> instances before they are ready to serve it, so the first thing I would look
> at is your readiness checks and whether they genuinely reflect when the app
> can handle requests. Beyond that, it is worth confirming that the load
> balancer drains connections from the old instances gracefully during the
> rollout, and it can also help to review the logs from the first few seconds
> after each deploy, since that window is where this kind of race condition
> tends to show up.

**Clear Answer on:**

> Check three things.
> 1. Readiness probes. Confirm they pass only when the app can serve requests.
> 2. Connection draining. Make sure the load balancer removes old pods before it stops them.
> 3. Deploy timing. Look at the logs from the first 30 seconds after each rollout.

Same information. The Clear Answer reply is shorter, scannable, and faster to act on.

## The linter directly

The gate reads text on stdin (or `--text`) and prints a JSON result, exiting 1
if any error-severity violation is found:

```bash
echo "Commence the repair prior to the test." | python3 scripts/ste_lint.py --pretty
python3 scripts/ste_lint.py --profile full --text "Your sentence here."
```

Run the tests:

```bash
python3 -m unittest discover -s tests
```

## The dictionary

The linter bundles a small, hand-authored **substitution map**
(`scripts/ste_dictionary.py`). It maps common non-STE words and phrases to plain
replacements, and lists terms removed from the standard. Every entry is tagged by
provenance so the seed is auditable: **[Issue 9]** verified against a local
ASD-STE100 copy, **[Google style]** from the Google Developer Documentation Style
Guide word list (CC BY 4.0, used with attribution), and **[plain-English]**
general style advice. The wordiness phrases come from write-good and proselint.

It is **not** the official ~900-word list, which is copyrighted. Extend it three
ways:
- Drop a **`.ste-dict.txt`** in your project. It is a plain word list the linter
  reads automatically, no code edit and no dependency:

  ```
  # Acme project terms
  bolt = fastener      # flag "bolt", suggest "fastener"
  as per = by          # multiword left side is a phrase swap
  widget               # a bare word is approved: never flag it
  ```

  Custom entries win over the seed and the official cache, so this is where
  company technical names and verbs go.
- Add your own entries (including company technical terms) to
  `scripts/ste_dictionary.py`.
- Point the importer at **your own** official ASD-STE100 copy:

  ```
  python3 scripts/ste_import.py path/to/your-ste.pdf
  ```

  This parses your copy into a git-ignored `cache/official.json` (approved words
  and substitutions). When that cache is present, the linter uses it: it adds the
  official substitutions and stops flagging any word the standard actually
  approves. The official data is read from disk, never shipped or committed, and
  costs no model-context tokens. Needs `pdftotext` for a PDF, or pass an already
  extracted `.txt`.

## Documentation

- **Tutorials** ([`docs/tutorials/`](docs/tutorials/README.md)), with worked,
  run-verified examples:
  1. [Install the plugin](docs/tutorials/01-install.md)
  2. [Get clear answers in the dialogue](docs/tutorials/02-dialogue-mode.md)
  3. [Check a document](docs/tutorials/03-check-a-document.md)
  4. [Rewrite a document](docs/tutorials/04-rewrite-a-document.md)
  5. [Repo and Desktop setup](docs/tutorials/05-init-and-desktop.md)
  6. [Add your own words with a project dictionary](docs/tutorials/06-custom-dictionary.md)
- **Claude Desktop guide**: [`desktop/README.md`](desktop/README.md)
- **STE rule reference**: [`references/writing-rules.md`](references/writing-rules.md)
- **The skill**: [`skills/ste-write/SKILL.md`](skills/ste-write/SKILL.md)
- **Downloads**: [latest release](https://github.com/stayukasabov/Stayux-Clear-Answer/releases/latest)
- **Legal**: [LICENSE](LICENSE), [NOTICE](NOTICE)

## Roadmap

- [x] Custom / project dictionary loading (a `.ste-dict.txt` merged over the seed)
- [x] Local official-dictionary parsing (bring your own copy) via
  `scripts/ste_import.py` into a git-ignored cache
- [ ] Noun-cluster rule (needs part-of-speech tagging)

## License

[MIT](LICENSE). See [NOTICE](NOTICE) for trademark and copyright terms.
