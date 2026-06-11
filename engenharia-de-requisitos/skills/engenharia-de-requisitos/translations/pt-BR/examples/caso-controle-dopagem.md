# Exemplo Aplicado — Sistema de Controle de Dopagem (caso real CNPq 487777/2013-1)

> Caso real apresentado na AULA 03 do curso ERS do IFPB. Projeto financiado pelo CNPq, sistema integrado para entidades esportivas brasileiras (ABCD — Autoridade Brasileira de Controle de Dopagem, COB — Comitê Olímpico Brasileiro, confederações esportivas). Mostra elicitação → especificação → backlog → US com BDD em um sistema crítico real.

---

## 1. Contexto e problema

**Problema de negócio**: Ausência de controle centralizado de testes de dopagem no Brasil. Cada confederação esportiva tinha seu próprio processo manual ou planilha local. ABCD precisava agregar dados nacionais para reportar à WADA (World Anti-Doping Agency). STJD precisava acompanhar processos de infração. Resultado: dados fragmentados, dificuldade de acompanhamento, risco de penalidades internacionais.

**Estudo de viabilidade** — 3 perguntas Sommerville:

1. ✅ Contribui para objetivos? Sim (cumprir Código Mundial Antidopagem)
2. ✅ Cabe em cronograma/orçamento? Sim (CNPq aprovou; equipe IFPB)
3. ✅ Integra com sistemas em uso? Parcialmente (precisa importar planilhas existentes)

→ Projeto prossegue.

---

## 2. Elicitação (técnicas combinadas)

Conforme [02-elicitacao.md](../references/02-elicitacao.md), nenhuma técnica isolada bastaria. O projeto usou:

| Técnica | Fonte | O que descobriu |
|---|---|---|
| **Entrevistas** | ABCD, COB, confederações | Processos atuais, dificuldades, expectativas |
| **Análise de documentos** | Código Mundial Antidopagem, regulamentos STJD, planilhas existentes | Regras formais; estrutura de dados existente |
| **Brainstorming** | Equipe + ABCD | Funcionalidades novas (módulo estatístico para BI) |
| **Observação** | Visitas à ABCD | Como amostras são coletadas, transportadas, custodiadas |

**Stakeholders identificados** (Wiegers 5 critérios):

- ABCD (autoridade central — usuário operacional)
- COB (esfera olímpica — usuário consultivo)
- Confederações esportivas (cadastram atletas)
- Atletas (sujeitos dos testes; dados sensíveis — privacidade crítica)
- OCDs e Escoltas (oficiais de controle, terceirizados)
- STJD (julgamento de infrações)
- Laboratórios credenciados (recebem amostras)
- Ministério do Esporte (regulador)

---

## 3. Requisitos de alto nível identificados

### 3.1 Requisitos Funcionais por módulo

A elicitação resultou em **10 módulos**:

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

Total: 133 funcionalidades identificadas no escopo inicial.

### 3.2 Regras de Negócio (notação Gxx) e Exceções (notação Exx)

O projeto adotou **duas notações distintas** para regras (AULA 03 IFPB):

- **Gxx** — Regras gerais de negócio (válidas em toda a base do sistema).
- **Exx** — Exceções específicas (regras que se aplicam apenas em condições particulares).

#### Regras gerais (Gxx) — amostra do documento de regras (v0.23, 175 regras totais)

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

#### Exceções específicas (Exx)

```
E1 — O nome do pai tem que ser diferente do nome da mãe.
E2 — O sistema deve extrair as iniciais do atleta a partir do nome,
     mas pode ser editado.
E3 — Se o atleta for portador de deficiência, é obrigatório o
     preenchimento do campo Classe de Deficiência. Caso contrário,
     o campo Classe não deve ser preenchido.
...
```

Note que **estas regras vêm de fontes diferentes**:
- **Gxx** vêm do DOMÍNIO (Código Mundial Antidopagem WADA, regulamentos STJD, política de identidade). Fáceis de passar despercebidas — só apareceram via análise de documentos.
- **Exx** vêm da OBSERVAÇÃO (etnografia + entrevistas com a equipe que cadastra atletas) — situações reais de borda que só quem opera o sistema tem na cabeça.

