# 08 — Analista de Negócios (Business Analyst)

> A camada acima da engenharia de requisitos. Combina BABOK Guide v3 (IIBA — International Institute of Business Analysis) com a prática do mercado brasileiro. **Engenharia de requisitos responde "quais requisitos o sistema deve ter?"; análise de negócios responde "estamos resolvendo o problema certo?".** As duas se cruzam, mas o BA olha o domínio inteiro, não só o software.

---

## 1. Diferença entre Engenheiro de Requisitos e Analista de Negócios

| Aspecto | Eng. de Requisitos | Analista de Negócios |
|---|---|---|
| Foco | O **sistema de software** a ser construído | O **processo / negócio** a ser melhorado |
| Escopo | RF + RNF + restrições técnicas | Processos, pessoas, políticas, sistemas (incluindo manual) |
| Saída | Backlog, RTM, especificação | Análise de viabilidade, cases de negócio, mapeamento AS-IS / TO-BE |
| Pergunta-chave | Que sistema construir? | Que problema resolver? Vale a pena? |
| Em times pequenos | Mesma pessoa | Mesma pessoa |
| Em times grandes | Especialista técnico próximo ao dev | Especialista de negócio próximo ao stakeholder |

**Em projetos pequenos, dev + PO acumulam o papel de BA.** Em projetos grandes, há analista dedicado.

---

## 2. BABOK Guide v3 — as 6 áreas de conhecimento

O **Business Analysis Body of Knowledge** (publicado pelo IIBA, padrão internacional) organiza a profissão em 6 áreas:

| Área | O que faz |
|---|---|
| **Planejamento e monitoramento de análise de negócios** | Define como, por quem e quando a análise será feita |
| **Elicitação e colaboração** | Coleta informações de stakeholders (cruza com [02-elicitacao.md](02-elicitacao.md)) |
| **Gerenciamento do ciclo de vida dos requisitos** | Rastrear, manter, priorizar, aprovar requisitos (cruza com [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)) |
| **Análise da estratégia** | Identificar problemas/oportunidades; avaliar capacidades atuais; definir estratégia de mudança |
| **Análise de requisitos e design de solução** | Modelar requisitos, especificar, validar (cruza com [03](03-especificacao.md), [04](04-bdd-criterios-aceitacao.md), [06](06-validacao.md)) |
| **Avaliação da solução** | Após implantação, medir se a solução resolve o problema de negócio |

**Insight do BABOK**: a análise de requisitos é **apenas 1 das 6 áreas**. As outras 5 contextualizam — sem elas, requisitos são tecnicamente bons mas resolvem o problema errado.

---

## 3. Fluxo central — AS-IS → TO-BE → GAP

A prática mais difundida em consultoria. Não está nominalmente no BABOK, mas atravessa quase todas as áreas.

### 3.1 AS-IS (estado atual)

**Mapeamento do processo atual** — como é hoje, com suas dores, gargalos, retrabalhos.

Técnicas:
- **BPMN** (Business Process Model and Notation) — diagrama formal de processo
- **Mapas de fluxo de valor** (lean) — destaca tempo de espera vs tempo de valor
- **Service Blueprint** — adiciona camada de experiência do usuário
- Entrevistas + observação (etnografia, ver [02-elicitacao.md](02-elicitacao.md))
- Análise de documentos (POPs, regulamentos)

**Output**: diagrama AS-IS + lista de dores quantificadas.

Exemplo (caso fictício de RU universitário, AULA 06):

```
AS-IS — Processo de atendimento ao usuário do RU

[Usuário chega] → [Apresenta ID em papel] → [Atendente confere lista] → 
[Atendente registra manualmente em caderno] → [Usuário passa pela catraca manual] →
[Recebe refeição] → [Em caso de reclamação, registra em livro físico]

DORES:
- Filas longas (registro manual leva 30-45s por pessoa)
- Erros no cadastro (caderno físico, sem validação)
- Sem visibilidade de cardápio (usuário chega e descobre que não pode comer por restrição alimentar)
- Reclamações no livro físico raramente são endereçadas
```

### 3.2 TO-BE (estado desejado)

**Como queremos que seja** — desenho do processo após a solução.

