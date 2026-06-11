# Exemplo Aplicado — Hierarquia de Banimento no Projeto Interpop

> Caso real do projeto Interpop (editorial brasileiro de Soft Power; Django 5 + DRF + React 19). Mostra como uma feature **já implementada** se mapeia para o framework de ER da skill — útil para auditar especificações pré-existentes ou para servir de molde a novas features no mesmo projeto. Commit referência: `1e0241e` (feat(moderation): dev é superadmin — único que bane/desbane admins).

---

## 1. Contexto e problema

**Problema editorial-político**: o Interpop tem hierarquia editorial `dev > admin > editor > user`. A versão inicial da moderação permitia que qualquer admin banisse outro admin. Isso criava risco real: numa equipe editorial com ≥2 admins, um admin abusivo poderia "decapitar" administrativamente outro admin antes de ser confrontado. Ou pior: admin sob coação externa banindo o dev.

**Diagnóstico**: a relação de poder no banimento NÃO refletia a hierarquia editorial declarada. **Era requisito implícito, não documentado** — o tipo que a etnografia revela (ver [02-elicitacao.md §7](../references/02-elicitacao.md)). Discutindo o caso, ficou explícito.

---

## 2. Stakeholders

Aplicando Wiegers 2003 (ver [01-fundamentos.md §5](../references/01-fundamentos.md)):

| Stakeholder | Interesse |
|---|---|
| **Dev (dono/criador do projeto)** | Garantir que nenhum admin possa decapitar a hierarquia |
| **Admin editorial** | Poder banir editores/users que abusam, mas estar protegido de banimento por outro admin |
| **Editor** | Poder solicitar banimentos via BanRequest, sem possibilidade de executar diretamente |
| **User (leitor)** | Não ser banido injustamente; ter via de revisão |
| **Banido** | Ter clareza sobre o que aconteceu; potencial via de contestação |
| **Auditor externo** (hipotético) | Logs completos de quem baniu quem, quando e por quê |

---

## 3. Análise AS-IS → TO-BE

Aplicando análise de [08-analista-negocios.md §3](../references/08-analista-negocios.md):

### AS-IS (antes do commit 1e0241e)

```
Admin1 → POST /moderation/bans/ { user: Admin2, reason: "..." }
  → Sistema aceita
  → Admin2 banido (perde acesso, perde poder)
  → Dev descobre depois (por monitoramento ou reclamação)
```

**Dores**:
- Hierarquia editorial declarada não correspondia à hierarquia técnica
- Admin sob pressão externa podia banir outros admins / o dev
- Não havia processo formal de "como admin é banido"

### TO-BE

```
Admin1 → POST /moderation/bans/ { user: Admin2 }
  → Sistema REJEITA (400)
  → Hierarquia: apenas dev bane admin

Admin1 → POST /moderation/bans/ { user: Editor1 }
  → Sistema aceita
  → Editor1 banido
```

### GAP analysis

| Gap | Solução |
|---|---|
| `is_banned` está num lugar; `Ban` está em outro; podem divergir | RNF: transação atômica em `ban_user` (ADR-012) |
| Idempotência: re-banir após unban quebrava UNIQUE constraint | RF: `update_or_create` reativa Ban existente |
| Hierarquia não está expressa em código | RF: método relacional `can_be_banned_by(actor)` no model User |
| Sem teste de regressão | RNF: cobertura ≥90% no `apps.moderation` |

---

## 4. Feature: Hierarquia de Banimento

**Descrição da Feature (entregável ao cliente, em pt-BR):**

Define quem pode banir e desbanir quem dentro da equipe editorial do Interpop. Implementa a hierarquia `dev > admin > editor > user` como uma matriz de permissões aplicada de forma consistente em todas as operações de banimento e desbanimento — sejam elas executadas pela interface pública (moderação direta), pela aprovação de uma solicitação de banimento aberta por um editor, ou pelas ações equivalentes na interface administrativa. O entregável ao cliente (Gabriel, dev/dono do projeto) é a garantia de que nenhum administrador pode "decapitar" outro administrador nem o próprio dev — mesmo sob coação externa ou em caso de credenciais comprometidas. A regra vale simetricamente para banimento e desbanimento, com idempotência preservada quando um usuário é re-banido após desbanimento (reativa o registro existente em vez de criar duplicata).

