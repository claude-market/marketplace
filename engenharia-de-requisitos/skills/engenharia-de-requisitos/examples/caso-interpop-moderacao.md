# Worked Example — Ban Hierarchy in the *"Interpop"* Project

> Real case from the *"Interpop"* project (Brazilian editorial of *"Soft Power"*; Django 5 + DRF + React 19). Shows how an **already implemented** feature maps to the skill's RE framework — useful for auditing pre-existing specifications or as a template for new features in the same project. Reference commit: `1e0241e` (feat(moderation): dev é superadmin — único que bane/desbane admins).
>
> **Note on language preservation**: Feature, User Story, AC, FR, NFR, and business-rule titles, as well as the BDD content, are kept in **pt-BR** because they are the actual identifiers used in the *"Interpop"* repository, commits, OpenProject cards, and `CLAUDE.md` instructions. **Explanations, tables, and analysis are in en-CA**; **artifact content is in pt-BR**.

---

## 1. Context and problem

**Editorial-political problem**: *"Interpop"* has the editorial hierarchy `dev > admin > editor > user`. The initial moderation version let any admin ban another admin. This created real risk: in an editorial team with ≥2 admins, an abusive admin could administratively "decapitate" another admin before being confronted. Or worse: an admin under external coercion banning the dev.

**Diagnosis**: the power relation for banning did NOT mirror the declared editorial hierarchy. **It was an implicit, undocumented requirement** — the kind ethnography reveals (see [02-elicitacao.md §7](../references/02-elicitacao.md)). Once the case was discussed, it became explicit.

---

## 2. Stakeholders

Applying Wiegers 2003 (see [01-fundamentos.md §5](../references/01-fundamentos.md)):

| Stakeholder | Interest |
|---|---|
| **Dev (project owner/creator)** | Ensure no admin can decapitate the hierarchy |
| **Editorial admin** | Be able to ban editors/users who abuse, while protected from banning by another admin |
| **Editor** | Be able to request bans via BanRequest, without the ability to execute directly |
| **User (reader)** | Not be unjustly banned; have a review channel |
| **Banned** | Have clarity on what happened; potential contestation channel |
| **External auditor** (hypothetical) | Complete logs of who banned whom, when, and why |

---

## 3. AS-IS → TO-BE analysis

Applying the analysis from [08-analista-negocios.md §3](../references/08-analista-negocios.md):

### AS-IS (before commit 1e0241e)

```
Admin1 → POST /moderation/bans/ { user: Admin2, reason: "..." }
  → System accepts
  → Admin2 banned (loses access, loses power)
  → Dev finds out later (via monitoring or complaint)
```

**Pains**:

- Declared editorial hierarchy did not match the technical hierarchy
- Admin under external pressure could ban other admins / the dev
- No formal process for "how an admin is banned"

### TO-BE

```
Admin1 → POST /moderation/bans/ { user: Admin2 }
  → System REJECTS (400)
  → Hierarchy: only dev bans admin

Admin1 → POST /moderation/bans/ { user: Editor1 }
  → System accepts
  → Editor1 banned
```

### GAP analysis

| Gap | Solution |
|---|---|
| `is_banned` lives in one place; `Ban` in another; they could diverge | NFR: atomic transaction in `ban_user` (ADR-012) |
| Idempotency: re-banning after unban broke the UNIQUE constraint | FR: `update_or_create` reactivates the existing Ban |
| Hierarchy is not expressed in code | FR: relational method `can_be_banned_by(actor)` on the User model |
| No regression test | NFR: ≥90% coverage in `apps.moderation` |

---

## 4. Feature: Hierarquia de Banimento

**Feature description (client-deliverable, in pt-BR):**