> **Padrão recomendado**: separar Gxx (regras invariantes do domínio) de Exx (exceções condicionais de borda) facilita rastrear origem e responsabilidade pela manutenção. Quando uma exceção vira regra geral (todos os casos passam a se comportar igual), promova de Exx para Gxx no documento.

### 3.3 Requisitos Não Funcionais

| Tipo | Requisito | Métrica |
|---|---|---|
| **Produto - Disponibilidade** | Sistema disponível em horário comercial (seg-sex, 8h-18h) | ≥99,5% |
| **Produto - Segurança** | Dados de atletas confidenciais | RBAC + criptografia em repouso |
| **Produto - Confiabilidade** | Backup automatizado | Diário, retenção 1 ano |
| **Produto - Plataforma** | Web (acessível a confederações remotas) | Multi-navegador |
| **Organizacional - Tecnologia** | Stack definida pela equipe IFPB | JAVA/JSF, Hibernate, Primefaces, PostgreSQL, IReport/Jasper |
| **Organizacional - Processo** | Versionamento + ticketing | SVN + Redmine + Astah para UML |
| **Externo - Conformidade** | Atender Código Mundial Antidopagem (WADA) | Auditoria anual |
| **Externo - Privacidade** | LGPD (dados sensíveis de saúde) | Consentimento + retenção + auditoria de acesso |

---

## 4. Especificação — hierarquia do backlog

Aplicando o modelo IFPB de [03-especificacao.md](../references/03-especificacao.md).

> **Lição prática da AULA 03 IFPB — legenda de escopo no backlog**: o slide original do projeto Controle Dopagem usa 4 cores para classificar o status de escopo de cada Funcionalidade/Módulo:
>
> - 🟦 **Escopo inicial do projeto CNPq 487777/2013-1** (o que está contratado)
> - 🟩 **Acrescentado ao escopo atendendo demanda da ABCD** (escopo expandido com aprovação documentada)
> - 🟧 **Não contemplado no projeto — proposta para NOVO projeto** (registrado para próximo edital)
> - ⬜ **Não contemplado no projeto — a ser prospectado com Confederações** (ainda em análise de viabilidade)
>
> **Por que isso importa**: marcar visualmente quem-pediu-o-quê e o-que-cabe-no-orçamento evita scope creep silencioso. Em qualquer backlog real, item entrando no escopo precisa ter origem documentada e flag de status. **Sem origem ≡ scope creep**. Ver `Origem (requisitos)` no [template-backlog-openproject.md §4](template-backlog-openproject.md).

> **⚠️ Importante — múltiplos Epics-raiz, sem "Epic-projeto" único como pai**: o projeto Controle Dopagem tem **três Epics no nível mais alto, irmãos entre si** (`APLICAÇÃO WEB`, `APLICAÇÃO MOBILE`, `ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO`). Não existe um nó "Epic Controle de Dopagem" como avô comum — o "produto" como um todo é o **contexto/repositório** do projeto no OpenProject, não um item da hierarquia. Detalhamento da convenção em [`../examples/template-backlog-openproject.md §3`](template-backlog-openproject.md).

```
PROJETO Controle Dopagem (= contexto/repositório no OpenProject; NÃO é um EPIC)
│
├─ EPIC APLICAÇÃO WEB                                  ← Epic-raiz #1 (frente: plataforma web)
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
│   └─ ... (outros módulos)
│
├─ EPIC APLICAÇÃO MOBILE                               ← Epic-raiz #2 (frente: plataforma mobile)
│   └─ ... (própria sub-hierarquia)
│
└─ EPIC ATIVIDADES DE APOIO, QUALIDADE E INVESTIGAÇÃO  ← Epic-raiz #3 (frente: atividades transversais)
    └─ ... (própria sub-hierarquia)
```

