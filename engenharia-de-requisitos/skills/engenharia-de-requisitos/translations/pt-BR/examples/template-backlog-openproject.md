# Template — Backlog no estilo OpenProject (exemplo trabalhado completo)

> Template **preenchido com exemplo real**, não esqueleto vazio. Use-o como ponto de partida concreto para qualquer backlog do projeto. Reflete a hierarquia do OpenProject conforme o curso ERS do IFPB (AULA 07–09) e a convenção Interpop. Substitua o exemplo pelo seu domínio mantendo todas as convenções.

---

## 0. Pré-requisito — o backlog se BASEIA no documento de requisitos

**Regra zero (não negociável)**: o backlog **é uma materialização do documento de requisitos**. Tudo que vai ser construído nasce do documento de requisitos; o backlog apenas organiza, fatia e prioriza esse conteúdo.

Por isso:

- 🔁 **Antes de mexer no backlog, SEMPRE verifique se houve alteração no documento de requisitos.** Durante o projeto, o usuário/cliente pode pedir para alterar, adicionar ou remover requisitos — e essas mudanças têm que se propagar para o backlog (não no outro sentido).
- 📎 **O topo do backlog deve apontar para o documento de requisitos** (link ou caminho relativo): `Documento de requisitos: ../docs/specs/<feature>/REQUISITOS.md (revisão de DD/MM/AAAA)`.
- ⚠️ **Mudanças no backlog sem origem no documento de requisitos são suspeitas**: ou são *scope creep* (escopo crescendo sem aprovação) ou são refinamento puramente técnico (deve virar Task, não Feature). Em ambos os casos, **registrar a decisão no documento de requisitos antes**.
- 🔗 **A rastreabilidade vai dos dois lados**: do documento de requisitos para o backlog (RF/RNF → Feature/CA) E do backlog para o documento (cada Feature/US/CA referencia qual RF/RNF da especificação que ela atende).

> Quem segue essa disciplina nunca tem aquele momento "espera, mas isso a gente combinou ou alguém inventou?". Quem não segue paga em retrabalho.

---

## 1. Regras duras (não negociáveis)

Detalhamento em [05-convencoes-interpop.md](../references/05-convencoes-interpop.md) e [04-bdd-criterios-aceitacao.md](../references/04-bdd-criterios-aceitacao.md).

1. **O documento de requisitos é a fonte da verdade.** Sempre cheque alterações nele antes de mexer no backlog (ver §0 acima).
2. **Pt-BR sem infinitivo** nos títulos de Epic/Feature/US: `"Listagem de reservas"`, não `"Listar reservas"`.
3. **Sem termos técnicos** em Epic/Feature/US/CA/RNF: endpoints REST, libs, frameworks, nomes de tabelas, comandos shell — tudo isso vai para **Tasks**.
4. **TODOS os artefatos têm descrição em linguagem de negócio**: Epic, Feature, US, CA, RNF. Lida por qualquer stakeholder (PO, cliente, dev júnior recém-chegado). Sem URLs, sem nomes de método, sem stack.
5. **Feature tem descrição (parágrafo) + CAs**. NUNCA tem BDD.
6. **User Story tem BDD em pt-BR** (`Dado/Quando/Então`) **dentro do próprio campo "Descrição"** (não como itens filhos separados no OpenProject) + CAs herdados via rastreabilidade. Nunca tem CAs próprios.
7. **CA é declarativo, atômico e testável**. Se a regra exige sub-regras, encerre o título com **`[...]`** e detalhe no corpo (ver §2 abaixo).
8. **CAs ficam sempre agrupados** sob um agrupador `CA - <Tema>`, mesmo quando a Feature tem só 1 CA. O agrupamento mantém consistência visual e facilita inserção futura.
9. **Epic aninhado** é usado quando o domínio tem sub-classificações (módulo → grupo → operação). É a forma fiel de organizar sistemas grandes no OpenProject.

---

## 2. Convenção `[...]` para CAs com detalhamento (regra dura)

Quando um CA precisa de sub-regras para ser totalmente testável, **encerre o título com `[...]`**. No corpo do item (campo "descrição" no OpenProject), abra com `Regras a serem aplicadas:` seguido de bullets.

