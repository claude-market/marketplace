# 03 — Especificação de Requisitos (Backlog, Epic → Feature → User Story → Task)

> Como documentar requisitos descobertos. Combina AULAS 07-09 IFPB + Sommerville 4.4. Foco no modelo ágil hierárquico — backlog estruturado em Epic, Feature, User Story, Critério de Aceitação, Task, Bug, Melhoria. User Stories integradas com BDD (ver [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md)).

---

## 1. Propósito da especificação (Pfleeger 2004)

A especificação serve dois propósitos:

1. **Base para entendimento e concordância entre clientes e desenvolvedores** sobre o que o sistema deve fazer
2. **Guia para os desenvolvedores** nas demais etapas (projeto, implementação, testes)

Sem especificação clara, projeto vira "telefone sem fio": cliente quer X, dev entende Y, entrega Z.

---

## 2. Notações para escrever requisitos (Sommerville Fig 4.11)

| Notação | Descrição |
|---|---|
| **Linguagem natural** | Frases numeradas; cada frase = 1 requisito |
| **Linguagem natural estruturada** | Template/formulário; cada campo informa um aspecto |
| **Notações gráficas** | UML (casos de uso, sequência) + anotações textuais |
| **Especificações matemáticas** | Máquinas de estado finitas, conjuntos. Inequívocas mas a maioria dos clientes não compreende |

**Regra prática**: requisitos de **usuário** sempre em linguagem natural + diagramas simples. Requisitos de **sistema** podem usar estruturado/UML/matemático conforme criticidade.

### 2.1 Diretrizes para linguagem natural (Sommerville 4.4.1)

1. **Formato padrão** para todas as definições (reduz omissões, facilita conferência). Use 1-2 frases por requisito
2. **Linguagem coerente** para distinguir obrigatório (`deve`) de desejável (`pode`)
3. **Realce de texto** (negrito, itálico) para partes importantes
4. **Não pressupor** que leitor entende jargão técnico (evite "arquitetura", "módulo"; explique acrônimos)
5. **Associar racional** a cada requisito (por que existe, quem propôs) — útil quando mudar

### 2.2 Linguagem natural estruturada (template VOLERE — Robertson & Robertson)

Cada requisito em **cartão** com campos:

- Função
- Descrição
- Entradas + fonte
- Saídas + destino
- Ação
- Requer (dependências)
- Pré-condição
- Pós-condição
- Efeitos colaterais
- **Racional** (por que existe)

Reduz variabilidade e organiza melhor. Use quando computações complexas precisam ser especificadas.

---

## 3. O documento de requisitos (estrutura IEEE 830, Sommerville Fig 4.17)

| Capítulo | Descrição |
|---|---|
| Prefácio | Público-alvo + histórico de versões + mudanças |
| Introdução | Necessidade do sistema; visão das funções; encaixe nos objetivos de negócio |
| Glossário | Termos técnicos definidos (sem pressupor expertise) |
| Definição dos requisitos de usuário | Serviços ao usuário + RNFs do sistema + padrões a seguir |
| Arquitetura do sistema | Visão de alto nível + componentes reusados |
| Especificação dos requisitos de sistema | RFs + RNFs detalhados + interfaces |
| Modelos do sistema | Modelos gráficos (objetos, fluxo, dados) |
| Evolução do sistema | Pressupostos fundamentais + mudanças previstas |
| Apêndices | Hardware, BD, restrições específicas |
| Índice | Alfabético + diagramas + funções |

**Use quando**: sistema complexo, terceirizado, regulado, longa vida útil. Em produto interno/SaaS ágil, document menor + backlog vivo no Jira/OpenProject.

---

## 4. O Backlog (modelo ágil)

### 4.1 Definição (AULA 07)

> Lista **priorizada**, **dinâmica** e **evolutiva** de tudo o que deve ser desenvolvido no produto.

Mecanismo principal de planejamento e organização em desenvolvimento ágil. **Artefato estratégico** — traduz visão do produto em itens concretos.