**Cuidado**: TO-BE não é "AS-IS + sistema". É **um processo redesenhado** que pode envolver:
- Eliminar passos desnecessários
- Reorganizar responsabilidades
- Automatizar onde faz sentido
- Manter manual onde faz mais sentido

Exemplo do RU:

```
TO-BE — Processo de atendimento ao usuário do RU

[Usuário consulta cardápio no app na véspera] → 
[Usuário escolhe horário menos congestionado mostrado no app] →
[Apresenta QR code no celular ou cartão magnético] →
[Catraca eletrônica valida + registra automaticamente] →
[Recebe refeição] →
[App permite avaliar refeição + registrar reclamação]
```

### 3.3 GAP analysis

**Diferença AS-IS → TO-BE** = oportunidades de melhoria.

Cada gap vira **requisito** (do sistema OU do processo):

| Gap | Tipo de solução | Requisito |
|---|---|---|
| Visibilidade de cardápio | Sistema | RF: app mostra cardápio do dia/semana |
| Restrição alimentar não identificada | Sistema | RF: app filtra opções por restrição registrada no perfil |
| Filas longas | Sistema | RF: app mostra horários de pico em tempo real |
| Reclamação não endereçada | Processo + Sistema | RF: sistema notifica coordenação + processo: SLA de resposta em 48h |
| Erro no cadastro manual | Sistema | RF: catraca eletrônica + RNF: precisão ≥99,5% no registro |

**Nem todo gap vira software.** Alguns viram mudança de processo, treinamento, política.

---

## 4. Modelos canônicos de análise (e quando usar)

