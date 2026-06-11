# 05 — Convenções Interpop + Template `BACKLOG.md`

> Camada **prática** sobre o conteúdo canônico das references 01-04. As convenções abaixo são **regras duras** do projeto Interpop (validadas em SIRA também). Aplicam-se a todo projeto pt-BR deste autor.
>
> Por que viver aqui: as references 01-04 trazem a teoria (Sommerville, Pressman, Falbo, IFPB). Esta reference é o **como aplicar na prática** com naming, IDs, prioridade e estrutura do `BACKLOG.md`.

---

## 1. Quando usar este reference

Sempre que for:
- Produzir um **`BACKLOG.md`** para qualquer feature/módulo (mandatório se há `DESIGN.md`)
- Revisar nomes de Epic/Feature/User Story em backlog existente
- Decidir se algo é Feature ou Task técnica
- Atribuir prioridade a item de backlog
- Treinar agent/dev novo na convenção do time

---

## 2. As 10 regras duras (não negociáveis)

### Regra 0 — Documento de requisitos é a FONTE DA VERDADE

O backlog **NUNCA muda sem que o documento de requisitos mude primeiro**. O backlog é uma materialização do documento — organiza, fatia, prioriza — mas não decide escopo sozinho.

Isso significa:

- 🔁 **Antes de mexer no backlog, sempre verifique se houve alteração no documento de requisitos.** Cliente pode pedir adicionar/alterar/remover durante o projeto — propague para o documento primeiro, depois para o backlog.
- 📎 O `BACKLOG.md` aponta no topo para o `REQUISITOS.md`: `Documento de requisitos: ../docs/specs/<feature>/REQUISITOS.md (rev. de DD/MM/AAAA)` + `Última verificação de alteração no documento: DD/MM/AAAA — sem mudanças desde a última sprint`.
- 📎 **Cada Epic/Feature/CA/RNF do backlog tem o campo `Origem (requisitos): RF-NN, RNF-NN, G-NN`** apontando de volta para os itens do documento que ele atende.
- ⚠️ Item aparecendo no backlog sem `Origem (requisitos)` é suspeito — ou é scope creep, ou refinamento técnico mal colocado (deveria ser Task).
- 📅 O documento de requisitos tem **histórico de revisões** (§11 do template) com versão, data, autor, mudança, impacto no backlog.

Template do documento: [`../examples/template-documento-requisitos.md`](../examples/template-documento-requisitos.md).

### Regra 1 — Sem infinitivo nos títulos de Epic/Feature/US/RF/RNF/G

Use substantivo ou gerúndio descritivo. Tasks (técnicas) podem violar. Vale tanto para o **backlog** (Epic/Feature/US) quanto para o **documento de requisitos** (RF/RNF/G).

| ❌ Errado | ✅ Certo |
|---|---|
| Listar reservas do usuário | Listagem de reservas do usuário |
| Buscar artigos | Busca de artigos |
| Cadastrar atleta | Cadastro de atleta |
| Aprovar reserva | Aprovação de reserva |
| Filtrar por autor | Filtragem por autor |
| Compartilhar busca | Compartilhamento da busca |
| **RF**: `Buscar artigos por texto livre` | **RF**: `Busca de artigos por texto livre` |
| **RNF**: `Responder consultas em até 800ms` | **RNF**: `Tempo de resposta da primeira tela de busca` (corpo da descrição: "deve aparecer em ≤800ms p95") |
| **G**: `Bloquear artigos em moderação` | **G**: `Artigos em moderação não aparecem em buscas` |

### Regra 2 — Sem termos técnicos em Epic/Feature/US/CA/**RF**/RNF/G

Termos técnicos (endpoint, hook, migration, schema, API, config, deploy, nome de tabela, nome de método, comando shell, HTTP status code) só aparecem nas **Tasks**. Vale para todos os artefatos de **backlog** (Epic/Feature/US/CA) **e de documento de requisitos** (RF/RNF/G) — porque ambos são lidos por stakeholders e auditores, não por dev.

