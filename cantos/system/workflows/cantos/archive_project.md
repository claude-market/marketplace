# Archive a Completed Project

Move a finished/submitted project from `projects/<name>/` to `archives/<name>/` and route every live reference, without entangling concurrent sessions. Owner: cantos (shared — any assistant runs it on a project it owns). Trigger: the user says a project is "done / submitted / archive it." Per the Archives Rule in `CLAUDE.md`, never delete — move.

## Step 1 — Confirm the project is genuinely done

- Read `projects/<name>/context.md` Status. Confirm it reads complete/submitted/shipped, not mid-flight.
- If there is any doubt, ask the user before moving. The move itself is reversible; re-routing pointers is work you don't want to redo on a false alarm.

## Step 2 — Map every reference before moving

Run from repo root (swap in the project's name and a keyword):

```
grep -rniE "<keyword>" . --include="*.md" -l | grep -vE "projects/<name>/|node_modules|\.git/"
grep -rn "projects/<name>" . --exclude-dir=.git --exclude-dir=node_modules | grep -vE "^\./projects/<name>/"
```

Classify each hit:

- **Live operational pointers — must update:** the owning assistant's brain file (Active Projects table; for pylon also the Localhost Port Allocation table), and any "Owned projects" column in `registry/index.md`.
- **Historical / frozen records — leave untouched:** `decisions/log.md` entries (append-only), `references/gotchas.md` and workflow "Seen in:" provenance notes (still-valid general lessons), `docs/plans/` and `docs/specs/` (permanent design record kept at repo root), `logs/` runtime captures, and the project's own internal docs (they move with it; their relative paths stay valid).

## Step 3 — Check for concurrent-session contention (Non-Negotiable)

Run `git status` before editing any shared file. If `decisions/log.md`, `registry/index.md`, or a brain file you would touch already shows uncommitted edits from a parallel session:

- Do NOT `git add` that whole file — you would sweep up or fragment the other session's work.
- Append-only shared files (`decisions/log.md`): put your rationale in the COMMIT MESSAGE instead of appending an entry — a tail append sits in the same diff hunk as theirs and cannot be staged alone.
- Multi-section files (`registry/index.md`) where your edit is in a different region than theirs: edit, then `git add -p <file>` to stage ONLY your hunk.
- Never resolve the entanglement by committing their lines. Surface it in your report.

## Step 4 — Move the project

```
git mv projects/<name> archives/<name>
```

- `git mv` on the directory renames all tracked files and relocates untracked ones (`node_modules`, `dist`, `.vercel`) on disk in one rename.
- If a similarly named archive already exists (e.g. an older `archives/<name>-v1`), keep it and give the current build a distinct name.
- Verify: new path populated, old path gone, tracked-file count matches the pre-move count.

## Step 5 — Route the live pointers

- Owning brain file: remove the project's row from the Active Projects table. If the owning assistant tracks a per-project resource (e.g. pylon's Localhost Port Allocation table), also remove that row and note the freed resource in the table's parenthetical so a future project can claim it.
- `registry/index.md`: drop the project from any "Owned projects" column where it appears.
- Add an `ARCHIVED <date>` banner to the top of the moved `archives/<name>/context.md` Status — record the move, owner, freed resources, and that the doc's internal relative paths still resolve.

## Step 6 — Commit selectively

- Stage ONLY the files this archival touched: the rename, the brain file, the moved `context.md`, and (surgically, per Step 3) your registry hunk. NEVER `git add -A`.
- Verify with `git diff --cached --name-only` that no concurrent-session file leaked.
- The commit message carries the full decision record: what moved, what was routed, what was left untouched and why, and any contention hand-off. Push only when the user asks.

## Step 7 — Flag runtime leftovers

- A pylon dev server may still be bound to the freed port. The Localhost Port Allocation gate forbids killing a running dev server unilaterally — flag it for the user and offer to stop it so the port is fully free.
