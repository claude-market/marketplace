# Worked Example — Card Charging and Wallet Balance in the *"PagLeve"* Project

> Fictional but realistic case from the *"PagLeve"* project (Brazilian fintech — digital wallet that charges cards and holds user balance; Django 5 + DRF + React 19 + an external acquirer). Shows how a **payments-domain** feature maps to the skill's RE framework, with the domain differential made explicit: card-data protection (PCI), charge idempotency, reconciliation, anti-fraud limits, strong authentication, and an immutable audit trail. Reference commit: `a7f31c0` (feat(payments): cobrança idempotente por cartão tokenizado + trilha de auditoria).
>
> **Note on language preservation**: Feature, User Story, AC, FR, NFR, goal (G), and business-rule titles, as well as the BDD content, are kept in **pt-BR** because they are the actual identifiers used in the *"PagLeve"* repository, commits, OpenProject cards, and `CLAUDE.md` instructions. **Explanations, tables, and analysis are in en-CA**; **artifact content is in pt-BR**.

---

## 1. Context and problem

**Business problem**: *"PagLeve"* lets a user pay a *pedido* with a credit card and keeps the remaining money as wallet balance for later use. The first version stored, in its own database, the full card number plus the security code (CVV) "to make the next charge easier", and re-tried failed charges by simply firing the request again. Two real incidents followed: a duplicate charge on a customer whose first request timed out (the customer was billed twice for one *pedido*), and a security review flagging that storing CVV is forbidden by the card-network rules and turns the whole database into PCI scope.

**Diagnosis**: the feature mixed two undocumented-but-critical requirements that the happy-path spec never named — **a charge must never bill the customer twice for the same attempt**, and **the system must never persist card secrets**. Both are the kind of requirement that surfaces only when you ask "what is the worst money/legal outcome here?" (see [02-elicitacao.md §7](../references/02-elicitacao.md)). Once raised, they became explicit FRs, NFRs, and invariants.

---

## 2. Stakeholders

Applying Wiegers 2003 (see [01-fundamentos.md §5](../references/01-fundamentos.md)):

| Stakeholder | Interest |
|---|---|
| **Pagador (titular do cartão)** | Be charged exactly once per *pedido*; never have card secrets leaked; recover money on failure |
| **Lojista / dono do *pedido*** | Receive the value of a confirmed *pedido*; trust that a "paid" status is real money |
| **Fundador / dono do *"PagLeve"*** | No double-charge incidents; stay out of unnecessary PCI scope; survive an acquirer audit |
| **Adquirente (parceiro externo)** | Receive well-formed, idempotent charge requests; have every movement reconcile against its statement |
| **Time de antifraude** | Block charge floods and suspicious high-value operations before money moves |
| **Auditor / regulador (Bacen, PCI-QSA)** | Immutable, complete log of who touched which financial datum, when, and why |
| **Suporte ao cliente** | Explain to a customer what happened to a charge without ever reading the full card number |

---

## 3. AS-IS → TO-BE analysis

Applying the analysis from [08-analista-negocios.md §3](../references/08-analista-negocios.md):

### AS-IS (before commit a7f31c0)

```
Pagador → POST /payments/charge { pedido, numero_cartao, cvv, valor }
  → Sistema grava numero_cartao + cvv em texto no próprio banco
  → Sistema chama adquirente
  → Timeout na resposta → app re-tenta o mesmo POST
  → Adquirente processa a 2ª chamada como nova cobrança
  → Pagador é cobrado DUAS vezes pelo mesmo pedido
  → Saldo e extrato do adquirente divergem; ninguém detecta na hora
```

**Pains**:

- Card secret (CVV) and full PAN stored in the application database — forbidden by network rules, expands PCI scope to everything
- Re-tried charge produces a second real billing — no notion of "same attempt"
- No reconciliation: internal movements and the acquirer statement could silently diverge
- No record of who accessed a given customer's card data

### TO-BE