| ❌ Errado | ✅ Certo |
|---|---|
| Endpoint REST de busca de artigos | Busca de artigos por texto |
| Hook useSearch com TanStack Query | Apresentação dos resultados em tempo real |
| Migration tabela `search_index` | (não é Feature — vira Task `T30.1.2`) |
| Configurar `pg_cron` para limpeza | (não é Feature — vira Task transversal `TX-04`) |
| **CA**: `O endpoint POST /api/v1/bans/ retorna HTTP 400 se hierarquia violada` | **CA**: `Quando um administrador tenta banir outro administrador, o sistema rejeita a operação com a mensagem "Operação não permitida".` |
| **RF**: `Implementar query Postgres com tsvector para busca full-text` | **RF**: `O sistema deve permitir que o leitor encontre artigos publicados por palavra-chave, com resultados ordenados por relevância.` |
| **RNF**: `O índice GIN do Postgres deve responder consultas em ≤50ms` | **RNF**: `A primeira tela de resultados deve aparecer em ≤800ms (p95) para acervo de até 5.000 artigos publicados` |
| **G**: `Filtrar WHERE status != 'em_moderacao' no SELECT` | **G**: `Artigos com status "em moderação" não aparecem em resultados de busca, mesmo para o autor original.` |

### Regra 3 — Pt-BR explícito, simples e direto

O texto deve ser lido por stakeholder não-técnico (PO, coordenador, professor avaliador, cliente).

| ❌ Errado | ✅ Certo |
|---|---|
| Implementar fluxo CRUD do recurso X | Cadastro, edição e remoção do recurso X |
| Setar up auth com JWT | Acesso seguro com login e senha |
| F-20 BTS | F-20 Listagem de reservas pessoais com filtros e busca |

### Regra 4 — Configurações técnicas NÃO são Features

**Feature = entregável ao cliente final.** Se ninguém fora do time de dev vai perceber a entrega, não é Feature. Vai como Task (US-bound ou transversal `TX-NN`).

São Tasks transversais (`TX-NN`) — NÃO Features:

| Item | Classificação correta |
|---|---|
| Configurar variáveis de ambiente | Task transversal |
| Adicionar lib ao `package.json` | Task transversal |
| Criar `docker-compose.dev.yml` | Task transversal |
| Configurar ESLint / Prettier | Task transversal |
| Criar pastas iniciais do projeto | Task transversal |
| Setup do CI (GitHub Actions) | Task transversal |
| Configurar `drf-spectacular` para OpenAPI | Task transversal |
| Configurar Sentry/Prometheus | Task transversal |
| Criar arquivo de configuração JSON | Task transversal |
| Configurar índice GIN no Postgres | Task da US relevante (não transversal — apoia US específica) |

### Regra 5 — Prioridade Interpop (4 níveis em todos os nós)

Use a escala Interpop em todo Epic, Feature, US e Task:

| Símbolo | Nome | Significado |
|---|---|---|
| 🔴 | **Immediate** | Bloqueia outros itens; sprint atual obrigatoriamente |
| 🟠 | **High** | Sprint atual ou próxima |
| 🟡 | **Normal** | Backlog priorizado |
| 🟢 | **Low** | Nice to have, sem deadline |

> **Equivalência teórica com MoSCoW** (Wiegers/Cohn): Must = Immediate · Should = High · Could = Normal · Won't = Low. Mas no Interpop **use a escala Immediate/High/Normal/Low** — é a que está nas ferramentas (OpenProject) e a que o time consome.

### Regra 6 — Cada nó tem o seu artefato — Feature descrição, US BDD

| Nó | Tem descrição? | Tem CAs? | Tem BDD? |
|---|---|---|---|
| Epic (raiz ou aninhado) | Sim (parágrafo em pt-BR de negócio) | Não (CAs ficam em Features) | Não |
| **Feature** | **Sim (parágrafo em pt-BR de negócio)** | **Sim (lista CA01..CANN, sempre agrupada por tema)** | **Não** ⚠️ |
| **User Story** | **Sim — o BDD em pt-BR no próprio campo "Descrição"** ⚠️ | Não (CAs ficam na Feature — US REFERENCIA quais cobre via campo "CAs cobertos") | **Sim (`Dado/Quando/Então` no campo Descrição)** ⚠️ |
| Task | Sim (frase curta com termo técnico OK) | Não | Não |

