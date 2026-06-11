# 07 — Change Management + Traceability

> How to keep coherence as requirements change (and they ALWAYS change). Combines Sommerville 4.6 (requirements change) + traceability best practices. Without a formal change process, specification and implementation drift apart in months.

---

## 1. Why change is inevitable

Sommerville (4.6):

> The requirements of large software systems **are always changing**. One reason for the frequent changes is that these systems are developed to address **"wicked problems"** — problems that cannot be completely defined.

**3 main sources of change** (Sommerville):

1. **The environment changes**: new hardware, integration with other systems, new laws (*"LGPD"*, *"BACEN"*), business priorities shift
2. **Whoever pays ≠ whoever uses**: clients impose requirements based on budget/policy; users want something else. After delivery, new requirements emerge to serve the user
3. **Diverse stakeholders with conflicting priorities**: balance must be revisited as you discover that some group was under-represented

Evolution model (Sommerville Fig 4.18):

```
Initial problem            →     Better problem
understanding                    understanding
     │                              │
     ▼                              ▼
Initial requirements       →    Updated requirements
                                                 → time →
```

---

## 2. Enduring vs. volatile requirements (Sommerville)

| Type | Characteristic | How to distinguish |
|---|---|---|
| **Enduring** | Tied to core organizational activities. Change slowly | "Tax collection" (government), "Register patient" (hospital), "Publish article" (publisher) |
| **Volatile** | Tied to **support** activities reflecting **how** the organization works. Change frequently | "Receipt layout", "Internal approval workflow", "Custom managerial reports" |

**Architectural decision**: encode **enduring** in the system core; isolate **volatile** behind extension points (plugins, templates, config). Otherwise, every volatile change breaks the core.

---

