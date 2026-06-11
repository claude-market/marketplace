# 05 — *"Interpop"* Conventions + `BACKLOG.md` Template

> **Practical** layer on top of the canonical content of references 01-04. The conventions below are **hard rules** of the *"Interpop"* project (validated on *"SIRA"* as well). They apply to every pt-BR project of this author.
>
> Why it lives here: references 01-04 carry the theory (Sommerville, Pressman, Falbo, *"IFPB"*). This reference is the **how to apply in practice** with naming, IDs, priority, and `BACKLOG.md` structure.
>
> **Note on the bilingual examples in this file**: many ❌/✅ examples below remain in **pt-BR** by design — these are the actual naming rules for Brazilian projects, and translating the examples to English would defeat the pedagogical point ("don't use infinitive verbs in pt-BR titles"). The **explanation** is in en-CA; the **examples** are in pt-BR.

---

## 1. When to use this reference

Whenever you are about to:

- Produce a **`BACKLOG.md`** for any feature/module (mandatory if there is a `DESIGN.md`)
- Review Epic/Feature/User Story names in an existing backlog
- Decide whether something is a Feature or a technical Task
- Assign priority to a backlog item
- Train a new agent/dev in the team's convention

---

## 2. The 10 hard rules (non-negotiable)

### Rule 0 — The requirements document is the SOURCE OF TRUTH

The backlog **NEVER changes unless the requirements document changes first**. The backlog is a materialization of the document — it organizes, slices, and prioritizes — but does not decide scope on its own.

This means:

- 🔁 **Before touching the backlog, always verify whether the requirements document was changed.** The client may request add/alter/remove during the project — propagate to the document first, then to the backlog.
- 📎 The `BACKLOG.md` points at the top to the `REQUISITOS.md`: `Requirements document: ../docs/specs/<feature>/REQUISITOS.md (rev. of DD/MM/YYYY)` + `Last requirements-document change check: DD/MM/YYYY — no changes since the last sprint`.
- 📎 **Every Epic/Feature/AC/NFR of the backlog has the `Origin (requirements): RF-NN, RNF-NN, G-NN` field** pointing back to the document items it satisfies.
- ⚠️ An item appearing in the backlog without `Origin (requirements)` is suspicious — either scope creep, or technical refinement misplaced (should be a Task).
- 📅 The requirements document has a **revision history** (§11 of the template) with version, date, author, change, backlog impact.

Document template: [`../examples/template-documento-requisitos.md`](../examples/template-documento-requisitos.md).

### Rule 1 — No infinitive verbs in Epic/Feature/US/RF/RNF/G titles

Use a descriptive noun or gerund. Tasks (technical) may violate. Applies to both the **backlog** (Epic/Feature/US) and the **requirements document** (RF/RNF/G).

| ❌ Wrong | ✅ Right |
|---|---|
| Listar reservas do usuário | Listagem de reservas do usuário |
| Buscar artigos | Busca de artigos |
| Cadastrar atleta | Cadastro de atleta |
| Aprovar reserva | Aprovação de reserva |
| Filtrar por autor | Filtragem por autor |
| Compartilhar busca | Compartilhamento da busca |
| **RF**: `Buscar artigos por texto livre` | **RF**: `Busca de artigos por texto livre` |
| **RNF**: `Responder consultas em até 800ms` | **RNF**: `Tempo de resposta da primeira tela de busca` (body of the description: "deve aparecer em ≤800ms p95") |
| **G**: `Bloquear artigos em moderação` | **G**: `Artigos em moderação não aparecem em buscas` |

### Rule 2 — No technical terms in Epic/Feature/US/CA/**RF**/RNF/G

Technical terms (endpoint, hook, migration, schema, API, config, deploy, table name, method name, shell command, HTTP status code) appear only in **Tasks**. Applies to all **backlog** artifacts (Epic/Feature/US/CA) **and document-of-requirements** artifacts (RF/RNF/G) — because both are read by stakeholders and auditors, not by devs.

