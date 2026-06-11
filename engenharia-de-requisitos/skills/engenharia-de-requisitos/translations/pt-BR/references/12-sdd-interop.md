# 12 — Interop com SDD (OpenSpec · Spec Kit) — **ponte opcional na camada de execução**

> **Quando usar esta referência**: quando o projeto já roda — ou quer rodar — um loop de execução de
> Spec-Driven Development (SDD) (OpenSpec ou GitHub Spec Kit) e você quer que esta skill *alimente* esse loop em vez
> de competir com ele. Esta skill é dona da **qualidade do requisito** (elicitação, frasear em EARS, CAs,
> validação, ética, rastreabilidade); o framework de SDD é dono do **ciclo de execução** (spec → código → revisão).
> Este arquivo é a ponte. **Opcional** — pule por completo se o projeto não tem framework de SDD (§6).

> **Os dois frameworks (links de referência duráveis — repos podem mudar de lugar, então aprenda-os pela fonte):**
>
> - **OpenSpec** (Fission-AI) — modelo de pasta-de-mudança com delta specs (`ADDED`/`MODIFIED`/`REMOVED`) e
>   arquivamento. Repo: <https://github.com/Fission-AI/OpenSpec>.
> - **GitHub Spec Kit** — um loop de quatro fases `Spec → Plan → Tasks → Implement` com um `constitution.md`
>   escrito-uma-vez. Repo: <https://github.com/github/spec-kit>.
>
> Ambos presumem que um agente de código implementa *a partir* da spec. Se um link der 404, busque a org/nome — o modelo
> abaixo é o formato-do-framework, não preso a versão.

---

## 1. A divisão de trabalho

Esta skill e um framework de SDD são **categorias diferentes**, não concorrentes:

| Preocupação | Dono |
|---------|-------|
| *O que* construir e *por quê* (elicitação, RF/RNF, regras de negócio) | **esta skill** (§1–§2) |
| Fraseado preciso e testável (EARS) | **esta skill** (§11) |
| Critérios de aceitação + BDD | **esta skill** (§4) |
| Portões de qualidade do requisito (Sommerville 5 + Falbo 7) | **esta skill** (§6) |
| Revisão de ética (SBC 002/2024) | **esta skill** (§9) |
| Espinha de rastreabilidade (RTM) | **esta skill** (§7) |
| Conduzir spec → plano → tarefas → código | **framework de SDD** |
| Rastreamento de mudança no nível do arquivo, arquivamento | **framework de SDD** (esp. OpenSpec) |
| Slash commands, orquestração de agentes | **framework de SDD** |

**Princípio**: mantenha a espinha `docs/requirements/` + `docs/backlog/` desta skill como a **fonte de verdade do
requisito**. A pasta `specs/` (ou `openspec/`) do framework de SDD é uma *projeção* dessa verdade no
formato de execução do framework — gerada a partir dela, nunca o contrário.

---

## 2. Crosswalk de artefatos

Como os artefatos desta skill mapeiam nos arquivos esperados por cada framework.

| Esta skill | OpenSpec | Spec Kit |
|------------|----------|----------|
| `RF-NN` (req. funcional, linguagem de negócio) | `specs/<cap>/spec.md` → "Requirements" | `spec.md` → seção de requisitos funcionais |
| `RNF-NN` (req. não-funcional) | `spec.md` → "Non-functional / constraints" | `spec.md` → RNF / constraints |
| Declaração EARS (§11) | linha de requisito dentro de `spec.md` | linha de requisito dentro de `spec.md` |
| `CANN` (critério de aceitação — `CA01`, sem hífen, conforme `05-convencoes-interpop.md`) | `spec.md` → "Scenarios / acceptance" | `spec.md` → critérios de aceitação |
| BDD `Cenário` (Gherkin) | bloco de cenário em `spec.md` | bloco de cenário, alimenta as tarefas `/speckit` |
| `G-NN` (regra de negócio) | capturada na justificativa do `design.md` | capturada nas constraints do `plan.md` |
| Hierarquia `EP`/`F` | uma pasta de mudança por `F` | um diretório de feature por `F` |
| Decisão de design / ADR (§10) | `design.md` | `plan.md` + `constitution.md` |
| `T`/`TX` (tarefas) | checklist em `tasks.md` | checklist em `tasks.md` |
| RTM (§7) | implícita via pastas de mudança | implícita via diretórios de feature |
| Nota de escopo "fora de escopo" | `proposal.md` → out-of-scope | `spec.md` → non-goals |

