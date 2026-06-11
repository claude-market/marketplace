# Template — Backlog in OpenProject style (complete worked example)

> Template **filled with a real example**, not an empty skeleton. Use it as a concrete starting point for any project backlog. Reflects the OpenProject hierarchy per the *"IFPB"* ERS course (LECTURES 07–09) and the *"Interpop"* convention. Replace the example with your domain while keeping all the conventions.
>
> **Note on language preservation**: explanations, table headers, and analysis are in **en-CA**. **Concrete artifact content** (Feature descriptions, ACs, BDD scenarios, Tasks) is preserved in **pt-BR** because these reproduce the actual *"Interpop"* and *"Controle de Dopagem"* backlog cards — translating would defeat the worked-example purpose.

---

## 0. Pre-requisite — the backlog is BASED on the requirements document

**Rule zero (non-negotiable)**: the backlog **is a materialization of the requirements document**. Everything to be built is born in the requirements document; the backlog only organizes, slices, and prioritizes that content.

So:

- 🔁 **Before touching the backlog, ALWAYS verify whether the requirements document was changed.** During the project, the user/client may ask to alter, add, or remove requirements — and those changes must propagate to the backlog (not the other way around).
- 📎 **The top of the backlog must point to the requirements document** (link or relative path): `Requirements document: ../docs/specs/<feature>/REQUISITOS.md (rev. of DD/MM/YYYY)`.
- ⚠️ **Backlog changes without origin in the requirements document are suspicious**: either *scope creep* (scope growing without approval), or purely technical refinement (should become a Task, not a Feature). In both cases, **record the decision in the requirements document first**.
- 🔗 **Traceability runs both ways**: from the requirements document to the backlog (RF/RNF → Feature/CA) AND from the backlog to the document (every Feature/US/CA references which RF/RNF of the specification it satisfies).

> Whoever follows this discipline never has that "wait, did we agree on this or did someone invent it?" moment. Whoever does not, pays in rework.

---

## 1. Hard rules (non-negotiable)

Detail in [05-convencoes-interpop.md](../references/05-convencoes-interpop.md) and [04-bdd-criterios-aceitacao.md](../references/04-bdd-criterios-aceitacao.md).

1. **The requirements document is the source of truth.** Always check changes there before touching the backlog (see §0 above).
2. **Pt-BR without infinitive** in Epic/Feature/US titles: `"Listagem de reservas"`, not `"Listar reservas"`.
3. **No technical terms** in Epic/Feature/US/CA/NFR: REST endpoints, libs, frameworks, table names, shell commands — all of these go into **Tasks**.
4. **ALL artifacts have business-language descriptions**: Epic, Feature, US, CA, NFR. Readable by any stakeholder (PO, client, junior dev just arriving). No URLs, no method names, no stack.
5. **Feature has a description (paragraph) + ACs**. NEVER has BDD.
6. **User Story has BDD in pt-BR** (`Dado/Quando/Então`) **inside the "Description" field itself** (not as separate child items in OpenProject) + ACs inherited via traceability. Never has its own ACs.
7. **AC is declarative, atomic, and testable**. If the rule requires sub-rules, end the title with **`[...]`** and detail in the body (see §2 below).
8. **ACs are always grouped** under a `CA - <Theme>` grouper, even when the Feature has only 1 AC. The grouping keeps visual consistency and eases future insertion.
9. **Nested Epic** is used when the domain has sub-classifications (module → group → operation). This is the faithful way to organize large systems in OpenProject.

---

## 2. `[...]` convention for ACs with detail (hard rule)

When an AC needs sub-rules to be fully testable, **end the title with `[...]`**. In the item body (the "description" field in OpenProject), open with `Regras a serem aplicadas:` followed by bullets.

**Why it exists**: whoever reads the backlog in **list mode** (OpenProject default view, with 50+ items on screen) must decide in 1 second whether that AC is self-sufficient or requires a click. The `[...]` signals this unambiguously.

### Concrete example (real case from the *"IFPB"* course)

**Title on the card** (visible in list mode):

```
CA09 - O combobox FEDERAÇÃO deve aplicar as regras de preenchimento e validação conforme detalhamento [...]
```

**Description (item body, read on opening)**:

