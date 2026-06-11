# 10 — Estrutura de projeto em disco (requisitos / backlog / specs / ADRs)

> Esta referência transforma a hierarquia abstrata de [`SKILL.md §2.1`](../SKILL.md) (*"o documento de requisitos é a fonte da verdade"*) e [`§5 Fase B`](../SKILL.md) num **layout concreto de pastas em disco**, pronto para colocar em qualquer repositório. É a materialização física da espinha de rastreabilidade: *requisito → Epic → Feature → CA · US → Task → Sprint → commit*.
>
> A implementação de referência canônica é o projeto *"Interpop"* (`docs/requirements/`, `docs/backlog/`, `docs/specs/`, `docs/planning/adrs/`). As convenções de nomenclatura em pt-BR seguem [`05-convencoes-interpop.md`](05-convencoes-interpop.md). O scaffolder companheiro [`assets/scaffold-structure.sh`](../assets/scaffold-structure.sh) cria este layout num projeto novo **e reorganiza** um já existente.
>
> **Duas regras permanentes (aplicam-se sempre):**
>
> 1. **Uma raiz única chamada `docs/`.** A estrutura inteira vive sob um único diretório raiz chamado `docs/` (`docs/requirements/`, `docs/backlog/`, `docs/specs/`, `docs/planning/adrs/`). Nunca espalhe arquivos de requisito/backlog na raiz do repositório.
> 2. **Sempre detecte antes de agir — e esta é a PRIMEIRA ação, automática, toda vez que a skill toca um projeto.** Antes de criar qualquer coisa, inspecione o alvo: se uma estrutura (ou arquivos soltos de requisito/backlog) já existe → **analise e reorganize**; se existe um único documento de requisitos monolítico de uma versão antiga da skill, sem espinha → **migre** (§8.1); se nada existe → **crie o padrão default**. O scaffolder faz essa classificação automaticamente (§7); você faz a adaptação de conteúdo (§9). O usuário nunca precisa *pedir* a estrutura — sua ausência é o gatilho para construí-la ([`SKILL.md §0`](../SKILL.md)).
>
> **Duas camadas de templates — não as confunda.** A pasta [`examples/`](../examples/) contém os documentos **preenchidos com o Interpop** (`template-documento-requisitos.md`, `template-backlog-openproject.md`, os estudos de caso) — uma *referência concreta* mostrando o padrão totalmente aplicado. A pasta [`assets/templates/`](../assets/templates/) contém os templates **genéricos, baseados em placeholders** que o scaffolder materializa — a camada *adaptável*, feita para ser preenchida com os módulos, personas e domínio do **seu** projeto (§9). Interpop = "isto é como fica quando está pronto"; templates genéricos = "este é o seu ponto de partida".

---

## 1. Por que uma estrutura em disco, afinal

Um backlog que vive apenas dentro de um issue tracker (OpenProject, Jira, GitHub Projects) tem três modos de falha que a ER não pode tolerar:

1. **Sem histórico de versões do *porquê*.** Um tracker mostra o estado atual de um card, não a cadeia de edições que o justificou. O Git dá a cada requisito um `git log`.
2. **Sem fonte da verdade.** Quando o tracker e a conversa discordam, ninguém vence. Um arquivo commitado no repositório, revisado num PR, *é* o acordo (`SKILL.md §2.1`, regra zero).
3. **Sem co-localização com o código.** O requisito que justifica uma linha de código deveria estar a um link relativo de distância, não atrás de um login.

Por isso o documento é **Markdown puro no repositório**, e o tracker (se houver) o espelha — nunca o contrário.

### Os três pilares (separação de responsabilidades)

