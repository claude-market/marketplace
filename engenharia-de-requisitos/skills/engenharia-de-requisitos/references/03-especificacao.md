# 03 — Requirements Specification (Backlog, Epic → Feature → User Story → Task)

> How to document discovered requirements. Combines LECTURES 07-09 *"IFPB"* + Sommerville 4.4. Focus on the hierarchical agile model — backlog structured into Epic, Feature, User Story, Acceptance Criterion, Task, Bug, Improvement. User Stories integrated with BDD (see [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md)).

---

## 1. Purpose of the specification (Pfleeger 2004)

The specification serves two purposes:

1. **Basis of understanding and agreement between clients and developers** on what the system must do
2. **Guide for the developers** in the remaining stages (design, implementation, testing)

Without a clear specification, the project becomes a "telephone game": client wants X, dev understands Y, delivers Z.

---

## 2. Notations for writing requirements (Sommerville Fig 4.11)

| Notation | Description |
|---|---|
| **Natural language** | Numbered sentences; each sentence = 1 requirement |
| **Structured natural language** | Template/form; each field reports one aspect |
| **Graphical notations** | UML (use cases, sequence) + textual annotations |
| **Mathematical specifications** | Finite state machines, sets. Unambiguous, but most clients do not understand |

**Practical rule**: **user** requirements always in natural language + simple diagrams. **System** requirements may use structured/UML/mathematical depending on criticality.

### 2.1 Natural-language guidelines (Sommerville 4.4.1)

1. **Standard format** for all definitions (reduces omissions, eases checking). Use 1–2 sentences per requirement
2. **Consistent wording** to distinguish mandatory (`shall`) from desirable (`may`)
3. **Text highlighting** (bold, italics) for important parts
4. **Do not assume** the reader understands technical jargon (avoid "architecture", "module"; explain acronyms)
5. **Associate rationale** with each requirement (why it exists, who proposed it) — useful when it changes

### 2.2 Structured natural language (VOLERE template — Robertson & Robertson)

Each requirement on a **card** with fields:

- Function
- Description
- Inputs + source
- Outputs + destination
- Action
- Requires (dependencies)
- Pre-condition
- Post-condition
- Side effects
- **Rationale** (why it exists)

Reduces variability and organizes better. Use when complex computations must be specified.

---

## 3. The requirements document (IEEE 830 structure, Sommerville Fig 4.17)

| Chapter | Description |
|---|---|
| Preface | Target audience + version history + changes |
| Introduction | System need; vision of functions; fit with business objectives |
| Glossary | Defined technical terms (without presupposing expertise) |
| User-requirements definition | User-facing services + system NFRs + standards to follow |
| System architecture | High-level view + reused components |
| System-requirements specification | Detailed FRs + NFRs + interfaces |
| System models | Graphical models (object, flow, data) |
| System evolution | Fundamental assumptions + planned changes |
| Appendices | Hardware, DB, specific constraints |
| Index | Alphabetical + diagrams + functions |

**Use when**: complex system, outsourced, regulated, long lifespan. In an internal/agile SaaS product, a smaller document + a living backlog in Jira/OpenProject.

---

## 4. The Backlog (agile model)

### 4.1 Definition (LECTURE 07)

> A **prioritized**, **dynamic**, **evolutionary** list of everything that must be developed in the product.

The primary mechanism for planning and organization in agile development. **Strategic artifact** — it translates the product vision into concrete items.

### 4.2 Origins (cross-framework)

| Framework | Name / particularity |
|---|---|
| **Scrum** | Product Backlog (the primary concept comes from here) |
| **XP** | User stories + technical tasks |
| **Kanban** | "To do" column as a queue of uninitiated items |
| **Lean** | Work queue prioritized by value |

**Three invariants across all frameworks**: centralizes work · evolves continuously · enables prioritization by value.

### 4.3 Purposes (LECTURE 07)

1. **Organize visibly and transparently** — stakeholders see what is planned
2. **Prioritize by value** — greater impact on the user appears first
3. **Continuous communication** between team and stakeholders — living feedback mechanism
4. **Support incremental development** — each sprint consumes a refined portion

### 4.4 Typical elements

- **Features** — desired by the user
- **Technical requirements** — identified by the team (tech debt, refactor, infra)
- **Improvements** — complementary
- **Defects / Bugs** — to fix
- **Non-functional requirements** — performance, security, availability, usability
- **Exploratory items (spikes)** — investigation to reduce uncertainty

