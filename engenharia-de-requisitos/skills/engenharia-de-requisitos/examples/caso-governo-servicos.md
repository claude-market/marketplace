# Worked Example — Agendamento de Atendimento Presencial in the *"Portal do Cidadão"* Project

> Fictional but realistic case from the *"Portal do Cidadão"* project (Brazilian municipal digital-government service; Django 5 + DRF + Next.js 15). Shows how a **public-sector** feature maps to the skill's RE framework — useful for teams building citizen-facing services where accessibility (*"eMAG"*/WCAG AA), data minimization (LGPD), audit trails, and non-digital fallback are not "nice-to-haves" but legal and ethical obligations. Reference commit (illustrative): `b7f3a90` (feat(agendamento): identidade confirmada + minimização LGPD + canal de baixa conectividade).
>
> **Note on language preservation**: Feature, User Story, AC, RF, RNF, and business-rule titles, as well as the BDD content, are kept in **pt-BR** because they mirror the identifiers a Brazilian municipal team would use in the repository, commits, backlog cards, and `CLAUDE.md` instructions. **Explanations, tables, and analysis are in en-CA**; **artifact content is in pt-BR**.

---

## 1. Context and problem

**Public-service problem**: the municipality offers presential services (emissão de 2ª via de documentos, marcação em postos de saúde) across several *"unidades de atendimento"*. Historically the citizen had to physically queue at dawn to get one of the limited daily slots — first-come, first-served, no remote option. The *"Portal do Cidadão"* aims to replace the dawn queue with an online appointment booking.

**Diagnosis**: a naive booking form would *solve the queue but create new exclusions*. An elderly citizen with low connectivity or no smartphone would simply be locked out of a service they are legally entitled to. Equally, a careless form would over-collect personal data (CPF, address, health condition) without declared purpose or retention limit — an LGPD violation waiting to happen. **The implicit requirement** here is that going digital must not narrow access nor weaken the citizen's rights — the kind of constraint ethnography and stakeholder analysis surface (see [02-elicitacao.md §7](../references/02-elicitacao.md)). Once discussed, it became explicit through the RNFs and business rules below.

---

## 2. Stakeholders

Applying Wiegers 2003 (see [01-fundamentos.md §5](../references/01-fundamentos.md)):

| Stakeholder | Interest |
|---|---|
| **Cidadão (geral)** | Book a slot remotely, without dawn queues, with a reliable confirmation |
| **Cidadão idoso / baixa conectividade** | Reach the service without depending on a fast connection or a smartphone; have a non-digital fallback |
| **Atendente da unidade** | Receive a clean, identity-confirmed schedule; not handle no-shows or duplicate bookings |
| **Gestor público da secretaria** | Reduce queues, prove transparency, comply with LGPD and accessibility law |
| **Encarregado de dados (DPO)** | Ensure each personal field has declared purpose, consent, and a retention deadline |
| **Auditor / controladoria** | Inspect a complete trail of who scheduled, changed, or cancelled what, and when |
| **Pessoa com deficiência** | Operate the whole flow by keyboard and screen reader, with sufficient contrast |

---

## 3. AS-IS → TO-BE analysis

Applying the analysis from [08-analista-negocios.md §3](../references/08-analista-negocios.md):

### AS-IS (before the *"Portal do Cidadão"*)

```
Cidadão → vai presencialmente à unidade de madrugada
  → pega senha física por ordem de chegada
  → vagas do dia esgotam; muitos voltam para casa sem atendimento
  → dado pessoal anotado em papel, sem prazo de descarte
  → idoso e quem mora longe são os mais penalizados
```

**Pains**:

- Access depends on physical presence at dawn — excludes the elderly, workers, and people far from the unit
- No remote confirmation; the citizen never knows if there will be a slot
- Personal data on paper, with no declared purpose nor retention limit
- No auditable record of who got served and why

### TO-BE