Define quem pode banir e desbanir quem dentro da equipe editorial do *"Interpop"*. Implementa a hierarquia `dev > admin > editor > user` como uma matriz de permissões aplicada de forma consistente em todas as operações de banimento e desbanimento — sejam elas executadas pela interface pública (moderação direta), pela aprovação de uma solicitação de banimento aberta por um editor, ou pelas ações equivalentes na interface administrativa. O entregável ao cliente (*"Gabriel"*, dev/dono do projeto) é a garantia de que nenhum administrador pode "decapitar" outro administrador nem o próprio dev — mesmo sob coação externa ou em caso de credenciais comprometidas. A regra vale simetricamente para banimento e desbanimento, com idempotência preservada quando um usuário é re-banido após desbanimento (reativa o registro existente em vez de criar duplicata).

> This description is what goes on the OpenProject Feature card (or equivalent). It is **written in business language**, readable by any stakeholder. The ACs below formalize the testable rules; BDD appears only in the User Stories (§5).

### 4.1 Acceptance Criteria (declarative style)

9 ACs, **grouped by theme** (Rule 7 of [05-convencoes-interpop.md](../references/05-convencoes-interpop.md)). ACs with **`[...]`** at the end of the title must be read together with the detail in §4.2.

#### 📋 CA - Hierarquia de banimento

| ID | Description | Detail? |
|---|---|---|
| `CA01` | Dev é imune a banimento por qualquer outro usuário, incluindo outro dev. | — |
| `CA02` | Administrador só pode ser banido por um dev **[...]** | ✅ |
| `CA03` | Editor e usuário comum podem ser banidos por administrador ou por dev **[...]** | ✅ |
| `CA04` | Nenhum usuário pode banir a si mesmo, em qualquer papel. | — |

#### 📋 CA - Comportamento da operação de banimento

| ID | Description | Detail? |
|---|---|---|
| `CA05` | A regra de hierarquia de banimento se aplica também ao desbanimento **[...]** | ✅ |
| `CA06` | Ao receber a operação de banimento, o sistema responde com um dentre três resultados de negócio **[...]** | ✅ |
| `CA07` | O banimento é idempotente quanto ao histórico do usuário **[...]** | ✅ |
| `CA08` | O banimento é transacional. Se ocorrer falha entre registrar o banimento e atualizar a marcação de "banido" no perfil do usuário, ambas as operações devem ser revertidas — o usuário não pode ficar num estado inconsistente. | — |

#### 📋 CA - Fluxo de aprovação via solicitação (BanRequest)

| ID | Description | Detail? |
|---|---|---|
| `CA09` | O fluxo de solicitação de banimento (BanRequest) continua intacto: editores podem abrir solicitações que admin/dev aprovam ou rejeitam, com idempotência preservada **[...]** | ✅ |

### 4.2 Detail of ACs with `[...]`

Each block below is what appears in the **item body** in OpenProject (AC Description field), following the `Regras a serem aplicadas:` + bullets convention.

#### CA02 — Detail

```
Regras a serem aplicadas:
- Outro administrador não pode banir administrador (mesmo papel, hierarquia horizontal não permite).
- Administrador não pode banir a si mesmo (regra geral CA04 prevalece).
- Editor não tem permissão de operar a moderação de administradores; a tentativa é rejeitada.
- Apenas dev (papel mais alto da hierarquia) pode aplicar banimento a administrador.
```

#### CA03 — Detail

```
Regras a serem aplicadas:
- Editor pode ser banido por administrador ou por dev.
- Usuário comum pode ser banido por administrador ou por dev.
- Editor NÃO bane outro editor (hierarquia horizontal não permite).
- Usuário comum NÃO bane ninguém (papel mais baixo da hierarquia).
```

#### CA05 — Detail

```
Regras a serem aplicadas:
- A regra de quem-pode-banir-quem (CA01..CA04) vale igualmente para o desbanimento.
- Se um dev aplicou banimento a um administrador, apenas outro dev (ou o mesmo) pode desbanir.
- Administrador comum NÃO pode desfazer banimento que foi aplicado por dev a outro administrador.
- A política existe para evitar que o subordinado reverta a decisão do superior.
```

#### CA06 — Detail