**Por que existe**: quem lê o backlog em modo **lista** (visão padrão do OpenProject, com 50+ itens na tela) precisa decidir em 1 segundo se aquele CA é autossuficiente ou exige clique. O `[...]` sinaliza isso sem ambiguidade.

### Exemplo concreto (caso real do curso IFPB)

**Título no card** (visível em modo lista):

```
CA09 - O combobox FEDERAÇÃO deve aplicar as regras de preenchimento e validação conforme detalhamento [...]
```

**Descrição (corpo do item, lida ao abrir)**:

```
Regras a serem aplicadas:
- O combobox FEDERAÇÃO só deverá ser habilitado se tiver uma CONFEDERAÇÃO selecionada.
- Só deve exibir as Federações ATIVAS.
- Em ordem ALFABÉTICA.
- Deve exibir apenas as federações que o usuário logado está associado no seu cadastro de acesso.
- Deve permitir busca parcial ao digitar.
```

**Contraste — CA autossuficiente (sem `[...]`)**:

```
CA05 - O campo CPF não é obrigatório. Mas se preenchido, deverá ser no formato XXX.XXX.XXX-XX. Se o CPF for inválido, emitir mensagem de erro.
```

Não tem `[...]` porque o título já contém tudo que é necessário para testar.

---

## 3. Hierarquia visual completa (mapa do território)

```
📄 Documento de Requisitos (FONTE DA VERDADE — sempre cheque antes de mexer)
    │
    ▼
PROJETO (não é um nó no OpenProject — é o repositório/contexto do projeto)
    │
    ├─ 🟦 EPIC raiz #1                                  ← uma frente do projeto
    │   └─ 🟦 EPIC sub                                  ← sub-domínio (módulo, área)
    │       └─ 🟦 EPIC sub-sub                          ← sub-sub-domínio
    │           └─ 🟦 EPIC sub-sub-sub                  ← exemplo IFPB chega a 4 níveis
    │               └─ 🟩 FEATURE                       ← entregável ao cliente
    │                   ├─ 📋 CA grupo "CA - <Tema A>"  ← CAs sempre agrupados
    │                   │    ├─ ✅ CA01 - regra autossuficiente
    │                   │    ├─ ✅ CA02 - regra autossuficiente
    │                   │    └─ ✅ CA03 - regra com sub-regras [...]
    │                   ├─ 📋 CA grupo "CA - <Tema B>"
    │                   │    └─ ✅ CA04 - ...
    │                   └─ 🟦 USER STORY                ← fatia de 1 sprint
    │                       ├─ 🎬 BDD: Cenário 1 (caminho feliz)   ┐
    │                       ├─ 🎬 BDD: Cenário 2 (erro/borda)      │ ← conteúdo do
    │                       └─ 🎬 BDD: Cenário 3 (alternativo)     ┘   campo "Descrição"
    │                                                                  da US (NÃO são
    │                                                                  cards filhos
    │                                                                  no OpenProject)
    │                       └─ 🔧 TASK                              ← unidade técnica
    │                                                                  (termos técnicos OK)
    │
    ├─ 🟦 EPIC raiz #2                                  ← outra frente (irmão)
    │   └─ ... (mesma estrutura interna)
    │
    └─ 🟦 EPIC raiz #N                                  ← outras frentes (irmãs)
        └─ ...
```

> **🔴 Regra importante sobre múltiplos Epics-raiz**: um projeto **pode ter (e quase sempre tem) múltiplos Epics-raiz no nível mais alto**, irmãos entre si, **sem um "Epic-projeto" único como pai**. Cada Epic-raiz representa uma **frente independente** do projeto: uma plataforma (Aplicação Web, Aplicação Mobile), uma família operacional (Atividades de Apoio, Qualidade e Investigação), ou um módulo transversal.
>
> **Por que não criar um "Epic Produto" único como avô de tudo**: o "produto" como um todo é o **repositório / contexto do projeto** no OpenProject — não um item da hierarquia. Forçar tudo embaixo de um único "Epic Produto" cria um nó-pai vazio (sem descrição útil), atrapalha a navegação e gera ambiguidade ("este Epic raiz é o produto ou é uma frente?").
>
> **Exemplos reais**:
> - **Controle de Dopagem** (curso IFPB): `EPIC APLICAÇÃO WEB` · `EPIC APLICAÇÃO MOBILE` · `EPIC ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO` — três Epics-raiz, irmãos no nível mais alto.
> - **Interpop**: `EP-10 Busca Editorial` · `EP-09 Filtros Temáticos` · `EP-15 Newsletter` · `EP-20 Moderação Editorial` — vários Epics-raiz, irmãos. Não existe um Epic "Interpop" como pai.