```
Regras a serem aplicadas:
- O combobox FEDERAÇÃO só deverá ser habilitado se tiver uma CONFEDERAÇÃO selecionada.
- Só deve exibir as Federações ATIVAS.
- Em ordem ALFABÉTICA.
- Deve exibir apenas as federações que o usuário logado está associado no seu cadastro de acesso.
- Deve permitir busca parcial ao digitar.
```

**Contrast — self-sufficient AC (without `[...]`)**:

```
CA05 - O campo CPF não é obrigatório. Mas se preenchido, deverá ser no formato XXX.XXX.XXX-XX. Se o CPF for inválido, emitir mensagem de erro.
```

It does not need `[...]` because the title already contains everything required to test.

---

## 3. Complete visual hierarchy (territory map)

```
📄 Requirements Document (SOURCE OF TRUTH — always check before touching anything)
    │
    ▼
PROJECT (not a node in OpenProject — it is the project repository/context)
    │
    ├─ 🟦 ROOT EPIC #1                                  ← one front of the project
    │   └─ 🟦 SUB EPIC                                  ← sub-domain (module, area)
    │       └─ 🟦 SUB-SUB EPIC                          ← sub-sub-domain
    │           └─ 🟦 SUB-SUB-SUB EPIC                  ← IFPB example reaches 4 levels
    │               └─ 🟩 FEATURE                       ← client-deliverable
    │                   ├─ 📋 AC group "CA - <Theme A>" ← ACs always grouped
    │                   │    ├─ ✅ CA01 - self-sufficient rule
    │                   │    ├─ ✅ CA02 - self-sufficient rule
    │                   │    └─ ✅ CA03 - rule with sub-rules [...]
    │                   ├─ 📋 AC group "CA - <Theme B>"
    │                   │    └─ ✅ CA04 - ...
    │                   └─ 🟦 USER STORY                ← one-sprint slice
    │                       ├─ 🎬 BDD: Scenario 1 (happy path)        ┐
    │                       ├─ 🎬 BDD: Scenario 2 (error/edge)        │ ← content of the
    │                       └─ 🎬 BDD: Scenario 3 (alternative)       ┘   US "Description"
    │                                                                     field (NOT child
    │                                                                     cards in OpenProject)
    │                       └─ 🔧 TASK                              ← technical unit
    │                                                                  (technical terms OK)
    │
    ├─ 🟦 ROOT EPIC #2                                  ← another front (sibling)
    │   └─ ... (same internal structure)
    │
    └─ 🟦 ROOT EPIC #N                                  ← other fronts (siblings)
        └─ ...
```

> **🔴 Important rule about multiple root Epics**: a project **may (and almost always does) have multiple root Epics at the top level**, siblings to each other, **without a single "project-Epic" parent**. Each root Epic represents an **independent front** of the project: a platform (Web Application, Mobile Application), an operational family (Support, Quality and Investigation Activities), or a cross-cutting module.
>
> **Why not creating a single "Product Epic" as the grandparent of everything**: the "product" as a whole is the **OpenProject repository / project context** — not an item of the hierarchy. Forcing everything under a single "Product Epic" creates an empty parent node (no useful description), hurts navigation, and creates ambiguity ("is this root Epic the whole product, or is it a front?").
>
> **Real examples**:
>
> - ***"Controle de Dopagem"*** (*"IFPB"* course): `EPIC APLICAÇÃO WEB` · `EPIC APLICAÇÃO MOBILE` · `EPIC ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO` — three root Epics, siblings at the top level.
> - ***"Interpop"***: `EP-10 Busca Editorial` · `EP-09 Filtros Temáticos` · `EP-15 Newsletter` · `EP-20 Moderação Editorial` — several root Epics, siblings. There is no "*"Interpop"*" Epic as parent.

> **Note on BDD in OpenProject**: BDD scenarios are **content of the User Story "Description" field**, not child items of the hierarchy (they do not become their own cards). The schema above shows the **conceptual** relation (BDD belongs to the US). Whoever works with Cucumber/Behave externally may mirror each scenario in a corresponding `.feature` file.

---

## 4. WORKED EXAMPLE A — *"Interpop"* *"Busca Editorial"* (1 Epic level)

Lean example for medium-scale systems. Reflects what is in production at *"Interpop"*.

