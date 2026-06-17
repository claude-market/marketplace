# Workflow: Export a monorepo subproject to a clean public repo

**Owner:** pylon. **Accessible by:** all.

## Purpose

Publish one project from the Cantos monorepo as a standalone PUBLIC GitHub repo — a portfolio piece, a shareable demo, or open-sourcing one project. Preserves the project's real commit history (authorship proof) while scrubbing the internal assistant machinery and any secrets.

## When to use

The user asks to put project X on its own public repo, share it with someone, or prove it's theirs. Not for deploying (that's a host like Vercel) and not for pushing the whole monorepo.

## Representation stance (Non-Negotiable)

How much AI involvement to disclose is the user's call — confirm their preference before publishing. The default is honest, light attribution plus a private internal system.

1. KEEP honest AI attribution unless the user says otherwise: the `Co-Authored-By: Claude` commit trailers, and a one-line "built with AI assistance" note in the README/docs. Do NOT strip attribution to fake solo work without the user's explicit say-so — that is an integrity risk. Confirm before ever doing so.
2. SCRUB the Cantos machinery from everything published: assistant names (e.g. "pylon"), "sub-agent", "worktree" branch logs, "vibe-coded", commit-hash bookkeeping, internal file paths (`workflows/pylon/...`, `decisions/log.md`), and any assistant-voice docs (`context.md`, internal design notes).
3. REFRAME internal assistant-voice design docs into the user's first-person voice before publishing — they directed the build, so write it as their project. Optionally run a humanizing pass (the `ai-detect` skill, or rewrite by hand using `references/signs-of-ai-writing.md`) if they want the prose to read like their own jotted notes.

## Steps

1. Scope and secret-vet, read-only. Locate the project and confirm the runnable app is self-contained (own `package.json`, no imports from the monorepo). Scan the subdir's FULL history for ever-committed secrets and the tree for `.env*`/`.vercel`/tokens:
   - `git log --all --name-only -- '<path>/**/.env*' '<path>/**/.vercel/*'`
   - `git grep -nIE '(ghp_|github_pat_|sk-|AIza|api[_-]?key)' -- <path>`
   - `.vercel/.env.production.local` is a common secret. It's gitignored so usually never committed, but confirm it's absent from the exported tree.

2. Auth check. Pull the GitHub token without printing it and confirm it can create repos. If the token lives in a credential helper (e.g. macOS osxkeychain) rather than `gh` or an env var:
   - `TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill | sed -n 's/^password=//p')`
   - `curl -sS -D - -o /dev/null -H "Authorization: token $TOKEN" https://api.github.com/user`, then read the `x-oauth-scopes` header for `repo` and confirm the login is the user's GitHub account. If the scope is missing, ask the user for a `repo`-scoped token. (`gh auth status` + `gh repo create` is an equivalent path when the GitHub CLI is set up.)

3. Extract history with the subdir as root.
   - `git subtree split -P <project>/<app-subdir> -b <export-branch>` keeps authorship and author dates and makes the subdir the repo root. Split the narrowest path that holds the runnable app (e.g. `.../site`) so internal `context.md` and design notes stay out of the published history.
   - Fetch ONLY that branch into a fresh sibling dir so the new `.git` doesn't carry the whole monorepo's objects: `git init`, `git fetch <monorepo-path> <export-branch>`, `git checkout -b main FETCH_HEAD`.

4. Scrub machinery from history. It hides in commit BODIES, not just subjects (e.g. "pylon dispatched N sub-agents", a `# Conflicts:` block listing internal paths). Use `git-filter-repo` (`brew install git-filter-repo` or `pip install git-filter-repo`):
   - Drop internal doc paths from all history: `--invert-paths --path <internal-docs-dir>`.
   - Strip machinery LINES from every commit message with `--message-callback "$(cat callback.py)"`, where the callback drops any line containing assistant-name/sub-agent/dispatched/internal-path terms plus the `# Conflicts:` block, while KEEPING `Co-Authored-By: Claude` lines. `--replace-message` only matches literal strings, so the callback is what handles bodies.
   - Verify: `git log --all --format='%B' | grep -ic pylon` is 0, and the `Co-Authored-By: Claude` count is still positive (unless the user opted to strip attribution).

5. Curate the tip. Write a casual first-person README and any reframed docs (see Representation stance). Prove the extracted app builds standalone: `npm install && npm run build && npm test`. Commit as the user with their GitHub commit identity (`-c user.name='<user name>' -c user.email='<user email>'`) and a `Co-Authored-By: Claude` trailer.

6. Create and push.
   - `curl -X POST -o create.json -H "Authorization: token $TOKEN" https://api.github.com/user/repos -d '{"name":"...","private":false,"homepage":"<live demo>","description":"..."}'` (write the response to a file rather than piping `curl` to a processor). The `gh repo create <name> --public --source=. --push` path does the same in one step when the GitHub CLI is set up.
   - `git remote add origin https://github.com/<user>/<name>.git && git push -u origin main` (the credential helper supplies creds).
   - Optional: set topics via `PUT /repos/.../topics`.

7. Verify from GitHub's side: repo is `private:false`, no `.env`/`.vercel` in the tree, `src/` and `tests/` present, every commit authored by the user, 0 machinery in messages, README renders. Report the URL, and before/after word counts if docs were rewritten.

8. Clean up. Delete the temp split branches in the monorepo (`git branch -D <export-branch>`). The safety hook in `.claude/settings.json` blocks `git branch -D` from the assistant's own Bash calls, so surface the command and have the user run it themselves after confirming the export succeeded — the hook gates the assistant, not the user. The sibling dir stays as the user's local clone.

## Gotchas

- The published repo is a ONE-TIME snapshot. It does not auto-sync. Note in the project's `context.md` that a public mirror exists, and re-run this workflow to refresh it.
- A PAT pasted into chat is exposed. Tell the user to revoke/rotate it and use the credential helper instead.
- The whole op runs in a SEPARATE sibling repo plus temp branches, so it doesn't stomp the monorepo working tree. Only the cleanup branch-delete and any `context.md` note touch the monorepo.