| ❌ Wrong | ✅ Right |
|---|---|
| Endpoint REST de busca de artigos | Busca de artigos por texto |
| Hook useSearch com TanStack Query | Apresentação dos resultados em tempo real |
| Migration tabela `search_index` | (not a Feature — becomes Task `T30.1.2`) |
| Configurar `pg_cron` para limpeza | (not a Feature — becomes cross-cutting Task `TX-04`) |
| **CA**: `O endpoint POST /api/v1/bans/ retorna HTTP 400 se hierarquia violada` | **CA**: `Quando um administrador tenta banir outro administrador, o sistema rejeita a operação com a mensagem "Operação não permitida".` |
| **RF**: `Implementar query Postgres com tsvector para busca full-text` | **RF**: `O sistema deve permitir que o leitor encontre artigos publicados por palavra-chave, com resultados ordenados por relevância.` |
| **RNF**: `O índice GIN do Postgres deve responder consultas em ≤50ms` | **RNF**: `A primeira tela de resultados deve aparecer em ≤800ms (p95) para acervo de até 5.000 artigos publicados` |
| **G**: `Filtrar WHERE status != 'em_moderacao' no SELECT` | **G**: `Artigos com status "em moderação" não aparecem em resultados de busca, mesmo para o autor original.` |

### Rule 3 — Explicit pt-BR, simple and direct

The text must be readable by a non-technical stakeholder (PO, coordinator, evaluating professor, client).

| ❌ Wrong | ✅ Right |
|---|---|
| Implementar fluxo CRUD do recurso X | Cadastro, edição e remoção do recurso X |
| Setar up auth com JWT | Acesso seguro com login e senha |
| F-20 BTS | F-20 Listagem de reservas pessoais com filtros e busca |

### Rule 4 — Technical configuration is NOT a Feature

**Feature = client-deliverable.** If no one outside the dev team will perceive the delivery, it is not a Feature. Goes as a Task (US-bound or cross-cutting `TX-NN`).

These are cross-cutting Tasks (`TX-NN`) — NOT Features:

| Item | Correct classification |
|---|---|
| Configurar variáveis de ambiente | Cross-cutting Task |
| Adicionar lib ao `package.json` | Cross-cutting Task |
| Criar `docker-compose.dev.yml` | Cross-cutting Task |
| Configurar ESLint / Prettier | Cross-cutting Task |
| Criar pastas iniciais do projeto | Cross-cutting Task |
| Setup do CI (GitHub Actions) | Cross-cutting Task |
| Configurar `drf-spectacular` para OpenAPI | Cross-cutting Task |
| Configurar Sentry/Prometheus | Cross-cutting Task |
| Criar arquivo de configuração JSON | Cross-cutting Task |
| Configurar índice GIN no Postgres | Task of the relevant US (not cross-cutting — supports a specific US) |

### Rule 5 — *"Interpop"* priority (4 levels on every node)

Use the *"Interpop"* scale on every Epic, Feature, US, and Task:

| Symbol | Name | Meaning |
|---|---|---|
| 🔴 | **Immediate** | Blocks other items; current sprint, mandatory |
| 🟠 | **High** | Current sprint or the next |
| 🟡 | **Normal** | Prioritized backlog |
| 🟢 | **Low** | Nice to have, no deadline |

> **Theoretical equivalence with MoSCoW** (Wiegers/Cohn): Must = Immediate · Should = High · Could = Normal · Won't = Low. But in *"Interpop"* **use the Immediate/High/Normal/Low scale** — it is the one in the tools (OpenProject) and the one the team consumes.

### Rule 6 — Each node has its own artifact — Feature description, US BDD

| Node | Has description? | Has ACs? | Has BDD? |
|---|---|---|---|
| Epic (root or nested) | Yes (pt-BR business-language paragraph) | No (ACs live in Features) | No |
| **Feature** | **Yes (pt-BR business-language paragraph)** | **Yes (list CA01..CANN, always grouped by theme)** | **No** ⚠️ |
| **User Story** | **Yes — the pt-BR BDD in the "Description" field itself** ⚠️ | No (ACs live in the Feature — the US REFERENCES which it covers via "Covered ACs" field) | **Yes (`Dado/Quando/Então` in the Description field)** ⚠️ |
| Task | Yes (short sentence with technical term OK) | No | No |