| Pasta | Responde | Público | NÃO deve conter |
|---|---|---|---|
| `requirements/` | **POR QUÊ / O QUÊ** — que necessidade o sistema atende? | cliente, PO, auditor | o *como* (sem stack, sem endpoint, sem tabela) |
| `backlog/` | **QUEM faz O QUÊ, QUANDO** — que trabalho está planejado / em andamento / concluído? | time, PO | racional de negócio que pertence a `requirements/` |
| `specs/` | **COMO** — o design técnico que realiza uma feature (apenas SDD) | engenheiros | justificativa de produto (que vive a montante) |

Transversal a ambos: os **ADRs** registram as *decisões* tomadas ao longo do caminho (esquema de dois níveis — §5).

---

## 2. A espinha de rastreabilidade (o contrato entre as pastas)

```
Requirement (RF / RNF)              ← requirements/
  ↓ realized by
Epic (EP-NN)                        ← backlog/epics/
  ↓ decomposed into
Feature (F-NN)                      ← backlog/features/
  ↓ accepted when
Acceptance Criterion (CA01..CANN)   ← inside the Feature file
  ↓ illustrated by
User Story (USNN.M) + BDD scenarios ← inside the Feature file
  ↓ implemented by
Task (TNN.M.K / TX-NN)              ← inside the Feature file
  ↓ delivered in
Sprint                              ← backlog/sprints/
  ↓ materialized in
Commit (SHA)                        ← cross-ref in the Task
```

**Regra dura — links bidirecionais.** Cada nó nomeia seu **pai** e seus **filhos** via um link relativo. Um arquivo de requisito carrega uma seção `## Realizado por` listando os Epics/Features que o executam; um arquivo de Epic carrega tanto `## Requisitos realizados (↑)` quanto `## Features sob este Epic (↓)`. Sem rastreabilidade bidirecional, mudar um requisito vira um chute de "quais módulos eu toco?" — exatamente a falha contra a qual o `SKILL.md §8 antipadrão 8` adverte.

---

## 3. `requirements/` — o "POR QUÊ / O QUÊ"

```
requirements/
├── README.md                  purpose + traceability spine + conventions + how-to-add
├── personas-e-cenarios.md     canonical personas; every US references one
├── RF/                        Functional Requirements (one file per module)
│   ├── RF-001-<module>.md
│   └── RF-NNN-<module>.md
└── RNF/                       Non-Functional Requirements (cross-cutting)
    ├── RNF-perf.md
    ├── RNF-security.md
    ├── RNF-a11y.md
    ├── RNF-lgpd.md
    └── RNF-availability.md
```

**Anatomia do arquivo RF** (veja o exemplo completo do *"Interpop"* `RF-007`):

- Bloco de cabeçalho: `Tipo` · `Prioridade` (🔴/🟠/🟡/🟢) · `Status`.
- `## Enunciado de negócio` — um parágrafo entre aspas, em linguagem de negócio pt-BR, **sem nenhum termo técnico** (`SKILL.md §5 regra de nomenclatura 2`).
- `## Justificativa` — por que o requisito existe (impacto de produto, KPI).
- `## Realizado por (↓)` — tabela de Epics/Features que o executam (link bidirecional para baixo).
- `## RNFs que limitam este RF` — quais restrições não-funcionais o delimitam.
- `## Restrições e fora-de-escopo` — fronteiras explícitas.

**A anatomia do arquivo RNF** acrescenta uma **tabela de métricas obrigatória** — todo RNF deve ser *quantitativo* (`SKILL.md §4.2`, regra de ouro). "Rápido" é um desejo; "p95 ≤ 300ms no servidor com 50k artigos" é um requisito. Cada linha de métrica carrega um `Alvo` (target) e um `Quando medir` (como/onde medido), além de uma tabela de gates `## Como verificar`.

**Regra de ID**: `RF-NNN`, `RNF-<slug>`. Imutável após a criação. Um requisito descontinuado vira `RF-NNN-deprecated.md` — ele nunca desaparece (mantido para auditoria).

