# 02 — Requirements Elicitation

> How to discover what the system must do. Combines LECTURES 04-06 *"IFPB"* + Sommerville 4.3. Six techniques: interviews, questionnaires, brainstorming/workshops, ethnography, document analysis, stories and scenarios. None of them is enough on its own — combine ≥2.

---

## 1. What elicitation is

**It is not "collecting requirements" — it is discovering them, in collaboration with stakeholders.** Sommerville (4.3): "Software engineers work with stakeholders to find out more about the application domain, the activities involved in the work, the services and features stakeholders want from the system, desired performance, hardware limitations, and so on."

Stakeholders **do not know** fully what they want. You help articulate.

---

## 2. The 5 fundamental difficulties (Sommerville)

1. **Stakeholders do not know what they want** in specific aspects, only in general. They find it hard to articulate. They make unrealistic demands because they do not know what is feasible.
2. **They express things in their own terms** with implicit knowledge. An engineer without domain experience misunderstands.
3. **Different stakeholders express things in different ways.** The engineer must discover ALL sources + convergence + conflict points.
4. **Political factors** influence things. A manager demands a specific requirement to expand their influence.
5. **The economic/business environment is dynamic** — it changes during the process. Requirements may appear/disappear; new stakeholders may enter.

### 2.1 Christel & Kang (apud Pressman, 2006) — 3 additional categories

- **Scope problems**: poorly defined boundaries; the client specifies unnecessary technical details that confuse
- **Understanding problems**: clients are not certain of what is needed; little comprehension of the capabilities of the computing environment; they omit "obvious" information; they specify ambiguous or untestable requirements
- **Volatility problems**: requirements change over time

### 2.2 Kotonya — additional barriers

- Many unknown terms / technical manuals
- Problem-domain experts are busy (no time for the analyst)
- Organizational politics (real decisions ≠ org chart)

---

## 3. The 6 techniques (comparative view)

| Category | Techniques | When to use | Advantages / Limitations |
|---|---|---|---|
| **Interviews** | Individual or in group | Stakeholders available + good communication | High-quality information, but depends on interviewer skill |
| **Questionnaires** | Structured or open | Many dispersed users | Fast collection, but shallow answers |
| **Workshops / Brainstorming** | Collaborative sessions | Need for consensus / innovation | Promotes integration, but can generate conflicts / groupthink |
| **Observation / Ethnography** | Following real work | Want to understand actual processes (vs. formal) | Reveals tacit requirements, but slow |
| **Document analysis** | Reading existing systems and reports | Maintenance, replacement, formally documented processes | Helps context, but does not reveal new needs |
| **Stories and scenarios** | Narrative text / structured flow | Lay client; exploratory discussion | Easy for everyone, but imprecise |

**Rule**: no isolated technique is sufficient. Always combine 2+ (interview → questionnaire; observation + doc analysis; brainstorming → prototype).

---

## 4. Interviews (the most common technique — Aurum & Wohlin 2005)

### 4.1 Definition

A directed conversation with a specific purpose, in question-answer format (Kendall & Kendall 2010). Requirements derive from the answers (Sommerville 2007).

### 4.2 When they work well

- Obtaining organizational and personal objectives
- General understanding of the problem + interaction with the new system
- Interviewee feelings about current systems
- Eliciting informal procedures

### 4.3 Types (Sommerville)

- **Closed** — pre-defined set of questions
- **Open** — no programmed script; broad exploration

In practice, **a mix**. Fully open discussions rarely work. Start with a few questions to focus.

### 4.4 Planning — 5W (Kendall & Kendall 2010)

| W | Question | Answer |
|---|---|---|
| **Why** | Goals of the interview | Initial exploratory interviews (capture organizational goals); later, narrower focus |
| **Who** | Whom to interview | Identify who has knowledge; role/position (top management → vision; operational → detail). The client helps indicate |
| **When** | Date, time, duration | Schedule in advance (a few days); inform goal and topic. Duration: 1h (focused), up to 2h (exploratory/top management) |
| **Where** | Location | Usually at the interviewee's workplace |
| **How** | Preparation | Question types, wording, ordering, recording method |