**Common mistake**: placing BDD in the Feature. **Don't do it**. BDD lives in the User Story (anti-pattern detailed in [04-bdd-criterios-aceitacao.md §7.7](04-bdd-criterios-aceitacao.md)).

**Important OpenProject detail about BDD**: each Gherkin **Scenario** is **content of the US Description field** — it does not create a child card in the hierarchy. Whoever uses Cucumber/pytest-bdd/cucumber-playwright can mirror each scenario in a matching `.feature` file (template in [examples/template-user-story.feature](../examples/template-user-story.feature)).

### Rule 7 — ACs always grouped under `CA - <Theme>` + `[...]` convention

ACs **always** live inside a `CA - <Theme>` grouper item in OpenProject (type "Acceptance Criterion", without ID `CANN`, only a descriptive title). Even when the Feature has a single AC. This keeps visual consistency in the backlog and eases future insertion.

**`[...]` convention** — when an AC needs sub-rules to be fully testable, **end the title with `[...]`** and detail in the item body opening with `Regras a serem aplicadas:` + bullets. An AC without `[...]` must be **self-sufficient in the title**.

| Case | Convention |
|---|---|
| AC with self-sufficient rule in the title | Without `[...]` |
| AC with parallel sub-rules in the body | Ends with `[...]` + `Regras a serem aplicadas:` in the body |

Concrete example:

```
✅ CA05 - O campo CPF não é obrigatório. Mas se preenchido, deverá ser
         no formato XXX.XXX.XXX-XX. Se inválido, emitir mensagem de erro.

✅ CA09 - O combobox FEDERAÇÃO deve aplicar as regras de preenchimento
         e validação conforme detalhamento [...]

   Body (CA09 Description field):
   Regras a serem aplicadas:
   - Só deverá ser habilitado se tiver uma CONFEDERAÇÃO selecionada.
   - Só deve exibir as Federações ATIVAS.
   - Em ordem ALFABÉTICA.
   - Deve exibir apenas as federações que o usuário logado está associado.
   - Deve permitir busca parcial ao digitar.
```

Full `[...]` convention detail in [04-bdd-criterios-aceitacao.md §2.5](04-bdd-criterios-aceitacao.md).

### Rule 8 — ALL artifacts have descriptions in business language

Epic, Feature, User Story, AC, **RF**, RNF, business rule (G): **all** have descriptions in pt-BR business language. Read by any stakeholder (PO, client, junior dev just arriving, auditor) without needing a technical glossary. No URLs, no method names, no stack.

| Artifact | Lives in | Description is... |
|---|---|---|
| Epic | Backlog | Paragraph explaining the user/operation problem the Epic solves. 3–6 sentences. |
| Feature | Backlog | Paragraph explaining what the client will be able to do once the Feature ships. 3–5 sentences. Business language. |
| User Story | Backlog | The **pt-BR BDD** (`Dado/Quando/Então` scenarios in the Description field). |
| AC | Backlog | Declarative, imperative, testable sentence. If sub-rules, `[...]` + bullets. |
| **RF** | **Requirements document** | **pt-BR paragraph describing what the system must do — input/rule/output from the business viewpoint. Has `Origem` (requesting stakeholder), `Prioridade`, and summarized `Critério de aceitação`. Detail of the equivalent feature lives in the backlog.** |
| RNF | Requirements document | Constraint quantified with a metric + how to verify. |
| Business rule (G) | Requirements document | Domain constraint (regulation, editorial policy, professional code). |
| Task | Backlog | Short sentence (technical terms OK here — dev scope). |