```
Cidadão → acessa o Portal (ou liga para a central — canal de fallback)
  → confirma identidade → escolhe serviço, unidade e horário disponível
  → recebe confirmação (com protocolo) por e-mail/SMS
  → coleta-se apenas o dado necessário, com finalidade declarada e prazo de retenção
  → toda ação fica registrada em trilha de auditoria consultável
```

### GAP analysis

| Gap | Solution |
|---|---|
| Booking with no identity confirmation enables fraud and no-shows | RF: confirmação de identidade obrigatória antes de reservar; G: "Nenhum agendamento sem confirmação de identidade do cidadão" |
| Form over-collects personal data with no purpose or deadline | RNF: minimização + RF de consentimento; G: "Dado pessoal coletado tem finalidade declarada e prazo de retenção" |
| Digital-only path excludes low-connectivity / non-smartphone citizens | RNF de disponibilidade + RF de canal de fallback (central telefônica) |
| Flow unusable by screen reader / keyboard only | RNF de acessibilidade (*"eMAG"*/WCAG AA) + CA de acessibilidade |
| Administrative actions leave no inspectable trace | RNF de trilha de auditoria; toda ação administrativa registrada e consultável |

---

## 4. Feature: Agendamento de Atendimento Presencial

**Feature description (client-deliverable, in pt-BR):**

Permite que o cidadão reserve, de forma remota, um horário para atendimento presencial em uma unidade do município (por exemplo, emissão de 2ª via de documento ou marcação em posto de saúde), substituindo a fila de madrugada. O agendamento só é efetivado após a confirmação da identidade do cidadão, e a confirmação é enviada com um número de protocolo. O sistema coleta apenas os dados estritamente necessários para o atendimento, sempre com finalidade declarada, consentimento explícito e prazo de retenção definido — o cidadão pode consultar e solicitar a exclusão dos seus dados. Para não excluir quem tem internet ruim ou não usa smartphone, existe um canal de fallback (central telefônica) que registra o mesmo agendamento no sistema. Todo o fluxo é operável por teclado e leitor de tela, com contraste adequado (*"eMAG"*/WCAG AA). Toda ação administrativa (criar, remarcar, cancelar, atender) fica registrada em uma trilha de auditoria consultável pela controladoria.

> This description is what goes on the backlog Feature card. It is **written in business language**, readable by any stakeholder — including a gestor público who is not technical. The ACs below formalize the testable rules; BDD appears only in the User Stories (§5).

### 4.1 Acceptance Criteria (declarative style)

11 ACs, **grouped by theme** (Rule 7 of [05-convencoes-interpop.md](../references/05-convencoes-interpop.md)). ACs with **`[...]`** at the end of the title must be read together with the detail in §4.2.

#### 📋 CA - Identidade e reserva do horário

| ID | Description | Detail? |
|---|---|---|
| `CA01` | Nenhum horário é reservado sem que a identidade do cidadão tenha sido confirmada antes **[...]** | ✅ |
| `CA02` | Um mesmo cidadão não pode ter duas reservas ativas para o mesmo serviço na mesma unidade **[...]** | ✅ |
| `CA03` | Ao confirmar a reserva, o cidadão recebe um protocolo e uma confirmação por um canal escolhido (e-mail ou SMS). | — |
| `CA04` | Um horário já reservado por outro cidadão deixa de aparecer como disponível. | — |

#### 📋 CA - Privacidade e dados do cidadão (LGPD)

| ID | Description | Detail? |
|---|---|---|
| `CA05` | O sistema coleta apenas os dados necessários ao atendimento; nenhum campo extra é exigido **[...]** | ✅ |
| `CA06` | Cada dado pessoal coletado tem finalidade declarada e prazo de retenção visível ao cidadão no momento da coleta **[...]** | ✅ |
| `CA07` | O cidadão pode consultar e solicitar a exclusão dos seus dados pessoais a qualquer momento **[...]** | ✅ |

#### 📋 CA - Acessibilidade e inclusão

| ID | Description | Detail? |
|---|---|---|
| `CA08` | Todo o fluxo de agendamento é operável apenas por teclado e anunciado corretamente por leitor de tela **[...]** | ✅ |
| `CA09` | Existe um canal de fallback não-digital (central telefônica) que registra o mesmo agendamento no sistema **[...]** | ✅ |

