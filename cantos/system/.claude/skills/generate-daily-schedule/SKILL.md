---
name: generate-daily-schedule
description: Use when turning a day's structured inputs — fixed commitments, tasks, and free windows — into a concrete 15-minute schedule. Domain-agnostic; the caller provides all context.
---

# Generate Daily Schedule

This skill encodes how to reason through a day's inputs and produce a tight, realistic 15-minute schedule. It is domain-agnostic. The caller provides all context — this skill just determines how to arrange it well.

---

## Inputs (provided by the caller)

- Fixed blocks: list of commitments with exact start and end times (meetings, appointments, standing commitments)
- Ranked task list: tasks in priority order, each with an estimated time requirement if available
- Free windows: time ranges with no fixed commitment
- Constraints: anything that limits scheduling (e.g., mental fatigue patterns, hard stops, travel time)
- Day end time: when the schedule should close (default: 10:00 PM unless caller specifies otherwise)

---

## Reasoning Pattern

### 1. Map the fixed skeleton

Plot every fixed block first. These are non-negotiable. Include travel or transition time between blocks if the caller provides it (default: 10 minutes between distinct locations, 5 minutes same-location).

### 2. Identify free windows

What's left after fixed blocks are placed. A free window under 20 minutes is generally not worth scheduling a task into — treat it as buffer or transition.

### 3. Match tasks to windows by cognitive load

Tasks have cognitive weight. Match them to windows accordingly:

- High-priority, high-difficulty tasks go in the largest free window when cognitive energy is highest (typically morning or early afternoon, not right after a demanding fixed block)
- Medium tasks go in mid-sized windows
- Low-effort tasks (reviewing notes, admin, light reading) go in short windows or last slots of the day
- Never stack two high-difficulty tasks back to back without a break between them

### 4. Place breaks

- A break after every 90 minutes of sustained work (fixed block or task block)
- Minimum break length: 10 minutes
- After a long block of fixed commitments ends, a 15–30 minute decompression window before starting focused work is realistic
- Don't compress breaks to fit more tasks — an over-scheduled day is worse than a realistic one

### 5. Handle unfinished tasks

If the ranked task list can't fit into the available free windows in one day, note which tasks are deferred. Don't squeeze everything in. A realistic schedule that gets completed beats an optimistic one that doesn't.

### 6. Format output

Produce a 15-minute breakdown. Every slot from the day's start to day end should be accounted for — either a named block/task or explicitly marked as Break / Buffer / Free.

Example format:

```
7:30 AM  Morning prep / breakfast
8:00 AM  [Fixed block 1 name]
...
3:00 PM  Fixed blocks end — decompression (walk, snack)
3:30 PM  [Task 1 name] — focus block
5:00 PM  Break (15 min)
5:15 PM  [Task 2 name]
6:30 PM  Dinner
7:30 PM  [Task 3 name or light review]
9:00 PM  Wind down
10:00 PM End
```

---

## Quality checks before returning the schedule

- No task block exceeds 90 minutes without a break following it
- High-priority tasks are scheduled earlier in the focus session, not last
- The day end time is respected
- Fixed blocks are unchanged from the inputs
- Deferred tasks are explicitly listed if they didn't fit

---

## Self-Improvement

When the user gives feedback on a generated schedule (over-scheduled, wrong task priority, missed transition time), identify which reasoning step produced the issue. Update the relevant step here immediately.

Do not store scheduling logic in individual workflows — update this skill.