> **FR ↔ Feature relationship**: the `RF-NN` is the **declared requirement** in the document. The `F-NN` (Feature) is the **incremental materialization** of that RF in the backlog. One RF may generate one or several Features; one Feature implements one or several RFs. The backlog **references the source RF** via the `Origin (requirements)` field in each Epic/Feature. Without this traceability, it is silent scope creep.

**Why this rule is hard**: a requirement unreadable to the stakeholder is an unvalidated requirement. Sommerville 4.5: "the only reliable validation is the one involving the stakeholder reading and agreeing." If they cannot read it, they cannot validate it.

### Rule 9 — Multiple root Epics, no single "project-Epic" as parent

The project may (and almost always will) have **several Epics at the top level, siblings to each other, without a common parent Epic**. Each root Epic represents an independent front: a platform, an operational area, a cross-cutting module.

**Why**: the "product" as a whole is the **OpenProject repository/context** — not an item of the hierarchy. Forcing everything under a single "Product Epic" creates:

- Empty parent node (no useful description, because the product description is already in `REQUISITOS.md` and in the repo README);
- Ambiguity ("is this root Epic the whole product, or a front?");
- Navigation friction (a whole level of clicks before reaching where the real work is).

**Real examples**:

| Project | Sibling root Epics |
|---|---|
| ***"Controle de Dopagem"*** (*"IFPB"* course) | `EPIC APLICAÇÃO WEB` · `EPIC APLICAÇÃO MOBILE` · `EPIC ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO` |
| ***"Interpop"*** | `EP-10 Busca Editorial` · `EP-09 Filtros Temáticos` · `EP-15 Newsletter` · `EP-20 Moderação Editorial` |
| **Any multi-tenant SaaS** | `EPIC Aplicação Web` · `EPIC API Pública` · `EPIC Painel Admin` · `EPIC Integrações com Terceiros` |

**When a single root Epic makes sense**: lean MVP project with 1–2 sprints of total scope. In that case, the single root Epic may even be the product name temporarily, until it grows.

**Anti-pattern**: creating `EPIC Sistema` as the grandparent of everything "to organize". That is equivalent to creating a `/projeto` folder inside a repository already named `projeto`. Redundant.

Detail and diagram in [`../examples/template-backlog-openproject.md §3`](../examples/template-backlog-openproject.md) and [SKILL.md §5 Phase B](../SKILL.md).

---

## 3. ID system (*"Interpop"* format)

| Type | Pattern | Example | Notes |
|---|---|---|---|
| Epic | `EP-NN` | `EP-10` | Continuous numbering in the project |
| Feature | `F-NN` | `F-30` | Continuous numbering; the first Feature of Epic 10 starts at F-30 (convention: F starts at decades, leaves slack) |
| Acceptance Criterion | `CANN` | `CA01`, `CA12` | Count per **Feature** (reset on each Feature) OR continuous in the project — pick one and stick to it |
| User Story | `USNN.M` | `US30.1`, `US30.4` | `NN` = parent Feature number; `M` = sequence inside the Feature |
| Task | `TNN.M.K` | `T30.1.7` | `NN.M` = parent US; `K` = sequence |
| Cross-cutting Task | `TX-NN` | `TX-01`, `TX-12` | Continuous numbering in the project |

**Golden rule**: IDs are **eternal**. They do not renumber when content changes; the version changes. This preserves traceability in commits, PRs, ADRs.

**In commits/PRs**:

```bash
git commit -m "feat(search): implementa SearchService.query [T30.1.7]"
git commit -m "test(search): adiciona cenário BDD listagem básica [US30.1]"
git commit -m "fix(search): corrige race em cursor [CA02]"
```

---

## 4. Full `BACKLOG.md` template