#### 📋 CA - Transparência e trilha de auditoria

| ID | Description | Detail? |
|---|---|---|
| `CA10` | Toda ação administrativa sobre um agendamento (criar, remarcar, cancelar, atender) fica registrada com autor, data e motivo **[...]** | ✅ |
| `CA11` | A trilha de auditoria é consultável pela controladoria e não pode ser editada nem apagada por um atendente comum. | — |

### 4.2 Detail of ACs with `[...]`

Each block below is what appears in the **item body** in the backlog (AC Description field), following the `Regras a serem aplicadas:` + bullets convention.

#### CA01 — Detail

```
Regras a serem aplicadas:
- A identidade do cidadão é confirmada antes de qualquer reserva ser criada.
- Se a confirmação de identidade falhar, nenhum horário é bloqueado nem reservado.
- O horário só sai do conjunto de disponíveis depois que a reserva é efetivada com identidade confirmada.
- A reserva fica vinculada à identidade confirmada, permitindo consulta e cancelamento posteriores pelo próprio cidadão.
```

#### CA02 — Detail

```
Regras a serem aplicadas:
- Um cidadão com reserva ativa para o mesmo serviço na mesma unidade não pode criar uma segunda reserva ativa.
- A tentativa de reserva duplicada é recusada com a mensagem "Você já possui um agendamento ativo para este serviço nesta unidade".
- Reservas para serviços diferentes (ou unidades diferentes) são permitidas em paralelo.
- Após o atendimento, o cancelamento ou a remarcação, a reserva deixa de contar como ativa e uma nova pode ser criada.
```

#### CA05 — Detail

```
Regras a serem aplicadas:
- O formulário solicita apenas o necessário ao atendimento escolhido (ex.: nome, documento de identificação, contato para confirmação).
- Nenhum campo de dado sensível é exigido quando o serviço não o requer.
- Quando um serviço de saúde exige dado sensível (ex.: especialidade), esse dado é solicitado de forma destacada e justificada.
- Campos opcionais ficam claramente marcados como opcionais; o cidadão pode concluir o agendamento sem preenchê-los.
```

#### CA06 — Detail

```
Regras a serem aplicadas:
- No momento da coleta, cada dado exibe para que será usado (finalidade) e por quanto tempo será guardado (prazo de retenção).
- O cidadão dá consentimento explícito antes de a coleta ser efetivada.
- A finalidade declarada não pode ser ampliada depois sem novo consentimento.
- Esgotado o prazo de retenção, o dado é descartado ou anonimizado automaticamente.
```

#### CA07 — Detail

```
Regras a serem aplicadas:
- O cidadão tem uma área onde consulta todos os dados pessoais que o sistema guarda sobre ele.
- O cidadão pode solicitar a exclusão dos seus dados; a solicitação é registrada e atendida no prazo legal.
- A exclusão não apaga registros que a lei exige preservar (ex.: trilha de auditoria de um atendimento já realizado), mas anonimiza o vínculo pessoal quando possível.
- A resposta ao pedido de acesso/exclusão é confirmada ao cidadão por um canal de contato.
```

#### CA08 — Detail

```
Regras a serem aplicadas:
- Todo controle do fluxo (escolher serviço, unidade, horário, confirmar) é alcançável e acionável apenas pelo teclado, em ordem lógica.
- Cada campo e botão tem rótulo anunciado corretamente pelo leitor de tela.
- Mensagens de erro e de sucesso são anunciadas ao leitor de tela, não apenas exibidas visualmente.
- O contraste entre texto e fundo atende ao mínimo exigido para leitura confortável.
```

> **Technical note (does not go on the CA08 card)**: the contrast minimum maps to a ratio of at least 4.5:1 for normal text (WCAG AA), and screen-reader announcements map to `aria-live` regions plus correct `label` association. This technical mapping is the responsibility of the Tasks (see §7 Traceability), not the AC.

#### CA09 — Detail