```
Pagador → POST /payments/charge
            Idempotency-Key: <chave-da-tentativa>
            { pedido, token_cartao, valor }
  → Sistema NUNCA recebe nem grava CVV; o número virou token ("cofre")
  → Mesma Idempotency-Key já vista → devolve o MESMO resultado, sem cobrar de novo
  → Chave nova → cobra uma vez, registra movimento rastreável ao pedido
  → Acesso ao dado financeiro entra na trilha de auditoria imutável
  → Conciliação diária confere cada movimento contra o extrato do adquirente
```

### GAP analysis

| Gap | Solution |
|---|---|
| CVV/PAN stored in app DB | NFR-01 + G-02: card secrets never persisted; PAN replaced by token, shown masked |
| Re-try bills twice | FR-02 + NFR-02: charge keyed by `Idempotency-Key`; same key returns same result |
| Internal balance vs acquirer statement can diverge | FR-04 + NFR-03: daily reconciliation; every movement traceable to a *pedido* |
| No anti-fraud ceiling / weak auth on sensitive ops | NFR-04 + NFR-05: block after N attempts; value above threshold requires 2nd factor |
| No record of financial-data access | NFR-06 + G-04: immutable audit trail on every access |
| Balance could go negative on race | G-01: balance invariant never below zero (atomic debit) |

---

## 4. Feature: Cobrança no cartão e guarda de saldo

**Feature description (client-deliverable, in pt-BR):**

Permite que o *pagador* pague um *pedido* com cartão de crédito e mantenha o troco como saldo na carteira do *"PagLeve"*. A cobrança é feita uma única vez por tentativa: se a mesma tentativa for reenviada (timeout, toque duplo, reprocessamento), o cliente nunca é cobrado duas vezes. Os dados sensíveis do cartão ficam protegidos — o sistema nunca guarda o código de segurança nem a trilha do cartão, substitui o número por um "cofre" (token) e sempre exibe o número mascarado. Todo movimento de dinheiro é rastreável até o *pedido* que o originou e bate com o extrato do adquirente na conciliação diária. Operações sensíveis passam por limite antifraude e, acima de um valor, por uma segunda confirmação de identidade. Todo acesso a dado financeiro é registrado de forma que não possa ser apagado nem alterado. O entregável ao cliente (*"Helena"*, fundadora/dona do projeto) é a garantia de que nenhum cliente é cobrado em duplicidade, nenhum segredo de cartão é armazenado e nenhum saldo fica negativo.

> This description is what goes on the OpenProject Feature card. It is **written in business language**, readable by any stakeholder — including the acquirer's auditor. The ACs below formalize the testable rules; BDD appears only in the User Stories (§5).

### 4.0 Goals (G) and Non-Functional Requirements (NFR)

> Domain differential. **Goals (G)** are invariants the system must never violate. **NFRs are always quantitative** with a measurement method; EARS phrasing is offered as the optional precision layer (see [11-ears.md](../references/11-ears.md)). The `[...]` convention links to detail.

#### 🎯 Goals (invariants)

| ID | Goal | Priority |
|---|---|---|
| `G-01` | Nenhum saldo de carteira fica negativo em nenhum momento. | 🔴 Imediata |
| `G-02` | Nenhum segredo de cartão (código de segurança, trilha, PIN) é armazenado em lugar algum do sistema. | 🔴 Imediata |
| `G-03` | Toda cobrança tem origem rastreável a um único *pedido*. | 🟠 Alta |
| `G-04` | Todo acesso a dado financeiro é registrado de forma imutável. | 🟠 Alta |

#### ⚙️ Non-Functional Requirements (quantitative)