> **Nota sobre o BDD no OpenProject**: os cenários BDD são **conteúdo do campo "Descrição" da User Story**, não itens filhos da hierarquia (não viram cards próprios). O esquema acima mostra a relação **conceitual** (BDD pertence à US). Quem trabalha com Cucumber/Behave externamente pode espelhar cada cenário num arquivo `.feature` correspondente.

---

## 4. EXEMPLO TRABALHADO A — Busca Editorial do Interpop (1 nível de Epic)

Exemplo enxuto para sistemas de escala média. Reflete o que está em produção no Interpop.

> **Documento de requisitos:** [`../docs/specs/busca-editorial/REQUISITOS.md`](../../../../Documentos/Projetos/interpop/docs/specs/busca-editorial/REQUISITOS.md) (revisão de 28/05/2026)
> **Última verificação de alteração no documento:** 03/06/2026 — sem mudanças desde a última sprint.

### 🟦 EP-10 — Busca Editorial

| Campo | Valor |
|---|---|
| **ID** | `EP-10` |
| **Prioridade** | 🟠 High |
| **Status** | In Progress |
| **Sprint alvo** | Sprint 3, Sprint 4 |
| **Pertence a** | Aplicação Web |
| **Features diretas** | `F-30`, `F-31`, `F-32` |
| **Origem (requisitos)** | RF-08, RF-09, RF-10, RNF-04 |

**Descrição:**

Conjunto de funcionalidades que permite ao leitor encontrar artigos do Interpop através de palavras-chave e filtros, com resultados ordenados por relevância. Inclui o compartilhamento da busca por link (a URL preserva o termo digitado e os filtros, permitindo que o leitor envie a busca pronta para outra pessoa). O Epic cobre desde a busca simples por texto (Feature `F-30`) até a busca por filtros temáticos (`F-31`) e o compartilhamento (`F-32`).

---

### 🟩 F-30 — Busca de artigos por texto

| Campo | Valor |
|---|---|
| **ID** | `F-30` |
| **Tipo** | Feature |
| **Epic pai** | `EP-10` |
| **Prioridade** | 🟠 High |
| **Status** | In Progress |
| **Sprint alvo** | Sprint 3 |
| **Entregável ao cliente?** | Sim |
| **Origem (requisitos)** | RF-08, RF-09, RNF-04 |

**Descrição:**

Tela "Buscar" que permite ao leitor digitar uma palavra ou frase e visualizar os artigos do Interpop que contenham aquele termo no título, no resumo ou no corpo. Os resultados aparecem ordenados por relevância (artigos com o termo no título aparecem primeiro), com o termo buscado destacado em amarelo dentro de cada resultado. A lista é paginada (carrega 20 artigos por vez, com botão "Carregar mais" no fim) e respeita o tempo de resposta percebido pelo leitor como instantâneo.

#### Critérios de Aceitação da F-30

##### 📋 CA - Acesso e visibilidade

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA01` | A busca é acessível a qualquer visitante do site, sem necessidade de login. | — |
| `CA02` | A busca exibe apenas artigos com status **publicado**. Artigos em rascunho ou em moderação nunca aparecem nos resultados. | — |
| `CA03` | Se o leitor digitar um termo e não houver artigos correspondentes, o sistema exibe a mensagem "Nenhum artigo encontrado para <termo>" e mantém o campo de busca preenchido. | — |

##### 📋 CA - Comportamento da consulta

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA04` | A busca aceita termos com **mínimo de 2 caracteres** e **máximo de 100 caracteres**. Termos fora dessa faixa não disparam consulta — o campo exibe a mensagem "Digite entre 2 e 100 caracteres". | — |
| `CA05` | A busca é **case-insensitive e diacritic-insensitive**: digitar "POP", "pop", "Pop" ou "póp" retorna os mesmos artigos. | — |
| `CA06` | A busca encontra ocorrências do termo no **título**, **resumo** e **corpo** do artigo, nesta ordem de prioridade de relevância **[...]** | ✅ |
| `CA07` | A consulta deve ser realizada levando-se em conta as **opções de filtro temático** aplicadas pelo leitor **[...]** | ✅ |