```
Regras a serem aplicadas:
- Existe uma central telefônica onde um atendente registra o agendamento em nome do cidadão.
- O agendamento criado pela central é o mesmo registro do sistema — aparece na mesma agenda da unidade e gera o mesmo protocolo.
- A confirmação de identidade pela central segue uma verificação equivalente à do canal digital.
- Nenhum cidadão fica sem acesso ao serviço por não ter internet adequada ou smartphone.
```

#### CA10 — Detail

```
Regras a serem aplicadas:
- Toda criação, remarcação, cancelamento e marcação de atendimento gera um registro na trilha de auditoria.
- Cada registro guarda quem fez a ação, quando, e o motivo (quando aplicável, ex.: motivo do cancelamento).
- O registro é imutável após criado: correções entram como novos registros, não sobrescrevem.
- A trilha permite reconstruir a história completa de um agendamento.
```

### 4.3 Technical annex — Decision table for `pode_reservar(cidadao, servico, unidade)`

> **Note**: this annex is a **technical derivation** of CA01 + CA02 for whoever implements the booking guard. It is not AC detail in the "Regras a serem aplicadas:" style — it is an exhaustive decision table. In a real project, this becomes a comment in the code or a test table (`pytest.mark.parametrize`).

```
Decision table pode_reservar(cidadao, servico, unidade) → (permitido, motivo)

  • identidade NÃO confirmada                                   → (False, "identidade_nao_confirmada")
  • identidade confirmada, sem reserva ativa, há vaga           → (True,  "ok")
  • identidade confirmada, já tem reserva ativa mesmo serviço   → (False, "duplicada")
  • identidade confirmada, reserva ativa em OUTRO serviço       → (True,  "ok")
  • identidade confirmada, sem vaga no horário                  → (False, "sem_vaga")
  • reserva anterior já atendida/cancelada (não ativa)          → (True,  "ok")
```

---

## 5. User Stories (with BDD)

### US 1 — Confirm identity before reserving the slot

```
US Confirmar identidade do cidadão antes de reservar o horário

Descrição (BDD):
  DADO que o cidadão escolheu serviço, unidade e horário
  E a identidade dele AINDA NÃO foi confirmada
  QUANDO ele tenta confirmar a reserva
  ENTÃO o sistema NÃO cria a reserva
  E o horário permanece disponível para outros cidadãos
  E o sistema solicita a confirmação de identidade

  Cenário 2: Identidade confirmada
  DADO que a identidade do cidadão foi confirmada
  E há vaga no horário escolhido
  QUANDO ele confirma a reserva
  ENTÃO o sistema cria a reserva vinculada à identidade
  E o horário deixa de aparecer como disponível
  E o cidadão recebe um protocolo de confirmação

Relacionado a: CA01, CA03, CA04
Story Points: 5
```

### US 2 — Block duplicate active booking

```
US Impedir reserva ativa duplicada para o mesmo serviço na mesma unidade

Descrição (BDD):
  DADO que o cidadão já tem reserva ativa para "2ª via de documento" na unidade "Centro"
  QUANDO ele tenta criar outra reserva para o mesmo serviço na mesma unidade
  ENTÃO o sistema recusa e exibe "Você já possui um agendamento ativo para este serviço nesta unidade"
  MAS uma reserva para "marcação em posto de saúde" na mesma unidade é criada normalmente

Relacionado a: CA02
Story Points: 3
```

### US 3 — Collect only what is necessary, with declared purpose and retention

```
US Coletar dado mínimo com finalidade declarada e prazo de retenção

Descrição (BDD):
  DADO que o cidadão preenche o formulário de agendamento
  QUANDO um dado pessoal é solicitado
  ENTÃO o sistema exibe a finalidade e o prazo de retenção daquele dado
  E só efetiva a coleta após consentimento explícito
  E nenhum campo além do necessário ao serviço é exigido

Relacionado a: CA05, CA06
Story Points: 5
```

### US 4 — Citizen accesses and deletes their own data

