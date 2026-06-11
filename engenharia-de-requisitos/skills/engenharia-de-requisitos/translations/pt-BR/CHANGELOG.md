# Changelog

All notable changes to the `engenharia-de-requisitos` Claude Code skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Status do pt-BR — espelho completo da v1.13.0 (2026-06-11)

> A partir da **v1.10.1** (e mantido na **v1.11.0**), `translations/pt-BR/` deixou de ser um snapshot congelado da v1.0.x e passou a ser um
> **espelho fiel** do conteúdo autoritativo en-CA. Tudo que evoluiu pós-1.0 está agora em pt-BR:
>
> - **SKILL.md** — retraduzida por inteiro: **§0** (checagem de estrutura obrigatória na primeira execução),
>   **§3.1** (alinhamento SDD), a subseção **EARS** na Fase B, e todas as regras/anti-padrões.
> - **`references/10-estrutura-projeto.md`** — estrutura on-disk `docs/` + `LEGACY-MONOLITH` + migração (v1.6/v1.7).
> - **`references/11-ears.md`** — EARS como camada de precisão opcional, com a tabela bilíngue dos 5 padrões (v1.8).
> - **`references/12-sdd-interop.md`** — interop OpenSpec/Spec Kit + links de referência dos frameworks (v1.9/v1.10).
> - **`references/13-confiabilidade-seguranca.md`** — RNF de dependabilidade & segurança: confiabilidade (POFOD/ROCOF/MTTF/AVAIL), segurança (safety/security, orientada a risco), resiliência (4R, RTO/RPO) (v1.11).
> - **`references/01–09`** + **`examples/`** — permanecem em pt-BR (idioma original do material-fonte).
> - **`examples/feature-step-defs/`** — step-defs BDD para 6 stacks (pytest-bdd/behave/cucumber-js/cucumber-playwright/Reqnroll/Behat); o **código** é neutro de idioma e vive na raiz, com README traduzido em pt-BR (v1.12).
> - **`examples/caso-saas-multitenant.md` · `caso-fintech-pagamentos.md` · `caso-governo-servicos.md`** — 3 casos de estudo trabalhados (SaaS multi-tenant, fintech, governo); prosa traduzida, artefatos/IDs/BDD em pt-BR (v1.13).
>
> Os stubs-ponteiro da v1.10.0 (`references/10–12`) foram **substituídos** por traduções completas.
>
> **Fonte autoritativa**: o en-CA na raiz do repositório continua sendo a fonte versionada e *lintada*. As referências
> `01–09` carregam apenas um drift **cosmético** de linhas em branco (markdownlint MD022/031/032) em relação ao en-CA —
> estrutura, headings, cercas de código e identificadores `RF`/`CA` verificados **idênticos**, sem lacuna de conteúdo.
> O CI roda markdownlint só no en-CA por design. Os assets (`scaffold-structure.sh`, `project-to-sdd.sh`) e o servidor
> MCP permanecem na raiz como artefatos executáveis únicos (não se traduzem).

---

## [1.0.1] — 2026-06-06

### Added — Source instructor attribution

- **README.md**: new sections "About the source instructor" (EN) and "Sobre a autora do material-fonte" (PT-BR) with the full academic and industrial credentials of **Prof. Dr. Juliana Dantas Ribeiro Viana de Medeiros** (IFPB), the creator and instructor of the course material that constitutes the primary corpus of this skill. Includes Lattes link, ORCID, doctoral thesis title (*"An approach to support the Requirements Specification in Agile Software Development"*, UFPE 2017 with sandwich period at Universidade Nova de Lisboa), active research lines, 20+ years of industrial experience, faculty positions, and academic citation format.
- **SKILL.md** §10 renamed to "Fonte primária e bibliografia canônica" with new §10.1 "Autora do material-fonte" giving formal credit and explaining why her credentials matter for the reliability of the skill's claims.
- **SKILL.md** §10.2: added Valente (2020) reference for MVP + A/B testing material added in §1.5.1 of `01-fundamentos.md`.

### Rationale

Per CC BY-SA 4.0 license requirements (Attribution), the source instructor of the primary corpus must be appropriately credited. This also provides academic and industrial provenance for users evaluating the trustworthiness of the skill's content.

---

## [1.0.0] — 2026-06-06

### Added — Initial public release

#### Core skill files
- `SKILL.md` — 10-section entry point with usage protocol, premise (requirement-as-leverage), bibliography, anti-patterns, and naming rules. Includes:
  - Regra 0 (source-of-truth document) — backlog never changes without document update first
  - Regra 9 (multiple root Epics) — no single "Epic-project" parent; root Epics are siblings
  - Regra 10 (FR/NFR/G also subject to all conventions — language, descriptions, traceability)
  - 13 anti-patterns (Connextra title in card, qualitative NFR, AC+BDD competing, etc.)

