# Workflow: Create Assistant

**Owner:** Cantos
**References:** `references/doc-best-practices.md` — apply these conventions when drafting the brain file
**Objective:** Produce a complete, standardized assistant folder that integrates cleanly into the Cantos system and accurately reflects what the user needs from it.

Do not build anything until Step 3 is complete and the user has approved the draft.

---

## Inputs

- The user's request to build a new assistant (may be vague or detailed — that's fine, the interview fills in the gaps)

## Outputs

- `.assistants/<name>/<name>.md` — assistant brain file
- `.assistants/<name>/sub-agents/` — empty folder, ready
- `tools/<name>/` — empty folder, ready
- `workflows/<name>/` — empty folder, ready
- `.claude/templates/<name>/` — created if assistant produces templated outputs
- `registry/index.md` — updated with new assistant row
- `CLAUDE.md` — updated assistant directory
- `decisions/log.md` — creation entry appended

---

## Steps

### Step 1 — Check the registry

Read `registry/index.md`.

- Confirm no assistant with this name already exists
- Check whether any existing assistant already covers the requested scope
- If overlap found: surface it to the user and ask whether to extend the existing assistant or create a separate one
- If clear: proceed to Step 2

---

### Step 2 — Interview the user

Ask all questions before designing anything. Group into three rounds so it doesn't feel overwhelming. Wait for answers between rounds.

**Round 1 — Identity**

1. What is the assistant's name?
2. What is its core domain in one sentence — what does it handle end-to-end?
3. What is its working style: thought partner who drives ideation and produces drafts, executor who follows detailed instructions, or something else?
4. What does a completed deliverable from this assistant look like? (Google Doc, DOCX, Notion page, spoken answer, code file, etc.)

**Round 2 — Scope**

5. Give 2–3 concrete examples of tasks it will handle.
6. What is explicitly out of scope — tasks it should refuse or hand back to Cantos?
7. Does it own any existing projects in `projects/`? Which ones?
8. Are there constraints it must always operate under? (citation format, word limits, tone, audience, organizational policy, etc.)

**Round 3 — WAT setup**

9. Does it need Python tools from day one, or should they emerge from use?
10. Does it need workflows from day one, or should they emerge from use?
11. Will it spawn sub-agents? If so, for what kinds of tasks?
12. Are there MCP tools or external systems it relies on? (Gmail, Notion, Google Calendar, GitHub, etc.)

If any answer is vague, ask one follow-up before moving on. Don't proceed to Step 3 with unanswered questions. In plan mode, run the full interview via AskUserQuestion *before* writing the plan or calling ExitPlanMode — never fold interview questions into plan assumptions or defer them to the assistant's first working session. An approved plan built on guessed answers is a failed interview, not a completed one. This interview-first discipline is non-negotiable.

---

### Step 3 — Design and get approval

Draft the brain file structure based on interview answers. Present to the user:

- The proposed identity section and bottom line paragraph
- Which tools/workflows/sub-agents tables will be pre-populated vs. left empty
- Any domain-specific operating rules planned for "How to Operate"
- Anything that's unclear or that the user should decide before writing begins

Wait for explicit approval. Incorporate any changes. Then proceed.

---

### Step 4 — Create folder structure

```
.assistants/<name>/
.assistants/<name>/sub-agents/
tools/<name>/
workflows/<name>/
.claude/templates/<name>/  ← only if the assistant produces templated outputs
```

---

### Step 5 — Write the brain file

Use `.claude/templates/assistants/brain_template.md` as the base. Do not copy from another assistant's brain file — start from the template and fill in from interview answers.

Sections to complete:

- Reference read-list — copy the opening "On load, read these references" block from `.claude/templates/assistants/brain_template.md` verbatim (root-relative paths, read explicitly). Do NOT use `@references/...` imports: a brain file is loaded by being read, so an `@import` line would not reliably expand and its relative path would resolve wrong.
- **Identity** — role, scope sentence, working style, key behaviors, what the user owns vs. what the assistant drives
- **Active Projects** — table (or `—` if none yet)
- **Tools and Workflows** — table (or `—` if none yet)
- **Sub-agents** — table (or `—` if none yet)
- **How to Operate** — 4–6 numbered rules, with at least 2 that are domain-specific
- **Continuous Self-Updating** — list of files to keep current after each session
- **Templates** — if applicable
- **Bottom Line** — one paragraph: mission, voice, and drive

---

### Step 6 — Update registry

Add to `registry/index.md` under Assistants:

```
| <name> | `.assistants/<name>/<name>.md` | Active | <owned projects or —> |
```

Add any day-one tools, workflows, or sub-agents to their respective registry tables.

---

### Step 7 — Update CLAUDE.md

Add a row to the Assistant Directory table in `CLAUDE.md`:
- Name, domain (one sentence), brain path

Match the table's existing columns exactly.

---

### Step 8 — Log the decision

Append to `decisions/log.md`:

```
## <Date> — New assistant created: <Name>
- Scope: <one sentence>
- Reason: <why this assistant was added>
- Brain file: .assistants/<name>/<name>.md
```

---

### Step 9 — Verify

Before declaring done:

- [ ] `.assistants/<name>/<name>.md` exists and opens with the explicit "On load, read these references" read-list (root-relative paths, not `@`-imports), matching `brain_template.md`
- [ ] Brain file has no placeholder text left unfilled
- [ ] `registry/index.md` has a row for the new assistant
- [ ] `CLAUDE.md` Assistant Directory is updated
- [ ] `decisions/log.md` has the creation entry
- [ ] Folder structure is in place (tools/, workflows/, sub-agents/, `.claude/templates/<name>/` if needed)
- [ ] The user has reviewed and confirmed the brain file

---

## Edge Cases

- **Vague scope** — ask for 2–3 concrete task examples before proceeding to Step 3
- **Scope overlaps existing assistant** — surface the overlap explicitly; ask whether to extend or separate
- **User changes answers mid-interview** — update the draft in Step 3 before writing any files
- **User wants to copy an existing assistant as a starting point** — use that assistant as a reference for structure only; the identity section must be written fresh
- **Assistant needs tools or workflows immediately** — build those after the brain file is done; don't block creation on them

---

## Self-Improvement

After each assistant creation run, assess:

- Were any interview questions unclear or did they produce unhelpful answers? Update Step 2.
- Did the brain template produce sections the user didn't want? Update the template.
- Did the verification checklist miss anything? Add it to Step 9.
- Was the overall process smooth? If the user had to correct anything, fix this workflow immediately.