> Esta descrição é o que vai no card de Feature do OpenProject (ou equivalente). Ela é **escrita em linguagem de negócio**, lida por qualquer stakeholder. Os critérios de aceitação abaixo formalizam as regras testáveis; o BDD aparece só nas User Stories (§5).

### 4.1 Critérios de Aceitação (estilo declarativo)

9 CAs, **agrupados por tema** (Regra 7 de [05-convencoes-interpop.md](../references/05-convencoes-interpop.md)). CAs com **`[...]`** no fim do título precisam ser lidos junto com o detalhamento na §4.2.

#### 📋 CA - Hierarquia de banimento

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA01` | Dev é imune a banimento por qualquer outro usuário, incluindo outro dev. | — |
| `CA02` | Administrador só pode ser banido por um dev **[...]** | ✅ |
| `CA03` | Editor e usuário comum podem ser banidos por administrador ou por dev **[...]** | ✅ |
| `CA04` | Nenhum usuário pode banir a si mesmo, em qualquer papel. | — |

#### 📋 CA - Comportamento da operação de banimento

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA05` | A regra de hierarquia de banimento se aplica também ao desbanimento **[...]** | ✅ |
| `CA06` | Ao receber a operação de banimento, o sistema responde com um dentre três resultados de negócio **[...]** | ✅ |
| `CA07` | O banimento é idempotente quanto ao histórico do usuário **[...]** | ✅ |
| `CA08` | O banimento é transacional. Se ocorrer falha entre registrar o banimento e atualizar a marcação de "banido" no perfil do usuário, ambas as operações devem ser revertidas — o usuário não pode ficar num estado inconsistente. | — |

#### 📋 CA - Fluxo de aprovação via solicitação (BanRequest)

| ID | Descrição | Detalhamento? |
|---|---|---|
| `CA09` | O fluxo de solicitação de banimento (BanRequest) continua intacto: editores podem abrir solicitações que admin/dev aprovam ou rejeitam, com idempotência preservada **[...]** | ✅ |

### 4.2 Detalhamento dos CAs com `[...]`

Cada bloco abaixo é o que aparece no **corpo do item** no OpenProject (campo Descrição do CA), seguindo a convenção `Regras a serem aplicadas:` + bullets.

#### CA02 — Detalhamento

```
Regras a serem aplicadas:
- Outro administrador não pode banir administrador (mesmo papel, hierarquia horizontal não permite).
- Administrador não pode banir a si mesmo (regra geral CA04 prevalece).
- Editor não tem permissão de operar a moderação de administradores; a tentativa é rejeitada.
- Apenas dev (papel mais alto da hierarquia) pode aplicar banimento a administrador.
```

#### CA03 — Detalhamento

```
Regras a serem aplicadas:
- Editor pode ser banido por administrador ou por dev.
- Usuário comum pode ser banido por administrador ou por dev.
- Editor NÃO bane outro editor (hierarquia horizontal não permite).
- Usuário comum NÃO bane ninguém (papel mais baixo da hierarquia).
```

#### CA05 — Detalhamento

```
Regras a serem aplicadas:
- A regra de quem-pode-banir-quem (CA01..CA04) vale igualmente para o desbanimento.
- Se um dev aplicou banimento a um administrador, apenas outro dev (ou o mesmo) pode desbanir.
- Administrador comum NÃO pode desfazer banimento que foi aplicado por dev a outro administrador.
- A política existe para evitar que o subordinado reverta a decisão do superior.
```

#### CA06 — Detalhamento

```
Regras a serem aplicadas:
- Quando o usuário tem permissão e a hierarquia é respeitada, o sistema confirma o banimento (operação aceita).
- Quando a hierarquia é violada (por exemplo, administrador tentando banir outro administrador), o sistema rejeita com a mensagem "Operação não permitida pela hierarquia editorial".
- Quando o usuário não tem permissão de moderação (não é administrador nem dev), o sistema rejeita com a mensagem "Você não tem permissão para moderar".
- Em todos os casos de rejeição, nenhum registro de banimento é criado e nenhum perfil de usuário é alterado.
```

> **Nota técnica (não vai no card do CA06)**: os 3 resultados de negócio acima são implementados respectivamente como HTTP 201, 400 e 403 no endpoint `POST /api/v1/moderation/bans/`. Esse mapeamento técnico é responsabilidade das Tasks (ver §7 Rastreabilidade), não do CA.

