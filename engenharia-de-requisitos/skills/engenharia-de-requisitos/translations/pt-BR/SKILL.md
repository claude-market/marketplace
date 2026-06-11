---
name: engenharia-de-requisitos
description: Use quando o usuário estiver fazendo engenharia de requisitos, análise de negócios, ou tarefas de engenharia de software que envolvam descobrir, especificar, validar ou gerenciar requisitos de software. Gatilhos incluem (EN): requirements elicitation, stakeholder interviews, writing user stories, defining acceptance criteria, writing BDD scenarios, writing EARS statements, Planning Poker estimation, prototype validation of requirements, building a backlog (Epic → Feature → US → AC → Task), refining FRs/NFRs, requirement↔code↔test traceability, requirements change management, business analysis (AS-IS / TO-BE), professional computing ethics. Gatilhos (PT-BR): levantar requisitos, entrevistar stakeholders, escrever user stories, definir critérios de aceitação, escrever cenários BDD, escrever requisitos em EARS, estimar com Planning Poker, validar requisitos com protótipos, montar backlog (Epic → Feature → US → CA → Task), refinar RFs/RNFs, rastreabilidade requisito↔código↔teste, gestão de mudança de requisitos, análise de negócios (AS-IS / TO-BE), ética profissional em computação. Aplica-se a projetos novos (sem requisitos ainda) e a evoluções (mudanças em requisitos existentes). Não é a skill certa para implementação pura de código — é para o ESTÁGIO ANTES (descobrir o que construir) e DEPOIS (validar que o que foi construído está correto).
language: en-CA
available_translations:
  - pt-BR
content_status:
  en-CA: complete — entry point (SKILL.md w/ mandatory §0 first-run structure check + §3.1 SDD alignment, README.md, CHANGELOG.md), references/ (14 files, incl. 10-estrutura-projeto.md + 11-ears.md + 12-sdd-interop.md + 13-confiabilidade-seguranca.md), examples/ (8 files — incl. worked case studies for SaaS multi-tenant, fintech/payments, and government services + feature-step-defs/ — 6-stack BDD step-def skeletons), and assets/ (scaffold-structure.sh — GREENFIELD/HAS-STRUCTURE/LOOSE-FILES/LEGACY-MONOLITH · project-to-sdd.sh — OpenSpec/Spec Kit projection). Brazilian acronyms (RF, RNF, G, CA, US, EP-NN, etc.) and domain terms in *italic+quotes* preserved by design.
  pt-BR: complete — espelho fiel da v1.13.0 traduzido para pt-BR (SKILL.md com a checagem §0 de estrutura obrigatória de primeira execução + alinhamento SDD §3.1 + a subseção EARS na Fase B). Os 14 arquivos de referência (incl. 10-estrutura-projeto.md + 11-ears.md + 12-sdd-interop.md + 13-confiabilidade-seguranca.md), os exemplos (8, incl. casos SaaS/fintech/governo + feature-step-defs/ — step-defs BDD de 6 stacks), os assets (scaffold-structure.sh — GREENFIELD/HAS-STRUCTURE/LOOSE-FILES/LEGACY-MONOLITH · project-to-sdd.sh — projeção OpenSpec/Spec Kit) e os validadores MCP permanecem na raiz do repositório como fonte autoritativa em en-CA. Siglas brasileiras (RF, RNF, G, CA, US, EP-NN, etc.) e termos de domínio em *itálico+aspas* preservados por design.
source: https://github.com/seekdevcore/sk-requirements-engineering-theskill
risk: safe
license: CC-BY-SA-4.0
date_added: 2026-06-01
version: 1.13.0
---

# Engenharia de Requisitos (ERS) + Análise de Negócios + Ética Profissional

> Skill construída a partir das 11 aulas do curso de ERS (*Engenharia de Requisitos de Software* / Software Requirements Engineering) do *"IFPB"* Campus João Pessoa (Prof. Dr. *"Juliana Dantas Ribeiro Viana de Medeiros"*), Sommerville 10e (Cap. 4), Pressman, Wiegers, Falbo, BABOK, e o Código de Ética SBC 002/2024. **Nota sobre terminologia**: o curso-fonte original está em português do Brasil; este conteúdo padrão em inglês mantém termos de domínio específicos do Brasil em *"pt-BR com itálico + aspas"* (ex.: *"IFPB"*, *"Interpop"*, *"ABCD"*, *"Bolsa Atleta"*). As palavras-chave de Gherkin são traduzidas para Given/When/Then; os equivalentes pt-BR (Dado/Quando/Então) estão disponíveis em `translations/pt-BR/`.

---

## 0. PRIMEIRA AÇÃO — checagem do estado da estrutura (OBRIGATÓRIA, roda uma vez por projeto, antes de qualquer outra coisa)

> 🔴 **Isto não é opcional e não é por último — é a PRIMEIRA coisa que esta skill faz no momento em que é aplicada a um projeto/pasta, antes de produzir ou editar um único requisito.** Assim como a elicitação precede a especificação, a estrutura em disco precede o primeiro requisito. **O usuário não precisa pedir.** Detectar que a estrutura está faltando *é em si a instrução para construí-la*. Pular este passo é o modo de falha nº 1 das versões mais antigas desta skill — elas escreviam um `REQUISITOS*.md` solto e nunca construíam a espinha de rastreabilidade, deixando todo artefato posterior sem casa.

**Por que primeiro.** Um requisito sem lugar para viver é um órfão. A estrutura em disco — `docs/requirements/` (o *porquê/o quê*) + `docs/backlog/` (o *quem/o quê/quando*) + ADRs, tudo sob uma única raiz `docs/` (§5 Fase B + [`references/10-estrutura-projeto.md`](references/10-estrutura-projeto.md)) — **é** a fonte física da verdade (§2.1, regra zero). Se ela não existe, a rastreabilidade é impossível e o backlog não tem âncora. Portanto a estrutura vem **antes** da primeira nota de entrevista.

### O protocolo (rode em ordem — NÃO pule para a elicitação)