---

## 5. Backlog hierarchy (*"IFPB"* / OpenProject model)

```
📄 Requirements Document (SOURCE OF TRUTH — always check before touching the backlog)
    │
    ▼
PROJECT (= repository/context in OpenProject — NOT an EPIC)
    │
    ├─ ROOT EPIC #1                       ← one front of the project
    │   ├─ EPIC (sub-epic)                ← decomposition in several levels if needed
    │   │   └─ EPIC (sub-sub-epic)        ← IFPB Doping example reaches 4 levels
    │   └─ FEATURE                        ← deliverable feature (across several sprints)
    │        ├─ Business-language description  ← paragraph read by non-technical stakeholder
    │        ├─ AC group "CA - <Theme A>"       ← ACs always grouped under a theme
    │        │    ├─ CA01 - self-sufficient rule
    │        │    ├─ CA02 - self-sufficient rule
    │        │    └─ CA03 - rule with sub-rules [...]   ← [...] convention for sub-detail
    │        ├─ AC group "CA - <Theme B>"
    │        │    └─ CA04 - ...
    │        └─ USER STORY                ← increment that fits in ONE sprint
    │             ├─ BDD                  ← Given/When/Then in the US Description field
    │             ├─ Associated ACs       ← relations (traceability)
    │             └─ TASK                 ← smallest unit of work (technical terms OK)
    │
    ├─ ROOT EPIC #2                       ← another front of the project (sibling)
    │   └─ ... (own sub-hierarchy)
    │
    └─ ROOT EPIC #N                       ← other fronts (siblings)
        └─ ...
```

> **Rule zero**: the requirements document is the source of truth. Before touching any Epic/Feature/AC of the backlog, **check whether the document has changed**. Detail in [SKILL.md §2.1](../SKILL.md) and [05-convencoes-interpop.md §2 Rule 0](05-convencoes-interpop.md).

> **Rule of multiple root Epics**: a project may (and almost always does) have **several Epics at the top level, siblings to each other**, without a single "project-Epic" as the parent. Each root Epic is an independent front (platform, operational area, cross-cutting module). Example *"Controle de Dopagem"*: `EPIC APLICAÇÃO WEB` + `EPIC APLICAÇÃO MOBILE` + `EPIC ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO` (three siblings). Detail in [`examples/template-backlog-openproject.md §3`](../examples/template-backlog-openproject.md).

> **Critical anti-pattern**: putting BDD in the Feature instead of the User Story. Detail and ❌/✅ examples in [04-bdd-criterios-aceitacao.md §7.7](04-bdd-criterios-aceitacao.md).

### 5.1 Precise definitions

#### 5.1.1 **Requirements-document** artifacts (source of truth)

| Type | Definition | Size |
|---|---|---|
| **FR — Functional Requirement (`RF`)** | What the system **must do**. Input, rule, output. Has a stable ID (`RF-NN`), business-language description, `Source` (stakeholder), `Priority`, and `Validation`. No technical terms in the title or description (endpoint/lib only in the Task). | Several per document |
| **NFR — Non-Functional Requirement (`RNF`)** | **Constraint** on how the system functions: performance, security, accessibility, compliance, organizational. Always **quantified with a metric** + `How to verify`. Same field structure as the FR. | Several per document |
| **G — Business Rule** | Constraint from the **domain** (regulation, editorial policy, *"WADA"* regulation, *"LGPD"*). It is neither FR nor NFR — it is a business invariant the system must respect. Has ID `G-NN`. | Several per document |

#### 5.1.2 **Backlog** artifacts (incremental materialization of requirements)