```
US Permitir ao cidadão consultar e solicitar exclusão dos próprios dados

Descrição (BDD):
  DADO que o cidadão acessa a área de privacidade
  QUANDO ele solicita ver os dados que o sistema guarda sobre ele
  ENTÃO o sistema lista todos os dados pessoais armazenados

  Cenário 2: Pedido de exclusão
  DADO que o cidadão solicitou a exclusão dos seus dados
  QUANDO o pedido é processado
  ENTÃO os dados pessoais são excluídos ou anonimizados
  E os registros que a lei exige preservar têm o vínculo pessoal anonimizado
  E o cidadão recebe a confirmação do atendimento ao pedido

Relacionado a: CA07
Story Points: 5
```

### US 5 — Whole flow operable by keyboard and screen reader

```
US Tornar o fluxo de agendamento acessível por teclado e leitor de tela

Descrição (BDD):
  DADO que o cidadão navega usando apenas o teclado
  QUANDO ele percorre o fluxo de agendamento
  ENTÃO todos os controles são alcançáveis e acionáveis em ordem lógica
  E cada campo e botão é anunciado corretamente pelo leitor de tela
  E as mensagens de erro e de sucesso são anunciadas, não apenas exibidas

Relacionado a: CA08
Story Points: 5
```

### US 6 — Non-digital fallback channel

```
US Registrar agendamento pela central telefônica (canal de baixa conectividade)

Descrição (BDD):
  DADO que um cidadão sem internet adequada liga para a central
  QUANDO o atendente registra o agendamento em nome do cidadão
  ENTÃO o sistema cria o mesmo registro de agendamento, com o mesmo protocolo
  E o agendamento aparece na agenda da unidade igual ao do canal digital
  E a identidade do cidadão é confirmada por verificação equivalente

Relacionado a: CA09
Story Points: 3
```

### US 7 — Immutable audit trail of administrative actions

```
US Registrar toda ação administrativa em trilha de auditoria imutável

Descrição (BDD):
  DADO que um atendente cancela um agendamento informando o motivo
  QUANDO a ação é executada
  ENTÃO um registro é criado na trilha com autor, data e motivo
  E o registro não pode ser editado nem apagado por um atendente comum
  E a controladoria consegue reconstruir toda a história do agendamento

Relacionado a: CA10, CA11
Story Points: 3
```

---

## 6. Applied validation (Sommerville 5 + Falbo 7)

Applying [06-validacao.md](../references/06-validacao.md):

| Check | Application |
|---|---|
| **Validity** (Sommerville) | Confirmed with the gestor and DPO: "Yes, going digital cannot exclude the elderly nor over-collect data" |
| **Consistency** | CA09 (fallback) and CA01 (identity) are consistent — the central confirms identity by an equivalent verification |
| **Completeness** | The initial set lacked CA07 (access/deletion right); discovered in review with the DPO before coding |
| **Realism** | Implementable in Django 5 + DRF + Next.js 15 without external dependency; fallback reuses the same booking service |
| **Verifiability** | Each AC has a corresponding test in `tests/test_agendamento.py` and `tests/test_acessibilidade.py` |
| **Complete (Falbo)** | ACs describe input (booking request), rule (identity + minimization + access), output (reservation + protocol + audit record) |
| **Correct (Falbo)** | Validated with the gestor público, the DPO, and an accessibility reviewer |
| **Necessary (Falbo)** | Yes — legal obligation (LGPD + accessibility law) and real exclusion risk |
| **Prioritizable (Falbo)** | 🔴 Imediata for CA01/CA06/CA08 (legal/ethical), 🟠 Alta for CA09, 🟡 Normal for CA03 |
| **Verifiable (Falbo)** | Automated accessibility checks + booking tests pass before release |

---

## 7. Implemented traceability

Applying [07-mudanca-rastreabilidade.md](../references/07-mudanca-rastreabilidade.md):

