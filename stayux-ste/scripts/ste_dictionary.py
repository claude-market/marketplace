"""STE substitution dictionary: non-approved term -> approved replacement.

This is a *curated seed set* of well-known Simplified Technical English swaps,
NOT the full copyrighted ~900-word ASD-STE100 dictionary. The linter reads this
file from disk, so it costs no model-context tokens. Extend it freely: add
entries here and the gate picks them up. To approximate the full standard,
paste the official approved words / substitutions into these maps.

Keys are lowercase. WORD_SUBSTITUTIONS are matched per token; PHRASE_
SUBSTITUTIONS and REMOVED_TERMS are matched as whole-word phrases inside a
sentence. Entries marked "Issue 9" were checked against the ASD-STE100 Issue 9
dictionary; all others are common, uncontroversial plain-English swaps.
"""

WORD_SUBSTITUTIONS = {
    # --- Original seed set ---
    "commence": "start",
    "initiate": "start",
    "utilize": "use",
    "utilise": "use",
    "terminate": "stop",
    "assist": "help",
    "attempt": "try",
    "obtain": "get",
    "require": "necessary",      # require (v) -> NECESSARY (adj) [Issue 9]
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

    # --- Verified against ASD-STE100 Issue 9 ---
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

    # --- Common plain-English swaps (not from the copyrighted list) ---
    # Well-established formal/wordy -> plain substitutions. Advisory warnings
    # only. NOT claimed as Issue 9-verified; add here, not to the block above.
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
