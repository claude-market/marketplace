<!-- GENERIC TEMPLATE — adapt to your project. See references/10-estrutura-projeto.md §"Adaptation protocol". -->
# Backlog — <NOME DO PROJETO>

> **Pasta-fonte do "QUEM faz O QUÊ, QUANDO".** O **porquê** vive em `../requirements/`. O **como** em `../specs/` + ADRs.
>
> Last requirements-document check: DD/MM/AAAA — no changes
> (atualize toda vez que conferir os requisitos antes de mexer no backlog — SKILL §2.1)

## Estrutura

```
backlog/
├── README.md      este arquivo
├── glossario.md   vocabulário de domínio (toda US/CA/ADR deve usar estes termos)
├── epics/         EP-NN-<slug>.md  — descrição + lista de Features filhas
├── features/      F-NN-<slug>.md   — descrição + CAs + USs (com BDD) + Tasks
├── sprints/       sprint-N-<slug>.md — execução temporal (mapping US/Task)
└── done/          Epics/Features fechados (MOVIDOS via git mv, não copiados)
```

## Naming (regra dura)

| Nível | Pode no título | NÃO pode no título |
| --- | --- | --- |
| Epic | Substantivo + adjetivo | Infinitivo, termo técnico |
| Feature | Substantivo + adjetivo | Infinitivo, sigla técnica |
| CA | Estado verificável | Vago ("Performance OK") |
| US | "Como [persona], quero [ação], para [valor]" | Mistura técnico-negócio |
| Task | **PODE** termo técnico | (único nível onde técnico é OK) |

## IDs canônicos (imutáveis após criação)

| Tipo | Formato | Exemplo |
| --- | --- | --- |
| Epic | `EP-NN` | `EP-10` |
| Feature | `F-NN` | `F-30` |
| Critério de Aceitação | `CANN` (no Feature pai) | `CA01` |
| User Story | `USNN.M` | `US30.1` |
| Task US-bound | `TNN.M.K` | `T30.1.4b` |
| Task transversal | `TX-NN` | `TX-18` |
| Sprint | `sprint-N-slug` | `sprint-4-<slug>` |

## Prioridade

🔴 Imediato (bloqueia MVP/security) · 🟠 Alta (release atual) · 🟡 Normal (próxima sprint) · 🟢 Baixa.

## Definition of Done de Feature

1. Todos os CAs verificados por teste (ou checklist manual se UX puro).
2. Toda US tem BDD que roda verde.
3. Toda Task `done` com commit hash.
4. Code-review aprovado.
5. Cobertura ≥ gate do Sprint.
6. Documentação cruzada atualizada (RF/RNF citados; Sprint cita Feature; Feature em `done/`).
7. Mergeada via PR (sem `--force-push`, sem `--no-verify`).

## Como fechar uma Feature

1. Confirmar CAs/USs/Tasks `✅ Done`.
2. Atualizar commit hashes no `features/F-NN-*.md`.
3. Atualizar Epic pai.
4. Atualizar Sprint.
5. Atualizar `requirements/RF-*` (`## Realizado por`).
6. `git mv features/F-NN-*.md done/`.
7. Commit `chore(backlog): F-NN done — close + archive`.

## Cross-references

- [Requisitos](../requirements/README.md) · [Specs](../specs/) · [ADRs do projeto](../planning/adrs/)