| Modelo | Uso |
|---|---|
| **Business Model Canvas** (Osterwalder) | Visão estratégica do negócio (proposta de valor, segmentos, canais, receita) |
| **Value Proposition Canvas** | Detalhar fit entre produto e dor do cliente |
| **SWOT** | Análise estratégica (forças, fraquezas, oportunidades, ameaças) |
| **PESTEL** | Contexto macro (político, econômico, social, tecnológico, ambiental, legal) |
| **Diagrama de Ishikawa (fishbone)** | Causa-raiz de problema do negócio |
| **5 Whys** | Aprofundar até a causa real (versão simples do Ishikawa) |
| **MoSCoW** | Priorização (Must, Should, Could, Won't) |
| **RICE scoring** | Priorização quantitativa (Reach × Impact × Confidence ÷ Effort) |
| **Kano model** | Categorizar features (básico, desempenho, encantamento) |
| **Stakeholder map** | Identificar e classificar stakeholders por influência × interesse |

### 4.1 MoSCoW em detalhe

| Categoria | Significado | Critério |
|---|---|---|
| **M**ust have | Obrigatório | Release não vai sem isto |
| **S**hould have | Deveria ter | Importante mas pode adiar 1-2 sprints sem matar a release |
| **C**ould have | Poderia ter | Bom ter; primeiro corte se faltar tempo |
| **W**on't have (this time) | Não terá agora | Decisão consciente de não fazer neste ciclo |

**Erro comum**: 80% das features marcadas como "Must". Sinal de que não houve priorização real.

### 4.2 RICE scoring

```
Score = (Reach × Impact × Confidence) / Effort
```

| Fator | Como medir |
|---|---|
| **Reach** | Quantos usuários afetados / trimestre |
| **Impact** | 0.25 (mínimo) / 0.5 / 1 / 2 / 3 (massivo) |
| **Confidence** | % de certeza (100%, 80%, 50%) |
| **Effort** | Pessoa-meses |

**Exemplo**:
- Feature A: 1000 usuários × 1 (impacto médio) × 0.8 (confiança alta) / 2 PM = **400**
- Feature B: 100 usuários × 3 (impacto massivo) × 0.5 (incerto) / 1 PM = **150**

Feature A tem score mais alto → entra primeiro.

---

## 5. Documentos típicos do BA (BABOK)

### 5.1 Business Requirements Document (BRD)

**Foco**: o que o negócio precisa (não como o sistema vai fazer).

Estrutura típica:
- Sumário executivo
- Contexto e oportunidade
- Objetivos de negócio + métricas de sucesso (KPIs)
- Stakeholders
- Restrições (orçamento, prazo, regulatórias)
- Premissas
- Riscos
- Análise AS-IS
- Visão TO-BE de alto nível
- Critérios de aceitação do projeto

### 5.2 Functional Requirements Specification (FRS)

**Foco**: o que o sistema deve fazer. Próximo do "documento de requisitos" de Sommerville.

### 5.3 Use Case Document

Cada caso de uso documentado com:
- Atores
- Pré-condição
- Pós-condição
- Fluxo principal (numerado)
- Fluxos alternativos
- Exceções

(Em time ágil, o caso de uso é substituído por User Story + BDD.)

### 5.4 Process Map (BPMN)

Notação formal: piscinas (organizações), raias (papéis), atividades (retângulos), gateways (losangos), eventos (círculos).

### 5.5 Stakeholder Register

Tabela com colunas:
- Nome / Papel
- Interesses
- Nível de poder
- Nível de influência
- Estratégia de engajamento

---

## 6. Stakeholder Map (poder × interesse)

Matriz 2x2 para priorizar engajamento:

```
              ALTO INTERESSE              BAIXO INTERESSE
            ┌──────────────────────┬──────────────────────┐
ALTO PODER  │  GERENCIAR DE PERTO  │  MANTER SATISFEITOS  │
            │                      │                      │
            │  CEO, regulador,     │  Diretoria distante  │
            │  patrocinador        │  do dia-a-dia        │
            ├──────────────────────┼──────────────────────┤
BAIXO PODER │  MANTER INFORMADOS   │  MONITORAR           │
            │                      │                      │
            │  Usuários finais,    │  Funcionários sem    │
            │  comunidade técnica  │  vínculo direto      │
            └──────────────────────┴──────────────────────┘
```

Estratégia diferente por quadrante. **Gerenciar de perto** = participam de cada decisão. **Monitorar** = só informo o estritamente necessário.

---

## 7. Conexão com o método ágil

BABOK não é incompatível com Scrum/SAFe/LeSS. Ao contrário:

| Atividade BABOK | Equivalente ágil |
|---|---|
| Análise da estratégia | Discovery + Product Vision |
| Elicitação | Refinamento do backlog + Three Amigos |
| Análise de requisitos | Story writing + sizing |
| Design de solução | Sprint planning + arquitetura |
| Gerenciamento do ciclo | Sprint review + retrospective |
| Avaliação da solução | Métricas pós-release + experimentação |

**Em times ágeis, o BA pode atuar como Product Owner ou como facilitador entre stakeholders e o PO técnico.**

---

## 8. Bibliografia canônica de análise de negócios

- **IIBA.** *BABOK Guide* v3 — referência padrão internacional
- **Wiegers & Beatty.** *Software Requirements* 3rd ed. — base prática
- **Osterwalder.** *Business Model Generation* — Canvas
- **Christensen.** *The Innovator's Dilemma* / *Jobs to be Done* — perspectiva estratégica
- **Patton.** *User Story Mapping* — bridge entre BA e user stories
- **Hammer & Champy.** *Reengineering the Corporation* — para projetos de transformação radical (BPR)

---

## 9. Quando esta camada é necessária (sinalizadores)

Você precisa de análise de negócio formal (não só ER) quando:

- O projeto tem **vários sistemas envolvidos** (não é app único)
- Há **mudança organizacional** (não só software)
- **Stakeholders são heterogêneos** (vendas, jurídico, ops, TI)
- O **problema de negócio não está claro** (só a vontade de "ter um app")
- **Regulação muda o negócio** (LGPD, BACEN, ANS)
- Investimento alto (>R$ 500k) — comitê quer **caso de negócio** com ROI
- Equipe entrega features sem mover os **KPIs de negócio** (sinal de que requisitos estão certos tecnicamente mas errados estrategicamente)

Em projetos simples (MVP de SaaS, feature isolada), pular esta camada é OK — mas mantenha em mente o **risco de fazer a coisa certa errado**.

---

## 10. Conexão com as próximas references

- **Ética em decisões de negócio (especialmente quando algo afeta os menos favorecidos)**: [09-etica-sbc.md](09-etica-sbc.md)
