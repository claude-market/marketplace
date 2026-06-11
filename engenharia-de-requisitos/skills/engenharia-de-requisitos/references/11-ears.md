# 11 — EARS (Easy Approach to Requirements Syntax) — **optional precision layer**

> **When to use this reference**: when you need a requirement to be unambiguous, testable, and
> machine-parseable by an AI coding agent. EARS sits *between* the business-language `RF`/`RNF` catalog
> ([`01-fundamentos.md`](01-fundamentos.md)) and the executable Gherkin scenarios
> ([`04-bdd-criterios-aceitacao.md`](04-bdd-criterios-aceitacao.md)). It turns a fuzzy `RF` into a contract
> an LLM can implement and a tester can verify.

> 🟡 **OPTIONAL by design — read this before applying EARS.** EARS is a *capability you opt into*, not a
> rule the skill enforces. The mandatory spine is `RF` in **business language pt-BR** (no technical jargon in
> titles — `05-convencoes-interpop.md`, naming rule 2) + CAs + BDD. EARS is an **extra precision layer** added
> to the **body** of a requirement (or to its CAs) *when the payoff is worth the formality*. It **coexists**
> with the business enunciado; it does not replace it and never lands in the business title.
>
> **When NOT to use EARS:** early elicitation (statements are still fuzzy on purpose); requirements you are
> about to **validate with a non-technical stakeholder** (a *"cooperado"* reads "acompanhar meu saldo", not
> "THE SYSTEM SHALL"); purely educational/extension artifacts. **When EARS earns its keep:** handing a
> requirement to an AI implementer; capturing **edge cases / error behavior**; security/regulated requirements
> that must be exact; anything you want to trace mechanically `requirement → CA → test`.

---

## 1. Why EARS

Natural-language requirements fail in three predictable ways: ambiguity ("the system should be fast"),
missing triggers ("login is validated" — when?), and hidden states ("admins can delete" — always? only when
logged in?). EARS removes all three by forcing the statement into one of **five sentence templates** built
around a single obligation keyword (`SHALL` / pt-BR `DEVE`).

The payoff for an AI-driven workflow: an EARS statement maps almost 1:1 onto a Gherkin scenario and onto a
CA, so traceability becomes **mechanical** rather than interpretive.

This reference keeps the pt-BR identifiers (`RF`, `RNF`, `CA`, `G`) from `05-convencoes-interpop.md`. **EARS
is the *phrasing*; the acronym is the *identifier*. They coexist** — `RF-22` is the identity; its EARS line is
how you phrase it precisely.

---

## 2. The five patterns (EN keyword / pt-BR keyword)

| # | Pattern | EN skeleton | pt-BR skeleton | Use for |
|---|---------|-------------|----------------|---------|
| 1 | **Ubiquitous** | THE SYSTEM SHALL `<response>` | O SISTEMA DEVE `<resposta>` | Always-true properties, invariants |
| 2 | **Event-driven** | WHEN `<trigger>` THE SYSTEM SHALL `<response>` | QUANDO `<gatilho>` O SISTEMA DEVE `<resposta>` | Reaction to a discrete event |
| 3 | **State-driven** | WHILE `<state>` THE SYSTEM SHALL `<response>` | ENQUANTO `<estado>` O SISTEMA DEVE `<resposta>` | Behavior that holds during a state |
| 4 | **Unwanted behavior** | IF `<condition>` THEN THE SYSTEM SHALL `<response>` | SE `<condição>` ENTÃO O SISTEMA DEVE `<resposta>` | Errors, faults, edge cases |
| 5 | **Optional feature** | WHERE `<feature included>` THE SYSTEM SHALL `<response>` | ONDE `<recurso habilitado>` O SISTEMA DEVE `<resposta>` | Behavior gated behind a config/flag |

Patterns **combine** (the "complex" requirement): keywords stack in the order
`WHILE … WHEN … IF … THEN THE SYSTEM SHALL …` (pt-BR: `ENQUANTO … QUANDO … SE … ENTÃO O SISTEMA DEVE …`).

> **Keyword discipline**: exactly **one** `SHALL`/`DEVE` per statement → exactly one testable behavior.
> Never "should/must/will" or "deveria/pode". Two `SHALL`s = two requirements; split them.
>
> **Language choice**: in a pt-BR-first project, prefer the pt-BR keywords so the statement still reads to the
> team. The EN form exists for international/AI-tooling contexts. Pick one per project and stay consistent.

---

## 3. The five patterns, with examples

Examples are drawn from the *"Interpop"* domain (editorial moderation) to stay consistent with `examples/`.

### 3.1 Ubiquitous — standing property

```
RF-12  O SISTEMA DEVE armazenar senhas com hash Argon2id (fator de trabalho >= 3).
RNF-04 O SISTEMA DEVE servir todo artigo publicado sobre HTTPS.
```

Maps to an invariant CA — often a security/lint check rather than a behavioral scenario.

### 3.2 Event-driven — `QUANDO … O SISTEMA DEVE`

The most common pattern: a discrete trigger produces a response.

```
RF-21  QUANDO um editor submete um artigo para revisão
       O SISTEMA DEVE mover o artigo para a fila "pending-moderation".
RF-22  QUANDO um moderador aprova um artigo pendente
       O SISTEMA DEVE publicá-lo e notificar o autor.
```

Maps almost directly to Gherkin:

```gherkin
Funcionalidade: Submissão para moderação
  Cenário: Artigo enviado entra na fila
    Quando um editor submete um artigo para revisão
    Então o artigo é movido para a fila "pending-moderation"
```

### 3.3 State-driven — `ENQUANTO … O SISTEMA DEVE`

Behavior that must hold for the *duration* of a state, not just at an instant.

```
RF-30  ENQUANTO uma conta de usuário está suspensa
       O SISTEMA DEVE rejeitar todas as ações de publicar e comentar dessa conta.
RF-31  ENQUANTO a plataforma está em modo de manutenção somente-leitura
       O SISTEMA DEVE retornar HTTP 503 para todos os endpoints de escrita.
```

### 3.4 Unwanted behavior — `SE … ENTÃO O SISTEMA DEVE`

Reserved for errors, faults, and edge cases — the part most often forgotten in prose, and the highest-value
addition EARS brings.

```
RF-40  SE um moderador tenta aprovar um artigo que foi excluído
       ENTÃO O SISTEMA DEVE rejeitar a ação e exibir "artigo não existe mais".
RF-41  SE o login falha 5 vezes em 10 minutos
       ENTÃO O SISTEMA DEVE bloquear a conta por 15 minutos.
```

### 3.5 Optional feature — `ONDE … O SISTEMA DEVE`

Behavior that exists only when a feature/config is present (multi-tenant / white-label).

```
RF-50  ONDE o módulo white-label está habilitado
       O SISTEMA DEVE servir o domínio custom do tenant via delegação CNAME.
```

### 3.6 Complex (combined)

```
RF-60  ENQUANTO uma assinatura está ativa
       QUANDO a data de renovação é atingida
       SE o método de pagamento primário falha
       ENTÃO O SISTEMA DEVE tentar o método secundário antes de marcar a assinatura como vencida.
```

---

## 4. The pipeline: `RF` (negócio) → EARS → CA → Gherkin

EARS does **not** replace the business enunciado — it refines it inside the requirement body.

```
RF-22  (título de negócio, pt-BR, SEM jargão — fica no docs/requirements/RF/)
       "Aprovação de artigo publica e notifica o autor."
   │  precisão opcional ↓ (no corpo do RF, quando útil)
   ▼
EARS:  QUANDO um moderador aprova um artigo pendente
       O SISTEMA DEVE publicá-lo e notificar o autor.
   │  one DEVE → one CA group
   ▼
CA01:  Artigo aprovado fica publicamente visível.
CA02:  Autor recebe notificação de aprovação.
   │  cada CA → um ou mais Cenário
   ▼
Gherkin: Cenário "Aprovação publica e notifica autor"
```

> **CA IDs follow `05-convencoes-interpop.md`: `CANN` (`CA01`, `CA02`…) inside the Feature — no hyphen.**
> **Rule of thumb**: one EARS statement → one `CA` group → one or more `Cenário`. If a single EARS line
> explodes into many unrelated CAs, the requirement was under-decomposed — split it.

---

## 5. Anti-patterns checklist

Reject or rewrite any EARS statement that:

- [ ] uses "should/must/will" / "deveria/pode/irá" instead of `SHALL`/`DEVE`
- [ ] contains two or more `SHALL`/`DEVE` in one statement
- [ ] has a response with no measurable outcome ("ser amigável", "ser rápido")
- [ ] is event-driven but omits the `WHEN`/`QUANDO` trigger
- [ ] describes an error as a happy path (use `IF … THEN` / `SE … ENTÃO`)
- [ ] hides a precondition in prose instead of a `WHILE`/`WHERE` (`ENQUANTO`/`ONDE`) clause
- [ ] mixes solution detail (the "how") into the requirement (the "what")
- [ ] **lands EARS keywords in the RF/Feature business title** (EARS belongs in the body/CA, never the title)

---

## 6. EARS vs the rest of this skill

| Layer | Artifact | Lives in |
|-------|----------|----------|
| Catalog / identity (business language) | `RF-NN`, `RNF-NN` | `docs/requirements/` (`01-fundamentos.md`) |
| **Precise phrasing (optional)** | **EARS statement** | **inside the RF body — this file** |
| Testable rule | `CANN` | `docs/backlog/features/F-NN.md` (`04-bdd-criterios-aceitacao.md`) |
| Executable spec | `Cenário` (Gherkin) | `04-…` + `examples/template-user-story.feature` |
| Traceability | RTM | `07-mudanca-rastreabilidade.md` |

EARS **feeds** BDD, it does not replace it. Use EARS when capturing/specifying with precision; use Gherkin
when those requirements become executable acceptance tests.

---

## 7. Validation hook (MCP)

The MCP tool [`validate_ears(text)`](../mcp-server/README.md) flags non-EARS phrasing: missing `SHALL`/`DEVE`,
multiple obligation keywords, a missing trigger on a temporal sentence, weak/subjective words, and EARS
keywords leaking into a title. It turns the §5 checklist into an automated gate — **advisory**, matching the
optional nature of this layer.

---

*Sources: Mavin et al., "Easy Approach to Requirements Syntax (EARS)" (IEEE RE 2009); Alistair Mavin's EARS
Ruleset; cross-referenced with Sommerville Ch. 4 and Wiegers & Beatty Ch. 11. Notation aligned with the AWS
Kiro and GitHub Spec Kit 2026 spec-driven workflows — adopted here as an **optional** layer, consistent with
this skill's business-language-first, pt-BR convention.*