### 4.5 Kendall & Kendall steps

1. **Study existing material** about domain and organization (common vocabulary, avoids basic questions)
2. **Establish objectives** (information sources, formats, decision frequency/style)
3. **Decide whom to interview** (key people from each class; the client helps)
4. **Prepare the interviewee** (schedule in advance, topic)
5. **Prepare the interview** (question types, structure, recording)

### 4.6 Types of questions

| Type | What it is | Examples | Strengths | Weaknesses |
|---|---|---|---|---|
| **Subjective** | Open answers | "What do you think of…?", "Explain how…" | Rich detail; new lines of inquiry; spontaneity | Irrelevant details; loss of control; long answers; gives impression of a lost analyst |
| **Objective** | Limited answers | "How many…?", "Who…?", "How long…?", "Which of the following…?" | Time efficient; keeps control; relevant data | Tedious; lose important details; do not build rapport |
| **Probing** | Explore details | "Why?", "Can you give an example?", "How does this happen?" | Subjective or objective | — |

**Kendall & Kendall 2010 summary table (Tab 3.1):**

| Criterion | Subjective | Objective |
|---|---|---|
| Data reliability | Low | High |
| Efficient use of time | Low | High |
| Data precision | Low | High |
| Breadth and depth | High | Low |
| Interviewer skill required | High | Low |
| Ease of analysis | Low | High |

### 4.7 Interview structures

- **Pyramid (inductive)**: starts with specifics → ends with general. Useful when the interviewee needs to "warm up" or when you want to close with an overview
- **Funnel (deductive)**: starts with general subjective → ends with specific objective. **Default structure for opening** a session; friendly; avoids long objective sequences
- **Diamond**: inverted pyramid + pyramid. Specific → general → specific. Good for keeping interest; tends to run long

### 4.8 Structured vs. unstructured (Tab 3.2 Kendall & Kendall)

| Criterion | Unstructured | Structured |
|---|---|---|
| Evaluation | Harder | Easier |
| Time required | Higher | Lower |
| Training required | Higher | Lower |
| Spontaneity | Higher | Lower |
| Insight opportunities | Higher | Lower |
| Flexibility | Higher | Lower |
| Control | Lower | Higher |
| Precision | Lower | Higher |
| Reliability | Lower | Higher |
| Breadth/depth | Higher | Lower |

### 4.9 Effective interview — 5 practices

1. **Build a basis of trust** + mutual understanding
2. **Keep control** of the interview
3. **Sell the System idea** — information relevant to the interviewee
4. **Open mind** — avoid pre-conceptions, willingness to listen
5. **Encourage with a springboard**: hook-question or proposed requirement. "Tell me what you want" **DOES NOT** work — it is easier to talk within a defined context

### 4.10 Recording

3 options, with trade-offs:

| Form | Advantages | Disadvantages |
|---|---|---|
| **Audio/video recording** | Complete + reproducible record | Interviewee uncomfortable; interviewer distracted; transcription expensive; dangerous to rely on it "to clarify later" |
| **Notes** | Keeps you alert; outline = roadmap; shows interest | Disrupts pace; focuses on facts, loses feelings |
| **Report/minutes** | Captures main points | Must be written quickly for quality |

**Mandatory items of the minutes** (Kendall & Kendall):

- Interviewee(s) + Interviewer(s)
- Date and time + Duration
- Subject + Goals
- Main points discussed

**After writing, send to all participants to validate (validation of findings).**

---

## 5. Questionnaires (surveys)

### 5.1 Definition (Kendall & Kendall)

Captures, from several people affected by the system:

- **Attitudes** — what they say they want
- **Beliefs** — what they think is actually true
- **Behaviour** — what they do
- **Characteristics** — properties of people/things

### 5.2 When to use

- Geographically dispersed stakeholders
- Large N and need to know the proportion who approve/disapprove
- Exploratory study (overall opinion before defining direction)
- Confirming that problems identified in interviews extend to a larger sample

### 5.3 Interviews vs. questionnaires

