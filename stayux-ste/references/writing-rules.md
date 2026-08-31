# Clear Answer rules: condensed (v1 machine-checkable subset of STE)

Source: ASD-STE100 Simplified Technical English (2025 edition, 53 rules +
~900-word dictionary). This file lists only the rules the v1 linter enforces.

| Rule | Profile chat | Profile full | Severity | Notes |
|------|--------------|--------------|----------|-------|
| sentence-length | ≤ 25 words | ≤ 20 words | error | STE: procedures ≤20, descriptions ≤25 |
| paragraph-length | ≤ 6 sentences | ≤ 6 sentences | error | one topic per paragraph |
| semicolon | banned | banned | error | use separate sentences |
| contraction | banned | banned | error | expand ("don't" to "do not") |
| progressive-tense | banned | banned | error | be + -ing (e.g. "is running") |
| perfect-tense | banned | banned | error | have/has/had + participle |
| passive-voice | discouraged | discouraged | warning | be + participle; banned in procedures |
| phrasal-verb | discouraged | discouraged | warning | prefer one verb ("remove" not "take off") |
| one-instruction | discouraged | discouraged | warning | do not join imperatives with "and"/"then" |
| unapproved-word | suggest swap | suggest swap | warning | seed map in `scripts/ste_dictionary.py`, plus any `.ste-dict.txt` and official cache |
| removed-word | flag | flag | warning | term removed from the Issue 9 word list |

`passed` is true when there are zero **error** violations. Warnings do not fail
the gate but should still be fixed when practical.

Bullet and numbered lists are parsed as separate items, not as one paragraph,
so `paragraph-length` applies to prose paragraphs only.

## Deferred to v2
- **noun-cluster** (≤ 3 nouns): needs POS tagging to tell nouns from verbs and
  adjectives. The v1 content-word heuristic produced false positives on normal
  prose, so the rule is removed until the dictionary/POS layer exists.
- Full approved-word / meaning / part-of-speech conformance against the ~900-word
  official dictionary. The repo ships a curated substitution seed only (see
  `scripts/ste_dictionary.py`). To widen coverage, run `scripts/ste_import.py`
  on your own official copy: it parses the approved words and substitutions into
  a git-ignored `cache/official.json` that the linter then uses. Matching is
  still token-level (no meaning or part-of-speech resolution), so this remains a
  warning layer, not full conformance. For project-specific terms, a
  `.ste-dict.txt` in the working directory is merged over the seed and the cache.
- Procedure-vs-description auto-detection (v1 uses profile choice instead).
- One-topic-per-paragraph semantic check (LLM judgment, not deterministic).

## References
- ASD-Europe (official): https://www.asd-europe.org/standards-specifications/simplified-technical-english/
- ASD-STE100 home: https://www.asd-ste100.org/
- Wikipedia overview: https://en.wikipedia.org/wiki/Simplified_Technical_English