| ID | NFR (business language) | Measurement | Priority |
|---|---|---|---|
| `RNF-01` | O número do cartão nunca é exibido por inteiro: no máximo os 4 últimos dígitos aparecem; o restante é mascarado. | Inspeção de payloads e telas; varredura de logs por PAN (0 ocorrências). | 🔴 Imediata |
| `RNF-02` | A mesma tentativa de cobrança (mesma chave de idempotência) resulta em no máximo **1** cobrança real, mesmo com reenvios. | Teste de reenvio: N=50 reenvios da mesma chave → 1 débito no adquirente. | 🔴 Imediata |
| `RNF-03` | Na conciliação diária, **100%** dos movimentos do dia batem com o extrato do adquirente; divergência > 0 abre alerta no mesmo dia. | Job diário compara movimentos × extrato; conta divergências. | 🟠 Alta |
| `RNF-04` | Após **5** tentativas de cobrança recusadas para o mesmo cartão em **10** minutos, o cartão é bloqueado para novas tentativas por **30** minutos. | Teste de carga de tentativas; verifica bloqueio na 6ª. | 🟠 Alta |
| `RNF-05` | Cobrança de valor acima de **R$ 2.000,00** exige uma segunda confirmação de identidade (2º fator) antes de mover dinheiro. | Teste com valor abaixo/acima do limite; verifica exigência do 2º fator. | 🟠 Alta |
| `RNF-06` | Todo acesso de leitura ou escrita a dado financeiro gera um registro de auditoria que não pode ser alterado nem apagado **[...]** | Tentativa de UPDATE/DELETE no registro de auditoria falha; append-only verificado. | 🟠 Alta |

> **RNF-02 in EARS (optional)**: `QUANDO uma requisição de cobrança chega com uma chave de idempotência já vista, O SISTEMA DEVE devolver o resultado da cobrança original sem acionar uma nova cobrança no adquirente.`
> **RNF-05 in EARS (optional)**: `SE o valor da cobrança for maior que R$ 2.000,00, ENTÃO O SISTEMA DEVE exigir uma segunda confirmação de identidade antes de mover dinheiro.`

### 4.1 Acceptance Criteria (declarative style)

11 ACs, **grouped by theme** (Rule 7 of [05-convencoes-interpop.md](../references/05-convencoes-interpop.md)). ACs with **`[...]`** must be read together with the detail in §4.2.

#### 📋 CA - Proteção dos dados do cartão

| ID | Description | Detail? |
|---|---|---|
| `CA01` | Ao tentar gravar o código de segurança (CVV), a trilha ou o PIN do cartão, o sistema rejeita a operação e nenhum segredo é persistido. | — |
| `CA02` | O número do cartão é substituído por um "cofre" (token) antes de qualquer persistência; o número original não fica guardado. | — |
| `CA03` | Em toda exibição (tela, recibo, log, suporte), o número do cartão aparece mascarado, no máximo com os 4 últimos dígitos. | — |

#### 📋 CA - Cobrança idempotente

| ID | Description | Detail? |
|---|---|---|
| `CA04` | Cada tentativa de cobrança carrega uma chave de idempotência; a mesma chave nunca gera mais de uma cobrança real **[...]** | ✅ |
| `CA05` | Ao receber a cobrança, o sistema responde com um dentre três resultados de negócio **[...]** | ✅ |
| `CA06` | A cobrança é transacional: se falhar entre registrar o movimento e atualizar o saldo, ambos são revertidos — nunca fica estado parcial. | — |

#### 📋 CA - Saldo, rastreabilidade e conciliação

| ID | Description | Detail? |
|---|---|---|
| `CA07` | O saldo da carteira nunca fica negativo; um débito que deixaria o saldo negativo é recusado. | — |
| `CA08` | Todo movimento de dinheiro aponta para exatamente um *pedido* de origem **[...]** | ✅ |
| `CA09` | A conciliação diária confere cada movimento contra o extrato do adquirente e sinaliza qualquer divergência. | — |

#### 📋 CA - Antifraude, autenticação forte e auditoria

| ID | Description | Detail? |
|---|---|---|
| `CA10` | Cobranças recusadas em sequence para o mesmo cartão levam a bloqueio temporário, e valores altos exigem segundo fator **[...]** | ✅ |
| `CA11` | Todo acesso a dado financeiro entra na trilha de auditoria imutável, com quem, quando e o quê. | — |

### 4.2 Detail of ACs with `[...]`

Each block below is what appears in the **item body** in OpenProject (AC Description field), following the `Regras a serem aplicadas:` + bullets convention.

#### CA04 — Detail

