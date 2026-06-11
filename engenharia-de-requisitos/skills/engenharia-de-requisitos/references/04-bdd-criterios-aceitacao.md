# 04 — Acceptance Criteria + BDD

> How to make requirements **testable**. Combines LECTURE 08 (declarative AC style *"IFPB"*), LECTURE 09 (AC + BDD integration in OpenProject), and BDD methodology (Dan North, Liz Keogh, Aslak Hellesøy). **AC is the per-feature invariant; BDD is the executable per-User-Story scenario.** Use both, do not choose one.

---

## 1. Why ACs + BDD are COMPLEMENTARY layers

There is recurring confusion between "AC is Gherkin" and "Gherkin replaces AC". They serve different purposes:

| | Acceptance Criterion (AC) | BDD (Gherkin) |
|---|---|---|
| **Level** | Feature | User Story |
| **Form** | Declarative imperative sentence | Given/When/Then scenario |
| **What it defines** | Invariant / business rule | Concrete user-system interaction |
| **Audience** | PO + analyst + dev + QA | Whole team + executable as a test |
| **Tool** | Numbered list of rules | Cucumber, Behat, SpecFlow, Behave, RSpec |
| **Example (health)** | "CA02: Password must have 8+ chars, 1 uppercase, 1 number" | "GIVEN the user is on the registration screen / WHEN they type the password 'abc123' / THEN the system shows a weak-password error" |

**Typical mapping**:

```
FEATURE                                       ← groups rules
  ├─ DESCRIPTION (business-language paragraph) ← deliverable to the client
  ├─ CA01: rule A                              ← testable invariants
  ├─ CA02: rule B
  ├─ CA03: rule C
  └─ USER STORY (one-sprint slice)
       ├─ Short descriptive title              ← "US Listagem básica de atletas"
       ├─ DESCRIPTION = BDD                    ← Given/When/Then scenarios
       │     ├─ Scenario 1 — exercises CA01 + CA02
       │     ├─ Scenario 2 — exercises CA02 + CA03
       │     └─ Scenario 3 — error flow
       └─ Related to: ACs (traceability)       ← list of covered ACs
```

**Hard rule** (see SKILL.md): **Feature has a description, NEVER BDD. User Story has BDD, always.** The Feature description is "what we will deliver to the client, in one business sentence"; the User Story BDD is "how the user will exercise it in a concrete scenario".

ACs are **rules** (list of invariants per feature); BDDs are **scenarios** (event sequence per user story). You need both for coverage.

---

## 2. Acceptance Criteria (ACs)

### 2.1 *"IFPB"* definition (LECTURE 08)

> **Conditions for a Feature to be considered finished/accepted.**

They are specified **PER FEATURE** (non-negotiable rule from the course). Without ACs, the feature is a wish, not a requirement. The User Story **inherits the ACs through traceability** ("Related to: CA01, CA03, CA07" field) — it has no ACs of its own; what it has is the BDD of the concrete scenario that exercises the ACs inherited from the parent Feature.

> The "ACs per user story" confusion shows up in introductory material because, in Jira/Trello, people tend to glue ACs onto the US card for operational convenience. **In the formal *"IFPB"* hierarchy followed here, ACs belong to the Feature**; the US only references them.

### 2.2 Declarative style (*"IFPB"* model)

Each AC is an imperative sentence describing a testable rule or condition. **It does not use Gherkin** — it is prescriptive free text.

```
CA01 - Only authorized users may access the Consulta GERAL de
       ATLETAS feature.

CA02 - The query shall display only the athletes of the sports
       FEDERAÇÕES the user has access to in their profile.

CA03 - The query screen shall contain the fields and layout
       defined in the prototype.

CA04 - The query shall be performed taking into account the
       filter options informed by the user.

CA05 - The CPF field is not mandatory. But if filled, must be in
       the format XXX.XXX.XXX-XX. If the CPF is invalid, emit
       an error message.

CA13 - The general athlete listing shall be displayed in
       alphabetical order by default.

CA14 - The general athlete listing may be re-sorted by clicking
       the column headers.

CA14 - The general athlete listing shall be paginated with the
       options 10, 50, 100, or all.

CA15 - The general athlete listing shall display all athletes
       by default.
```

### 2.3 Decomposing complex ACs (*"IFPB"* model)

When an AC groups multiple sub-rules, expand into sub-bullets in the detail field. Example CA09:

```
CA09 - The FEDERAÇÃO combobox must apply the fill-in and
       validation rules as detailed:

       Rules to be applied:
       • The FEDERAÇÃO combobox shall only be enabled if a
         CONFEDERAÇÃO is selected
       • Shall display only ACTIVE Federações
       • In ALPHABETICAL order
       • Shall display only the Federações the logged-in user
         is associated with in their access profile
       • Shall allow partial-text search while typing
```

### 2.4 AC best practices

| ✅ Do | ❌ Avoid |
|---|---|
| Imperative language ("shall", "must not") | Vague language ("would be nice", "preferably") |
| Testable verbs ("display", "validate", "reject") | Qualitative adjectives without metric ("friendly", "fast") |
| One rule per AC (atomic) | Multiple rules mixed |
| Stable numbering (CA01..CA20) | Renumber on every change |
| Link AC to feature explicitly | Orphan AC with no parent feature |
| Version (AC does not change silently) | Edit AC without history |

### 2.5 `[...]` convention — AC with sub-rules (hard rule)

When an AC needs sub-rules to be fully testable, **end the title with `[...]`** and detail in the item body (the "description" field in OpenProject), opening with `Rules to be applied:` followed by bullets.

**Why it exists**: whoever reads the backlog in **list mode** (OpenProject's default view, with 50+ items on screen) must decide in 1 second whether that AC is self-sufficient or requires a click. The `[...]` signals this unambiguously.

#### Concrete example (real case from the *"IFPB"* course)

**Title on the card** (visible in list mode):

```
CA09 - The FEDERAÇÃO combobox must apply the fill-in and validation rules as detailed [...]
```

**Description (item body, read on opening)**:

```
Rules to be applied:
- The FEDERAÇÃO combobox shall only be enabled if a CONFEDERAÇÃO is selected.
- Shall display only ACTIVE Federações.
- In ALPHABETICAL order.
- Shall display only the Federações the logged-in user is associated with in their access profile.
- Shall allow partial-text search while typing.
```

**Contrast — self-sufficient AC (without `[...]`)**:

```
CA05 - The CPF field is not mandatory. But if filled, must be in the format XXX.XXX.XXX-XX. If the CPF is invalid, emit an error message.
```

It does not need `[...]` because the title already contains everything required to test.

#### When to use `[...]`

| Situation | Use `[...]`? |
|---|---|
| AC with 1 self-sufficient rule (complete title) | No |
| AC whose title would exceed ~250 characters if self-sufficient | Yes |
| AC with 3+ parallel sub-rules (list format in the body) | Yes |
| AC inheriting conditional behaviour ("Only active if X was selected") with several conditions | Yes |
| AC with a single rule, but with a side note (e.g.: "except on weekends") | No — put the exception in the title itself |

#### Anti-pattern: `[...]` without detail

Title ends with `[...]` but the body is empty or only repeats the title. **Always detail** with at least 2 bullets under "Rules to be applied:". If you have nothing to detail, remove the `[...]`.

#### Always grouped: `CA - <Theme>` grouper convention

ACs always live inside a `CA - <Theme>` grouper, even when the Feature has a single AC. The grouper is an OpenProject item of type "Acceptance Criterion" without `[...]`, without an ID (`CANN`), only with a descriptive title (`CA - Access and visibility`). The specific ACs (`CA01`, `CA02`, …) live as children of the grouper. Detail in [05-convencoes-interpop.md](05-convencoes-interpop.md) and worked example in [examples/template-backlog-openproject.md](../examples/template-backlog-openproject.md) §4.

---

### 2.6 Frequent AC mistakes (with examples)

```
❌ AC: "The query must be fast."
✅ AC: "The query must return a result in ≤2s for up to 10k records
       and ≤5s for up to 100k."

❌ AC: "System must accept CPF."
✅ AC: "The CPF field must accept the format XXX.XXX.XXX-XX. If
       invalid, display 'Invalid CPF' next to the field, in red."

❌ AC: "User can log in with email or username and encrypted
       password via OAuth and password must be at least 8
       characters or use 2FA."
✅ CA1: "User must log in with email + password."
   CA2: "Password must have ≥8 chars, ≥1 uppercase, ≥1 number."
   CA3: "After 3 invalid attempts, account locked for 15min."
   CA4: "User can enable 2FA via TOTP app."
```

---

## 3. BDD — Behaviour-Driven Development

### 3.1 Origin and purpose

- **2003 — Dan North** coins BDD in the article *"Introducing BDD"*
- **2006–2008 — Aslak Hellesøy** develops **Cucumber**
- **2010+ — Liz Keogh, Gojko Adzic** formalize Specification by Example

**North's central idea**: TDD works, but the name "test" confuses the client. **Rename "test" to "behaviour"** and use domain language. BDD is not testing — it is **executable conversation**.

### 3.2 The 3 pillars of BDD

1. **Outside-In** — start from the expected behaviour (user view) and descend to implementation
2. **Three Amigos** — PO (business) + Dev (implementation) + QA (testing) discuss **TOGETHER** each scenario BEFORE coding
3. **Ubiquitous Language** — shared vocabulary across all (same term means the same thing in conversation, code, and test)

### 3.3 BDD cycle (Discovery → Formulation → Automation)

```
1. DISCOVERY (Three Amigos)
   ↓ "Let's discover the behaviour together"
   Result: list of scenarios in natural language

2. FORMULATION (Gherkin)
   ↓ "Let's formulate each scenario with Given/When/Then"
   Result: versioned .feature file

3. AUTOMATION (step definitions)
   ↓ "Let's automate the verification"
   Result: scenario executable as a test
```

**Common mistake**: skipping Discovery and going straight to Gherkin. Result: technical scenarios that do not reflect the real domain behaviour.

### 3.4 Gherkin (localized syntax — English vs. pt-BR)

| English | pt-BR | Meaning |
|---|---|---|
| `Feature` | `Funcionalidade` | Header |
| `Scenario` | `Cenário` | Specific case |
| `Given` | `Dado` or `DADO` | Pre-condition (initial state) |
| `When` | `Quando` or `QUANDO` | Event (user/system action) |
| `Then` | `Então` or `ENTÃO` | Expected result |
| `And` | `E` | Conjunction (of any clause) |
| `But` | `Mas` | Expected negation |
| `Background` | `Contexto` | Pre-conditions common to all scenarios |
| `Scenario Outline` | `Esquema do Cenário` | Parameterized scenario |
| `Examples` | `Exemplos` | Data table for the outline |

> **Why bilingual**: this skill keeps both Gherkin dialects because real *"Interpop"*, *"SIRA"*, and *"Controle de Dopagem"* `.feature` files use pt-BR keywords (PO and stakeholders speak Portuguese). Cucumber, Behave, SpecFlow, and Behat support both natively via the `# language: pt` header.

### 3.5 Concrete example (verbatim from *"IFPB"* course LECTURE 09)

```gherkin
Funcionalidade: Listagem básica de atletas

  Cenário: Acesso autorizado exibe listagem básica
    DADO que o usuário esteja logado na aplicação e tenha permissão de acesso
    QUANDO acessar o menu administrativo > ATLETAS
    ENTÃO deve-se exibir a relação básica de atletas
```

> Kept in pt-BR as a historical artifact of the *"IFPB"* course material. For an en-CA equivalent, see §3.6 below.

> **Watch out for a terminological false friend**: the keyword `Funcionalidade:` (Gherkin pt-BR, translates `Feature:` in English) **is NOT the same Feature as in our backlog hierarchy**. In Gherkin, `Funcionalidade:` is just the **header of a `.feature` file** — and each `.feature` file typically corresponds to **one User Story** of our hierarchy (or at most a cohesive slice of one). Do not try to map `Funcionalidade:` 1-to-1 with the OpenProject Feature; the granularity is different.

This scenario implements **simultaneously** CA01 (authorized access), CA02 (implicit federation filter), CA03 (prototype layout), CA13 (default alphabetical order), CA15 (display all by default).

### 3.6 More examples (broad coverage — en-CA)

```gherkin
Feature: CPF validation in athlete registration

  Background:
    Given the user is on the athlete-registration screen
    And is logged in as admin

  Scenario: Valid CPF is accepted
    When the CPF field is filled with "111.222.333-44"
    And the Save button is clicked
    Then the athlete shall be successfully registered

  Scenario: Invalid CPF is rejected
    When the CPF field is filled with "123.456.789-00"
    And the Save button is clicked
    Then the system displays the message "Invalid CPF"
    And the athlete is NOT registered

  Scenario Outline: Format validation
    When the CPF field is filled with "<input>"
    Then the system displays "<message>"

    Examples:
      | input              | message                           |
      | 111.222.333-44     |                                   |
      | 123                | CPF must be in the format         |
      | abc.def.ghi-jk     | CPF must contain only digits      |
      |                    |                                   |
```

### 3.7 When BDD becomes an automated test

Each Gherkin scenario has **step definitions** that actually execute:

```ruby
# Ruby + Cucumber (pt-BR steps — they map to the LECTURE 09 example)
Dado('que o usuário esteja logado na aplicação e tenha permissão de acesso') do
  @user = create(:user, role: 'admin')
  login_as(@user)
end

Quando('acessar o menu administrativo > ATLETAS') do
  visit '/admin/atletas'
end

Então('deve-se exibir a relação básica de atletas') do
  expect(page).to have_css('.lista-atletas')
  expect(page).to have_content(@user.federacao.atletas.first.nome)
end
```

```python
# Python + Behave (pt-BR steps)
@given('que o usuário esteja logado na aplicação e tenha permissão de acesso')
def step_impl(context):
    context.user = create_user(role='admin')
    login_as(context, context.user)
```

```typescript
// TypeScript + Cucumber.js (pt-BR steps)
Given('que o usuário esteja logado na aplicação e tenha permissão de acesso', async function() {
  this.user = await createUser({ role: 'admin' });
  await loginAs(this.user);
});
```

### 3.8 Three types of "step"

- `Given/Dado` — **state** (no action, no verification)
- `When/Quando` — **action** (no verification)
- `Then/Então` — **verification** (no state mutation)

**Common mistake**: mixing action and verification. `When the user registers and the system displays success` — two things, split them.

### 3.9 BDD in pt-BR — advantages in Brazil

The golden rule is **speak the business language**. If the PO and stakeholders speak Portuguese, **write the scenarios in Portuguese**. Cucumber, Behave, SpecFlow, and Behat support localized Gherkin natively.

```yaml
# .feature file with language header
# language: pt
Funcionalidade: ...
  Cenário: ...
    Dado ...
    Quando ...
    Então ...
```

For en-CA projects, drop the `# language: pt` header (English is the default) and use `Feature:`/`Scenario:`/`Given/When/Then`.

---

## 4. Where BDD fits in the process (*"IFPB"* course)

```
ELICITATION
     ↓
SPECIFICATION
     │
     ├─ Epic
     │   ↓
     │   Feature
     │      │
     │      ├─ Feature DESCRIPTION ◄────── business-language paragraph (client-deliverable)
     │      ├─ ACs (declarative rules, invariants)
     │      └─ User Stories (sprint slicing)
     │           │
     │           ├─ Short descriptive title
     │           ├─ US DESCRIPTION = BDD ◄── BDD goes HERE (Given/When/Then scenarios)
     │           └─ Relations = associated ACs (traceability)
     │
VALIDATION
     ↓
BDD EXECUTION (living tests during validation) ◄────── BDD becomes a test HERE
```

**Position of BDD**: bridge between **Specification** and **Validation**. In specification, it is the form for describing the behaviour of the **User Story** (never of the Feature — Feature has a prose description, not a scenario). In validation, it becomes an executable test that confirms the code delivers the behaviour.

---

## 5. Three Amigos — the key practice NOT to skip

Before writing any line of Gherkin, **get the 3 roles together**:

| Role | Question they ask |
|---|---|
| **PO / business** | "Is this what the client needs?" |
| **Dev** | "Is it implementable? Which APIs/data do I need?" |
| **QA** | "How will I test? Which edge cases? Which error scenarios?" |

**Typical duration**: 30–60min per feature. **Result**: list of scenarios (happy + sad + edge cases) that enter the .feature.

**Anti-pattern**: dev writes Gherkin alone. Result: scenarios covering implementation, not behaviour. They break on every refactor.

---

## 6. BDD scenario-quality criteria (Liz Keogh)

A good scenario is:

- **Concrete** — uses real values ("CAD $100", "joao@email.com"), not placeholders ("an amount", "an email")
- **Short** — 3–7 steps. More than that, split into multiple scenarios
- **Focused on ONE behaviour** — does not test 3 things in the same scenario
- **Independent of implementation** — talks in domain terms ("user registers athlete"), not UI ("user clicks the blue button")
- **Deterministic** — same Given+When → always the same Then (no `Date.now()`, no random)
- **Non-coupling** — Given of one scenario does NOT depend on execution of another

---

## 7. Frequent anti-patterns in ACs and BDD

### 7.1 AC and BDD competing (writing only one)

```
❌ "I use only ACs. BDD is overengineering."
   → You lose executability. The system is validated by manual reading.
     In 6 months nobody remembers which AC was actually implemented.

❌ "I use only BDD. ACs are redundant."
   → You lose the per-feature invariant. Each new US knows only its
     scenarios, not the general rules. Silent conflicts between US.
```

### 7.2 BDD coupled to the UI

```
❌ GIVEN I am on the /login page
   WHEN I click the #submit-btn button
   THEN I see element .error with text "fail"

✅ GIVEN I am an unregistered user
   WHEN I try to log in with email "x@y.com" and password "wrong"
   THEN the system rejects the login with an "invalid credentials" message
```

### 7.3 Dev writes Gherkin alone

PO/QA do not review → scenarios cover implementation, not behaviour → refactor breaks 30 scenarios per trivial change.

### 7.4 Qualitative AC without metric

```
❌ "System must have good performance."
✅ "Endpoint POST /atletas must respond in ≤500ms (p95) with payload
   of up to 10kB."
```

### 7.5 BDD became regression test without review

Scenarios pile up; nobody reviews. Suite runs in 45min; nobody looks at the result. **Scenario without owner = executable garbage.**

### 7.6 Expecting BDD to replace unit testing

BDD = **end-to-end or subsystem behaviour**. Internal logic still needs fast unit tests. The test pyramid still holds: many unit, some integration, few BDD.

### 7.7 Feature with BDD instead of description (critical anti-pattern)

```
❌ Feature: Ban Hierarchy
   GIVEN the user is admin
   WHEN they try to ban another admin
   THEN the system rejects with HTTP 400
```

Granularity mistake: BDD belongs to the **User Story** (concrete scenario, one-sprint slice), not to the Feature (overall deliverable). When you paste BDD straight into the Feature, three things break:

1. **No prose description** — non-technical stakeholders cannot read "GIVEN/WHEN/THEN" on the card without training. You lose the conversational document.
2. **ACs become orphans** — without the "umbrella" of the description, ACs become a list of rules without a narrative to justify them.
3. **Sprint Planning stalls** — devs cannot slice the Feature into US because it arrives as a single scenario; or they create fake US that repeat the Feature BDD.

```
✅ Feature: Ban Hierarchy
   Description: Defines who can ban and unban whom within the editorial
   team. Implements the dev > admin > editor > user hierarchy...
   [business paragraph]

   CA01: Dev is immune to banning by any other user.
   CA02: Admin can only be banned by dev.
   ...

   US 1: Apply hierarchy in the model
     GIVEN system with users of distinct roles
     WHEN user.can_be_banned_by(actor) is called
     THEN the result follows the CA01..CA04 matrix
     Related to: CA01, CA02, CA03, CA04

   US 2: Apply hierarchy in the ban endpoint
     GIVEN authenticated admin and target is also admin
     WHEN they try to create a ban
     THEN system returns HTTP 400
     Related to: CA02, CA06
```

Multiple scenarios per User Story, prose description for the Feature, ACs in between as invariants. Each artifact at its proper level.

---

## 8. When NOT to use BDD

- **Project without engaged PO/client** — without Three Amigos, BDD becomes mandatory (and bad) Gherkin
- **Team does not know the syntax** + no time to train — free text is better than wrong Gherkin
- **Stack without adequate support** — some old JS frameworks make step definitions costly
- **Very small team (1 dev)** — Gherkin overhead > shared-scenario value. Use only declarative ACs
- **Internal system rarely changed** — BDD investment does not pay off

**In any of these cases, the declarative *"IFPB"* AC (without Gherkin) still applies.** Do not trade ACs away.

---

## 9. Connection with the next references

- **How to estimate US with ACs+BDD ready**: [05-estimativa.md](05-estimativa.md)
- **How to validate (review ACs + prototype + Gherkin)**: [06-validacao.md](06-validacao.md)
- **AC → BDD → code → test traceability**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
- **EARS — optional precise phrasing that feeds BDD** (`WHEN/QUANDO … THE SYSTEM SHALL/O SISTEMA DEVE …`): [11-ears.md](11-ears.md)