##### 📋 CA - Apresentação dos resultados

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA08` | Os resultados são apresentados em **cards verticais empilhados**, contendo título, resumo (primeiras 200 caracteres), data de publicação e autor. O termo buscado aparece destacado em amarelo. | — |
| `CA09` | A lista carrega **20 artigos por página**. No fim da página, há o botão **"Carregar mais"** que adiciona os próximos 20. | — |
| `CA10` | A URL da página de busca deve preservar o termo e os filtros aplicados, no formato `/buscar?q=<termo>&tema=<id>`, permitindo compartilhamento. | — |

##### 📋 CA - Tempo de resposta

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA11` | A primeira tela de resultados deve aparecer em até **800ms (p95)** para acervo de até 5.000 artigos publicados. | — |
| `CA12` | Quando a consulta passar de 800ms, o sistema exibe um **indicador visual de carregamento** (skeleton dos cards) para não dar impressão de tela travada. | — |

#### Detalhamento dos CAs com `[...]`

##### CA06 — Detalhamento

> **Aparece no corpo do item CA06 no OpenProject:**

```
Regras a serem aplicadas:
- A relevância é calculada de forma que artigos com o termo no TÍTULO recebam o maior peso.
- Em seguida, artigos com o termo no RESUMO recebem peso intermediário.
- Por fim, artigos com o termo apenas no CORPO recebem o menor peso.
- Quando dois artigos têm a mesma relevância, o mais recente aparece primeiro.
- Termos com acento e sem acento são tratados como equivalentes ("acao" encontra "ação").
- Termos com letra maiúscula e minúscula são tratados como equivalentes ("KPOP" encontra "kpop").
```

##### CA07 — Detalhamento

> **Aparece no corpo do item CA07 no OpenProject:**

```
Regras a serem aplicadas:
- O leitor pode selecionar UM OU MAIS filtros temáticos antes ou durante a busca.
- Os filtros são exibidos como chips clicáveis acima da lista de resultados.
- Ao selecionar um filtro, a lista é refeita SEM perder o termo de busca atual.
- Ao remover todos os filtros, a busca volta a considerar todos os temas.
- Se o leitor combinar termo + filtro e não houver resultados, a mensagem do CA03 deve mencionar tanto o termo quanto o filtro ativo.
```

#### User Stories da F-30

##### 🟦 US30.1 — Apresentação básica e ordenação dos resultados da busca

| Campo | Valor |
|---|---|
| **ID** | `US30.1` |
| **Feature pai** | `F-30` |
| **Prioridade** | 🟠 High |
| **Status** | In Progress |
| **Sprint alvo** | Sprint 3 |
| **CAs cobertos** | `CA01`, `CA02`, `CA05`, `CA06`, `CA08`, `CA09`, `CA11` |
| **Story Points** | 8 |

**Descrição da US (campo "Descrição" no OpenProject — BDD em pt-BR, todos os cenários ficam aqui):**

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

**Tasks da US30.1** (termos técnicos PERMITIDOS):

