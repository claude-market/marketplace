# 06 — Requirements Validation

> How to check that requirements define the system the client actually wants. Combines LECTURE 10 *"IFPB"* + Sommerville 4.5 + Falbo (7 dimensions per requirement). Validation ≠ verification: **validation** is "are we building the right system?"; **verification** is "are we building the system right?". This section focuses on validation.

---

## 1. Why validating is critical

Sommerville (4.5):

> The cost of fixing a requirements problem by changing the system is normally **much greater** than the cost of fixing design or code errors. A change in requirements usually means that the system design and implementation must also be changed.

Historical cost (Boehm's "10x rule"):

```
Requirement ─→ Design ─→ Code ─→ Test ─→ Production
   1x         10x        100x     1000x    10000x
```

A bug in a requirement that leaks into production costs **10,000×** the cost of catching it in elicitation. Every hour spent on validation returns multiplied.

---

## 2. Sommerville's 5 checks

> During validation, different types of checks must be performed:

| # | Check | What it checks |
|---|---|---|
| 1 | **Validity** | Do the requirements reflect the **real needs** of users? Due to changing circumstances, they may have shifted since elicitation |
| 2 | **Consistency** | Do the requirements in the document conflict with each other? Contradictory constraints? Different descriptions of the same function? |
| 3 | **Completeness** | Does the document include all requirements for the intended functions and constraints? |
| 4 | **Realism** | Can the requirements be implemented within the proposed budget + schedule, using existing technologies? |
| 5 | **Verifiability** | Is it possible to write tests demonstrating that the delivered system satisfies each requirement? |

Each is a **question to ask the requirements document** during review.

---

## 3. Falbo's 7 dimensions (per individual requirement)

Falbo (2012) proposes validating **each requirement** by 7 properties:

| Dimension | Verification |
|---|---|
| **Complete** | Describes the entire feature (FR), (business) rule, or constraint (NFR). Contains the information needed to design, implement, and test |
| **Correct** | Describes **exactly** the feature, rule, or constraint to be built |
| **Consistent** | Not ambiguous. Does not conflict with another requirement |
| **Realistic** | Implementable given the capabilities and limitations of the system and development environment |
| **Necessary** | The client really needs it OR requires it because of an external factor / organizational standard |
| **Prioritizable** | Has a priority ordering to ease management |
| **Verifiable and confirmable** | It is possible to develop tests that verify whether it was implemented |

### 3.1 Per-requirement checklist

Before accepting a requirement (or AC, or US) into the backlog:

```
[ ] Complete     — has inputs, outputs, exceptions, context?
[ ] Correct      — describes exactly what the stakeholder wants?
[ ] Consistent   — does not conflict with any other requirement?
[ ] Realistic    — fits the current stack + schedule + budget?
[ ] Necessary    — who needs this and why?
[ ] Prioritizable — where does it sit in the global backlog order?
[ ] Verifiable   — which tests will I write to confirm?
```

Failed ≥1 → **NOT ready.** Back to the stakeholder.

---

## 4. The 3 validation techniques (Sommerville 4.5)

### 4.1 Requirements reviews (walkthrough)

A group of people (client + dev) read the document in detail, in session. They check for errors, anomalies, inconsistencies.

**Typical procedure:**

1. **Preparation**: distribute document 1 week in advance; reviewers note doubts
2. **Review session** (1–3h): the author presents, the reviewers point out
3. **Recording**: minutes with the problems found
4. **Negotiation**: client + dev decide how to resolve
5. **Re-review**: confirms correction

**Who should be in the room** (minimum rule):

- Document author (analyst)
- 1+ stakeholder from the impacted area
- 1 senior dev (assesses realism)
- 1 QA (assesses verifiability)
- Moderator / facilitator

### 4.2 Prototyping

> Development of an executable model of the system and use of that model with end users to see whether it satisfies their needs. Stakeholders experiment with it and give opinions on changes to the requirements.

**The most effective technique** because the user **SEES** the result. Natural language always leaks; a prototype is concrete.

#### 4.2.1 Fidelity levels

| Level | What it is | When to use |
|---|---|---|
| **Low fidelity (lo-fi)** | Paper sketches; whiteboard | Beginning. Test ideas quickly |
| **Medium fidelity** | Wireframes (Balsamiq, Pencil) | Validate flows + layout |
| **High fidelity (hi-fi)** | Mockups (Figma, Adobe XD) | Validate visual + fine interaction |
| **Functional** | Navigable prototype (Figma + InVision; HTML/React prototype) | Validate usability |

**Rule *"IFPB"***: **start simple, evolve progressively, avoid falling in love with the initial design**. Prototyping is meant to be adjusted and discarded if needed.

#### 4.2.2 How the prototype can be made (LECTURE 10)

- Interface sketches on **paper → photo**
- Interface sketches on the **whiteboard → photo**
- **Figma, Adobe XD**, or similar

The tool does not matter — what matters is **SEE + DISCUSS + ITERATE**.

#### 4.2.3 7 groups of best practices (LECTURE 10)

**Clarity and Simplicity**

- Avoid visual pollution: use only elements necessary for the task
- Reduce the number of steps: fewer clicks/screens is better
- Simple and direct language on buttons and labels ("Send", "Save", "Cancel")
- Group related elements: form fields close by function

**Consistency and Standards**

- Visual consistency: colours, icons, spacing, and typography follow a standard
- Reuse components: the same button style across all screens
- Respect system conventions (web, Android, iOS) — menus, icons, familiar interactions

**Visual Hierarchy and Layout**

- Highlight what is most important: use size, contrast, position
- Spacing (visual breathing room)
- Alignment and grid

**Feedback and Interaction**

- Prototype system responses (messages, loading, colour change)
- Show component states (disabled buttons, filled fields, errors)
- Avoid surprises — the user understands the result before executing

**User Focus**

- Know the target audience (adapt language and complexity)
- Prioritize the most frequent tasks
- Include the user in validation (test with peers + collect feedback)

**Fidelity and Iteration**

- Start simple (low fidelity) to test ideas quickly
- Evolve progressively as requirements and feedback become clearer
- Do not fall in love with the initial design

**Usability and Accessibility**

- Adequate contrast (text readable to users with visual impairments)
- Do not rely on colour alone to convey information
- Legible fonts + adequate sizes
- Keyboard / screen-reader navigation (in hi-fi)

**Coherence with Requirements**

- Every interface element corresponds to a functional requirement
- Do not create unforeseen screens/features without justification
- Review prototype + requirements together for traceability

#### 4.2.4 Frequent prototype mistakes (LECTURE 10)

| Frequent mistake | Consequence | Solution |
|---|---|---|
| Not considering the audience | Confusing interface | Create personas and flows |
| Ignoring requirements | Inconsistent prototype | Trace FR → Screen |
| Poorly planned flow | User gets lost | Screen map first |
| Inconsistency and excess | Visual pollution | Design standard |
| Lack of feedback | Difficult to use | Messages and states |

### 4.3 Test-case generation

> Requirements must be testable. If requirement tests are **conceived as part of the validation process**, this frequently **reveals problems in the requirements**.

**TDD principle applied to RE**: trying to write the test for a requirement is the best way to discover whether it is **verifiable** (Falbo dimension 7) and **complete**.

```
Validation question: "How will I test this requirement?"

If the answer is:
  ✓ "I will send input X and verify that the output is Y"  → testable
  ✓ Clear BDD scenario                                     → testable
  ✗ "I will look and see if it is good"                    → not testable
  ✗ "It depends on the context"                            → not testable
```

**Test-driven development from requirements** = a strong form of validation.

---

## 5. Fundamental limitation (Sommerville)

> The problems involved in validating requirements should not be underestimated. In the end, **it is difficult to demonstrate that a set of requirements actually satisfies a user's needs**. Users have to imagine the system in operation and how it would fit into their work.
>
> As a consequence, **it is rare to find all requirements problems during the validation process**. Inevitably, further changes to the requirements will be needed to correct omissions and misunderstandings.

**Conclusion**: validation reduces errors, it does not eliminate them. Always have a change-management process (see [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)) ready to accommodate requirements that escaped.

---

## 6. When to validate (timing)

| Moment | Validation focus |
|---|---|
| After Elicitation | Validity + Necessity (are these the right requirements?) |
| After Specification | Consistency + Completeness + Verifiability (are they well written?) |
| After Prototype | Validity + Realism (seeing this, does the user still want it?) |
| Pre-Sprint Planning | INVEST per US |
| Pre-Release | Acceptance Criteria satisfied |
| Post-Release | Continuous validity (does the delivered system actually solve the problem?) |

---

## 7. Validation for AI / ML systems (extra layer)

For systems using ML, traditional validation is **not enough**. Add:

- **Continuous risk re-evaluation** (*"SBC"* Code 2.5 — see [09-etica-sbc.md](09-etica-sbc.md))
- **Bias validation**: does the model treat demographically different groups equally fairly?
- **Drift detection**: has the production data distribution shifted relative to training?
- **Explainability**: can the system justify its decisions to the affected user?
- **Reversibility**: can the user contest and have the decision reviewed by a human?

Sommerville (Ch. 11 and 12 of the full book) goes deeper into dependability — for ML, additional sources: Goodfellow et al. *Deep Learning* (Ch. 12 practices), Russell & Norvig *AI: A Modern Approach* (ethics chapter).

---

## 8. Smells of poor validation

- Validation = "PO read the document and said 'looks good'" — invalid, missing confrontation + prototype
- No review minutes (no record = it did not happen)
- Prototype was never shown to an end user, only to the PO
- The client never said "no" to any requirement — sign of shallow validation
- "We validated through tests" — tests verify that code matches the requirement; they do not validate whether the requirement is right
- Validation happened once, at the beginning, and never again
- BDD scenarios written by the dev alone (without Three Amigos) — implementation bias
- The team treats "it is implemented" as a synonym for "it is validated"

---

## 9. Connection with the next references

- **Change management after validation reveals problems**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
- **Ethics in validation (especially AI/ML)**: [09-etica-sbc.md](09-etica-sbc.md)