> **Requirements document:** [`../docs/specs/busca-editorial/REQUISITOS.md`](../../../../Documentos/Projetos/interpop/docs/specs/busca-editorial/REQUISITOS.md) (rev. of 28/05/2026)
> **Last requirements-document change check:** 03/06/2026 — no changes since the last sprint.

### 🟦 EP-10 — Busca Editorial

| Field | Value |
|---|---|
| **ID** | `EP-10` |
| **Priority** | 🟠 High |
| **Status** | In Progress |
| **Target sprint** | Sprint 3, Sprint 4 |
| **Belongs to** | Aplicação Web |
| **Direct Features** | `F-30`, `F-31`, `F-32` |
| **Origin (requirements)** | RF-08, RF-09, RF-10, RNF-04 |

**Description:**

Conjunto de funcionalidades que permite ao leitor encontrar artigos do *"Interpop"* através de palavras-chave e filtros, com resultados ordenados por relevância. Inclui o compartilhamento da busca por link (a URL preserva o termo digitado e os filtros, permitindo que o leitor envie a busca pronta para outra pessoa). O Epic cobre desde a busca simples por texto (Feature `F-30`) até a busca por filtros temáticos (`F-31`) e o compartilhamento (`F-32`).

---

### 🟩 F-30 — Busca de artigos por texto

| Field | Value |
|---|---|
| **ID** | `F-30` |
| **Type** | Feature |
| **Parent Epic** | `EP-10` |
| **Priority** | 🟠 High |
| **Status** | In Progress |
| **Target sprint** | Sprint 3 |
| **Client-deliverable?** | Yes |
| **Origin (requirements)** | RF-08, RF-09, RNF-04 |

**Description:**

Tela "Buscar" que permite ao leitor digitar uma palavra ou frase e visualizar os artigos do *"Interpop"* que contenham aquele termo no título, no resumo ou no corpo. Os resultados aparecem ordenados por relevância (artigos com o termo no título aparecem primeiro), com o termo buscado destacado em amarelo dentro de cada resultado. A lista é paginada (carrega 20 artigos por vez, com botão "Carregar mais" no fim) e respeita o tempo de resposta percebido pelo leitor como instantâneo.

#### F-30 Acceptance Criteria

##### 📋 CA - Acesso e visibilidade

| ID | Description | Detail? |
|---|---|---|
| `CA01` | A busca é acessível a qualquer visitante do site, sem necessidade de login. | — |
| `CA02` | A busca exibe apenas artigos com status **publicado**. Artigos em rascunho ou em moderação nunca aparecem nos resultados. | — |
| `CA03` | Se o leitor digitar um termo e não houver artigos correspondentes, o sistema exibe a mensagem "Nenhum artigo encontrado para <termo>" e mantém o campo de busca preenchido. | — |

##### 📋 CA - Comportamento da consulta

| ID | Description | Detail? |
|---|---|---|
| `CA04` | A busca aceita termos com **mínimo de 2 caracteres** e **máximo de 100 caracteres**. Termos fora dessa faixa não disparam consulta — o campo exibe a mensagem "Digite entre 2 e 100 caracteres". | — |
| `CA05` | A busca é **case-insensitive e diacritic-insensitive**: digitar "POP", "pop", "Pop" ou "póp" retorna os mesmos artigos. | — |
| `CA06` | A busca encontra ocorrências do termo no **título**, **resumo** e **corpo** do artigo, nesta ordem de prioridade de relevância **[...]** | ✅ |
| `CA07` | A consulta deve ser realizada levando-se em conta as **opções de filtro temático** aplicadas pelo leitor **[...]** | ✅ |

##### 📋 CA - Apresentação dos resultados

| ID | Description | Detail? |
|---|---|---|
| `CA08` | Os resultados são apresentados em **cards verticais empilhados**, contendo título, resumo (primeiras 200 caracteres), data de publicação e autor. O termo buscado aparece destacado em amarelo. | — |
| `CA09` | A lista carrega **20 artigos por página**. No fim da página, há o botão **"Carregar mais"** que adiciona os próximos 20. | — |
| `CA10` | A URL da página de busca deve preservar o termo e os filtros aplicados, no formato `/buscar?q=<termo>&tema=<id>`, permitindo compartilhamento. | — |

##### 📋 CA - Tempo de resposta