```
Regras a serem aplicadas:
- Toda requisição de cobrança traz uma chave de idempotência única da tentativa.
- Se a chave nunca foi vista, o sistema cobra uma vez e guarda o resultado associado à chave.
- Se a chave já foi vista, o sistema devolve o MESMO resultado anterior, sem acionar nova cobrança.
- Um reenvio por timeout, toque duplo ou reprocessamento NUNCA gera segunda cobrança.
```

#### CA05 — Detail

```
Regras a serem aplicadas:
- Quando o cartão é aceito e há autorização, o sistema confirma a cobrança (operação aceita) e move o dinheiro.
- Quando o cartão é recusado pelo adquirente, o sistema informa "Cobrança recusada pela operadora" e nenhum saldo é alterado.
- Quando a operação viola uma regra do PagLeve (sem 2º fator exigido, cartão bloqueado por antifraude, dado de cartão inválido), o sistema rejeita com a mensagem da regra violada e nenhum dinheiro se move.
- Em todos os casos de rejeição, nenhum movimento financeiro é criado e nenhum saldo é alterado.
```

> **Technical note (does not go on the CA05 card)**: the 3 business results map respectively to HTTP 201, 402 and 422 on `POST /api/v1/payments/charge`. This technical mapping is the responsibility of the Tasks (see §7), not the AC.

#### CA08 — Detail

```
Regras a serem aplicadas:
- Cada movimento de dinheiro (cobrança, estorno, uso de saldo) referencia exatamente um pedido de origem.
- Não existe movimento "órfão" sem pedido associado.
- O recibo do cliente e o relatório de conciliação derivam dessa relação movimento↔pedido.
- A relação é suficiente para reconstruir, a partir de um pedido, todos os movimentos que ele gerou.
```

#### CA10 — Detail

```
Regras a serem aplicadas:
- Após 5 cobranças recusadas para o mesmo cartão em 10 minutos, o cartão é bloqueado para novas tentativas por 30 minutos.
- Durante o bloqueio, novas tentativas com aquele cartão são recusadas pela regra antifraude, sem chamar o adquirente.
- Cobrança de valor acima de R$ 2.000,00 exige uma segunda confirmação de identidade antes de mover dinheiro.
- Se o segundo fator não for satisfeito, a cobrança é rejeitada e nenhum dinheiro se move.
```

#### RNF-06 — Detail

```
Regras a serem aplicadas:
- Toda leitura ou escrita de dado financeiro (cartão tokenizado, movimento, saldo) gera um registro de auditoria.
- O registro guarda quem acessou, quando, qual recurso e qual ação.
- O registro é append-only: tentativas de alterar ou apagar um registro de auditoria falham.
- A trilha é suficiente para um auditor externo reconstruir o histórico de acesso a um dado financeiro.
```

### 4.3 Technical annex — Idempotency resolution table

> **Note**: this annex is a **technical derivation** of CA04 + CA05 for whoever implements the charge service. It is not AC detail in the "Regras a serem aplicadas:" style — it is an exhaustive table. In a real project, this becomes a `pytest.mark.parametrize` test table.

```
Resolução de cobrança por (chave de idempotência, estado anterior)

       • (chave nova, sem cobrança)          → cobra 1x, grava resultado     → 201
       • (chave repetida, resultado=aceito)  → devolve resultado anterior     → 201 (idêntico)
       • (chave repetida, resultado=recusado)→ devolve recusa anterior        → 402 (idêntico)
       • (chave repetida, em processamento)  → aguarda/devolve mesmo resultado → sem 2ª cobrança
       • (chave nova, cartão bloqueado AF)   → recusa por antifraude          → 422
       • (chave nova, valor > R$2.000, s/2FA)→ exige 2º fator                 → 422
```

---

## 5. User Stories (with BDD)

### US 1 — Card secrets are never stored, number always masked

```
US Rejeitar persistência de CVV/trilha/PIN, tokenizar e exibir o cartão mascarado

Descrição (BDD):
  DADO que uma cobrança chega com dados de cartão
  QUANDO o sistema processa o cartão
  ENTÃO o código de segurança (CVV) nunca é gravado em lugar nenhum
  E o número do cartão é substituído por um token antes de qualquer persistência
  E uma varredura de logs e banco por número de cartão retorna 0 ocorrências
  E em qualquer exibição aparecem no máximo os 4 últimos dígitos

Relacionado a: CA01, CA02, CA03, RNF-01, G-02
Story Points: 5
```

