# consolidate_worktrees

Merges every active worktree branch into `main` without losing features, then commits and pushes everything so the repo ends on a true blank slate. This is pylon's canonical **bring-everything-together → clean up → start fresh** operation: when the user wants the parallel work consolidated and the slate wiped clean, this single workflow does it end to end.

After this runs, the repo state is: one branch (`main`), a clean working tree (`git status --short` empty), every worktree pruned, everything pushed to `origin/main`, and the finished build live on the `n000` main port — the user's constant preview, which is never killed.

The workflow is conservative by default: it surfaces uncommitted WIP for explicit user decisions, rebases each branch onto current `main` before merging (to prevent silent semantic loss from `ort` block-replacement), and verifies the merged result through both typecheck and a live browser smoke before pruning anything.

---

## Scope (read first — Non-Negotiable)

The full repo-wide blank-slate (merge **every** worktree, sweep-commit **all** of main's WIP) runs **only** when the user explicitly asks to consolidate everything / wipe the slate. The user may run many Claude sessions in parallel, so the repo can routinely have several other sessions' worktrees and unrelated uncommitted WIP on `main`.

When you are just closing your own task's worktree loop (the common case — a finished feature/fix, a `/wrap`, "ship it"), operate **only on the worktree this session created**:

- Merge **only** your own branch into `main`; rebase it, sanity-check markers, `--no-ff` merge, push.
- **Never** merge, rebase, prune, or touch another session's worktree or branch.
- **Never** sweep-commit main's WIP that your session did not create (other assistants' brain edits, `.gitignore`, unrelated project files, stray images). Commit only the files your task touched, surface the rest in the report, leave them exactly as found.
- The "blank slate" end-state gate (empty `git status --short`) applies to your scoped files only; a non-empty tree of *other* sessions' WIP is expected and correct.

Running the repo-wide steps with other live worktrees present is destructive (ships half-done parallel work). If in doubt, scope to your own worktree and say so in the report.

---

## Inputs

| Input | Required | Description |
|---|---|---|
| `REPO_ROOT` | Yes | Absolute path to the repo (the main worktree). All `git -C` calls anchor here. |
| `PROJECT_DEV_PATH` | If verifying UI | Path to the dev-server-runnable subproject (e.g., `projects/<name>/site`) when the merged branches touch UI. |
| `PROJECT_DEV_PORT` | If verifying UI | The project's **main port** (`n000`) from pylon's Localhost Port Allocation gate — the finished build is restarted here at the end. Default `3000`. For a project that bisects its digit to run multiple live versions in parallel, use the version's own main port. |

If the user gives a verbal request without these, infer `REPO_ROOT` from cwd and ask which subproject (if any) to smoke-test.

---

## Output

