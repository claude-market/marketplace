# Worked Example — Card Charging and Wallet Balance in the *"PagLeve"* Project

> Caso fictício, mas realista, do projeto *"PagLeve"* (fintech brasileira — carteira digital que cobra cartões e guarda saldo do usuário; Django 5 + DRF + React 19 + um adquirente externo). Mostra como uma funcionalidade do **domínio de pagamentos** se mapeia ao framework de ER da skill, com o diferencial de domínio tornado explícito: proteção dos dados do cartão (PCI), idempotência de cobrança, conciliação, limites antifraude, autenticação forte e trilha de auditoria imutável. Commit de referência: `a7f31c0` (feat(payments): cobrança idempotente por cartão tokenizado + trilha de auditoria).
>
> **Nota sobre preservação de idioma**: os títulos de Feature, User Story, AC, FR, NFR, goal (G) e regra de negócio, assim como o conteúdo BDD, são mantidos em **pt-BR** porque são os identificadores reais usados no repositório do *"PagLeve"*, nos commits, nos cards do OpenProject e nas instruções do `CLAUDE.md`. **Explicações, tabelas e análise estão em en-CA**; **o conteúdo dos artefatos está em pt-BR**.

---

## 1. Contexto e problema

**Problema de negócio**: o *"PagLeve"* permite que um usuário pague um *pedido* com cartão de crédito e mantenha o dinheiro restante como saldo na carteira para uso posterior. A primeira versão guardava, no próprio banco de dados, o número completo do cartão mais o código de segurança (CVV) "para facilitar a próxima cobrança", e re-tentava cobranças que falhavam simplesmente disparando a requisição de novo. Seguiram-se dois incidentes reais: uma cobrança duplicada num cliente cuja primeira requisição deu timeout (o cliente foi cobrado duas vezes por um único *pedido*), e uma revisão de segurança apontando que armazenar CVV é proibido pelas regras das bandeiras de cartão e coloca todo o banco de dados dentro do escopo PCI.

**Diagnóstico**: a funcionalidade misturava dois requisitos não documentados, mas críticos, que a especificação de happy-path nunca nomeou — **uma cobrança jamais pode cobrar o cliente duas vezes pela mesma tentativa**, e **o sistema jamais pode persistir segredos do cartão**. Ambos são o tipo de requisito que só aparece quando se pergunta "qual é o pior desfecho financeiro/legal aqui?" (ver [02-elicitacao.md §7](../references/02-elicitacao.md)). Uma vez levantados, viraram FRs, NFRs e invariantes explícitos.

---

## 2. Stakeholders

Aplicando Wiegers 2003 (ver [01-fundamentos.md §5](../references/01-fundamentos.md)):

| Stakeholder | Interesse |
|---|---|
| **Pagador (titular do cartão)** | Ser cobrado exatamente uma vez por *pedido*; nunca ter segredos do cartão vazados; recuperar o dinheiro em caso de falha |
| **Lojista / dono do *pedido*** | Receber o valor de um *pedido* confirmado; confiar que um status "pago" é dinheiro de verdade |
| **Fundador / dono do *"PagLeve"*** | Nenhum incidente de cobrança duplicada; ficar fora de escopo PCI desnecessário; sobreviver a uma auditoria do adquirente |
| **Adquirente (parceiro externo)** | Receber requisições de cobrança bem-formadas e idempotentes; ter cada movimento conciliando contra o seu extrato |
| **Time de antifraude** | Bloquear enxurradas de cobrança e operações suspeitas de alto valor antes que o dinheiro se mova |
| **Auditor / regulador (Bacen, PCI-QSA)** | Log imutável e completo de quem tocou em qual dado financeiro, quando e por quê |
| **Suporte ao cliente** | Explicar a um cliente o que aconteceu com uma cobrança sem nunca ler o número completo do cartão |

---

## 3. Análise AS-IS → TO-BE

Aplicando a análise de [08-analista-negocios.md §3](../references/08-analista-negocios.md):

### AS-IS (antes do commit a7f31c0)

```
Pagador → POST /payments/charge { pedido, numero_cartao, cvv, valor }
  → Sistema grava numero_cartao + cvv em texto no próprio banco
  → Sistema chama adquirente
  → Timeout na resposta → app re-tenta o mesmo POST
  → Adquirente processa a 2ª chamada como nova cobrança
  → Pagador é cobrado DUAS vezes pelo mesmo pedido
  → Saldo e extrato do adquirente divergem; ninguém detecta na hora
```

**Dores**:

- Segredo do cartão (CVV) e PAN completo armazenados no banco da aplicação — proibido pelas regras das bandeiras, expande o escopo PCI para tudo
- Cobrança re-tentada produz uma segunda cobrança real — sem noção de "mesma tentativa"
- Sem conciliação: movimentos internos e o extrato do adquirente poderiam divergir silenciosamente
- Nenhum registro de quem acessou os dados de cartão de um dado cliente

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

### Análise de GAP

| Gap | Solução |
|---|---|
| CVV/PAN armazenados no banco da app | NFR-01 + G-02: segredos do cartão nunca persistidos; PAN substituído por token, exibido mascarado |
| Re-tentativa cobra duas vezes | FR-02 + NFR-02: cobrança chaveada por `Idempotency-Key`; mesma chave devolve mesmo resultado |
| Saldo interno vs. extrato do adquirente podem divergir | FR-04 + NFR-03: conciliação diária; cada movimento rastreável a um *pedido* |
| Sem teto antifraude / autenticação fraca em operações sensíveis | NFR-04 + NFR-05: bloqueia após N tentativas; valor acima do limite exige 2º fator |
| Nenhum registro de acesso a dado financeiro | NFR-06 + G-04: trilha de auditoria imutável em todo acesso |
| Saldo poderia ficar negativo numa corrida | G-01: invariante de saldo nunca abaixo de zero (débito atômico) |

---

## 4. Feature: Cobrança no cartão e guarda de saldo

**Feature description (client-deliverable, in pt-BR):**

Permite que o *pagador* pague um *pedido* com cartão de crédito e mantenha o troco como saldo na carteira do *"PagLeve"*. A cobrança é feita uma única vez por tentativa: se a mesma tentativa for reenviada (timeout, toque duplo, reprocessamento), o cliente nunca é cobrado duas vezes. Os dados sensíveis do cartão ficam protegidos — o sistema nunca guarda o código de segurança nem a trilha do cartão, substitui o número por um "cofre" (token) e sempre exibe o número mascarado. Todo movimento de dinheiro é rastreável até o *pedido* que o originou e bate com o extrato do adquirente na conciliação diária. Operações sensíveis passam por limite antifraude e, acima de um valor, por uma segunda confirmação de identidade. Todo acesso a dado financeiro é registrado de forma que não possa ser apagado nem alterado. O entregável ao cliente (*"Helena"*, fundadora/dona do projeto) é a garantia de que nenhum cliente é cobrado em duplicidade, nenhum segredo de cartão é armazenado e nenhum saldo fica negativo.

> Esta descrição é o que vai no card de Feature do OpenProject. Está **escrita em linguagem de negócio**, legível por qualquer stakeholder — inclusive o auditor do adquirente. Os ACs abaixo formalizam as regras testáveis; o BDD aparece só nas User Stories (§5).

### 4.0 Goals (G) and Non-Functional Requirements (NFR)

> Diferencial de domínio. **Goals (G)** são invariantes que o sistema nunca pode violar. **NFRs são sempre quantitativos** com um método de medição; a fraseologia EARS é oferecida como camada opcional de precisão (ver [11-ears.md](../references/11-ears.md)). A convenção `[...]` aponta para o detalhe.

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

> **RNF-02 em EARS (opcional)**: `QUANDO uma requisição de cobrança chega com uma chave de idempotência já vista, O SISTEMA DEVE devolver o resultado da cobrança original sem acionar uma nova cobrança no adquirente.`
> **RNF-05 em EARS (opcional)**: `SE o valor da cobrança for maior que R$ 2.000,00, ENTÃO O SISTEMA DEVE exigir uma segunda confirmação de identidade antes de mover dinheiro.`

### 4.1 Critérios de Aceitação (estilo declarativo)

11 ACs, **agrupados por tema** (Regra 7 de [05-convencoes-interpop.md](../references/05-convencoes-interpop.md)). ACs com **`[...]`** devem ser lidos junto com o detalhe em §4.2.

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

### 4.2 Detalhe dos ACs com `[...]`

Cada bloco abaixo é o que aparece no **corpo do item** no OpenProject (campo AC Description), seguindo a convenção `Regras a serem aplicadas:` + bullets.

#### CA04 — Detalhe

```
Regras a serem aplicadas:
- Toda requisição de cobrança traz uma chave de idempotência única da tentativa.
- Se a chave nunca foi vista, o sistema cobra uma vez e guarda o resultado associado à chave.
- Se a chave já foi vista, o sistema devolve o MESMO resultado anterior, sem acionar nova cobrança.
- Um reenvio por timeout, toque duplo ou reprocessamento NUNCA gera segunda cobrança.
```

#### CA05 — Detalhe