| ID | Description | Detail? |
|---|---|---|
| `CA11` | A primeira tela de resultados deve aparecer em até **800ms (p95)** para acervo de até 5.000 artigos publicados. | — |
| `CA12` | Quando a consulta passar de 800ms, o sistema exibe um **indicador visual de carregamento** (skeleton dos cards) para não dar impressão de tela travada. | — |

#### Detail of ACs with `[...]`

##### CA06 — Detail

> **Appears in the CA06 item body in OpenProject:**

```
Regras a serem aplicadas:
- A relevância é calculada de forma que artigos com o termo no TÍTULO recebam o maior peso.
- Em seguida, artigos com o termo no RESUMO recebem peso intermediário.
- Por fim, artigos com o termo apenas no CORPO recebem o menor peso.
- Quando dois artigos têm a mesma relevância, o mais recente aparece primeiro.
- Termos com acento e sem acento são tratados como equivalentes ("acao" encontra "ação").
- Termos com letra maiúscula e minúscula são tratados como equivalentes ("KPOP" encontra "kpop").
```

##### CA07 — Detail

> **Appears in the CA07 item body in OpenProject:**

```
Regras a serem aplicadas:
- O leitor pode selecionar UM OU MAIS filtros temáticos antes ou durante a busca.
- Os filtros são exibidos como chips clicáveis acima da lista de resultados.
- Ao selecionar um filtro, a lista é refeita SEM perder o termo de busca atual.
- Ao remover todos os filtros, a busca volta a considerar todos os temas.
- Se o leitor combinar termo + filtro e não houver resultados, a mensagem do CA03 deve mencionar tanto o termo quanto o filtro ativo.
```

#### F-30 User Stories

##### 🟦 US30.1 — Apresentação básica e ordenação dos resultados da busca

| Field | Value |
|---|---|
| **ID** | `US30.1` |
| **Parent Feature** | `F-30` |
| **Priority** | 🟠 High |
| **Status** | In Progress |
| **Target sprint** | Sprint 3 |
| **Covered ACs** | `CA01`, `CA02`, `CA05`, `CA06`, `CA08`, `CA09`, `CA11` |
| **Story Points** | 8 |

**US Description (the "Description" field in OpenProject — pt-BR BDD, all scenarios live here):**

```gherkin
# language: pt
Cenário: Leitor realiza busca simples e visualiza resultados ordenados
  Dado que o leitor está na página principal do Interpop
  E existem 142 artigos publicados que contêm a palavra "kpop"
  Quando o leitor acessa a busca pelo menu superior
  E digita "kpop" no campo de busca
  E pressiona Enter
  Então o sistema apresenta uma lista de cards de artigos
  E os artigos aparecem ordenados do mais relevante para o menos relevante
  E os primeiros 20 artigos aparecem na primeira tela
  E o termo "kpop" aparece destacado em amarelo em cada card
  E a primeira tela completa carrega em menos de 800ms

Cenário: Leitor não encontra resultados
  Dado que o leitor está na página de busca
  E NÃO existe nenhum artigo publicado com a palavra "xkcdunicornio"
  Quando o leitor digita "xkcdunicornio" e pressiona Enter
  Então o sistema exibe a mensagem "Nenhum artigo encontrado para xkcdunicornio"
  E o campo de busca permanece preenchido com o termo digitado

Cenário: Leitor compartilha a busca por link
  Dado que o leitor está vendo os resultados da busca por "kpop"
  Quando o leitor copia a URL da barra de endereços
  E envia para outra pessoa
  E essa outra pessoa abre o link em outro navegador
  Então a outra pessoa vê os mesmos resultados, na mesma ordem
  E o termo "kpop" aparece preenchido no campo de busca
```

**US30.1 Tasks** (technical terms ALLOWED):

| ID | Task description | Priority |
|---|---|---|
| `T30.1.1` | Implementar endpoint `GET /api/v1/search/articles?q=&tema=&cursor=` com paginação keyset assinada HMAC. | 🟠 |
| `T30.1.2` | Indexar coluna `tsvector` (Postgres `to_tsvector('portuguese', title \|\| ' ' \|\| body)`) com weights A/B/C. | 🟠 |
| `T30.1.3` | Criar componente React `<SearchPage>` com hook `useSearch` e debounce de 250ms. | 🟠 |
| `T30.1.4` | Implementar destaque do termo nos cards com `<mark>` + CSS amarelo `#FFE9A0`. | 🟡 |
| `T30.1.5` | Adicionar `loading` skeleton dos cards após 300ms de espera. | 🟡 |
| `T30.1.6` | Escrever testes pytest cobrindo CA01, CA02, CA05, CA06 (matriz com 12 termos). | 🟠 |
| `T30.1.7` | Escrever testes Playwright cobrindo os 3 cenários BDD acima. | 🟠 |