| ID | Descrição da Task | Prioridade |
|---|---|---|
| `T30.1.1` | Implementar endpoint `GET /api/v1/search/articles?q=&tema=&cursor=` com paginação keyset assinada HMAC. | 🟠 |
| `T30.1.2` | Indexar coluna `tsvector` (Postgres `to_tsvector('portuguese', title \|\| ' ' \|\| body)`) com weights A/B/C. | 🟠 |
| `T30.1.3` | Criar componente React `<SearchPage>` com hook `useSearch` e debounce de 250ms. | 🟠 |
| `T30.1.4` | Implementar destaque do termo nos cards com `<mark>` + CSS amarelo `#FFE9A0`. | 🟡 |
| `T30.1.5` | Adicionar `loading` skeleton dos cards após 300ms de espera. | 🟡 |
| `T30.1.6` | Escrever testes pytest cobrindo CA01, CA02, CA05, CA06 (matriz com 12 termos). | 🟠 |
| `T30.1.7` | Escrever testes Playwright cobrindo os 3 cenários BDD acima. | 🟠 |

##### 🟦 US30.2 — Filtragem temática dos resultados da busca

| Campo | Valor |
|---|---|
| **ID** | `US30.2` |
| **Feature pai** | `F-30` |
| **Prioridade** | 🟠 High |
| **Status** | Refining |
| **Sprint alvo** | Sprint 4 |
| **CAs cobertos** | `CA07`, `CA10` |
| **Story Points** | 5 |

**Descrição da US (campo "Descrição" no OpenProject — BDD em pt-BR):**

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

**Tasks da US30.2:**

| ID | Descrição da Task | Prioridade |
|---|---|---|
| `T30.2.1` | Adicionar parâmetro `tema` ao endpoint de busca; aplicar `WHERE article.tema_id = ANY(:temas)`. | 🟠 |
| `T30.2.2` | Implementar componente `<ChipFilter>` que sincroniza com query string via React Router. | 🟠 |
| `T30.2.3` | Cobrir os 2 cenários BDD acima com Playwright. | 🟠 |

---

## 📋 Tasks transversais (configurações técnicas que NÃO são Features)

| ID | Descrição | Prioridade | Para qual US |
|---|---|---|---|
| `TX-12` | Adicionar índice `idx_article_search_vector` na migration `0008_search_index.sql`. | 🟠 | `T30.1.2` |
| `TX-13` | Configurar variável `SEARCH_DEBOUNCE_MS=250` no `.env.example` e em `config/settings/base.py`. | 🟡 | `T30.1.3` |
| `TX-14` | Adicionar lib `react-highlight-words` ao `package.json` (~5KB gz). | 🟡 | `T30.1.4` |

---

## 📊 Resumo do backlog

| Nível | Quantidade |
|---|---|
| Epics (incluindo sub-Epics) | 1 |
| Features | 1 (`F-30`) |
| CAs | 12 (em 4 grupos: Acesso, Comportamento, Apresentação, Tempo de resposta — **2 com `[...]` detalhado**: `CA06`, `CA07`) |
| User Stories | 2 (`US30.1`, `US30.2`) |
| BDD cenários | 5 |
| Tasks (US-bound) | 10 |
| Tasks transversais | 3 |
| **Story Points totais** | **8 (Sprint 3) + 5 (Sprint 4) = 13** |

### Plano de Sprints

| Sprint | Foco | Story Points | Features entregues |
|---|---|---|---|
| Sprint 3 | Busca básica funcional ponta-a-ponta (US30.1) | 8 | — (Feature F-30 ainda não 100%) |
| Sprint 4 | Filtros temáticos (US30.2) + revisão de relevância | 5 | `F-30` 100% |

---

## 🔗 Rastreabilidade

| Requisito (RF/RNF) | Origem (doc de requisitos) | Feature | US | CA | BDD | Task | Teste |
|---|---|---|---|---|---|---|---|
| RF-08: O leitor pode buscar artigos por texto livre | `REQUISITOS.md` §4.2 | `F-30` | `US30.1` | `CA01`, `CA05`, `CA06` | "Leitor realiza busca simples e visualiza resultados ordenados" | `T30.1.1`, `T30.1.2` | `backend/tests/test_search.py::test_busca_basica`, `e2e/search.spec.ts::busca-simples` |
| RNF-04: A primeira tela de busca deve aparecer em ≤800ms (p95) | `REQUISITOS.md` §5.3 | `F-30` | `US30.1` | `CA11` | (mesmo cenário acima) | `T30.1.2` | `backend/tests/test_search_perf.py::test_p95_under_800ms` |
| RF-09: O leitor pode filtrar busca por tema editorial | `REQUISITOS.md` §4.3 | `F-30` | `US30.2` | `CA07`, `CA10` | "Leitor combina termo de busca com filtro de tema" | `T30.2.1`, `T30.2.2` | `e2e/search.spec.ts::filtro-tema` |

