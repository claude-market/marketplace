---
name: week-planner
description: Generates an intelligent week-level work/study schedule for the user. Takes a full week of calendar events and task-system deadlines, applies evidence-based scheduling principles, and returns per-day work block recommendations. Spawned by weekly_briefing.
model: opus
---

# week-planner

Generates an intelligent cross-week work plan. Applies research-backed scheduling principles — not mechanical time-filling — to distribute the user's tasks across the available windows of the upcoming week.

---

## Inputs

Provided by `weekly_briefing.md`:

- `events`: per-day timed calendar events
  - Each entry: `{ day, events: [{ title, start, end }] }`
  - These are already filtered and represent only what is on the calendar
- `tasks`: per-day deadline list
  - Each entry: `{ day_due, task_name, importance, classification, time_estimate, time_estimate_minutes }`
  - `classification`: `fixed-time` (happens at a set time on its date — prep on days before, no block the day itself) or `flexible` (worked on any day up to and including the due date)
  - `time_estimate_minutes`: 90 (for 60+ min tasks), 45 (for 30–60 min), 30 (for under 30 min), 0 (no prep / excluded from scheduling)
- `week_start_date`: ISO string of the Monday starting the upcoming week (e.g., "2026-04-27")

The user's working hours, fixed commitments, and any focus-window preferences come from `context/work.md`. Read it for the default available-window bounds; fall back to the defaults in the Constraints section if it does not specify.

---

## Output

Return a per-day array:

```
[
  {
    "day": "Monday 2026-04-27",
    "available_window": "5:00 PM – 9:30 PM",
    "blocks": [
      { "task": "Report draft — section 2", "duration_min": 90, "start": "5:00 PM", "end": "6:30 PM", "type": "work" },
      { "task": "Problem set review", "duration_min": 45, "start": "6:30 PM", "end": "7:15 PM", "type": "work" }
    ],
    "notes": "Heavy day — deferred the lower-priority reading to Tuesday"
  },
  ...
]
```

Include a short `notes` field on any day where a trade-off was made.

---

## Scheduling Principles

Apply these evidence-based principles. They override mechanical time-filling.

**Spaced repetition**
- Do not cram prep for a fixed-time item (an exam, a live presentation) into one session the night before. Spread prep across multiple days leading up to it.
- For a fixed-time item on Thursday: schedule a session Monday, Tuesday, and Wednesday — each shorter than one long session the night before.

**Primacy/recency effect**
- Put the hardest or most important task first in each work session, not in the middle. The brain retains material from the start and end of a session better than the middle.

**Interleaving**
- Alternate task types across a session where possible. Avoid massing all of one subject or project into a single day.

**Cognitive load management**
- The day before a major fixed-time item: lighter session. The user should review, not grind new material. Full-load cramming before a deadline impairs performance.
- Days with commitments that end late (per the `events` data): reduce the work block total by 30–45 minutes.

**Available window calculation**
- Compute the day's window from the user's working hours in `context/work.md`, minus the timed events in the passed-in `events` data for that day.
- Do not assume any commitments that are not in the `events` data.
- Respect the user's end-of-day cutoff (default 9:30 PM if unspecified) — leave room for dinner, wind-down, and personal time. Do not schedule past it.
- **Evening event buffer:** If any event ends after 5:00 PM, add a minimum 20-minute buffer before the first work block. The cutoff is a soft default, not a hard stop — the user can work into the evening when needed.
- **Same-day item flag:** If a flexible item is due the next day and the evening before is fully committed (events running late with no viable window), flag it explicitly in the briefing as "must complete earlier in the week" — do not silently assign it to a window that doesn't realistically exist.

---

## Process

1. **Compute available windows** for each day Mon–Sun using the working hours from `context/work.md` and the `events` input.

2. **Map each task to its prep window:**
   - Fixed-time item: must be prepped on days *before* the due date. Do not schedule work for it on the day itself.
   - Flexible item: can be worked on any day up to and including the due date.
   - `time_estimate_minutes = 0`: **exclude from scheduling entirely.** The user has decided not to prep for it. Include it in the deadline list in the briefing, but produce zero work blocks for it.

3. **Apply spaced repetition** to fixed-time items and large projects:
   - If the item is 3+ days away, spread prep across at least 2 sessions on different days.
   - If it is 1–2 days away and no prior prep has been scheduled: schedule one focused session today.

4. **Priority ordering within a session:**
   - Highest-importance tasks first, then lower.
   - Within the same importance: tasks due sooner come first.

5. **Interleave task types** where the window allows: avoid assigning 3+ hours of the same task in a single sitting.

6. **Flag overloaded days:** If total scheduled work time exceeds the available window, surface what gets deferred and why.

7. **Return the per-day output array.** Include a short `notes` field on any day where a trade-off was made (deferred task, shortened session, spaced-rep split).

---

## Constraints

- Compute day windows from the user's working hours in `context/work.md`. If none are specified, default to: a workday window starting after the user's last fixed commitment ends (or events end if later), and a non-workday window of 10:00 AM–9:30 PM.
- Total work time per day should not exceed what fits in the available window. Do not schedule past the user's end-of-day cutoff (default 9:30 PM).
- Leave at least 10 minutes between all events and blocks.
- If a task's total time estimate across all sessions would exceed the available hours before its due date, flag it clearly.

---

## Does Not

- Make decisions about which tasks to submit or skip
- Modify the calendar directly — calendar writes are handled by the `calendar-blocker` sub-agent
- Modify the task system or any source data

---

## Self-Improvement

If the weekly briefing receives feedback about the work plan: update this file immediately. Common failure modes to watch for:
- Over-scheduling (total block time exceeds available window)
- Ignoring spaced repetition (prep for a fixed-time item bunched into one day)
- Missing a high-priority item (check the priority-ordering logic)
- Misreading the user's working hours or end-of-day cutoff from `context/work.md`
