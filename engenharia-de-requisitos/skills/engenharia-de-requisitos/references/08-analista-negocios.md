# 08 — Business Analyst

> The layer above requirements engineering. Combines BABOK Guide v3 (IIBA — International Institute of Business Analysis) with Brazilian-market practice. **Requirements engineering answers "which requirements should the system have?"; business analysis answers "are we solving the right problem?".** The two intersect, but the BA looks at the entire domain, not only the software.

---

## 1. Difference between Requirements Engineer and Business Analyst

| Aspect | Requirements Eng. | Business Analyst |
|---|---|---|
| Focus | The **software system** to be built | The **process / business** to be improved |
| Scope | FR + NFR + technical constraints | Processes, people, policies, systems (including manual ones) |
| Output | Backlog, RTM, specification | Feasibility analysis, business cases, AS-IS / TO-BE mapping |
| Key question | What system to build? | What problem to solve? Is it worth it? |
| In small teams | Same person | Same person |
| In large teams | Technical specialist close to the dev | Business specialist close to the stakeholder |

**In small projects, dev + PO accumulate the BA role.** In large projects, there is a dedicated analyst.

---

## 2. BABOK Guide v3 — the 6 knowledge areas

The **Business Analysis Body of Knowledge** (published by IIBA, international standard) organizes the profession into 6 areas:

| Area | What it does |
|---|---|
| **Business analysis planning and monitoring** | Defines how, by whom, and when the analysis will be done |
| **Elicitation and collaboration** | Collects information from stakeholders (crosses with [02-elicitacao.md](02-elicitacao.md)) |
| **Requirements lifecycle management** | Track, maintain, prioritize, approve requirements (crosses with [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)) |
| **Strategy analysis** | Identify problems/opportunities; assess current capabilities; define change strategy |
| **Requirements analysis and solution design** | Model, specify, validate requirements (crosses with [03](03-especificacao.md), [04](04-bdd-criterios-aceitacao.md), [06](06-validacao.md)) |
| **Solution evaluation** | After deployment, measure whether the solution solves the business problem |

**BABOK insight**: requirements analysis is **only 1 of the 6 areas**. The other 5 contextualize — without them, requirements are technically good but solve the wrong problem.

---

## 3. Central flow — AS-IS → TO-BE → GAP

The most widespread consulting practice. Not nominally in BABOK, but crosses almost all areas.

### 3.1 AS-IS (current state)

**Map of the current process** — how it is today, with its pains, bottlenecks, rework.

Techniques:

