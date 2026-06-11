# 05 — Estimation: Story Points + Planning Poker

> How to size User Stories collaboratively. Combines LECTURE 09.2 *"IFPB"* + Cohn (*User Stories Applied*) + James Grenning (original 2002 Planning Poker). Story Points are an **abstract measure of complexity**, not hours. Planning Poker is the **consensus method** to arrive at those points.

---

## 1. Why NOT to estimate in hours

Estimating in hours fails for 4 reasons:

1. **Skill varies** — 1h of João ≠ 1h of Maria
2. **Focus varies** — interruptions and meetings consume hours, not complexity
3. **Anchoring** — the manager reads "8h" as a deadline ("tomorrow at 5pm"), not as an estimate
4. **Comparison is hard** — you know whether feature X is "more complex" than Y; you rarely know how many exact hours X takes

**Story Points solve this**: you do not estimate time, you estimate **RELATIVE complexity**. An item of 5 points is ~5× more complex than one of 1 point. How that converts into hours is the **velocity** problem (see §7).

---

## 2. Story Points — definition (LECTURE 09.2)

> Story points are **abstract** numbers that give an **idea of proportionality** between requirements (stories). The technique consists of counting the **complexity of the Backlog**.

**Visual analogy** (course slide):

```
┌─────────────────────┐ ← Living: 13pts
│                     │
│ Bedroom 1 │ Bedroom 2│   Bedroom1: 8pts
│  8pts     │   5pts   │   Bedroom2: 5pts
│           │          │   Kitchen: 5pts
├───────────┼──────────┤   Hall: 3pts
│  M.Bedroom│  Kitchen │   Bath: 3pts
│   8pts    │   5pts   │   M.Bath: 2pts
│           │          │   Closet: 1pt
│ ┌───┐ Bath│          │
│ │1pt│3pts │          │
└─┴───┴─────┴──────────┘
```

It does not matter how many m² the Living has in absolute terms. What matters is that the Living is **~3× more complex** than the Hall (13 vs. 3) and ~13× more complex than the Closet (13 vs. 1).

---

## 3. Planning Poker — origin and purpose

- **2002 — James Grenning** proposes the technique in the article *"Planning Poker"*
- **2005 — Mike Cohn** popularizes it in *Agile Estimating and Planning*

**Why poker** (and not consensus through open discussion):

- Avoids **anchoring** (the first dominant voice influences the others)
- Forces each member to **think before speaking**
- Reveals **large divergences** (signal that understanding of the story is missing)

---

## 4. The deck (modified Fibonacci scale)

```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│  0  │ 1/2 │  1  │  2  │  3  │  5  │  8  │ 13  │ 21  │ 34  │ 55  │ 89  │ + ? + 100
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

**Why Fibonacci**: growing gaps reflect growing uncertainty. The difference between 1 and 2 is precise; between 13 and 21 is vague, as it should be.

**Special meanings**:

| Card | Meaning |
|---|---|
| `0` | Trivial (label change, color tweak) — **NOT used in the 1st round** |
| `1/2` | Almost trivial — **NOT used in the 1st round** |
| `1` | The simplest item possible in the current backlog (guide story) |
| `2..89` | Proportional to the guide story |
| `?` | **I did not understand** — I need to talk to the PO. I block the planning |
| `100` | **This is a disguised epic** — slice into smaller US before estimating |

### 4.1 Why 0 and 1/2 are kept out of the 1st round

From LECTURE 09.2: *"Not now, but in the future, because practice shows there will always be items along development simpler than those estimated at 1 point, such as: fixing a layout bug, swapping a label, or even swapping a UI button."*

You **reserve** the 0 and 1/2 for future items that will be simpler than the current smallest one. If you spent the 1 on a trivial item now, you would later have no room for something even smaller.

---

## 5. Procedure (LECTURE 09.2, 4 steps)

### 5.1 Step 1 — Joint reading of the backlog

The team reads **all stories** of the backlog (the product's or just the sprint's) to gain an overview of what will be estimated.

**Typical time**: 15–30min for 20–30 stories.

### 5.2 Step 2 — Choice of the guide story

> Of the Backlog stories, the team selects the one it judges to be the **simplest of all**, that is, the one demanding the **least effort** to implement. For this story, the estimate will be **1 point**.

**Pro tip** (LECTURE 09.2):
> Look for an item the team has already developed in a past sprint (if any) and use it as a comparison reference. With something already accomplished, estimates will be more accurate.

### 5.3 Step 3 — Score the others in proportion

> Following the order presented in the Backlog, **each Story is re-read and scored**, taking the guide story as reference.
>
> A story demanding more effort than the guide story **will not necessarily be scored with the next value** on the points scale. The effort must be scored following a **proportion** to the effort defined for the guide story.

**Concrete example**:

- Guide story (1pt): "Add 'nickname' field to the athlete form (optional string)"
- Story A: "Add federation-selection combo with filter by confederation" → this one is **8×** more complex (cascade data, cross-validation, cache integration). Score = **8**, not 2.

The Fibonacci scale has gaps (1, 2, 3, 5, 8, 13…) **on purpose**. You do not slide through values; you compare magnitude.

### 5.4 Step 4 — Vote + discussion + revote

For each story:

1. The facilitator reads the story out loud
2. Each member chooses their card **in silence**
3. Everyone flips the card at the same time
4. If consensus → record the score
5. If divergence → **lowest and highest values justify**
6. Re-discuss → vote again
7. Repeat until consensus, or record the disagreement

### 5.5 What to do with `?` and `100`

- **`?` appeared** → stop the story discussion. Whoever voted `?` says what doubt they have. The PO clarifies. Re-vote.
- **`100` appeared** → story is an epic. Out of the planning. Goes back to backlog refinement.

---

## 6. Who participates in Planning Poker

| Role | Votes? | Why |
|---|---|---|
| Dev | ✅ | Implements |
| QA / Tester | ✅ | Tests, knows risk |
| Designer | ✅ if the story has UI | Designs, knows UX complexity |
| PO / Product Manager | ❌ | Defines the "what", does not estimate the "how much" |
| Scrum Master / Facilitator | ❌ | Only facilitates, does not vote |
| Manager / External stakeholder | ❌ | Would create anchoring by authority |

**Golden rule**: whoever **WILL NOT implement does not vote**.

---

## 7. Velocity — where Story Points become time

**Velocity** = sum of points delivered per sprint (average of the last 3–5 sprints).

Example:

- Sprint 1: delivered 23pts
- Sprint 2: delivered 28pts
- Sprint 3: delivered 25pts
- **Average velocity = 25pts/sprint**

**For the next sprint**: the team chooses ~25pts of the prioritized backlog. Not 40 (overcommit), not 10 (under-use).

**Conversion to deadline**:

- Total backlog = 150pts
- Velocity = 25pts/sprint
- Remaining sprints = 150 / 25 = **6 sprints**

This is an **estimate, not a promise**. Recalculate every sprint.

### 7.1 When velocity DOES NOT work

- **First 3 sprints** — team still calibrating. Use range (10–30pts), not average
- **Team changes** — velocity resets (new member learning, member leaving)
- **Stack changes** — framework migration destroys the baseline
- **Type of work changes** — a sprint of refactor only is not comparable to a feature sprint

---

## 8. What NOT to do with Story Points

### 8.1 Do not explicitly convert points into hours

```
❌ "1pt = 4h, 2pt = 8h, 3pt = 12h"
   → reintroduces the problem story points were meant to solve
