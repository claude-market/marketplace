<!-- GENERIC TEMPLATE — copy to F-NN-<slug>.md. Feature has a paragraph description; BDD lives in the User Story. -->
# F-NN — <nome de negócio>

> **Tipo**: Feature
> **Epic pai**: [EP-NN ...](../epics/EP-NN-....md)
> **Sprint de execução**: [Sprint N](../sprints/sprint-N-....md)
> **Status**: 📝 Proposto | 🚧 Em andamento | ✅ Done
> **Prioridade**: 🔴 Imediato

---

## Descrição (visão de produto)

<parágrafo em linguagem de negócio. Feature NUNCA tem BDD — BDD vive na User Story.>

## Requisitos atendidos (rastreabilidade ↑)

| ID | Requisito | Relação |
| --- | --- | --- |
| [RF-NNN](../../requirements/RF/RF-NNN-....md) | <enunciado> | Realiza diretamente |

## Critérios de Aceitação (CAs)

| ID | Critério | Como verificar | Status |
| --- | --- | --- | --- |
| **CA01** | <estado verificável em booleano> | <teste> | ⏳ |

## User Stories

### US-NN.1 — <título curto>

> **Como** <persona>
> **Quero** <ação>
> **Para** <valor>.

- **Prioridade**: 🔴 · **Estimativa**: <SP> · **Sprint**: N · **Status**: ⏳
- **CAs cobertos**: CA01..CANN · **Persona**: [<persona>](../../requirements/personas-e-cenarios.md)

#### Cenários BDD (Gherkin)

```gherkin
Funcionalidade: <nome>
  Cenário: <caminho feliz>
    Dado que <contexto>
    Quando <ação>
    Então <resultado observável>
```

## Tasks (único nível com termo técnico)

| ID | Task | Commit | Status |
| --- | --- | --- | --- |
| T-NN.1.1 | <descrição técnica> | — | ⏳ |