### US 2 — Idempotent charge

```
US Cobrar uma única vez por tentativa via chave de idempotência

Descrição (BDD):
  Cenário 1: chave nova
  DADO que envio uma cobrança com a chave "k-123" pela primeira vez
  QUANDO faço POST /api/v1/payments/charge com Idempotency-Key: k-123
  ENTÃO o sistema retorna HTTP 201
  E o adquirente é cobrado exatamente 1 vez

  Cenário 2: reenvio por timeout (mesma chave)
  DADO que a cobrança com a chave "k-123" já foi processada
  QUANDO reenvio 50 vezes o POST com Idempotency-Key: k-123
  ENTÃO o sistema retorna sempre o MESMO resultado da cobrança original
  E o adquirente NÃO é cobrado uma segunda vez

Relacionado a: CA04, CA05, RNF-02
Story Points: 8
```

### US 3 — Charge is transactional

```
US Garantir que a cobrança é atômica (rollback em falha)

Descrição (BDD):
  DADO que a cobrança faz duas escritas (movimento + saldo da carteira)
  QUANDO uma das escritas falha (simulado via mock)
  ENTÃO ambas operações são revertidas
  E nenhum movimento parcial fica registrado
  E o saldo da carteira permanece consistente

Relacionado a: CA06
Story Points: 3
```

### US 4 — Balance never negative, every movement traces to a pedido

```
US Recusar débito que zera o saldo abaixo de zero e vincular movimento ao pedido

Descrição (BDD):
  Cenário 1: saldo nunca negativo
  DADO que a carteira tem saldo de R$ 30,00
  QUANDO um débito de R$ 50,00 é tentado
  ENTÃO o sistema recusa o débito
  E o saldo permanece R$ 30,00
  E nenhum movimento é criado

  Cenário 2: rastreabilidade ao pedido
  DADO que uma cobrança aceita gerou um movimento de dinheiro
  QUANDO consulto esse movimento
  ENTÃO ele referencia exatamente um pedido de origem
  E a partir do pedido consigo reconstruir todos os movimentos que ele gerou

Relacionado a: CA07, CA08, G-01, G-03
Story Points: 5
```

### US 5 — Daily reconciliation

```
US Conferir movimentos do dia contra o extrato do adquirente

Descrição (BDD):
  DADO que houve movimentos de dinheiro no dia
  QUANDO o job de conciliação roda
  ENTÃO 100% dos movimentos batem com o extrato do adquirente
  E qualquer divergência abre um alerta no mesmo dia

Relacionado a: CA09, RNF-03
Story Points: 5
```

### US 6 — Anti-fraud limit and strong authentication

```
US Bloquear cartão após recusas e exigir 2º fator em valor alto

Descrição (BDD):
  Cenário 1: bloqueio antifraude
  DADO que o mesmo cartão teve 5 cobranças recusadas em 10 minutos
  QUANDO a 6ª cobrança é tentada com esse cartão
  ENTÃO o sistema recusa por antifraude sem chamar o adquirente
  E o cartão fica bloqueado por 30 minutos

  Cenário 2: segundo fator em valor alto
  DADO que uma cobrança é de R$ 2.500,00
  QUANDO o pagador não satisfaz o segundo fator
  ENTÃO a cobrança é rejeitada
  E nenhum dinheiro se move

Relacionado a: CA10, RNF-04, RNF-05
Story Points: 5
```

### US 7 — Immutable audit trail

```
US Registrar acesso a dado financeiro de forma imutável

Descrição (BDD):
  DADO que um operador lê o cartão tokenizado de um cliente
  QUANDO o acesso acontece
  ENTÃO um registro de auditoria é criado com quem, quando, recurso e ação
  E uma tentativa de alterar ou apagar esse registro falha

Relacionado a: CA11, RNF-06, G-04
Story Points: 3
```

