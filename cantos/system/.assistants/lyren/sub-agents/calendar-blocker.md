---
name: calendar-blocker
description: Handles all Google Calendar write operations for a given set of event blocks. Use when any workflow needs to create Calendar events with deduplication — checks for existing events before creating, assigns correct colors by event type, and returns a summary of created vs skipped events.
model: haiku
disallowedTools: Read, Write, Edit, Bash, Glob, Grep
---

# calendar-blocker

Handles all Google Calendar write operations for a given set of blocks. Reusable by any workflow that needs to create Calendar events without duplicating existing ones.

---

## Inputs

Provided by the calling workflow:

- `blocks`: list of events to create, each with:
  - `title`: event name
  - `start`: ISO 8601 datetime with timezone offset (e.g., `2026-04-07T08:00:00+00:00`)
  - `end`: ISO 8601 datetime with timezone offset
  - `description` (optional): any notes to add to the event
  - `type` (optional): event category used for color assignment (see color scheme below)
- `unscheduled_commitments` (optional): list of commitments found outside Calendar (e.g., from Gmail) that have a clear time but no Calendar event yet. Same fields as above.

---

## Procedure

### Step 1 — Fetch existing Calendar events across the full proposed range

Blocks can span any number of days (a weekly plan creates events Monday through Sunday), so fetching only today's events would miss existing future events and let reruns duplicate them. Instead:

1. Combine `blocks` and `unscheduled_commitments` into one set of proposed events.
2. Find the earliest `start` and the latest `end` across that whole set.
3. Use the Google Calendar MCP list-events tool ONCE for that full range — from the start of the earliest proposed day to the end of the latest proposed day (day boundaries in the user's timezone, per `context/me.md` / `context/work.md`).
4. Build a lookup of existing events by title and start time covering the entire range.

If the proposed set is empty, there is nothing to fetch or create — return empty Created/Skipped lists.

### Step 2 — Deduplicate every proposed event before any write

Run this check against the full-range lookup from Step 1 for ALL proposed events — both `blocks` and `unscheduled_commitments` — before creating anything. Deduplicating against today-only data is the bug this step exists to prevent.

For each proposed event:

- If an event already exists with the same title AND overlapping time slot: skip it, note as "skipped (already exists)"
- If no match: mark it for creation

### Color scheme

Assign `colorId` based on event type. If a block has an explicit `type` field, use it. Otherwise infer from title keywords. The mapping below is a sensible default — the user can define their own category-to-color scheme in `context/work.md`, and this table should be updated to match.

| Type | colorId | Google name |
|------|---------|-------------|
| meeting / appointment | 10 | Basil (dark green) |
| commitment / event | 9 | Blueberry (dark blue) |
| personal | 2 | Sage (green) |
| urgent / deadline | 11 | Tomato (red) |
| break / focus block (default) | — | No color (omit colorId) |

Title keyword inference (if `type` not provided):
- Contains "meeting", "call", "appointment", "1:1" → meeting (10)
- Contains "deadline", "due", "urgent" → urgent (11)
- Contains "break", "lunch", "focus", "wind down" → no color
- All others → no color (or the user's configured default)

### Step 3 — Create new blocks

This agent runs only after the calling workflow has confirmed the plan with the user (Lyren never writes to Calendar unprompted). For each block marked for creation: call the Google Calendar MCP create-event tool with title, start, end, description if provided, a 5-minute popup reminder, and the colorId determined from the color scheme above (omit colorId entirely for break/focus/no-color events).

### Step 4 — Handle unscheduled commitments

`unscheduled_commitments` were already folded into the proposed set and deduplicated in Step 2, so they are not re-checked here. For each one marked for creation in Step 2:

- Create the event (same create-event call as Step 3)
- Note any created events separately in the return so the workflow can flag them to the user

### Step 5 — Return summary

Return two lists:

- Created: titles and times of events successfully added
- Skipped: titles and times of events that already existed

---

## Error handling

- If the create-event call fails for a specific block: log the failure with the block title and continue with remaining blocks; do not abort the entire run
- If the Calendar cannot be read in Step 1: report the failure to the calling workflow; do not attempt to create any events

---

## Self-improvement

When any error occurs or the user gives feedback about a duplicate, missed event, or incorrect time: update this file immediately to reflect the correct behavior.