- `main` containing the composed work of every previously unmerged worktree branch
- All merged worktree directories pruned and their branches deleted
- A single post-merge cleanup commit (if any verification fix was needed)
- **A clean working tree** — main's own remaining tracked changes and intentional untracked files committed under scoped commits; `git status --short` returns empty
- Everything pushed to `origin/main` — nothing left local-only (`git log origin/main..main` empty)
- The finished build live on the `n000` main port — never killed, only restarted if needed (the user's constant preview)
- **Report to the user:** merge order taken, any uncommitted WIP decisions made (worktree *and* main), what was verified live, and any pre-existing repo issues surfaced (not fixed) along the way

---

## Steps

### Phase 1 — Survey

1. **List worktrees and main state.** Run from `REPO_ROOT`:
   ```bash
   git -C $REPO_ROOT worktree list
   git -C $REPO_ROOT status --short
   git -C $REPO_ROOT log --oneline --decorate --graph -20
   ```
   Identify: main's current HEAD, each linked worktree's path and branch tip, **and main's own working-tree state** — tracked modifications and untracked files sitting in `REPO_ROOT` that are not in any worktree. These get committed in the blank-slate step (20); record them now so nothing is missed.

2. **Per-worktree state.** For each linked worktree, run:
   ```bash
   git -C <worktree_path> status --short                       # uncommitted WIP
   git -C <worktree_path> log --oneline origin/main..HEAD      # commits ahead of origin
   git -C <worktree_path> diff --stat origin/main..HEAD        # files touched
   ```
   Record three categories:
   - **Clean feature branches** — commits ahead of `origin/main`, no uncommitted WIP
   - **WIP-only worktrees** — zero commits ahead, but `status` shows modifications
   - **Stale/empty worktrees** — zero commits, zero WIP (later pruned without merge)

3. **Overlap analysis.** Cross-reference each branch's file list against:
   - The other branches (which will be merged in series)
   - `main`'s `diff --stat origin/main..main` (commits on main not yet on origin)

   Branches with disjoint file sets merge first; overlapping branches merge later. Build the explicit order before doing any merges.

### Phase 2 — Decide on WIP

4. **Surface WIP-only worktrees to the user.** For each, look at the diff and the branch name to infer intent (e.g., `-stuck-2` → investigation; `feature-x` → unfinished feature). Present the options as a single question with three choices:
   - Discard the worktree
   - Commit the WIP and merge alongside the others
   - Leave the worktree as-is (skip from this run)

   Do not guess. WIP can be debug instrumentation that should never ship; it can also be 80%-done feature work. Only the user knows.

5. **If the user chose "commit and merge":** commit the WIP inside the worktree with a clear scope tag (`debug:`, `wip:`, `feat:` as appropriate) — never reuse a `feat:` tag for instrumentation. The commit must be made inside the worktree, not in the main worktree (use `cd <worktree_path> && git commit` in one Bash call, or `git -C <worktree_path>` for each git step).

### Phase 3 — Merge

For each branch in dependency order, with `git -C` everywhere (never rely on `cd` between Bash calls):

6. **Rebase the branch onto current main inside its own worktree.** This step is the heart of the workflow — direct `git merge` with `ort` can silently take a wholesale block from the branch and lose overlapping edits on `main`, even when it reports "successfully merged" with no conflict:
   ```bash
   git -C <worktree_path> rebase main
   ```
   - If the rebase succeeds with no conflict, the diffs composed cleanly. Sanity-check anyway (step 7).
   - If conflicts surface, resolve them inside the worktree with full context. Each conflict is an explicit decision; never bias toward one side without reading both.

   **Multi-iteration branches: squash before rebase.** If the branch carries the same line of work across multiple commits (e.g., aggressive-first-pass → dial-back → polish), each intermediate commit replays during rebase and re-conflicts with main's overlapping edits — three commits × five files = fifteen conflict markers cascading. Squash to one commit representing the net delta first:
   ```bash
   git -C <worktree_path> reset --soft <branch's pre-iteration parent>
   git -C <worktree_path> commit -m "feat: <one-line scope> (squashed)"
   git -C <worktree_path> rebase main
   ```
   Conflicts now happen once. The branch history loses its iteration breadcrumbs, but those breadcrumbs are noise once the dial-back has converged — the merge commit on `main` preserves the high-level "this is where this work came from" signal.

7. **Sanity-check feature preservation.** Before merging, `grep` for signature symbols of *both* sides — the branch's feature *and* any prior main-only change in the same files. Example for a rebased branch that touches the same file as a prior main fix:
   ```bash
   grep -n "<branch_feature_marker>" <worktree>/<changed_file>
   grep -n "<main_fix_marker>" <worktree>/<changed_file>
   ```
   If either marker is missing, the rebase composed wrong — investigate before proceeding.

8. **Fast-forward merge into main.** From `REPO_ROOT` (always `git -C $REPO_ROOT`):
   ```bash
   git -C $REPO_ROOT merge --no-ff <branch> -m "Merge branch '<branch>': <one-line scope>"
   ```
   `--no-ff` preserves the branch as a visible merge in the log — useful for later auditing of where features came from.

9. **Sanity-check main after the merge.** Re-run the grep from step 7 against the main-worktree paths. If a marker disappeared, **reset the merge** (`git -C $REPO_ROOT reset --hard HEAD~1`), diagnose, and redo. Never proceed with a silent loss. Note: the safety hook in `.claude/settings.json` blocks `reset --hard` from the assistant's own Bash calls (it is a destructive op). Merge-undo here is deliberate, so ask the user to run that one command themselves (a `!`-prefixed command or their terminal) after you confirm the loss — the hook gates the assistant, not the user.

10. **Repeat steps 6–9 for the next branch.** Each subsequent merge sees the cumulative state from prior merges, so the rebase base shifts forward — that's correct.

### Phase 4 — Verify

11. **Typecheck the changed subproject.** From `PROJECT_DEV_PATH`:
    ```bash
    rm -rf .next                      # if Next.js — stale cache after merge causes phantom errors
    npx tsc --noEmit
    ```
    Triage every error by `git blame`:
    - **Introduced by this merge** → fix forward, then re-run typecheck
    - **Pre-existing** → surface to the user later, do not fix in this workflow

12. **Boot the dev server and run a browser smoke (UI projects only).** Use `playwright-cli` in headless localhost mode:
    ```bash
    # in the project dir, background the dev server, wait for "Ready in"
    npx next dev   (or equivalent)
    playwright-cli -s=<short_name> open http://localhost:<port>
    playwright-cli -s=<short_name> console     # check for hydration errors and runtime errors
    playwright-cli --raw -s=<short_name> eval "<feature_probe>"
    ```
    For each merged branch, probe at least one observable signal of its feature (a window global, a CSS variable, a DOM-rendered marker). Press a real key or click a real button when the feature is interactive.

13. **Triage browser errors** the same way as typecheck errors: introduced by the merge → fix forward; pre-existing → surface only. The most common merge-introduced runtime issues are React hydration mismatches from new `'use client'` components that read `document.activeElement` or `window.*` during SSR.

    **Strip dev-only scaffolding before finalizing.** Feature worktrees routinely carry development-only UI that must NOT reach `main`: variant/sample pickers, A/B skin switchers, debug overlays, `*_FAKE_*` test toggles. A `--no-ff` merge brings them across silently. Grep the merged hot files for the tells — `dev-only`, `dev only`, `stripped once`, `TODO.*remove`, `sample`, `switcher`, and `position: fixed` chrome pinned to a screen corner (often overlapping real controls) — and remove the scaffold (JSX + CSS + now-dead state/helpers) once the corresponding choice is locked in `decisions/log.md`. A merge can silently carry an A/B/C/D/E variant switcher onto `main`, `position: fixed` over a real control, even after the variant was already chosen — grep for the self-labeling comment and strip it.

    **For AI/external-API-dependent merges, run the project's live eval against the merged build — it is the real gate, not tsc + browser smoke.** Two traps: (a) **`.env.local` is gitignored, so it is ABSENT in the integration worktree** — copy it in (`cp <REPO_ROOT>/<proj>/.env.local <worktree>/<proj>/.env.local`) before any live-API run, or every call returns "No API key". (b) **A merged branch may have changed a route's required REQUEST CONTRACT** (e.g. one branch added a required `measureIds` field that the UI sends but the older eval did not) — a 0-result / failing case can be a stale-test-request, not a regression. When a branch's diff adds a required request field, update its eval/caller to match the real caller's shape, then re-judge. Verify by hitting the route directly with the correct body before concluding the feature is broken.

14. **Commit any post-merge fixes** with a single scope-tagged commit so the merge history stays clean:
    ```
    fix(<project>): cleanup after merging N worktree branches
    ```
    List each fix in the body (one line per).

### Phase 5 — Prune

**Branch DELETION (local + remote) requires the user's explicit OK — Archives Rule.** CLAUDE.md's "Never delete anything" governs this workflow. The `--no-ff` merges already preserve every branch's commits on `main` (each is a merge commit's 2nd parent, recoverable via `git checkout <merge>^2`), so **keeping the branches loses nothing and is the default.** Do NOT auto-run `git branch -D` / `git push origin --delete` chasing a "blank slate": the auto-mode classifier (correctly) blocks remote-branch deletion as scope escalation when the user only asked to *merge*. Safe to do without asking: prune the worktree **directories** (steps 15-16 — that's removing a checkout, not a branch) and, for recovery points, **archive-tag** the tips (additive). Delete branch refs only on the user's say-so. The deletion lines in step 15's note and the "Retire a redundant backup branch" note below are gated by this.

15. **Remove each merged worktree and delete its branch.** For each:
    ```bash
    git -C $REPO_ROOT worktree remove <worktree_path>
    git -C $REPO_ROOT branch -d <branch>
    ```
    `worktree remove` will refuse if the directory has unignored untracked files. If that happens, inspect (`ls -la`) before forcing — there should be nothing of value since the branch is merged, but verify. After verification, `rm -rf` the leftover directory.

    **`git branch -d` refusal is expected, not an error.** This workflow pushes the merge to `main`, never to the feature branch, so the branch's upstream `origin/<branch>` never receives it — `git branch -d` then refuses with "not yet merged to refs/remotes/origin/<branch>" *even though git's own message confirms "it is merged to HEAD"*. After verifying `git branch --merged main` lists the branch AND the work is reachable on `origin/main` (post-push) or the tip is archive-tagged, force the ref delete with `git branch -D <branch>` — the commits survive in main's merge history. For a true blank slate, also delete the remote branch: `git -C $REPO_ROOT push origin --delete <branch>`. Both `git branch -D` and the force-push form of the delete are blocked by the safety hook in `.claude/settings.json` when the assistant runs them; this is intentional. Surface the exact commands to the user and have them run the deletion themselves after they confirm — the hook gates the assistant, not the user.

16. **Sweep stale leftover worktree directories.** Run `git -C $REPO_ROOT worktree list` again. Then `ls .claude/worktrees/` (or the project's worktree root). Any directory that isn't in the worktree list is detritus from a prior cleanup — verify it contains only build artifacts or logs, then `rm -rf`.

### Phase 6 — Finalize

17. **Close playwright sessions** to end background tasks cleanly:
    ```bash
    playwright-cli -s=<short_name> close
    ```

18. **Collapse the port band onto the main port.** The merged worktrees' servers in the project's `n001`–`n999` band are now orphaned (their worktrees were pruned in Phase 5). Kill every one of them, then make sure the single finished build is live on the main port `n000` so the user hits one canonical server. Substitute the project's digit for `N` (see the Localhost Port Allocation gate for the project's assigned digit):
    ```bash
    N=<project digit>
    # kill every worktree-band server (N001–N999); leave the N000 main port alone
    lsof -nP -iTCP -sTCP:LISTEN \
      | awk -v n="$N" '$9 ~ ":"n"[0-9][0-9][0-9]$" && $9 !~ ":"n"000$" {print $2}' \
      | sort -u | xargs -r kill
    # ensure the main port serves the EXPECTED build, not merely *a* build.
    # MARKER = a string unique to this project's finished build
    # (e.g. "<title>My Project</title>" for this project's main port).
    MARKER='<expected build marker>'
    if ! curl -s --max-time 4 "localhost:${N}000" | grep -qF "$MARKER"; then
      lsof -nP -iTCP -sTCP:LISTEN | awk -v p=":${N}000" '$9 ~ p"$" {print $2}' | sort -u | xargs -r kill
      ( cd <PROJECT_DEV_PATH> && PORT=${N}000 npx next dev )
    fi
    ```
    A liveness-only probe (`curl -sf … >/dev/null`) is insufficient: a foreign or wrong-version build bound to `n000` returns 200 and silently passes, leaving the user's canonical preview serving the wrong app. Always verify the version-specific marker — for a bisected project this is how a V1/V2 swap (V1 squatting V2's `3000` because a `package.json` left `dev` on the default port) gets caught and corrected instead of shipped.

    **Bisected project:** when a project bisects its digit to run two live versions in parallel, only collapse the band of the version you merged. For digit `3`: V2 → kill `3001`–`3499`, keep/restart `3000`; V1 → kill `3501`–`3999`, keep/restart `3500`. Never touch the other version's main port or band (adjust the awk range accordingly, e.g. `3[0-4][0-9][0-9]` excluding `3000` for V2).

    **Never kill the `n000` main-port server — not here, not at session end, not ever.** It is the user's constant live preview of the finished build. This step only ensures it is serving the newest merged result: a *restart* to pick up merged code is allowed and often required (the `rm -rf .next` in step 11 may have broken the running server), but it is never left dead. Per pylon's Dev server discipline rule and the Localhost Port Allocation gate, the `n000` server survives `/wrap` and true session end — only the `n001+` worktree band is killed.