```
Regras a serem aplicadas:
- Quando o usuário tem permissão e a hierarquia é respeitada, o sistema confirma o banimento (operação aceita).
- Quando a hierarquia é violada (por exemplo, administrador tentando banir outro administrador), o sistema rejeita com a mensagem "Operação não permitida pela hierarquia editorial".
- Quando o usuário não tem permissão de moderação (não é administrador nem dev), o sistema rejeita com a mensagem "Você não tem permissão para moderar".
- Em todos os casos de rejeição, nenhum registro de banimento é criado e nenhum perfil de usuário é alterado.
```

> **Technical note (does not go on the CA06 card)**: the 3 business results above are implemented respectively as HTTP 201, 400, and 403 on the `POST /api/v1/moderation/bans/` endpoint. This technical mapping is the responsibility of the Tasks (see §7 Traceability), not the AC.

#### CA07 — Detail

```
Regras a serem aplicadas:
- Re-banir um usuário previamente banido e depois desbanido NÃO cria um banimento duplicado: o registro existente é reativado.
- Ao reativar, o registro herda o novo motivo informado e o novo administrador que aplicou.
- O histórico do usuário fica coerente: 1 registro de banimento por relação usuário↔administrador, com sequência ativo/inativo no tempo.
```

#### CA09 — Detail

```
Regras a serem aplicadas:
- Editor pode abrir uma solicitação de banimento (BanRequest fica em estado pendente).
- Administrador ou dev podem APROVAR a solicitação. A aprovação cria o banimento real seguindo a mesma hierarquia (CA01..CA04). Se a hierarquia for violada na aprovação, a aprovação falha.
- Administrador ou dev podem REJEITAR a solicitação. Nesse caso, a solicitação fica marcada como rejeitada e nenhum banimento é criado.
- Aprovar uma solicitação que já foi aprovada anteriormente retorna o banimento existente, sem criar duplicata (idempotência).
```

### 4.3 Technical annex — Exhaustive matrix of the `can_be_banned_by` method

> **Note**: this annex is a **technical derivation** of CA02 + CA04 for whoever implements the `User.can_be_banned_by(actor)` method. It is not AC detail in the "Regras a serem aplicadas:" style — it is an exhaustive truth table. In a real project, this becomes a comment in the code or a test table (`pytest.mark.parametrize`).

```
Exhaustive matrix can_be_banned_by(actor) → bool

       • dev_user.can_be_banned_by(admin_user)   → False
       • dev_user.can_be_banned_by(dev2)         → False  (dev immune even to another dev)
       • dev_user.can_be_banned_by(dev_user)     → False  (no one bans themselves)
       • admin_user.can_be_banned_by(dev_user)   → True
       • admin_user.can_be_banned_by(admin2)     → False
       • admin_user.can_be_banned_by(admin_user) → False
       • admin_user.can_be_banned_by(editor)     → False
       • editor.can_be_banned_by(admin_user)     → True
       • editor.can_be_banned_by(dev_user)       → True
       • editor.can_be_banned_by(other_editor)   → False
       • editor.can_be_banned_by(None)           → False
```

---

## 5. User Stories (with BDD)

### US 1 — Apply the hierarchy in the model

```
US Implementar can_be_banned_by no User como autoridade única de hierarquia

Descrição (BDD):
  DADO que o sistema tem usuários com diferentes roles
  QUANDO o método user.can_be_banned_by(actor) é chamado
  ENTÃO o resultado segue a matriz da hierarquia (CA01..CA04)

Relacionado a: CA01, CA02, CA03, CA04
Story Points: 3
```

### US 2 — Apply the hierarchy in the endpoint

```
US Endpoint POST /bans/ valida hierarquia antes de criar Ban

Descrição (BDD):
  DADO que o usuário autenticado é admin
  E o usuário alvo também é admin
  QUANDO faço POST /api/v1/moderation/bans/ com {user_id: alvo, reason: "x"}
  ENTÃO o sistema retorna HTTP 400
  E nenhum Ban é criado
  E o alvo.is_banned permanece False

  Cenário 2: Dev banindo admin
  DADO que o usuário autenticado é dev
  E o usuário alvo é admin
  QUANDO faço POST /api/v1/moderation/bans/ com {user_id: alvo}
  ENTÃO o sistema retorna HTTP 201
  E o alvo.is_banned se torna True

  Cenário 3: Admin banindo editor (regressão — comportamento antigo preservado)
  DADO que o usuário autenticado é admin
  E o usuário alvo é editor
  QUANDO faço POST /api/v1/moderation/bans/ com {user_id: alvo}
  ENTÃO o sistema retorna HTTP 201
  E o alvo.is_banned se torna True

Relacionado a: CA02, CA03, CA06
Story Points: 5
```

