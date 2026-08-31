#!/usr/bin/env python3
"""Import a *local* ASD-STE100 copy into a git-ignored cache.

The official dictionary is copyrighted (all rights reserved) and is never
committed or downloaded. A user who has their own copy runs this once:

    python3 ste_import.py my-ste.pdf        # writes cache/official.json
    python3 ste_import.py my-ste.txt        # already-extracted text

`ste_lint.py` loads cache/official.json if it is present. The cache stays on
the user's machine; `.gitignore` covers `cache/` and `*.official.*`.

Parsing targets `pdftotext -layout` output. In that layout each dictionary
entry starts a line with its headword and part of speech:
    WORD (pos)   -> an APPROVED word
    word (pos)   -> a NOT-approved word, usually followed on the same line by
                    its UPPERCASE approved alternative(s).
"""
import argparse
import json
import os
import re
import subprocess
import sys

POS = r"(?:n|v|adj|adv|pron|prep|conj|art|abbr|TN|IV)"
_HEAD = re.compile(rf"^\s*([A-Za-z][A-Za-z\-]*)\s+\({POS}\)")
# An approved alternative is 1-3 UPPERCASE words joined by single spaces (so
# "MAKE SURE" stays whole) that sit immediately before a part-of-speech tag.
# The single-space join stops it from bridging the wide column gaps that
# pdftotext -layout leaves between the alternative and the example text.
_ALT = re.compile(rf"([A-Z][A-Z\-]*(?:\s[A-Z][A-Z\-]*){{0,2}})\s*\({POS}\)")


def parse_official(text):
    """Parse pdftotext -layout output into approved words and substitutions."""
    approved = set()
    word_subs = {}
    for line in text.splitlines():
        m = _HEAD.match(line)
        if not m:
            continue
        head = m.group(1)
        if head.isupper():
            approved.add(head.lower())
            continue
        if not head.islower():
            continue
        # Not-approved headword: take its first UPPERCASE approved alternative,
        # skipping the headword's own token region.
        rest = line[m.end():]
        alt = _ALT.search(rest)
        if alt:
            word_subs[head] = alt.group(1).lower()
    return {
        "approved": sorted(approved),
        "word_substitutions": word_subs,
        "phrase_substitutions": {},
    }


def write_cache(path, data):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, sort_keys=True)


def _read_source(src):
    """Return text from a .txt directly, or a .pdf via pdftotext."""
    if src.lower().endswith(".pdf"):
        try:
            out = subprocess.run(
                ["pdftotext", "-layout", src, "-"],
                check=True, capture_output=True, text=True)
        except FileNotFoundError:
            raise SystemExit("pdftotext not found; install poppler or pass a .txt")
        return out.stdout
    with open(src) as f:
        return f.read()


def main(argv=None):
    ap = argparse.ArgumentParser(description="Import a local STE dictionary")
    ap.add_argument("source", help="path to your local .pdf or extracted .txt")
    ap.add_argument("--out", default=os.path.join("cache", "official.json"),
                    help="cache path (default cache/official.json)")
    args = ap.parse_args(argv)

    data = parse_official(_read_source(args.source))
    write_cache(args.out, data)
    n = len(data["word_substitutions"])
    a = len(data["approved"])
    print(f"wrote {args.out}: {a} approved words, {n} substitutions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