---

## 6. Applied validation (Sommerville 5 + Falbo 7)

Applying [06-validacao.md](../references/06-validacao.md):

| Check | Application |
|---|---|
| **Validity** (Sommerville) | Confirmed with the founder: "Yes — never bill twice, never store CVV, never go negative" |
| **Consistency** | CA04 (idempotência) and CA06 (transacional) são consistentes — o resultado guardado por chave é o do mesmo movimento atômico |
| **Completeness** | The initial set was missing CA07 (saldo negativo); discovered in review before coding, after a race-condition question |
| **Realism** | Implementable in Django 5 + DRF with a tokenization provider and the acquirer's idempotency support |
| **Verifiability** | Each AC has a corresponding pytest test in `tests/test_charge_idempotency.py` and `tests/test_card_protection.py` |
| **Complete (Falbo)** | ACs describe input (charge request + idempotency key), rule (resolution table), output (business result + balance state) |
| **Correct (Falbo)** | Validated with the founder and against the acquirer's PCI guidance |
| **Necessary (Falbo)** | Yes — two real incidents (double charge + CVV storage) motivated the change |
| **Prioritizable (Falbo)** | 🔴 Imediata for CA01/CA04 (legal + money risk); 🟠 Alta for reconciliation/audit |
| **Verifiable (Falbo)** | 17 specific tests passed (idempotency, masking, rollback, negative-balance, anti-fraud) |

---

## 7. Implemented traceability

Applying [07-mudanca-rastreabilidade.md](../references/07-mudanca-rastreabilidade.md):

```
Commit a7f31c0: feat(payments): cobrança idempotente por cartão tokenizado + trilha de auditoria
├─ apps/payments/models.py
│    ├─ CartaoTokenizado (guarda token + 4 últimos dígitos; NUNCA CVV/PAN)
│    ├─ Movimento (FK obrigatória para Pedido — G-03/CA08)
│    └─ Carteira.debitar(valor) → recusa se saldo - valor < 0 (G-01/CA07)
├─ apps/payments/services.py
│    ├─ cobrar(pedido, token, valor, idempotency_key) → ResultadoCobranca
│    │    ├─ resolve por idempotency_key (CA04/CA05 — tabela §4.3)
│    │    ├─ aplica limite antifraude + 2º fator (CA10/RNF-04/RNF-05)
│    │    └─ transação atômica movimento+saldo (CA06)
│    └─ conciliar(dia) → DivergenciaConciliacao[] (CA09/RNF-03)
├─ apps/payments/tokenization.py
│    └─ tokenizar(cartao) → rejeita gravação de CVV/trilha/PIN (CA01/CA02/G-02)
├─ apps/payments/audit.py
│    └─ AuditLog append-only (UPDATE/DELETE bloqueados — CA11/RNF-06/G-04)
├─ apps/payments/serializers.py
│    └─ número sempre mascarado (4 últimos dígitos — CA03/RNF-01)
├─ apps/payments/tests/test_charge_idempotency.py
│    ├─ test_chave_nova_cobra_uma_vez (CA04)
│    ├─ test_reenvio_mesma_chave_nao_cobra_de_novo (CA04/RNF-02)
│    ├─ test_tres_resultados_de_negocio (CA05 — 201/402/422)
│    └─ test_cobranca_rollback_em_falha (CA06)
├─ apps/payments/tests/test_card_protection.py
│    ├─ test_cvv_nunca_persistido (CA01/G-02)
│    ├─ test_numero_tokenizado_antes_de_persistir (CA02)
│    └─ test_numero_sempre_mascarado (CA03/RNF-01)
├─ apps/payments/tests/test_wallet.py
│    ├─ test_saldo_nunca_negativo (CA07/G-01)
│    └─ test_movimento_referencia_um_pedido (CA08/G-03)
└─ apps/payments/tests/test_fraud_audit.py
     ├─ test_bloqueio_apos_5_recusas (CA10/RNF-04)
     ├─ test_valor_alto_exige_segundo_fator (CA10/RNF-05)
     ├─ test_conciliacao_sinaliza_divergencia (CA09/RNF-03)
     └─ test_auditoria_append_only (CA11/RNF-06/G-04)
```