| Type | Definition | Size |
|---|---|---|
| **Epic** | Product, sub-product, grouping, module, macro-feature. May have nested sub-Epics. **Has a business-language description.** Each Epic references the source FR/NFR/G via the `Origin (requirements)` field. | Several features |
| **Feature** | Product/module feature to be delivered to the client. **Has a business-language description.** Usually delivered after several sprints. NEVER has BDD. References the source FR/NFR. | Several US |
| **AC group (`CA - <Theme>`)** | Grouper of Acceptance Criteria by theme. **Always mandatory**, even for a Feature with a single AC. In OpenProject, an item of type "Acceptance Criterion" without an ID `CANN`, only a descriptive title. | Several ACs |
| **Acceptance Criterion (AC — `CA`)** | Conditions (rules) for the feature to be considered **finished / accepted**. Declarative sentence in business language. **`[...]` convention at the end of the title** when it has sub-rules (detail in the item body, opening with `Rules to be applied:`). | Several per feature |
| **User Story (US)** | Functional increment developed to deliver **part of a feature**. **Must start and end within ONE sprint**. **Has BDD in the Description field itself** (`Given/When/Then` scenarios) + ACs inherited via traceability. | Several tasks |
| **Task** | Smallest unit of work to implement a US (actions). Technical terms ALLOWED here. | **The smaller, the better** |
| **Bug** | Problem to fix. Has a description. | Atomic |
| **Improvement** | Enhancement of an existing feature. Has a description. | Atomic |
| **Spike** | **Investigative/exploratory** time-boxed item to reduce uncertainty before estimating/starting a US. Ends with an artifact (report, PoC, ADR) and closes — does not deliver a feature on its own. LECTURE 07 *"IFPB"*. | Time-boxed (1–3 days) |

> **Document ↔ backlog relationship**: an FR/NFR generates **one or several Features**; a Feature implements **one or several FR/NFR**. Traceability lives in the `Origin (requirements)` field of each Epic/Feature/AC (pointing to the `RF-NN`/`RNF-NN`/`G-NN` IDs of the document) — and in the `Revision history` field of the document (every change in the document indicates the impact on the backlog). Without this bidirectional bridge, it is **silent scope creep**.

> **Spike — when to use**: "I can't estimate this US because I don't know whether lib X holds this load" → becomes `SPIKE: validate throughput of lib X with dataset N (3 days)`. Do not confuse with US: a spike **investigates**; a US **delivers value to the client**. The spike result feeds refinement of the real US in the next round.

> **Derived hard rule**: ALL artifacts (Epic, Feature, US, AC, NFR, Bug, Improvement) **have descriptions in business language**. Detail in [05-convencoes-interpop.md §2 Rule 8](05-convencoes-interpop.md). Worked templates in [examples/template-backlog-openproject.md](../examples/template-backlog-openproject.md) and [examples/template-documento-requisitos.md](../examples/template-documento-requisitos.md).

### 5.2 Concrete example (*"IFPB Controle de Dopagem"*, LECTURE 07)

```
EPIC   APLICAÇÃO WEB
  EPIC   Módulo ADMINISTRATIVO
    EPIC   Gestão de ATLETAS
      EPIC   CADASTRO de Atletas
        FEATURE  Cadastro Básico com dados pessoais
        FEATURE  Categorias Esportivas do Atleta
        FEATURE  Patrocinadores do Atleta
        FEATURE  Técnico do Atleta
        FEATURE  Bolsa Atleta recebidas
        FEATURE  Equipe Médica associada ao Atleta
        FEATURE  Convocações para Seleção Nacional
        FEATURE  Participação em Programas Especiais
        FEATURE  Clubes/Associações do Atleta
        FEATURE  Resultados em Competições
      EPIC   CONSULTA de Atletas
        FEATURE  Consulta GERAL de Atletas
        FEATURE  Extrato INDIVIDUAL de um ATLETA (Prontuário Esportivo)
      EPIC   RELATÓRIO de Atletas
        FEATURE  Relação GERAL de ATLETAS
        FEATURE  Relação de Atletas por Confederação
```

**Note**: deep hierarchy (5+ Epic levels) is normal for large systems. In a small SaaS, 2–3 levels suffice. Item titles kept in pt-BR because they are the actual identifiers used in the original *"IFPB"* project — translating would break traceability with OpenProject and existing documentation.

---

## 6. User Stories (US)

### 6.1 Full history (LECTURE 09)

- **1997 — Kent Beck** introduces "user stories" in the Chrysler C3 project (Detroit) — "playing pieces in planning"
- **1998 — Alistair Cockburn**: *"A user story is a promise of a conversation"*
- **1999 — Beck publishes** Extreme Programming Explained
- **2001 — Ron Jeffries**: **3 Cs** (Card, Conversation, Confirmation)
- **2001 — Connextra XP team (London)** conceives the classical format: `As [persona], I want [feature] so that [benefit]`
- **2004 — Mike Cohn** publishes *User Stories Applied* — the standard reference

### 6.2 The 3 Cs (Jeffries 2001)