#### CA07 — Detalhamento

```
Regras a serem aplicadas:
- Re-banir um usuário previamente banido e depois desbanido NÃO cria um banimento duplicado: o registro existente é reativado.
- Ao reativar, o registro herda o novo motivo informado e o novo administrador que aplicou.
- O histórico do usuário fica coerente: 1 registro de banimento por relação usuário↔administrador, com sequência ativo/inativo no tempo.
```

#### CA09 — Detalhamento

```
Regras a serem aplicadas:
- Editor pode abrir uma solicitação de banimento (BanRequest fica em estado pendente).
- Administrador ou dev podem APROVAR a solicitação. A aprovação cria o banimento real seguindo a mesma hierarquia (CA01..CA04). Se a hierarquia for violada na aprovação, a aprovação falha.
- Administrador ou dev podem REJEITAR a solicitação. Nesse caso, a solicitação fica marcada como rejeitada e nenhum banimento é criado.
- Aprovar uma solicitação que já foi aprovada anteriormente retorna o banimento existente, sem criar duplicata (idempotência).
```

### 4.3 Anexo técnico — Matriz exaustiva do método `can_be_banned_by`

> **Nota**: este anexo é **derivação técnica** do CA02 + CA04 para uso de quem implementa o método `User.can_be_banned_by(actor)`. Não é detalhamento de CA no estilo "Regras a serem aplicadas:" — é tabela de verdade exaustiva. Em projeto real, viraria comentário no código ou tabela de teste (`pytest.mark.parametrize`).

```
Matriz exaustiva can_be_banned_by(actor) → bool

       • dev_user.can_be_banned_by(admin_user)   → False
       • dev_user.can_be_banned_by(dev2)         → False  (dev imune mesmo a outro dev)
       • dev_user.can_be_banned_by(dev_user)     → False  (ninguém bane a si mesmo)
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

## 5. User Stories (com BDD)

### US 1 — Aplicar hierarquia no model

```
US Implementar can_be_banned_by no User como autoridade única de hierarquia

Descrição (BDD):
  DADO que o sistema tem usuários com diferentes roles
  QUANDO o método user.can_be_banned_by(actor) é chamado
  ENTÃO o resultado segue a matriz da hierarquia (CA01..CA04)

Relacionado a: CA01, CA02, CA03, CA04
Story Points: 3
```

### US 2 — Aplicar hierarquia no endpoint

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

### US 3 — Garantir atomicidade transacional

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

### US 4 — Idempotência (re-banir após unban)

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

### US 5 — Desbanimento segue mesma hierarquia

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

## 6. Validação aplicada (Sommerville 5 + Falbo 7)

Aplicando [06-validacao.md](../references/06-validacao.md):

| Conferência | Aplicação |
|---|---|
| **Validade** (Sommerville) | Confirmado em discussão com dev: "Sim, queremos exatamente que admin não bane admin" |
| **Consistência** | CA02 e CA09 são consistentes — approve_ban_request reusa ban_user |
| **Completude** | Inicial faltava CA04 (auto-banimento); descoberto em revisão antes do código |
| **Realismo** | Implementável em Django 5 + DRF sem dependência externa |
| **Verificabilidade** | Cada CA tem teste pytest correspondente em `tests/test_ban_hierarchy.py` |
| **Completo (Falbo)** | CAs descrevem entrada (HTTP request), regra (matriz), saída (HTTP status + estado do User) |
| **Correto (Falbo)** | Validado em conversa com dev (stakeholder único do projeto) |
| **Necessário (Falbo)** | Sim — risco real de abuso interno |
| **Priorizável (Falbo)** | Alta prioridade (commit foi feito imediatamente após decisão) |
| **Verificável (Falbo)** | 13 testes específicos passaram (`test_ban_hierarchy.py`) |

---

## 7. Rastreabilidade implementada

Aplicando [07-mudanca-rastreabilidade.md](../references/07-mudanca-rastreabilidade.md):

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
│         └─ chama ban_user (herda hierarquia)
├─ apps/users/admin.py
│    └─ is_banned readonly (não puli a hierarquia via Django Admin)
├─ apps/moderation/tests/test_ban_hierarchy.py
│    ├─ test_can_be_banned_by_matrix (matriz exaustiva model)
│    ├─ test_dev_can_ban_admin (endpoint)
│    ├─ test_admin_cannot_ban_another_admin
│    ├─ test_admin_cannot_ban_dev
│    ├─ test_dev_cannot_ban_another_dev
│    ├─ test_admin_can_still_ban_editor (regressão)
│    ├─ test_editor_cannot_reach_ban_endpoint (403)
│    ├─ test_admin_cannot_unban_dev_placed_ban_on_admin
│    ├─ test_dev_can_unban_admin
│    └─ test_admin_can_unban_editor
└─ apps/moderation/tests/test_services.py
     ├─ test_ban_user_creates_ban_and_flags_user
     ├─ test_ban_user_idempotent_reactivates_existing (CA07)
     └─ test_ban_user_rollback_on_failure (CA08)
```