### 4.2 Origens (cross-framework)

| Framework | Nome / particularidade |
|---|---|
| **Scrum** | Product Backlog (o conceito principal vem daqui) |
| **XP** | Histórias de usuário + tarefas técnicas |
| **Kanban** | Coluna "to do" como fila de itens não iniciados |
| **Lean** | Fila de trabalho priorizada por valor |

**Três invariantes em todos os frameworks**: centraliza trabalho · evolui continuamente · permite priorização por valor.

### 4.3 Propósitos (AULA 07)

1. **Organizar visível e transparente** — stakeholders veem o que está planejado
2. **Priorizar por valor** — maior impacto no usuário aparece primeiro
3. **Comunicação contínua** entre equipe e stakeholders — mecanismo vivo para feedback
4. **Apoiar desenvolvimento incremental** — cada sprint consome parte refinada

### 4.4 Elementos típicos

- **Funcionalidades** — desejadas pelo usuário
- **Requisitos técnicos** — identificados pela equipe (dívida técnica, refactor, infra)
- **Melhorias** — complementares
- **Defeitos / Bugs** — a corrigir
- **Requisitos não funcionais** — performance, segurança, disponibilidade, usabilidade
- **Itens exploratórios (spikes)** — investigação para reduzir incerteza

---

## 5. Hierarquia do Backlog (modelo IFPB / OpenProject)

```
📄 Documento de Requisitos (FONTE DA VERDADE — sempre cheque antes de mexer no backlog)
    │
    ▼
PROJETO (= repositório/contexto no OpenProject — NÃO é um EPIC)
    │
    ├─ EPIC raiz #1                       ← uma frente do projeto
    │   ├─ EPIC (sub-epic)                ← decomposição em vários níveis se necessário
    │   │   └─ EPIC (sub-sub-epic)        ← exemplo IFPB Dopagem chega a 4 níveis
    │   └─ FEATURE                        ← funcionalidade entregável (várias sprints)
    │        ├─ Descrição em pt-BR de negócio   ← parágrafo lido por stakeholder não-técnico
    │        ├─ CA grupo "CA - <Tema A>"        ← CAs sempre agrupados sob tema
    │        │    ├─ CA01 - regra autossuficiente
    │        │    ├─ CA02 - regra autossuficiente
    │        │    └─ CA03 - regra com sub-regras [...]   ← convenção [...] para detalhamento
    │        ├─ CA grupo "CA - <Tema B>"
    │        │    └─ CA04 - ...
    │        └─ USER STORY                ← incremento que cabe em UMA sprint
    │             ├─ BDD                  ← DADO/QUANDO/ENTÃO no campo descrição da US
    │             ├─ CAs associados       ← relações (rastreabilidade)
    │             └─ TASK                 ← menor unidade de trabalho (termos técnicos OK)
    │
    ├─ EPIC raiz #2                       ← outra frente do projeto (irmão)
    │   └─ ... (própria sub-hierarquia)
    │
    └─ EPIC raiz #N                       ← outras frentes (irmãs)
        └─ ...
```

> **Regra zero**: o documento de requisitos é a fonte da verdade. Antes de mexer em qualquer Epic/Feature/CA do backlog, **verifique se houve alteração no documento**. Detalhamento em [SKILL.md §2.1](../SKILL.md) e [05-convencoes-interpop.md §2 Regra 0](05-convencoes-interpop.md).

> **Regra dos múltiplos Epics-raiz**: um projeto pode ter (e quase sempre tem) **vários Epics no nível mais alto, irmãos entre si**, sem um "Epic-projeto" único como pai. Cada Epic-raiz é uma frente independente (plataforma, área operacional, módulo transversal). Exemplo Controle Dopagem: `EPIC APLICAÇÃO WEB` + `EPIC APLICAÇÃO MOBILE` + `EPIC ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO` (três irmãos). Detalhamento em [`examples/template-backlog-openproject.md §3`](../examples/template-backlog-openproject.md).