**Erro comum**: colocar BDD em Feature. **Não faça**. BDD vive em User Story (anti-padrão detalhado em [04-bdd-criterios-aceitacao.md §7.7](04-bdd-criterios-aceitacao.md)).

**Detalhe importante sobre o BDD no OpenProject**: cada **Cenário** Gherkin é **conteúdo do campo Descrição da US** — não cria card filho na hierarquia. Quem usa Cucumber/pytest-bdd/cucumber-playwright pode espelhar cada cenário em arquivo `.feature` correspondente (template em [examples/template-user-story.feature](../examples/template-user-story.feature)).

### Regra 7 — CAs sempre agrupados sob `CA - <Tema>` + convenção `[...]`

CAs ficam **sempre** dentro de um item agrupador `CA - <Tema>` no OpenProject (tipo "Critério de Aceitação", sem ID `CANN`, apenas título descritivo). Mesmo quando a Feature tem 1 só CA. Isso mantém consistência visual no backlog e facilita inserção futura.

**Convenção `[...]`** — quando um CA precisa de sub-regras para ser totalmente testável, **encerre o título com `[...]`** e detalhe no corpo do item abrindo com `Regras a serem aplicadas:` + bullets. CA sem `[...]` deve ser **autossuficiente no título**.

| Caso | Convenção |
|---|---|
| CA com regra autossuficiente no título | Sem `[...]` |
| CA com sub-regras paralelas no corpo | Termina em `[...]` + `Regras a serem aplicadas:` no corpo |

Exemplo concreto:

```
✅ CA05 - O campo CPF não é obrigatório. Mas se preenchido, deverá ser
         no formato XXX.XXX.XXX-XX. Se inválido, emitir mensagem de erro.

✅ CA09 - O combobox FEDERAÇÃO deve aplicar as regras de preenchimento
         e validação conforme detalhamento [...]

   Corpo (campo Descrição do CA09):
   Regras a serem aplicadas:
   - Só deverá ser habilitado se tiver uma CONFEDERAÇÃO selecionada.
   - Só deve exibir as Federações ATIVAS.
   - Em ordem ALFABÉTICA.
   - Deve exibir apenas as federações que o usuário logado está associado.
   - Deve permitir busca parcial ao digitar.
```

Detalhamento completo da convenção `[...]` em [04-bdd-criterios-aceitacao.md §2.5](04-bdd-criterios-aceitacao.md).

### Regra 8 — TODOS os artefatos têm descrição em linguagem de negócio

Epic, Feature, User Story, CA, **RF**, RNF, regra de negócio (G): **todos** têm descrição em pt-BR em linguagem de negócio. Lida por qualquer stakeholder (PO, cliente, dev júnior recém-chegado, auditor) sem precisar de glossário técnico. Sem URLs, sem nomes de método, sem stack.

| Artefato | Onde vive | Descrição é... |
|---|---|---|
| Epic | Backlog | Parágrafo explicando o problema do usuário/operação que o Epic resolve. 3–6 frases. |
| Feature | Backlog | Parágrafo explicando o que o cliente vai conseguir fazer ao receber a Feature. 3–5 frases. Linguagem de negócio. |
| User Story | Backlog | O **BDD em pt-BR** (cenários `Dado/Quando/Então` no campo Descrição). |
| CA | Backlog | Frase declarativa imperativa testável. Se sub-regras, `[...]` + bullets. |
| **RF** | **Documento de requisitos** | **Parágrafo em pt-BR descrevendo o que o sistema deve fazer — entrada/regra/saída do ponto de vista de negócio. Tem `Origem` (stakeholder que pediu), `Prioridade`, e `Critério de aceitação` resumido. Detalhamento da feature equivalente fica no backlog.** |
| RNF | Documento de requisitos | Restrição quantificada com métrica + como verificar. |
| Regra de negócio (G) | Documento de requisitos | Restrição do domínio (regulação, política editorial, codigo profissional). |
| Task | Backlog | Frase curta (termos técnicos OK aqui — escopo do dev). |