> **Nota sobre as Features listadas acima:** no backlog real, **cada item `FEATURE Xxxxx` tem sua própria descrição em pt-BR** (entregável ao cliente, sem termos técnicos), seguindo a regra da skill (Feature tem descrição; User Story tem BDD). Este caso de estudo elabora em profundidade apenas a Feature `Consulta GERAL de Atletas` (§5–§8) para ilustrar o fluxo completo CA → US → BDD → Estimativa; as demais ficam representadas apenas pelo título no diagrama. **Em projeto real, ausência de descrição de Feature é dívida de especificação** — aparece como atrito no Sprint Planning (PO precisa explicar de novo o entregável) e na revisão de US (devs questionam o "porquê" da história).

---

## 5. Feature: Consulta GERAL de Atletas

**Descrição da Feature (entregável ao cliente, em pt-BR):**

Permite que operadores autorizados (ABCD, COB e confederações) consultem a base nacional de atletas em uma única tela paginada, aplicando filtros opcionais por CPF, nome, técnico, patrocinador, médico, modalidade, categoria, tipo de bolsa, programa especial, competição e datas de competição. A consulta é restrita automaticamente às federações associadas ao usuário logado no servidor — não há "consulta global" cega, mesmo para administradores. O entregável ao cliente é o ponto de entrada operacional para todos os fluxos de dopagem subsequentes: convocação para teste (regra G09), análise de histórico de testes do atleta, e cruzamento com processos do STJD. Em volume real (ABCD agrega ~50 mil atletas nacionais), a feature precisa responder com paginação preguiçosa e ordenação no servidor.

> Esta descrição é o que vai no card de Feature do OpenProject/Redmine. Linguagem de negócio, sem termos técnicos (JSF/Hibernate/Primefaces ficam nas Tasks). Os critérios de aceitação abaixo formalizam as regras testáveis; o BDD aparece só nas User Stories (§7).

### 5.1 Critérios de Aceitação (estilo declarativo)

Aplicando [04-bdd-criterios-aceitacao.md](../references/04-bdd-criterios-aceitacao.md). 15 CAs declarativos, **agrupados por tema** (convenção `CA - <Tema>` da Regra 7 de [05-convencoes-interpop.md](../references/05-convencoes-interpop.md)). CAs com **`[...]`** no fim do título precisam ser lidos junto com o detalhamento na §5.2.

#### 📋 CA - Acesso e visibilidade

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA01` | Apenas usuários autorizados podem ter acesso à funcionalidade de Consulta GERAL de ATLETAS. | — |
| `CA02` | A consulta deve exibir apenas os atletas das FEDERAÇÕES esportivas que o usuário tem acesso no seu cadastro. | — |
| `CA03` | A tela de consulta deve conter os campos e layout conforme definido no protótipo. | — |

#### 📋 CA - Filtros e busca

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA04` | A consulta deverá ser realizada levando-se em conta as opções de filtro informadas pelo usuário. | — |
| `CA05` | O campo CPF não é obrigatório. Mas se preenchido, deverá ser no formato XXX.XXX.XXX-XX. Se o CPF for inválido, emitir mensagem de erro. | — |
| `CA06` | Os campos de DATA no filtro de Competições NÃO são obrigatórios. A consulta deve ser realizada de acordo com o preenchimento informado pelo usuário. | — |
| `CA07` | Os campos NOME, TÉCNICO, PATROCINADOR e MÉDICO NÃO são obrigatórios. Mas se preenchido, deve ter no mínimo 5 letras. A aplicação deve realizar uma busca PARCIAL pelo conteúdo digitado. | — |