> ⚠️ **Um arquivo por MÓDULO, não um arquivo por requisito (o ponto de confusão mais comum).** Cada arquivo
> `RF/` documenta um **módulo** inteiro (um Epic / bounded context / app), e é nomeado por seu **primeiro**
> requisito: `RF-01-<module>.md` contém `RF-01..RF-04`; `RF-05-<module>.md` contém `RF-05..RF-08`; e assim por diante.
> Os requisitos individuais vivem como seções `### RF-NN` **dentro** do arquivo. Portanto, uma listagem de pasta com
> `RF-01, RF-05, RF-09…` **não** está faltando `RF-02/03/04` — esses são seções do primeiro arquivo. **Lacunas nos
> *nomes de arquivo* são fronteiras de módulo (intervalos contíguos), nunca requisitos faltantes.** Um leitor que conta
> arquivos conta *módulos*; para contar requisitos, `grep -c '^### RF-' RF/*.md`. (Um-arquivo-por-requisito é uma
> variante válida, mas o default — e o que o scaffolder/protocolo de Adaptação assumem — é um-arquivo-por-módulo.
> A mesma lógica se aplica a `RNF/`: agrupe por atributo de qualidade ou por classe de *"Sommerville"*, não necessariamente um arquivo por `RNF-NN`.)

---

## 4. `backlog/` — o "QUEM faz O QUÊ, QUANDO"

```
backlog/
├── README.md          purpose + naming table + IDs + priority + Definition of Done + close workflow
├── glossario.md       domain vocabulary (every US/CA/ADR must use these terms)
├── epics/             one file per Epic — description + child Features list
│   └── EP-NN-<slug>.md
├── features/          one file per Feature — description + CAs + USs (with BDD) + Tasks
│   └── F-NN-<slug>.md
├── sprints/           one file per Sprint — temporal execution (US/Task mapping)
│   └── sprint-N-<slug>.md
└── done/              closed Epics/Features — files are MOVED here (git mv), not copied
```

**Por que `done/` move em vez de copiar.** O `git mv` preserva o histórico e mantém `features/` mostrando apenas trabalho vivo. Copiar duplica a verdade e apodrece.

**Anatomia do arquivo de Feature** (veja o *"Interpop"* `F-30`):

- Cabeçalho: `Tipo` · `Epic pai` (link ↑) · `Sprint de execução` (link) · `Status` · `Prioridade`.
- `## Descrição (visão de produto)` — parágrafo em linguagem de negócio. Uma Feature **nunca** carrega BDD (`SKILL.md §8 antipadrão 11`).
- `## Requisitos atendidos (↑)` — links para os RF/RNF que ela realiza.
- `## Critérios de Aceitação` — tabela `CA01..CANN`, cada um com uma coluna "Como verificar" e um status.
- `## User Stories` — cada `USNN.M` carrega o template Connextra **no corpo** (não no título) + blocos cercados `### Cenários BDD (Gherkin pt-BR)`.
- `## Tasks` — o único nível onde termos técnicos são permitidos.

**Nomenclatura + IDs + prioridade + Definition of Done**: governados pelo `backlog/README.md` (o scaffolder semeia a tabela completa). Recapitulação das regras duras:

| Nível | Permitido no título | Proibido no título |
|---|---|---|
| Epic / Feature / US / CA / RF / RNF | substantivo + adjetivo, linguagem de negócio | verbo no infinitivo, termo técnico |
| Task | **termos técnicos OK** | — (nível operacional) |

---

## 5. ADRs — o esquema de dois níveis (a parte que a maioria dos projetos erra)

O *"Interpop"* mantém os Architecture Decision Records (formato MADR) em **dois níveis, compartilhando uma única numeração global contínua**:

```
planning/adrs/                       ← TIER 1: PROJECT-level (cross-cutting decisions)
├── README.md                          catalog table + convention
├── ADR-001-<slug>.md   …  ADR-014     (transversal: queue, hosting, versioning, ethics…)
└── ADR-NNN-<slug>.md

specs/<feature>/adrs/                ← TIER 2: FEATURE/SPEC-level (decisions local to one feature)
├── INDEX.md                           catalog grouped BY LAYER (SW/DB/algo/BE/FE/UI/sec/test)
├── tracker.md                         live ADR ↔ Task ↔ Test cross-reference
├── ADR-015-<slug>.md  …  ADR-045      (continues the SAME sequence from tier 1)
└── ADR-NNN-<slug>.md
```

### As cinco regras que fazem isto funcionar

1. **Uma única sequência global, atravessando ambos os níveis.** Os ADRs de projeto vão de `001..014`; os ADRs da primeira feature continuam em `015`, não reiniciam em `001`. Um leitor que cita "ADR-021" nunca precisa perguntar "qual pasta adrs/?". O número é globalmente único.
2. **Nível por escopo, não por número.** Uma decisão que afeta o sistema inteiro (hosting, versionamento de API, fila assíncrona) vive em `planning/adrs/`. Uma decisão local a uma feature (a estratégia de índice desta feature, o throttle desta feature) vive no `specs/<feature>/adrs/` dessa feature.
3. **Nunca renumere. Nunca edite um ADR já decidido.** ADR-005 é ADR-005 para sempre. Para mudar uma decisão, escreva um **novo** ADR e marque o antigo como `Superseded by ADR-NNN` (convenção do `planning/adrs/README.md`). A trilha de auditoria permanece limpa.
4. **Tag de variante quando um número resolve decisões paralelas em camadas.** Quando o mesmo momento arquitetural força uma decisão coordenada entre camadas, sufixe a camada: `ADR-030-DB`, `ADR-030-FE`, `ADR-030-UI`. Eles compartilham o número porque são uma decisão com três faces.
5. **Dois índices por nível de feature.** O `INDEX.md` agrupa os ADRs **por camada arquitetural** (para que um revisor leia todas as decisões de DB juntas); o `tracker.md` é a matriz **viva** ADR↔Task↔Test, atualizada conforme os PRs fecham.

### Anatomia do arquivo de ADR (MADR-lite — template `ADR-001`)

```markdown
# ADR-NNN: <imperative decision title>

## Status
Accepted | Proposed | Superseded by ADR-MMM | Deprecated
(+ one line: what supersedes/refines it, with a link)

## Context
The forces at play. Options considered (numbered list, each with its trade-off).

## Decision
The option chosen, stated in one sentence, plus the key parameters.

## Consequences
**Positivas:** … **Negativas / trade-offs aceitos:** …

## Cross-ref
Where it is implemented (file paths) · source · ADRs it refines/supersedes.
```

### Quando um projeto NÃO usa SDD

Se você adota apenas `requirements/` + `backlog/` (sem `specs/`), mantém **somente o tier 1** — `planning/adrs/`. Todos os ADRs são de nível de projeto. A divisão em dois níveis é um benefício que você desbloqueia quando o design técnico escopado por feature (SDD) ganha sua própria pasta.

---

## 6. `specs/` — o "COMO" (apenas SDD)

> **Spec-Driven Development**: antes de implementar uma feature não trivial, você escreve uma spec de design que a implementação deve satisfazer — design primeiro, código depois, com a spec como contrato. Adote `specs/` quando as features forem grandes o suficiente para que o *como* mereça seu próprio artefato revisado (features multicamada, caminhos críticos de performance, qualquer coisa que você queira que especialistas projetem antes de escrever uma linha).

```
specs/
├── README.md                     SDD methodology + index of feature specs
└── <feature-slug>/               one folder per feature spec
    ├── DESIGN.md                 the design contract (architecture, data model, layers)
    ├── BACKLOG.md                spec-local task breakdown (mirrors backlog/features/F-NN)
    ├── TEST-STRATEGY.md          how this feature is tested (ties to docs/tests/)
    ├── SECURITY-REVIEW.md        threat model + mitigations
    ├── REVIEW-PHASE-N.md         design review rounds (optional)
    ├── _specialist-outputs/      raw outputs from per-domain architects (optional)
    └── adrs/                     TIER-2 ADRs for THIS feature (INDEX.md + tracker.md + ADR-NNN)
```

