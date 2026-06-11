# Worked Example — Doping Control System (real *"CNPq"* 487777/2013-1 case)

> Real case presented in LECTURE 03 of the ERS course at *"IFPB"*. Project funded by *"CNPq"*; integrated system for Brazilian sports entities (*"ABCD"* — *"Autoridade Brasileira de Controle de Dopagem"*, *"COB"* — *"Comitê Olímpico Brasileiro"*, sports confederations). Walks through elicitation → specification → backlog → US with BDD in a real critical system.
>
> **Note on language preservation**: Feature, Epic, User Story, AC, FR, NFR, and business-rule (G/E) titles are kept in **pt-BR** because they are the actual identifiers used in the original *"IFPB"* / *"CNPq"* project — Redmine cards, *"SVN"* commits, academic papers reference them verbatim. Translating these would break traceability with the source material. **Explanations, tables and analysis are in en-CA**; **artifact content is in pt-BR**.

---

## 1. Context and problem

**Business problem**: Absence of centralized doping-test control in Brazil. Each sports confederation had its own manual process or local spreadsheet. *"ABCD"* needed to aggregate national data to report to *"WADA"* (World Anti-Doping Agency). *"STJD"* needed to follow infraction proceedings. Result: fragmented data, follow-up difficulty, risk of international penalties.

**Feasibility study** — Sommerville's 3 questions:

1. ✅ Contributes to objectives? Yes (fulfilling the *"Código Mundial Antidopagem"* / World Anti-Doping Code)
2. ✅ Fits schedule/budget? Yes (*"CNPq"* approved; *"IFPB"* team)
3. ✅ Integrates with systems in use? Partially (needs to import existing spreadsheets)

→ Project proceeds.

---

## 2. Elicitation (combined techniques)

Per [02-elicitacao.md](../references/02-elicitacao.md), no isolated technique would suffice. The project used:

| Technique | Source | What was discovered |
|---|---|---|
| **Interviews** | *"ABCD"*, *"COB"*, confederations | Current processes, difficulties, expectations |
| **Document analysis** | *"Código Mundial Antidopagem"*, *"STJD"* regulations, existing spreadsheets | Formal rules; existing data structure |
| **Brainstorming** | Team + *"ABCD"* | New features (statistics module for BI) |
| **Observation** | Visits to *"ABCD"* | How samples are collected, transported, kept in custody |

**Stakeholders identified** (Wiegers 5 criteria):

- *"ABCD"* (central authority — operational user)
- *"COB"* (Olympic sphere — consultative user)
- Sports confederations (register athletes)
- Athletes (subjects of the tests; sensitive data — critical privacy)
- *"OCDs"* and *"Escoltas"* (control officers, outsourced)
- *"STJD"* (judges infractions)
- Accredited laboratories (receive samples)
- *"Ministério do Esporte"* (regulator)

---

## 3. High-level requirements identified

### 3.1 Functional requirements by module

Elicitation produced **10 modules**:

```
ADMINISTRATIVO   — Atleta, Médico, Confederação, Provas, Modalidades,
                   Federações, Competições, Treinador
DOPAGEM          — Solicitação/Autorização KIT, Teste/Amostra, Laboratório,
                   Custódia, Histórico Teste, Substâncias Detectadas, Resultados
STJD             — Processo, Parecer, Despacho, Infrações, Tramitação,
                   Histórico, Penalidades, Defesas
GESTÃO OCD/      — OCD, Escolta, OCS, Competências, Disponibilidade,
ESCOLTAS         — Alocação Eventos, Custos
USO GERAL        — Pessoas, Notificações, Portarias, Solicitações
FINANCEIRO       — Taxas, Boletos, Inadimplência, Baixa Bancária
ESTATÍSTICO      — Inteligência de Negócios (BI)
DOPAGEM
TÉCNICO          — Organização Competições, Inscrição Competições,
                 — Julgamento Competições
CONTROLE         — Acesso (RBAC)
DE ACESSO
```