```
Regras a serem aplicadas:
- Quando o cartão é aceito e há autorização, o sistema confirma a cobrança (operação aceita) e move o dinheiro.
- Quando o cartão é recusado pelo adquirente, o sistema informa "Cobrança recusada pela operadora" e nenhum saldo é alterado.
- Quando a operação viola uma regra do PagLeve (sem 2º fator exigido, cartão bloqueado por antifraude, dado de cartão inválido), o sistema rejeita com a mensagem da regra violada e nenhum dinheiro se move.
- Em todos os casos de rejeição, nenhum movimento financeiro é criado e nenhum saldo é alterado.
```

> **Nota técnica (não vai no card do CA05)**: os 3 resultados de negócio mapeiam respectivamente para HTTP 201, 402 e 422 em `POST /api/v1/payments/charge`. Esse mapeamento técnico é responsabilidade das Tasks (ver §7), não do AC.

#### CA08 — Detalhe

```
Regras a serem aplicadas:
- Cada movimento de dinheiro (cobrança, estorno, uso de saldo) referencia exatamente um pedido de origem.
- Não existe movimento "órfão" sem pedido associado.
- O recibo do cliente e o relatório de conciliação derivam dessa relação movimento↔pedido.
- A relação é suficiente para reconstruir, a partir de um pedido, todos os movimentos que ele gerou.
```

#### CA10 — Detalhe

```
Regras a serem aplicadas:
- Após 5 cobranças recusadas para o mesmo cartão em 10 minutos, o cartão é bloqueado para novas tentativas por 30 minutos.
- Durante o bloqueio, novas tentativas com aquele cartão são recusadas pela regra antifraude, sem chamar o adquirente.
- Cobrança de valor acima de R$ 2.000,00 exige uma segunda confirmação de identidade antes de mover dinheiro.
- Se o segundo fator não for satisfeito, a cobrança é rejeitada e nenhum dinheiro se move.
```

#### RNF-06 — Detalhe

```
Regras a serem aplicadas:
- Toda leitura ou escrita de dado financeiro (cartão tokenizado, movimento, saldo) gera um registro de auditoria.
- O registro guarda quem acessou, quando, qual recurso e qual ação.
- O registro é append-only: tentativas de alterar ou apagar um registro de auditoria falham.
- A trilha é suficiente para um auditor externo reconstruir o histórico de acesso a um dado financeiro.
```

### 4.3 Anexo técnico — Tabela de resolução de idempotência

> **Nota**: este anexo é uma **derivação técnica** do CA04 + CA05 para quem implementa o serviço de cobrança. Não é detalhe de AC no estilo "Regras a serem aplicadas:" — é uma tabela exaustiva. Num projeto real, isto vira uma tabela de teste `pytest.mark.parametrize`.

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

## 6. Validação aplicada (Sommerville 5 + Falbo 7)

Aplicando [06-validacao.md](../references/06-validacao.md):

| Check | Aplicação |
|---|---|
| **Validade** (Sommerville) | Confirmado com a fundadora: "Sim — nunca cobrar duas vezes, nunca guardar CVV, nunca ficar negativo" |
| **Consistência** | CA04 (idempotência) e CA06 (transacional) são consistentes — o resultado guardado por chave é o do mesmo movimento atômico |
| **Completude** | Ao conjunto inicial faltava CA07 (saldo negativo); descoberto em revisão antes de codificar, após uma pergunta sobre condição de corrida |
| **Realismo** | Implementável em Django 5 + DRF com um provedor de tokenização e o suporte a idempotência do adquirente |
| **Verificabilidade** | Cada AC tem um teste pytest correspondente em `tests/test_charge_idempotency.py` e `tests/test_card_protection.py` |
| **Completo (Falbo)** | Os ACs descrevem entrada (requisição de cobrança + chave de idempotência), regra (tabela de resolução), saída (resultado de negócio + estado do saldo) |
| **Correto (Falbo)** | Validado com a fundadora e contra a orientação PCI do adquirente |
| **Necessário (Falbo)** | Sim — dois incidentes reais (cobrança duplicada + armazenamento de CVV) motivaram a mudança |
| **Priorizável (Falbo)** | 🔴 Imediata para CA01/CA04 (risco legal + financeiro); 🟠 Alta para conciliação/auditoria |
| **Verificável (Falbo)** | 17 testes específicos passaram (idempotência, mascaramento, rollback, saldo negativo, antifraude) |

---

## 7. Rastreabilidade implementada

Aplicando [07-mudanca-rastreabilidade.md](../references/07-mudanca-rastreabilidade.md):

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

**Todo AC e NFR tem um teste rastreável**, todo teste descreve uma regra de domínio ou invariante.

---

## 8. Camada ética (*"SBC"* 002/2024)

Aplicando [09-etica-sbc.md](../references/09-etica-sbc.md):