```markdown
# Backlog — <Feature/Module in pt-BR>

> Hierarchy: Epic → Feature → AC · US → BDD · Task
> Conventions: pt-BR without infinitive · no technical terms in Epic/Feature/US · Feature has description · US has BDD · priorities 🔴 Immediate / 🟠 High / 🟡 Normal / 🟢 Low on every node

## 🟦 EP-NN <Descriptive pt-BR title, no infinitive>

| Field | Value |
|---|---|
| ID | EP-NN |
| Priority | 🔴 / 🟠 / 🟡 / 🟢 |
| Status | New / Refining / Ready / In Progress / Review / Done |
| Target sprint | Sprint X (and Sprint Y, if it spans) |
| Description | <explicit pt-BR paragraph, no technical terms> |
| Belongs to | Aplicação Web / Mobile / Backend (project root) |
| Features | F-AA, F-BB, F-CC |

---

## 🟩 F-AA <Descriptive pt-BR title>

| Field | Value |
|---|---|
| ID | F-AA |
| Type | Feature |
| Epic | EP-NN |
| Priority | (scale) |
| Status | (states) |
| Target sprint | Sprint X |
| Client-deliverable | Yes — **if No, NOT a Feature; move to Tasks** |
| Description | <pt-BR paragraph explaining what the reader/user will be able to do> |

### F-AA Acceptance Criteria

| ID | Description | Priority |
|---|---|---|
| CA01 | <testable pt-BR rule, declarative sentence> | (scale) |
| CA02 | <…> | (scale) |

### F-AA User Stories

#### 🟦 USAA.M <pt-BR title — increment fitting in ONE sprint>

| Field | Value |
|---|---|
| ID | USAA.M |
| Feature | F-AA |
| Priority | (scale) |
| Status | (states) |
| Target sprint | Sprint X |
| Covered ACs | CA01, CA02, … |
| Story Points | <Fibonacci: 1, 2, 3, 5, 8, 13, 21> |

**BDD (`Dado/Quando/Então` in pt-BR)**:

\`\`\`gherkin
Cenário: <Descriptive pt-BR title>
  Dado <pre-condition>
  E <additional pre-condition>
  Quando <user action>
  E <additional action>
  Então <expected result>
  E <additional verification>
\`\`\`

\`\`\`gherkin
Cenário: <Alternative path / error / edge case>
  Dado <…>
  Quando <…>
  Então <…>
\`\`\`

**USAA.M Tasks** (technical terms ALLOWED here):

| ID | Task description | Priority |
|---|---|---|
| TAA.M.1 | <concrete technical task, e.g.: "Implementar SearchService.query() com paginação keyset"> | (scale) |
| TAA.M.2 | <…> | (scale) |

---

## 📋 Cross-cutting Tasks (technical configurations — not Features)

| ID | Description | Priority | For which US (or "general") |
|---|---|---|---|
| TX-01 | Configurar variável de ambiente `<NOME>` no `.env.example` | (scale) | TAA.M.K |
| TX-02 | Adicionar `<lib>` ao `package.json` | (scale) | general |
| TX-03 | Criar `docker-compose.dev.yml` com Postgres 16 + Redis | (scale) | general |

---

## 📊 Backlog summary

| Level | Count |
|---|---|
| Epics | <n> |
| Features | <n> |
| ACs | <n> |
| US | <n> |
| BDD scenarios | <n> |
| Tasks (US-bound) | <n> |
| Cross-cutting Tasks | <n> |
| **Total Story Points** | **<n>** (Sprint X) + **<n>** (Sprint Y) |

### Sprint plan

| Sprint | Focus | Story Points | Features delivered |
|---|---|---|---|
| Sprint X | <description> | <points> | F-AA, F-BB |
| Sprint Y | <description> | <points> | F-CC |

---

## 🔗 Traceability

| Requirement (RF/RNF) | Feature | US | AC | BDD | Task | Test |
|---|---|---|---|---|---|---|
| RF: <…> | F-AA | USAA.M | CA01 | "<scenario>" | TAA.M.K | <test path> |

---

## ⚖️ Falbo 7-dimension validation (engenharia-de-requisitos)

| Feature | Complete | Correct | Consistent | Realistic | Necessary | Prioritizable | Verifiable |
|---|---|---|---|---|---|---|---|
| F-AA | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
```

---

## 5. Real examples from the *"Interpop"* project (*"Busca Editorial"*)

