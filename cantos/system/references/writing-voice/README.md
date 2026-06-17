# Writing Voice

Folio learns the user's personal writing style here and uses it to draft in their voice.

## How it works

1. The user drops their own writing into `samples/professional/` and `samples/creative/`.
2. `workflows/folio/analyze_writing_voice.md` spawns parallel `writing-style-analyzer` sub-agents — one per dimension (voice, vocabulary, sentences, organization) per register — that write findings into `analysis/`.
3. Those findings are synthesized into `profile-professional.md` and `profile-creative.md` — the style guides.
4. The `write-like-me` skill loads the matching profile plus `references/signs-of-ai-writing.md`, then writes in the user's voice while avoiding AI tells.

## Folders and files

- `samples/professional/`, `samples/creative/` — the user's own writing (`.md` or `.txt`). Add more any time.
- `analysis/` — intermediate per-dimension findings. Regenerable; safe to clear after a run.
- `profile-professional.md`, `profile-creative.md` — the synthesized, canonical style profiles. They ship as placeholders until the workflow generates them.

## Privacy

Samples are used ONLY to extract writing STYLE. They are never a source of personal facts about the user.

`samples/**` and `analysis/**` are gitignored by default because they hold your personal writing and its derived analysis — only the `.gitkeep` scaffold ships, never the content. The synthesized `profile-*.md` files are personal too (they describe how you write). Keep your configured system in a PRIVATE repo, and never push any of this to the public template upstream.

## Resync

Add samples and re-run `workflows/folio/analyze_writing_voice.md` to refresh the profiles.
