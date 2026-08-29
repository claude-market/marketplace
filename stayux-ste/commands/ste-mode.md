---
name: ste-mode
description: Set STE mode to off, prose, or strict. prose uses the chat profile; strict uses the full document profile.
---

# Set STE mode

Read the argument after the command:

- `off`: leave STE mode. Return to normal prose. Same as `/ste-off`.
- `prose`: enter STE mode with the chat profile (sentences of 25 words or fewer).
  Lenient, for conversation and READMEs. Same as `/ste-on`.
- `strict`: enter STE mode with the full profile (sentences of 20 words or
  fewer). For manuals, procedures, and specifications.

When on, follow the per-reply workflow from `/ste-on`, but lint with the matching
profile: `--profile chat` for prose, `--profile full` for strict. Treat the mode
as sticky until the user changes it.

If no argument is given, report the current mode and the three options.