**Cada CA tem teste rastreável**, cada teste descreve uma regra de domínio.

---

## 8. Camada ética (SBC 002/2024)

Aplicando [09-etica-sbc.md](../references/09-etica-sbc.md):

| Princípio | Aplicação no caso |
|---|---|
| **§1.1 Bem-estar** | Hierarquia protege equipe editorial de abuso interno; protege leitores de receberem moderação inconsistente |
| **§1.2 Evitar danos** | Banimento injusto é dano reputacional grave; hierarquia rigorosa reduz risco |
| **§1.3 Honestidade** | Hierarquia declarada (`dev > admin > editor > user`) agora corresponde à implementação |
| **§1.4 Não discriminar** | Hierarquia não privilegia ninguém por características pessoais; só por papel |
| **§2.9 Sistemas seguros** | Defesa em profundidade: model (matriz) + endpoint (permission classes) + service (transação atômica + hierarquia repetida como última barreira) |
| **§3.6 Cuidado ao modificar** | Mudança preservou comportamento antigo: admin segue podendo banir editor/user (regressão testada) |

**Decisão ética**: optou-se por hierarquia **rígida** (admin não bane admin, em hipótese alguma) em vez de hierarquia **flexível** (quórum de admins). Justificativa: time pequeno (1 dev + 2 admins), quórum não é viável. Trade-off documentado.

---

## 9. Lições do caso (aplicáveis a futuras features do Interpop)

1. **Hierarquia editorial declarada em CLAUDE.md** virou requisito implícito; **explicitá-lo via CAs** foi o passo que faltava
2. **Defesa em profundidade** vence pré-condições isoladas: model + endpoint + service, todos validam
3. **BDD em pt-BR no commit message** ajuda revisão futura ("Regra: dev é imune; admin só por dev")
4. **Teste de regressão é parte do requisito** — CA "admin segue banindo editor" deve estar explícito; senão refactor pode quebrar
5. **ADR-012 (transação atômica)** virou padrão arquitetural transversal — toda operação ≥2 writes herda dele
6. **Idempotência** veio de requisito (CA07) descoberto em produção (bug original); recuperar via reescrita do ban_user foi mais barato que tratar UNIQUE constraint no caller

---

## 10. Aplicando este molde a próximas features do Interpop

Para qualquer feature nova (ex.: "comentários moderados pela comunidade"), reuse esta estrutura:

1. **Stakeholders identificados explicitamente** (lista de quem é afetado)
2. **AS-IS / TO-BE** documentados (gap claro)
3. **CAs declarativos com IDs estáveis** (`CA-COMMENT-01`, `CA-COMMENT-02`, ...)
4. **User Stories fatiando CAs em fatias incrementais** com BDD na descrição
5. **Story Points via Planning Poker** (mesmo solo, comparando com features anteriores)
6. **Validação contra Falbo 7 + Sommerville 5** antes de codar
7. **Camada ética**: pergunta concreta — quem pode ser prejudicado por essa feature?
8. **Defesa em profundidade**: aplicar invariante em ≥2 camadas independentes
9. **Testes rastreáveis aos CAs** (não testes orientados a código)
10. **Commit message reflete o requisito**, não só a mudança técnica

Em projetos da escala do Interpop (solo + part-time + contribuição IA), este nível de cerimônia ER **acelera** entrega ao invés de atrasar — porque elimina retrabalho silencioso na revisão.