> **Anti-padrão crítico**: colocar BDD na Feature em vez da User Story. Detalhamento e exemplos ❌/✅ em [04-bdd-criterios-aceitacao.md §7.7](04-bdd-criterios-aceitacao.md).

### 5.1 Definições precisas

#### 5.1.1 Artefatos do **documento de requisitos** (fonte da verdade)

| Tipo | Definição | Tamanho |
|---|---|---|
| **RF — Requisito Funcional** | O que o sistema **deve fazer**. Entrada, regra, saída. Tem ID estável (`RF-NN`), descrição em pt-BR de negócio, `Fonte` (stakeholder), `Prioridade` e `Validação`. Sem termos técnicos no título nem na descrição (endpoint/lib só na Task). | Vários por documento |
| **RNF — Requisito Não Funcional** | **Restrição** sobre como o sistema funciona: desempenho, segurança, acessibilidade, conformidade, organizacional. Sempre **quantificado com métrica** + `Como verificar`. Mesma estrutura de campos do RF. | Vários por documento |
| **G — Regra de Negócio** | Restrição do **domínio** (regulação, política editorial, regulamento WADA, LGPD). Não é RF nem RNF — é invariante do negócio que o sistema deve respeitar. Tem ID `G-NN`. | Vários por documento |

#### 5.1.2 Artefatos do **backlog** (materialização incremental dos requisitos)

| Tipo | Definição | Tamanho |
|---|---|---|
| **Epic** | Produto, sub-produto, agrupamento, módulo, macro-funcionalidade. Pode ter sub-Epics aninhados. **Tem descrição em pt-BR de negócio.** Cada Epic referencia os RF/RNF/G de origem via campo `Origem (requisitos)`. | Várias features |
| **Feature** | Funcionalidade de produto/módulo a ser disponibilizada ao cliente. **Tem descrição em pt-BR de negócio.** Geralmente disponibilizada após várias sprints. NUNCA tem BDD. Referencia os RF/RNF de origem. | Várias US |
| **Grupo de CA (`CA - <Tema>`)** | Agrupador de Critérios de Aceitação por tema. **Sempre obrigatório**, mesmo Feature com 1 só CA. No OpenProject, item do tipo "Critério de Aceitação" sem ID `CANN`, só título descritivo. | Vários CAs |
| **Critério de Aceitação (CA)** | Condições (regras) para a funcionalidade ser considerada **concluída / aceita**. Frase declarativa em linguagem de negócio. **Convenção `[...]` no fim do título** quando tem sub-regras (detalhamento no corpo do item, abrindo com `Regras a serem aplicadas:`). | Várias por feature |
| **User Story (US)** | Incremento funcional desenvolvido para disponibilizar **parte de uma feature**. **Deve iniciar e terminar em UMA sprint**. **Tem BDD em pt-BR no próprio campo Descrição** (cenários `Dado/Quando/Então`) + CAs herdados via rastreabilidade. | Várias tasks |
| **Task** | Menor unidade de trabalho para implementar US (ações). Termos técnicos PERMITIDOS aqui. | **Quanto menor, melhor** |
| **Bug** | Problema a corrigir. Tem descrição. | Atômico |
| **Melhoria** | Aprimoramento de funcionalidade existente. Tem descrição. | Atômico |
| **Spike** | Item **investigativo/exploratório** time-boxed para reduzir incerteza antes de estimar/iniciar uma US. Termina com um artefato (relatório, PoC, ADR) e fecha — não entrega feature por si só. AULA 07 IFPB. | Time-boxed (1-3 dias) |

> **Relação documento ↔ backlog**: um RF/RNF gera **uma ou várias Features**; uma Feature implementa **um ou vários RF/RNF**. A rastreabilidade vive no campo `Origem (requisitos)` de cada Epic/Feature/CA (vai para os IDs `RF-NN`/`RNF-NN`/`G-NN` do documento) — e no campo `Histórico de revisões` do documento (cada mudança no documento aponta o impacto no backlog). Sem essa ponte bidirecional, é **scope creep silencioso**.