**A relação com `backlog/`**: `specs/<feature>/` é o *como*; `backlog/features/F-NN` é o *o quê/quando*. Eles se referenciam mutuamente. A seção `## ADRs relacionadas` do arquivo de Epic aponta para `specs/<feature>/adrs/`. Uma feature pode ter uma entrada no backlog sem uma spec (features pequenas); uma spec sempre tem uma entrada no backlog (você ainda planeja o trabalho).

**Não** coloque justificativa de produto em `specs/` — isso fica a montante, em `requirements/`. O `specs/` começa de "estamos construindo F-NN; eis como".

---

## 7. Executando o scaffolder (detect → create → reorganize)

O scaffolder roda os mesmos três passos toda vez, em ordem: **(1) detect** o alvo e o classifica (GREENFIELD / HAS-STRUCTURE / LOOSE-FILES / **LEGACY-MONOLITH**), **(2) create** qualquer pasta/template faltante (nunca sobrescrevendo), **(3) reorganize** os arquivos soltos para o lugar (auto-habilitado quando a detecção encontra algum). A raiz default é `docs/`; dry-run é o default.

> **LEGACY-MONOLITH** é o veredito para um projeto que carrega seus requisitos como um **único documento solto** (ex.: `REQUISITOS_UNIFICADO.md`, `requisitos.md`, um `template-documento-requisitos.md` preenchido) **sem espinha `docs/`** — a saída típica de uma versão pré-estrutura desta skill. O scaffolder **cria a estrutura mas nunca divide o monólito automaticamente** (dividir prosa em RF/RNF por módulo exige julgamento); ele reporta o arquivo e a migração fica por sua conta (§8.1).

```bash
SC=~/.claude/skills/engenharia-de-requisitos/assets/scaffold-structure.sh

# preview — classifies the target and prints the plan; touches nothing
bash "$SC"

# create / fill / reorganize (with specs/ + tier-2 ADRs) — idempotent, safe to re-run
bash "$SC" --with-specs --apply

# requirements + backlog only (no SDD) — ADRs stay single-tier in planning/adrs/
bash "$SC" --no-specs --apply

# force or suppress the move-loose-files step explicitly
bash "$SC" --reorganize --apply      # force even if detection is unsure
bash "$SC" --no-reorganize --apply   # create-only, never move
```

O scaffolder copia os **templates genéricos** de [`assets/templates/`](../assets/templates/): o `README.md` de cada pasta, um `_TEMPLATE.md` por tipo de artefato (RF, RNF, Epic, Feature, Sprint, ADR), e o `README.md` / `INDEX.md` / `tracker.md` dos ADRs. Ele **nunca sobrescreve** um arquivo existente — ele pula e reporta. Por ser idempotente, o *mesmo comando* tanto inicializa um repositório greenfield quanto preenche lacunas num projeto pela metade.

Após o scaffolding, **não pare em pastas vazias**: rode o Protocolo de Adaptação (§9) para preencher os templates com a realidade deste projeto, depois a **primeira ação real de ER** — elicitação (`02-elicitacao.md`), o primeiro `RF-001`, o Epic que o realiza. Pastas sem requisitos são teatro vazio.

---

## 8. Reorganizando um projeto EXISTENTE

Quando um projeto já tem arquivos de requisito/backlog espalhados (`RF-*.md` soltos na raiz de docs, ADRs inline num documento de planejamento monolítico, um `backlog.md` plano), a detecção classifica o alvo como **LOOSE-FILES** e o reorganize roda automaticamente:

```bash
SC=~/.claude/skills/engenharia-de-requisitos/assets/scaffold-structure.sh

# preview — lists every loose file it found and the moves it would make; nothing changes
bash "$SC"

# execute (uses `git mv` inside a git repo to preserve history)
bash "$SC" --apply
```

O que o reorganize faz (conservador — apenas correspondências inequívocas):

- `RF-*.md` / `RNF-*.md` soltos sob a raiz → `requirements/RF|RNF/`.
- `EP-*.md` → `backlog/epics/`, `F-*.md` → `backlog/features/`, `sprint-*.md` → `backlog/sprints/`.
- `ADR-*.md` soltos sob a raiz ou em planning → `planning/adrs/` (tier 1). ADRs escopados por feature que já estão sob uma subárvore `specs/<feature>/` são deixados no lugar (tier 2).
- Qualquer coisa ambígua é **reportada, não movida** — você decide.

### 8.1 Migrando um LEGACY-MONOLITH (atualizando de uma versão da skill pré-`docs/`)

A reorganização mais comum na prática: um projeto onde uma **versão mais antiga desta skill** produziu os requisitos como um documento solto (ex.: `REQUISITOS_UNIFICADO.md`) e parou por aí — sem `requirements/RF`, sem `backlog/`, sem espinha de rastreabilidade. A detecção o classifica como **LEGACY-MONOLITH**. Como dividir prosa com segurança exige julgamento, o scaffolder **reporta mas não divide automaticamente**. Rode a migração você mesmo:

1. **Faça o scaffold da espinha** (`bash "$SC" --apply`) para que a árvore vazia exista para receber a divisão.
2. **Leia o monólito e o decomponha** ao longo de suas fronteiras de módulo naturais:
   - um `requirements/RF/RF-NNN-<module>.md` por área funcional / bloco de Epic (preserve os IDs originais `RF-NN` *dentro* dos arquivos para que as referências cruzadas existentes sobrevivam);
   - um `requirements/RNF/RNF-<slug>.md` (ou um por classe de *"Sommerville"*) para os requisitos não-funcionais, cada um com sua tabela de métricas **quantitativa**;
   - semeie `requirements/personas-e-cenarios.md` a partir dos stakeholders/papéis que o monólito nomeia;
   - semeie `backlog/glossario.md` a partir do glossário/termos de domínio do monólito.
3. **Mantenha o monólito original como uma visão geral consolidada** — **não** o delete. Mova-o para sob `docs/requirements/` e adicione um banner com link *para dentro* da divisão (ele agora carrega a narrativa de análise/viabilidade/faseamento que não cabe na divisão por arquivo, enquanto a divisão carrega a fonte da verdade granular). Isso evita verdade-duplicada: a narrativa em prosa vive na visão geral, os requisitos atômicos vivem na divisão.
4. **Preencha a rastreabilidade retroativamente** (§9 Passo 2.7): se Epics/Features já existem, escreva-os sob `backlog/` e ligue `RF ↔ EP ↔ F` nos dois sentidos.
5. Rode o checklist abaixo.

> Projetos greenfield pulam isto inteiramente. Esta subseção existe para que **atualizar um projeto antigo seja uma migração de passe único, automática** — exatamente o que [`SKILL.md §0`](../SKILL.md) determina como primeira ação.

**Checklist manual após qualquer reorganização** (o scaffolder move arquivos; ele não consegue reescrever os links cruzados por você):

- [ ] Os links relativos (`../../requirements/...`) de cada arquivo movido ainda resolvem.
- [ ] Cada `RF`/`RNF` tem uma seção `## Realized by`; cada Epic liga para cima aos seus requisitos e para baixo às suas Features.
- [ ] ADRs que estavam inline num monólito são promovidos a um-arquivo-por-ADR (veja o racional do `planning/adrs/README.md` — cada decisão ganha sua própria URL + `git log`).
- [ ] A numeração global de ADRs não tem lacunas nem duplicatas entre os dois níveis.
- [ ] A linha de topo do `backlog/README.md` registra `Last requirements-document check: DD/MM/YYYY` (`SKILL.md §2.1`).

