# Workflow: First-Run Setup

**Owner:** Cantos
**References:** `references/doc-best-practices.md`, `workflows/cantos/create_assistant.md`
**Objective:** Turn this generic clone of the template into the user's own personalized assistant system through a warm, thorough interview, then write the results into the system's own files.

This is the very first thing Cantos runs on a fresh clone. The user has not configured anything yet. Treat them as a brand-new owner who may not know the system's vocabulary, and explain as you go.

This workflow runs IN PLACE on the user's own checkout — it is exempt from the worktree-isolation gate (see `.assistants/cantos/cantos.md` Pre-Maintenance Gate). A throwaway worktree would discard setup's edits and leave the `<!-- SETUP-NOT-DONE -->` marker in the real checkout, so setup would loop forever. Edit `main` directly.

---

## Trigger

`context/me.md` contains the literal line `<!-- SETUP-NOT-DONE -->`. While that marker is present, the CLAUDE.md First-Run Setup gate forces this workflow before any other work — even if the user's first message looks like a normal task. Run it start to finish. Removing the marker (Step 9) is what stops it from running again.

---

## The 95% Rule

Do not write any file until you are ~95% confident you understand what the answer should be. If an answer is vague, ask one focused follow-up before moving on. A guessed profile that the user has to correct afterward is a failed interview, not a finished one. It is fine to batch related questions in one message — keep it conversational, not a robotic form.

---

## Checklist

- [ ] Step 1 — Open warmly and explain what setup does
- [ ] Step 2 — Who the user is
- [ ] Step 3 — Context and priorities
- [ ] Step 4 — Tools and accounts
- [ ] Step 5 — Communication style
- [ ] Step 6 — Assistants (keep / rename / remove / add)
- [ ] Step 7 — Write the results into the system
- [ ] Step 8 — Confirm the summary back; let the user correct it
- [ ] Step 9 — Finalize (remove marker, log, hand off)

---

## Step 1 — Open warmly

Greet the user as Cantos and explain, briefly, what is about to happen:

- This is a one-time setup that personalizes the system to them. It takes a few minutes.
- You'll ask about who they are, what they want this for, their tools, and their style, then write it into the system so every assistant knows their context from now on.
- They can change any of it later by editing `context/me.md`, `context/work.md`, or just telling an assistant.

Set the privacy expectation early, in one line: once configured, this becomes their personal system holding their own context and (for folio) their writing. Recommend they keep their configured copy in a PRIVATE repo and never push it to the upstream public template. Raw writing-voice samples and their analysis are gitignored by default, so they stay local even in a private repo.

Then start the interview. Ask in plain language; don't dump all questions at once.

---

## Step 2 — Who the user is

Goal: enough identity to fill the top of `context/me.md`.

Ask (batch these):

1. What's your name, and what should the assistants call you?
2. What do you do? (student, a profession, founder, a mix — whatever fits)
3. In one sentence, what do you want this system to help you with most?

Follow-up only if the one-sentence answer is too broad to act on (e.g. "everything" → "If you could only fix one part of your week with this, what would it be?").

---

## Step 3 — Context and priorities

Goal: the daily-rhythm and priorities that let assistants make the right tradeoffs.

Ask:

1. What does a normal day or week look like? (work/study hours, fixed commitments, when you actually get things done)
2. What is your single highest priority — the thing that wins when two requests compete for your time?
3. What kinds of work do you do most? List the recurring categories (e.g. writing, coding, admin, research, planning). These tell the assistants what to expect.
4. Any roles, projects, or commitments worth knowing about?
5. What timezone are you in? Assistants use it for scheduling and deadlines.

The priority answer matters most — it becomes the "Top Priority" tiebreaker the whole system defers to. Pin it down. If they name several, ask which one wins head-to-head.

---

## Step 4 — Tools and accounts

Goal: fill the Tools and MCP sections of `context/work.md` so lyren and the others know what they can actually touch.

Ask:

1. Which MCP connectors have you connected, or plan to? Run through the list: Gmail, Google Calendar, Notion, Google Drive, GitHub. (lyren works only through connectors you've connected — nothing is assumed.)
2. Do you use a task or project system? If yes, which one, and roughly how is it structured? (e.g. a Notion database with fields like priority, due date, status — list the fields and their options if you have a fixed schema.)
3. Where does most of your work live? (Google Workspace, a local repo, a specific app)
4. Which external services or APIs do you want the assistants to use? Name them only — e.g. "OpenAI", "an NVIDIA NIM key for image generation", "a Slack webhook". (optional — fine to skip.) **Never ask for, and never accept, the secret key value itself.** If the user starts to paste one, stop them: keys live in environment variables or a gitignored `.env` file (already covered by the template's `.gitignore`), never in chat or in any committed file. Record only the service name and what it's for; note where the key should live (env var name or `.env`) so the assistant that needs it knows where to look.

If they use a task system with a fixed schema, capture the field names and their option lists verbatim. lyren will reproduce that schema exactly when it creates tasks, so guessing here causes real errors. If they have no system yet, note that and move on — they can define one later.

---

## Step 5 — Communication style

Goal: set `.claude/rules/communication-style.md` to match how they actually want to be talked to.

Ask:

1. What tone do you want day-to-day — direct and concise, warmer, more detailed, something else?
2. Format preference — bullet points by default, prose, tables, a mix?
3. How do you feel about em-dashes and emoji? (the template default is sparing on both)
4. Anything that drives you up the wall in AI writing that you want banned?

Keep their exact preferences. If they say "no emoji ever," write that as a hard rule, not "barely any."

---

## Step 6 — Assistants

Goal: decide the starter roster. First explain what's already here, then let them shape it.

First confirm the on-disk `.assistants/` folders match the four-row table below and the registry's Assistants section. If they differ, reconcile or flag it before presenting the roster.

Explain the four starters plainly:

| Assistant | What it does |
| --- | --- |
| `cantos` | The orchestrator (this one). Routes every request to the right assistant and keeps the system's files healthy. Not removable — it's the front door. |
| `folio` | Research and writing. Finding sources, building arguments, drafting, citations, checking for AI-sounding writing. |
| `lyren` | Executive assistant. Email, calendar, tasks, admin — all through the connectors you set up. Always drafts first; never sends or deletes without your OK. |
| `pylon` | The engineer. Builds web apps, sites, games, extensions; tests its own work against screenshots and ships finished things. |

Then ask:

1. Which of folio, lyren, pylon do you want to keep? (Keeping all three is fine and common.)
2. Want to rename any of them? (Names are cosmetic — the role stays the same.)
3. Any you definitely won't use and want removed to keep things lean?
4. Is there a domain none of these cover that deserves its own assistant? (e.g. a dedicated assistant for a specific recurring area of your life or work.)

Handling the answers:

- **Keep** — no action; leave the brain file as is.
- **Rename** — see Step 7 for the rename procedure (it touches several files).
- **Remove** — confirm explicitly first ("Remove `pylon` entirely? You can't easily undo this."), then in Step 7 delete the assistant folder, its routing row, and its registry rows.
- **Add** — offer to run `workflows/cantos/create_assistant.md`. Do that AFTER finishing the rest of setup (Steps 7–9) so the base system is configured first, then run the create-assistant interview as a clean follow-on. Don't interleave the two interviews.

---

## Step 7 — Write the results

Now turn the answers into files. Edit incrementally — make each edit, confirm it landed, move to the next. Do not batch every write to the end.

### 7a — `context/me.md`

Replace the placeholder body with the real profile. Keep the `<!-- SETUP-NOT-DONE -->` marker line in place for now (Step 9 removes it). Fill:

- Name and what to call them
- What they do (role/profession/student)
- The one-sentence purpose of the system
- Their highest priority (the tiebreaker)
- Recurring interests / categories of work / roles
- Their timezone

### 7b — `context/work.md`

Fill from Step 3 and Step 4 answers:

- Schedule and daily rhythm (work/study hours, fixed commitments, when they focus)
- Tools (where work lives — Workspace, repos, apps)
- MCP servers connected (only the ones they actually named)
- Task system and its schema, if any (field names and option lists verbatim)

### 7c — `.claude/rules/communication-style.md`

Update Tone, Format, and What to Avoid to match Step 5. Set how the assistants should address the user (their name or "the user"), and encode hard preferences as hard rules rather than soft suggestions. If the user bans a character or pattern (for example em-dashes), remove every instance of it from this file AND from the context files you wrote in 7a and 7b, including the template's own bullet-label separators. The rules file must obey the rule it states.

### 7d — Assistant changes (only if Step 6 produced any)

An assistant's name is woven through prose, paths, registry rows, routing, and symlinks. A half-done rename or remove leaves dangling references that break routing later. Both procedures end with a repo-wide grep that must come back clean — that grep is the verification, not optional.

**Rename** an assistant from `<old>` to `<new>`:

1. **Map every reference first.** Run `grep -rIn "<old>" .` from the repo root (case-insensitive too: add `-i` if the name might be capitalized in prose). This is your worklist — every hit is something to update or consciously leave (e.g. an archived decision-log entry, which stays as written).
2. Rename the folder `.assistants/<old>/` → `.assistants/<new>/` and the brain file `<old>.md` → `<new>.md`. Update the brain file's heading and every self-reference inside it.
3. Rename the assistant's owned directories if they exist: `tools/<old>/` → `tools/<new>/`, `workflows/<old>/` → `workflows/<new>/`. (Sub-agents move with the brain folder in step 2.)
4. Update the Assistant Directory table in `CLAUDE.md` (the row's name and brain path) and every routing mention of `<old>` elsewhere in `CLAUDE.md`.
5. Update `registry/index.md`: the assistant's row under Assistants, plus every Tools / Workflows / Sub-agents / References row whose path or owner contains `<old>`.
6. Fix `.claude/agents/` symlinks. Any symlink whose target path contained `.assistants/<old>/...` now points nowhere — recreate it pointing at the new path (`ln -sf ../../.assistants/<new>/sub-agents/<file> .claude/agents/<hyphenated-name>.md`). Verify each with `ls -l .claude/agents/` (no broken/dangling links).
7. Update remaining prose mentions from the step-1 worklist — other brain files, references, project contexts, this workflow's examples if relevant.
8. **Re-grep to confirm.** Run `grep -rIn "<old>" .` again. The only acceptable remaining hits are intentional historical records (e.g. an append-only `decisions/log.md` line). Zero stray live references — paths, routing, registry rows, prose. If any unexpected hit remains, fix it before finishing.

**Remove** an assistant named `<name>`:

1. Confirm explicitly with the user first (Step 6 already prompts this) — removal archives several folders and is not a one-keystroke undo.
2. **Map every reference first.** Run `grep -rIn "<name>" .` from the repo root. This is your removal worklist.
3. Archive everything the assistant owns (never delete — see the Archives Rule in `CLAUDE.md`). Move to `archives/`:
   - the brain folder `.assistants/<name>/` (which carries its `sub-agents/`),
   - `tools/<name>/` if it exists,
   - `workflows/<name>/` if it exists.
4. Remove its `.claude/agents/` symlinks. Any symlink whose target was under `.assistants/<name>/sub-agents/` must be deleted (it now dangles). Confirm with `ls -l .claude/agents/`.
5. Edit `CLAUDE.md`: delete its row from the Assistant Directory and remove every routing rule, example, or mention of `<name>`.
6. Edit `registry/index.md`: remove every row it owns — its Assistants row, and any Tools, Workflows, and Sub-agents rows whose path or owner is `<name>`.
7. Update any remaining prose mentions from the step-2 worklist (other brain files, references, project contexts).
8. **Re-grep to confirm.** Run `grep -rIn "<name>" .` again. Live references in the working system (paths, routing, registry, symlinks, prose) must be gone; the only acceptable hits are inside `archives/` and append-only historical records. Nothing dangles.

**Add** an assistant: defer to `workflows/cantos/create_assistant.md` after Step 9.

Leave the base CLAUDE.md routing logic intact for any assistant kept as-is. Only edit routing for renames, removals, and additions.

---

## Step 8 — Confirm back

Before finalizing, summarize everything captured in a short, scannable recap:

- Who they are and the system's purpose
- Their top priority
- Tools and connectors on record
- Communication style in one line
- The final assistant roster (kept / renamed / removed / to-be-added)

Ask them to confirm or correct. If they correct anything, fix the relevant file from Step 7, then re-confirm that piece. Do not move to Step 9 until they've signed off.

---

## Step 9 — Finalize

Once confirmed:

1. **Remove the marker.** Delete the `<!-- SETUP-NOT-DONE -->` line from `context/me.md`. This is what stops setup from re-running. Confirm it's gone.
2. **Log the decision.** Append to `decisions/log.md`:
   ```
   - [YYYY-MM-DD] Ran first-run setup; configured for <user>.
   ```
   Append this entry below the seed line that ships in the log (append-only — never delete or rewrite existing entries).
3. **Hand off.** Tell the user setup is complete and how to start:
   - Just describe what they need. Cantos routes it to the right assistant automatically.
   - Or address an assistant by name ("hi folio", "ask lyren to...") to go straight to it.
   - Say `/wrap` at the end of a session to have the system update its own files.
   - Privacy reminder: this is now their personalized system with their own context and writing. Keep it in a PRIVATE repo and never push to the upstream public template. Raw writing-voice samples and their analysis stay local — they are gitignored by default.
4. **Run create-assistant if requested.** If Step 6 asked for a new assistant, run `workflows/cantos/create_assistant.md` now, as a fresh follow-on.

---

## Edge Cases

- **First message is a real task, not "set me up."** Run setup first anyway (the gate is non-negotiable), but tell the user you'll handle their task the moment setup finishes — then do it.
- **User wants to skip setup.** Explain that without it the assistants have no context and will guess. Offer a fast path: capture just name, top priority, and connectors (Steps 2–4 minimum), then finalize. Still remove the marker so it doesn't nag.
- **User is unsure about connectors or task schema.** Record what they know, note the rest as "not set up yet" in `context/work.md`, and move on. These are easy to add later.
- **User answers change mid-interview.** Update the running picture; only Step 7 writes files, so nothing is committed until then.
- **Marker already missing but the user asks to "redo setup."** Re-run the interview and overwrite the context files; there's no marker to remove, so just skip Step 9's removal substep.

---

## Self-Improvement

After a setup run, assess: did any question confuse the user or produce an answer too vague to use? Did writing the files reveal a field the interview never asked about? Did a rename or removal touch a file this workflow didn't list? Fix this workflow immediately so the next clone's setup is smoother.