> **Spike — quando usar**: "não sei estimar essa US porque não sei se a lib X aguenta esse volume" → vira `SPIKE: validar throughput da lib X com dataset N (3 dias)`. Não confundir com US: spike **investiga**; US **entrega valor ao cliente**. Resultado do spike alimenta refinamento da US verdadeira na próxima rodada.

> **Regra dura derivada**: TODOS os artefatos (Epic, Feature, US, CA, RNF, Bug, Melhoria) **têm descrição em linguagem de negócio**. Detalhamento em [05-convencoes-interpop.md §2 Regra 8](05-convencoes-interpop.md). Templates trabalhados em [examples/template-backlog-openproject.md](../examples/template-backlog-openproject.md) e [examples/template-documento-requisitos.md](../examples/template-documento-requisitos.md).

### 5.2 Exemplo concreto (IFPB Controle Dopagem, AULA 07)

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

**Note**: hierarquia profunda (5+ níveis de Epic) é normal para sistemas grandes. Em SaaS pequeno, 2-3 níveis bastam.

---

## 6. User Stories (US)

### 6.1 História completa (AULA 09)

- **1997 — Kent Beck** introduz "histórias de usuários" no projeto Chrysler C3 (Detroit) — "peças de jogo no planejamento"
- **1998 — Alistair Cockburn**: *"Uma história de usuário é uma promessa de uma conversa"*
- **1999 — Beck publica** Extreme Programming Explained
- **2001 — Ron Jeffries**: **3 Cs** (Card, Conversation, Confirmation)
- **2001 — Equipe XP da Connextra (Londres)** concebe o formato clássico: `Como [persona], eu quero [funcionalidade] para que [benefício]`
- **2004 — Mike Cohn** publica *User Stories Applied* — referência padrão

### 6.2 Os 3 Cs (Jeffries 2001)

| C | Significado |
|---|---|
| **Card** | Cartão físico curto — placeholder e símbolo |
| **Conversation** | A história é uma promessa de conversa (Cockburn). Detalhes vêm na conversa entre dev/PO/QA, não no card |
| **Confirmation** | Critérios de aceitação que confirmam que a história foi entregue corretamente |

### 6.3 ⚠️ Regra crítica do título no backlog

**No card/backlog, use TÍTULO CURTO descritivo**, não o template Connextra inteiro.

```
✅ BOM (forma reduzida)
   US Busca de Livros para Pronta Entrega
   US Visualização de filmes disponíveis para reserva
   US Listagem BÁSICA de Atletas

❌ RUIM (Connextra no título)
   "Como um vendedor responsável pelo setor de livros eu quero
    procurar por livros filtrando por nome para que seja possível
    verificar se o livro X está disponível para pronta entrega"
```

O formato Connextra serve para **conversa exploratória**, não para card. No card é poluição visual e ilegível. O conteúdo do formato Connextra (persona/funcionalidade/benefício) vai no campo de **descrição** ou na **conversa**, não no título.

### 6.4 Por que User Stories no backlog

Desenvolvimento ágil = funcionalidades disponibilizadas **iterativa e incrementalmente**. Usuário valida pequenas partes em curtos espaços de tempo.

**Princípio de fatiamento**: CAs especificados para FEATURES são **distribuídos** em várias US a serem desenvolvidas em uma ou várias sprints. Ao término de cada sprint, um sub-conjunto da feature é disponibilizado para usuário validar.

### 6.5 Fluxo para criar User Stories de uma Feature (AULA 09)

1. **Analisar os CAs da feature**
2. **Definir os CAs que devem ser entregues de forma agrupada em cada sprint** (priorização incremental)
3. **Criar uma US para cada grupo de CA definido**. Para cada US:
   - **3.1 Especificar BDD** (no campo descrição)
   - **3.2 Associar CAs** (rastreabilidade no OpenProject via "Relações")

### 6.6 Exemplo concreto de fatiamento (Feature CONSULTA DE ATLETAS, AULA 09)