#### 📋 CA - Comboboxes (regras de habilitação, listagem e busca)

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA08` | O combobox CONFEDERAÇÃO deve aplicar as regras de listagem e busca **[...]** | ✅ |
| `CA09` | O combobox FEDERAÇÃO deve aplicar as regras de preenchimento e validação **[...]** | ✅ |
| `CA10` | Os comboboxes MODALIDADES e CATEGORIAS devem aplicar as regras de listagem por confederação **[...]** | ✅ |
| `CA11` | Os comboboxes TIPO DE BOLSA, PROGRAMA ESPECIAL e TIPO COMPETIÇÃO devem aplicar as regras de listagem e busca **[...]** | ✅ |
| `CA12` | O combobox COMPETIÇÃO deve exibir apenas competições multiesportes e competições específicas da confederação selecionada pelo usuário. | — |

#### 📋 CA - Apresentação dos resultados

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA13` | A listagem geral de atletas deverá ser exibida em ordem alfabética, por default. | — |
| `CA14a` | A listagem geral de atletas poderá ser reordenada ao clicar no título das colunas. | — |
| `CA14b` | A listagem geral de atletas deverá ser paginada com as opções de visualizar 10, 50, 100 ou todos. | — |
| `CA15` | A listagem geral de atletas deverá exibir todos os atletas por default. | — |

### 5.2 Detalhamento dos CAs com `[...]`

Cada bloco abaixo é o que aparece no **corpo do item** no OpenProject (campo Descrição do CA), seguindo a convenção `Regras a serem aplicadas:` + bullets.

#### CA08 — Detalhamento

```
Regras a serem aplicadas:
- Só deve exibir as CONFEDERAÇÕES ATIVAS.
- Em ordem ALFABÉTICA.
- Deve exibir apenas as confederações que o usuário logado está associado no seu cadastro de acesso.
- Deve permitir busca parcial ao digitar.
```

#### CA09 — Detalhamento

```
Regras a serem aplicadas:
- O combobox FEDERAÇÃO só deverá ser habilitado se tiver uma CONFEDERAÇÃO selecionada.
- Só deve exibir as Federações ATIVAS.
- Em ordem ALFABÉTICA.
- Deve exibir apenas as federações que o usuário logado está associado no seu cadastro de acesso.
- Deve permitir busca parcial ao digitar.
```

#### CA10 — Detalhamento

```
Regras a serem aplicadas:
- Só deve exibir dados das confederações que o usuário está associado no seu cadastro de acesso.
- Exibir apenas os registros ATIVOS.
- Em ordem ALFABÉTICA.
```

#### CA11 — Detalhamento

```
Regras a serem aplicadas:
- Só deve exibir os registros ATIVOS.
- Em ordem ALFABÉTICA.
- Deve permitir a busca parcial ao digitar.
```

---

## 6. Fatiamento em User Stories (3 sprints)

Aplicando o fluxo da AULA 09 (ver [03-especificacao.md §6.5](../references/03-especificacao.md)):

### 6.1 Agrupar CAs por sprint (priorização incremental)

```
Sprint 1 — Consulta BÁSICA (entregável o mais simples possível)
  CA01 — Acesso autorizado
  CA02 — Filtro implícito por federação do usuário
  CA03 — Layout do protótipo
  CA13 — Ordem alfabética default
  CA15 — Exibir todos por default

Sprint 2 — Ordenação + paginação
  CA14a — Reordenação por clique no header
  CA14b — Paginação 10/50/100/todos

Sprint 3 — Busca avançada
  CA04 — Filtros aplicados
  CA05 — Validação CPF
  CA06 — Datas opcionais
  CA07 — Busca parcial por nome/etc.
  CA08-CA12 — Comboboxes ativos + alfabéticos + busca parcial
```

### 6.2 User Stories resultantes

```
US Listagem BÁSICA de Atletas                              (Sprint 1)
US Listagem de Atletas com ordenação e paginação (sem busca)  (Sprint 2)
US Listagem Avançada de Atletas com opções de busca (filtro)  (Sprint 3)
```

---

## 7. BDD da US "Listagem BÁSICA de Atletas"

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

**Relações no OpenProject** (rastreabilidade):

```
US Listagem BÁSICA de Atletas
├─ relacionado-a: CA01 (acesso autorizado)
├─ relacionado-a: CA02 (filtro federação)
├─ relacionado-a: CA03 (layout)
├─ relacionado-a: CA13 (ordem alfabética)
└─ relacionado-a: CA15 (exibir todos default)
```

---

## 8. Estimativa (Planning Poker)

