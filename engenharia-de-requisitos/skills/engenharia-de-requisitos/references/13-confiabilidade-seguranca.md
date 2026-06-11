# 13 — Dependability & Security requirements (reliability · safety · security · resilience)

> **When to use this reference**: whenever a system has `RNF` that, if unmet, make the whole product
> *unusable* rather than merely worse — money movement, health, safety-of-life, personal data, infrastructure,
> anything regulated (*"LGPD"* / GDPR / PCI). It is the depth behind `SKILL.md §4.2`'s one line "product NFRs:
> reliability, security, usability". Sommerville (4.1.2): *"Failure to meet a non-functional requirement may
> mean that the entire system becomes unusable."* This file turns the four dependability dimensions into
> **quantitative, testable `RNF`** that fit the same spine as every other requirement in this skill.

> 🟡 **This is a depth layer, not a new ceiling.** The conventions never change: an `RNF` here is still a
> business-language requirement in `docs/requirements/`, still **quantitative** (§4.2 golden rule), still
> verifiable by a `CA` + BDD, optionally phrased in **EARS** (`references/11-ears.md`) — the error/undesired
> patterns (`IF…THEN` / `SE…ENTÃO`) and state patterns (`WHILE` / `ENQUANTO`) are *made* for this material.
> Dependability requirements compose with ethics (`references/09-etica-sbc.md` — principle 2.9 "robust and
> secure systems") and traceability (`references/07-mudanca-rastreabilidade.md`); they do not bypass them.

---

## 1. The five dimensions of dependability (Sommerville Ch. 10)

Dependability is the umbrella property: the degree of trust a user justifiably places in a system. It is not one
`RNF` — it is a family, and you elicit each dimension separately because each is quantified differently.

| Dimension | The question it answers | Primary metric family |
|---|---|---|
| **Availability** | Is it up when I need it? | `AVAIL` (% uptime), MTTR |
| **Reliability** | Does it deliver correct service over time? | `POFOD`, `ROCOF`, `MTTF` |
| **Safety** | Can it cause physical/financial harm? | hazard severity × probability (risk) |
| **Security** (information) | Can it resist deliberate attack? | risk = asset value × exposure × threat |
| **Resilience** | Can it keep critical service *during/after* an attack or failure? | recognition/recovery time (4R, §6) |

> **Why they earn their own reference**: a system can be 100 % functionally complete and still fail every one
> of these. "It works on my machine" says nothing about *POFOD under load*, *what happens when an attacker is
> inside*, or *whether a wrong output can hurt someone*. Sommerville reorganized the whole of Part 2 of the 10e
> around exactly these — Ch. 10 dependable systems, Ch. 11 reliability, Ch. 12 safety, Ch. 13 information
> security, Ch. 14 resilience.

**Costs grow non-linearly.** Each extra "nine" of reliability (99 % → 99.9 % → 99.99 %) costs roughly an order
of magnitude more. So the requirement is an *economic* decision — over-specifying dependability is a real
failure mode, not just under-specifying it. Quantify the level the business actually needs, and no more.

---

## 2. Vocabulary you must keep straight (fault → error → failure)

Sommerville's causal chain — confusing these makes the requirement untestable:

- **Fault** — a latent defect in the system (a bug, a wrong config). May never be triggered.
- **Error** — an erroneous *internal state* reached when a fault is activated.
- **Failure** — externally observable *deviation* from the specified service. The user sees this one.

Reliability engineering attacks the chain in three ways, and a requirement can demand any of them: **fault
avoidance** (don't introduce it), **fault detection & removal** (find it before release), **fault tolerance**
(the system keeps delivering service *despite* the fault — §5). Naming which strategy an `RNF` targets makes it
verifiable: "fault-tolerant" ≠ "bug-free".

---

## 3. Reliability requirements — quantify or it is a wish (Sommerville §11.2)

This is where the §4.2 golden rule (NFR must be quantitative) has the most teeth. The four canonical metrics:

| Metric | Reads as | Use it when |
|---|---|---|
| **POFOD** — probability of failure on demand | "1 in N requests fails" (e.g. `POFOD = 0.001`) | The system is invoked **on demand** and a single failure is serious — protection/shutdown systems, payment authorization |
| **ROCOF** — rate of occurrence of failures | "X failures per unit of operation/time" (e.g. `ROCOF = 2/1000 transactions`) | The system runs **regular, frequent** transactions and you care about failure *frequency* |
| **MTTF** — mean time to failure | inverse of ROCOF — "avg. operating time before a failure" | Long-running sessions where uninterrupted operation matters |
| **AVAIL** — availability | "% of time the system is up and delivering service" (e.g. `0.9999`) | The system must be **there** when called — services, infrastructure |

> **Worked example — turning a wish into an `RNF`** (the move this reference exists to teach):
>
> ❌ *"The moderation queue must be reliable."* — a wish; nothing to test.
> ✅ `RNF-12` — *"The article-publishing service shall keep an availability of at least 99.95 % measured
> monthly (`AVAIL ≥ 0.9995`), with a probability of failure on demand below 1 in 1000 for the publish action
> (`POFOD < 0.001`)."* — now a tester can measure it and a `CA` can assert it.

**Reliability `RNF` are perfect EARS candidates** (`references/11-ears.md`): the *state* form for sustained
properties and the *undesired-behaviour* form for the failure path —

```
RNF-12  THE SYSTEM SHALL sustain AVAIL ≥ 0.9995 for the publish action, measured monthly.   (ubiquitous)
RNF-13  IF the primary datastore is unreachable
        THEN THE SYSTEM SHALL serve cached read-only content within 2 s and queue writes.    (IF…THEN)
```

> **Reliability vs. the platform you don't control.** Specify reliability of the *service you deliver*, and
> state the assumed reliability of dependencies (cloud SLA, third-party API) as an explicit `RNF` boundary —
> otherwise the number is unverifiable the first time a vendor has an outage.

---

## 4. Safety requirements — hazard-driven, often "shall NOT" (Sommerville §12.2)

Safety = freedom from circumstances that cause death, injury, or **financial/environmental** harm. It is **not**
the same as reliability: a system can be perfectly reliable and still unsafe (it reliably does the wrong, harmful
thing). Safety requirements are derived *backwards from hazards*, not forwards from features:

1. **Hazard identification** — what states of the system could lead to an accident? (e.g. *"two administrators
   demoting each other simultaneously, leaving zero admins"*; *"a dose computed above the safe ceiling"*).
2. **Hazard assessment** — severity × probability → risk; keep only the intolerable/ALARP ones.
3. **Hazard analysis** — trace each hazard to its root causes (e.g. fault-tree analysis, FTA — top hazard at the
   root, AND/OR-decomposed into contributing faults).
4. **Safety requirement** — a constraint that removes the hazard or controls its consequence.

Safety `RNF` are frequently **negative / defensive** — the EARS undesired-behaviour pattern is the natural form:

```
RNF-20  THE SYSTEM SHALL never allow the last active administrator of a workspace to be removed.   (invariant)
RNF-21  IF a computed value exceeds the configured safe ceiling
        THEN THE SYSTEM SHALL reject it, hold the last safe value, and raise an alert.              (IF…THEN)
```

> **Safety Integrity Level (SIL)** classifies how rigorously a function must be engineered (SIL 1–4 in IEC
> 61508). You will rarely set a formal SIL in a web product, but the *idea* — "match the engineering rigour to
> the harm a failure can cause" — is what justifies extra reviews/tests on the few truly dangerous features.
> A **safety case** (§12.4) is the documented argument that the system is acceptably safe; in this skill it
> lives as a dedicated section of the requirements document + the traceability matrix from hazard → `RNF` → test.

---

## 5. Information-security requirements — risk-driven (Sommerville §13.3)

> This section composes directly with the **`security-requirement-extraction`** skill (threat → requirement) and
> with ethics principle **1.6 Privacy** + **2.9 robust and secure systems**. Security requirements are derived
> from a **preliminary risk assessment**, never from a generic checklist bolted on at the end.

**The vocabulary (get it exact):** **asset** (something of value to protect) · **exposure** (possible loss/harm
to an asset) · **vulnerability** (a weakness that can be exploited) · **threat** (circumstance with potential to
cause loss) · **attack** (exploitation of a vulnerability) · **control** (protective measure that reduces
vulnerability).

**The risk-driven process** (Sommerville Fig. 13.5/13.7) — and it is the same four-beat as
`security-requirement-extraction`:

```
1. Asset identification     → what must be protected, and its value (the moderation DB, user PII, the audit log)
2. Exposure / threat assess.→ for each asset: who would attack it, how, and what is lost (Fig 13.7 threat table)
3. Control identification   → the measure that blocks/limits each threat (the "how to defend")
4. Security requirement     → the control, written as a testable RNF in business language
```

**Types of security `RNF`** to cover (a useful elicitation checklist — none of these are features, they are
constraints on every feature): **identification** · **authentication** · **authorization** · **immunity**
(resist malware/injection) · **integrity** (data not corrupted) · **intrusion detection** · **non-repudiation**
(actions provably attributable) · **privacy** (data minimization, consent, retention — `RNF` *and* an ethics
obligation).

**Elicit with misuse / abuse cases.** For every important use case, ask "how would an attacker bend this?" — the
*negative* of a user story. The result is again an EARS undesired-behaviour `RNF`:

```
RNF-30  THE SYSTEM SHALL store credentials only as Argon2id hashes (work factor ≥ 3).               (invariant)
RNF-31  WHILE an account is flagged for suspected compromise
        THE SYSTEM SHALL require step-up authentication for any state-changing action.              (WHILE/state)
RNF-32  IF the same credential fails authentication 5 times within 10 minutes
        THEN THE SYSTEM SHALL lock the account for 15 minutes and log the source.                   (IF…THEN)
```

> **Security requirements are mostly written as `SHALL NOT` / "the system prevents…"** — they constrain the
> *attacker's* space, not the user's happy path. That is exactly why they are missed by feature-first backlogs
> and why they need this risk-driven elicitation, not a post-hoc audit.

---

## 6. Resilience requirements — survive the breach (Sommerville Ch. 14)

Reliability/safety/security try to *prevent* failures and attacks. **Resilience assumes some will succeed
anyway** and asks: can the system keep delivering its *critical* services, and recover? Cyber-resilience is
specified along four R's (the "4R", Sommerville §14.x):

| R | Requirement asks | Example `RNF` shape |
|---|---|---|
| **Recognition** | How fast do we *detect* an attack/failure in progress? | "detect anomalous bulk-export within 60 s" |
| **Resistance** | What keeps running while under attack? | "core read service stays available during a credential-stuffing wave" |
| **Recovery** | How fast is critical service restored? | "restore moderation within 15 min (RTO); lose ≤ 5 min of data (RPO)" |
| **Reinstatement** | How do we return to *full* normal operation, safely? | "replay queued writes and verify integrity before re-enabling publish" |

Resilience is **sociotechnical** (§14.2): it includes people and process, not just code — incident runbooks,
on-call, the human who notices. So some resilience `RNF` trace to *organizational* NFRs (Sommerville's
organizational class, `SKILL.md §4.2`), not only product ones. **RTO/RPO** (recovery time/point objectives) are
the two most reusable quantitative handles — always elicit them for any critical service.

---

## 7. Redundancy & diversity — the cross-cutting technique

Both reliability and resilience lean on the same two mechanisms, and an `RNF` can demand them explicitly:

- **Redundancy** — spare capacity that takes over (replicas, failover, backups). Defends against *random*
  faults.
- **Diversity** — the redundant parts are *different* (different implementation, vendor, path), so a single
  flaw does not down them all. Defends against *systematic/common-mode* faults and shared vulnerabilities.

Redundancy without diversity gives you two copies of the same bug. State which one an `RNF` needs:
`"warm standby in a second availability zone"` (redundancy) vs. `"the fallback auth path shall not share the
primary's identity provider"` (diversity).

---

## 8. How to write these `RNF` in this skill (the integration)

Nothing new in the machinery — same spine, applied to dependability:

1. **Home** — these are `RNF`, so they live in `docs/requirements/` next to the functional `RF`
   (`references/10-estrutura-projeto.md`), grouped by Sommerville class (product / organizational / external).
2. **Quantitative** — every one carries a number and a *measurement method* (§4.2). "Secure" / "reliable" /
   "safe" alone are rejected at review (§9 anti-patterns).
3. **EARS for the hard cases** (`references/11-ears.md`) — sustained properties → ubiquitous/`WHILE`; failure &
   attack paths → `IF…THEN`. One `SHALL`/`DEVE` per statement → one `CA` group.
4. **Verified by `CA` + BDD** (`references/04-bdd-criterios-aceitacao.md`) — a reliability `RNF` becomes a load
   test asserting the metric; a security `RNF` becomes a misuse-case scenario; a safety `RNF` becomes a "must
   never" invariant test.
5. **Traceable** (`references/07-mudanca-rastreabilidade.md`) — hazard → `RNF` → control → test, both ways. For
   safety/security this trace **is** the safety/security case.
6. **Ethically gated** (`references/09-etica-sbc.md`) — principle **2.9**: *"when misuse or harm is foreseen or
   unavoidable, the best option may be to not implement the system."* A dependability analysis that concludes
   the risk cannot be controlled is a valid, required output — not a failure to deliver.

> **Worked `RNF` (product / external classes), business language + EARS body:**
>
> `RNF-40` (product · security) — *"User personal data is protected against unauthorized access."*
> body (EARS): `WHILE a session is unauthenticated THE SYSTEM SHALL expose no personal data field.`
> origin: risk assessment §5 (asset = PII; threat = scraping); ethics 1.6; *"LGPD"* Art. 46.
> verified by: `CA` "anonymous request to any PII endpoint returns 403" + misuse-case BDD.

---

## 9. Anti-patterns specific to dependability/security

1. **Qualitative dependability** — "must be reliable/secure/safe/fast". The §4.2 sin, fatal here. Always a
   metric + measurement method.
2. **Security as a feature list bolted on at the end** — "add OAuth, add a firewall". Security is a *constraint
   on every feature*, derived from a risk assessment (§5), not a sprint of its own at the end.
3. **Safety without hazard analysis** — writing "the system shall be safe" without ever enumerating the
   hazards. No hazard list → the safety `RNF` are guesses.
4. **Confusing reliability with safety** — a reliable system that reliably does a harmful thing is *unsafe*.
   They are elicited separately.
5. **Prevention-only, no resilience** — assuming controls never fail. Always elicit recognition/recovery
   (RTO/RPO) for critical services — breaches happen.
6. **Redundancy without diversity** — "two replicas" that share the same bug/vulnerability/IdP. State the
   diversity explicitly when common-mode failure is the risk.
7. **Over-specifying nines** — demanding 99.999 % where the business needs 99.9 %. Each nine is ~10× the cost;
   dependability is an economic requirement, not a maximization.
8. **Privacy treated only as security** — data minimization/consent/retention are *also* an ethics + legal
   obligation (1.6, *"LGPD"*), not just an access-control `RNF`.

---

## 10. Elicitation checklist (per critical service / asset)

- [ ] **Which dimensions apply?** (availability / reliability / safety / security / resilience — not all do)
- [ ] **Reliability**: chosen metric (`POFOD`/`ROCOF`/`MTTF`/`AVAIL`) + target value + **measurement method**
- [ ] **Safety**: hazards enumerated → assessed (severity×probability) → each intolerable hazard has a `RNF`
- [ ] **Security**: assets identified + valued → threats/exposure per asset → control → `RNF` (risk-driven, §5)
- [ ] **Security types covered**: authn · authz · integrity · immunity · intrusion detection · non-repudiation · privacy
- [ ] **Resilience**: recognition time + **RTO/RPO** for each critical service; reinstatement procedure
- [ ] **Redundancy/diversity** stated where common-mode failure or shared vulnerability is a risk
- [ ] Every dependability `RNF` is **quantitative**, in **business language**, optionally **EARS**, with a `CA`
- [ ] **Ethics gate** applied (2.9): is there a foreseen harm that argues for *not* building it as specified?
- [ ] Each safety/security `RNF` is **traceable** hazard/threat → `RNF` → control → test (the safety/security case)

Failed ≥1 on a critical service → the dependability spec is incomplete. Return to risk assessment.

---

*Sources: Sommerville 10e, Part 2 — Ch. 10 (Dependable systems), §11.2 (Reliability requirements & metrics:
POFOD/ROCOF/MTTF/AVAIL), §12.2 (Safety requirements; hazard-driven derivation, SIL, safety cases §12.4), §13.3
(Security requirements; risk-driven process, Fig. 13.5/13.7 — asset/exposure/threat/control), Ch. 14
(Resilience engineering: §14.1 cybersecurity, §14.2 sociotechnical resilience, §14.3 resilient system design —
the 4R). Cross-referenced with Wiegers & Beatty Ch. 14 (quality attributes) and the `security-requirement-extraction`
threat→requirement process. Integrated as a **depth layer** for `RNF`, consistent with this skill's
quantitative, business-language-first, traceable conventions — it adds rigour to §4.2, it does not replace it.*