Total: 133 features identified in the initial scope.

### 3.2 Business Rules (Gxx notation) and Exceptions (Exx notation)

The project adopted **two distinct notations** for rules (LECTURE 03 *"IFPB"*):

- **Gxx** — General business rules (valid across the entire system base).
- **Exx** — Specific exceptions (rules that apply only in particular conditions).

#### General rules (Gxx) — sample from the rules document (v0.23, 175 total rules)

```
G09 — Não pode haver duas pessoas com o mesmo CPF.
G10 — Apenas usuários com permissão de acesso à tela do tipo 5 poderão
      ATIVAR um registro com situação INATIVO.
G11 — A máscara para informar telefone deve ser: CÓDIGO DO PAÍS
      (CÓDIGO DE ÁREA) NÚMERO DO TELEFONE.
G12 — Nos campos de telefone, o código do país já deve ser sugerido
      como sendo 55 (Brasil).
G13 — Enquanto um registro estiver com situação INATIVO, seus dados
      não poderão ser alterados (única exceção: usuário com perfil
      tipo 5 pode editar o campo ATIVO).
G14 — A idade da pessoa é um campo calculado a partir da data de
      nascimento.
G15 — Após informar o CEP, o sistema deve exibir País, Estado,
      Cidade, Bairro e Rua relacionados.
G16 — Listagem de Federações: a relação depende da Confederação
      selecionada.
G17 — Listagem de Modalidades: a relação depende da Confederação
      selecionada.
...
```

#### Specific exceptions (Exx)

```
E1 — O nome do pai tem que ser diferente do nome da mãe.
E2 — O sistema deve extrair as iniciais do atleta a partir do nome,
     mas pode ser editado.
E3 — Se o atleta for portador de deficiência, é obrigatório o
     preenchimento do campo Classe de Deficiência. Caso contrário,
     o campo Classe não deve ser preenchido.
...
```

Note that **these rules come from different sources**:

- **Gxx** come from the DOMAIN (*"WADA"* / *"Código Mundial Antidopagem"*, *"STJD"* regulations, identity policy). Easy to miss — they only surfaced via document analysis.
- **Exx** come from OBSERVATION (ethnography + interviews with the team that registers athletes) — real edge situations that only operators have in their heads.

> **Recommended pattern**: separating Gxx (invariant domain rules) from Exx (conditional edge exceptions) makes it easier to trace origin and maintenance responsibility. When an exception becomes a general rule (all cases now behave the same), promote it from Exx to Gxx in the document.

### 3.3 Non-Functional Requirements