> **Relação RF ↔ Feature**: o `RF-NN` é o **requisito declarado** no documento. A `F-NN` (Feature) é a **materialização incremental** desse RF no backlog. Um RF pode gerar uma ou várias Features; uma Feature implementa um ou vários RFs. O backlog **referencia o RF de origem** via campo `Origem (requisitos)` em cada Epic/Feature. Sem essa rastreabilidade, é scope creep silencioso.

**Por que essa regra é dura**: requisito ilegível para stakeholder é requisito não validado. Sommerville 4.5: "a única validação confiável é a que envolve o stakeholder lendo e concordando." Se ele não consegue ler, ele não consegue validar.

### Regra 9 — Múltiplos Epics-raiz, sem "Epic-projeto" único como pai

O projeto pode (e quase sempre vai) ter **vários Epics no nível mais alto, irmãos entre si, sem um Epic-pai comum**. Cada Epic-raiz representa uma frente independente: uma plataforma, uma área operacional, um módulo transversal.

**Por quê**: o "produto" como um todo é o **repositório/contexto do projeto no OpenProject** — não um item da hierarquia. Forçar tudo embaixo de um único "Epic Produto" cria:

- Nó-pai vazio (sem descrição útil, porque a descrição do produto já está no `REQUISITOS.md` e no README do repo);
- Ambiguidade ("este Epic-raiz é o produto-todo ou é uma frente?");
- Atrito de navegação (um nível inteiro de cliques antes de chegar onde o trabalho real está).

**Exemplos reais**:

| Projeto | Epics-raiz irmãos |
|---|---|
| **Controle de Dopagem** (curso IFPB) | `EPIC APLICAÇÃO WEB` · `EPIC APLICAÇÃO MOBILE` · `EPIC ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO` |
| **Interpop** | `EP-10 Busca Editorial` · `EP-09 Filtros Temáticos` · `EP-15 Newsletter` · `EP-20 Moderação Editorial` |
| **SaaS multi-tenant qualquer** | `EPIC Aplicação Web` · `EPIC API Pública` · `EPIC Painel Admin` · `EPIC Integrações com Terceiros` |

**Quando faz sentido um único Epic-raiz**: projeto MVP enxuto com 1-2 sprints de escopo total. Nesse caso, o Epic-raiz único pode até ser o nome do produto temporariamente, até crescer.

**Anti-padrão**: criar `EPIC Sistema` como avô de tudo "para organizar". Isso é equivalente a criar uma pasta `/projeto` dentro de um repositório que já se chama `projeto`. Redundante.

Detalhamento e diagrama em [`../examples/template-backlog-openproject.md §3`](../examples/template-backlog-openproject.md) e [SKILL.md §5 Fase B](../SKILL.md).

---

## 3. Sistema de IDs (formato Interpop)

| Tipo | Padrão | Exemplo | Notas |
|---|---|---|---|
| Epic | `EP-NN` | `EP-10` | Numeração contínua no projeto |
| Feature | `F-NN` | `F-30` | Numeração contínua; primeira Feature do Epic 10 começa em F-30 (convenção: F começa em décadas, deixa folga) |
| Critério de Aceitação | `CANN` | `CA01`, `CA12` | Contagem por **Feature** (resetar a cada Feature) OU contínua no projeto — escolha uma e mantenha |
| User Story | `USNN.M` | `US30.1`, `US30.4` | `NN` = nº da Feature pai; `M` = sequência dentro da Feature |
| Task | `TNN.M.K` | `T30.1.7` | `NN.M` = US pai; `K` = sequência |
| Task transversal | `TX-NN` | `TX-01`, `TX-12` | Numeração contínua no projeto |

**Regra ouro**: IDs são **eternos**. Não renumeram quando algo muda; a versão muda. Isso preserva rastreabilidade em commits, PRs, ADRs.

