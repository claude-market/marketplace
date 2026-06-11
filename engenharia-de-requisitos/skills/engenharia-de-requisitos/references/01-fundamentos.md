# 01 — Requirements Engineering Fundamentals

> Theoretical base that precedes any practical activity. Combines Sommerville 10e (Ch. 4), Pressman 9e (7 stages), Wiegers 3e, Thayer (IEEE Computer Society Press), and the conceptual definitions that recur across all 11 *"IFPB"* lectures.

---

## 1. What a requirement is

**There is no industry consensus on the definition.** Davis (1993) explains why: in a tender, the requirement must be abstract (so several suppliers can compete); in the signed contract, it must be detailed enough for the client to validate delivery. Both needs coexist in the same document.

Three canonical definitions worth reading together:

**Sommerville (10e, Ch. 4)**:
> The requirements of a system are the **descriptions of the services it must provide and the constraints on its operation**. They reflect customer needs for a specific purpose.

**Pressman (9e)**:
> A requirement is a **specification of what must be implemented**, or some form of **constraint** on the system.

**IEEE Std (Glossary of SE Terminology)** — presents 3 complementary senses:

1. A condition or capability **needed by a user** to solve a problem or achieve an objective.
2. A condition or capability that must be **achieved or possessed by a system** (or system component) to satisfy a contract, standard, specification, or other formally imposed documents.
3. A **documented representation** of a condition or capability as in 1 and 2.

Note how Sommerville focuses on "what the system does/restricts", Pressman focuses on "what must be implemented/restricted", and IEEE separates the **conceptual** requirement (1 and 2) from the **documented** requirement (3). All three senses coexist.

**Requirements Engineering (RE)** is the process of discovering, analyzing, documenting, and checking these services and constraints. Thayer puts it: RE provides the mechanism for "**understanding what the client wants**, analyzing **needs**, assessing **feasibility**, **negotiating solutions**, **specifying them unambiguously**, and **managing their changes**".

---

## 1.5 Requirements across the software lifecycle (Sommerville Figs 2.1–2.3)

**Regardless of the chosen process model**, requirements are always the initial stage. Sommerville (Ch. 2) presents three classical models with the same observation:

| Model | Mandatory initial stage |
|---|---|
| **Waterfall (Fig 2.1)** | Requirements definition → design → implementation/test → integration/test → operation/maintenance |
| **Incremental (Fig 2.2)** | General description → specification → development → validation (cycles) → intermediate versions → final version |
| **Reuse-oriented (Fig 2.3)** | Requirements specification → software discovery/evaluation → requirements refinement → configuration/adaptation/development → integration |

> In **any development flow** — classical waterfall, incremental, agile/Scrum, reuse, model-driven —, the first activity is **understanding and specifying what needs to be built**. Granularity changes (waterfall = detailed upfront document; agile = incremental backlog refined per sprint), but position in the chain does not: **no requirement, nothing to design**.

### Why this observation matters (professional engineering analogy — LECTURE 01 *"IFPB"*)

LECTURE 01 opens with a reflection: **in other engineering disciplines, nobody produces without a project first**:

- **Mechanical engineers draft drawings** before producing machines (drill, motor).
- **Electronic engineers draft schematics** before producing equipment (Arduino board).
- **Civil engineers draft blueprints** before producing buildings.

**Software engineers**, frequently, jump straight to code — as if they were "endowed by Mother Nature" with no need for projects. The result: **software built like a doghouse** — it may hold off the rain, but it does not support growth, is not maintainable, and when the client asks for one extra room the whole structure collapses.

The software profession is ~70 years old (Sommerville). It is the youngest engineering discipline. Immaturity explains — does not justify — the persistence of the "code without requirements" practice. RE is what puts software on the same level as the other engineering disciplines.

### The canonical cartoon (cultural reference)

The iconic image of the **tree-swing in 12 panels** ("As the customer explained it / As the project leader understood it / As the analyst designed it / As the programmer coded it / As the beta testers received it / As the business consultant described it / Value the customer paid for / As the project was documented / As tech support installed it / How it was supported / When it was delivered / **What the customer really wanted**") is the most-used cultural reference to explain why RE matters. Each panel represents a translation layer — and every translation loses information.

RE exists precisely to **compress the loss between the panels**, validating understanding at every link of the chain.

---

## 1.5.1 Modern complementary techniques — MVP and A/B Testing (Valente 2020)