19. **Check for stray screenshots** in the repo root and the project root: `ls *.png`. Delete any that came from this verification run.

20. **Commit everything, then push — the blank-slate step.** The repo must end with a clean tree; this is what makes the workflow a true reset, not just a worktree merge. First, reconcile the merged project's `## Active Issues` in `projects/<name>/context.md` — dedup entries and remove anything this merge resolved (convention: `references/project-memory.md`). Then re-run `git -C $REPO_ROOT status --short`. For anything still uncommitted (including the main-worktree changes recorded in step 1):
    - **Tracked modifications and intentional new files** (assistant brain edits, project assets, context updates, references, etc.) → stage and commit under scoped commits (`feat:`, `fix:`, `chore:`, `docs(...)`), one logical group per commit. Group by what the change is, not by file.
    - **Ambiguous or unexpected entries** (debug detritus, generated junk, anything you did not create and cannot explain) → do NOT blindly commit. Surface them to the user exactly the way Phase 2 surfaces WIP-only worktrees — discard, commit, or leave — and act on the answer. Stray verification screenshots were already swept in step 19; anything left is a real decision.
    - Respect `.gitignore`; never force-add ignored build artifacts (`.next/`, `node_modules/`, `.playwright-cli/`).

    Then push:
    ```bash
    git -C $REPO_ROOT push origin main
    ```
    **End-state gate:** `git -C $REPO_ROOT status --short` is empty AND `git -C $REPO_ROOT log origin/main..main` is empty. Both must be true before reporting done — that is the blank slate.