> **Regra de preservação de ID** (mesmo espírito de `05-convencoes-interpop.md`): quando um `RF-NN` é projetado em
> um arquivo de framework, **mantenha o identificador `RF-NN` inline** (ex.: como prefixo de título ou tag final
> `[RF-21]`). O framework pode não ter um slot de ID nativo — embuta-o para que a RTM sobreviva ao round-trip.

---

## 3. Mapeamento OpenSpec

O OpenSpec organiza cada mudança em sua própria pasta:

```
openspec/changes/<feature-slug>/
├── proposal.md   ← why + what changes + in-scope / out-of-scope
├── specs/        ← requirements + user scenarios
├── design.md     ← technical approach (your ADR content)
└── tasks.md      ← implementation checklist (your T / TX)
```

### 3.1 Receita de projeção (esta skill → OpenSpec)

> **Faça o scaffold automaticamente** com `bash assets/project-to-sdd.sh <F-NN> --target openspec --apply` — ele
> lê o arquivo da feature, preserva as tags `[RF-NN]` e escreve a pasta abaixo (dry-run por padrão; nunca
> sobrescreve). Depois preencha a prosa EARS e rode `check_projection_drift`. Os passos abaixo são o que ele gera:

1. Uma **pasta de mudança** OpenSpec **por Feature (`F-NN`)**. Slug = nome da feature.
2. `proposal.md`:
   - "Why" ← a meta do `EP` + as regras de negócio `G-NN` que a motivam.
   - "In scope" ← os `RF-NN` cobertos por esta `F`.
   - "Out of scope" ← liste explicitamente os `RF` adjacentes que *não* estão nesta mudança (o campo de maior valor do OpenSpec).
3. `specs/spec.md`:
   - Cada `RF-NN` → uma seção de requisito, fraseada em **EARS** (§11), com a tag `[RF-NN]` preservada.
   - Cada `CANN` → uma entrada de cenário / aceitação.
   - Cada `Cenário` (Gherkin) → um bloco de cenário.
4. `design.md` ← seu conteúdo de ADR tier-1/tier-2 (§10).
5. `tasks.md` ← seus itens `T`/`TX`, em forma de checklist.

### 3.2 Delta specs — o ganho de gestão de mudança

O OpenSpec marca seções da spec como **`ADDED` / `MODIFIED` / `REMOVED`** e mescla os deltas na spec primária
no arquivamento. Isto é exatamente a preocupação de **mudança + rastreabilidade** de `07-mudanca-rastreabilidade.md`, mas
executada no nível do arquivo. Workflow recomendado:

- Trate um *delta* do OpenSpec como a forma em-disco de uma entrada de mudança da RTM.
- Quando um `RF-NN` muda, o marcador `MODIFIED` do delta **é** o registro de mudança — aponte sua RTM para a
  pasta de mudança em vez de duplicar prosa.
- No `archive`, o delta mescla na spec fonte-de-verdade; sua linha de RTM fecha. Sem verdade duplicada.

A interop mais limpa das duas — o suporte a brownfield/legacy do OpenSpec também se alinha ao caminho de migração
`LEGACY-MONOLITH` (`10-estrutura-projeto.md §8.1`).

---

## 4. Mapeamento Spec Kit

O Spec Kit roda um loop de quatro fases com artefatos fixos:

```
Spec → Plan → Tasks → Implement
 │       │       │
 ▼       ▼       ▼
spec.md  plan.md tasks.md   (+ .specify/memory/constitution.md, once)
```

### 4.1 Receita de projeção (esta skill → Spec Kit)

> **Faça o scaffold automaticamente** com `bash assets/project-to-sdd.sh <F-NN> --target speckit --apply` (escreve
> `specs/<slug>/{spec,plan,tasks}.md` + `.specify/memory/constitution.md` uma vez; tags `[RF-NN]` preservadas;
> dry-run por padrão). Depois preencha a prosa EARS e rode `check_projection_drift`.

1. **`constitution.md` (uma vez por projeto)** ← suas convenções duras (as 10 regras de `05-convencoes-interpop.md`) +
   os guard-rails de ética da SBC (§9). O lar natural para "regras que o agente deve sempre seguir".
2. **`spec.md` (por feature)** ← `RF`/`RNF` como requisitos (fraseados em EARS), `CANN` como critérios de aceitação,
   `Cenário` como cenários, tags `[RF-NN]` mantidas.
3. **`plan.md`** ← suas decisões de ADR / design (§10) + as constraints de regra de negócio `G-NN`.
4. **`tasks.md`** ← sua decomposição `T`/`TX`.

### 4.2 Pontos de atenção

- **Custo de token**: o Spec Kit relê spec + plan + tasks a cada turno (um aumento mensurável de gasto de API vs prompting
  ad-hoc). Mantenha o `spec.md` enxuto — seu fraseado EARS ajuda, já que um `SHALL`/`DEVE` por linha é mais denso
  do que prosa.
- **Portões de fase rígidos**: o Spec Kit espera as fases em ordem. Rode a §0 → validação desta skill (elicit →
  specify → validate) *por completo* antes de `specify`, para você não bater num portão com um requisito não validado.
- **`constitution.md` é escrito-uma-vez**: regras duráveis (nomenclatura, ética) ali; detalhe volátil no `spec.md` por feature.

---

## 5. Integridade do round-trip (não quebre a RTM)

A única regra que mantém a interop segura:

> **A fonte de verdade do requisito fica em `docs/requirements/`.** A pasta do framework é gerada
> *a partir* dela. Quando a spec do framework muda durante a implementação, reconcilie de volta: atualize o `RF-NN`,
> rerode `validate_ears` / `validate_acceptance_criterion`, depois reprojete.

Anti-padrão: editar `spec.md` dentro do framework e deixar o `RF-NN` em `docs/requirements/` ficar
desatualizado. Isso quebra silenciosamente a rastreabilidade `RF ↔ EP ↔ F` que o trabalho de estrutura da §0 existe para proteger.

Essa reconciliação é **automatizada (consultiva)** pela ferramenta MCP
`check_projection_drift(requirements_dir, projection_dir)` — ela reporta, nunca bloqueia. Seus achados:

| Achado | O que detecta | Granularidade |
|---|---|---|
| `missing_in_projection` | um `RF/RNF` em `docs/` ausente (por tag) de toda spec de framework | por-RF (exato) |
| `duplicated_in_projection` | uma tag `RF/RNF` aparecendo em **mais de um** arquivo de spec (deveria ser exatamente um) | por-RF (exato) |
| `orphan_in_projection` | uma linha de spec com cara de requisito **sem** tag `RF-NN` (req. não elicitado) | por-linha (exato) |
| `ears_weakened` | uma linha de requisito usando um **modal fraco** e nenhum `SHALL`/`DEVE` | por-linha (exato) |
| `ca_without_scenario` | a fonte tem ids `CANN` mas a projeção **não tem** bloco `Scenario`/`Cenário` **algum** | **grossa / global** (não por-CA) |