## 3. Change-management process (Sommerville Fig 4.19)

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Problem /     │     │  Problem       │     │  Change        │     │  Change        │
│  proposal      │ ──→ │  analysis +    │ ──→ │  analysis +    │ ──→ │  implementation│
│  identified    │     │  change        │     │  cost          │     │                │
│                │     │  specification │     │  estimation    │     │                │
└────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘
```

### 3.1 Stage 1 — Problem analysis + change specification

Identifies a problem OR a specific change proposal. The analyst assesses whether it is valid. Reports back to the requester.

**Output**: either a refined proposal, or withdrawal.

### 3.2 Stage 2 — Change analysis + cost estimation

Evaluates **impact** based on:

- Traceability (which requirements depend on this one?)
- General system knowledge
- Which artifacts will be touched (docs, design, code, tests)

**Output**: decision to **proceed or not**. Criterion: benefit > cost + risk.

### 3.3 Stage 3 — Implementation

Modify:

- Requirements document
- Design
- Code
- Tests
- Communication to affected stakeholders

**Organization rule**: the requirements document must be **modular** — each section can be modified without rewriting everything. Minimize external references.

### 3.4 Dangerous temptation (cited by Sommerville)

> If a new requirement must be implemented **urgently**, there is always a temptation to change the system and then **retroactively** modify the requirements document. Almost inevitably, this puts the requirements specification and the implementation **out of step**.

**Rule**: if you implement before updating the doc (emergency change), update the doc **within 24h**. Otherwise, you will forget.

---

## 4. Requirements-management planning (Sommerville 4.6.1)

4 decisions to make at the project's start:

### 4.1 Requirement identification

Each requirement must have a **unique ID**. Common schemes:

```
RF-001       → Functional Requirement 001
RNF-PERF-01  → Performance NFR 01
CA-LOGIN-05  → AC 05 of the Login feature
US-1247      → User Story 1247 (from the tracking system)
```

The ID is stable (does not change when the requirement changes). The requirement's version changes.

### 4.2 Change-management process

Who approves a change? Within what timeframe? What SLA? Covered by a CCB (Change Control Board)? Define before the first change.

### 4.3 Traceability policies

Which relations must be recorded? Among:

- Requirement ↔ requirement (depends-on)
- Requirement ↔ design
- Requirement ↔ code
- Requirement ↔ test
- Requirement ↔ stakeholder

And **how** to record them (spreadsheet, tool, links in Jira/OpenProject).

### 4.4 Tool support

- Storage of requirements (repository accessible to all)
- Change management (tool tracks proposals and responses)
- Traceability management (links between artifacts)

Large systems: **DOORS, Jama, OpenProject, Polarion**. Small systems: spreadsheets + wiki + links in Git/issue tracker.

---

## 5. Traceability — the concept

Sommerville:

> You need to keep track of the relations between requirements, their sources, and the system design so that you can analyze the **reasons for proposed changes** and the **impact** these changes are likely to have on other parts of the system.

### 5.1 Traceability types

| Direction | Question it answers |
|---|---|
| **Pre-traceability** | Where did this requirement come from? (Who? Why?) |
| **Post-traceability** | Where is this requirement implemented? (Which modules, classes, tests?) |
| **Horizontal** | Which other requirements depend on this one? |

### 5.2 Classical Requirements Traceability Matrix (RTM)

|  | RF-01 | RF-02 | RF-03 | RNF-01 |
|---|---|---|---|---|
| **Origin stakeholder** | Sales Dept. | Sales Dept. | Director | *"LGPD"* |
| **Design doc** | DD §3.1 | DD §3.1 | DD §3.2 | DD §5 (privacy) |
| **Code** | `OrderController` | `OrderItem` | `ReportService` | `audit/*` |
| **Test** | `OrderSpec` | `OrderSpec`, `ItemSpec` | `ReportSpec` | `AuditSpec` |
| **Status** | DONE | DONE | IN PROGRESS | DONE |

This matrix lives in a spreadsheet or tool. **Without it, changing 1 requirement becomes "which modules do I touch?" with no answer.**

### 5.3 Traceability in the agile model (Backlog + Git)

The backlog hierarchy is already part of traceability:

```
Epic
  └─ Feature
       ├─ ACs
       └─ User Story
            ├─ BDD (scenarios)
            ├─ Tasks
            │    └─ Pull Requests (Git)
            │         └─ Commits
            │              └─ Modified files
            └─ Test results (CI)
```

**Best practices in Git**:

- Branch name: `feature/US-1247-listagem-basica-atletas`
- Commit message: `feat(atletas): adiciona listagem básica [US-1247]`
- PR description: link to the US in OpenProject/Jira
- Test name: `describe('US-1247: Listagem básica de Atletas', ...)`

This way, given a file, you discover the requirement that justifies its existence. Given a requirement, you discover all the code that implements it.

### 5.4 Reverse traceability (real case)

**Scenario**: dev opens `OrderController.java` 6 months later. Question: "Can I remove this method? Who uses it?"

**Without traceability**: grep across the code (may catch direct usage, but not the business rule requiring it).
**With traceability**: method line → commit → PR → US → AC → Feature → Stakeholder. In 5min you know: "Cannot remove; it satisfies CA-ORDER-12 coming from the *"Anvisa"* regulation."

---

## 6. AC + BDD + test = nearly automatic traceability

The **BDD** layer (see [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md)) is part of end-to-end traceability:

```
Feature .feature file       ──→  Implemented ACs
  Gherkin scenario          ──→  Step definitions (test code)
     Given/When/Then steps  ──→  Calls into production code
```

Each Gherkin scenario is an **executable link** between requirement and code. The test passes = the requirement is implemented. The test breaks = either the code is wrong, or the requirement changed and nobody updated the scenario.

---

## 7. Change-management tools (choose by scale)

| Scale | Tool |
|---|---|
| Small (1–3 devs, MVP) | Trello + Markdown in the repo |
| Medium (5–15 devs) | Jira / Linear / GitHub Projects + documentation in Notion / Confluence |
| Large (50+ devs, multiple teams) | Jira + Confluence + Polarion or Jama |
| Critical systems (health, finance, aerospace) | DOORS, Polarion, Jama (mandatory audit + traceability) |

**Principle**: the tool serves the process, not the other way around. Start simple.

---

## 8. Agile processes and change (Sommerville)

> Agile development processes were designed to **deal with requirements that change during the development process**. In these processes, when a user proposes a change to the requirements, it **does not go through a formal** change-management process. Instead, the user must prioritize the change and, if it is high priority, decide which planned features for the next iteration should be dropped so it can be implemented.

**Advantage**: agility.
**Risk**: the user is not necessarily the best decider of the cost-benefit trade-off. In systems with multiple stakeholders, a change benefits some and harms others.

**Mitigation**: have an **independent authority** (Steering Committee, simplified CCB) that balances interests, especially for changes affecting stakeholders absent from the daily.

---

## 9. Requirements versioning

Just as code has Git, requirements have versions.

**Simple scheme**:

```
RF-001 v1.0   → initial version
RF-001 v1.1   → wording tweak (does not change behaviour)
RF-001 v2.0   → behavioural change (review needed)
RF-001 DEPRECATED → no longer used; kept for history
```

**Requirement history** records:

- Who changed it
- When
- What changed (diff)
- Why (motivation)
- Who approved

---

## 10. Anti-patterns

### 10.1 "Verbal change" (without record)

The client says in the corridor "I need this changed". The dev implements. The document is never updated. **In 6 months no one remembers why it is like that.**

### 10.2 "Clean" refactor without traceability

The dev renames a class, "cleans" code, removes a comment saying "satisfies CA-LOGIN-05 (*"LGPD"*)". 1 year later, the auditor asks "how do you comply with *"LGPD"*?" → nobody can answer.

### 10.3 Accepting every proposed change

The PO says yes to everything. The backlog becomes an infinite list. Velocity drops. Nothing ships. **A change needs acceptance criteria**: priority + cost + impact.

### 10.4 Rejecting every change

"We've specified, no more changes." The delivered system does not solve the real problem. **Rigidity = failed project.** Balance with formal management.

### 10.5 Traceability without updates

The matrix exists. It has not been updated in 2 years. Worse than not having one — induces false security. **Policy**: traceability is updated in the same PR that changes the requirement or code.

### 10.6 Mutable ID

A requirement is renumbered each release. Traceability breaks. **Rule**: the ID is eternal. The version changes; the ID never.

---

## 11. When to change a requirement vs. renegotiate the deadline

| Situation | Action |
|---|---|
| Client misunderstood what they asked for | Change the requirement; the deadline may shift |
| Dev discovered a technical impossibility | Renegotiate (change tech or change requirement) |
| New law changes the rule | Change the requirement (no choice); prioritize above all |
| Competitor launched a feature | DO NOT change the requirement without reanalysis; may be a mirage |
| New stakeholder appeared | Change the requirement + revisit priorities |
| Technology now offers a new resource | Evaluate whether the original requirement is still the best option |

---

## 12. Connection with the next references

- **Layer above — business analysis (BABOK)**: [08-analista-negocios.md](08-analista-negocios.md)
- **Ethics in change (especially decommissioning)**: [09-etica-sbc.md](09-etica-sbc.md) §3.6 (care when modifying/shutting down system operation)