| Aspect | Interviews | Questionnaires |
|---|---|---|
| Primary goal | Detailed, qualitative | Broad, quantitative |
| Interaction form | Direct, personal | Indirect, asynchronous |
| Depth | High | Low |
| Number of participants | Few (1–10/round) | Tens/hundreds |
| Time and cost | High | Low |
| Flexibility | High (analyst adapts) | Low (fixed questions) |
| Data type | Qualitative | Quantitative |
| When | Depth + motivations | Breadth + trends |
| Main limitation | Interviewer skill | Little depth |

### 5.4 Combined use

**Interview → Questionnaire** (the interview discovers themes; the questionnaire quantifies on a sample).
**Questionnaire → Interview** (refine unclear answers).

### 5.5 Scale types (for closed questions)

| Type | What it measures | Data type | Example |
|---|---|---|---|
| **Nominal** | Distinct categories | Qualitative | "What is your profile?" ( ) Student ( ) Teacher ( ) Other |
| **Ordinal** | Ranking without numeric interval | Ordered qualitative | "How often do you use it?" ( ) Rarely ( ) Sometimes ( ) Frequently ( ) Always |
| **Interval (Likert)** | Intensity in equal intervals | Quantitative | "I agree that the system meets the need" 1-Strongly disagree … 5-Strongly agree |
| **Numeric (0–10)** | Numeric value on continuous/discrete scale | Quantitative | "Rate from 0 to 10 your satisfaction" |
| **Semantic differential** | Opposite adjective pairs | Mixed | "The interface is: Hard ↔ Easy" |
| **Forced choice (ranking)** | Order by preference | Ordinal quantitative | "Rank the features by importance (1 to 4)" |

**Critical rule**: each scale defines **how you can statistically treat the result**. Calculating mean on an ordinal scale is statistically invalid — use median or ranking.

### 5.6 The 8 problems with scales + mitigation

| Problem | Mitigation |
|---|---|
| Ambiguity ("fast", "easy") | Specify context ("under 5s", "during peak hours") |
| Neutral / socially-desired answer (central tendency, acquiescence) | Balanced statements (positive + negative); even-numbered-point scales (no neutral midpoint) |
| Badly calibrated scales (unequal intervals) | Standardize (all 5- or 7-point; proportional labels) |
| Too many scales (cognitive fatigue) | Maximum 2–3 types per questionnaire; pilot run |
| Scale vs. goal misaligned (ordinal measuring intensity) | Define type of desired info FIRST; then choose scale |
| Incorrect interpretation (mean on ordinal) | Means only with interval/numeric; ordinal uses median/frequency/ranking |
| Long/repetitive questionnaires | 10–12 relevant questions; alternate closed/open; group |
| Lack of context | Short sentence before each scale |

### 5.7 Kendall & Kendall 2010 guidelines

- White space (legibility)
- Sufficient space for open answers
- Clear marking for objective answers
- Consistent style

---

## 6. Workshops and Brainstorming

### 6.1 Brainstorming (Alex Osborn, 1940)

Collaborative idea generation, **without judgement** or criticism during the initial phase. In RE:

- Collects ideas from multiple stakeholders quickly
- Explores usage perspectives
- Identifies new features or alternatives for conflicts

### 6.2 When to use

| Context | Application |
|---|---|
| Project start | Identify desired features and services |
| Requirements analysis | Resolve conflicts / prioritize |
| Innovative or poorly-defined projects | Explore when the problem is not yet fully understood |
| Multidisciplinary teams | Align technical + business + user views |

**Ideal for**: new software, innovative products, systems with multiple types of users.

### 6.3 How to run — 4 stages

1. **Preparation**: session goal + diverse participants + facilitator (moderator)
2. **Idea generation (free phase)**: everyone presents freely; **none is judged/criticized/filtered**; record visibly (board, post-its, Miro/Mural/Trello/Jamboard)
3. **Grouping and discussion**: similar ideas grouped; redundant ones merged; viability + priority discussion begins
4. **Synthesis and documentation**: final list of grouped and selected ideas; approved ideas become functional or non-functional requirements

### 6.4 Seven best practices