| Type | Requirement | Metric |
|---|---|---|
| **Product - Availability** | System available during business hours (Mon-Fri, 8h-18h) | ≥99.5% |
| **Product - Security** | Athletes' data confidential | RBAC + encryption at rest |
| **Product - Reliability** | Automated backup | Daily, 1-year retention |
| **Product - Platform** | Web (accessible to remote confederations) | Multi-browser |
| **Organizational - Technology** | Stack defined by the *"IFPB"* team | Java/JSF, *"Hibernate"*, *"Primefaces"*, PostgreSQL, *"IReport"*/*"Jasper"* |
| **Organizational - Process** | Versioning + ticketing | *"SVN"* + *"Redmine"* + *"Astah"* for UML |
| **External - Compliance** | Meet *"WADA"* / *"Código Mundial Antidopagem"* | Annual audit |
| **External - Privacy** | *"LGPD"* (sensitive health data) | Consent + retention + access audit |

---

## 4. Specification — backlog hierarchy

Applying the *"IFPB"* model from [03-especificacao.md](../references/03-especificacao.md).

> **Practical lesson from LECTURE 03 *"IFPB"* — backlog scope legend**: the original project slide for *"Controle de Dopagem"* uses 4 colours to classify the scope status of each Feature/Module:
>
> - 🟦 **Initial scope of *"CNPq"* project 487777/2013-1** (what is contracted)
> - 🟩 **Added to scope on *"ABCD"* demand** (expanded scope with documented approval)
> - 🟧 **Not in project — proposal for a NEW project** (recorded for the next call)
> - ⬜ **Not in project — to be explored with Confederations** (still in feasibility analysis)
>
> **Why this matters**: visually marking who-asked-for-what and what-fits-in-budget avoids silent scope creep. In any real backlog, an item entering the scope must have documented origin and a status flag. **No origin ≡ scope creep**. See `Origin (requirements)` in [template-backlog-openproject.md §4](template-backlog-openproject.md).

> **⚠️ Important — multiple root Epics, no single "project-Epic" parent**: the *"Controle de Dopagem"* project has **three Epics at the top level, siblings to each other** (`APLICAÇÃO WEB`, `APLICAÇÃO MOBILE`, `ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO`). There is no "Epic Controle de Dopagem" node as a common grandparent — the "product" as a whole is the **OpenProject context/repository** of the project, not an item of the hierarchy. Convention detail in [`../examples/template-backlog-openproject.md §3`](template-backlog-openproject.md).

```
PROJECT Controle Dopagem (= OpenProject context/repository; NOT an EPIC)
│
├─ EPIC APLICAÇÃO WEB                                  ← Root Epic #1 (front: web platform)
│   ├─ EPIC Módulo ADMINISTRATIVO
│   │    └─ EPIC Gestão de ATLETAS
│   │         ├─ EPIC CADASTRO de Atletas
│   │         │    ├─ FEATURE Cadastro Básico com dados pessoais
│   │         │    ├─ FEATURE Categorias Esportivas do Atleta
│   │         │    ├─ FEATURE Patrocinadores do Atleta
│   │         │    ├─ FEATURE Técnico do Atleta
│   │         │    ├─ FEATURE Bolsa Atleta recebidas
│   │         │    ├─ FEATURE Equipe Médica associada ao Atleta
│   │         │    ├─ FEATURE Convocações para Seleção Nacional
│   │         │    ├─ FEATURE Participação em Programas Especiais
│   │         │    ├─ FEATURE Clubes/Associações do Atleta
│   │         │    └─ FEATURE Resultados em Competições
│   │         ├─ EPIC CONSULTA de Atletas
│   │         │    ├─ FEATURE Consulta GERAL de Atletas
│   │         │    └─ FEATURE Extrato INDIVIDUAL (Prontuário Esportivo)
│   │         └─ EPIC RELATÓRIO de Atletas
│   │              ├─ FEATURE Relação GERAL de ATLETAS
│   │              └─ FEATURE Relação de Atletas por Confederação
│   ├─ EPIC Módulo DOPAGEM
│   │    └─ ...
│   └─ ... (other modules)
│
├─ EPIC APLICAÇÃO MOBILE                               ← Root Epic #2 (front: mobile platform)
│   └─ ... (own sub-hierarchy)
│
└─ EPIC ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO  ← Root Epic #3 (front: cross-cutting activities)
    └─ ... (own sub-hierarchy)
```

> **Note on the Features listed above:** in the real backlog, **each `FEATURE Xxxxx` item has its own pt-BR description** (client-deliverable, no technical terms), per the skill rule (Feature has a description; User Story has BDD). This case study elaborates in depth only the `Consulta GERAL de Atletas` Feature (§5–§8) to illustrate the full AC → US → BDD → Estimation flow; the others are represented only by their title in the diagram. **In a real project, a Feature missing its description is specification debt** — it surfaces as friction in Sprint Planning (PO has to re-explain the deliverable) and in US review (devs question the "why" of the story).

---

## 5. Feature: Consulta GERAL de Atletas

**Feature description (client-deliverable, in pt-BR):**

Permite que operadores autorizados (*"ABCD"*, *"COB"* e confederações) consultem a base nacional de atletas em uma única tela paginada, aplicando filtros opcionais por *"CPF"*, nome, técnico, patrocinador, médico, modalidade, categoria, tipo de bolsa, programa especial, competição e datas de competição. A consulta é restrita automaticamente às federações associadas ao usuário logado no servidor — não há "consulta global" cega, mesmo para administradores. O entregável ao cliente é o ponto de entrada operacional para todos os fluxos de dopagem subsequentes: convocação para teste (regra G09), análise de histórico de testes do atleta, e cruzamento com processos do *"STJD"*. Em volume real (*"ABCD"* agrega ~50 mil atletas nacionais), a feature precisa responder com paginação preguiçosa e ordenação no servidor.

> This description is what goes on the OpenProject/Redmine Feature card. Business language, no technical terms (JSF/Hibernate/Primefaces stay in the Tasks). The acceptance criteria below formalize the testable rules; BDD appears only in the User Stories (§7).

### 5.1 Acceptance Criteria (declarative style)

Applying [04-bdd-criterios-aceitacao.md](../references/04-bdd-criterios-aceitacao.md). 15 declarative ACs, **grouped by theme** (`CA - <Theme>` convention from Rule 7 of [05-convencoes-interpop.md](../references/05-convencoes-interpop.md)). ACs with **`[...]`** at the end of the title must be read together with the detail in §5.2.

#### 📋 CA - Acesso e visibilidade

| ID | Description | Detail? |
|---|---|---|
| `CA01` | Apenas usuários autorizados podem ter acesso à funcionalidade de Consulta GERAL de ATLETAS. | — |
| `CA02` | A consulta deve exibir apenas os atletas das FEDERAÇÕES esportivas que o usuário tem acesso no seu cadastro. | — |
| `CA03` | A tela de consulta deve conter os campos e layout conforme definido no protótipo. | — |

#### 📋 CA - Filtros e busca

| ID | Description | Detail? |
|---|---|---|
| `CA04` | A consulta deverá ser realizada levando-se em conta as opções de filtro informadas pelo usuário. | — |
| `CA05` | O campo CPF não é obrigatório. Mas se preenchido, deverá ser no formato XXX.XXX.XXX-XX. Se o CPF for inválido, emitir mensagem de erro. | — |
| `CA06` | Os campos de DATA no filtro de Competições NÃO são obrigatórios. A consulta deve ser realizada de acordo com o preenchimento informado pelo usuário. | — |
| `CA07` | Os campos NOME, TÉCNICO, PATROCINADOR e MÉDICO NÃO são obrigatórios. Mas se preenchido, deve ter no mínimo 5 letras. A aplicação deve realizar uma busca PARCIAL pelo conteúdo digitado. | — |

#### 📋 CA - Comboboxes (regras de habilitação, listagem e busca)

| ID | Description | Detail? |
|---|---|---|
| `CA08` | O combobox CONFEDERAÇÃO deve aplicar as regras de listagem e busca **[...]** | ✅ |
| `CA09` | O combobox FEDERAÇÃO deve aplicar as regras de preenchimento e validação **[...]** | ✅ |
| `CA10` | Os comboboxes MODALIDADES e CATEGORIAS devem aplicar as regras de listagem por confederação **[...]** | ✅ |
| `CA11` | Os comboboxes TIPO DE BOLSA, PROGRAMA ESPECIAL e TIPO COMPETIÇÃO devem aplicar as regras de listagem e busca **[...]** | ✅ |
| `CA12` | O combobox COMPETIÇÃO deve exibir apenas competições multiesportes e competições específicas da confederação selecionada pelo usuário. | — |

#### 📋 CA - Apresentação dos resultados

| ID | Description | Detail? |
|---|---|---|
| `CA13` | A listagem geral de atletas deverá ser exibida em ordem alfabética, por default. | — |
| `CA14a` | A listagem geral de atletas poderá ser reordenada ao clicar no título das colunas. | — |
| `CA14b` | A listagem geral de atletas deverá ser paginada com as opções de visualizar 10, 50, 100 ou todos. | — |
| `CA15` | A listagem geral de atletas deverá exibir todos os atletas por default. | — |

### 5.2 Detail of ACs with `[...]`

Each block below is what appears in the **item body** in OpenProject (AC Description field), following the `Regras a serem aplicadas:` + bullets convention.

#### CA08 — Detail

```
Regras a serem aplicadas:
- Só deve exibir as CONFEDERAÇÕES ATIVAS.
- Em ordem ALFABÉTICA.
- Deve exibir apenas as confederações que o usuário logado está associado no seu cadastro de acesso.
- Deve permitir busca parcial ao digitar.
```

#### CA09 — Detail

```
Regras a serem aplicadas:
- O combobox FEDERAÇÃO só deverá ser habilitado se tiver uma CONFEDERAÇÃO selecionada.
- Só deve exibir as Federações ATIVAS.
- Em ordem ALFABÉTICA.
- Deve exibir apenas as federações que o usuário logado está associado no seu cadastro de acesso.
- Deve permitir busca parcial ao digitar.
```

#### CA10 — Detail

```
Regras a serem aplicadas:
- Só deve exibir dados das confederações que o usuário está associado no seu cadastro de acesso.
- Exibir apenas os registros ATIVOS.
- Em ordem ALFABÉTICA.
```

#### CA11 — Detail

```
Regras a serem aplicadas:
- Só deve exibir os registros ATIVOS.
- Em ordem ALFABÉTICA.
- Deve permitir a busca parcial ao digitar.
```

---

## 6. Slicing into User Stories (3 sprints)

Applying the LECTURE 09 flow (see [03-especificacao.md §6.5](../references/03-especificacao.md)):

### 6.1 Group ACs by sprint (incremental prioritization)

```
Sprint 1 — Consulta BÁSICA (simplest possible deliverable)
  CA01 — Authorized access
  CA02 — Implicit filter by user's federation
  CA03 — Prototype layout
  CA13 — Default alphabetical order
  CA15 — Display all by default

Sprint 2 — Sorting + pagination
  CA14a — Re-sort on header click
  CA14b — Pagination 10/50/100/all

Sprint 3 — Advanced search
  CA04 — Applied filters
  CA05 — CPF validation
  CA06 — Optional dates
  CA07 — Partial search by name/etc.
  CA08-CA12 — Active comboboxes + alphabetical + partial search
```

### 6.2 Resulting User Stories

```
US Listagem BÁSICA de Atletas                                  (Sprint 1)
US Listagem de Atletas com ordenação e paginação (sem busca)   (Sprint 2)
US Listagem Avançada de Atletas com opções de busca (filtro)   (Sprint 3)
```

---

## 7. BDD of US "Listagem BÁSICA de Atletas"

```gherkin
# language: pt
Funcionalidade: Listagem básica de atletas

  Contexto:
    DADO que o usuário esteja logado na aplicação
    E tenha permissão de acesso ao módulo administrativo

  Cenário: Usuário autorizado acessa a listagem básica
    QUANDO acessar o menu administrativo > ATLETAS
    ENTÃO o sistema deve exibir a relação básica de atletas
    E os atletas devem ser apenas das federações associadas ao usuário (CA02)
    E a listagem deve estar em ordem alfabética por nome (CA13)
    E todos os atletas devem ser exibidos por padrão (CA15)
    E o layout deve corresponder ao protótipo aprovado (CA03)

  Cenário: Usuário sem permissão é bloqueado
    DADO que o usuário NÃO tem permissão de acesso ao módulo administrativo
    QUANDO tentar acessar a URL /admin/atletas diretamente
    ENTÃO o sistema deve retornar erro 403
    E não deve exibir nenhum dado de atleta
```

**OpenProject relations** (traceability):

```
US Listagem BÁSICA de Atletas
├─ related-to: CA01 (authorized access)
├─ related-to: CA02 (federation filter)
├─ related-to: CA03 (layout)
├─ related-to: CA13 (alphabetical order)
└─ related-to: CA15 (display all by default)
```

---

## 8. Estimation (Planning Poker)

Chosen guide story: **"Adicionar campo apelido ao cadastro de atleta"** (delivered in the previous sprint — 1 point).

Estimates:

| User Story | Points | Justification |
|---|---|---|
| US Listagem BÁSICA | **5** | Query + RBAC + standardized view + prototype integration |
| US Listagem com ordenação/paginação | **3** | Small extensions over the basic + *"Primefaces"* components |
| US Listagem Avançada com filtros | **13** | Multiple cascading comboboxes, partial search across several fields, *"CPF"* validation, conditional display rules |

Total for the CONSULTA GERAL feature: **21 points**.

With an average velocity of 25pts/sprint, the feature essentially fills 1 whole sprint (or spreads across 2 alongside smaller US).

---

## 9. Validation

### 9.1 Sommerville checks applied

- ✅ **Validity**: confirmed with *"ABCD"* in review (July 2023)
- ✅ **Consistency**: CA08 and CA09 are consistent — CA09 only activates if CA08 is selected
- ✅ **Completeness**: the review revealed missing AC for export (CSV) — added later
- ✅ **Realism**: the Java/JSF stack is familiar to the team; fits the schedule
- ✅ **Verifiability**: each CA has an associated Gherkin scenario

### 9.2 Falbo dimensions per AC

Each AC validated against the 7 criteria. **Initial CA05 was**: "The CPF field must be validated". It failed on **completeness** (did not state format) and **verifiability** (how to test?). Rewritten to the current version with explicit XXX.XXX.XXX-XX format.

### 9.3 Prototypes validated with *"ABCD"*

*"Pencil"* wireframes + paper sketches → photo sent by email → validation meeting → adjustments → wireframe v2 → approved.

---

## 10. Ethical aspects (*"SBC"* layer)

Applying [09-etica-sbc.md](../references/09-etica-sbc.md):

| Principle | Application in the case |
|---|---|
| **§1.1 Human well-being** | System supports sport integrity (public good) |
| **§1.2 Avoid harm** | A false doping accusation destroys an athlete's career — NFR of strict audit |
| **§1.4 Non-discrimination** | System cannot privilege/penalize athletes by federation, gender, modality |
| **§1.6 Privacy** | Health data (substances) extremely sensitive — encryption at rest + audited access + defined retention |
| **§1.7 Confidentiality** | Positive test results CANNOT leak before the formal *"STJD"* process |
| **§2.5 ML evaluation** | (If this system aggregates ML for suspicious-pattern detection — continuous bias auditing) |
| **§3.7 Societal infrastructure** | System integrates with the national sport infrastructure; standards of operation above the commercial-system average |

Concrete ethical decision: **a positive result automatically blocks the confederation UI** (G10) — not to hide it, but to prevent informal leakage before due process.

---

## 11. Lessons from the case

1. **Document analysis was more valuable than interviews** — the *"WADA"* Code has 200 pages of technical rules nobody at *"ABCD"* remembers by heart
2. **Diverse stakeholders require explicit prioritization** — confederations wanted registration features; *"ABCD"* wanted operations features; the conflict was resolved with MoSCoW (project Must-have = *"ABCD"* operation)
3. **Slicing into US saved the project** — basic version delivered in 3 months generated traction; the rest evolved with feedback
4. **BDD in pt-BR engaged non-technical stakeholders** — *"ABCD"* physicians reviewed scenarios and pointed out missing rule G14
5. **Traceability in *"Redmine"* + *"SVN"*** was adequate to the scale (no need for DOORS)
6. **Privacy NFRs dominated implementation cost** — audit + encryption + retention took as much effort as the feature itself