Full example in production: [`/home/gabriel/Documentos/Projetos/interpop/docs/specs/busca-editorial/BACKLOG.md`](../../../Documentos/Projetos/interpop/docs/specs/busca-editorial/BACKLOG.md) — 696 lines, 1 Epic + 3 Features + 27 ACs + 12 US + 20 BDD scenarios + 84 Tasks + 12 TX.

### Extract (good references — kept in pt-BR as they are real project items)

**Epic in pt-BR without infinitive, without technical term**:

```
EP-10 Busca Editorial
Descrição: Conjunto de funcionalidades que permite ao leitor encontrar artigos
do Interpop através de palavras-chave e filtros, com resultados ordenados por
relevância. Inclui também o compartilhamento da busca via link.
```

**Feature with description (no BDD)**:

```
F-30 Busca de artigos por texto
Descrição: Tela "Buscar" que permite ao leitor digitar uma palavra ou frase e
visualizar os artigos do Interpop que contenham aquele termo no título, no
resumo ou no corpo. Os resultados aparecem ordenados pela relevância (artigos
com o termo no título aparecem primeiro) e com destaque visual nas palavras
buscadas.
```

**User Story with descriptive title + pt-BR BDD**:

```
US30.1 Apresentação básica e ordenação dos resultados da busca
CAs cobertos: CA01, CA02, CA09, CA10, CA11, CA12

Cenário: Leitor realiza busca simples e visualiza resultados ordenados
  Dado que o leitor está na página principal do Interpop
  E existem 142 artigos publicados com a palavra "kpop"
  Quando o leitor acessa a busca pelo menu superior
  E digita "kpop" no campo de busca
  Então o sistema apresenta a lista de artigos que contêm a palavra "kpop"
  E os artigos aparecem ordenados do mais relevante para o menos relevante
```

**Task with technical terms (allowed)**:

```
T30.1.7  Implementar SearchService.query(spec: QuerySpec) -> SearchResultPage
         com paginação keyset (cursor base64 assinado HMAC)         🟠 High
```

**Cross-cutting Task (technical configuration outside any Feature)**:

```
TX-03  Adicionar `extension unaccent` no Postgres via migration
       `0002_search_extensions`                                     🔴 Immediate
```

---

## 6. Real examples from the *"SIRA"* project (*"Sistema de Reserva"*)

Referenced in the user's OpenProject screenshots:

```
EP-08 Minhas Reservas (CRUD)                          🟠 High
└─ F-20 Listagem de reservas pessoais com filtros e busca   🟠 High
   ├─ CA01 Lista todas as reservas do usuário logado.       🟡 Normal
   ├─ CA02 Ordenação padrão por data decrescente
   │       (mais recentes primeiro).                          🟡 Normal
   ├─ CA03 Filtro por status (pendente, aprovada, recusada,
   │       cancelada) com multi-seleção.                       🟡 Normal
   ├─ CA04 Filtro por período (próximos 7d, mês corrente,
   │       customizado).                                       🟡 Normal
   ├─ CA05 Busca textual filtra por nome de sala.              🟡 Normal
   ├─ …
   └─ US20.1 Visualização Base e Ordenação da Lista de
              Reservas Pessoais                                 🟡 Normal
```

Note that:

- `EP-08 Minhas Reservas (CRUD)` — noun, no infinitive
- `F-20 Listagem de reservas pessoais com filtros e busca` — noun + description
- `US20.1 Visualização Base e Ordenação da Lista de Reservas Pessoais` — noun
- ACs as direct pt-BR declarative sentences

---

## 7. Smell test (quick check before merging the backlog)

Before accepting a `BACKLOG.md`, run this mental grep:

- [ ] **Was the requirements document checked** before touching the backlog? Does the top of `BACKLOG.md` show `Last requirements-document change check: DD/MM/YYYY`?
- [ ] Does every Feature/US/CA/NFR have the **`Origin (requirements)`** field pointing to `RF-NN`/`RNF-NN`/`G-NN` in the document? (No documented origin = silent scope creep.)
- [ ] **Do all artifacts have business-language descriptions** — Epic, Feature, US, AC, NFR? Readable by a stakeholder without a technical glossary?
- [ ] Does any Epic/Feature/US title start with an **infinitive verb**? If yes → rewrite.
- [ ] Does any Epic/Feature/US/**CA**/**RNF** title OR description contain **technical terms** (`endpoint`, `hook`, `API`, `schema`, `migration`, `config`, HTTP status code, table name)? If yes → move to Task.
- [ ] Is any "Feature" not **client-deliverable**? If yes → move to cross-cutting Task `TX-NN`.
- [ ] Does any **Feature** have BDD instead of description? If yes → move BDD to the User Story; keep the pt-BR description on the Feature.
- [ ] Is any **User Story** missing BDD in the Description field? If yes → write it (≥2 scenarios: happy + error/edge).
- [ ] Is any AC **subjective** ("must be friendly", "must be responsive")? If yes → rewrite testably.
- [ ] **Are ACs inside a `CA - <Theme>` grouper** (even with a single AC in the Feature)?
- [ ] Do ACs with sub-rules end with **`[...]`** and have `Regras a serem aplicadas:` in the body? Are ACs without `[...]` self-sufficient in the title?
- [ ] Is **the Epic nested** when the domain has sub-classifications (module → group → operation)?
- [ ] Does the **backlog have multiple sibling root Epics** (independent project fronts) rather than a single "project-Epic" as the grandparent of everything? (Rule 9)
- [ ] Is any node **without declared priority**? If yes → assign 🔴/🟠/🟡/🟢.
- [ ] Does each US have **explicitly associated ACs** (traceability)?
- [ ] Do IDs follow the pattern (`EP-NN`/`F-NN`/`CANN`/`USNN.M`/`TNN.M.K`/`TX-NN` — nested Epic: `EP-NN.M`)?

Failed any → not ready for `code-implementer`.

---

## 8. Connection with agents

- `documentation-engineer` agent — **generates** this `BACKLOG.md` (mandatory routine when producing DESIGN.md)
- `design-orchestrator` agent — **references** this BACKLOG.md as the final deliverable of the design bundle
- `code-implementer` agent — **consumes** this BACKLOG.md as mandatory input (pick-and-execute by Task ID)
- `testing-engineer` agent — **derives** tests from the BDDs and ACs declared here

---

## 9. Open points / evolution of this convention

- When the team has mature tagging, consider `apps.taxonomy` as a separate Epic and adapt the template
- Evaluate whether Story Points in Fibonacci remains adequate when the team grows (>5 devs)
- Consider adding an explicit `Definition of Ready` field to each US (today implicit in the Falbo checklist + naming)
- Decide whether AC enumeration is **per Feature** (reset CA01 on each Feature) or **continuous in the project** (CA01..CA999). Today it varies between *"SIRA"* (per Feature) and *"Interpop Busca"* (continuous). Standardize.

### Resolved items (Jun/2026)

- ✅ **`[...]` convention for ACs with sub-rules** — formalized in Rule 7 (above) and in [04-bdd-criterios-aceitacao.md §2.5](04-bdd-criterios-aceitacao.md).
- ✅ **ACs always grouped under `CA - <Theme>`** — Rule 7.
- ✅ **ALL artifacts have business-language descriptions** — Rule 8.
- ✅ **Multiple root Epics, no single project-Epic** — Rule 9 (formalized after observation in the *"Controle de Dopagem"* project with 3 root Epics: APLICAÇÃO WEB + APLICAÇÃO MOBILE + ATIVIDADES DE APOIO).
- ✅ **Requirements document as source of truth** — Rule 0.
- ✅ **Nested Epic** — Rule 6 + diagram in the template ([examples/template-backlog-openproject.md](../examples/template-backlog-openproject.md)).
- ✅ **BDD lives in the US Description field, not as a child card** — Rule 6.
