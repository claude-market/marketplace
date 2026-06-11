# Template — Requirements Document (complete worked example)

> Template **filled with a real example**, not an empty skeleton. Use it as a concrete starting point for any project requirements document. Structure combines IEEE 830 (classical), Sommerville 10e Ch. 4, Wiegers 3e (Ch. 10), and the *"Interpop"* convention. Replace the example with your domain while keeping all conventions.
>
> **Note on language preservation**: section headers, hard rules, explanations, and the smell test are in **en-CA**. The **worked example body** (RF/RNF/G descriptions, business rules, glossary) is preserved in **pt-BR** because it reproduces the real *"Interpop"* *"Busca Editorial"* requirements document — translating would defeat the worked-example purpose.

---

## 0. The requirements document is the source of truth

**Rule zero (non-negotiable)**: this document is the **basis** of the project. Everything to be built is born here — backlog, sprint plans, code, tests. So:

- 📌 **Every scope change goes through this document FIRST**, then propagates to the backlog. Never the other way around.
- 🔁 **Changes are versioned** with date, author, reason, and impact (see §11 Revision history).
- 📎 **The project backlog points back** to this document (`Origin (requirements)` in every Epic/Feature/CA/RNF).
- ✋ **When a new need arises during implementation** (technical refinement reveals a gap, the client asks for an adjustment in conversation), the correct flow is: **(1)** record the discussion; **(2)** update this document; **(3)** propagate to the backlog; **(4)** only then implement. Skipping steps creates silent scope creep.

---

## 1. Hard rules (non-negotiable)

1. **Business language in pt-BR** across the whole document. REST endpoints, libs, frameworks, table names, shell commands, methods — none of this **goes here**. They go to the backlog (Tasks) or to technical ADRs. Whoever reads this document is the client, the PO, the analyst, the junior dev, the auditor — all must understand without a technical glossary.
2. **ALL artifacts have descriptions**: RF, RNF, business rules (G), user classes, constraints. Title alone is not enough; the description explains the "why" and "how the client will perceive this".
3. **Every rule is testable**. If the sentence contains vague adjectives ("fast", "friendly", "intuitive", "robust"), it is not a requirement — it is a wish. Rewrite with a metric or observable behaviour.
4. **Stable IDs** (`RF-NN`, `RNF-NN`, `G-NN`). IDs do not change when content evolves — only the version does.
5. **Every RF/RNF declares a source** (stakeholder, normative document, observation) — to validate and justify in review.
6. **Every RF/RNF declares a priority** (🔴 Immediate, 🟠 High, 🟡 Normal, 🟢 Low) — so the backlog inherits the order.

---

# Requirements Document — *"Interpop"* *"Busca Editorial"*

> **Project**: *"Interpop"* — Brazilian editorial of *"Soft Power"* (critical pop culture)
> **Version**: 1.2 (rev. of 28/05/2026)
> **Author**: *"Gabriel Marques"*
> **Approving stakeholders**: *"Gabriel Marques"* (dev/owner), editorial team (3 writers)
> **Corresponding backlog**: [`docs/specs/busca-editorial/BACKLOG.md`](../../../../Documentos/Projetos/interpop/docs/specs/busca-editorial/BACKLOG.md)

---

## 2. Introduction

### 2.1 Purpose

Specify the requirements for the **editorial search** feature of the *"Interpop"* site. Search lets readers find published articles by keyword and by thematic filters, and lets them share the search result via link. This document is the basis of the corresponding backlog and the reference for end-of-development validation.

### 2.2 Scope

Search covers **published articles** (not drafts, not those in moderation). Indexes three fields: title, summary, and body. Supports filtering by **editorial themes** (defined by the editorial team — currently: *"Música"*, *"Moda"*, *"Cinema"*, *"Literatura"*, *"Cultura Digital"*). Includes ranking by relevance (decreasing weight title > summary > body, tiebreak by date) and link sharing.

**Out of scope (v1.2)**: search by author, search within comments, semantic search via embeddings, term suggestions while the reader types ("autocomplete"). These may become future Epics.

### 2.3 Definitions, acronyms, and abbreviations

| Term | Meaning |
|---|---|
| **Reader** | Site visitor, authenticated or anonymous, who consumes editorial content. |
| **Article** | Published editorial text, with title, summary, body, author, date, theme. |
| **Editorial theme** | Fixed category defined by the editorial team. Currently 5 (*"Música"*, *"Moda"*, *"Cinema"*, *"Literatura"*, *"Cultura Digital"*). |
| **Relevance** | Numeric score computed by the position of the searched term (title > summary > body) and by article date (most recent wins tiebreak). |
| **p95** | 95th percentile of response time — 95% of requests respond in ≤ the declared value. |
| **CWV** | Core Web Vitals (LCP, INP, CLS) — Google's quality-perceived metrics. |

