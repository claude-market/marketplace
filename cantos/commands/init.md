---
description: Scaffold the full, writable Cantos system into the current project (CLAUDE.md, assistants, workflows, references, self-improvement spine), then run first-run setup.
---

Scaffold the complete **Cantos** system from the plugin into a directory the user chooses, so it becomes a real, editable, git-tracked system that evolves over time.

- Source (bundled, read-only): `${CLAUDE_PLUGIN_ROOT}/system/`
- Default destination: the user's current working directory (cwd).

Cantos is a whole repo layout, not a single file. Scaffolding overlays many top-level entries (illustrative, not exhaustive — use the live `ls -A` in step 1 as the authoritative set): `CLAUDE.md`, `.assistants/`, `.claude/`, `archives/`, `context/`, `decisions/`, `logs/`, `projects/`, `references/`, `registry/`, `tools/`, `workflows/`, `package.json`, `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, `.gitignore`. Treat this as potentially destructive and protect the user's existing files.

Steps:

1. **Pick a safe destination — never silently overwrite.**
   - List the top-level entries the source would write: `ls -A "${CLAUDE_PLUGIN_ROOT}/system"`.
   - Check the destination for collisions with that list (compare names, including the dotfiles `.gitignore` / `.assistants` / `.claude`). Then:
     - **Destination is empty (or contains only files the source does not write):** proceed to step 2.
     - **Any collision exists:** STOP. Show the user the exact colliding paths and offer three choices, recommending the first:
       1. Scaffold into a fresh subdirectory instead (e.g. `./cantos/`), so nothing existing is touched. This is the safe default — recommend it whenever the cwd is an existing project.
       2. Overwrite only the listed colliding paths in place — only after the user explicitly confirms the full list. Call out `.gitignore`, `README.md`, `LICENSE`, and `package.json` specifically, since overwriting `.gitignore` can later cause secrets to be committed.
       3. Abort.
     - Never overwrite a `CLAUDE.md`, `.gitignore`, or any other existing file without the user's explicit, itemized confirmation.

2. **Copy the system into the chosen destination, preserving structure and symlinks.** With `DEST` as the confirmed directory (cwd or the subdir), prefer:
   ```bash
   rsync -a --exclude='.git' "${CLAUDE_PLUGIN_ROOT}/system/" "$DEST"/
   ```
   If `rsync` is unavailable, use `cp -a "${CLAUDE_PLUGIN_ROOT}/system/." "$DEST"/` (this preserves the symlinks under `.claude/agents/`). After copying, confirm a sample agent symlink resolves, e.g. `ls -lL "$DEST"/.claude/agents/browser-agent.md`.

3. **Confirm the scaffold.** List what landed in `DEST`: `CLAUDE.md`, `.assistants/` (cantos, folio, lyren, pylon), `.claude/` (skills, agents, rules, templates), `workflows/`, `references/`, `registry/`, `context/` (placeholders), `decisions/`, `tools/`.

4. **Run first-run setup now.** The scaffolded `context/me.md` still contains the literal marker `<!-- SETUP-NOT-DONE -->`. Read `"$DEST"/workflows/cantos/first_run_setup.md` and run it start to finish in this session: interview the user, personalize `context/me.md` and `context/work.md`, set the communication style, tune the starter assistants (rename, remove, or add), log the decision, then remove the marker. This is the same gate the scaffolded `CLAUDE.md` enforces on the first message; running it now completes setup immediately. (If the user scaffolded into a subdirectory, note that Cantos will auto-load only when Claude Code is started from inside `DEST`.)

5. **Tell the user the system is live.** From the next session started in `DEST`, `CLAUDE.md` loads automatically as project memory and Claude Code begins as Cantos. Recommend they keep that directory in a private repo, since it will hold their personal context; the bundled `README.md` and its Privacy notes explain why.

Then proceed.