---

## ⚖️ Validação Falbo (7 dimensões por Feature)

| Feature | Completo | Correto | Consistente | Realista | Necessário | Priorizável | Verificável |
|---|---|---|---|---|---|---|---|
| `F-30` | ✅ entrada/regra/saída de cada CA | ✅ revisto com PO em 03/06 | ✅ CAs não se contradizem | ✅ Postgres + tsvector já dominado | ✅ leitor pediu em pesquisa de UX | ✅ 🟠 High | ✅ 12 testes cobrindo CAs |

---

## 5. EXEMPLO TRABALHADO B — Epic profundamente aninhado (Cadastro de Atletas, sistema de Controle de Dopagem)

Exemplo para sistemas grandes. Reflete o print do OpenProject do curso ERS do IFPB.

> **Documento de requisitos:** `docs/specs/controle-dopagem/REQUISITOS.md` (revisão de 12/11/2025)

### 🟦 EP-100 — Aplicação Web

| Campo | Valor |
|---|---|
| **ID** | `EP-100` |
| **Prioridade** | 🟠 High |
| **Pertence a** | Sistema de Controle de Dopagem (CNPq 487777/2013-1) |
| **Origem (requisitos)** | RF-001 a RF-133 (escopo total) |
| **Sub-Epics** | `EP-100.1` (Módulo Administrativo) e outros 9 módulos |

**Descrição:**

Toda a interface web do sistema nacional de controle antidopagem. Reúne dez módulos operacionais (Administrativo, Dopagem, STJD, OCD/Escoltas, Uso Geral, Financeiro, Estatístico, Técnico, Controle de Acesso) que atendem ABCD, COB, confederações esportivas, atletas e laboratórios credenciados.

---

### 🟦 EP-100.1 — Módulo Administrativo

| Campo | Valor |
|---|---|
| **ID** | `EP-100.1` |
| **Epic pai** | `EP-100` |
| **Origem (requisitos)** | RF-001 a RF-040 |
| **Sub-Epics** | `EP-100.1.1` (Gestão de Atletas), `EP-100.1.2` (Gestão de Médicos), … |

**Descrição:**

Módulo que reúne todas as operações de cadastro, consulta e relatório dos atores que participam de competições reguladas: atletas, médicos, confederações, federações, modalidades, competições, treinadores. É o módulo de **dados-mestres** do sistema — a partir dele os demais módulos (Dopagem, STJD, Financeiro) consomem dados.

---

### 🟦 EP-100.1.1 — Gestão de Atletas

| Campo | Valor |
|---|---|
| **ID** | `EP-100.1.1` |
| **Epic pai** | `EP-100.1` |
| **Origem (requisitos)** | RF-001 a RF-020 |
| **Sub-Epics** | `EP-100.1.1.1` (Cadastro), `EP-100.1.1.2` (Consulta), `EP-100.1.1.3` (Relatório) |

**Descrição:**

Conjunto de operações que dão ao operador da ABCD/confederação a visão completa de cada atleta: desde o cadastro inicial (dados pessoais, categorias, patrocinadores) até a consulta com filtros avançados e a geração de relatórios para fiscalização e prestação de contas.

---

### 🟦 EP-100.1.1.1 — Cadastro de Atletas

| Campo | Valor |
|---|---|
| **ID** | `EP-100.1.1.1` |
| **Epic pai** | `EP-100.1.1` |
| **Origem (requisitos)** | RF-001 a RF-010 |
| **Features diretas** | `F-200` Cadastro Básico, `F-201` Categorias Esportivas, `F-202` Patrocinadores, `F-203` Técnico, `F-204` Bolsa Atleta, `F-205` Equipe Médica, `F-206` Convocações, `F-207` Programas Especiais, `F-208` Clubes/Associações, `F-209` Resultados em Competições |

**Descrição:**

