# 09 — Professional Ethics applied to Requirements Engineering

> **Cross-cutting, non-negotiable** layer. Based on the *"SBC"* (*"Sociedade Brasileira de Computação"*) Code of Ethics and Professional Conduct — *"Resolução 002/2024"* (signed by *"Profa. Thais Vasconcelos Batista"*, *"SBC"* president, on 21/03/2024). It is a translation of the IFIP code, which in turn is an adaptation of the ACM Code of Ethics. **It is not above the other layers; it is below all of them — every RE decision passes through it.**
>
> **Note on translation**: the citations of the *"SBC"* Code below are non-official English renderings of the pt-BR text for skill consumption. The authoritative version is in pt-BR (see [translations/pt-BR/references/09-etica-sbc.md](../translations/pt-BR/references/09-etica-sbc.md) for the verbatim citations, or the official text at https://www.sbc.org.br). When in doubt about wording in compliance or audit contexts, refer to the original pt-BR.

---

## 1. Structure of the *"SBC"* 002/2024 document

| Section | What it covers |
|---|---|
| **1. General Ethical Principles** | 7 fundamental principles (well-being, avoid harm, honesty, fairness, intellectual property, privacy, confidentiality) |
| **2. Professional Responsibilities** | 9 duties (quality, competence, laws, peer review, evaluation, areas of competence, public awareness, authorized access, secure systems) |
| **3. Professional Leadership Principles** | 7 duties of those who lead (public good, social responsibility, quality of work life, policies, opportunities, care when changing/discontinuing, systems integrated into society) |
| **4. Compliance with the Code** | Support, promote, respect; treat violations as incompatible |

> "This code **is not an algorithm for solving ethical problems**. Instead, it serves as a basis for ethical decision-making. When thinking about a specific problem, a Computing professional may find that several principles must be taken into account and that different principles will have different relevance to the problem."

---

## 2. Principles most relevant to RE (mapping)

### 2.1 §1.1 — Contribute to society and human well-being

> This principle states the obligation of Computing professionals to use their skills for the benefit of society. It includes the promotion of **human rights** and the protection of each individual's right to **autonomy**. When the interests of several groups conflict, **the needs of the less favoured must receive greater attention and priority**.

**Application in RE**:

- Every backlog prioritization must ask: "Who is harmed if this is not delivered?". If the answer includes a vulnerable group, that item rises in the order
- FRs and NFRs must guarantee **accessibility** (WCAG, screen reader, keyboard navigation)
- "Failure to design for inclusion is unfair discrimination" (§1.4 of the code)

**Example**: online-registration feature. If it requires a modern smartphone and there is a target population without access (vulnerable), the requirement must **include** an alternative (in-person service, phone call), not silently exclude that population.

### 2.2 §1.2 — Avoid harm

> "Harm" means negative consequences, especially when significant and unfair. **Well-intentioned** actions, including those carrying out assigned tasks, may cause harm. When that harm is unintentional, those responsible are obliged to **undo or mitigate** the harm as much as possible.

**Additional obligation**:

> A Computing professional has the additional obligation to **report any signs of system risks** that could result in harm. If leaders fail to act to reduce or mitigate such risks, **it may be necessary to denounce** these situations to reduce potential harm.

**Application in RE**:

- Identify **security and safety NFRs** from the elicitation phase
- Raise **misuse scenarios** (not only correct use) in the analysis phase — who might try to abuse the system?
- Every requirement change must include an evaluation of **residual risk**
- If a client requirement will cause harm (to users, third parties, the environment), **the professional must refuse or contest** — they cannot "just implement because it was requested"

**Example**: client asks "we want a button that sends a message to all the user's contacts without confirmation". The ethical professional **refuses this requirement** or demands a redesign — it opens the door to harassment/spam/abuse.

### 2.3 §1.3 — Be honest and trustworthy

> A Computing professional must be **transparent** and provide full disclosure of all system resources, limitations, and potential problems to the appropriate parties. They must be honest about their **qualifications** and about any **limitations in their competence**.

**Application in RE**:

- Story Point estimates must reflect real uncertainty, not political pressure
- System limitations (will not work offline, does not scale beyond N users, minimum latency Xms) must be **explicitly** documented as NFRs
- When you cannot answer a stakeholder's technical question, say "I don't know, I will research it" — do not make it up

### 2.4 §1.4 — Be fair and adopt non-discriminatory actions

> Prejudiced discrimination based on age, colour, disability, ethnicity, family status, gender identity, union membership, military status, nationality, race, religion or belief, sex, sexual orientation, or any other inappropriate factor is **an explicit violation** of this code.
>
> The use of information and technology may cause new inequalities or amplify existing ones. Technologies and practices must be **as inclusive and accessible as possible** and Computing professionals must take measures to avoid creating systems or technologies that disenfranchise or oppress people. **Failure to design for inclusion and accessibility may constitute unfair discrimination.**

**Application in RE**:

- WCAG 2.2 AA is the **floor**, not the ceiling. Explicit accessibility NFRs in **every** feature
- Automated decisions (ML/AI) affecting people require **bias auditing**
- System language must avoid gendered defaults, must allow social name, must respect identities
- Personas used in design cannot assume a single socio-economic/educational/age profile

### 2.5 §1.6 — Respect privacy

> The responsibility to respect privacy applies to Computing professionals **in a particularly deep way**. New technologies allow the collection, monitoring, and exchange of personal information quickly, cheaply, and often **without the knowledge of the affected people**.

**Operational principles**:

- Personal information used only **for legitimate purposes and without violating rights**
- **Only the minimum amount** of personal information necessary must be collected
- **Retention and deletion periods** clearly defined
- Informed consent for automatic collection
- Allow reviewing, obtaining, **correcting**, and **erasing** personal data
- Particular care when **merging datasets** (privacy can be compromised by aggregation)

**Application in RE (*"LGPD"* included)**:

- Explicit NFRs for **minimization of collection**: each registration field needs justification
- NFR: **limited retention** with defined deadline + automatic deletion process
- NFR: **portability** (user exports their data)
- NFR: **right to be forgotten** (delete profile + cascade across associated data)
- Audit logs: what do they do? who accesses them? for how long are they kept?
- Sensitive data (health, biometrics, political orientation) always requires extra justification

### 2.6 §1.7 — Honour confidentiality

Application in RE:

- Requirements documents containing trade secrets do not leak in public PRs
- Market analysis / competitive intelligence treated as confidential
- **Exception**: violation of law → report to the competent authorities (whistleblower)

### 2.7 §2.5 — Comprehensive evaluation, especially for ML/AI

> **Extraordinary care must be taken to identify and mitigate potential risks in machine-learning systems.** A system whose future risks cannot be reliably predicted **requires frequent risk re-evaluation as system use evolves, or should not be deployed.**

**Application in RE for ML systems**:

- Explicit NFRs for:
  - **Periodic risk re-evaluation** (minimum quarterly cadence)
  - **Drift detection** (production data distribution ≠ training)
  - **Explainability** of decisions to affected users
  - **Right of contestation** (human-in-the-loop for critical cases)
  - **Bias audit** by demographic group
- FR: **comprehensive logging** of automated decisions (for post-hoc analysis)

### 2.8 §2.6 — Work only in areas of competence

> If at any time, before or during the work, the professional identifies the lack of necessary competencies, they must **communicate this to the employer or client**.

Application in RE:

- Engineer without critical domain knowledge (health, legal, finance) **must declare it** and demand a specialist on the team
- "I know IT but not medicine" is not shameful — what is shameful is pretending to know

### 2.9 §2.9 — Design and implement robust and secure systems

> **In cases where misuse or harm is foreseen or unavoidable, the best option may be not to implement the system.**

**The professional-veto principle**. The professional may (and should) refuse to contribute to a system that will generate significant harm.

**Application in RE**:

- **Threat-model analysis** from elicitation
- **Intentional-abuse scenarios** specified (not only "happy path")
- **Recourse to refusing to implement** when analysis shows unavoidable harm

Classic examples where professional refusal was applied:

- Google engineers refuse to work on Project Maven (military AI drones)
- Microsoft engineers contest the ICE contract
- Facebook engineers refuse political microtargeting features

### 2.10 §3.1 — Public good as central concern — **CITES RE EXPLICITLY**

> People — including users, clients, colleagues, and others affected directly or indirectly — must always be the central concern of Computing. The public good must always be an **explicit** concern when evaluating tasks associated with: research, **requirements analysis**, design, implementation, testing, validation, deployment, maintenance, withdrawal, and disposal of systems.

RE is named explicitly as a moment of ethical evaluation. **Every requirement review must ask: "How does this serve the public good?"**

### 2.11 §3.6 — Care when modifying or discontinuing system operation

> Interface changes, feature removal, and even software updates impact user productivity and the quality of their work. Leaders must take **care when changing or discontinuing support for system features people still depend on**. Leaders must thoroughly investigate viable alternatives to removing support for a legacy system. **If these alternatives are unacceptably risky or impractical, the developer must help with the smooth migration** of stakeholders from the system to an alternative.

**Application in change RE**:

- Before removing a used feature → analyze who depends on it, communicate with **ample advance notice**, offer a **migration path**
- When discontinuing a whole product → plan data export, transition deadline, minimum support during migration
- In RE (see [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md) §3.4), update documentation retroactively within ≤24h after an emergency change

### 2.12 §3.7 — Systems integrated into society's infrastructure

> Even the simplest computing systems have the potential to impact all aspects of society when integrated into everyday activities such as commerce, tourism, government, health, and education. When organizations and groups develop systems that become a **major part of society's infrastructure**, their leaders have the **additional responsibility to be good stewards** of these systems.

**Application in RE**:

- Critical systems (health, finance, energy, transport) require additional NFRs of:
  - **Resilience** (continue working under anomalous load)
  - **Fair access** (do not exclude marginalized populations)
  - **Continuous monitoring** of adoption level and social impact
  - **Adequate standards** developed when none exist

---

## 3. How to integrate ethics into the RE process (not as an annex)

### 3.1 How NOT to do it

❌ Annex "Ethical considerations" at the end of the requirements document that nobody reads.
❌ Isolated meeting on ethics once a year.
❌ "Privacy by design" as a slogan without concrete NFRs.

### 3.2 How to do it

✅ **Every feature goes through an ethical checkpoint** at review (yes/no to concrete questions).
✅ **Acceptance Criteria include ethical NFRs** when relevant (accessibility, privacy).
✅ **Three Amigos includes ethics** — one of the voices is "who could be harmed?".
✅ **BDD scenarios include intentional misuse** alongside the happy ones.
✅ **Post-release metrics track demographic impact** (not just aggregates).

### 3.3 Ethical checkpoint — concrete questions (do for every substantive feature)

```
[ ] Who is affected by this feature, directly and indirectly?
[ ] Is there a vulnerable group (minors, elders, low income, disability)
    that may be excluded or harmed?
[ ] Which personal data do we collect? Why? For how long do we retain
    it? Who accesses it?
[ ] Is there an automated decision? Can the user contest it?
[ ] Is there a plausible misuse scenario? How do we prevent it?
[ ] Is WCAG 2.2 AA met?
[ ] Are audit logs adequate to the feature's impact?
[ ] Did we document known limitations?
[ ] Did the vulnerable stakeholder have a voice in the design?
```

Failed any → Three Amigos discussion + requirement adjustment or refusal.

---

## 4. Typical ethical scenarios in RE (with treatment)

### 4.1 Client requests excessive data collection

**Situation**: client wants to collect *"CPF"*, *"RG"*, address, phone, email, profession, income, marital status to "qualify the lead".

**Treatment**:

- §1.6 — minimum necessary collection
- Question: is every field justified for the declared purpose?
- Renegotiate: collect the minimum now, expand only if necessary with consent
- If the client insists without justification → escalate or refuse

### 4.2 System will automate a critical decision about people

**Situation**: ML decides credit approval / school enrollment / medical care.

**Treatment**:

- §2.5 — continuous risk re-evaluation; bias audit
- §1.4 — audit by demographic groups (does the same error affect all equally?)
- §2.6 — does the team have competence in responsible ML?
- NFRs: explainability + right of contestation + human-in-the-loop for borderline cases

### 4.3 Feature can be used for surveillance

**Situation**: manager requests a dashboard with individual real-time productivity (keystrokes, screen captures).

**Treatment**:

- §1.1 — individual autonomy; surveillance erodes autonomy
- §1.2 — foreseeable psychological harms (anxiety, gaming the system)
- Renegotiate: focus on team metrics, not individual; coarser time granularity
- If they insist → escalate or refuse (§2.9 — do not implement)

### 4.4 Change will harm a dependent group

**Situation**: the app will discontinue support for old browsers. Elderly / low-income users depend on those browsers.

**Treatment**:

- §3.6 — investigate alternatives; help smooth migration
- Extend the support deadline
- Offer an alternative path (lite version, in-person service)
- Communicate early through the channels those users actually use

### 4.5 Pressure to deliver without validating

**Situation**: tight deadline, the manager asks to "skip the tests" or "validate later".

**Treatment**:

- §2.1 — quality in professional work
- §1.3 — honesty about limitations
- §2.5 — identified risks must be reported
- Document formally: "if we deliver without test X, the risk is Y, with impact Z on N users"
- If the manager maintains the decision → continue work under direction, but with a paper trail

---

## 5. Connection between ethics and the other references

| Reference | Ethical connection |
|---|---|
| [01-fundamentos.md](01-fundamentos.md) | External NFRs include ethical requirements (*"LGPD"*, accessibility) |
| [02-elicitacao.md](02-elicitacao.md) | Ethnography requires informing people beforehand (§1.3 honesty) |
| [03-especificacao.md](03-especificacao.md) | ACs must cover exclusion scenarios; US must have a vulnerable persona tested |
| [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md) | BDD scenarios include intentional-misuse cases |
| [05-estimativa.md](05-estimativa.md) | Honest estimation (§1.3) — neither inflated nor reduced under pressure |
| [06-validacao.md](06-validacao.md) | Vulnerable stakeholder has a voice in validation |
| [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md) | §3.6 — care when discontinuing; ethical traceability |
| [08-analista-negocios.md](08-analista-negocios.md) | Strategic analysis evaluates the public good (§3.1) |

---

## 6. Article §4 — Compliance

> Computing professionals must adhere to the principles of this code and contribute to improving them. Computing professionals who recognize violations of this code must take measures to resolve the ethical issues they recognize, including, when reasonable, expressing their concern to the person or persons violating this code.

**Mechanism**: observed violation → report to the *"SBC"* Ethics Committee. Corrective action per the Ethics Committee's Regulations.

---

## 7. Additional bibliography on computing ethics

- ***"SBC"*.** *"Resolução 002/2024"* — official text at https://www.sbc.org.br
- **ACM Code of Ethics** — origin code (https://www.acm.org/code-of-ethics)
- **IFIP Code of Ethics** — intermediate version (https://www.ipthree.org/ifip-code-of-ethics)
- **IEEE Code of Ethics** — complementary (https://www.ieee.org/about/corporate/governance/p7-8.html)
- **Vallor, S.** *Technology and the Virtues*, Oxford 2016 — philosophical foundation
- **O'Neil, C.** *Weapons of Math Destruction*, 2016 — algorithmic-bias cases
- **Eubanks, V.** *Automating Inequality*, 2018 — systems that harm the vulnerable
- **Crawford, K.** *Atlas of AI*, 2021 — ethics in ML

---

## 8. Executive summary (in case you have no time to read everything)

**3 questions to ask of every important RE decision**:

1. **Who is harmed?** Especially the less favoured (§1.1)
2. **Which harms are foreseeable?** Including the unintended ones (§1.2)
3. **Can I refuse to contribute?** If misuse is unavoidable, perhaps you should (§2.9)

If the 3 answers are acceptable → proceed. If any raises a red flag → Three Amigos discussion + escalate to leadership + document the decision.

**Synthesis principle**: requirements are not a technicality. Each requirement is a choice about how our technology shapes people's lives. Treat them with the gravity they deserve.