21. **Report to the user.** A concise summary:
    - Final commits on `main` (the merge commits with one-line scopes)
    - Any WIP decisions taken with the user
    - What was verified live (with concrete signals — "Cmd+= changed `--zoom` from 0.75 → 0.9")
    - Any pre-existing repo issues surfaced (typecheck, lint, hydration) that were left alone
    - State of `git worktree list` (should be just `main`)

---

## Checklist

- [ ] Surveyed all worktrees and recorded WIP / clean / stale state
- [ ] Mapped file-overlap and built merge order before any merge
- [ ] Surfaced every WIP-only worktree to the user and got an explicit decision
- [ ] Each branch rebased onto current main inside its own worktree
- [ ] Each merge sanity-checked with grep for both branch and prior-main markers
- [ ] Typecheck run; merge-introduced errors fixed, pre-existing ones surfaced
- [ ] Dev server booted and feature probes executed in headless playwright (UI projects)
- [ ] Dev-only scaffolding (variant/sample pickers, debug overlays, fake-API toggles) grepped for and stripped from the merged result
- [ ] Post-merge cleanup committed as a single `fix(<project>): ...` commit
- [ ] All merged worktrees pruned and branches deleted
- [ ] Stale leftover worktree directories removed
- [ ] Worktree-band servers (`n001`–`n999`) killed, finished build live on the `n000` main port (never killed — restarted if needed), playwright closed, stray screenshots cleaned
- [ ] Main's own remaining changes committed under scoped commits; ambiguous entries surfaced to the user
- [ ] Merged project's `## Active Issues` reconciled (deduped, resolved entries removed)
- [ ] Working tree clean (`git status --short` empty) and everything pushed to `origin/main` (`git log origin/main..main` empty)
- [ ] User received concise report

