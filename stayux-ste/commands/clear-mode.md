---
name: clear-mode
description: Set Clear Answer mode to off, prose, or strict. prose uses the chat profile; strict uses the full document profile. Alias of /ste-mode.
---

# Set Clear Answer mode

This is the same as `/ste-mode`. Read the argument after the command:

- `off`: leave Clear Answer mode. Return to normal prose. Same as `/clear-off`.
- `prose`: enter Clear Answer mode with the chat profile (sentences of 25 words or
  fewer). Lenient, for conversation and READMEs. Same as `/clear-on`.
- `strict`: enter Clear Answer mode with the full profile (sentences of 20 words or
  fewer). For manuals, procedures, and specifications.

When on, follow the per-reply workflow from `/clear-on`, but lint with the matching
profile: `--profile chat` for prose, `--profile full` for strict. Treat the mode
as sticky until the user changes it.

If no argument is given, report the current mode and the three options.