| C | Meaning |
|---|---|
| **Card** | Short physical card — placeholder and symbol |
| **Conversation** | The story is a promise of a conversation (Cockburn). Details come in the conversation between dev/PO/QA, not on the card |
| **Confirmation** | Acceptance criteria that confirm the story was delivered correctly |

### 6.3 ⚠️ Critical rule for the title in the backlog

**On the card/backlog, use a SHORT DESCRIPTIVE TITLE**, not the entire Connextra template.

```
✅ GOOD (short form)
   US Busca de Livros para Pronta Entrega
   US Visualização de filmes disponíveis para reserva
   US Listagem BÁSICA de Atletas

❌ BAD (Connextra in the title)
   "Como um vendedor responsável pelo setor de livros eu quero
    procurar por livros filtrando por nome para que seja possível
    verificar se o livro X está disponível para pronta entrega"
```

The Connextra format is for **exploratory conversation**, not for the card. On the card it is visual pollution and unreadable. The Connextra content (persona/feature/benefit) goes in the **description** field or in the **conversation**, not in the title.

### 6.4 Why User Stories in the backlog

Agile development = features delivered **iteratively and incrementally**. The user validates small parts in short timeframes.

**Slicing principle**: ACs specified for FEATURES are **distributed** across several US to be developed over one or several sprints. At the end of each sprint, a sub-set of the feature is delivered for the user to validate.

### 6.5 Flow for creating User Stories of a Feature (LECTURE 09)

1. **Analyze the ACs of the feature**
2. **Define the ACs that should be delivered together in each sprint** (incremental prioritization)
3. **Create one US for each defined AC group**. For each US:
   - **3.1 Specify BDD** (in the description field)
   - **3.2 Associate ACs** (traceability in OpenProject via "Relations")

### 6.6 Concrete slicing example (Feature CONSULTA DE ATLETAS, LECTURE 09)

The feature has 15 ACs (CA01..CA15). Instead of implementing everything in one giant sprint, slice into **3 incremental US**:

**Sprint 1** — deliver basic, simplest-possible listing:

- Access control (CA01)
- Implicit filter by user's federation (CA02)
- Layout per prototype (CA03)
- Listing in alphabetical order by default (CA13)
- Display all athletes (CA15)
→ **US Listagem BÁSICA de Atletas**

**Sprint 2** — evolve to interactive sorting + pagination:

- Re-sort by clicking the header (CA14a)
- Pagination 10/50/100/all (CA14b)
→ **US Listagem com ordenação e paginação (sem busca)**

**Sprint 3** — evolve with search options:

- Applied filters (CA04, CA05, CA06, CA07)
- Active + alphabetical comboboxes (CA08-CA12)
→ **US Listagem Avançada com opções de busca (filtro)**

Each US is **deliverable** to the user (they see partial value each sprint), **NOT a blocker for the next** (independent regarding release), and **fits in ONE sprint**.

### 6.7 INVEST (Mike Cohn — classical good-US checklist)

A well-written US satisfies:

| Letter | Criterion | What to check |
|---|---|---|
| **I**ndependent | Independent | Can be developed without depending on another US in the backlog |
| **N**egotiable | Negotiable | Not a closed contract; details come in conversation |
| **V**aluable | Valuable | Delivers user value (not just technical) |
| **E**stimable | Estimable | Team can assign story points |
| **S**mall | Small | Fits in one sprint |
| **T**estable | Testable | There are verifiable acceptance criteria |

Failed ≥1 → break / rewrite / move to a conversation with the PO.

### 6.8 US content in OpenProject (*"IFPB"* model)

```
Type:        User Story
Title:       US Listagem BÁSICA de Atletas
Description: GIVEN the user is logged into the application and
             has access permission
             WHEN they access the admin menu > ATLETAS
             THEN the system shall display the basic list of athletes
Relations:   [#21429] CA01 - Only authorized users may access...
             [#21430] CA02 - The query shall display only athletes from...
             [#21431] CA03 - The query screen must contain the fields and layout...
             [#21441] CA13 - The general listing shall be displayed in alphabetical order...
```

The **BDD** goes in the US description field. The **ACs** are linked via "Relations". This preserves traceability: when running the US, dev/QA know exactly which rules must be covered.

---

## 7. Acceptance Criteria (ACs)

> Full detail + declarative style vs. Gherkin/BDD in [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md).

**Summary**: ACs are **testable rules specified PER FEATURE** (not per US). Each AC is a declarative sentence describing an invariant.