### US 3 — Ensure transactional atomicity

```
US Garantir que ban_user é atômico (rollback em falha)

Descrição (BDD):
  DADO que ban_user faz duas escritas (Ban + User.is_banned)
  QUANDO uma das escritas falha (simulado via mock)
  ENTÃO ambas operações são revertidas
  E o usuário NÃO fica num estado inconsistente

Relacionado a: CA08
Story Points: 2
```

### US 4 — Idempotency (re-ban after unban)

```
US ban_user reativa Ban existente em vez de criar duplicata

Descrição (BDD):
  DADO que um usuário foi banido (Ban registro X)
  E foi desbanido (X.is_active = False)
  QUANDO o usuário é banido de novo
  ENTÃO o mesmo Ban X é reativado (não criado novo)
  E X.reason é atualizado para o novo motivo
  E X.banned_by é atualizado para o novo admin
  E X.unbanned_by é zerado
  E o constraint UNIQUE não é violado

Relacionado a: CA07
Story Points: 3
```

### US 5 — Unban follows the same hierarchy

```
US Aplicar can_be_unbanned_by relacional

Descrição (BDD):
  DADO que um dev baniu um admin (Ban Y)
  QUANDO um admin comum tenta DELETE /bans/Y/
  ENTÃO o sistema retorna HTTP 403
  E o admin permanece banido

  DADO que um dev baniu um admin (Ban Y)
  QUANDO o mesmo dev (ou outro dev) faz DELETE /bans/Y/
  ENTÃO o sistema retorna HTTP 200 ou 204
  E o admin é desbanido

Relacionado a: CA05
Story Points: 3
```

---

## 6. Applied validation (Sommerville 5 + Falbo 7)

Applying [06-validacao.md](../references/06-validacao.md):

| Check | Application |
|---|---|
| **Validity** (Sommerville) | Confirmed in discussion with the dev: "Yes, we want exactly that an admin does not ban an admin" |
| **Consistency** | CA02 and CA09 are consistent — approve_ban_request reuses ban_user |
| **Completeness** | The initial set was missing CA04 (self-ban); discovered in review before coding |
| **Realism** | Implementable in Django 5 + DRF without external dependency |
| **Verifiability** | Each AC has a corresponding pytest test in `tests/test_ban_hierarchy.py` |
| **Complete (Falbo)** | ACs describe input (HTTP request), rule (matrix), output (HTTP status + User state) |
| **Correct (Falbo)** | Validated in conversation with the dev (sole stakeholder of the project) |
| **Necessary (Falbo)** | Yes — real risk of internal abuse |
| **Prioritizable (Falbo)** | High priority (commit was made immediately after the decision) |
| **Verifiable (Falbo)** | 13 specific tests passed (`test_ban_hierarchy.py`) |

---

## 7. Implemented traceability

Applying [07-mudanca-rastreabilidade.md](../references/07-mudanca-rastreabilidade.md):