```
Commit b7f3a90: feat(agendamento): identidade confirmada + minimização LGPD + canal de baixa conectividade
├─ apps/agendamento/services.py
│    ├─ pode_reservar(cidadao, servico, unidade) → (bool, motivo)
│    │    └─ exige identidade confirmada e ausência de reserva ativa duplicada (CA01, CA02)
│    ├─ reservar(cidadao, servico, unidade, horario) → Agendamento
│    │    └─ cria reserva, emite protocolo, envia confirmação (CA03, CA04)
│    └─ registrar_via_central(atendente, cidadao, ...) → Agendamento (CA09)
├─ apps/privacidade/models.py
│    ├─ DadoColetado.finalidade / .prazo_retencao (CA06)
│    └─ Consentimento.registrar(cidadao, finalidade) (CA06)
├─ apps/privacidade/services.py
│    ├─ exportar_dados_do_cidadao(cidadao) (CA07)
│    └─ excluir_ou_anonimizar(cidadao) → preserva trilha legal (CA07)
├─ apps/auditoria/models.py
│    └─ RegistroAuditoria (append-only; sem update/delete para atendente) (CA10, CA11)
├─ web/components/agendamento/ (Next.js)
│    └─ navegação por teclado + aria-live + contraste AA (CA08)
├─ apps/agendamento/tests/test_agendamento.py
│    ├─ test_nao_reserva_sem_identidade_confirmada (CA01)
│    ├─ test_horario_some_apos_reserva (CA04)
│    ├─ test_reserva_duplicada_recusada (CA02)
│    ├─ test_servico_diferente_permitido (CA02)
│    ├─ test_protocolo_e_confirmacao_enviados (CA03)
│    └─ test_central_cria_mesmo_registro (CA09)
├─ apps/privacidade/tests/test_lgpd.py
│    ├─ test_coleta_minima_sem_campo_extra (CA05)
│    ├─ test_finalidade_e_retencao_exibidas (CA06)
│    ├─ test_descarte_apos_prazo_retencao (CA06)
│    ├─ test_cidadao_consulta_proprios_dados (CA07)
│    └─ test_exclusao_anonimiza_preservando_trilha (CA07)
├─ apps/auditoria/tests/test_auditoria.py
│    ├─ test_acao_administrativa_gera_registro (CA10)
│    └─ test_atendente_nao_edita_nem_apaga_trilha (CA11)
└─ web/tests/test_acessibilidade.py
     ├─ test_fluxo_navegavel_por_teclado (CA08)
     └─ test_contraste_minimo_AA (CA08)
```

**Every AC has a traceable test**, every test describes a domain rule.

### RNF (sempre quantitativos + método de medição; EARS opcional)

| ID | RNF | Quantitative target + measurement | EARS (optional) |
|---|---|---|---|
| `RNF-01` | Acessibilidade | 100% dos fluxos críticos navegáveis por teclado; contraste de texto normal ≥ 4.5:1; 0 violação crítica no auditor automático (*"eMAG"*/WCAG AA). Medição: axe-core no CI + revisão manual com leitor de tela. | While um cidadão navega só por teclado, the *"Portal do Cidadão"* shall manter todos os controles alcançáveis e anunciados. |
| `RNF-02` | Privacidade / minimização | 0 campo coletado sem finalidade e prazo declarados; dado descartado/anonimizado em até 24 h após o prazo de retenção. Medição: inventário de dados auditado + job de expurgo verificado em teste. | When o prazo de retenção de um dado é atingido, the *"Portal do Cidadão"* shall descartar ou anonimizar o dado em até 24 h. |
| `RNF-03` | Disponibilidade / inclusão | Disponibilidade do serviço de agendamento ≥ 99.5% mensal; canal de fallback telefônico disponível em 100% do horário de atendimento. Medição: monitor de uptime + registro de operação da central. | When o canal digital está indisponível, the *"Portal do Cidadão"* shall manter o agendamento operável pela central telefônica. |
| `RNF-04` | Trilha de auditoria | 100% das ações administrativas registradas; trilha append-only consultável em ≤ 3 s por agendamento. Medição: cobertura de testes de auditoria + medição de tempo de consulta. | When uma ação administrativa ocorre sobre um agendamento, the *"Portal do Cidadão"* shall registrar autor, data e motivo de forma imutável. |