```

Velocity is the only valid conversion — and it is **statistical** (average), not **deterministic**.

### 8.2 Do not compare velocity across teams

Team A delivers 30pts/sprint, Team B delivers 50pts/sprint. **This means nothing.** Points are relative to each team's guide story. Comparing is like comparing reais to euros without an exchange rate — different numbers, incomparable value.

### 8.3 Do not use points for performance review

A dev under pressure to "score more points" inflates estimates. Breaks the whole system. **Points serve planning, not appraisal.**

### 8.4 Do not re-estimate mid-sprint

Story estimated as 5 turning out to be 13. **Do not change the number.** Result: sprint velocity drops → next sprint absorbs less. The system self-adjusts.

### 8.5 Do not estimate without ACs + BDD ready

How do you estimate the complexity of "doing login" if you do not know whether it is email/password, OAuth, 2FA, SSO? **Story without criterion is story without estimate.** Reminder: ACs live in the **parent Feature** (see [04-bdd-criterios-aceitacao.md §2.1](04-bdd-criterios-aceitacao.md)); the US inherits via traceability and adds the **BDD** in its own "Description" field. If the parent Feature has no ACs or the US has no BDD yet, go back to refinement.

---

## 9. Smells of poorly run Planning Poker

| Symptom | Likely cause | Action |
|---|---|---|
| Everyone always votes the same number | Anchoring (someone commented first) or groupthink | Remind: silence before the flip |
| Chronic divergence on every story | Team does not share domain view | Invest in onboarding + prior refinement |
| Many `?` | Backlog not refined | Go back to refinement; schedule Three Amigos |
| Many `100` | Stories too large | Slice before the planning |
| Team always estimates low | Optimism + fear of "being slow" | Compare with history; show velocity |
| Team always estimates high | Defence against pressure or real risk | Investigate root cause: is it an estimate or a risk? |
| Velocity fluctuates >30% sprint-to-sprint | Inconsistent estimation or external events | Stabilize team; introduce technical buffer |

---

## 10. Useful variations

### 10.1 T-shirt sizing (early stage, raw backlog)

Instead of numbers, use **XS, S, M, L, XL**. Useful for a **whole epic** when there is no detail yet.

```
Epic "Push notifications" — T-shirt: XL
Epic "Theme switcher dark mode" — T-shirt: M
Epic "Add avatar in profile" — T-shirt: S
```

Then convert to Fibonacci when slicing into features/US.

### 10.2 Bucket System (50+ items quickly)

For a large backlog, skips traditional Poker:

1. Place all stories on one side
2. Choose 1 representative of each "typical complexity" (1, 3, 8, 21)
3. The team **moves stories** into the bucket they fit
4. Discuss only the boundaries (between 1 and 3, between 8 and 13)

**Time**: 50 stories in ~1h. Sacrifices precision for speed.

### 10.3 Magic Estimation (fully silent)

Variant: team estimates 30+ stories **without speaking**, moving cards along a complexity line. Discusses only at the end.

---

## 11. Post-estimation: Definition of Ready

Before a US enters the sprint, it must have:

- [ ] Short descriptive title
- [ ] BDD in the description (Given/When/Then)
- [ ] ACs associated via relations
- [ ] Estimated story points
- [ ] INVEST validated
- [ ] Clear Definition of Done
- [ ] No blocking external dependencies

Missing any → **DOES NOT enter the sprint.** Goes to refinement.

---

## 12. Connection with the next references

- **Validation (Falbo 7 dimensions + Sommerville 5 checks)**: [06-validacao.md](06-validacao.md)
- **Change management when estimates are far off**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