História-guia escolhida: **"Adicionar campo apelido ao cadastro de atleta"** (entregue na sprint passada — 1 ponto).

Estimativas:

| User Story | Pontos | Justificativa |
|---|---|---|
| US Listagem BÁSICA | **5** | Query + RBAC + view padronizada + integração com prototipo |
| US Listagem com ordenação/paginação | **3** | Pequenas extensões da básica + componentes Primefaces |
| US Listagem Avançada com filtros | **13** | Múltiplos comboboxes com cascateamento, busca parcial em vários campos, validação CPF, regras de exibição condicional |

Total da feature CONSULTA GERAL: **21 pontos**.

Com velocity média de 25pts/sprint, a feature ocupa essencialmente 1 sprint inteira (ou se espalha em 2 com outras US menores).

---

## 9. Validação

### 9.1 Conferências Sommerville aplicadas

- ✅ **Validade**: confirmado com ABCD em revisão (julho/2023)
- ✅ **Consistência**: CA08 e CA09 são consistentes — CA09 só ativa se CA08 selecionado
- ✅ **Completude**: revisão revelou ausência de CA para exportação (CSV) — adicionado posteriormente
- ✅ **Realismo**: stack Java/JSF é familiar à equipe; cabe no cronograma
- ✅ **Verificabilidade**: cada CA tem cenário Gherkin associado

### 9.2 Dimensões Falbo por CA

Cada CA validado contra os 7 critérios. **CA05 inicial era**: "O campo CPF deve ser validado". Falhou em **completude** (não dizia formato) e **verificabilidade** (como testar?). Reescrito para versão atual com formato XXX.XXX.XXX-XX explícito.

### 9.3 Protótipos validados com ABCD

Wireframes Pencil + sketches em papel → foto enviada por e-mail → reunião de validação → ajustes → wireframe v2 → aprovado.

---

## 10. Aspectos éticos (camada SBC)

Aplicando [09-etica-sbc.md](../references/09-etica-sbc.md):

| Princípio | Aplicação no caso |
|---|---|
| **§1.1 Bem-estar humano** | Sistema apoia integridade esportiva (bem público) |
| **§1.2 Evitar danos** | Acusação falsa de doping destrói carreira de atleta — RNF de auditoria rigorosa |
| **§1.4 Não discriminar** | Sistema não pode privilegiar/penalizar atletas por federação, gênero, modalidade |
| **§1.6 Privacidade** | Dados de saúde (substâncias) extremamente sensíveis — criptografia em repouso + acesso auditado + retenção definida |
| **§1.7 Confidencialidade** | Resultados de teste positivo NÃO podem vazar antes do processo formal STJD |
| **§2.5 Avaliação ML** | (Caso este sistema agregue ML para detecção de padrões suspeitos — auditoria contínua de viés) |
| **§3.7 Infraestrutura societal** | Sistema integra-se à infraestrutura nacional do esporte; padrões de operação acima do média de sistemas comerciais |

Decisão ética concreta: **resultado positivo bloqueia automaticamente UI da confederação** (G10) — não para esconder, mas para evitar vazamento informal antes do devido processo.

---

## 11. Lições do caso

1. **Análise de documentos foi mais valiosa que entrevistas** — Código WADA tem 200 páginas de regras técnicas que ninguém na ABCD lembra de cabeça
2. **Stakeholders diversos exigem priorização explícita** — confederações queriam features de cadastro; ABCD queria de operação; conflito foi resolvido com MoSCoW (Must-have do projeto = operação ABCD)
3. **Fatiamento em US salvou o projeto** — versão básica entregue em 3 meses gerou tração; restante evoluiu com feedback
4. **BDD em pt-BR engajou stakeholders não-técnicos** — médicos da ABCD revisaram cenários e apontaram regra G14 que faltava
5. **Rastreabilidade no Redmine + SVN** foi adequada à escala (não precisou de DOORS)
6. **RNFs de privacidade dominaram custo de implementação** — auditoria + criptografia + retenção tomaram tanto esforço quanto a feature em si