```
CA05 - The CPF field is not mandatory. But if filled, it must be in
       the XXX.XXX.XXX-XX format. If the CPF is invalid, emit an
       error message.

CA07 - The fields NOME, TÉCNICO, PATROCINADOR, and MÉDICO are NOT
       mandatory. But if filled, must contain at least 5 letters.
       The application shall perform a PARTIAL search by the typed
       content.

CA13 - The general athlete listing shall be displayed in
       alphabetical order by default.
```

**Rule *"IFPB"***: **EVERY feature MUST have specified ACs.** Without ACs, the feature is a wish, not a requirement.

---

## 8. Tasks

Smallest units of work to implement a US. **The smaller, the better** — typically 1–8h each.

Examples:

```
US Listagem BÁSICA de Atletas
  ├─ Task: Create endpoint GET /api/atletas
  ├─ Task: Implement authorization middleware
  ├─ Task: Create component <ListaAtletas/>
  ├─ Task: Add default pagination in the backend
  ├─ Task: Write unit tests for the endpoint
  └─ Task: Write E2E tests for the flow
```

Tasks are the **technical team's tool**, not the PO's. The PO does not negotiate tasks; they negotiate US.

---

## 9. Operational order (which to use when)

| Moment | Focus | Artifact |
|---|---|---|
| Project start / new domain | High-level vision | Macro **Epics** |
| Epic decomposition | Deliverable features | **Features** |
| Feature specification | Testable rules | **Acceptance Criteria** |
| Planning meeting | Sprint slicing | **User Stories** with BDD + ACs |
| Detailed sprint planning | Technical breakdown | **Tasks** |

---

## 10. Smells of poor specification

- Backlog has only "features" without hierarchy (becomes a flat list of 200 items)
- Features without defined ACs
- User Stories with Connextra in the title
- User Stories that take >1 sprint (fail **S** in INVEST)
- Ambiguous ACs ("must be friendly", "must be responsive") — not testable
- US without BDD nor associated ACs — dev guesses the done criterion
- Backlog without prioritization (impossible to negotiate trade-offs)
- Tasks with >1 day of work — hides unrevealed complexity
- **Titles with an infinitive verb** (`List X`, `Search Y`) — violates *"Interpop"* convention
- **Technical terms in Epic/Feature/US** (`Endpoint /api/...`, `Migration of table X`) — violates *"Interpop"* convention
- **Technical configuration as a Feature** (ESLint, env vars, folder creation) — must be cross-cutting Tasks, not Features
- **Feature carrying BDD** or **US without BDD** — responsibility confusion. Feature has a description; only US has BDD.

---

## 11. Materialization: the `BACKLOG.md` artifact

Every substantive specification produces two paired artifacts:

| Artifact | Produced by | Consumes |
|---|---|---|
| `DESIGN.md` | `design-orchestrator` (or main loop) | Architectural decisions (6 layers + ADRs) |
| **`BACKLOG.md`** | **`documentation-engineer`** (via skill `engenharia-de-requisitos`) | **Hierarchy Epic → Feature → AC · US → BDD · Task in business language** |

**Hard rule**: no `DESIGN.md` is considered complete without a paired `BACKLOG.md` in the same directory.

### Why paired

- DESIGN brings **decisions** (CQRS, ts_rank_cd, cursor pagination)
- BACKLOG brings **execution** (Task IDs the `code-implementer` picks one at a time)
- Without BACKLOG, the DESIGN becomes theory disconnected from implementation
- Every line of code traces to a Task ID; every test traces to an AC or BDD scenario

### Template + detailed examples

Full `BACKLOG.md` template, examples from the ***"SIRA"*** project (*"Sistema de Reserva de Salas IFPB"*) and ***"Interpop"*** (*"Busca Editorial"*), naming rules, Immediate/High/Normal/Low priority scale, stable IDs — **all in [05-convencoes-interpop.md](05-convencoes-interpop.md)**.

---

## 12. Connection with the next references

- **BDD + AC + style**: [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md)
- ***"Interpop"* conventions + `BACKLOG.md` template**: [05-convencoes-interpop.md](05-convencoes-interpop.md) ⭐ new
- **Planning Poker estimation**: [05-estimativa.md](05-estimativa.md)
- **Validation (Falbo 7 dimensions)**: [06-validacao.md](06-validacao.md)
- **End-to-end traceability**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
