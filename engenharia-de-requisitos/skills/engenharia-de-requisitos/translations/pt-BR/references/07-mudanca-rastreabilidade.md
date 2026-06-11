# 07 — Gestão de Mudança + Rastreabilidade

> Como manter coerência conforme requisitos mudam (e eles SEMPRE mudam). Combina Sommerville 4.6 (mudança de requisitos) + boas práticas de rastreabilidade. Sem processo formal de mudança, especificação e implementação ficam descompassados em meses.

---

## 1. Por que mudança é inevitável

Sommerville (4.6):

> Os requisitos dos sistemas de software grandes **sempre estão mudando**. Uma razão para as mudanças frequentes é que esses sistemas são desenvolvidos para tratar de problemas **"traiçoeiros" (wicked problems)** — problemas que não podem ser definidos completamente.

**3 fontes principais de mudança** (Sommerville):

1. **Ambiente muda**: novo hardware, integração com outros sistemas, novas leis (LGPD, BACEN), prioridades de negócio mudam
2. **Quem paga ≠ quem usa**: clientes impõem requisitos com base em orçamento/política; usuários querem outra coisa. Após entrega, novos requisitos emergem para atender usuário
3. **Stakeholders diversos com prioridades conflitantes**: equilibrio precisa ser revisto à medida que se descobre que algum grupo foi sub-representado

Modelo da evolução (Fig 4.18 Sommerville):

```
Compreensão inicial      →     Compreensão melhor
do problema                    do problema
     │                              │
     ▼                              ▼
Requisitos iniciais       →    Requisitos atualizados
                                                 → tempo →
```

---

## 2. Requisitos duradouros vs voláteis (Sommerville)

| Tipo | Característica | Como diferenciar |
|---|---|---|
| **Duradouros** | Associados a atividades centrais da organização. Mudam lentamente | "Cobrança de imposto" (governo), "Cadastrar paciente" (hospital), "Publicar artigo" (editora) |
| **Voláteis** | Associados a atividades de **apoio** que refletem **como** a organização trabalha. Mudam frequentemente | "Layout do recibo", "Workflow de aprovação interna", "Relatórios gerenciais customizados" |

**Decisão arquitetural**: codifique **duradouros** no core do sistema; isole **voláteis** atrás de pontos de extensão (plugins, templates, config). Senão, cada mudança volátil quebra o core.

---

