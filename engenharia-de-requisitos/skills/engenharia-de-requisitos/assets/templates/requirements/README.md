<!-- GENERIC TEMPLATE — adapt to your project. See references/10-estrutura-projeto.md §"Adaptation protocol". -->
# Requisitos — <NOME DO PROJETO>

> **Pasta-fonte do "o QUÊ".** Responde "que necessidade o sistema atende?", sem entrar no "como"
> (isso é `../specs/` + ADRs). O backlog só materializa o que está aqui — esta pasta é a source of truth.

## Hierarquia de rastreabilidade

```
Requisito (RF/RNF)        ← ESTA pasta
  ↓ realizado por
Epic (EP-NN)              ← ../backlog/epics/
  ↓ decomposto em
Feature (F-NN)            ← ../backlog/features/
  ↓ aceito quando
Critério de Aceitação     ← dentro do arquivo de Feature
  ↓ ilustrado por
User Story + BDD          ← dentro do arquivo de Feature
  ↓ implementado por
Task (T / TX)             ← dentro do arquivo de Feature
  ↓ entregue em / materializada em
Sprint → Commit (SHA)
```

**Regra dura**: rastreabilidade bidirecional — cada arquivo cita pai e filhos via link relativo.

## Estrutura

```
requirements/
├── README.md                 este arquivo
├── personas-e-cenarios.md    personas do projeto; toda US referencia uma
├── RF/   RF-NNN-<modulo>.md   Requisitos Funcionais (1 arquivo por módulo do sistema)
└── RNF/  RNF-<slug>.md        Requisitos Não-Funcionais (transversais; SEMPRE quantitativos)
```

> **Adapte ao projeto**: crie um `RF-NNN-<modulo>.md` por módulo/app real do sistema
> (ex.: um por bounded context, app Django, pacote, ou área de domínio).

> ⚠️ **1 arquivo por MÓDULO, não 1 por requisito** (confusão comum — leia antes de achar que falta algo).
> Cada arquivo em `RF/` documenta um **módulo inteiro** (um Epic), nomeado pelo seu **primeiro** requisito:
> `RF-01-<modulo>.md` contém RF-01..RF-04; `RF-05-<modulo>.md` contém RF-05..RF-08; e assim por diante.
> Os requisitos individuais ficam como seções `### RF-NN` **dentro** do arquivo. Por isso, uma pasta que
> mostra `RF-01, RF-05, RF-09…` **não** está sem o RF-02/03/04 — eles são seções do primeiro arquivo.
> Os "saltos" nos **nomes dos arquivos** são fronteiras de módulo (faixas contíguas), nunca requisitos
> faltando. *(Se preferir 1 arquivo por requisito, é uma variante válida — mas o padrão e o scaffolder
> assumem 1-arquivo-por-módulo.)*

## Convenções

- **Linguagem de negócio**. Sem verbo no infinitivo no título; sem termo técnico (jargão fica em ADRs/specs).
- **IDs imutáveis**: `RF-NNN`, `RNF-<slug>`. Descontinuado → `RF-NNN-deprecated.md` (não some).
- **Prioridade**: 🔴 Imediato · 🟠 Alta · 🟡 Normal · 🟢 Baixa.
- **RNF é sempre quantitativo** — "rápido" é desejo; "p95 ≤ 300ms" é requisito.
- Cada arquivo tem `## Realizado por` (Epics/Features que o executam).

## Como adicionar um requisito

1. Existe `RF-NNN` do módulo? Sim → nova seção. Não → `RF-NNN-novo-modulo.md` (próximo número livre).
2. Enunciado em linguagem de negócio.
3. Prioridade explícita.
4. `## Realizado por` (vazio se ainda não há Epic).
5. Quando um Epic novo citar este requisito, edite aqui — bidirecional é obrigatório.

## Skill canônica

[`engenharia-de-requisitos`](https://github.com/seekdevcore/sk-requirements-engineering-theskill) — IFPB ERS + Sommerville/Pressman/Wiegers/Cohn/BABOK v3 + Ética SBC 002/2024.

## Cross-references

- [Backlog](../backlog/README.md) · [Specs](../specs/) · [ADRs do projeto](../planning/adrs/)