```
Commit 1e0241e: feat(moderation): dev é superadmin — único que bane/desbane admins
├─ apps/users/models.py
│    ├─ can_be_banned_by(actor: User|None) → bool
│    └─ can_be_unbanned_by(actor: User|None) → bool
├─ apps/moderation/services.py
│    ├─ ban_user(target, admin, reason, trigger_message) → Ban
│    │    └─ raise PermissionDenied if not target.can_be_banned_by(admin)
│    ├─ unban_user(ban, admin) → Ban
│    │    └─ raise PermissionDenied if not ban.user.can_be_unbanned_by(admin)
│    └─ approve_ban_request(request_obj, admin, decision_note) → Ban
│         └─ calls ban_user (inherits hierarchy)
├─ apps/users/admin.py
│    └─ is_banned readonly (do not bypass the hierarchy via Django Admin)
├─ apps/moderation/tests/test_ban_hierarchy.py
│    ├─ test_can_be_banned_by_matrix (exhaustive model matrix)
│    ├─ test_dev_can_ban_admin (endpoint)
│    ├─ test_admin_cannot_ban_another_admin
│    ├─ test_admin_cannot_ban_dev
│    ├─ test_dev_cannot_ban_another_dev
│    ├─ test_admin_can_still_ban_editor (regression)
│    ├─ test_editor_cannot_reach_ban_endpoint (403)
│    ├─ test_admin_cannot_unban_dev_placed_ban_on_admin
│    ├─ test_dev_can_unban_admin
│    └─ test_admin_can_unban_editor
└─ apps/moderation/tests/test_services.py
     ├─ test_ban_user_creates_ban_and_flags_user
     ├─ test_ban_user_idempotent_reactivates_existing (CA07)
     └─ test_ban_user_rollback_on_failure (CA08)
```

**Every AC has a traceable test**, every test describes a domain rule.

---

## 8. Ethical layer (*"SBC"* 002/2024)

Applying [09-etica-sbc.md](../references/09-etica-sbc.md):

| Principle | Application in the case |
|---|---|
| **§1.1 Well-being** | The hierarchy protects the editorial team from internal abuse; protects readers from receiving inconsistent moderation |
| **§1.2 Avoid harm** | Unjust banning is grave reputational harm; strict hierarchy reduces the risk |
| **§1.3 Honesty** | The declared hierarchy (`dev > admin > editor > user`) now matches the implementation |
| **§1.4 Non-discrimination** | The hierarchy does not privilege anyone by personal characteristics; only by role |
| **§2.9 Secure systems** | Defence in depth: model (matrix) + endpoint (permission classes) + service (atomic transaction + hierarchy repeated as a last barrier) |
| **§3.6 Care when modifying** | Change preserved old behaviour: admin still bans editor/user (regression tested) |

**Ethical decision**: chose **rigid** hierarchy (admin never bans admin) over **flexible** hierarchy (admin quorum). Justification: small team (1 dev + 2 admins), quorum is not viable. Trade-off documented.

---

## 9. Lessons from the case (applicable to future *"Interpop"* features)

1. **Editorial hierarchy declared in CLAUDE.md** had become an implicit requirement; **making it explicit via ACs** was the missing step
2. **Defence in depth** beats isolated pre-conditions: model + endpoint + service, all validate
3. **BDD in pt-BR in the commit message** helps future review ("Regra: dev é imune; admin só por dev")
4. **Regression testing is part of the requirement** — the AC "admin still bans editor" must be explicit; otherwise a refactor may break it
5. **ADR-012 (atomic transaction)** became a cross-cutting architectural standard — every ≥2-write operation inherits from it
6. **Idempotency** came from a requirement (CA07) discovered in production (the original bug); recovering via rewriting ban_user was cheaper than handling the UNIQUE constraint at the caller

---

## 10. Applying this template to next *"Interpop"* features

For any new feature (e.g., "community-moderated comments"), reuse this structure:

1. **Stakeholders explicitly identified** (list of who is affected)
2. **AS-IS / TO-BE** documented (clear gap)
3. **Declarative ACs with stable IDs** (`CA-COMMENT-01`, `CA-COMMENT-02`, ...)
4. **User Stories slicing ACs into incremental slices** with BDD in the description
5. **Story Points via Planning Poker** (even solo, comparing with previous features)
6. **Validation against Falbo 7 + Sommerville 5** before coding
7. **Ethical layer**: concrete question — who can be harmed by this feature?
8. **Defence in depth**: apply invariant in ≥2 independent layers
9. **Tests traceable to the ACs** (not code-oriented tests)
10. **Commit message reflects the requirement**, not only the technical change

In *"Interpop"*-scale projects (solo + part-time + AI contribution), this level of RE ceremony **accelerates** delivery instead of slowing it down — because it eliminates silent rework at review.