1. **Analise o projeto automaticamente — ganhe contexto antes de perguntar ao usuário qualquer coisa que você mesmo possa ler.** Inspecione o que já está lá: uma pasta `references/`, quaisquer documentos existentes de requisitos / especificação / proposta (`.md`, `.pdf`, `.docx`), o `README`, módulos de código-fonte, papéis/níveis de auth, entidades de domínio, manifestos de stack. Este é o Passo 1 do protocolo de Adaptação ([`references/10-estrutura-projeto.md §9`](references/10-estrutura-projeto.md)). Leia primeiro; pergunte apenas o que o projeto não consegue lhe dizer.
2. **Detecte o estado da estrutura.** Rode o scaffolder em dry-run — ele classifica o alvo e não toca em nada:

   ```bash
   SC=~/.claude/skills/engenharia-de-requisitos/assets/scaffold-structure.sh
   bash "$SC"            # detect + preview only
   ```

   Veredictos: **GREENFIELD** (sem espinha `docs/`) · **HAS-STRUCTURE** (já organizado) · **LOOSE-FILES** (arquivos `RF-*`/`RNF-*`/`EP-*`/`F-*`/… soltos fora de suas casas) · **LEGACY-MONOLITH** (um único documento de requisitos — ex.: `REQUISITOS*.md`, `requisitos.md`, um `template-documento-requisitos.md` preenchido — produzido por uma versão pré-`docs/` desta skill e nunca dividido na espinha).

3. **Resolva duas decisões com o usuário antes de fazer o scaffolding — infira primeiro, recomende um padrão, pergunte apenas quando genuinamente ambíguo (nunca interrogue em casos óbvios).** Cada uma é decisão do usuário porque cada uma muda o formato do repositório:

   - **(a) `specs/` vs `--no-specs` — isto fixa o tiering de ADR.** Infira da tabela de decisão da §10 ([`references/10-estrutura-projeto.md §10`](references/10-estrutura-projeto.md)): um projeto solo/pequeno cujas features cabem em uma cabeça → **`--no-specs`** (ADRs de tier único, todos em `planning/adrs/`); features abrangendo ≥3 camadas, críticas em perf/segurança, design-first (SDD), ou sob pressão de auditoria/regulatória → **`--with-specs`** (ADRs de dois tiers: `planning/adrs/` + `specs/<feature>/adrs/`, uma numeração global contínua). Sinais claros → declare o padrão escolhido e prossiga. **Ambíguo → `AskUserQuestion`**, porque a escolha decide onde *cada ADR futuro* vive. ⚠️ O scaffolder usa `--with-specs` por padrão; passe `--no-specs` explicitamente quando o layout mais leve for escolhido.

   - **(b) Backfill de trabalho não documentado — APENAS em projeto existente (HAS-STRUCTURE / LOOSE-FILES / LEGACY-MONOLITH), nunca greenfield.** Quando o projeto já tem código/features que entraram *sem* a documentação de ERS que esta skill define, **`AskUserQuestion`** se deve fazer o **backfill**: escrever retroativamente o `RF`/`RNF` do que já existe, os Epics/Features do que já foi entregue, e ligar `RF ↔ EP ↔ F` nos dois sentidos ([`references/10-estrutura-projeto.md §9 Passo 2.7`](references/10-estrutura-projeto.md)). O backfill pode ser grande, então ofereça o escopo explicitamente: **(1)** backfill completo de toda a documentação pendente agora · **(2)** semeie apenas as partes que a tarefa atual toca · **(3)** apenas estrutura, backfill depois. Recomende **(2)** a menos que o usuário queira um mapa retroativo completo. Greenfield não tem nada para backfill — pule esta pergunta inteiramente.

4. **Aja sobre o veredicto — nunca pare em "bem, já tem um doc"** (rode `--apply` com a flag escolhida em 3a):

   | Veredicto | Ação obrigatória |
   |---|---|
   | **GREENFIELD** | `bash "$SC" --apply` (± `--with-specs`/`--no-specs` conforme 3a) → cria a estrutura padrão, depois adapte as sementes (§9). Sem backfill (nada pré-existente). |
   | **HAS-STRUCTURE** | Reaplique (idempotente) para preencher apenas lacunas; nunca sobrescreva. Ofereça backfill (3b) para trabalho existente não documentado. |
   | **LOOSE-FILES** | Reaplique → reorganiza automaticamente os arquivos soltos para dentro da árvore (ref §8). Ofereça backfill (3b). |
   | **LEGACY-MONOLITH** | **Migre.** Faça o scaffold, depois **divida** o documento monolítico em arquivos `RF-*` / `RNF-*` por módulo, personas e glossário — mantendo o monólito original como uma visão geral consolidada que liga *para dentro* da divisão. Ofereça backfill (3b) para código/features que entraram além do que o monólito documenta. Caminho de upgrade para qualquer projeto pré-estrutura. |

5. **Adapte as sementes genéricas a ESTE projeto** (protocolo de Adaptação, [`references/10-estrutura-projeto.md §9`](references/10-estrutura-projeto.md)): um `RF` por módulo real, personas dos papéis reais, glossário das entidades de domínio reais, apenas os RNFs que se aplicam (quantitativos). **Nunca faça commit de arquivos placeholder** (`<...>`, `RF-NNN`, `EP-NN`).
6. **Só agora** prossiga para o que o usuário pediu — elicitação, uma nova feature, um refinamento de backlog. A estrutura já existe para recebê-lo.

> **Gatilho de migração (o bug exato que esta seção fecha).** Se um projeto contém requisitos como um **único arquivo solto** *e* **não tem espinha `docs/`**, você está olhando para a saída de uma versão desta skill que precedeu a estrutura em disco. A resposta correta é rodar a migração do passo 3 **imediata e automaticamente** — não perguntar "você quer uma estrutura?". A ausência da espinha é o gatilho.

---

## 1. Quando esta skill se aplica (gatilhos)

Invoque **antes de**:

- Começar um novo produto sem requisitos escritos
- Adicionar uma feature substancial a um produto existente
- Discutir o que será entregue em uma sprint
- Escrever ou refatorar user stories, critérios de aceitação, cenários BDD
- Estimar esforço de história (Planning Poker, Story Points)
- Avaliar se um requisito proposto está completo / correto / consistente / realista / necessário / priorizável / verificável
- Decidir entre construir vs. comprar (estudo de viabilidade)
- Elicitar requisitos não-funcionais (performance, segurança, usabilidade, acessibilidade, conformidade regulatória)
- Discutir rastreabilidade entre requisito ↔ teste ↔ código
- **Ser aplicada a um projeto pela primeira vez (ou migrar um de uma versão mais antiga da skill)** — a checagem da estrutura em disco em **[§0](#0-primeira-ação--checagem-do-estado-da-estrutura-obrigatória-roda-uma-vez-por-projeto-antes-de-qualquer-outra-coisa)** é a primeira ação obrigatória; não é apenas um gatilho entre muitos
- Configurar ou **reorganizar a estrutura de documentação em disco** de um projeto (`requirements/` + `backlog/` + `specs/` + ADRs) — veja [references/10-estrutura-projeto.md](references/10-estrutura-projeto.md) + o scaffolder [assets/scaffold-structure.sh](assets/scaffold-structure.sh)
- Apoiar análise de negócios (mapear AS-IS, desenhar TO-BE)
- Decisões com componente ético: privacidade, ML/IA, descomissionamento de sistema, falha em projetar para inclusão

**NÃO invoque** para tarefas puramente de implementação (codar, debugar, refatorar código já especificado). Para essas, use skills de programação/debugging — ERS vem **antes** (o quê / por quê) e **depois** (foi a coisa certa entregue?), não no meio (como codar).

---

## 2. Premissa central (não-negociável)

> **Requisito ruim = produto ruim.** Não importa quão boa seja a implementação: se o requisito está errado, ambíguo, incompleto ou inviável, o sistema entregue não resolve o problema real. Sommerville (4.5): *"The cost of fixing a requirements problem by changing the system is normally much greater than fixing design or coding errors."*

Por isso, ERS é o estágio de maior alavancagem do ciclo de software. **Não pule.** Mesmo em projetos ágeis pequenos, cada card de backlog é um requisito — só mudam o nível de formalismo e o ciclo de revisão.

### 2.1 O documento de requisitos é a fonte da verdade (regra zero)

**O backlog NUNCA muda a menos que o documento de requisitos mude primeiro.** O backlog é uma materialização do documento — ele organiza, fatia e prioriza — mas não decide escopo por conta própria.

Isto significa:

- 🔁 **Antes de tocar em qualquer Epic/Feature/CA/RNF no backlog, verifique se o documento de requisitos foi alterado.** O cliente pode pedir para adicionar/alterar/remover requisitos durante o projeto — essas mudanças devem propagar primeiro para o documento, depois para o backlog.
- 📎 O backlog **referencia de volta** ao documento (todo Epic/Feature/CA tem um campo `Origem (requisitos)` apontando para o `RF-NN`/`RNF-NN` correspondente).
- ⚠️ Uma mudança que aparece diretamente no backlog sem uma origem documentada é **suspeita**: ou é *scope creep* (escopo crescendo sem aprovação), ou é refinamento puramente técnico (deveria virar uma Task, não uma Feature). Em qualquer caso, registre-a no documento primeiro.
- 📅 O documento de requisitos tem um **histórico de revisão** (versão, data, autor, mudança, impacto no backlog). Sem ele, ninguém lembra o que foi combinado em uma conversa de WhatsApp de três sprints atrás.

**Padrão prático**: o `BACKLOG.md` tem no topo um link para o `REQUISITOS.md` + a data da última checagem (`Última checagem do documento de requisitos: DD/MM/YYYY — sem mudanças`).

Templates prontos para copiar em [examples/template-documento-requisitos.md](examples/template-documento-requisitos.md) e [examples/template-backlog-openproject.md](examples/template-backlog-openproject.md).

---

## 3. O processo (mapa do território)

Sommerville e o curso do *"IFPB"* adotam o **processo iterativo em espiral** (Fig 4.6 do livro):

```
                ┌─────────────────────────┐
                ↓                         │
   ┌──────────────────┐         ┌──────────────────┐
   │  Elicitation &   │ ──────→ │  Requirements    │
   │  analysis        │         │  specification   │
   │  (discovery)     │         │  (documentation) │
   └──────────────────┘         └──────────────────┘
                ↑                         │
                │                         ↓
                │              ┌──────────────────┐
                └────────────  │  Requirements    │
                               │  validation      │
                               │  (verification)  │
                               └──────────────────┘
                                         │
                                         ↓
                                Requirements document
```

Cruzando as 3 fases, **dois processos contínuos**:

- **Gestão de mudança** (Sommerville 4.6): requisitos mudam — sempre. É preciso um processo para avaliar impacto + custo antes de aceitar.
- **Rastreabilidade**: todo requisito tem um ID; toda decisão de design, teste e linha de código deve ser ligável de volta ao requisito que justifica sua existência.

Sub-processo dentro da Elicitação (Sommerville Fig 4.7):
**Descoberta → Classificação/Organização → Priorização/Negociação → Documentação** (em loop, com feedback contínuo).

### 3.1 Alinhamento com Spec-Driven Development (Requirements → Design → Tasks)

As ferramentas SDD de 2026 (AWS *Kiro*, GitHub *Spec Kit*) convergiram para um vocabulário de três fases. Esta skill já
produz cada um desses artefatos — a tabela abaixo é um **alinhamento de rastreabilidade**, uma *re-rotulagem* que
permite à skill se conectar ao ecossistema SDD. **NÃO é um gate em cascata**: a espiral acima ainda manda
(a elicitação itera, o design evolui, INVEST + sprints/ondas continuam ágeis). Use os nomes SDD ao falar com
ferramentas SDD; use o processo de ERS ao trabalhar de fato.

| Fase SDD | "the spec is the prompt" → produz | Onde já vive nesta skill |
|---|---|---|
| **Requirements** | *o quê* construir | `docs/requirements/` (`RF`/`RNF`) + `docs/backlog/` (Epic→Feature→CA·US·BDD) — Fase A/B, opcionalmente formulado em EARS (§5 Fase B, [`references/11-ears.md`](references/11-ears.md)) |
| **Design** | *como* construir | os **ADRs** — `docs/planning/adrs/` (tier-1) + `docs/specs/<feature>/adrs/` (tier-2), uma numeração global ([`references/10-estrutura-projeto.md §5`](references/10-estrutura-projeto.md)) |
| **Tasks** | *em que ordem* | as Tasks `T`/`TX` dentro de cada Feature (`docs/backlog/features/F-NN.md`) |

> Os ADRs vivem em `docs/planning/adrs/` (+ `docs/specs/<feature>/adrs/`) — **não** em um `docs/adr/` plano. Mantenha o
> esquema de dois tiers; o enquadramento SDD não muda os caminhos em disco.

**Rodando de fato um framework SDD?** Quando o projeto usa **OpenSpec** ou **GitHub Spec Kit** como seu
loop de execução, [`references/12-sdd-interop.md`](references/12-sdd-interop.md) é a ponte: o crosswalk de artefatos,
as receitas de projeção (`docs/` → arquivos do framework, tags `[RF-NN]` preservadas), e a **ferramenta MCP
consultiva `check_projection_drift`** que mantém a fonte da verdade `docs/requirements/` e a projeção do framework
em sincronia (reporta drift de faltante/duplicado/órfão/EARS-enfraquecido, nunca bloqueia). **Gerar ↔
verificar**: `assets/project-to-sdd.sh <F-NN> --target openspec|speckit` faz o scaffold da projeção (preservando
tags `[RF-NN]`); `check_projection_drift` então confirma que nada derivou. Opcional — pule se não houver framework
SDD.

---

## 4. Conceitos que você precisa antes de qualquer ação

### 4.1 Requisito de usuário vs. requisito de sistema

| Nível | Linguagem | Público | Exemplo |
|---|---|---|---|
| **Usuário** | Natural, alto nível | Cliente, gerente, usuário final | "O sistema deve gerar um relatório mensal de prescrições por clínica." |
| **Sistema** | Detalhada, mensurável | Desenvolvedor, arquiteto, testador | "1.1 No último dia útil do mês, gerar um resumo com nome do medicamento, quantidade de prescrições, dose total e custo, com acesso restrito por lista de controle." |

Ambos coexistem no documento. O usuário entende o de cima; o desenvolvedor implementa o de baixo.

### 4.2 Requisito Funcional (FR — `RF` nas convenções) vs. Não-Funcional (NFR — `RNF`)

- **FR (`RF`)**: o que o sistema **faz**. Entradas, saídas, comportamento, exceções.
- **NFR (`RNF`)**: restrições sobre **como** o sistema funciona. Classificação de Sommerville (Fig 4.3):
  - **Produto** — performance, confiabilidade, segurança, usabilidade, acessibilidade
  - **Organizacional** — processo operacional, padrão de desenvolvimento, ambiente
  - **Externo** — regulatório, legislativo (*"LGPD"* / GDPR), ético

> **RNFs são frequentemente MAIS CRÍTICOS que RFs.** Sommerville (4.1.2): *"Failure to meet a non-functional requirement may mean that the entire system becomes unusable."* Sistema funciona mas é lento → ninguém usa. Sistema funciona mas vaza dados → multa da *"LGPD"* + shutdown.

**Regra de ouro do RNF: deve ser quantitativo.** "Fácil de usar" ❌ → "Usuário deve completar a tarefa X em ≤2 min após 1h de treino, com ≤2 erros/h" ✅. Veja métricas em [references/01-fundamentos.md](references/01-fundamentos.md). Para as famílias de RNF de **dependabilidade/segurança** — confiabilidade (`POFOD`/`ROCOF`/`MTTF`/`AVAIL`), segurança (safety, orientada a perigos), segurança da informação (orientada a risco: ativo→ameaça→controle) e resiliência (RTO/RPO + os 4R) — e como redigir cada uma como um `RNF` quantitativo, EARS-ável e rastreável, veja [references/13-confiabilidade-seguranca.md](references/13-confiabilidade-seguranca.md).

### 4.3 Stakeholders

Todas as pessoas afetadas pelo sistema. Não apenas usuários finais. Exemplo Mentcare (Sommerville): pacientes, familiares, médicos, equipe de enfermagem, recepcionistas, TI, gerente de ética, gerentes administrativos, controle de prontuários. **Stakeholder esquecido = requisito esquecido = retrabalho garantido.**

### 4.4 Estudo de viabilidade (3 perguntas, ANTES de qualquer coisa)

1. O sistema contribui para os objetivos da organização?
2. Cabe no cronograma e no orçamento usando a tecnologia atual?
3. Integra-se com os outros sistemas em uso?

Qualquer "não" → questione se o projeto deve prosseguir.

---

## 5. Detalhe por fase (pontos de entrada para `references/`)

### Fase A — ELICITAÇÃO (descobrir)

6 técnicas, escolha por contexto. Tabela completa + quando usar em [references/02-elicitacao.md](references/02-elicitacao.md):

| Técnica | Boa para | Limitação |
|---|---|---|
| Entrevistas | Profundidade qualitativa, "o porquê e o como" | Habilidade do entrevistador; vieses |
| Questionários | Amplitude quantitativa, stakeholders dispersos | Baixa profundidade; respostas superficiais |
| Workshops / Brainstorming | Consenso, inovação, conflitos | Groupthink, dominância de participantes vocais |
| Etnografia | Requisitos implícitos, processos reais | Cara, ruim para inovação radical |
| Análise de documentos | Regras formais, sistemas legados | Docs desatualizados; "como deveria ser" ≠ "como é" |
| Histórias e cenários | Discussão exploratória com stakeholders leigos | Não é especificação executável |

**Sempre combine 2+ técnicas.** Entrevista → questionário (qualitativo gera quantitativo). Análise de documentos + observação (formal vs. real).

### Fase B — ESPECIFICAÇÃO (documentar)

**Hierarquia do backlog** (curso *"IFPB"*, OpenProject — versão completa, refletindo múltiplos Epics raiz, Epics aninhados, e BDD no campo Description):

```
📄 Requirements Document (SOURCE OF TRUTH — always check before touching anything)
    │
    ▼
PROJECT (= repository/context in OpenProject — NOT an EPIC)
    │
    ├─ 🟦 ROOT EPIC #1                               ← one front of the project
    │   └─ 🟦 SUB EPIC                               ← sub-domain (module, area)
    │       └─ 🟦 SUB-SUB EPIC                       ← sub-sub-domain
    │           └─ 🟦 SUB-SUB-SUB EPIC               ← IFPB reaches 4 levels
    │               └─ 🟩 FEATURE                    ← customer-deliverable
    │                   ├─ 📋 CA group "CA - <Theme A>"   ← ACs always grouped
    │                   │    ├─ ✅ CA01 - self-sufficient rule
    │                   │    ├─ ✅ CA02 - self-sufficient rule
    │                   │    └─ ✅ CA03 - rule with sub-rules [...]
    │                   ├─ 📋 CA group "CA - <Theme B>"
    │                   │    └─ ✅ CA04 - ...
    │                   └─ 🟦 USER STORY                 ← slice of 1 sprint
    │                       ├─ 🎬 BDD: Scenario 1 (happy)  ┐
    │                       ├─ 🎬 BDD: Scenario 2 (error)  │ ← content of the
    │                       └─ 🎬 BDD: Scenario 3 (alt.)   ┘   "Description" field
    │                                                          of the US (not cards)
    │                       └─ 🔧 TASK                       ← technical unit
    │                                                          (technical terms OK)
    │
    ├─ 🟦 ROOT EPIC #2                               ← another front (sibling)
    │   └─ ... (same internal structure)
    │
    └─ 🟦 ROOT EPIC #N                               ← other fronts (siblings)
        └─ ...
```

> **🔴 Regra: múltiplos Epics raiz, sem um único "Epic-Projeto"**. Um projeto tipicamente tem **vários Epics no nível superior, irmãos entre si**, sem um nó pai comum. Cada Epic raiz é uma **frente independente** (plataforma, área operacional, módulo transversal). O "produto" como um todo é o **contexto/repositório** do projeto no OpenProject — não um item da hierarquia. Forçar tudo sob um único "Epic Produto" cria um nó pai vazio e atrapalha a navegação. Exemplos reais: *"Controle de Dopagem"* tem `EPIC APLICAÇÃO WEB` · `EPIC APLICAÇÃO MOBILE` · `EPIC ATIVIDADES DE APOIO` (3 irmãos); *"Interpop"* tem `EP-10 Busca` · `EP-09 Filtros` · `EP-15 Newsletter` · `EP-20 Moderação` (vários irmãos). Detalhe em [`examples/template-backlog-openproject.md §3`](examples/template-backlog-openproject.md).

**Templates prontos para copiar:**

- 📋 [`examples/template-backlog-openproject.md`](examples/template-backlog-openproject.md) — backlog completo com *"Busca Editorial Interpop"* preenchido + *"Cadastro de Atletas"* mostrando 4 níveis de Epic
- 📋 [`examples/template-documento-requisitos.md`](examples/template-documento-requisitos.md) — documento de requisitos (IEEE 830 + Sommerville + Wiegers)
- 🎬 [`examples/template-user-story.feature`](examples/template-user-story.feature) — arquivo Gherkin pronto com 4 cenários + Scenario Outline + step definitions de exemplo (Python + TypeScript). **Bindings de step-def para 6 stacks** (pytest-bdd · behave · cucumber-js · cucumber-playwright · Reqnroll/SpecFlow · Behat) em [`examples/feature-step-defs/`](examples/feature-step-defs/) — escreva o Gherkin uma vez, ligue-o a qualquer stack de teste
- 📚 **Casos de estudo trabalhados** (ponta a ponta, moldados por domínio) em [`examples/`](examples/): *"Controle de Dopagem"*, moderação *"Interpop"*, **SaaS multi-tenant** (*"GestorPro"*), **fintech/pagamentos** (*"PagLeve"*), **serviços de governo** (*"Portal do Cidadão"*) — cada um percorre problema → `RF`/`RNF`/`G` → Epics/Features/CA/US+BDD → validação → rastreabilidade → ética, revelando os RNF específicos do domínio (isolamento de tenant · PCI/idempotência · acessibilidade/LGPD)

**Estrutura de projeto em disco (pastas, não apenas arquivos) + scaffolder:**

> ⚠️ Esta é a mesma estrutura que **[§0](#0-primeira-ação--checagem-do-estado-da-estrutura-obrigatória-roda-uma-vez-por-projeto-antes-de-qualquer-outra-coisa)** exige que você detecte e construa **como primeira ação** em qualquer projeto. O detalhe abaixo é o *como*; a §0 é o *quando* (sempre, primeiro).

Os templates acima (em `examples/`) são arquivos únicos preenchidos com Interpop. Para organizar um **repositório** inteiro de modo que a espinha de rastreabilidade seja física — tudo sob uma raiz nomeada **`docs/`**: `requirements/` (o *porquê/o quê*) · `backlog/` (o *quem/o quê/quando*) · `specs/` (o *como*, SDD) · ADRs de dois tiers (`planning/adrs/` nível-projeto + `specs/<feature>/adrs/` nível-feature, **uma numeração global contínua**) — leia [`references/10-estrutura-projeto.md`](references/10-estrutura-projeto.md). Ele documenta o propósito de cada pasta, o esquema de ADR de dois tiers, **como adotar/reorganizar**, e o **protocolo de Adaptação** (§9) — analise os módulos/papéis/domínio do projeto hospedeiro e ajuste os templates genéricos a ele (ou crie o padrão quando greenfield).

Duas camadas de template: [`examples/`](examples/) = *referência concreta* preenchida com Interpop; [`assets/templates/`](assets/templates/) = templates **genéricos, adaptativos** que o scaffolder materializa. O scaffolder [`assets/scaffold-structure.sh`](assets/scaffold-structure.sh) roda **detect → create → reorganize** toda vez (raiz padrão `docs/`; dry-run por padrão; nunca sobrescreve; reorganiza arquivos soltos automaticamente via `git mv`):

```bash
SC=assets/scaffold-structure.sh
bash "$SC"                       # detect + preview (touches nothing)
bash "$SC" --with-specs --apply  # create/fill/reorganize, with SDD (idempotent)
bash "$SC" --no-specs --apply    # requirements + backlog only (single-tier ADRs)
# then follow the Adaptation protocol (ref §9): fill the seeds with THIS project's reality
```

**Distinção crítica Feature ↔ User Story** (regra dura — anti-padrão "Feature com BDD" em [04-bdd-criterios-aceitacao.md §7.7](references/04-bdd-criterios-aceitacao.md)):

- **Feature** tem uma **descrição em linguagem de negócio** (um parágrafo em linguagem clara explicando o entregável-ao-cliente) + **CAs**. NUNCA tem BDD.
- **User Story** tem **BDD** (`Given/When/Then`, no próprio campo "Description" — não como cards filhos) + **CAs herdados** via rastreabilidade. Nunca tem seus próprios CAs.

**Regra estendida: TODOS os artefatos têm descrições em linguagem de negócio.** Epic, Feature, User Story, CA, **RF**, RNF, regra de negócio (G) — todos descritos em linguagem clara sem termos técnicos (sem URL, sem nome de método, sem nome de tabela, sem stack). Lidos por: cliente, PO, desenvolvedor júnior, auditor — todos sem um glossário técnico. Endpoints e bibliotecas só aparecem em **Tasks**.

**Convenção `[...]` para CAs com sub-regras** (regra dura — detalhe em [04-bdd §2.5](references/04-bdd-criterios-aceitacao.md)):

Quando um CA precisa de sub-regras para ser totalmente testável, **termine o título com `[...]`** e detalhe no corpo do item (o campo "description" no OpenProject) abrindo com `Regras a serem aplicadas:` + bullets. Um CA sem `[...]` deve ser **autossuficiente no título**.

```
Example AC with [...] (must open the item):
  CA09 - The FEDERATION combobox must apply the fill-in and validation
         rules as detailed [...]
  Body:
    Rules to be applied:
    - Must only be enabled if a CONFEDERATION is selected.
    - Must only display ACTIVE Federations.
    - In ALPHABETICAL order.
    - ...

Example self-sufficient AC (without [...]):
  CA05 - The CPF field is not mandatory. But if filled, must be in the
         format XXX.XXX.XXX-XX. If the CPF is invalid, show an error message.
```

Quem lê o backlog em modo lista vê o `[...]` e sabe que precisa clicar. Sem ambiguidade.

**Regra de título da User Story**: no card, use um **título descritivo curto** ("US Listagem Básica de Atletas"). NÃO escreva o template Connextra inteiro ("Como editor, eu quero …, para que …") no título — esse template existe para **conversa**, não para cards. Detalhe em [references/03-especificacao.md](references/03-especificacao.md).

---

#### 🔴 Convenções de nomenclatura *"Interpop"* / *"IFPB"* (regra dura — aplica-se a todo projeto pt-BR deste autor)

Aplica-se a TODOS os títulos de Epic, Feature, User Story, CA, **RF**, RNF, regra de negócio (G). **Tasks podem violar** (termos técnicos são permitidos lá).

1. **Sem verbos no infinitivo** em títulos. Use um substantivo descritivo/gerúndio.
   - ❌ `Listar reservas do usuário` → ✅ `Listagem de reservas do usuário`
   - ❌ `Buscar artigos` → ✅ `Busca de artigos`
   - ❌ `Cadastrar atleta` → ✅ `Cadastro de atleta`

2. **Sem termos técnicos** em títulos nem descrições de Epic/Feature/US/CA/**RF**/RNF/G. Termos técnicos só aparecem em Tasks. Aplica-se tanto ao **backlog** (Epic/Feature/US/CA) quanto ao **documento de requisitos** (RF/RNF/G) — ambos são lidos por stakeholders, não por desenvolvedores.
   - ❌ `Endpoint REST para busca` → ✅ `Busca de artigos por texto`
   - ❌ `Hook useSearch com TanStack` → ✅ `Apresentação em tempo real dos resultados`
   - ❌ `Migration da tabela search_index` → ✅ (não é uma Feature; vira uma Task técnica)
   - ❌ CA: `Endpoint POST /api/v1/bans/ retorna 400 se hierarquia violada` → ✅ `Quando um administrador tenta banir outro administrador, o sistema rejeita a operação com a mensagem "Operação não permitida".`

3. **Linguagem clara, simples, direta** — quem lê deve entender sem contexto técnico.

4. **Todos os artefatos têm descrições em linguagem de negócio.** Epic, Feature, US, CA, **RF**, RNF, regra de negócio (G). Lidos por qualquer stakeholder (PO, cliente, desenvolvedor júnior, auditor) sem precisar de um glossário. Sem URLs, sem nomes de métodos, sem stack. Endpoints e bibliotecas só em Tasks. **Relação RF ↔ Feature**: RF é o requisito declarado no documento; Feature é sua materialização incremental no backlog (com rastreabilidade via o campo `Origem (requisitos)`).

5. **CAs sempre agrupados** sob um título `CA - <Tema>`, mesmo para uma Feature com um único CA. O agrupamento mantém consistência visual no OpenProject e facilita inserção futura (veja template em [examples/template-backlog-openproject.md](examples/template-backlog-openproject.md) §4).

6. **Configurações técnicas NÃO são Features** (ESLint, variáveis de ambiente, criação de pastas, arquivos JSON, config do Vite, config de lint, docker-compose). Estas vão como **Tasks transversais** (`TX-NN`), agrupadas para visibilidade da equipe técnica, fora da hierarquia de Feature. A regra mestra: **Feature = entregável-ao-cliente**. Se não é entregável ao cliente final, não é uma Feature.

7. ***"Interpop"* escala de prioridade** (aplicada em TODOS os níveis: Epic, Feature, US, CA, Task):
   - 🔴 **Imediata** — bloqueia outros itens; deve ser feita na sprint atual
   - 🟠 **Alta** — sprint atual ou próxima
   - 🟡 **Normal** — backlog priorizado
   - 🟢 **Baixa** — nice to have, sem prazo

   > MoSCoW (Must/Should/Could/Won't) é um equivalente teórico, mas a equipe *"Interpop"* usa Imediata/Alta/Normal/Baixa. Use esta escala nos projetos brasileiros deste autor.

8. **IDs estáveis** (formato *"Interpop"* — mantidos em pt-BR para retro-compatibilidade com projetos existentes):
   - `EP-NN` (Epic, pode ser aninhado: `EP-NN.M`, `EP-NN.M.K`) · `F-NN` (Feature) · `CANN` (Critério de Aceitação) · `USNN.M` (User Story) · `TNN.M.K` (Task) · `TX-NN` (Task transversal) · `G-NN` (regra de negócio)
   - IDs são eternos (não são renumerados quando o conteúdo muda); a versão do artefato muda.

**Template completo do `BACKLOG.md`** + exemplos dos projetos *"SIRA"* e *"Interpop"* em [references/05-convencoes-interpop.md](references/05-convencoes-interpop.md).

**Critérios de Aceitação + BDD são complementares, não concorrentes:**

- **CA** é uma regra declarativa por feature: "CA05 — O campo CPF não é obrigatório. Se preenchido, deve estar no formato XXX.XXX.XXX-XX." Uma lista de regras testáveis.
- **BDD** é um cenário executável por user story: "DADO que o usuário está logado e tem permissão / QUANDO ele acessa o menu administrativo > Atletas / ENTÃO o sistema exibe a lista básica de atletas."

CA define o **invariante**; BDD define a **interação**. Use ambos. Detalhe em [references/04-bdd-criterios-aceitacao.md](references/04-bdd-criterios-aceitacao.md).

**EARS — camada de precisão opcional.** Quando um requisito precisa ser inequívoco para um implementador de IA, para um
caso de borda/erro, ou para uma feature regulada, formule-o (no **corpo** do RF, nunca no título de negócio) usando um
dos cinco templates EARS — `WHEN/QUANDO <gatilho> THE SYSTEM SHALL/O SISTEMA DEVE <resposta>` (+ `WHILE/ENQUANTO`,
`IF…THEN/SE…ENTÃO`, `WHERE/ONDE`, ubíquo). Um `SHALL`/`DEVE` por declaração → um grupo `CA` → um ou mais
`Cenário`. **EARS é opt-in** e coexiste com o `RF` em linguagem de negócio + BDD; nunca os substitui. Padrões
completos (EN + pt-BR), anti-padrões, e o pipeline `RF → EARS → CA → Gherkin` em [references/11-ears.md](references/11-ears.md).

### Fase C — ESTIMATIVA (dimensionar)

Story Points (medida abstrata de complexidade) + Planning Poker (Fibonacci: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89 + `?` + 100).

- `?` = falta de entendimento → fale com o PO
- `100` = um épico disfarçado → fatie em histórias
- 0 e 1/2 não entram na 1ª rodada — reservados para itens triviais futuros (label, mudança de cor)

Procedimento: escolha uma história guia (a mais simples = 1 pt) → estime o resto proporcionalmente (não o próximo número da escala). Detalhe em [references/05-estimativa.md](references/05-estimativa.md).

### Fase D — VALIDAÇÃO (verificar que é a coisa certa)

**As 5 verificações de Sommerville:** validade · consistência · completude · realismo · verificabilidade.

**As 7 dimensões de Falbo (por requisito):** completo · correto · consistente · realista · necessário · priorizável · verificável.

**3 técnicas:** revisões de requisitos (walkthrough), prototipação (lo-fi → hi-fi), geração de casos de teste a partir do requisito.

Protótipos são a ferramenta mais eficaz porque o usuário VÊ o resultado. Comece no papel/quadro branco, evolua para Figma quando necessário. Detalhe em [references/06-validacao.md](references/06-validacao.md).

### Fase E — MUDANÇA + RASTREABILIDADE (manter coerência)

Requisitos **duradouros** (atividades centrais; mudam lentamente) vs. requisitos **voláteis** (apoio; mudam frequentemente). Diferencie ao priorizar arquitetura.

Processo formal de mudança (Sommerville Fig 4.19):
**Problema identificado → análise/especificação → análise de impacto + custo → implementação** (com rollback no documento de requisitos sincronizado com o código).

Rastreabilidade: todo ID de requisito → design → código → teste. Sem ela, mudar 1 requisito vira "quais módulos eu toco?". Detalhe em [references/07-mudanca-rastreabilidade.md](references/07-mudanca-rastreabilidade.md).

---

## 6. Camada transversal: o analista de negócios

Em equipes pequenas, dev + PO acumulam o papel. Em equipes maiores, há um analista dedicado. BABOK (Business Analysis Body of Knowledge) define 6 áreas de conhecimento: planejamento, elicitação, gestão do ciclo de vida, análise de estratégia, análise de requisitos e design de solução, avaliação. Fluxo central: **AS-IS** (processo atual) → **TO-BE** (processo desejado) → análise de GAP → requisitos de sistema que cobrem o GAP. Detalhe em [references/08-analista-negocios.md](references/08-analista-negocios.md).

---

## 7. Camada transversal: ética profissional

> Esta é uma camada **não-negociável**. Não está acima das outras — está abaixo de todas elas. Código *"SBC"* 002/2024 (versão pt-BR do IFIP, adaptado da ACM): *"The Computing profession as a whole benefits when the ethical decision-making process occurs in a responsible and transparent manner."*

Princípios que mais se aplicam à ERS:

- **1.1 Bem-estar humano** — "as necessidades dos menos favorecidos devem receber maior atenção"
- **1.2 Evitar dano** — reporte riscos do sistema mesmo que isso atrase a entrega
- **1.6 Privacidade** — coleta mínima, consentimento, retenção definida (*"LGPD"* / GDPR)
- **2.5 Avaliação abrangente** — **sistemas de ML exigem reavaliação contínua de risco**
- **2.6 Trabalhar apenas em áreas de competência** — comunique limitações ao cliente
- **2.9 Sistemas robustos e seguros** — *"when misuse or harm is foreseen or unavoidable, **the best option may be to not implement the system**"*
- **3.1 Bem público no centro** — cita explicitamente a *"análise de requisitos"* como um momento de avaliação ética

Detalhe e aplicação em [references/09-etica-sbc.md](references/09-etica-sbc.md).

---

## 8. Anti-padrões frequentes (evite estes)

1. **Pular a elicitação** — "já sei o que o cliente quer" → custo de retrabalho 10× a 200× o custo de corrigir na fase certa
2. **Connextra no título** — "Como [X], eu quero [Y] para que [Z]" no título do card fica ilegível; use no campo de descrição/conversa, não no título
3. **RNF qualitativo** — "deve ser rápido" não é um requisito, é um desejo. Sempre quantifique
4. **CA e BDD concorrendo** — escrever só um dos dois. São camadas complementares (invariante × interação)
5. **Contador de histórias sem stakeholder** — escrever requisitos sozinho. Requisito sem dono = requisito que ninguém valida
6. **Aceitar tudo sem priorizar** — um backlog de 200 itens sem ordem é o mesmo que um backlog vazio
7. **Esquecer a mudança** — projetar arquitetura assumindo que requisitos não mudam → reescrita total em 6 meses
8. **Ignorar rastreabilidade** — impossível analisar impacto de mudança sem ID/link entre artefatos
9. **Ética como afterthought** — questões éticas devem entrar nos critérios de aceitação, não em um documento separado que ninguém lê
10. **Etnografia em projeto inovador** — etnografia é ótima para sistemas de substituição; péssima para produtos que ainda não existem (Nokia × Apple)
11. **Feature com BDD em vez de descrição** — colar `GIVEN/WHEN/THEN` diretamente na Feature em vez do parágrafo em linguagem de negócio. Resultado: stakeholders não-técnicos não leem, CAs ficam órfãos, o Sprint Planning trava. BDD vive na **User Story**. Detalhe e exemplos ❌/✅ em [04-bdd-criterios-aceitacao.md §7.7](references/04-bdd-criterios-aceitacao.md)
12. **Backlog sem origem no documento de requisitos** — um Epic/Feature/CA que aparece no backlog sem `Origem (requisitos)` apontando para `RF-NN`/`RNF-NN` é scope creep silencioso ou refinamento técnico mal colocado. Toda mudança nasce no documento; o backlog apenas materializa (veja §2.1).
13. **Termo técnico em um CA** — `CA: O endpoint POST /api/v1/bans/ retorna HTTP 400 se hierarquia violada` força o auditor/cliente a abrir um glossário. Reescreva em linguagem de negócio: `CA: Quando um administrador tenta banir outro administrador, o sistema rejeita a operação com a mensagem "Operação não permitida".` Endpoint e status HTTP vão na Task.

---

## 9. Checklist de aplicação (use por feature)

Antes de aceitar uma feature no backlog, valide as 7 dimensões de Falbo:

- [ ] **Completo** — descreve toda a funcionalidade/regra/restrição
- [ ] **Correto** — descreve exatamente o que deve ser construído
- [ ] **Consistente** — não ambíguo, não conflita com outro requisito
- [ ] **Realista** — implementável dado o que sabemos da plataforma
- [ ] **Necessário** — necessidade do cliente OU requisito externo/de padrão
- [ ] **Priorizável** — tem uma ordem clara vs. outros itens
- [ ] **Verificável** — possível escrever um teste que prove a implementação

Falhou ≥1 → não está pronto. Volte ao stakeholder.

### Checklist adicional de nomenclatura (regra dura — *"Interpop"*)

Antes de aceitar Epic/Feature/US no backlog:

- [ ] Título **NÃO começa com verbo no infinitivo** (sem `Listar`/`Criar`/`Buscar`/`Cadastrar`/`Configurar`/`Implementar`)
- [ ] Título **NÃO contém termos técnicos** (sem `endpoint`/`hook`/`migration`/`API`/`schema`/`config`)
- [ ] Título em **linguagem clara** legível por um stakeholder não-técnico
- [ ] Item **é entregável-ao-cliente** (se é uma configuração técnica, mova para uma Task transversal `TX-NN`)
- [ ] Prioridade declarada (🔴 Imediata / 🟠 Alta / 🟡 Normal / 🟢 Baixa)
- [ ] **Feature** tem uma **descrição em parágrafo** · **User Story** tem **BDD `Given/When/Then`** (não troque)
- [ ] Toda User Story tem **CAs explicitamente associados** (relação rastreável)
- [ ] Toda Task tem um **Task ID** (`TNN.M.K` ou `TX-NN`) para que apareça em commit/PR

Falhou ≥1 → não está pronto. Corrija antes de passar para a implementação.

---

## 10. Fonte primária e bibliografia canônica

### 10.1 Autora do material-fonte (corpus primário desta skill)

O corpus primário desta skill — todas as 11 aulas processadas (AULA 0 a 10, incluindo 09.2) — foi criado e ministrado pela **Prof. Dr. *"Juliana Dantas Ribeiro Viana de Medeiros"*** ([Lattes](http://lattes.cnpq.br/9730254173461923) · [ORCID 0000-0001-8387-4616](https://orcid.org/0000-0001-8387-4616)).

Por que isso importa para a confiabilidade do que esta skill afirma:

- **Ph.D. em Engenharia de Software** (UFPE 2017) com período sanduíche na **Universidade Nova de Lisboa** (2016, bolsa Erasmus Mundus BEMUNDUS), orientada por Alexandre Marcos Lins de Vasconcelos com coorientação de Miguel Goulão (UNL) e Carla Schuenemann.
- **Tese de doutorado**: *"An approach to support the Requirements Specification in Agile Software Development"* — o **exato assunto** que esta skill condensa.
- **Linha de pesquisa ativa**: *"Requirements Engineering in Agile Projects"* (desde 2014, *"IFPB"*).
- **Coordenadora do projeto *"CNPq"* DTI-A 487777/2013-1** — *"Sistema de Informação Integrado para Controle de Dopagem"* (2014–2015), que é a **origem do principal estudo de caso** em [`examples/caso-controle-dopagem.md`](examples/caso-controle-dopagem.md).
- **20+ anos de experiência industrial** em gestão e desenvolvimento de projetos de software: *"DATAPREV"* (*"Ministério do Trabalho"*, 2006–2013), *"CESAR"* (Recife, 2005–2006), *"CAGEPA"*, *"Ministério Público da Paraíba"*, *"Prefeitura de João Pessoa"* (sistemas tributários *"IPTU"*/*"ITBI"*/*"Taxa de Lixo"*, 1997–2005), e colaborações com *"Multilaser"* e *"CPM Braxis"*.
- **Professora Titular (Dedicação Exclusiva)** no *"IFPB"* Campus João Pessoa desde 2006 (ingresso via concurso público, **1º lugar**); pesquisadora ativa no hub *"EMBRAPII"* no *"IFPB"*; também afiliada à UFCG desde 2020.
- M.Sc. em Ciência da Computação (UFPE 2001, bolsa *"CNPq"*, dissertação sobre ISO 9001:2000 em empresas de software) e B.Sc. em Ciência da Computação (UFPB 1997).

> **Citação acadêmica**: Medeiros, J. D. R. V. de. *Engenharia de Requisitos de Software* [material do curso, aulas 0–10]. *"IFPB"* Campus João Pessoa, 2025. Lattes: http://lattes.cnpq.br/9730254173461923. ORCID: https://orcid.org/0000-0001-8387-4616.

### 10.2 Bibliografia canônica (complementa o corpus primário)

- **Sommerville, I.** *Software Engineering*, 10ª ed. Pearson, 2019 — base do curso (o Cap. 4 é o pivô)
- **Pressman, R.** *Software Engineering: A Practitioner's Approach*, 9ª ed. McGraw-Hill, 2021 — visão complementar (7 estágios de ERS)
- **Wiegers, K. & Beatty, J.** *Software Requirements*, 3ª ed. Microsoft Press
- **Cohn, M.** *User Stories Applied*, 2004 — referência padrão para US
- **Robertson, S. & Robertson, J.** *Mastering the Requirements Process* (método VOLERE)
- **Hull, E., Jackson, K., Dick, J.** *Requirements Engineering*, 4ª ed. Springer
- **IIBA.** *BABOK Guide* v3 — análise de negócios
- **Falbo, R. A.** Notas de aula — Engenharia de Requisitos de Software (UFES)
- **SBC.** Resolução 002/2024 — Código de Ética e Conduta Profissional
- **Valente, M. T.** *Engenharia de Software Moderna*, 2020 ([engsoftmoderna.info](https://engsoftmoderna.info)) — cap. 3 (MVP + A/B Testing)

---

**Para detalhar qualquer ponto acima, vá direto ao arquivo `references/` correspondente.** Este `SKILL.md` é o mapa; o detalhe vive lá. Não tente substituir as leituras canônicas: esta skill condensa para uso imediato, mas decisões importantes merecem o livro completo.
