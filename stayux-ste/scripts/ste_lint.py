#!/usr/bin/env python3
"""STE linter: deterministic ASD-STE100 checks (v1, dictionary deferred).

Usage:
    echo "text" | python3 ste_lint.py [--profile chat|full] [--pretty]

Reads text on stdin, prints a JSON result, exits 1 if any *error* violation.
`passed` is true when there are no error-severity violations (warnings allowed).

The linter is a *gate*, not a rewriter: it verifies STE compliance so the
draft can be revised until it passes. See SKILL.md for the workflow.
"""
import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ste_dictionary import (  # noqa: E402
    WORD_SUBSTITUTIONS, PHRASE_SUBSTITUTIONS, REMOVED_TERMS, CONTRACTIONS,
)

# Optional local cache built from the user's own official copy (never shipped).
# See ste_import.py. Read from disk, so it costs no model-context tokens.
DEFAULT_CACHE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), os.pardir, "cache", "official.json")


def load_cache(path=DEFAULT_CACHE_PATH):
    """Return the parsed official cache, or None if it is absent/unreadable."""
    try:
        with open(path) as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


_DEFAULT_CACHE = load_cache()

# Optional per-project word list. A plain, hand-authored file that adds company
# terms and swaps on top of the seed and the official cache. See parse_custom_dict.
DEFAULT_CUSTOM_PATH = os.path.join(os.getcwd(), ".ste-dict.txt")


def parse_custom_dict(text):
    """Parse a `.ste-dict.txt` word list into approved words and substitutions.

    - `term = replacement` -> a substitution (word, or phrase if multiword).
    - a bare `word` (optional leading `+`) -> an approved word, never flagged.
    - `#` starts a comment (whole-line or inline); blank lines are ignored.
    Keys are lowercased.
    """
    approved = set()
    words = {}
    phrases = {}
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if "=" in line:
            term, _, repl = line.partition("=")
            term, repl = term.strip().lower(), repl.strip()
            if not term or not repl:
                continue
            (phrases if " " in term else words)[term] = repl
        else:
            approved.add(line.lstrip("+").strip().lower())
    return {"approved": sorted(approved),
            "word_substitutions": words, "phrase_substitutions": phrases}


def load_custom_dict(path=DEFAULT_CUSTOM_PATH):
    """Return the parsed custom dictionary, or None if it is absent/unreadable."""
    try:
        with open(path) as f:
            return parse_custom_dict(f.read())
    except OSError:
        return None


_DEFAULT_CUSTOM = load_custom_dict()


def _effective_maps(cache, custom=None):
    """Merge the seed with the official cache and the custom list, in that order
    of precedence (custom wins). Any word marked approved by the cache or the
    custom list is dropped from the word map (false-positive suppression).
    """
    words = dict(WORD_SUBSTITUTIONS)
    phrases = dict(PHRASE_SUBSTITUTIONS)
    for layer in (cache, custom):
        if not layer:
            continue
        words.update(layer.get("word_substitutions", {}))
        phrases.update(layer.get("phrase_substitutions", {}))
        for w in layer.get("approved", ()):
            words.pop(w, None)
    return words, phrases

PROFILES = {
    # STE distinguishes procedures (<=20 words) from descriptions (<=25).
    # "chat" is a pragmatic conversational subset; "full" is document-strict.
    "chat": {"max_sentence_words": 25, "max_paragraph_sentences": 6},
    "full": {"max_sentence_words": 20, "max_paragraph_sentences": 6},
}

BE_VERBS = {"am", "is", "are", "was", "were", "be", "been", "being"}
HAVE_VERBS = {"have", "has", "had"}

# Irregular past participles that do not end in -ed.
IRREGULAR_PARTICIPLES = {
    "gone", "done", "seen", "taken", "given", "written", "broken", "put",
    "set", "cut", "shut", "read", "built", "held", "kept", "left", "found",
    "told", "sent", "spent", "lost", "met", "paid", "said", "laid", "made",
    "shown", "known", "grown", "drawn", "worn", "torn", "chosen", "frozen",
    "driven", "risen", "fallen", "begun", "run", "been", "come", "become",
}