##### 🟦 US30.2 — Filtragem temática dos resultados da busca

| Field | Value |
|---|---|
| **ID** | `US30.2` |
| **Parent Feature** | `F-30` |
| **Priority** | 🟠 High |
| **Status** | Refining |
| **Target sprint** | Sprint 4 |
| **Covered ACs** | `CA07`, `CA10` |
| **Story Points** | 5 |

**US Description (the "Description" field in OpenProject — pt-BR BDD):**

```gherkin
# language: pt
Cenário: Leitor combina termo de busca com filtro de tema
  Dado que o leitor está na página de busca com o termo "kpop" digitado
  E existem 3 temas disponíveis: "Música", "Moda", "Cinema"
  Quando o leitor seleciona o filtro "Música" entre os chips acima da lista
  Então a lista é refeita exibindo apenas artigos do tema "Música" que contêm "kpop"
  E a URL passa a incluir o parâmetro tema=musica
  E o chip "Música" aparece em destaque (cor primária do Interpop)

Cenário: Leitor remove todos os filtros e mantém o termo
  Dado que o leitor está vendo resultados filtrados por "kpop" + tema "Música"
  Quando o leitor clica no "X" do chip "Música"
  Então a lista volta a exibir artigos de todos os temas com a palavra "kpop"
  E o parâmetro tema é removido da URL
  E o termo "kpop" continua preenchido no campo de busca
```

**US30.2 Tasks:**

| ID | Task description | Priority |
|---|---|---|
| `T30.2.1` | Adicionar parâmetro `tema` ao endpoint de busca; aplicar `WHERE article.tema_id = ANY(:temas)`. | 🟠 |
| `T30.2.2` | Implementar componente `<ChipFilter>` que sincroniza com query string via React Router. | 🟠 |
| `T30.2.3` | Cobrir os 2 cenários BDD acima com Playwright. | 🟠 |

---

## 📋 Cross-cutting Tasks (technical configurations that are NOT Features)

| ID | Description | Priority | For which US |
|---|---|---|---|
| `TX-12` | Adicionar índice `idx_article_search_vector` na migration `0008_search_index.sql`. | 🟠 | `T30.1.2` |
| `TX-13` | Configurar variável `SEARCH_DEBOUNCE_MS=250` no `.env.example` e em `config/settings/base.py`. | 🟡 | `T30.1.3` |
| `TX-14` | Adicionar lib `react-highlight-words` ao `package.json` (~5KB gz). | 🟡 | `T30.1.4` |

---

## 📊 Backlog summary

| Level | Count |
|---|---|
| Epics (including sub-Epics) | 1 |
| Features | 1 (`F-30`) |
| ACs | 12 (in 4 groups: Acesso, Comportamento, Apresentação, Tempo de resposta — **2 with `[...]` detail**: `CA06`, `CA07`) |
| User Stories | 2 (`US30.1`, `US30.2`) |
| BDD scenarios | 5 |
| Tasks (US-bound) | 10 |
| Cross-cutting Tasks | 3 |
| **Total Story Points** | **8 (Sprint 3) + 5 (Sprint 4) = 13** |

### Sprint plan

| Sprint | Focus | Story Points | Features delivered |
|---|---|---|---|
| Sprint 3 | Functional end-to-end basic search (US30.1) | 8 | — (Feature F-30 not yet 100%) |
| Sprint 4 | Thematic filters (US30.2) + relevance review | 5 | `F-30` 100% |

---

## 🔗 Traceability