**Em commits/PRs**:
```bash
git commit -m "feat(search): implementa SearchService.query [T30.1.7]"
git commit -m "test(search): adiciona cenário BDD listagem básica [US30.1]"
git commit -m "fix(search): corrige race em cursor [CA02]"
```

---

## 4. Template completo de `BACKLOG.md`

```markdown
# Backlog — <Feature/Módulo em pt-BR>

> Hierarquia: Epic → Feature → CA · US → BDD · Task
> Convenções: pt-BR sem infinitivo · sem termos técnicos em Epic/Feature/US · Feature tem descrição · US tem BDD · prioridades 🔴 Immediate / 🟠 High / 🟡 Normal / 🟢 Low em todos os nós

## 🟦 EP-NN <Título descritivo em pt-BR sem infinitivo>

| Campo | Valor |
|---|---|
| ID | EP-NN |
| Prioridade | 🔴 / 🟠 / 🟡 / 🟢 |
| Status | New / Refining / Ready / In Progress / Review / Done |
| Sprint alvo | Sprint X (e Sprint Y, se cruzar) |
| Descrição | <parágrafo em pt-BR explícito, sem termos técnicos> |
| Pertence a | Aplicação Web / Mobile / Backend (root do projeto) |
| Features | F-AA, F-BB, F-CC |

---

## 🟩 F-AA <Título descritivo em pt-BR>

| Campo | Valor |
|---|---|
| ID | F-AA |
| Tipo | Feature |
| Epic | EP-NN |
| Prioridade | (escala) |
| Status | (estados) |
| Sprint alvo | Sprint X |
| Entregável ao cliente | Sim — **se Não, NÃO é Feature; mover para Tasks** |
| Descrição | <parágrafo em pt-BR explicando o que o leitor/usuário vai conseguir fazer> |

### Critérios de Aceitação da F-AA

| ID | Descrição | Prioridade |
|---|---|---|
| CA01 | <regra testável em pt-BR, frase declarativa> | (escala) |
| CA02 | <…> | (escala) |

### User Stories da F-AA

#### 🟦 USAA.M <Título em pt-BR — incremento que cabe em UMA sprint>

| Campo | Valor |
|---|---|
| ID | USAA.M |
| Feature | F-AA |
| Prioridade | (escala) |
| Status | (estados) |
| Sprint alvo | Sprint X |
| CAs cobertos | CA01, CA02, … |
| Story Points | <Fibonacci: 1, 2, 3, 5, 8, 13, 21> |

**BDD (`Dado/Quando/Então` em pt-BR)**:

\`\`\`gherkin
Cenário: <Título descritivo em pt-BR>
  Dado <pré-condição>
  E <pré-condição adicional>
  Quando <ação do usuário>
  E <ação adicional>
  Então <resultado esperado>
  E <verificação adicional>
\`\`\`

\`\`\`gherkin
Cenário: <Caminho alternativo / erro / edge case>
  Dado <…>
  Quando <…>
  Então <…>
\`\`\`

**Tasks da USAA.M** (aqui PODE haver termos técnicos):

| ID | Descrição da Task | Prioridade |
|---|---|---|
| TAA.M.1 | <task técnica concreta, ex.: "Implementar SearchService.query() com paginação keyset"> | (escala) |
| TAA.M.2 | <…> | (escala) |

---

## 📋 Tasks transversais (configurações técnicas — não são Features)

| ID | Descrição | Prioridade | Para qual US (ou "geral") |
|---|---|---|---|
| TX-01 | Configurar variável de ambiente `<NOME>` no `.env.example` | (escala) | TAA.M.K |
| TX-02 | Adicionar `<lib>` ao `package.json` | (escala) | geral |
| TX-03 | Criar `docker-compose.dev.yml` com Postgres 16 + Redis | (escala) | geral |

---

## 📊 Resumo do backlog

| Nível | Quantidade |
|---|---|
| Epics | <n> |
| Features | <n> |
| CAs | <n> |
| US | <n> |
| BDD cenários | <n> |
| Tasks (US-bound) | <n> |
| Tasks transversais | <n> |
| **Story Points totais** | **<n>** (Sprint X) + **<n>** (Sprint Y) |

### Plano de Sprints

| Sprint | Foco | Story Points | Features entregues |
|---|---|---|---|
| Sprint X | <descrição> | <pontos> | F-AA, F-BB |
| Sprint Y | <descrição> | <pontos> | F-CC |

---

## 🔗 Rastreabilidade

| Requisito (RF/RNF) | Feature | US | CA | BDD | Task | Teste |
|---|---|---|---|---|---|---|
| RF: <…> | F-AA | USAA.M | CA01 | "<cenário>" | TAA.M.K | <teste path> |

---

## ⚖️ Validação Falbo 7 dimensões (engenharia-de-requisitos)

| Feature | Completo | Correto | Consistente | Realista | Necessário | Priorizável | Verificável |
|---|---|---|---|---|---|---|---|
| F-AA | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
```