### 2.4 External references

- *"LGPD"* (*"Lei nº 13.709/2018"*) — protection of reader personal data (stored queries, if any).
- WCAG 2.2 AA — accessibility of the search interface.
- *"Interpop"* editorial guideline, v3 (2026-03) — defines themes and moderation criteria.

---

## 3. Overall description

### 3.1 Product perspective

Search is a cross-cutting feature of the *"Interpop"* site. It appears as a top-menu item on every page and as a highlighted field on the home page. Not an isolated application; reuses the published-articles index already maintained by the internal CMS. Integrates with the existing thematic-filter layer (previous Epic `EP-09`).

### 3.2 User classes

| Class | Description | Expected usage frequency |
|---|---|---|
| **Anonymous reader** | Visitor without registration. May search and read. Highest volume of use. | ~70% of searches. Several searches per session. |
| **Registered reader** | Reader with an account (favourites articles, comments). Same search behaviour. | ~20%. Behaviour similar to anonymous. |
| **Writer/Editor** | Editorial team member. Uses search to review their own and team's publications. | ~5%. More specific searches, with author name (future). |
| **Admin/Dev** | Operational team. Uses search to validate content, debug, monitor. | ~5%. Frequent searches, with technical terms. |

### 3.3 Project constraints

| Type | Constraint |
|---|---|
| **Mandatory technology** | Backend Django 5 + Postgres; frontend React 19 + Vite. (Project stack.) |
| **Hosting** | *"Hostinger"* KVM 1 — 1 CPU, 4GB RAM. Limits CPU-intensive use for indexing. |
| **Budget** | No paid license. Only free libs. No external search service (Algolia, Elasticsearch hosted, etc.) in v1.2. |
| **Compliance** | *"LGPD"*: anonymous-reader queries cannot be associated with a persistent identifier without explicit consent. |
| **Accessibility** | WCAG 2.2 AA: search field navigable by keyboard, minimum contrast 4.5:1, messages read by screen reader. |

### 3.4 Assumptions and dependencies

- **Assumption 1**: the archive grows at a controlled pace (10–30 articles/month). No need for dynamic real-time re-indexing — nightly update suffices for v1.2.
- **Assumption 2**: 99% of searches are in pt-BR. English stop words can be ignored to simplify v1.2.
- **Dependency 1**: the editorial-themes Feature (`EP-09`) has been in production since Sprint 1.
- **Dependency 2**: the Postgres `tsvector` index must be available (default extension, OK in Postgres 16).

---

## 4. Stakeholders

Identification per Wiegers 3e (Ch. 6) — 5 criteria: who uses, who decides, who is affected, who approves, who provides input.

| Stakeholder | Interest | Participation type |
|---|---|---|
| **Reader (anonymous + registered)** | Find articles quickly. Clean screen, no friction. | End user — input via UX research. |
| **Editorial team (3 writers)** | Ensure their articles are findable. Validate that thematic filters reflect the editorial. | Approval of relevance criteria. |
| ***"Gabriel"* (dev/owner)** | Technical sustainability (KVM 1). Maintainability. *"LGPD"* compliance. | Final technical decider. Approves trade-offs. |
| **External auditor (hypothetical)** | *"LGPD"*: reader queries do not create a profile without consent. WCAG 2.2 AA met. | Compliance validation. |

---

## 5. Functional Requirements

### RF-08 — Busca por texto livre

| Field | Value |
|---|---|
| **ID** | `RF-08` |
| **Priority** | 🟠 High |
| **Source** | Reader (UX research 04/2026); editorial team. |
| **Validation** | Editorial team 28/05/2026 (minutes in Notion). |

**Description:**

O sistema deve permitir que qualquer leitor (anônimo ou cadastrado) digite um termo (palavra ou frase curta) e receba a lista de artigos publicados que contêm aquele termo no título, no resumo ou no corpo. Os resultados são ordenados por relevância (artigos com o termo no título aparecem primeiro). A busca deve funcionar em qualquer página do site através de campo no menu superior, e em destaque na página principal.

**Acceptance criterion (summary — full detail in backlog F-30)**:

A primeira tela de resultados deve aparecer em ≤800ms para acervo de até 5.000 artigos. A busca deve ser case-insensitive e diacritic-insensitive (digitar "POP" ou "pop" ou "póp" deve retornar os mesmos artigos). A busca não deve depender de login.

### RF-09 — Filtragem da busca por tema editorial

| Field | Value |
|---|---|
| **ID** | `RF-09` |
| **Priority** | 🟠 High |
| **Source** | Editorial team (meeting 15/03/2026); reader (recurrent suggestion in UX research). |
| **Validation** | Editorial team 28/05/2026. |