| Requirement (RF/RNF) | Origin (requirements doc) | Feature | US | AC | BDD | Task | Test |
|---|---|---|---|---|---|---|---|
| RF-08: O leitor pode buscar artigos por texto livre | `REQUISITOS.md` §4.2 | `F-30` | `US30.1` | `CA01`, `CA05`, `CA06` | "Leitor realiza busca simples e visualiza resultados ordenados" | `T30.1.1`, `T30.1.2` | `backend/tests/test_search.py::test_busca_basica`, `e2e/search.spec.ts::busca-simples` |
| RNF-04: A primeira tela de busca deve aparecer em ≤800ms (p95) | `REQUISITOS.md` §5.3 | `F-30` | `US30.1` | `CA11` | (same scenario above) | `T30.1.2` | `backend/tests/test_search_perf.py::test_p95_under_800ms` |
| RF-09: O leitor pode filtrar busca por tema editorial | `REQUISITOS.md` §4.3 | `F-30` | `US30.2` | `CA07`, `CA10` | "Leitor combina termo de busca com filtro de tema" | `T30.2.1`, `T30.2.2` | `e2e/search.spec.ts::filtro-tema` |

---

## ⚖️ Falbo validation (7 dimensions per Feature)

| Feature | Complete | Correct | Consistent | Realistic | Necessary | Prioritizable | Verifiable |
|---|---|---|---|---|---|---|---|
| `F-30` | ✅ input/rule/output of each AC | ✅ reviewed with PO on 03/06 | ✅ ACs do not contradict each other | ✅ Postgres + tsvector already mastered | ✅ reader requested in UX research | ✅ 🟠 High | ✅ 12 tests covering ACs |

---

## 5. WORKED EXAMPLE B — Deeply nested Epic (*"Cadastro de Atletas"*, Doping Control system)

Example for large systems. Reflects the OpenProject screenshot from the *"IFPB"* ERS course.

> **Requirements document:** `docs/specs/controle-dopagem/REQUISITOS.md` (rev. of 12/11/2025)

### 🟦 EP-100 — Aplicação Web

| Field | Value |
|---|---|
| **ID** | `EP-100` |
| **Priority** | 🟠 High |
| **Belongs to** | *"Sistema de Controle de Dopagem"* (*"CNPq"* 487777/2013-1) |
| **Origin (requirements)** | RF-001 to RF-133 (total scope) |
| **Sub-Epics** | `EP-100.1` (Módulo Administrativo) and 9 other modules |

**Description:**