#### Reference documents (`references/`)
- `01-fundamentos.md` — FR vs NFR, stakeholders, feasibility study, requirements in any lifecycle model (Sommerville Figs 2.1–2.3), professional engineering analogy, canonical "tree-swing" cartoon, 7 real failure cases (Mariner, Hartford, Citibank, UEFA, INSS, IPTU SP, Boeing 737 MAX), MVP + A/B testing as modern complements (Valente 2020).
- `02-elicitacao.md` — Sommerville 5 difficulties + Christel & Kang + Kotonya; 6 techniques compared; full coverage of interviews (5W planning, question types, pyramid/funnel/diamond structures, recording).
- `03-especificacao.md` — Backlog hierarchy with multiple root Epics, document vs backlog artifact split (5.1.1 RF/RNF/G + 5.1.2 Epic/Feature/CA/US/Task), User Story history (1997 Chrysler C3 → 2004 Cohn), 3 Cs of Jeffries, INVEST checklist, Spike as backlog item type.
- `04-bdd-criterios-aceitacao.md` — Declarative AC style, BDD pt-BR, Three Amigos, Given/When/Then localized, `[...]` convention formalized (§2.5), `Funcionalidade:` Gherkin keyword false friend explained, anti-pattern §7.7 "Feature with BDD instead of description".
- `05-estimativa.md` — Story Points, modified Fibonacci, Planning Poker procedure, anchoring vs proportional comparison, Definition of Ready post-estimation.
- `05-convencoes-interpop.md` — **10 hard rules** (Regra 0 source-of-truth, no infinitives, no technical terms, pt-BR explicit, configs ≠ Features, Interpop priority scale, Feature has description + US has BDD, AC always grouped under `CA - <Tema>` + `[...]` convention, all artifacts have descriptions, multiple root Epics).
- `06-validacao.md` — Sommerville 5 checks + Falbo 7 dimensions, prototype fidelity levels (lo-fi/mid/hi-fi/functional), ML/AI validation extra layer (SBC 2.5).
- `07-mudanca-rastreabilidade.md` — Change management, RTM (Requirements Traceability Matrix), enduring vs volatile requirements.
- `08-analista-negocios.md` — BABOK v3, BPMN, AS-IS/TO-BE, MoSCoW, RICE, Kano.
- `09-etica-sbc.md` — Full SBC 002/2024 Code applied to requirements engineering decisions (privacy, ML/AI, inclusion, decommissioning).

#### Examples and templates (`examples/`)
- `caso-controle-dopagem.md` — Real CNPq 487777/2013-1 case (ABCD/COB); FR + NFR + business rules G + exceptions E; backlog with multiple root Epics (Aplicação Web + Mobile + Atividades de Apoio); Feature "Consulta GERAL de Atletas" worked end-to-end with 15 grouped ACs (4 with `[...]`), 3 sliced User Stories with BDD, Planning Poker estimation.
- `caso-interpop-moderacao.md` — Interpop ban hierarchy (dev/admin/editor/user); 9 ACs grouped in 3 themes; 6 ACs with `[...]` detailing; 5 User Stories with BDD; technical annex with `can_be_banned_by` exhaustive matrix.
- `template-backlog-openproject.md` — Full worked backlog template (Busca Editorial Interpop + Cadastro de Atletas) showing multiple root Epics, 4-level Epic nesting, AC grouping, `[...]` convention, BDD as US Description field content, smell test.
- `template-documento-requisitos.md` — Requirements document template (IEEE 830 + Sommerville + Wiegers) with worked Busca Editorial example, history-of-revisions section, smell test.
- `template-user-story.feature` — Gherkin pt-BR ready-to-copy `.feature` file with 4 scenarios + Scenario Outline + Python (pytest-bdd) and TypeScript (cucumber-playwright) step definition examples.

### Language status

- **en-CA**: declared as default in frontmatter; **content translation is on the roadmap**.
- **pt-BR**: all content currently written in Brazilian Portuguese (original source — IFPB course taught in Portuguese).

### Source corpus

Full IFPB course material (LECTURE 0 through LECTURE 10, including LECTURE 03 real case and LECTURE 09.2 estimation) processed integrally. Canonical bibliography:

- Sommerville 10e (Ch. 4 read integrally)
- Pressman 9e
- Wiegers & Beatty 3e
- Cohn — User Stories Applied (2004)
- Robertson & Robertson — VOLERE method
- Hull, Jackson & Dick — Requirements Engineering 4e
- Falbo (UFES) — lecture notes
- IIBA — BABOK Guide v3
- SBC — Resolution 002/2024 (Code of Ethics and Professional Conduct)
- Valente — *Engenharia de Software Moderna* (engsoftmoderna.info, MVP + A/B)

### License

Released under [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).

---

## Roadmap (post 1.0.0)

- **en-CA full content translation** of `references/` and `examples/`.
- Sommerville Chapters 11–14 (dependability, security, resilience) integration.
- More worked case studies (SaaS multi-tenant, fintech, government).
- Tooling integration scaffolds: Linear, Jira, Notion, GitHub Issues, Plane.
- Exportable PDF/Markdown checklists.
- `.feature` template variants per stack (pytest-bdd, behave, cucumber-js, cucumber-playwright, SpecFlow, Behat).