1. **Safe, judgement-free environment** — freedom to speak
2. **Quantity > quality** initially — refinement comes later
3. **Value "outside the box" contributions** — unusual ideas inspire
4. **Visual resources** — board, post-its, Miro/Mural/Trello/Jamboard
5. **Time-box each phase** — long sessions cause fatigue (30–45min)
6. **Record everything** — nothing is lost; someone is the recorder
7. **Close with a synthesis** — highlight 3–5 most promising ideas to become requirements

### 6.5 Five known limitations

- **Dominance** by more talkative participants
- **Groupthink**: early convergence without exploring alternatives
- **Focus on quantity** without moderation → noise > useful requirements
- **Difficulty prioritizing** afterwards (many, not all viable)
- **Dependence on facilitation** — facilitator quality is decisive

---

## 7. Ethnography

### 7.1 Definition (Sommerville 4.3.1.2)

Immersive observation technique. The analyst stays at the workplace where the system will be used, observes day-to-day work, and records real tasks.

**Central advantage**: discovers **implicit requirements** — the true way work is done, different from the organization's formal processes. Suchman (1983, pioneer of the office-work study): "Real work practices are far richer, more complex and more dynamic than the simple models presumed by automation systems."

### 7.2 Two kinds of requirements it reveals well

1. **Requirements derived from how people REALLY work** (vs. how the business process says they should). E.g.: air traffic controllers turn off the collision-alert system (too sensitive) and use their own heuristic
2. **Cooperation requirements** — knowledge of other people's activities. E.g.: controllers need to see the workload of adjacent sectors to adjust strategy

### 7.3 Limits (important!)

- **Does not innovate**: reveals what is, not what could be. Classic case: Nokia used ethnography to evolve phones; Apple **ignored current use** and revolutionized with the iPhone
- **Does not obtain domain requirements** (business rules)
- **Expensive** (analyst time on-site)

**Always combine with other techniques** — confirms/refutes findings from interviews and questionnaires.

### 7.4 Guidelines (Kotonya & Sommerville 1998)

- **Time getting to know people** + establishing trust
- **Assume people are good at what they do** — capture non-standard workarounds (they point to inefficiencies in the formal process that were absorbed by experience)
- **Take detailed notes** during observation; write a report
- **Inform people beforehand** about how it will be conducted + purpose (ethical transparency; see [09-etica-sbc.md](09-etica-sbc.md) §1.6 privacy)

### 7.5 Planning (5W for observation)

- WHAT to observe
- WHO to observe
- WHEN
- WHERE
- WHY
- HOW

### 7.6 Ethnography + Prototyping combined

Sommerville et al. 1993: ethnography informs the prototype; the prototype identifies problems/questions for the next ethnographic phase. **Virtuous cycle**.

---

## 8. Document Analysis

### 8.1 Definition

The analyst examines existing information sources:

- Current processes
- Business rules
- Forms in use
- Records and reports
- Operational procedures
- Documentation of legacy systems

### 8.2 When to use

- Systems that will be replaced or evolved
- Low user availability for interviews
- Organizations with formally documented processes
- Rules, constraints, legal obligations
- Before interviews and observations (prepare vocabulary)

### 8.3 Fundamental warning

⚠️ **Documents show how the process IS SUPPOSED TO work, not how it actually works.** Always combine with interviews or observation to validate adherence to reality.

### 8.4 Document types and what they reveal

| Document type | What it reveals | Examples |
|---|---|---|
| Forms and records | Required data + input flows | Enrolment forms, intake forms |
| Managerial reports | Indicators, metrics, information needs | Attendance reports, audits, balance sheets |
| Procedures and standards | Business rules + constraints | SOPs (*"POPs"*), internal standards, access policies |
| Legacy system docs | Existing features + problems | Manuals, diagrams, old specifications |
| E-mails and memos | Informal flows and process exceptions | Frequent exchanges between departments |
| Process maps | Relationships between activities and actors | BPMN, flowcharts |

### 8.5 How to run — 4 steps

1. **Identify relevant documents** — request from stakeholders + verify officials + assess reliability and currency
2. **Read and annotate** looking for:
   - Information inputs and outputs
   - Formal rules + documented exceptions
   - Process points involving decisions
   - Activities requiring system interaction