**Description:**

O sistema deve permitir que o leitor refine a busca por texto livre selecionando um ou mais temas editoriais (Música, Moda, Cinema, Literatura, Cultura Digital). Os filtros aparecem como chips clicáveis acima da lista de resultados; selecionar um filtro reduz a lista; remover todos os filtros volta a considerar todos os temas. A combinação de termo de busca + filtro de tema é a forma mais comum esperada de uso (≥60% das buscas, segundo pesquisa).

### RF-10 — Compartilhamento da busca por link

| Field | Value |
|---|---|
| **ID** | `RF-10` |
| **Priority** | 🟡 Normal |
| **Source** | Reader (UX research 04/2026, social-media comment). |
| **Validation** | *"Gabriel"* 28/05/2026. |

**Description:**

A URL da página de busca deve preservar o termo digitado e os filtros aplicados, de forma que ao copiar e enviar o link, o destinatário visualize os mesmos resultados (mesma ordem, mesmos filtros). Isso transforma cada busca em um link compartilhável — útil para a equipe editorial divulgar "tudo o que a gente já cobriu sobre kpop" sem mandar lista manual.

---

## 6. Non-Functional Requirements

Classical Sommerville organization: product · organizational · external.

### 6.1 Product requirements

#### RNF-04 — Tempo de resposta da primeira tela de busca

| Field | Value |
|---|---|
| **ID** | `RNF-04` |
| **Category** | Product — Performance |
| **Priority** | 🟠 High |
| **Source** | *"Interpop"* guideline (CWV — LCP ≤ 2.5s). |

**Description:**

A primeira tela de resultados da busca deve aparecer em ≤800ms (p95) para acervo de até 5.000 artigos publicados, medido na rede 4G simulada do Lighthouse. Quando o tempo exceder 800ms, o sistema deve mostrar um indicador visual de carregamento (skeleton dos cards) em até 300ms após o início da consulta — para que o leitor não tenha impressão de tela travada.

**How to verify:**

Automated performance test in CI: `backend/tests/test_search_perf.py::test_p95_under_800ms` measures 100 searches with varied terms across a simulated 5k-article archive and computes p95.

#### RNF-05 — Acessibilidade WCAG 2.2 AA

| Field | Value |
|---|---|
| **ID** | `RNF-05` |
| **Category** | Product — Accessibility |
| **Priority** | 🟠 High |
| **Source** | *"Interpop"* guideline (mandatory accessibility). |

**Description:**

A tela de busca e todos os seus elementos interativos (campo de texto, botão de submit, chips de filtro, cards de resultado, botão "Carregar mais") devem ser navegáveis por teclado. Mensagens dinâmicas (resultado de busca, ausência de resultado, indicador de carregamento) devem ser anunciadas por screen reader via ARIA live regions. Contraste mínimo 4.5:1 em todos os textos.

**How to verify:**

Automated audit `axe-core` in CI (≥95 score) + manual review with NVDA before each release.

### 6.2 Organizational requirements

#### RNF-06 — Stack obrigatória

| Field | Value |
|---|---|
| **ID** | `RNF-06` |
| **Category** | Organizational — Technology |
| **Priority** | 🔴 Immediate |
| **Source** | *"Gabriel"* (technical project decision). |

**Description:**

A busca deve ser implementada usando apenas as tecnologias já presentes no stack do Interpop: backend Django 5 + DRF + Postgres 16 (com `tsvector` e índice GIN); frontend React 19 + Vite. Sem serviço externo de busca (Algolia, Elasticsearch hosted, Meilisearch SaaS) na v1.2. Sem nova lib paga.

### 6.3 External requirements

#### RNF-07 — Conformidade com LGPD

| Field | Value |
|---|---|
| **ID** | `RNF-07` |
| **Category** | External — Compliance |
| **Priority** | 🔴 Immediate |
| **Source** | *"Lei nº 13.709/2018"*; *"Interpop"* privacy guideline. |

**Description:**

Os termos buscados por leitores anônimos não devem ser associados a identificador persistente (cookie, fingerprint) sem consentimento explícito do leitor. O sistema pode coletar termos de busca de forma agregada (estatística geral, sem ligação ao leitor individual) — mas não pode montar perfil de busca individual sem opt-in. Logs de busca devem ser retidos por no máximo 90 dias e ser anonimizados (sem IP completo) antes de qualquer análise.

---

## 7. Business Rules

Editorial-domain rules that are neither RF nor RNF — they are *"Interpop"* business constraints.

### G-01 — Artigos em moderação não aparecem

| Field | Value |
|---|---|
| **ID** | `G-01` |
| **Priority** | 🔴 Immediate |
| **Source** | *"Interpop"* editorial policy. |