# Adverbs allowed to sit between an auxiliary and its participle/-ing form.
INTERVENING = {"not", "never", "always", "already", "just", "still", "also", "now"}

# Common phrasal verbs (verb + particle) that STE replaces with single verbs.
PHRASAL_VERBS = {
    ("turn", "off"), ("turn", "on"), ("put", "on"), ("take", "off"),
    ("set", "up"), ("shut", "down"), ("back", "up"), ("carry", "out"),
    ("look", "up"), ("fill", "in"), ("pick", "up"), ("hook", "up"),
    ("plug", "in"), ("switch", "off"), ("switch", "on"), ("break", "down"),
    ("check", "out"), ("find", "out"), ("go", "through"), ("hold", "on"),
}

# Common technical imperative verbs. Used only to detect two instructions
# joined by "and"/"then" in one sentence (the one-instruction rule).
ACTION_VERBS = {
    "open", "close", "remove", "install", "set", "turn", "push", "pull",
    "connect", "disconnect", "check", "do", "make", "start", "stop", "apply",
    "tighten", "loosen", "examine", "replace", "put", "get", "hold", "release",
    "press", "lift", "lower", "attach", "detach", "clean", "measure", "adjust",
    "align", "fill", "drain", "add", "keep", "move", "read", "record", "send",
    "wait", "test", "use", "give", "cut", "seal", "go", "find", "select",
}

WORD_RE = re.compile(r"[A-Za-z][A-Za-z'\-]*")
SENTENCE_RE = re.compile(r"[^.!?]+[.!?]*", re.DOTALL)
LIST_RE = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+(.*)$")


def _iter_segments(text):
    """Yield (kind, chunk, line_no) for prose runs and individual list items.

    line_no is the 1-based line where the segment starts. Blank lines split
    blocks. List items are separated so a bullet/numbered list is not mistaken
    for one over-long paragraph. Consecutive non-list lines join into a prose
    chunk that keeps the first line's number.
    """
    lines = text.split("\n")
    i, n = 0, len(lines)
    while i < n:
        if not lines[i].strip():
            i += 1
            continue
        prose, prose_line = [], None
        while i < n and lines[i].strip():
            m = LIST_RE.match(lines[i])
            if m:
                if prose:
                    yield ("prose", " ".join(prose), prose_line)
                    prose, prose_line = [], None
                yield ("list", m.group(1), i + 1)
            else:
                if prose_line is None:
                    prose_line = i + 1
                prose.append(lines[i].strip())
            i += 1
        if prose:
            yield ("prose", " ".join(prose), prose_line)


def _split_sentences(chunk):
    return [s.strip() for s in SENTENCE_RE.findall(chunk) if s.strip()]


def _words(sentence):
    return WORD_RE.findall(sentence)


def _is_participle(word):
    w = word.lower()
    return w in IRREGULAR_PARTICIPLES or (len(w) > 3 and w.endswith("ed"))


def _next_content(tokens, i):
    """Index of the next token after i, skipping allowed intervening adverbs."""
    j = i + 1
    while j < len(tokens) and tokens[j].lower() in INTERVENING:
        j += 1
    return j if j < len(tokens) else None


def _make(rule, severity, detail, text, line=None):
    return {"rule": rule, "severity": severity, "detail": detail,
            "text": text, "line": line}


