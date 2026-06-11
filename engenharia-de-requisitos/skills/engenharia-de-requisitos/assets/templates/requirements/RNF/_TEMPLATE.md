<!-- GENERIC TEMPLATE — copy to RNF-<slug>.md (perf, security, a11y, lgpd, availability, ...). Metrics MUST be quantitative. -->
# RNF-<slug> — <Performance | Segurança | Acessibilidade | Privacidade | Disponibilidade | ...>

> **Tipo**: Requisito Não-Funcional (transversal)
> **Prioridade**: 🟠 Alta (gate de release)
> **Status**: 📝 Proposto | 🚧 Parcial | ✅ Verificado

---

## Enunciado

<frase de negócio do atributo de qualidade>

### Métricas obrigatórias (SEMPRE quantitativas)

| Métrica | Alvo | Quando/como medir |
| --- | --- | --- |
| <ex.: p95 resposta server> | <ex.: ≤ 300ms em <escala>> | <ex.: load test> |

## Realizado por (rastreabilidade ↓)

| Epic / Feature | Como atende |
| --- | --- |
| [EP-NN → F-NN](../../backlog/features/F-NN-....md) | <quais CAs> |

## Como verificar (gates de CI)

| Gate | Status |
| --- | --- |
| <ex.: build falha se bundle > <limite>> | ⏳ |

## Restrições

- <hardware-base de teste, escala-alvo, etc.>
