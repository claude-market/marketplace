"""STE substitution dictionary: non-approved term -> approved replacement.

This is a *curated seed set* of well-known Simplified Technical English swaps,
NOT the full copyrighted ~900-word ASD-STE100 dictionary. The linter reads this
file from disk, so it costs no model-context tokens. Extend it freely: add
entries here and the gate picks them up. To approximate the full standard,
paste the official approved words / substitutions into these maps.

Keys are lowercase. WORD_SUBSTITUTIONS are matched per token; PHRASE_
SUBSTITUTIONS and REMOVED_TERMS are matched as whole-word phrases inside a
sentence.

Provenance tags mark where each swap comes from, so the seed is auditable and
legally defensible:
- [Issue 9]       Verified against the ASD-STE100 Issue 9 dictionary using your
                  own bring-your-own copy. The standard's actual replacement.
- [Google style]  From the Google Developer Documentation Style Guide word list
                  (https://developers.google.com/style/word-list), CC BY 4.0.
                  Reusable with attribution.
- [plain-English] Uncontroversial formal/wordy -> plain swaps. Not from any
                  copyrighted source; general style advice.
All swaps are advisory warnings only; they never fail the gate.
"""

WORD_SUBSTITUTIONS = {
    # --- [Issue 9] verified against your BYO official copy ---
    "require": "necessary",      # require (v) -> NECESSARY (adj)
    "substance": "material",     # substance (n) -> MATERIAL (n)
    "acceptable": "permitted",   # acceptable (adj) -> PERMITTED (adj)
    "alternate": "alternative",  # alternate (adj) -> ALTERNATIVE (adj)
    "avoid": "prevent",          # avoid (v) -> PREVENT (v)
    "ensure": "make sure",       # ensure (v) -> MAKE SURE (v)
    "main": "primary",           # main (adj) -> PRIMARY (adj)
    "complete": "completed",     # complete (adj) -> COMPLETED (adj) [verb COMPLETE is approved]
    "activity": "task",          # activity (n) -> TASK (n) / PROCEDURE (n)
    "action": "task",            # action (n) -> STEP (n) / TASK (n)
    "abandon": "go",             # abandon (v) -> GO (v) / STOP (v)
    "assistance": "help",        # assistance (n) -> AID (n) / HELP (v)
    "blank": "seal",             # blank (v) -> SEAL (v)
    # NOTE: "subsequently" is an APPROVED word in Issue 9. Do not add it here.

    # --- [Google style] Google Developer Documentation Style Guide (CC BY 4.0) ---
    "utilize": "use",
    "utilise": "use",

    # --- [plain-English] uncontroversial formal/wordy -> plain swaps ---
    "commence": "start",
    "initiate": "start",
    "terminate": "stop",
    "assist": "help",
    "attempt": "try",
    "obtain": "get",
    "additional": "more",
    "indicate": "show",
    "demonstrate": "show",
    "purchase": "buy",
    "retain": "keep",
    "numerous": "many",
    "possess": "have",
    "accomplish": "do",
    "endeavor": "try",
    "endeavour": "try",
    "facilitate": "help",
    "regarding": "about",
    "ascertain": "check",
    "commencement": "start",
    "consequently": "so",
    "accordingly": "so",
    "aforementioned": "this",
    "apparent": "clear",
    "cease": "stop",
    "comprehend": "understand",
    "comprise": "include",
    "deem": "think",
    "designate": "name",
    "discontinue": "stop",
    "eliminate": "remove",
    "excessive": "too much",
    "expedite": "speed up",
    "fabricate": "make",
    "finalize": "finish",
    "finalise": "finish",
    "illustrate": "show",
    "locate": "find",
    "modify": "change",
    "notify": "tell",
    "objective": "goal",
    "optimal": "best",
    "provide": "give",
    "rectify": "correct",
    "relocate": "move",
    "undertake": "do",
    "verify": "check",
    "whilst": "while",
    # NOTE: the following are APPROVED words in Issue 9 -> do NOT flag them:
    # approximately, sufficient, equivalent, previous, transmit.
    # And do NOT suggest these banned words as replacements: need, expect, ask, now.
}

# Wordy multiword phrases -> a shorter form. [plain-English], except a few
# ("in order to", "prior to") that also appear in the Google Developer
# Documentation Style Guide word list (CC BY 4.0).
PHRASE_SUBSTITUTIONS = {
    "in order to": "to",
    "due to the fact that": "because",
    "in the event that": "if",
    "prior to": "before",
    "subsequent to": "after",
    "a number of": "some",
    "with regard to": "about",
    "in the process of": "during",
    "as a result of": "because of",
    "at this point in time": "at this time",
    "at the present time": "at this time",
    "for the purpose of": "to",
    "in accordance with": "by",
    "in close proximity to": "near",
    "in conjunction with": "with",
    "in spite of the fact that": "although",
    "on a regular basis": "regularly",
    "the majority of": "most",
}

# Wordiness / "zombie" filler: phrases that add no meaning and should be cut,
# not swapped for a shorter word (that is what PHRASE_SUBSTITUTIONS does). The
# value is the advice: an empty string means "delete it", a non-empty string is
# the shorter form to keep. Seeded from the FOSS prose linters write-good and
# proselint (both openly licensed); this is original curation, not ASD data.
# Advisory warnings only; they never fail the gate.
WORDINESS_PHRASES = {
    "it is important to note that": "",
    "it is worth noting that": "",
    "it should be noted that": "",
    "it is interesting to note that": "",
    "needless to say": "",
    "for all intents and purposes": "",
    "for what it is worth": "",
    "at the end of the day": "",
    "when all is said and done": "",
    "in a very real sense": "",
    "as a matter of fact": "",
    "in the final analysis": "",
    "the fact that": "that",
    "in my opinion": "",
    "please note that": "",
}

# Terms removed from the ASD-STE100 word list in Issue 9. No approved
# replacement is given, so these are flagged as advisory warnings only.
REMOVED_TERMS = (
    "at least",
    "bear down",
    "blank off",
    "blank out",
    "brightness",
)

# STE does not allow contractions. Keys are lowercase, with a straight
# apostrophe; the linter normalizes curly apostrophes before it matches.
# Possessive forms (for example "valve's") are not contractions and are absent.
CONTRACTIONS = {
    "aren't": "are not",
    "can't": "cannot",
    "couldn't": "could not",
    "didn't": "did not",
    "doesn't": "does not",
    "don't": "do not",
    "hadn't": "had not",
    "hasn't": "has not",
    "haven't": "have not",
    "he's": "he is",
    "here's": "here is",
    "i'm": "I am",
    "i've": "I have",
    "isn't": "is not",
    "it'll": "it will",
    "it's": "it is",
    "let's": "let us",
    "mustn't": "must not",
    "she's": "she is",
    "shouldn't": "should not",
    "that's": "that is",
    "there's": "there is",
    "they'll": "they will",
    "they're": "they are",
    "wasn't": "was not",
    "we'll": "we will",
    "we're": "we are",
    "we've": "we have",
    "weren't": "were not",
    "what's": "what is",
    "who's": "who is",
    "won't": "will not",
    "wouldn't": "would not",
    "you'll": "you will",
    "you're": "you are",
    "you've": "you have",
}