### G (regras de negócio / invariantes globais)

| ID | Regra global |
|---|---|
| `G-01` | Nenhum agendamento sem confirmação de identidade do cidadão. |
| `G-02` | Todo dado pessoal coletado tem finalidade declarada e prazo de retenção. |
| `G-03` | Nenhum cidadão fica sem acesso ao serviço por falta de internet ou smartphone (fallback garantido). |
| `G-04` | Toda ação administrativa é registrada de forma imutável e consultável pela controladoria. |

---

## 8. Ethical layer (*"SBC"* 002/2024)

Applying [09-etica-sbc.md](../references/09-etica-sbc.md):

| Principle | Application in the case |
|---|---|
| **§1.1 Well-being** | Replacing the dawn queue with remote booking reduces hardship, especially for the elderly and distant residents |
| **§1.2 Avoid harm** | Identity confirmation prevents fraudulent bookings that would deny slots to legitimate citizens |
| **§1.3 Honesty** | Each personal field declares purpose and retention; nothing is collected silently |
| **§1.4 Non-discrimination** | The non-digital fallback guarantees that low-connectivity citizens are not second-class users |
| **§2.9 Secure systems** | Defence in depth: identity guard (service) + minimization (privacy model) + append-only audit trail |
| **§3.6 Care when modifying** | The fallback channel writes to the same booking service, so future changes cannot silently exclude the phone path |

**Ethical decision**: chose a **non-digital fallback as a first-class requirement** (CA09 + RNF-03) over a **digital-only MVP** that would have shipped faster. Justification: a public service may not exclude citizens for lack of connectivity — inclusion outranks delivery speed here. Trade-off documented.

---

## 9. Lessons from the case (applicable to future *"Portal do Cidadão"* features)

1. **Going digital is not automatically inclusive** — without CA09 (fallback), the portal would have *narrowed* access for the people who needed it most
2. **LGPD is a requirement, not an afterthought** — purpose + retention + consent + access/deletion belong in the ACs (CA05..CA07), not in a privacy policy nobody reads
3. **Accessibility has a measurable target** — RNF-01 (keyboard 100%, contrast ≥ 4.5:1, 0 critical axe violation) turns "be accessible" into something a CI pipeline can fail on
4. **The audit trail is part of the requirement** — public accountability means every administrative action is reconstructable (CA10/CA11), and the trail must be append-only
5. **A business rule (G) outranks a screen** — G-01 (no booking without identity) and G-03 (no one excluded) are invariants every future feature inherits
6. **Identity confirmation came from a risk, not a screen** — making it explicit as CA01 prevented a whole class of fraud and no-shows before a line was coded

---

## 10. Applying this template to next *"Portal do Cidadão"* features

For any new feature (e.g., "consulta de protocolo de atendimento"), reuse this structure:

1. **Stakeholders explicitly identified** — and always include the most-excluded citizen (elderly, low connectivity, disability)
2. **AS-IS / TO-BE** documented (clear gap), naming who today is left out
3. **Declarative ACs with stable IDs** (`CA-PROTO-01`, `CA-PROTO-02`, ...), grouped by theme
4. **User Stories slicing ACs into incremental slices** with BDD in the description
5. **RNFs always quantitative + measurement method**, optionally in EARS; never "be fast/accessible/private" without a number
6. **Business rules (G)** capture the invariants — identity, purpose-declared data, inclusion, auditability
7. **Validation against Falbo 7 + Sommerville 5** before coding, with the DPO and an accessibility reviewer in the room
8. **Ethical layer**: concrete question — who can be *excluded* or *harmed* by this feature, and what is the fallback?
9. **Defence in depth**: apply each invariant in ≥2 independent layers (service guard + data model + audit)
10. **Tests traceable to the ACs** (booking, LGPD, accessibility, audit), not code-oriented tests

In public-sector projects, this level of RE ceremony is not bureaucracy — it is how the team **proves** to citizens, the DPO, and the controladoria that the service is inclusive, lawful, and accountable by design.