def _check_sentence(sentence, cfg, violations, line,
                    word_subs=WORD_SUBSTITUTIONS, phrase_subs=PHRASE_SUBSTITUTIONS):
    words = _words(sentence)
    if len(words) > cfg["max_sentence_words"]:
        violations.append(_make(
            "sentence-length", "error",
            f"{len(words)} words (max {cfg['max_sentence_words']})", sentence[:60], line))

    lower = [w.lower() for w in words]
    for i, w in enumerate(lower):
        if w in BE_VERBS:
            j = _next_content(lower, i)
            if j is not None:
                nxt = lower[j]
                if nxt.endswith("ing") and len(nxt) > 4:
                    violations.append(_make(
                        "progressive-tense", "error",
                        f"'{w} {nxt}' is a compound tense", sentence[:60], line))
                elif _is_participle(nxt):
                    violations.append(_make(
                        "passive-voice", "warning",
                        f"'{w} {nxt}' is passive voice", sentence[:60], line))
        if w in HAVE_VERBS:
            j = _next_content(lower, i)
            if j is not None and _is_participle(lower[j]):
                violations.append(_make(
                    "perfect-tense", "error",
                    f"'{w} {lower[j]}' is a perfect tense", sentence[:60], line))
        if i + 1 < len(lower) and (w, lower[i + 1]) in PHRASAL_VERBS:
            violations.append(_make(
                "phrasal-verb", "warning",
                f"'{w} {lower[i + 1]}' is a phrasal verb", sentence[:60], line))
        if w in word_subs:
            violations.append(_make(
                "unapproved-word", "warning",
                f"use '{word_subs[w]}' instead of '{w}'", sentence[:60], line))
        if w in CONTRACTIONS:
            violations.append(_make(
                "contraction", "error",
                f"use '{CONTRACTIONS[w]}' instead of '{w}'", sentence[:60], line))

    # One instruction per sentence: flag an imperative sentence that joins a
    # second action verb with "and" or "then" (for example "Open X and close Y").
    if lower and lower[0] in ACTION_VERBS:
        for i, w in enumerate(lower):
            if w in ("and", "then"):
                j = i + 1
                while j < len(lower) and lower[j] in ("the", "a", "an", "then"):
                    j += 1
                if j < len(lower) and lower[j] in ACTION_VERBS:
                    violations.append(_make(
                        "one-instruction", "warning",
                        "one instruction per sentence: split the joined steps",
                        sentence[:60], line))
                    break

    low = sentence.lower()
    for phrase, sub in phrase_subs.items():
        if re.search(r"\b" + re.escape(phrase) + r"\b", low):
            violations.append(_make(
                "unapproved-word", "warning",
                f"use '{sub}' instead of '{phrase}'", sentence[:60], line))
    for term in REMOVED_TERMS:
        if re.search(r"\b" + re.escape(term) + r"\b", low):
            violations.append(_make(
                "removed-word", "warning",
                f"'{term}' was removed from the ASD-STE100 word list", sentence[:60], line))


def lint(text, profile="chat", cache=None, custom=None):
    cfg = PROFILES.get(profile, PROFILES["chat"])
    if cache is None:
        cache = _DEFAULT_CACHE
    if custom is None:
        custom = _DEFAULT_CUSTOM
    word_subs, phrase_subs = _effective_maps(cache, custom)
    violations = []

    # Normalize curly apostrophes so contractions match regardless of source.
    text = text.replace("’", "'")

    if ";" in text:
        semi_line = text[:text.index(";")].count("\n") + 1
        violations.append(_make("semicolon", "error",
                                 "semicolons are not allowed; use separate sentences",
                                 ";", semi_line))

    for kind, chunk, line in _iter_segments(text):
        sentences = _split_sentences(chunk)
        # paragraph-length applies to prose only; list items are separate.
        if kind == "prose" and len(sentences) > cfg["max_paragraph_sentences"]:
            violations.append(_make(
                "paragraph-length", "error",
                f"{len(sentences)} sentences (max {cfg['max_paragraph_sentences']})",
                chunk[:60], line))
        for sentence in sentences:
            _check_sentence(sentence, cfg, violations, line, word_subs, phrase_subs)

    passed = not any(v["severity"] == "error" for v in violations)
    return {"passed": passed, "profile": profile, "violations": violations}


def main(argv=None):
    ap = argparse.ArgumentParser(description="STE deterministic linter")
    ap.add_argument("--profile", choices=sorted(PROFILES), default="chat")
    ap.add_argument("--pretty", action="store_true")
    ap.add_argument("--text", help="lint this string instead of stdin")
    args = ap.parse_args(argv)

    text = args.text if args.text is not None else sys.stdin.read()
    result = lint(text, profile=args.profile)
    print(json.dumps(result, indent=2 if args.pretty else None))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