Conjunto de telas que permitem ao operador da confederação registrar e manter atualizado o cadastro completo de cada atleta nacional. O cadastro é segmentado em dez Features independentes, cada uma cobrindo um aspecto distinto da vida do atleta (dados pessoais, vínculos esportivos, suporte técnico, financeiro, médico e histórico competitivo). Cada Feature é entregue separadamente porque pode ser preenchida em momentos diferentes (não há ordem obrigatória além do cadastro básico vir antes dos demais).

---

### 🟩 F-200 — Cadastro Básico do Atleta

| Campo | Valor |
|---|---|
| **ID** | `F-200` |
| **Tipo** | Feature |
| **Epic pai** | `EP-100.1.1.1` |
| **Prioridade** | 🔴 Immediate |
| **Origem (requisitos)** | RF-001 |
| **Entregável ao cliente?** | Sim |

**Descrição:**

Tela de cadastro com os dados pessoais essenciais do atleta: nome completo, data de nascimento, CPF, gênero, nacionalidade, RG e endereço residencial. É o ponto de entrada do sistema para um novo atleta — sem este cadastro, nenhuma das outras Features de Gestão de Atletas pode ser usada. O operador da confederação preenche, valida e salva; o atleta passa a constar no sistema nacional.

#### Critérios de Aceitação da F-200

##### 📋 CA - Cadastro dados pessoais

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA01` | Apenas usuários autorizados (operador da confederação ou administrador ABCD) podem cadastrar atletas. | — |
| `CA02` | O sistema deve impedir o cadastro de dois atletas com o mesmo CPF. Caso já exista, exibir a mensagem "CPF já cadastrado para <nome do atleta>". | — |
| `CA03` | A data de nascimento deve resultar em uma idade entre 5 e 80 anos no momento do cadastro. Fora dessa faixa, o sistema exibe alerta de revisão. | — |
| `CA04` | O CPF deve ser validado quanto a formato e dígito verificador **[...]** | ✅ |

##### CA04 — Detalhamento (no corpo do item)

```
Regras a serem aplicadas:
- O campo CPF é obrigatório.
- Deve estar no formato XXX.XXX.XXX-XX (com pontos e traço).
- O dígito verificador deve ser válido conforme regra da Receita Federal.
- Se inválido, exibir mensagem "CPF inválido" próximo ao campo, em vermelho.
- Não permitir o salvamento enquanto o CPF estiver inválido.
```

> _Demais Features (F-201 a F-209) seguem o mesmo padrão. Em backlog real, cada Feature ocupa sua própria seção com descrição, CAs, US e Tasks._

---

## ✅ Smell test (passe antes de mergear backlog)

- [ ] **Você verificou o documento de requisitos antes de mexer no backlog?** (data da última conferência registrada no topo do BACKLOG.md)
- [ ] Toda Feature/US/CA tem **link de origem** (`Origem (requisitos)`) apontando para o item correspondente no documento de requisitos?
- [ ] Todo Epic/Feature/US/CA/RNF tem **descrição** em pt-BR sem termo técnico?
- [ ] Toda Feature é **entregável ao cliente** (sem ambiguidade)?
- [ ] Toda US tem **BDD** em pt-BR com cenários nomeados (≥2 cenários: feliz + erro/borda) no campo "Descrição" da US?
- [ ] Todo CA é **declarativo, atômico e testável**? CAs com sub-regras encerram em **`[...]`** e têm "Regras a serem aplicadas:" no corpo?
- [ ] Todo CA está **dentro de um grupo `CA - <Tema>`** (mesmo Feature com 1 só CA)?
- [ ] Epic está **aninhado** quando o domínio tem sub-classificações?
- [ ] Toda Task transversal está em **`TX-NN`**, fora da hierarquia Epic/Feature/US?
- [ ] **Prioridade** (🔴/🟠/🟡/🟢) em todos os nós?
- [ ] **IDs estáveis** (não renumerados em mudanças posteriores)?
- [ ] **Rastreabilidade** RF/RNF → Feature → US → CA → BDD → Task → Teste **completa** para cada Feature?
- [ ] **Validação Falbo** preenchida com justificativa de 1 linha por dimensão?