**Description:**

Artigos com status `em moderação` (pendentes de revisão editorial após denúncia) NUNCA devem aparecer em resultados de busca, mesmo para o autor original. Só artigos com status `publicado` são buscáveis. Esta regra protege a equipe editorial e os leitores de exposição precoce a conteúdo sob revisão.

### G-02 — Temas editoriais são fixos

| Field | Value |
|---|---|
| **ID** | `G-02` |
| **Priority** | 🟠 High |
| **Source** | *"Interpop"* editorial guideline, v3. |

**Description:**

Os temas editoriais (Música, Moda, Cinema, Literatura, Cultura Digital) são definidos pela equipe editorial e fixos na v1.2. Mudança no conjunto de temas exige decisão editorial (não é decisão técnica), revisão da especificação e migração dos artigos existentes. A v1.2 não permite cadastro dinâmico de temas via interface.

---

## 8. Main flow diagram

> Example of main flow — reader searches + filters:

```
[Reader opens the site]
        │
        ▼
[Sees search field in top menu + initial screen with articles]
        │
        ▼
[Types term + (optional) selects theme chips]
        │
        ▼
[System validates term (2-100 chars) and queries Postgres with tsvector]
        │
        ▼
[Results ranked by relevance (title > summary > body) + date]
        │
        ▼
[Screen renders 20 cards + URL updated with term + filters]
        │
        ▼
[Reader may "Load more", click on a card, or copy URL to share]
```

---

## 9. Glossary (project-specific terminology)

| Term | Definition |
|---|---|
| **Article** | Editorial text published on *"Interpop"*, with title, summary, body, author, date, theme. |
| **Editorial** | Critical content produced by the *"Interpop"* team about pop culture (music, fashion, cinema, etc.). |
| **Theme** | Fixed category classifying articles. v1.2 has 5 themes. |
| ***"Soft Power"*** | Joseph Nye's concept (1990) — the ability to influence through culture, values, narrative. Editorial focus of *"Interpop"*. |

---

## 10. Annexes

### 10.1 Prototypes

> In a real project, links or images of approved lo-fi and hi-fi prototypes.

- Lo-fi wireframe `docs/specs/busca-editorial/protótipo-v1-lofi.png` (15/04/2026)
- Hi-fi Figma `https://figma.com/file/...` (10/05/2026, approved by the editorial team on 12/05)

### 10.2 UX research (source of some RFs)

- Report `docs/specs/busca-editorial/pesquisa-ux-04-2026.md` — interviews with 12 readers, questions on how they searched content in the current site.

---

## 11. Revision history

> **Every change in the document creates a new entry here.** The backlog does not change unless this table is updated first.

| Version | Date | Author | Change | Backlog impact |
|---|---|---|---|---|
| 1.0 | 12/03/2026 | *"Gabriel"* | Initial version. RF-08 (text search) + RNF-04 (response time). | Creation of `EP-10` + `F-30`. |
| 1.1 | 15/03/2026 | *"Gabriel"* | Added RF-09 (thematic filter) after meeting with the editorial team. | Creation of `F-31`. |
| 1.2 | 28/05/2026 | *"Gabriel"* | Added RF-10 (link sharing) after UX research. RNF-04 adjusted: was 1000ms p95, became 800ms p95 after CWV study. RNF-07 (*"LGPD"*) made explicit. | Creation of `F-32`. `CA11` of `F-30` adjusted from 1000ms to 800ms. Note in `BACKLOG.md` (date 28/05). |

---

## 12. Approval

| Stakeholder | Role | Date | Form |
|---|---|---|---|
| *"Gabriel Marques"* | dev/owner — final approver | 28/05/2026 | Signed git commit (`c8c5c7c`). |
| Editorial team (3 writers) | Editorial approval | 28/05/2026 | Notion minutes `notion.so/...`. |

---

## ✅ Requirements-document smell test

- [ ] Does every RF/RNF/G have a **description** in pt-BR without technical terms (no URL, no method name, no table name)?
- [ ] Does every RF/RNF/G have a **declared source** (who asked, when)?
- [ ] Does every RF/RNF/G have a **priority** (🔴/🟠/🟡/🟢)?
- [ ] Have vague adjectives ("fast", "friendly", "intuitive", "robust") been replaced by **a metric or observable behaviour**?
- [ ] Are constraints, assumptions, and dependencies **explicit** (§3.3, §3.4)?
- [ ] Are stakeholders identified by Wiegers's 5 criteria (§4)?
- [ ] Does the glossary cover all domain terms appearing in the document?
- [ ] Is the revision history (§11) updated with the last change and its backlog impact?
- [ ] Does the corresponding backlog (link at the top) reference this document in every Epic/Feature?