> **Notas honestas de escopo** (para você não confiar demais na ferramenta):
>
> - `ca_without_scenario` é uma verificação **grossa, global** — ela dispara apenas quando a projeção não contém *nenhum*
>   bloco de cenário, não por `CANN` individual. Trate como um cheiro, não como uma lista precisa de lacunas.
> - `ears_weakened` é **baseado em tag/keyword**. Em **pt-BR**, `DEVE` é a *obrigação* EARS (não um modal
>   fraco), então o conjunto de modais fracos é `should/must/will` (EN) + `deveria/pode/poderá/irá/vai` (pt-BR) — ele
>   **não** trata `DEVE` como fraco. Uma linha corretamente fraseada `O SISTEMA DEVE …` nunca é sinalizada.
> - **Dir-inteiro vs por-feature**: a ferramenta compara o `docs/requirements/` **inteiro** contra a
>   projeção. O adaptador (`assets/project-to-sdd.sh`) projeta **uma Feature por vez**, então rodar o drift
>   logo após projetar uma única `F-NN` vai listar o RF de toda *outra* feature como `missing_in_projection` —
>   esperado, não um defeito. Rode o drift contra a projeção **completa** (todas as features projetadas), ou leia a
>   lista `missing` como "RFs ainda não projetados".

A ferramenta é baseada em tags (ancorada em `RF-NN`), só-stdlib, e ciente de EN+pt-BR. Ela usa por padrão
`docs/requirements` ↔ `openspec`; passe `projection_dir="specs"` (ou `.specify`) para o Spec Kit. Rode-a após
cada projeção e de novo antes de `archive`/`implement`. Num **projeto consumidor** você pode plugá-la na CI como um
passo **consultivo não-bloqueante** (o próprio repo da skill não tem projeção, então não traz tal portão de CI):

```yaml
# consumer project — .github/workflows/quality.yml (advisory, never blocks)
- name: projection drift (advisory)
  run: |
    uv run python -c "from requirements_engineering_mcp.server import _check_projection_drift as c; \
      import json; r=c(); print(json.dumps(r, indent=2, ensure_ascii=False)); \
      print('::warning::drift' if not r['ok'] else 'in sync')"
  continue-on-error: true
```

---

## 6. Quando NÃO usar um framework

Não adicione um framework de SDD quando:

- o trabalho é puro descobrimento/validação de requisitos sem código ainda — esta skill sozinha é a ferramenta certa;
- o projeto é pequeno demais para amortizar o setup + overhead de token do framework;
- o time não tem loop de execução por agente (os frameworks presumem que um agente de código implementa a partir da spec).

Nesses casos, fique com a espinha `docs/` desta skill e pule a §3–§5 por completo.

---

## 7. Resumo

Esta skill é a **camada de metodologia e qualidade**; OpenSpec / Spec Kit são a **camada de execução**. Projete os
requisitos *para baixo* no framework, nunca deixe o framework ser dono do requisito. O modelo de delta do OpenSpec é
o encaixe mais natural para a disciplina de mudança/rastreabilidade desta skill; o `constitution.md` do Spec Kit é o
lar natural para as convenções duras e regras de ética. De um jeito ou de outro, o identificador `RF-NN` e o fraseado
EARS são o que carrega o rigor através da fronteira — preserve ambos. A ferramenta MCP `check_projection_drift`
(§5) mantém o round-trip honesto.

---

*Referências cruzadas: `05-convencoes-interpop.md` (regras duras, preservação de ID), `07-mudanca-rastreabilidade.md`
(RTM, gestão de mudança), `09-etica-sbc.md` (guard-rails de ética), `10-estrutura-projeto.md` (espinha docs/,
LEGACY-MONOLITH), `11-ears.md` (fraseado EARS), `../assets/project-to-sdd.sh` (scaffolder de projeção),
`../mcp-server/README.md` (`check_projection_drift`). Frameworks externos (links duráveis — repos podem mudar de lugar):
**OpenSpec** <https://github.com/Fission-AI/OpenSpec>, **GitHub Spec Kit** <https://github.com/github/spec-kit>.
Adotados aqui como uma ponte **opcional** na camada de execução.*