---

## Notes

- **Use `git -C <path>` everywhere.** Bash tool calls do *not* reset cwd between invocations. A single earlier `cd <worktree>` can silently route every later git command (including `merge` and `reset`) to the wrong branch. `git -C` removes the entire class of failure.

- **Rebase first, merge second.** A direct `git merge` of a branch whose base predates main's latest commit can have `ort` report "Auto-merging" with no conflict while quietly replacing a function on `main` with the branch's older code. Catching it requires grep'ing for the marker. Rebasing the branch onto current main first prevents the failure: the rebase replays the branch diff atop main's exact state, so conflicts surface or composition is clean.

- **Concurrent session holds the main checkout → never merge in `REPO_ROOT`; merge in an isolated worktree off the freshly re-fetched `origin/main`.** When parallel sessions run, the shared main checkout (`REPO_ROOT`) is routinely on *another session's* feature branch (not `main`), and that branch drifts and gets pushed *mid-run*. Two hard rules: (1) **Never `git branch -f main HEAD`** when `HEAD` is a drifted shared-checkout branch — it silently bundles the other session's commits onto `main`. (2) Sequence the merge as `git fetch origin` → re-rebase the feature branch onto *current* `origin/main` → `git worktree add --detach /tmp/<x> origin/main` (detached, NOT the local `main` branch — local `main` is routinely checked out in another session's worktree, so `worktree add … main` fails outright) → `--no-ff` merge there → non-force `git push origin HEAD:main` → `git worktree remove`. The shared checkout's branch, WIP, and working tree are never touched. **Recovery if refs already polluted:** `git reset --mixed <concurrent-tip>` (**never `--hard`** — that destroys the concurrent session's uncommitted WIP), then `git checkout <concurrent-tip> -- <only the file the bad merge wrote>` to surgically undo just the working-tree pollution, then `git branch -f main origin/main`. **Step 18 corollary:** if the `n000` server is bound to the shared checkout on a divergent branch, restarting it onto the merged build is **out of scope** (would require switching the other session's branch) — report the exact state and the unblock condition (the concurrent session integrates the new `main`) instead of forcing it. **But** if `n000` is served by an *orphaned, unregistered* worktree (its dir is absent from `git worktree list` — stale detritus from a prior cleanup, not a live session), that server IS safe to kill and restart on the finished build per step 18; an orphaned server is not a concurrent session. And when no clean main checkout can host `n000` (shared checkout on another branch) yet the finished build must go live there, keep this run's own feature worktree un-pruned as the persistent `n000` serving source — its post-rebase project files are byte-identical to merged `origin/main` — and say so in the report; this is an allowed, scoped deviation from Phase 5. The same isolated-worktree pattern is how `/wrap` lands system-file lessons when the shared checkout is held by another session.

- **`ort` "success" is not the same as semantic correctness.** Always re-grep for at least one signature of every change that pre-existed on main in files the merge touched. If you cannot name a signature, you do not understand the merge well enough to trust it.

- **Pre-existing brokenness is not in scope.** If `tsc` or `next build` was already failing on main before any merge, do not fix it inside this workflow — surface it in the final report. The workflow's contract is "did not introduce regressions," not "left every pre-existing issue resolved."

- **Overnight execution: archive-tag is the lossless default, not "needs human review."** When running this workflow autonomously overnight, the "never force a merge you can't verify unattended" guardrail is correctly read as "never push an unverified merge to `main` overnight" — NOT as "do nothing and defer the audit." For every branch that cannot be safely merged blind (file overlap with the deployed deliverable, sibling-merged conflicts, anything you can't `tsc`/smoke-test cold), the lossless overnight action is: archive-tag the branch tip (`git tag -a archive/<name>-history <branch>` + push), then delete the branch local + remote in the morning's execute phase. The tag preserves every commit losslessly so the work is recoverable via `git checkout -b <name> archive/<tag>` + cherry-pick. The morning report then shows a clean per-branch disposition (MERGE / ARCHIVE) with one-line rationale per branch, and the user's action is a quick yes/no on the merges — not "audit eight branches from scratch." Lossless preservation is always within scope; only the irreversible step (the merge push) ever waits for the user.

- **Far-diverged single project → path-checkout, not a divergent rebase-merge.** When the loop being closed is one self-contained project whose branch has diverged heavily from `main` (e.g. tens of commits each way) AND the project lives entirely under `projects/<name>/` (plus its own docs/archives) AND those exact paths are *absent* on `main` (`[ -e <path> ]` is false for every one), do not rebase-merge the whole branch onto an unrelated, dirty `main`. Bring only the project paths: verify none are present or dirty on `main`, then `git checkout <branch> -- projects/<name> <its docs/archives paths>`, `git commit -- <those exact pathspecs>` (never `git add -A`; main carries other sessions' WIP), push. The branch is kept (local + origin) as the full-history backup; the snapshot on `main` is intentional and noted in the commit body. Shared/system files the branch also touched (`.assistants/<x>.md`, `registry/index.md`, `references/gotchas.md`, `decisions/log.md`) almost always diverged independently on `main` — do NOT clobber them with the branch's stale copies; reconcile them on `main` via the session's `/wrap` instead.

- **Far-diverged branches that overlap *each other* (project IS on main) → rebase the lowest-overlap branch, net-delta squash-compose the rest.** Distinct from the path-checkout note above: that one needs the project *absent* on `main`. When several branches each far-diverged from `main` (every `diff origin/main..branch` shows thousands of *phantom* deletions because `main` moved, not because the branch deleted anything) AND the project IS present on `main` AND the branches overlap each other on shared files: first prove `main` never touched the project paths since the oldest fork (`git log <oldest-merge-base>..main -- <paths>` empty) — then each branch's project tree is pristine vs base and phantom deletions vanish on rebase. Rebase only the lowest-overlap branch onto a fixed `origin/main` snapshot in an isolated integration worktree, `--no-ff` merge it. For each remaining overlapping sibling do NOT rebase-replay its intermediates (a branch that builds then rebuilds the same region forces you to resolve that region against every throwaway intermediate, compounding across siblings) — bring its *net* delta instead: `git diff $(git merge-base <snapshot> <branch>) <branch> -- <project paths> | git apply --3way` onto the integration, then one `Merge <branch>: <scope>` commit (squash; full per-commit history stays on `origin/<branch>` as the backup). `--3way` raises exactly one conflict per genuinely-overlapping file, resolved **once** against each branch's *final* state — read both source blobs (`git show <side>:<file>`) when the conflict mixes two features' functions; keep both, don't pick a side. Sanity-grep the new feature's marker AND every prior-merged sibling's + base marker after each step; `tsc --noEmit` clean + a per-feature runtime probe (unit test, or browser-smoke the live overlay) before landing.

- **Retire a redundant backup branch losslessly: archive-tag the tip, then delete — never history-merge it.** After a project lands via path-checkout or net-delta squash-compose, the origin `worktree-*` backup branches are NOT ancestors of `main` (so `git branch -d` refuses) yet their content is already integrated. A "merge it into main" request on such a branch is a false premise: first `git diff --stat main <branch> -- projects/<name>` — if source files are identical or `main` is newer, there is nothing to merge and a real `git merge` would silently reintroduce thousands of *phantom* deletions (everything `main` gained after the branch's fork point). The correct action is lossless retirement: `git tag -a archive/<name>-history origin/<branch> -m "…"`, `git push origin archive/<name>-history`, verify `git rev-parse archive/<name>-history^{commit}` equals the branch tip, then delete the branch local + `git push origin --delete <branch>`. A tag makes the full history permanently reachable on origin, so the delete loses nothing — this is the standard close-out for every backup branch, including ones a prior decisions-log entry flagged as "retained pending the user's word." Restore later with `git checkout -b <name> archive/<name>-history`.

- **Fresh integration/temp worktree typecheck/dev:** a new worktree has no `node_modules` (git worktrees never share it). Don't `npm install` per-worktree — symlink the main checkout's: `ln -s <REPO_ROOT>/<proj>/node_modules <worktree>/<proj>/node_modules`. Next.js/TS resolve cleanly through it; `next dev`/`tsc --noEmit` then run from the worktree.

- **Headless playwright is fine for localhost smoke.** The pylon brain rule (default headless, only switch to headed for debugging) takes priority over the global playwright-cli rule that prefers `--headed`.

- **Pylon's `Pre-Task Gate` does not apply here.** That gate exists to *create* a worktree before doing work. This workflow's whole purpose is to operate on existing worktrees from the main checkout. Skip the gate.

- **Doc-only commits on `origin/main` describing a peer branch's pending code = clean rebase ahead.** When a parallel session wraps and lands a wrap commit on `main` that documents fixes whose CODE still lives only on this run's branch (the giveaway phrasing is "Implementation lives on worktree-X as <sha>" inside the wrap body, or a context.md / gotchas.md / decisions/log.md entry that names a fix the merge-base doesn't contain), the `diff --stat origin/main..HEAD` count is misleading — origin/main has zero overlapping CODE commits and the rebase replays the branch's code on top without conflict. Conflicts will be confined to the doc files. Diagnostic step before squashing: `git log <merge-base>..origin/main --name-only -- projects/<name>/` — if every result is a `docs(...)`, `wrap:`, or context.md / gotchas.md / decisions/log.md touch, skip the squash heuristic and just rebase straight through; let the docs conflict and compose both sides.

---

## Self-Improvement

After each run, update this file if:

- A new failure mode surfaced that wasn't covered (e.g., a rebase that succeeded clean but lost something only the dev server caught)
- A verification step proved insufficient (e.g., a feature with no DOM-observable signal — add a guidance note on how to instrument it next time)
- The user's WIP decisions revealed a pattern worth pre-empting in the prompt

**Known issues & workarounds:**

- `git worktree remove` fails on directories containing `.next/` or `.playwright-cli/` even after the branch is merged. Verify the contents, then `rm -rf` manually.
- React hydration errors from `'use client'` components that read `document.*` during SSR are the most common merge-introduced runtime regression for Next.js projects. Fix by gating render on a `mounted` state set inside `useEffect`.
- The native `ExitWorktree(remove)` tool counts commits against the *original* base, so after a rebase-onto-current-main + merge + push it reports "N commits, will discard" and refuses without `discard_changes: true`. Passing `true` is safe **only after** verifying the work is reachable from origin: `git branch --merged main` lists the branch AND `git rev-parse main origin/main` match. The commits survive on `main`; only the redundant branch ref is deleted.