3. **Extract potential requirements**, for each document:
   - Functional requirements (e.g.: "register requests")
   - Non-functional requirements (e.g.: "register within 5s")
   - Business rules (e.g.: "only regular students may use the *"RU"*")
   - External dependencies (e.g.: "integration with the academic system")
4. **Consolidate findings** — produce:
   - List of extracted requirements
   - **Gaps** identified
   - **Doubts** to be validated with users
   - **Contradictions** between documents

### 8.6 Concrete example — extracting from a form

A form reveals:

- **Mandatory fields** → functional requirements (the system must accept these inputs)
- **Filling rules** → business rules (*"CPF"* format, minimum value)
- **Sensitive data** → security and privacy requirements (*"LGPD"*)

A SOP (*"POP"* — *"Procedimento Operacional Padrão"*) reveals:

- **Activity ordering** → potential use cases
- **Each actor's functions** → system roles (RBAC)
- **Mandatory practices** → non-functional requirements (traceability, audit)
- **Exceptions** → alternative scenarios (error handling)

### 8.7 Limitations and challenges

| Limitation | Practical impact |
|---|---|
| Outdated documents | Risk of extracting obsolete requirements |
| Many implicit (undocumented) rules | Loss of important requirements |
| Formal processes ≠ real processes | Lack of adherence to actual use |
| Misinterpretation of the document | Risk of ambiguity |
| Need for later validation | Always complement with interviews/observation |

### 8.8 Best practices

- Verify **date and version** of documents
- Consult **multiple sources**, not just one document
- Record **not only requirements, but doubts**
- **Combine with other techniques** (especially interviews)
- Identify **inconsistencies** between distinct documents
- Use **extracted-requirements matrix**, process maps, structured annotations

---

## 9. Stories and Scenarios (Sommerville 4.3.2)

### 9.1 Stories

Narrative text, high level, describing how the system can be used in a task. **Excellent for "overview"** with a lay stakeholder.

Example (Sommerville, iLearn system): "Jack is a primary-school teacher in Ullapool. He decided that a classroom project should focus on the region's fishing industry, examining the history, development and economic impact..."

### 9.2 Scenarios

**Structured** version of the story, with specific fields:

- **Initial assumption**: state of the system and user when it starts
- **Normal**: flow of events
- **What can go wrong**: exceptions and handling
- **Other activities**: what happens in parallel
- **Final system state** when it ends

Scenarios feed directly into FRs + NFRs + test cases.

### 9.3 Difference from agile User Stories

XP User Stories (Beck 1997+) are **short narrative scenarios**, not stories for eliciting requirements. Details in [03-especificacao.md §3](03-especificacao.md).

---

## 10. Canonical combinations (use these, not isolated techniques)

| Situation | Recommended combination |
|---|---|
| New project, unknown domain | Doc analysis → interviews with experts → workshop/brainstorming → scenarios |
| System replacing legacy | Doc analysis (old manuals) → ethnography (real use) → interviews |
| Innovative product (no current system) | Brainstorming → stories/scenarios → prototype → interviews to validate |
| Many dispersed stakeholders | Interviews with a sample → questionnaires to quantify |
| Busy stakeholders (top management) | Prior doc analysis + short focused interview |
| Conflicts between stakeholders | Facilitated workshop + alternative scenarios |
| Critical system (health, finance) | All — including ethnography + domain-expert review |

---

## 11. Smells of poor elicitation

- Used only 1 technique (usually "asked the PO what they wanted")
- No stakeholder from other layers (support, maintenance, regulator, finance)
- The requirements list is all "must be easy/fast/good"
- No requirement comes from document analysis
- No domain requirements (area-specific rules)
- No exception scenarios were drafted (only happy path)
- The stakeholder agrees with everything (no conflict = nobody engaged, or a dominant stakeholder silenced the others)

---

## 12. Connection with the next references

Output of this phase = input to [03-especificacao.md](03-especificacao.md) — where findings turn into Epic → Feature → US → AC.