---

## 9. Protocolo de adaptação — fazendo os templates genéricos servirem a ESTE projeto

O scaffolder solta templates **genéricos, preenchidos com placeholders**. Eles são um esqueleto, não um entregável. O padrão é inegociável; o *conteúdo* deve ser adaptado ao projeto hospedeiro. Rode este protocolo logo após o scaffolding (ou ao reorganizar um projeto existente). **Analise primeiro; crie o default apenas quando não houver nada a analisar.**

### Passo 1 — Detecte o projeto (leia antes de escrever)

| Sonda | Como | Alimenta |
|---|---|---|
| **Idioma** | README / comentários de código / mensagens de commit → pt-BR ou inglês? | idioma de toda a prosa semeada |
| **Módulos / apps** | `apps/*`, `src/*`, pacotes, bounded contexts, domínios de topo | um `RF-NNN-<module>.md` por módulo |
| **Papéis / níveis de auth** | código de auth, enums de permissão, tabelas de papéis (`admin`/`editor`/`user`…) | personas em `personas-e-cenarios.md` |
| **Entidades de domínio** | models / schema / diagrama ER (os substantivos recorrentes) | os termos do `glossario.md` |
| **Stack** | arquivos de manifesto (`package.json`, `pyproject.toml`, `go.mod`…) | contexto técnico para `specs/` + ADRs |
| **Docs existentes** | qualquer `RF-*`, `ADR-*`, `backlog.md`, design docs já presentes | o que **reorganizar** vs criar |
| **Sinais de RNF** | gates de CI, perf budgets, menções a `LGPD`/GDPR/compliance, metas de a11y | qual `RNF-<slug>.md` instanciar |

### Passo 2 — Adapte as sementes (projeto existente)

1. **Localize** a prosa semeada para o idioma do projeto.
2. **Um RF por módulo real**: renomeie `RF/_TEMPLATE.md` para `RF-001-<module>.md … RF-NNN-<module>.md`, um por módulo detectado — cada um com um enunciado em linguagem de negócio (sem jargão).
3. **Personas a partir dos papéis**: transforme cada nível de auth / tipo de usuário numa persona `P-NN`.
4. **Glossário a partir das entidades**: semeie o `glossario.md` com os substantivos de domínio recorrentes (em ordem alfabética), cada um definido em linguagem de negócio.
5. **RNFs que de fato se aplicam**: instancie apenas os `RNF-<slug>.md` que o projeto precisa (perf, segurança, a11y, privacidade, disponibilidade…), cada um com metas **quantitativas** extraídas de budgets/gates reais.
6. **Reorganize** os artefatos soltos pré-existentes para dentro da árvore (o scaffolder move arquivos; você conserta os links cruzados — checklist §8).
7. **Preencha a rastreabilidade retroativamente** onde o histórico permitir: se Epics/Features já foram entregues, escreva-os retroativamente e ligue `RF ↔ EP ↔ F` nos dois sentidos. Num projeto **existente**, esse backfill é **oferecido ao usuário como uma pergunta explícita na primeira execução** ([`SKILL.md §0 passo 3b`](../SKILL.md)) — backfill completo agora / semear apenas o que a tarefa atual toca / só-estrutura-por-ora — porque pode ser um esforço grande e é decisão do usuário (greenfield não tem nada a preencher retroativamente).

### Passo 3 — Crie o default (greenfield, nada a analisar)

Quando o projeto está vazio ou pré-código (sem módulos, sem papéis, sem domínio ainda):