## 3. Processo de gerenciamento de mudança (Sommerville Fig 4.19)

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Problema /    │     │  Análise do    │     │  Análise da    │     │  Implementação │
│  proposta      │ ──→ │  problema +    │ ──→ │  mudança +     │ ──→ │  da mudança    │
│  identificada  │     │  especificação │     │  estimativa de │     │                │
│                │     │  da mudança    │     │  custo         │     │                │
└────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘
```

### 3.1 Estágio 1 — Análise do problema + especificação da mudança

Identifica problema OU proposta de mudança específica. Analista avalia se é válido. Transmite de volta ao solicitante.

**Saída**: ou proposta refinada, ou desistência.

### 3.2 Estágio 2 — Análise da mudança + estimativa de custo

Avalia **impacto** com base em:
- Rastreabilidade (quais requisitos dependem deste?)
- Conhecimento geral do sistema
- Quais artefatos serão tocados (docs, projeto, código, testes)

**Saída**: decisão **prosseguir ou não**. Critério: benefício > custo + risco.

### 3.3 Estágio 3 — Implementação

Modificar:
- Documento de requisitos
- Projeto (design)
- Código
- Testes
- Comunicação aos stakeholders afetados

**Regra de organização**: documento de requisitos deve ser **modular** — cada seção pode ser modificada sem reescrever tudo. Minimize referências externas.

### 3.4 Tentação perigosa (citada por Sommerville)

> Se um novo requisito tiver de ser implementado com **urgência**, sempre existe a tentação de mudar o sistema e depois modificar **retrospectivamente** o documento de requisitos. Quase inevitavelmente isso coloca em **descompasso** a especificação dos requisitos e a implementação.

**Regra**: se você implementar antes de atualizar o doc (mudança emergencial), atualize o doc **dentro de 24h**. Senão, esqueçam.

---

## 4. Planejamento do gerenciamento de requisitos (Sommerville 4.6.1)

4 decisões para tomar logo no início do projeto:

### 4.1 Identificação dos requisitos

Cada requisito deve ter **ID único**. Esquemas comuns:

```
RF-001       → Requisito Funcional 001
RNF-PERF-01  → RNF de Performance 01
CA-LOGIN-05  → Critério de Aceitação 05 da feature Login
US-1247      → User Story 1247 (do tracking system)
```

ID é estável (não muda quando requisito muda). Versão do requisito muda.

### 4.2 Processo de gerenciamento de mudança

Quem aprova mudança? Em que prazo? Qual SLA? Cobertura por CCB (Change Control Board)? Definir antes da primeira mudança.

### 4.3 Políticas de rastreabilidade

Quais relações devem ser registradas? Entre:
- Requisito ↔ requisito (depende-de)
- Requisito ↔ design
- Requisito ↔ código
- Requisito ↔ teste
- Requisito ↔ stakeholder

E **como** registrar (planilha, ferramenta, links no Jira/OpenProject).

### 4.4 Apoio de ferramentas

- Armazenamento dos requisitos (repositório acessível a todos)
- Gerenciamento de mudança (ferramenta acompanha sugestões e respostas)
- Gerenciamento de rastreabilidade (links entre artefatos)

Sistemas grandes: **DOORS, Jama, OpenProject, Polarion**. Sistemas pequenos: planilhas + wiki + links no Git/Issue tracker.

---

## 5. Rastreabilidade — o conceito

Sommerville:

> Você precisa acompanhar as relações entre os requisitos, suas fontes e o projeto do sistema para que possa analisar as **razões das alterações propostas** e o **impacto** que essas mudanças tendem a ter em outras partes do sistema.

### 5.1 Tipos de rastreabilidade

| Direção | Pergunta que responde |
|---|---|
| **Pré-rastreabilidade** | De onde veio este requisito? (Quem? Por quê?) |
| **Pós-rastreabilidade** | Onde este requisito está implementado? (Quais módulos, classes, testes?) |
| **Horizontal** | Que outros requisitos dependem deste? |

### 5.2 Matriz de rastreabilidade clássica (RTM — Requirements Traceability Matrix)

|  | RF-01 | RF-02 | RF-03 | RNF-01 |
|---|---|---|---|---|
| **Stakeholder origem** | Sec.Vendas | Sec.Vendas | Diretor | LGPD |
| **Design doc** | DD §3.1 | DD §3.1 | DD §3.2 | DD §5 (privacidade) |
| **Código** | `OrderController` | `OrderItem` | `ReportService` | `audit/*` |
| **Teste** | `OrderSpec` | `OrderSpec`, `ItemSpec` | `ReportSpec` | `AuditSpec` |
| **Status** | DONE | DONE | IN PROGRESS | DONE |

Esta matriz vive em planilha ou ferramenta. **Sem ela, mudar 1 requisito vira "que módulos eu mexo?" sem resposta.**

### 5.3 Rastreabilidade no modelo ágil (Backlog + Git)

A hierarquia do backlog já é parte da rastreabilidade:

```
Epic
  └─ Feature
       ├─ CAs
       └─ User Story
            ├─ BDD (cenários)
            ├─ Tasks
            │    └─ Pull Requests (Git)
            │         └─ Commits
            │              └─ Arquivos modificados
            └─ Test results (CI)
```

**Boas práticas no Git**:

- Branch name: `feature/US-1247-listagem-basica-atletas`
- Commit message: `feat(atletas): adiciona listagem básica [US-1247]`
- PR description: link para a US no OpenProject/Jira
- Test name: `describe('US-1247: Listagem básica de Atletas', ...)`

Assim, dado um arquivo, você descobre o requisito que justifica sua existência. Dado um requisito, você descobre todo o código que o implementa.

### 5.4 Rastreabilidade reversa (caso real)

**Cenário**: dev abre `OrderController.java` 6 meses depois. Pergunta: "Posso remover este método? Quem o usa?"

**Sem rastreabilidade**: grep no código (pode pegar uso direto, mas não regra de negócio que o exige).
**Com rastreabilidade**: linha do método → commit → PR → US → CA → Feature → Stakeholder. Em 5min você sabe: "Não pode remover; está cumprindo CA-ORDER-12 que vem do regulamento da Anvisa".

---

## 6. CA + BDD + teste = rastreabilidade quase automática

A camada **BDD** (ver [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md)) faz parte da rastreabilidade end-to-end:

```
Feature .feature file       ──→  CAs implementados
  Cenário Gherkin           ──→  Step definitions (código de teste)
     Steps DADO/QUANDO/ENTÃO ──→  Chamadas ao código de produção
```

Cada cenário Gherkin é um **link executável** entre requisito e código. O teste passa = requisito implementado. O teste quebra = ou código está errado, ou requisito mudou e ninguém atualizou o cenário.

---

## 7. Ferramentas de gerenciamento de mudança (escolha por escala)

| Escala | Ferramenta |
|---|---|
| Pequena (1-3 devs, MVP) | Trello + Markdown no repo |
| Média (5-15 devs) | Jira / Linear / GitHub Projects + documentação no Notion / Confluence |
| Grande (50+ devs, vários times) | Jira + Confluence + Polarion ou Jama |
| Sistemas críticos (saúde, finanças, aeroespacial) | DOORS, Polarion, Jama (auditoria + rastreabilidade obrigatória) |

**Princípio**: ferramenta serve ao processo, não o contrário. Comece simples.

---

## 8. Processos ágeis e mudança (Sommerville)

> Os processos de desenvolvimento ágil foram concebidos para **lidar com requisitos que mudam durante o processo de desenvolvimento**. Nesses processos, quando um usuário propõe uma mudança nos requisitos, ela **não passa por um processo formal** de gerenciamento de mudanças. Em vez disso, o usuário tem de priorizar a mudança e, se for de alta prioridade, decidir quais características do sistema que foram planejadas para a próxima iteração devem ser abandonadas para que ela seja implementada.

**Vantagem**: agilidade.
**Risco**: usuário não é necessariamente quem decide melhor o trade-off custo-benefício. Em sistemas com múltiplos stakeholders, mudança beneficia uns, prejudica outros.

**Mitigação**: ter **autoridade independente** (Steering Committee, CCB simplificado) que equilibra interesses, especialmente para mudanças que afetam stakeholders ausentes do daily.

---

## 9. Versionamento de requisitos

Como código tem Git, requisitos têm versão.

**Esquema simples**:

```
RF-001 v1.0   → versão inicial
RF-001 v1.1   → ajuste de wording (não muda comportamento)
RF-001 v2.0   → mudança comportamental (revisão necessária)
RF-001 DEPRECATED → não usado mais; mantido por histórico
```

**Histórico do requisito** registra:
- Quem alterou
- Quando
- O que mudou (diff)
- Por quê (motivação)
- Quem aprovou

---

## 10. Anti-patterns

### 10.1 "Mudança verbal" (sem registro)

Cliente diz no corredor "preciso disto outro". Dev implementa. Documento nunca atualizado. **Em 6 meses ninguém lembra por quê está assim.**

### 10.2 Refatoração "limpa" sem rastreabilidade

Dev renomeia classe, "limpa" código, remove comentário que dizia "atende CA-LOGIN-05 (LGPD)". 1 ano depois, auditor pergunta "como atendem LGPD?" → ninguém sabe responder.

### 10.3 Aceitar toda mudança proposta

PO diz sim para tudo. Backlog vira lista infinita. Velocity cai. Nada é entregue. **Mudança precisa de critério de aceite**: prioridade + custo + impacto.

### 10.4 Rejeitar toda mudança

"Já especificamos, agora não muda mais." Sistema entregue não resolve problema real. **Rigidez = projeto falhado**. Equilibrar com gestão formal.

### 10.5 Rastreabilidade sem atualização

Matriz existe. Não é atualizada há 2 anos. Pior que não ter — induz a falsa segurança. **Política**: rastreabilidade é atualizada no mesmo PR que muda o requisito ou código.

### 10.6 ID mutável

Requisito é renumerado a cada release. Rastreabilidade quebra. **Regra**: ID é eterno. Versão muda; ID nunca.

---

## 11. Quando mudar requisito vs quando renegociar prazo

| Situação | Ação |
|---|---|
| Cliente entendeu errado o que pediu | Mudar requisito; prazo pode mudar |
| Dev descobriu impossibilidade técnica | Renegociar (ou mudar tecnologia, ou mudar requisito) |
| Nova lei muda regra | Mudar requisito (não há escolha); priorizar acima de tudo |
| Concorrente lançou feature | NÃO mudar requisito sem reanálise; pode ser miragem |
| Stakeholder novo apareceu | Mudar requisito + revisar prioridades |
| Tecnologia disponibilizou recurso novo | Avaliar se requisito original ainda é melhor opção |

---

## 12. Conexão com as próximas references

- **Camada acima — análise de negócios (BABOK)**: [08-analista-negocios.md](08-analista-negocios.md)
- **Ética em mudança (especialmente descontinuação)**: [09-etica-sbc.md](09-etica-sbc.md) §3.6 (cuidado ao modificar/encerrar operação de sistemas)