| Princípio | Aplicação no caso |
|---|---|
| **§1.1 Bem-estar** | O cliente é cobrado exatamente uma vez e mantém visibilidade clara do seu saldo e movimentos |
| **§1.2 Evitar dano** | Uma cobrança duplicada e um vazamento de dados de cartão são danos financeiros concretos; idempotência + tokenização eliminam ambos |
| **§1.3 Honestidade** | Um status "pago" corresponde a dinheiro real e conciliado; o sistema não superestima o que foi cobrado |
| **§1.4 Não-discriminação** | Limites antifraude se aplicam por comportamento da transação, não por características pessoais do titular |
| **§2.5 Privacidade** | Segredos do cartão nunca persistidos; PAN mascarado em todo lugar; acesso a dado financeiro é auditado (alinhado a LGPD/PCI) |
| **§2.9 Sistemas seguros** | Defesa em profundidade: tokenização (dado) + idempotência (dinheiro) + transação atômica + antifraude + auditoria imutável |
| **§3.6 Cuidado ao modificar** | A mudança preservou o happy path (cobrança única ainda funciona) e adicionou as garantias de caminho de falha que faltavam, todas com teste de regressão |

**Decisão ética**: optou-se por **remover totalmente os segredos do cartão do banco da aplicação** (provedor de tokenização) em vez de **cifrar o CVV no lugar**. Justificativa: armazenar CVV é proibido pelas regras das bandeiras independentemente de criptografia, e minimizar o escopo PCI é mais seguro para os clientes do que qualquer criptografia caseira. Trade-off (dependência de um provedor de tokenização) documentado.

---

## 9. Lições do caso (aplicáveis a futuras funcionalidades do *"PagLeve"*)

1. **A especificação de happy-path escondia dois requisitos money-critical** — "cobrar uma vez por tentativa" e "nunca armazenar segredos do cartão"; **torná-los explícitos via ACs, NFRs e Goals** foi o passo que faltava
2. **Idempotência é um requisito, não um detalhe de implementação** — merece seu próprio NFR (RNF-02), seu próprio AC (CA04) e uma tabela de resolução; o bug original de cobrança duplicada veio de tratar uma re-tentativa como "só retentar"
3. **Goals (G) capturam invariantes** que nenhum AC isolado possui — "saldo nunca negativo", "nenhum segredo de cartão armazenado", "toda cobrança rastreável a um pedido" — e toda operação de dinheiro com ≥2 escritas as herda
4. **NFRs devem ser quantitativos** — "após 5 recusas em 10 minutos, bloquear por 30 minutos"; "valor acima de R$ 2.000 exige 2º fator" — um vago "ser seguro" é intestável
5. **Conciliação faz parte do requisito**, não é um detalhe de operação posterior — se movimentos internos e o extrato do adquirente podem divergir silenciosamente, "pago" não significa nada
6. **Defesa em profundidade** vence uma única barreira: tokenização + idempotência + transação atômica + antifraude + auditoria imutável, cada uma independente
7. **Fraseologia EARS nos NFRs mais arriscados** (RNF-02, RNF-05) removeu a ambiguidade para quem implementa sem forçar toda a especificação para EARS

---

## 10. Aplicando este template às próximas funcionalidades do *"PagLeve"*

Para qualquer nova funcionalidade (ex.: "estorno parcial" ou "saque para conta bancária"), reutilize esta estrutura:

1. **Stakeholders explicitamente identificados** — incluindo o adquirente e o regulador/auditor
2. **AS-IS / TO-BE** documentado com o **pior desfecho financeiro/legal** nomeado (gap claro)
3. **Goals (G) como invariantes** — o que nunca pode acontecer (sem saldo negativo, sem segredo armazenado, sem movimento órfão)
4. **NFRs sempre quantitativos** com um método de medição; EARS nos mais arriscados
5. **ACs declarativos com IDs estáveis** (`CA-ESTORNO-01`, ...), incluindo um AC de "comportamento na rejeição"
6. **User Stories fatiando ACs** em fatias incrementais com BDD na descrição
7. **Validação contra Falbo 7 + Sommerville 5** antes de codificar
8. **Camada ética**: pergunta concreta — quem pode ser financeiramente prejudicado, e algum segredo está sendo armazenado?
9. **Defesa em profundidade**: aplique cada invariante de dinheiro em ≥2 camadas independentes (model + service + audit)
10. **Testes rastreáveis aos ACs/NFRs/Goals** (não testes orientados a código); a mensagem de commit reflete o requisito

Em projetos da escala do *"PagLeve"* (time pequeno lidando com dinheiro real), esse nível de cerimônia de ER **acelera** a entrega em vez de atrasá-la — porque uma cobrança duplicada silenciosa ou um CVV armazenado é muito mais caro do que a especificação que os previne.
