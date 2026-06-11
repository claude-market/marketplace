<!-- GENERIC TEMPLATE — adapt to your project. See references/10-estrutura-projeto.md §5 (two-tier ADRs). -->
# ADRs — Architecture Decision Records (nível de PROJETO)

> Decisões arquiteturais **transversais** ao sistema, formato MADR (Markdown ADR).
> Decisões locais a uma feature vivem em `../../specs/<feature>/adrs/` (TIER 2), compartilhando a MESMA numeração global.

## Convenção

- Numeração **global sequencial** (`ADR-NNN-slug.md`) — contínua entre tier 1 (aqui) e tier 2 (specs).
- Status: `Accepted` | `Superseded by ADR-NNN` | `Deprecated` | `Proposed`.
- Mudança de decisão → cria-se **nova** ADR que supersede a antiga (NUNCA edita a anterior).
- Renumerar é **proibido** (ADR-005 sempre será ADR-005, mesmo se deprecada).
- Tag de variante (`-DB`, `-FE`, `-UI`) quando o mesmo número resolve decisões paralelas em camadas distintas.

## Catálogo

| ID | Título | Status |
| --- | --- | --- |
| [001](./ADR-001-....md) | <decisão> | Accepted |

## Cross-ref

- `../../specs/<feature>/adrs/INDEX.md` — ADRs locais por feature (tier 2).