- **BPMN** (Business Process Model and Notation) — formal process diagram
- **Value-stream maps** (lean) — highlights wait time vs. value time
- **Service Blueprint** — adds a user-experience layer
- Interviews + observation (ethnography, see [02-elicitacao.md](02-elicitacao.md))
- Document analysis (SOPs/*"POPs"*, regulations)

**Output**: AS-IS diagram + list of quantified pains.

Example (fictional case of a university *"RU"* — *"Restaurante Universitário"*, LECTURE 06):

```
AS-IS — RU user-attendance process

[User arrives] → [Shows paper ID] → [Attendant checks list] →
[Attendant records manually in notebook] → [User passes manual turnstile] →
[Receives meal] → [In case of complaint, registers in physical log]

PAINS:
- Long queues (manual registration takes 30–45s per person)
- Errors in registration (physical notebook, no validation)
- No menu visibility (user arrives and discovers they cannot eat due to a dietary restriction)
- Complaints in the physical log are rarely addressed
```

### 3.2 TO-BE (desired state)

**How we want it to be** — drawing of the process after the solution.

**Care**: TO-BE is not "AS-IS + system". It is **a redesigned process** that may involve:

- Eliminating unnecessary steps
- Reorganizing responsibilities
- Automating where it makes sense
- Keeping manual where that makes more sense

*"RU"* example:

```
TO-BE — RU user-attendance process

[User checks the menu in the app the day before] →
[User picks the less-crowded time shown in the app] →
[Shows QR code on phone or magnetic card] →
[Electronic turnstile validates + records automatically] →
[Receives meal] →
[App allows rating the meal + filing a complaint]
```

### 3.3 GAP analysis

**Difference AS-IS → TO-BE** = improvement opportunities.

Each gap becomes a **requirement** (of the system OR of the process):

| Gap | Solution type | Requirement |
|---|---|---|
| Menu visibility | System | FR: app shows daily/weekly menu |
| Dietary restriction not identified | System | FR: app filters options by restriction registered in the profile |
| Long queues | System | FR: app shows peak times in real time |
| Complaint not addressed | Process + System | FR: system notifies coordination + process: 48h response SLA |
| Manual-registration error | System | FR: electronic turnstile + NFR: ≥99.5% recording accuracy |

**Not every gap becomes software.** Some become process change, training, or policy.

---

## 4. Canonical analysis models (and when to use them)

| Model | Use |
|---|---|
| **Business Model Canvas** (Osterwalder) | Strategic business view (value proposition, segments, channels, revenue) |
| **Value Proposition Canvas** | Detail the fit between product and customer pain |
| **SWOT** | Strategic analysis (Strengths, Weaknesses, Opportunities, Threats) |
| **PESTEL** | Macro context (Political, Economic, Social, Technological, Environmental, Legal) |
| **Ishikawa diagram (fishbone)** | Root cause of a business problem |
| **5 Whys** | Drill down to the real cause (simple version of Ishikawa) |
| **MoSCoW** | Prioritization (Must, Should, Could, Won't) |
| **RICE scoring** | Quantitative prioritization (Reach × Impact × Confidence ÷ Effort) |
| **Kano model** | Categorize features (basic, performance, delight) |
| **Stakeholder map** | Identify and classify stakeholders by influence × interest |

### 4.1 MoSCoW in detail

| Category | Meaning | Criterion |
|---|---|---|
| **M**ust have | Mandatory | The release does not ship without it |
| **S**hould have | Should have | Important but can be deferred 1–2 sprints without killing the release |
| **C**ould have | Could have | Nice to have; the first to cut if time runs short |
| **W**on't have (this time) | Will not have now | Conscious decision not to do this in this cycle |

**Common mistake**: 80% of features marked as "Must". Sign that no real prioritization occurred.

### 4.2 RICE scoring

```
Score = (Reach × Impact × Confidence) / Effort
```

| Factor | How to measure |
|---|---|
| **Reach** | How many users affected / quarter |
| **Impact** | 0.25 (minimal) / 0.5 / 1 / 2 / 3 (massive) |
| **Confidence** | % certainty (100%, 80%, 50%) |
| **Effort** | Person-months |

**Example**:

- Feature A: 1000 users × 1 (medium impact) × 0.8 (high confidence) / 2 PM = **400**
- Feature B: 100 users × 3 (massive impact) × 0.5 (uncertain) / 1 PM = **150**

Feature A has the higher score → ships first.

---

## 5. Typical BA documents (BABOK)

### 5.1 Business Requirements Document (BRD)

**Focus**: what the business needs (not how the system will do it).

Typical structure:

- Executive summary
- Context and opportunity
- Business objectives + success metrics (KPIs)
- Stakeholders
- Constraints (budget, schedule, regulatory)
- Assumptions
- Risks
- AS-IS analysis
- High-level TO-BE vision
- Project acceptance criteria

### 5.2 Functional Requirements Specification (FRS)

**Focus**: what the system must do. Close to Sommerville's "requirements document".

### 5.3 Use Case Document

Each use case documented with:

- Actors
- Pre-condition
- Post-condition
- Main flow (numbered)
- Alternative flows
- Exceptions

(In an agile team, the use case is replaced by User Story + BDD.)

### 5.4 Process Map (BPMN)

Formal notation: pools (organizations), lanes (roles), activities (rectangles), gateways (diamonds), events (circles).

### 5.5 Stakeholder Register

Table with columns:

- Name / Role
- Interests
- Power level
- Influence level
- Engagement strategy

---

## 6. Stakeholder Map (power × interest)

2×2 matrix to prioritize engagement:

```
              HIGH INTEREST              LOW INTEREST
            ┌──────────────────────┬──────────────────────┐
HIGH POWER  │  MANAGE CLOSELY      │  KEEP SATISFIED      │
            │                      │                      │
            │  CEO, regulator,     │  Distant directorate │
            │  sponsor             │  from the day-to-day │
            ├──────────────────────┼──────────────────────┤
LOW POWER   │  KEEP INFORMED       │  MONITOR             │
            │                      │                      │
            │  End users,          │  Employees without   │
            │  technical community │  direct ties         │
            └──────────────────────┴──────────────────────┘
```

Different strategy per quadrant. **Manage closely** = participate in every decision. **Monitor** = only inform strictly when necessary.

---

## 7. Connection with the agile method

BABOK is not incompatible with Scrum/SAFe/LeSS. On the contrary:

| BABOK activity | Agile equivalent |
|---|---|
| Strategy analysis | Discovery + Product Vision |
| Elicitation | Backlog refinement + Three Amigos |
| Requirements analysis | Story writing + sizing |
| Solution design | Sprint planning + architecture |
| Lifecycle management | Sprint review + retrospective |
| Solution evaluation | Post-release metrics + experimentation |

**In agile teams, the BA can act as Product Owner or as a facilitator between stakeholders and the technical PO.**

---

## 8. Canonical business-analysis bibliography

- **IIBA.** *BABOK Guide* v3 — international standard reference
- **Wiegers & Beatty.** *Software Requirements* 3rd ed. — practical base
- **Osterwalder.** *Business Model Generation* — Canvas
- **Christensen.** *The Innovator's Dilemma* / *Jobs to be Done* — strategic perspective
- **Patton.** *User Story Mapping* — bridge between BA and user stories
- **Hammer & Champy.** *Reengineering the Corporation* — for radical-transformation projects (BPR)

---

## 9. When this layer is needed (signals)

You need formal business analysis (not only RE) when:

- The project involves **multiple systems** (not a single app)
- There is **organizational change** (not only software)
- **Stakeholders are heterogeneous** (sales, legal, ops, IT)
- The **business problem is not clear** (only the desire to "have an app")
- **Regulation changes the business** (*"LGPD"*, *"BACEN"*, *"ANS"*)
- High investment (>*"R$"* 500k) — committee wants a **business case** with ROI
- The team ships features without moving **business KPIs** (sign that requirements are technically right but strategically wrong)

In simple projects (SaaS MVP, isolated feature), skipping this layer is OK — but keep in mind the **risk of doing the wrong thing well**.

---

## 10. Connection with the next references

- **Ethics in business decisions (especially when something affects the less favoured)**: [09-etica-sbc.md](09-etica-sbc.md)