**Every AC and NFR has a traceable test**, every test describes a domain rule or invariant.

---

## 8. Ethical layer (*"SBC"* 002/2024)

Applying [09-etica-sbc.md](../references/09-etica-sbc.md):

| Principle | Application in the case |
|---|---|
| **§1.1 Well-being** | The customer is charged exactly once and keeps clear visibility of their balance and movements |
| **§1.2 Avoid harm** | A double charge and a card-data leak are concrete financial harms; idempotency + tokenization remove both |
| **§1.3 Honesty** | A "paid" status corresponds to real, reconciled money; the system does not overstate what was charged |
| **§1.4 Non-discrimination** | Anti-fraud limits apply by transaction behaviour, not by personal characteristics of the holder |
| **§2.5 Privacy** | Card secrets never persisted; PAN masked everywhere; access to financial data is audited (LGPD/PCI aligned) |
| **§2.9 Secure systems** | Defence in depth: tokenization (data) + idempotency (money) + atomic transaction + anti-fraud + immutable audit |
| **§3.6 Care when modifying** | Change preserved the happy path (single charge still works) and added the missing failure-path guarantees, all regression-tested |

**Ethical decision**: chose to **remove card secrets from the application database entirely** (tokenization provider) over **encrypting CVV in place**. Justification: storing CVV is forbidden by network rules regardless of encryption, and minimizing PCI scope is safer for customers than any in-house crypto. Trade-off (dependency on a tokenization provider) documented.

---

## 9. Lessons from the case (applicable to future *"PagLeve"* features)

1. **The happy-path spec hid two money-critical requirements** — "charge once per attempt" and "never store card secrets"; **making them explicit via ACs, NFRs and Goals** was the missing step
2. **Idempotency is a requirement, not an implementation detail** — it earns its own NFR (RNF-02), its own AC (CA04), and a resolution table; the original double-charge bug came from treating a re-try as "just retry"
3. **Goals (G) capture invariants** that no single AC owns — "balance never negative", "no card secret stored", "every charge traces to a pedido" — and every ≥2-write money operation inherits them
4. **NFRs must be quantitative** — "after 5 refusals in 10 minutes, block 30 minutes"; "value above R$ 2.000 requires 2nd factor" — a vague "be secure" is untestable
5. **Reconciliation is part of the requirement**, not an ops afterthought — if internal movements and the acquirer statement can diverge silently, "paid" means nothing
6. **Defence in depth** beats one barrier: tokenization + idempotency + atomic transaction + anti-fraud + immutable audit, each independent
7. **EARS phrasing on the riskiest NFRs** (RNF-02, RNF-05) removed ambiguity for the implementer without forcing the whole spec into EARS

---

## 10. Applying this template to next *"PagLeve"* features

For any new feature (e.g., "estorno parcial" or "saque para conta bancária"), reuse this structure:

1. **Stakeholders explicitly identified** — including the acquirer and the regulator/auditor
2. **AS-IS / TO-BE** documented with the **worst money/legal outcome** named (clear gap)
3. **Goals (G) as invariants** — what must never happen (no negative balance, no stored secret, no orphan movement)
4. **NFRs always quantitative** with a measurement method; EARS on the riskiest ones
5. **Declarative ACs with stable IDs** (`CA-ESTORNO-01`, ...), including a "behaviour-on-rejection" AC
6. **User Stories slicing ACs** into incremental slices with BDD in the description
7. **Validation against Falbo 7 + Sommerville 5** before coding
8. **Ethical layer**: concrete question — who can be financially harmed, and is any secret being stored?
9. **Defence in depth**: apply each money invariant in ≥2 independent layers (model + service + audit)
10. **Tests traceable to the ACs/NFRs/Goals** (not code-oriented tests); commit message reflects the requirement

In *"PagLeve"*-scale projects (small team handling real money), this level of RE ceremony **accelerates** delivery instead of slowing it down — because a silent double-charge or a stored CVV is far more expensive than the spec that prevents it.