1. Mantenha os placeholders genéricos **como um checklist**, não como conteúdo final.
2. Semeie um **arquivo mínimo de personas** a partir do público pretendido (mesmo que seja só "usuário anônimo" + "admin").
3. Crie o `RF-001` para a única capacidade mais importante que o produto deve ter — o resto decorre da elicitação (`02-elicitacao.md`).
4. Deixe o `glossario.md` com os poucos termos de domínio que você já conhece; faça-o crescer conforme o domínio emerge.
5. Escolha `--with-specs` vs `--no-specs` conforme a §10.

### Regra dura — nunca entregue placeholders

Um arquivo commitado ainda contendo `<...>`, `RF-NNN`, `EP-NN`, ou `# Requisitos — <NOME DO PROJETO>` é um requisito inacabado, não um template. Ou o preencha ou o delete. Os templates genéricos existem para ser **consumidos**, não commitados ao pé da letra.

---

## 10. Decisão: você precisa de `specs/`?

> **Esta decisão é trazida à tona na primeira execução** ([`SKILL.md §0 passo 3a`](../SKILL.md)): ela é genuinamente decisão do usuário porque **fixa o tiering dos ADRs** — `--no-specs` mantém os ADRs em nível único (`planning/adrs/`), `--with-specs` os torna de dois níveis (`planning/adrs/` + `specs/<feature>/adrs/`). Infira a partir dos sinais abaixo; recomende o default; **pergunte ao usuário apenas quando os sinais forem ambíguos**. ⚠️ O scaffolder usa `--with-specs` por default — passe `--no-specs` explicitamente para o layout mais leve.

| Sinal | Recomendação |
|---|---|
| Projeto solo/pequeno, features cabem numa só cabeça | apenas `requirements/` + `backlog/`. ADRs de nível único. |
| Features atravessam ≥3 camadas (DB + backend + frontend) ou são críticas em performance/segurança | Adicione `specs/` + ADRs de tier 2. |
| Você quer que especialistas projetem antes da implementação (design-first) | `specs/` é obrigatório — é o contrato do SDD. |
| Pressão regulatória/de auditoria (você precisa mostrar *por que um design foi escolhido*) | `specs/` + ADRs dão a trilha em papel. |

Você pode começar sem `specs/` e adicioná-lo depois para a primeira feature que o merecer — o `--with-specs` do scaffolder é aditivo e idempotente.

---

## 11. Referências cruzadas

- [`SKILL.md §2.1`](../SKILL.md) — o documento é a fonte da verdade (regra zero).
- [`SKILL.md §5 Fase B`](../SKILL.md) — hierarquia do backlog (Epic → Feature → CA · US → Task).
- [`05-convencoes-interpop.md`](05-convencoes-interpop.md) — convenções de nomenclatura completas, IDs, escala de prioridade.
- [`04-bdd-criterios-aceitacao.md`](04-bdd-criterios-aceitacao.md) — CA vs BDD, a convenção `[...]`.
- [`07-mudanca-rastreabilidade.md`](07-mudanca-rastreabilidade.md) — gestão de mudanças + teoria de rastreabilidade.
- [`examples/template-documento-requisitos.md`](../examples/template-documento-requisitos.md) — documento de requisitos em arquivo único (alternativa à divisão em pasta `requirements/`, para projetos minúsculos).
- [`examples/template-backlog-openproject.md`](../examples/template-backlog-openproject.md) — espelho do `backlog/` no lado do tracker.
- [`assets/scaffold-structure.sh`](../assets/scaffold-structure.sh) — o scaffolder + reorganizador (detect → create → reorganize).
- [`assets/templates/`](../assets/templates/) — a árvore de templates **genéricos e adaptáveis** que o scaffolder materializa (distinta da [`examples/`](../examples/) preenchida com o Interpop).

---

*O layout de pastas é um meio, não um fim. Seu único trabalho é tornar a espinha de rastreabilidade (§2) física, para que uma mudança em qualquer requisito esteja a um `grep` de distância de cada artefato que ela toca. Se a estrutura algum dia brigar com a rastreabilidade, conserte a estrutura — nunca a rastreabilidade.*
