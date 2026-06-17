# weekly_briefing

Weekly planning briefing for the user. Covers the planning window: calendar commitments, deadlines from the task system, and a study/work plan, all summarized in one run. Pulls live from the user's connected calendar and task system.

## Planning window (Non-Negotiable)

The window is **the next 7 days starting today: today through today + 6 days, inclusive**, with day boundaries in the user's timezone (read it from `context/me.md` / `context/work.md`). Every step uses this exact interval — never "Monday through Sunday", never a calendar-week alignment, never a vaguer "upcoming week". If today is a Thursday, the window runs Thursday through the following Wednesday. Compute the seven dates once at the start of the run and reuse them everywhere.

## Trigger and Scope (Non-Negotiable)

Run the full scope whenever the user asks to set up, prep, plan, or "get my week ready", or to fix or redo the week's plan. These are this workflow, not an ad-hoc task.

Scope is fixed regardless of how the request is phrased. Wording that emphasizes one slice ("get my *calendar* ready", "what's due this week") never narrows scope. Every run produces all of: calendar commitments, deadlines, and the study/work plan, all over the planning window defined above.

### Empty-section and degraded-data policy (one rule, applied everywhere)

- **Always include every section.** An empty section is rendered with an explicit "nothing scheduled" (or the equivalent: "No commitments in this window", "No deadlines due in this window"). Never silently omit a section because it is empty or because the trigger phrasing sounded narrower.
- **The only section that gets skipped is the study/work plan, and only when there are zero tasks to schedule.** In that case, state it explicitly: render the STUDY / WORK PLAN heading with "No deadlines to plan around in this window" rather than dropping the heading.
- **Degraded data is not the same as empty.** If a connector fails (calendar or task system), that is a hard failure, not an empty section. Report the failure and halt per Critical Principles. Do not render a "nothing scheduled" section to paper over a failed fetch.

---

## Critical Principles

- **MCP failures:** If the calendar or task-system connector fails or returns unexpected results, debug the issue. Never guess at data or hallucinate content. If live data cannot be retrieved, report the failure and halt. Do not proceed with incomplete or assumed information.
- **Calendar is source of truth:** If a commitment is not on the calendar, assume it does not exist. Never infer recurring events.

---

## Inputs

None required. All context is fetched live during the run.

## Outputs

- A weekly briefing returned to the user: commitments, deadlines, and a study/work plan
- Optionally, the week blocked onto the user's calendar (study/work blocks) via the `calendar-blocker` sub-agent — only on explicit confirmation, per Lyren's draft-first rule

---

## Checklist

- [ ] Step 1 — Calendar: events across the planning window
- [ ] Step 2 — Task system: deadlines due within the planning window
- [ ] Step 3 — Generate the study/work plan over the window (week-planner sub-agent)
- [ ] Step 4 — Block the calendar for the window (optional, on confirmation)
- [ ] Step 5 — Compose briefing
- [ ] Step 6 — Self-improve

---

## Steps

### Step 1 — Calendar: events across the planning window