A feature tem 15 CAs (CA01..CA15). Em vez de implementar tudo numa sprint gigante, fatie em **3 US incrementais**:

**Sprint 1** — entregar consulta básica, mais simples possível:
- Controle de acesso (CA01)
- Filtro implícito por federação do usuário (CA02)
- Layout conforme protótipo (CA03)
- Listagem em ordem alfabética por default (CA13)
- Exibir todos os atletas (CA15)
→ **US Listagem BÁSICA de Atletas**

**Sprint 2** — evoluir para ordenação interativa + paginação:
- Reordenação por clique no título (CA14a)
- Paginação 10/50/100/todos (CA14b)
→ **US Listagem com ordenação e paginação (sem busca)**

**Sprint 3** — evoluir com opções de busca:
- Filtros aplicados (CA04, CA05, CA06, CA07)
- Comboboxes ativos + alfabéticos (CA08-CA12)
→ **US Listagem Avançada com opções de busca (filtro)**

Cada US é **entregável** ao usuário (ele vê valor parcial em cada sprint), **NÃO bloqueia a próxima** (independente quanto a release), e **cabe em UMA sprint**.

### 6.7 INVEST (Mike Cohn — checklist clássico de boa US)

Toda US bem escrita atende:

| Letra | Critério | O que verificar |
|---|---|---|
| **I**ndependent | Independente | Pode ser desenvolvida sem depender de outra US do backlog |
| **N**egotiable | Negociável | Não é contrato fechado; detalhes vêm na conversa |
| **V**aluable | Valiosa | Entrega valor para o usuário (não só técnica) |
| **E**stimable | Estimável | Equipe consegue dar story points |
| **S**mall | Pequena | Cabe em uma sprint |
| **T**estable | Testável | Há critérios de aceitação verificáveis |

Falhou em ≥1 → quebrar / reescrever / mover para conversa com PO.

### 6.8 Conteúdo da US no OpenProject (modelo IFPB)

```
Tipo:        User Story
Título:      US Listagem BÁSICA de Atletas
Descrição:   DADO que o usuário esteja logado na aplicação e
             tenha permissão de acesso
             QUANDO acessar o menu administrativo > ATLETAS
             ENTÃO deve-se exibir a relação básica de atletas
Relações:    [#21429] CA01 - Apenas usuários autorizados podem ter acesso...
             [#21430] CA02 - A consulta deve exibir apenas os atletas das...
             [#21431] CA03 - A tela de consulta deve conter os campos e layout...
             [#21441] CA13 - A listagem geral deverá ser exibida em ordem alfabética...
```

O **BDD** vai no campo de descrição da US. Os **CAs** ficam linkados via "Relações". Isso preserva rastreabilidade: ao executar a US, dev/QA sabem exatamente quais regras devem ser cobertas.

---

## 7. Critérios de Aceitação (CAs)

> Detalhamento completo + estilo declarativo vs Gherkin/BDD em [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md).

**Resumo**: CAs são **regras testáveis especificadas POR FEATURE** (não por US). Cada CA é uma frase declarativa que descreve um invariante.

```
CA05 - O campo CPF não é obrigatório. Mas se preenchido, deverá
       ser no formato XXX.XXX.XXX-XX. Se o CPF for inválido, emitir
       mensagem de erro.

CA07 - Os campos NOME, TÉCNICO, PATROCINADOR e MÉDICO NÃO são
       obrigatórios. Mas se for preenchido deve ter no mínimo 5
       letras. Devendo a aplicação realizar uma busca PARCIAL pelo
       conteúdo digitado.

CA13 - A listagem geral de atletas deverá ser exibida em ordem
       alfabética, por default.
```

**Regra IFPB**: **TODA feature DEVE ter CAs especificados.** Sem CAs, a feature é desejo, não requisito.

---

## 8. Tasks

Menores unidades de trabalho para implementar uma US. **Quanto menor, melhor** — tipicamente 1-8h cada.

Exemplos:

```
US Listagem BÁSICA de Atletas
  ├─ Task: Criar endpoint GET /api/atletas
  ├─ Task: Implementar middleware de autorização
  ├─ Task: Criar componente <ListaAtletas/>
  ├─ Task: Adicionar paginação default no backend
  ├─ Task: Escrever testes unitários do endpoint
  └─ Task: Escrever testes E2E do fluxo
```

Tasks são **ferramenta da equipe técnica**, não do PO. PO não negocia task; negocia US.

---

## 9. Ordem operacional (qual usar quando)

| Momento | Foco | Artefato |
|---|---|---|
| Início do projeto / domínio novo | Visão alto nível | **Epic** macros |
| Decomposição de Epic | Funcionalidades entregáveis | **Features** |
| Especificação de Feature | Regras testáveis | **Critérios de Aceitação** |
| Planning meeting | Fatiamento por sprint | **User Stories** com BDD + CAs |
| Sprint planning detalhada | Quebra técnica | **Tasks** |

---

## 10. Sinalizadores de especificação ruim

- Backlog tem só "features" sem hierarquia (vira lista plana de 200 itens)
- Features sem CAs definidos
- User Stories com Connextra no título
- User Stories que demoram >1 sprint (não atendem **S** de INVEST)
- CAs ambíguos ("deve ser amigável", "deve ser responsivo") — não testáveis
- US sem BDD nem CAs associados — dev adivinha o critério de pronto
- Backlog sem priorização (impossível negociar trade-off)
- Tasks com >1 dia de trabalho — esconde complexidade não revelada
- **Títulos com infinitivo** (`Listar X`, `Buscar Y`) — viola convenção Interpop
- **Termos técnicos em Epic/Feature/US** (`Endpoint /api/...`, `Migration tabela X`) — viola convenção Interpop
- **Configurações técnicas como Feature** (ESLint, env vars, criação de pastas) — devem ser Tasks transversais, não Features
- **Feature carregando BDD** ou **US sem BDD** — confusão de responsabilidade. Feature tem descrição; só US tem BDD.

---

## 11. Materialização: o artefato `BACKLOG.md`

Toda especificação substantiva produz dois artefatos pareados:

| Artefato | Produz | Consome |
|---|---|---|
| `DESIGN.md` | `design-orchestrator` (ou main loop) | Decisões arquiteturais (6 layers + ADRs) |
| **`BACKLOG.md`** | **`documentation-engineer`** (via skill `engenharia-de-requisitos`) | **Hierarquia Epic → Feature → CA · US → BDD · Task em pt-BR** |

**Regra dura**: nenhum `DESIGN.md` é considerado completo sem `BACKLOG.md` pareado no mesmo diretório.

### Por que pareado

- DESIGN traz **decisões** (CQRS, ts_rank_cd, cursor pagination)
- BACKLOG traz **execução** (Task IDs que o `code-implementer` pega um por vez)
- Sem BACKLOG, o DESIGN vira teoria desconectada de implementação
- Cada linha de código vai trace para um Task ID; cada teste vai trace para uma CA ou BDD cenário

### Template + exemplos detalhados

Template completo do `BACKLOG.md`, exemplos do projeto **SIRA** (Sistema de Reserva de Salas IFPB) e **Interpop** (Busca Editorial), regras de naming, escala de prioridade Immediate/High/Normal/Low, IDs estáveis — **tudo em [05-convencoes-interpop.md](05-convencoes-interpop.md)**.

---

## 12. Conexão com as próximas references

- **BDD + CA + estilo**: [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md)
- **Convenções Interpop + template BACKLOG.md**: [05-convencoes-interpop.md](05-convencoes-interpop.md) ⭐ novo
- **Estimativa Planning Poker**: [05-estimativa.md](05-estimativa.md) → renumerado para [06-estimativa.md](06-estimativa.md) (re-numbering pending)
- **Validação (Falbo 7 dimensões)**: [06-validacao.md](06-validacao.md)
- **Rastreabilidade end-to-end**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