---

## 5. Exemplos reais do projeto Interpop (Busca Editorial)

Exemplo completo em produção: [`/home/gabriel/Documentos/Projetos/interpop/docs/specs/busca-editorial/BACKLOG.md`](../../../Documentos/Projetos/interpop/docs/specs/busca-editorial/BACKLOG.md) — 696 linhas, 1 Epic + 3 Features + 27 CAs + 12 US + 20 cenários BDD + 84 Tasks + 12 TX.

### Extrato (boas referências)

**Epic em pt-BR sem infinitivo, sem termo técnico**:
```
EP-10 Busca Editorial
Descrição: Conjunto de funcionalidades que permite ao leitor encontrar artigos
do Interpop através de palavras-chave e filtros, com resultados ordenados por
relevância. Inclui também o compartilhamento da busca via link.
```

**Feature com descrição (sem BDD)**:
```
F-30 Busca de artigos por texto
Descrição: Tela "Buscar" que permite ao leitor digitar uma palavra ou frase e
visualizar os artigos do Interpop que contenham aquele termo no título, no
resumo ou no corpo. Os resultados aparecem ordenados pela relevância (artigos
com o termo no título aparecem primeiro) e com destaque visual nas palavras
buscadas.
```

**User Story com título descritivo + BDD em pt-BR**:
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

**Task com termos técnicos (permitido)**:
```
T30.1.7  Implementar SearchService.query(spec: QuerySpec) -> SearchResultPage
         com paginação keyset (cursor base64 assinado HMAC)         🟠 High
```

**Task transversal (configuração técnica fora de Feature)**:
```
TX-03  Adicionar `extension unaccent` no Postgres via migration
       `0002_search_extensions`                                     🔴 Immediate
```

---

## 6. Exemplos reais do projeto SIRA (Sistema de Reserva)

Referenciados nos prints do usuário (OpenProject):

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

Note que:
- `EP-08 Minhas Reservas (CRUD)` — substantivo, sem infinitivo
- `F-20 Listagem de reservas pessoais com filtros e busca` — substantivo + descrição
- `US20.1 Visualização Base e Ordenação da Lista de Reservas Pessoais` — substantivo
- CAs em frase declarativa pt-BR direta

---

## 7. Smell test (rápido antes de mergear backlog)

Antes de aceitar um `BACKLOG.md`, rode este grep mental:

- [ ] **Documento de requisitos foi verificado** antes de mexer no backlog? Topo do `BACKLOG.md` mostra `Última verificação de alteração no documento: DD/MM/AAAA`?
- [ ] Toda Feature/US/CA/RNF tem campo **`Origem (requisitos)`** apontando para `RF-NN`/`RNF-NN`/`G-NN` do documento? (Sem origem documentada = scope creep silencioso.)
- [ ] **Todos os artefatos têm descrição em linguagem de negócio** — Epic, Feature, US, CA, RNF? Lida por stakeholder sem glossário técnico?
- [ ] Algum título de Epic/Feature/US começa com **verbo no infinitivo**? Se sim → reescrever.
- [ ] Algum título OU descrição de Epic/Feature/US/**CA**/**RNF** tem **termo técnico** (`endpoint`, `hook`, `API`, `schema`, `migration`, `config`, HTTP status code, nome de tabela)? Se sim → mover para Task.
- [ ] Alguma "Feature" não é **entregável ao cliente final**? Se sim → mover para Task transversal `TX-NN`.
- [ ] Alguma **Feature** tem BDD em vez de descrição? Se sim → mover BDD para User Story; manter descrição em pt-BR na Feature.
- [ ] Alguma **User Story** está sem BDD no campo Descrição? Se sim → escrever (≥2 cenários: feliz + erro/borda).
- [ ] Algum CA é **subjetivo** ("deve ser amigável", "deve ser responsivo")? Se sim → reescrever testável.
- [ ] **CAs estão dentro de agrupador `CA - <Tema>`** (mesmo Feature com 1 só CA)?
- [ ] CAs com sub-regras encerram com **`[...]`** e têm `Regras a serem aplicadas:` no corpo? CAs sem `[...]` são autossuficientes no título?
- [ ] **Epic está aninhado** quando o domínio tem sub-classificações (módulo → grupo → operação)?
- [ ] **Backlog tem múltiplos Epics-raiz irmãos** (frentes independentes do projeto) em vez de um único "Epic-projeto" como avô de tudo? (Regra 9)
- [ ] Algum nó **sem prioridade declarada**? Se sim → atribuir 🔴/🟠/🟡/🟢.
- [ ] Cada US tem **CAs explicitamente associados** (rastreabilidade)?
- [ ] IDs seguem padrão (`EP-NN`/`F-NN`/`CANN`/`USNN.M`/`TNN.M.K`/`TX-NN` — Epic aninhado: `EP-NN.M`)?

Falhou em qualquer um → ainda não está pronto para `code-implementer`.

---

## 8. Conexão com agents

- `documentation-engineer` agent — **gera** este `BACKLOG.md` (rotina obrigatória ao produzir DESIGN.md)
- `design-orchestrator` agent — **referencia** este BACKLOG.md como entregável final do design bundle
- `code-implementer` agent — **consome** este BACKLOG.md como input mandatório (pick-and-execute por Task ID)
- `testing-engineer` agent — **derivar** testes dos BDDs e CAs aqui declarados

---

## 9. Pontos abertos / pendências de evolução desta convenção

- Quando o time tiver tagging maduro, considerar `apps.taxonomy` como Epic separado e adaptar template
- Avaliar se Story Points em Fibonacci continua adequado quando o time crescer (>5 devs)
- Considerar adicionar campo `Definition of Ready` explícito em cada US (hoje implícito no checklist Falbo + naming)
- Decidir se CA enumeration é **por Feature** (reset CA01 a cada Feature) ou **contínuo no projeto** (CA01..CA999). Hoje varia entre SIRA (por Feature) e o Interpop Busca (contínuo). Padronizar.

### Pendências resolvidas (jun/2026)

- ✅ **Convenção `[...]` para CAs com sub-regras** — formalizada na Regra 7 (acima) e em [04-bdd-criterios-aceitacao.md §2.5](04-bdd-criterios-aceitacao.md).
- ✅ **CAs sempre agrupados sob `CA - <Tema>`** — Regra 7.
- ✅ **TODOS os artefatos têm descrição em linguagem de negócio** — Regra 8.
- ✅ **Múltiplos Epics-raiz, sem Epic-projeto único** — Regra 9 (formalizada após observação no projeto Controle Dopagem com 3 Epics-raiz: APLICAÇÃO WEB + APLICAÇÃO MOBILE + ATIVIDADES DE APOIO).
- ✅ **Documento de requisitos como fonte da verdade** — Regra 0.
- ✅ **Epic aninhado** — Regra 6 + diagrama no template ([examples/template-backlog-openproject.md](../examples/template-backlog-openproject.md)).
- ✅ **BDD vive no campo Descrição da US, não como card filho** — Regra 6.