Toda a interface web do sistema nacional de controle antidopagem. Reúne dez módulos operacionais (Administrativo, Dopagem, *"STJD"*, *"OCD"*/*"Escoltas"*, Uso Geral, Financeiro, Estatístico, Técnico, Controle de Acesso) que atendem *"ABCD"*, *"COB"*, confederações esportivas, atletas e laboratórios credenciados.

---

### 🟦 EP-100.1 — Módulo Administrativo

| Field | Value |
|---|---|
| **ID** | `EP-100.1` |
| **Parent Epic** | `EP-100` |
| **Origin (requirements)** | RF-001 to RF-040 |
| **Sub-Epics** | `EP-100.1.1` (Gestão de Atletas), `EP-100.1.2` (Gestão de Médicos), … |

**Description:**

Módulo que reúne todas as operações de cadastro, consulta e relatório dos atores que participam de competições reguladas: atletas, médicos, confederações, federações, modalidades, competições, treinadores. É o módulo de **dados-mestres** do sistema — a partir dele os demais módulos (Dopagem, *"STJD"*, Financeiro) consomem dados.

---

### 🟦 EP-100.1.1 — Gestão de Atletas

| Field | Value |
|---|---|
| **ID** | `EP-100.1.1` |
| **Parent Epic** | `EP-100.1` |
| **Origin (requirements)** | RF-001 to RF-020 |
| **Sub-Epics** | `EP-100.1.1.1` (Cadastro), `EP-100.1.1.2` (Consulta), `EP-100.1.1.3` (Relatório) |

**Description:**

Conjunto de operações que dão ao operador da *"ABCD"*/confederação a visão completa de cada atleta: desde o cadastro inicial (dados pessoais, categorias, patrocinadores) até a consulta com filtros avançados e a geração de relatórios para fiscalização e prestação de contas.

---

### 🟦 EP-100.1.1.1 — Cadastro de Atletas

| Field | Value |
|---|---|
| **ID** | `EP-100.1.1.1` |
| **Parent Epic** | `EP-100.1.1` |
| **Origin (requirements)** | RF-001 to RF-010 |
| **Direct Features** | `F-200` Cadastro Básico, `F-201` Categorias Esportivas, `F-202` Patrocinadores, `F-203` Técnico, `F-204` Bolsa Atleta, `F-205` Equipe Médica, `F-206` Convocações, `F-207` Programas Especiais, `F-208` Clubes/Associações, `F-209` Resultados em Competições |

**Description:**

Conjunto de telas que permitem ao operador da confederação registrar e manter atualizado o cadastro completo de cada atleta nacional. O cadastro é segmentado em dez Features independentes, cada uma cobrindo um aspecto distinto da vida do atleta (dados pessoais, vínculos esportivos, suporte técnico, financeiro, médico e histórico competitivo). Cada Feature é entregue separadamente porque pode ser preenchida em momentos diferentes (não há ordem obrigatória além do cadastro básico vir antes dos demais).

---

### 🟩 F-200 — Cadastro Básico do Atleta

| Field | Value |
|---|---|
| **ID** | `F-200` |
| **Type** | Feature |
| **Parent Epic** | `EP-100.1.1.1` |
| **Priority** | 🔴 Immediate |
| **Origin (requirements)** | RF-001 |
| **Client-deliverable?** | Yes |

**Description:**

Tela de cadastro com os dados pessoais essenciais do atleta: nome completo, data de nascimento, *"CPF"*, gênero, nacionalidade, *"RG"* e endereço residencial. É o ponto de entrada do sistema para um novo atleta — sem este cadastro, nenhuma das outras Features de Gestão de Atletas pode ser usada. O operador da confederação preenche, valida e salva; o atleta passa a constar no sistema nacional.

#### F-200 Acceptance Criteria

##### 📋 CA - Cadastro dados pessoais

| ID | Description | Detail? |
|---|---|---|
| `CA01` | Apenas usuários autorizados (operador da confederação ou administrador *"ABCD"*) podem cadastrar atletas. | — |
| `CA02` | O sistema deve impedir o cadastro de dois atletas com o mesmo CPF. Caso já exista, exibir a mensagem "CPF já cadastrado para <nome do atleta>". | — |
| `CA03` | A data de nascimento deve resultar em uma idade entre 5 e 80 anos no momento do cadastro. Fora dessa faixa, o sistema exibe alerta de revisão. | — |
| `CA04` | O CPF deve ser validado quanto a formato e dígito verificador **[...]** | ✅ |

##### CA04 — Detail (in the item body)

```
Regras a serem aplicadas:
- O campo CPF é obrigatório.
- Deve estar no formato XXX.XXX.XXX-XX (com pontos e traço).
- O dígito verificador deve ser válido conforme regra da Receita Federal.
- Se inválido, exibir mensagem "CPF inválido" próximo ao campo, em vermelho.
- Não permitir o salvamento enquanto o CPF estiver inválido.
```

> *The remaining Features (F-201 to F-209) follow the same pattern. In a real backlog, each Feature has its own section with description, ACs, US, and Tasks.*

---

## ✅ Smell test (run before merging the backlog)

- [ ] **Did you check the requirements document before touching the backlog?** (date of the last check recorded at the top of BACKLOG.md)
- [ ] Does every Feature/US/CA have an **origin link** (`Origin (requirements)`) pointing to the corresponding item in the requirements document?
- [ ] Does every Epic/Feature/US/CA/RNF have a **description** in pt-BR without technical terms?
- [ ] Is every Feature **client-deliverable** (unambiguously)?
- [ ] Does every US have **BDD** in pt-BR with named scenarios (≥2 scenarios: happy + error/edge) in the US "Description" field?
- [ ] Is every AC **declarative, atomic, and testable**? Do ACs with sub-rules end with **`[...]`** and have "Regras a serem aplicadas:" in the body?
- [ ] Is every AC **inside a `CA - <Theme>` group** (even Features with only 1 AC)?
- [ ] Is the Epic **nested** when the domain has sub-classifications?
- [ ] Is every cross-cutting Task in **`TX-NN`**, outside the Epic/Feature/US hierarchy?
- [ ] **Priority** (🔴/🟠/🟡/🟢) on every node?
- [ ] **Stable IDs** (not renumbered on later changes)?
- [ ] **Traceability** RF/RNF → Feature → US → AC → BDD → Task → Test **complete** for each Feature?
- [ ] **Falbo validation** filled with a 1-line justification per dimension?