Marco Tulio Valente, in *Engenharia de Software Moderna* (Ch. 3, available at [engsoftmoderna.info](https://engsoftmoderna.info)), adds to the classical techniques two that came from the agile and lean-startup worlds, and which belong in the contemporary requirements engineer's toolbox:

### MVP — Minimum Viable Product

**Definition**: the smallest functional version of a product capable of **generating validated learning** about the customer with the least effort. It is an instrument for **requirements discovery via real-world experimentation** — instead of only eliciting what the customer says they want, observe what they do with a basic version and adjust the backlog.

**How it connects to this skill**:

- Replaces part of classical elicitation in **projects with high uncertainty** (new product, new market, unvalidated persona) — where interviews and questionnaires fail because nobody can answer.
- Does not replace ACs, BDD, or identified stakeholders — it merely **compresses the discovery → specification → validation cycle** into iterations of weeks rather than months.
- Anti-pattern: confusing MVP with "first crude version without quality". MVP is minimum in **scope**, not in the quality of the requirements specified for that minimum scope.

### A/B Testing

**Definition**: a controlled experiment in which two groups of users receive different versions of a feature (variant A vs. variant B), and business metrics (conversion, retention, time-on-task) decide which one ships.

**How it connects to this skill**:

- A tool for **quantitative validation of requirements** when there is ambiguity between stakeholders ("should the button be blue or red?" → A/B test decides with data).
- Combines with **product NFRs** (conversion rate, p95 latency, form-abandonment) — A/B measures real, not estimated, impact.
- Anti-pattern: A/B-testing everything. Works when there is a **clear hypothesis + direct metric + statistically significant volume**. Without those three, it is data theatre.

### Valente sources (free digital books)

- *Engenharia de Software Moderna* — [engsoftmoderna.info](https://engsoftmoderna.info), Ch. 3 covers Requirements focusing on stories, use cases, MVP and A/B.
- *Fundamentos de Manutenção de Software* — [manutencaosoftware.org](https://manutencaosoftware.org), relevant for the post-delivery phase (Ch. 4 breaking changes, Ch. 7 technical debt, Ch. 8 decommissioning) — connects with [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md) and §3.6 of [09-etica-sbc.md](09-etica-sbc.md).

---

## 1.6 Real-world failure cases caused by bad requirements

LECTURE 01 *"IFPB"* builds the argument with seven public cases. All are examples of **errors that were not code errors** — they were incomplete, ambiguous, badly validated, or ignored requirements.

| Case | Year | Cost / impact | Requirements root cause |
|---|---|---|---|
| **Mariner 1** (NASA) | 1962 | USD 18.5 million | Formula mistranscribed into the code; **specification did not require a smoothing function**. Rocket destroyed 293s after liftoff. |
| **Hartford Coliseum Collapse** | 1978 | USD 70M + USD 20M of damage | Structural software did not account for real snow loads; **load requirement was badly specified**. |
| **Citibank** | 2021 | USD 500M lost (intended to pay USD 7.8M, sent USD 900M) | **Badly specified UI design**: the operator clicked "ok" thinking they were confirming interest; in fact paid the principal. |
| **UEFA Champions League** | 2021 | Draw annulled (public embarrassment) | Software bug in the system defining the round-of-16 fixtures. Seeding-rule requirement badly implemented. |
| ***"INSS"* retirement** | 2020 | Worker with the legal right could not file | The *"INSS"* website returned a generic error ("Try again later"). Exception-flow requirements badly specified. |
| ***"IPTU São Paulo"*** | 2019 | 90 000 properties wrongly billed up to 50% more | Calculation failure in the *"Secretaria da Fazenda"* system — **business rule badly specified**. |
| **Boeing 737 MAX** | 2018–2019 | 300+ deaths in 2 crashes | MCAS (stabilization system) with **incomplete safety requirements**: relied on a single angle-of-attack sensor without redundancy. Result: a fatal bug. |

These cases became Brooks's sentence: *"the hardest single part of building a software system is deciding precisely what to build"*. Pressman echoes: "Good designs do not come out of the engineer's head; they come out of **rigorous conversation** with those who will use the system."

> **Practical lesson for the backlog**: every badly specified AC is a latent vector for this kind of catastrophe. Hence the skill's hard rule: ACs must be testable, with metrics, and validated by the stakeholder.

---

## 2. Two levels: user and system

| Aspect | **User** requirement | **System** requirement |
|---|---|---|
| Audience | Client, manager, end user, regulator | Dev, architect, tester, maintenance team |
| Language | Natural + diagrams + simple tables | Structured natural / templates / UML / formulas |
| Detail level | Abstract, high-level | Precise, exact, contractual |
| Example (Mentcare) | "The system shall generate monthly reports of medication costs per clinic." | "1.1 On the last business day of the month, generate a summary with medication name, prescription quantity, total dose, and cost. 1.5 Access restricted to authorized users per access-control list." |

**Both coexist in the same document.** The lay stakeholder reads the top one; the dev implements the bottom one. Without the user level, the client cannot validate; without the system level, the dev is guessing.

---

## 3. FR vs. NFR: the critical distinction

### 3.1 Functional Requirement (FR — `RF` in the conventions)

Describes **what** the system does: services, inputs, outputs, behaviour, exceptions. In some cases it also declares what the system **must not** do.

Examples (Mentcare):

- "A user shall be able to search the consultation lists across all clinics."
- "The system shall generate, for each day and each clinic, a list of patients due to attend that day."
- "Every staff member using the system shall be uniquely identified by their eight-digit employee number."

### 3.2 Non-Functional Requirement (NFR — `RNF` in the conventions)

A constraint **on** the services or functions. Frequently applies to the **whole** system, not to an isolated feature.

**Sommerville classification (Fig 4.3):**

```
                          NFRs
        ┌──────────────────┼──────────────────┐
        │                  │                  │
     PRODUCT        ORGANIZATIONAL          EXTERNAL
        │                  │                  │
    ┌───┼───┐         ┌────┼────┐         ┌───┼────┐
 Perf.    Reliab.   Process   Standard  Regulatory  Legal
 Security Usabil.   Operat.   of dev.   (*"LGPD"*, *"BACEN"*) Ethical
```

**Mentcare examples (Fig 4.4):**

- **Product**: "Available across all clinics during business hours (Mon–Fri, 08:30–17:30), with maximum downtime 5s/day."
- **Organizational**: "Users identify themselves with the health authority identity card."
- **External**: "Implement privacy measures for patient data per HStan-03-2006-priv."

### 3.3 Why NFRs are MORE critical than FRs

Sommerville (4.1.2): *"Failure to meet a non-functional requirement may mean that the entire system becomes unusable."*

- System works, but is slow → users abandon it
- System works, but leaks data → *"LGPD"* fine + reputation destroyed
- System works, but does not pass homologation → cannot enter production
- Aircraft works, but does not meet reliability → cannot fly

**Individual FRs can have a workaround. NFRs rarely.**

### 3.4 Golden rule: NFR must be quantifiable

**Wrong**: "The system shall be easy to use."
**Right**: "After 2h of training, an experienced user shall make ≤2 errors/h while executing tasks T1, T2, T3."

**NFR metrics (Sommerville Fig 4.5):**

| Property | Metric |
|---|---|
| Speed | Transactions/s; response time; screen refresh time |
| Size | MB; ROM chips |
| Ease of use | Training time; number of help frames |
| Reliability | MTBF (mean time between failures); probability of unavailability; failure rate |
| Robustness | Restart time; % events causing failure; probability of data corruption |
| Portability | % platform-dependent code; number of target platforms |

---

## 4. Domain requirements

A cross-cutting sub-category. **Derived from the application domain, not from the users.** They can be new FRs, constraints on existing FRs, or specific calculation rules.

**Critical problem**: the software engineer may be unaware of the domain's characteristics → the requirement is missed OR enters into silent conflict with another.

**Example *"IFPB"*-*"Controle de Dopagem"***: rule G14 — "A classified ATHLETE has automatic priority in the draw for an anti-doping test". This did not come from a user — it came from the *"WADA"* (World Anti-Doping Agency) code that governs the domain.

**Strategy**: whenever possible, have a domain specialist (physician, lawyer, accountant, athlete) participating in the review.

---

## 5. Stakeholders

**Everyone affected by the system, directly or indirectly.** Do not restrict to "end user".

**Sommerville-Mentcare example — 8 categories:**

1. Patients (recorded data) and family members
2. Physicians (assessment/treatment)
3. Nursing staff (treatment coordination/administration)
4. Receptionists (scheduling)
5. IT staff (installation/maintenance)
6. Medical ethics manager (ethical compliance)
7. Health managers (managerial information)
8. Records control (audit/retention)

**How to map stakeholders (Wiegers 2003):**

1. Identify **user classes** grouping by:
   - Frequency of use
   - Domain experience
   - Skill with computerized systems
   - Characteristics of the system they use
   - Tasks they perform in the business process
   - Access and security privilege levels

2. **Select representatives** of each class (not all — a manageable sample)

3. Establish **agreement on who decides** when priority conflict arises

**Forgotten stakeholder = forgotten requirement.** Worse: the stakeholder shows up late in the project (usually at homologation) and forces refactor.

---

## 6. Feasibility study (DO this before any planning)

**Pre-requisite of any project.** 3 questions (Sommerville):

1. **Does the system contribute to the organization's objectives?**
2. **Can it be implemented within the schedule and budget using current technology?**
3. **Can it be integrated with the other systems in use?**

Any "no" → the project probably should not proceed. Healthy exit: cancelling now costs low; cancelling in 6 months costs sky-high.

---

## 7. The RE process (the spiral)

**Sommerville Fig 4.6** — iterative process (not waterfall):

```
                     ┌─→ Requirements ─→ Requirements
                     │   specification    document
                     │                     │
        Initial      │                     │ return
        specification│                     ↓
                     │              Requirements
                     ↑                validation
                Requirements                │
                elicitation ←────────────────┘
                and analysis
                     ↑
                     │
              feasibility decision
              + external inputs
```

The amount of time spent on each activity varies per iteration. Early on, focus on **business + NFRs + user requirements**. In later iterations, focus on **technical detailing of system requirements**.

**The spiral accommodates agile**: each loop of the spiral can coincide with a sprint, and incremental development replaces formal prototyping.

### 7.1 Sub-process inside Elicitation (Sommerville Fig 4.7)

```
   ┌──────────────────────┐
   │ 1. Discovery and     │
   │    understanding     │←─────────────────┐
   │                      │                  │
   └──────────────────────┘                  │
              ↓                              │
   ┌──────────────────────┐                  │
   │ 2. Classification    │                  │
   │    and organization  │                  │
   └──────────────────────┘                  │
              ↓                              │
   ┌──────────────────────┐                  │
   │ 3. Prioritization    │                  │
   │    and negotiation   │                  │
   └──────────────────────┘                  │
              ↓                              │
   ┌──────────────────────┐                  │
   │ 4. Documentation     │──────────────────┘
   │                      │   loop with continuous
   └──────────────────────┘   feedback
```

**It is common to identify new requirements during the cycle** — the inner spiral exists to accommodate this without rewriting from scratch.

### 7.2 Pressman: 7 stages (complementary view)

1. **Inception** — clarify the nature of the problem
2. **Elicitation** — collect requirements from the sources
3. **Elaboration** — refine, expand, model
4. **Negotiation** — resolve stakeholder conflicts
5. **Specification** — write the canonical document
6. **Validation** — verify with the client
7. **Management** — control changes throughout the cycle

Not incompatible with Sommerville — it is a different (more granular) cut of the same process.

---

## 8. Understanding required BEFORE eliciting (LECTURE 02 *"IFPB"*)

Before the team starts interviewing anyone, the following must be done:

1. **Understand the general business objectives** + constraints (budget, schedule, interoperability)
2. **Survey the development context** — organization where the system will be deployed, application domain, existing systems to be replaced
3. **Organize information + discard irrelevant + prioritize organizational goals**
4. **Identify stakeholders + their roles**

Skipping this stage → interview starts unfocused, wastes the interviewee's time (political cost), generates shallow requirements.

---

## 9. The 4 dimensions of Discovery/Understanding (Falbo)

Every new project must cover:

1. **Application Domain** — general understanding of the area (health, sport, education, finance)
2. **Problem to be solved** — details of the specific problem
3. **Stakeholders' needs and constraints** — what each stakeholder needs, current processes that will be supported/replaced
4. **Business context** — how the system will affect the organization, how it will contribute to strategic objectives

Often represented as a **quadrant**:

```
     Application    │  Problem to be
     Domain         │  solved
     ───────────────┼──────────────────
     Stakeholders'  │  Business
     needs and      │  context
     constraints    │
```

---

## 10. When to drop formalism

Small systems / startups / MVPs can work with:

- Cards/wiki instead of an *"ABNT"* document
- Informal stories instead of SRS-IEEE
- Direct conversation instead of formal interviews

**But the 4 dimensions + 3 feasibility questions + stakeholder identification remain.** What changes is the formalism of the record, not the substance.

**Antipattern**: using "we're agile" as a pretext to skip elicitation. The Agile Manifesto prioritizes "individuals and interactions" — that INCLUDES stakeholder analysis, it does not exclude it.

---

## 11. Smells of poorly done elicitation

- Stakeholder speaks technical jargon and the analyst nods without understanding
- Requirements are all of the "must be good/fast/easy" kind (qualitative, not testable)
- There is no non-functional requirement in the list
- Stakeholder list contains only "end user"
- No requirements derived from the domain
- Nobody asked about the existing systems that will be replaced
- The first meeting with the client already talks about screens/wireframes

Any of these → go back to Phase A.

---

## 12. Connection to the next references

- **How to elicit**: [02-elicitacao.md](02-elicitacao.md)
- **How to specify (Epic → Feature → US → AC)**: [03-especificacao.md](03-especificacao.md)
- **AC + BDD**: [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md)
- **How to size**: [05-estimativa.md](05-estimativa.md)
- **How to validate**: [06-validacao.md](06-validacao.md)
- **How to manage change**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
- **Business analysis (layer above)**: [08-analista-negocios.md](08-analista-negocios.md)
- **Ethics (cross-cutting layer)**: [09-etica-sbc.md](09-etica-sbc.md)