Using the planning window defined above (today through today + 6 days, inclusive, in the user's timezone), fetch the user's events for that exact range from their connected calendar via the Google Calendar MCP connector.

- Use the user's primary calendar. If the user has additional calendars listed in `context/work.md`, include the ones they marked relevant for planning.
- Build a per-day list of timed events.

**Relevance filter:**
- Include: all timed events the user has accepted or created — these are commitments by definition
- Exclude: events the user has declined (`responseStatus = "declined"`)
- Exclude: auto-imported noise with no actionable relevance

**Calendar is the only source of truth.** If a commitment is not present as a calendar event, assume it does not exist for scheduling purposes. Do not infer or assume recurring activities.

### Step 2 — Task system: deadlines due within the planning window

Query the user's task system for items due within the planning window (today through today + 6 days, inclusive). The task schema is defined by the user in `context/work.md` — read it first so you know which fields carry the title, priority/importance, status (done vs open), due date, and any time estimate.

- Pull candidates due within the window. Also surface large items (high importance, large time estimate, exams or major deliverables) due on the first day immediately after the window (today + 7) — their prep must happen during this window.
- If the task system's search returns more candidates than the due-date window (e.g. a semantic search that does not filter precisely), verify each candidate against its real fields before including it, and treat the result list as candidates only. When there are several candidates, spawn a sub-agent to batch-fetch and return a structured table — keeps the main context clean.
- Filter to: status = open AND due date within the window.

**Item classification:**
Use the user's `type` field first if their schema has one. If not set, infer from the title:
- Fixed-time item: anything that happens at a set time on its date (a meeting, a presentation delivered live, a timed exam). No work block on the day itself — prep on the days before.
- Flexible item: anything submitted or completed by a deadline (a draft, a report, a problem set). Can be worked on any day up to and including the due date.
- When ambiguous, lean toward flexible.

**Time estimate mapping** (read the current value from the user's task system):
- Large estimate (roughly 60+ min) → 90-minute block
- Medium estimate (roughly 30–60 min) → 45-minute block
- Small estimate (under 30 min) → 30-minute block
- Zero / "no prep" → include in the deadline list but exclude from work scheduling

**Due-date rules:**
- Fixed-time item: happens at its set time on that date — no work block that day; prep on days before
- Flexible item: due end of that date — can be worked on any day up to and including it
- Overdue fixed-time item: exclude entirely
- Overdue flexible item: include — the user may still complete it late

Output: a per-day deadline list with item name, importance, classification (fixed-time / flexible), time estimate, and due date.

### Step 3 — Generate the study/work plan over the window (week-planner sub-agent)

- Spawn `.assistants/lyren/sub-agents/week-planner.md`.
- Pass:
  - `events`: per-day timed calendar events as-is from the calendar (from Step 1)
  - `tasks`: per-day deadline list with item name, time estimate, due date, importance, classification (from Step 2)
  - `window_start_date`: ISO date of the first day of the window (today, in the user's timezone)
  - `window_end_date`: ISO date of the last day of the window (today + 6 days)
- The week-planner returns per-day recommended work blocks — what to work on, how long, and which window.
- For a single day's fine-grained 15-minute breakdown (when the user wants one day mapped out in detail), use the `generate-daily-schedule` skill instead — pass it that day's fixed blocks, the ranked task list, and the free windows.
- Save the output for Step 4 and Step 5.

### Step 4 — Block the calendar for the window (optional, on confirmation)

Lyren drafts before writing to the calendar. Present the proposed blocks first; only create events after the user confirms.

- Spawn `.assistants/lyren/sub-agents/calendar-blocker.md`.
- Pass `blocks` containing the window's study/work blocks from Step 3, each with title, start, end, and an optional `type` for color coding.
- The sub-agent deduplicates against existing calendar events, creates the new ones, and returns created/skipped lists.

### Step 5 — Compose briefing

Keep the briefing concise and easy to scan. Apply the empty-section policy from Trigger and Scope: include every section, mark empty ones explicitly, and skip only the study/work plan when there are zero tasks (saying so). Label days by weekday + date as they fall in the window; the window starts on today's weekday, not necessarily Monday.

```
Window: [first day weekday + date] – [last day weekday + date]  (next 7 days)

AT A GLANCE
[A few bullets: key deadlines and major commitments in this window. If none: "Nothing scheduled this window."]

DEADLINES
[weekday] [date]
[Item — importance, time estimate]
...
[Continue for each day in the window that has deadlines, in date order. Fixed-time items: add "(fixed-time)". Overdue flexible items: add "OVERDUE".]
[If no deadlines anywhere in the window: "No deadlines due in this window."]

STUDY / WORK PLAN
[weekday] — [What to work on, time block, window e.g. "Report draft — 90 min, 4:30–6:00 PM"]
...
[Continue for each day with planned work. If there were zero tasks to plan around: "No deadlines to plan around in this window."]

CALENDAR
[If blocked: "N blocks created (M skipped — already existed)". If draft only: "Proposed N blocks — confirm to add them." If no blocks proposed: "Nothing to schedule."]
```

### Step 6 — Self-improve

After every run, assess:

- Did the relevance filter in Step 1 include or exclude anything wrong? Update the filter.
- Did the plan from week-planner feel unrealistic or cramped based on the user's feedback? Note it in the sub-agent's self-improvement section.
- Did calendar blocks fail to create or duplicate? Update `calendar-blocker.md`.
- Did the user give any feedback on format, content, or ordering? Update this workflow immediately.

Minor updates: make silently. Changes that meaningfully affect what the user sees: flag to the user before updating.

---

## Edge cases

These all resolve through the single empty-section and degraded-data policy in Trigger and Scope.

- Task system returns zero items: render DEADLINES as "No deadlines due in this window" and render STUDY / WORK PLAN as "No deadlines to plan around in this window". This is the one case where the work plan is skipped — state it, do not drop the heading.
- Calendar returns zero events: render the relevant sections as "Nothing scheduled this window" / "No commitments in this window". This is empty data, not failure — still compose the briefing.
- Calendar or task-system read failure: degraded data, not empty. Report the failure and halt — do not compose a briefing on assumed data, and do not paper over it with a "nothing scheduled" line.
- Week-planner sub-agent fails: compose the briefing with every other section intact; in STUDY / WORK PLAN, state the planner failed rather than dropping the heading.
