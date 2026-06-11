# Worked Example — Data Isolation Between Organizations in the *"GestorPro"* Project

> Fictional but realistic case from the *"GestorPro"* project (a multi-tenant SaaS for clinic and school management; Django 5 + DRF + PostgreSQL 16 + React 19). Each client organization is a **tenant** that shares the same physical database with the others while staying isolated from them. Shows how a **shared-base multi-tenant** feature maps to the skill's RE framework — useful for auditing tenancy specifications or as a template for new tenant-scoped features. Reference commit (illustrative): `b7c3f02` (feat(tenancy): isolamento por organização com RLS + provisionamento atômico).
>
> **Note on language preservation**: Feature, User Story, AC, FR, NFR, goal, and business-rule titles, as well as the BDD content, are kept in **pt-BR** because they mirror the identifiers used in the *"GestorPro"* repository, commits, and backlog cards. **Explanations, tables, and analysis are in en-CA**; **artifact content is in pt-BR**.

---

## 1. Context and problem

**Business problem**: *"GestorPro"* sells management software to clinics and schools. Each client (a clinic, a school) is an **organization** — a tenant — and all tenants live in one shared PostgreSQL base to keep operational cost low. The first version scoped queries by `organization_id` only at the application layer (a `.filter(organization=request.user.organization)` scattered across viewsets). This is fragile: a single forgotten filter, a raw query, a careless admin action, or an ORM mistake leaks one clinic's patient records into another clinic's screen — a catastrophic LGPD incident and the end of the product's reputation.

**Diagnosis**: tenant isolation was an **implicit, application-only requirement** with no safety net at the database. There was also no formal contract for "how a new organization is born" (provisioning could leave orphan rows) and no path for an organization to **export** or **erase** its data (LGPD portability and right to be forgotten). These are the kinds of requirements that surface only when you ask "what happens when this single filter is forgotten?" — see [02-elicitacao.md §7](../references/02-elicitacao.md). Once raised, they became explicit.

---

## 2. Stakeholders

Applying Wiegers 2003 (see [01-fundamentos.md §5](../references/01-fundamentos.md)):

| Stakeholder | Interest |
|---|---|
| **Product owner (*"GestorPro"*)** | Guarantee no tenant ever sees another tenant's data; protect the brand from a leak |
| **Organization administrator** (clinic/school owner) | Manage their own users and data; never touch another organization |
| **End user** (receptionist, teacher) | Operate within one organization without seeing isolation as friction |
| **Data subject** (patient, student) | Have their data isolated, exportable, and erasable under LGPD |
| **DPO / privacy officer** | Demonstrate isolation and fulfill portability/erasure requests per tenant |
| **Platform SRE** | Ensure a "noisy" tenant cannot degrade the others (quota and limits) |
| **External auditor** (hypothetical) | Verify cross-tenant access is provably impossible, not just unlikely |

---

## 3. AS-IS → TO-BE analysis

Applying the analysis from [08-analista-negocios.md §3](../references/08-analista-negocios.md):

### AS-IS (before commit b7c3f02)

```
ReceptionistA (Org A) → GET /api/v1/pacientes/
  → Viewset filters .filter(organization=user.organization)  [application only]
  → Returns Org A patients  ✅ (when the filter is present)

DeveloperX adds a new report endpoint, forgets the filter
  → GET /api/v1/relatorios/ returns ALL patients, every org  ❌ LEAK
  → Database has no second line of defence
```

**Pains**:

- Isolation depends on every developer remembering one filter, everywhere, forever
- A raw SQL query or a Django Admin listing bypasses the filter entirely
- New-organization signup ran several inserts without a transaction → orphan rows on failure
- No way for an organization to export or delete its own dataset (LGPD gap)
- One organization importing 2 M rows could exhaust shared resources for everyone

### TO-BE

```
ReceptionistA (Org A) → GET /api/v1/pacientes/
  → Session sets app.current_org = A; Postgres RLS enforces org = A
  → Returns Org A patients

DeveloperX's new endpoint forgets the application filter
  → RLS still scopes the rows to Org A  → no leak (safety net holds)

Admin A → POST /api/v1/organizacoes/  (new org signup)
  → Single transaction: create org + seed roles + admin user
  → On any failure: full rollback, zero orphans

Admin A → POST /api/v1/organizacoes/A/exportacao/   → ZIP of Org A only
Admin A → DELETE /api/v1/organizacoes/A/             → erases Org A only
```

### GAP analysis

| Gap | Solution |
|---|---|
| Isolation lives only in application filters; one omission leaks data | NFR: Row-Level Security policy in PostgreSQL as a database-level safety net (ADR-021) |
| Cross-tenant access attempts are not explicitly denied or logged | FR: deny + audit-log on any out-of-tenant access attempt |
| Tenant boundary is not expressed as a domain invariant | G: "Toda informação pertence a exatamente uma organização" |
| Signup ran multiple inserts unguarded → orphans on failure | NFR: atomic provisioning in one transaction (no orphan rows) |
| No LGPD export/erasure per organization | FR: per-tenant export and erasure endpoints |
| A noisy tenant can starve shared resources | NFR: per-organization quota and rate limit |

---

## 4. Feature: Isolamento de dados entre organizações

**Feature description (client-deliverable, in pt-BR):**

Garante que cada organização-cliente do *"GestorPro"* enxergue e manipule exclusivamente os seus próprios dados, mesmo compartilhando a mesma base física com as demais. A regra de pertencimento — toda informação pertence a exatamente uma organização — é aplicada de forma consistente em todas as operações de leitura e escrita, com uma rede de segurança no banco de dados (Row-Level Security) que continua valendo mesmo que um filtro de aplicação seja esquecido. O entregável ao cliente é a garantia de que nenhuma clínica ou escola consegue, sob nenhuma circunstância — inclusive consulta direta, relatório novo ou ação administrativa —, acessar dados de outra organização. A feature também cobre o nascimento de uma nova organização (cadastro que cria o tenant e seus dados-semente numa única transação, sem deixar registros órfãos), a portabilidade dos dados de uma organização (exportação completa) e o direito ao esquecimento (exclusão completa por organização), em conformidade com a LGPD.

> This description is what goes on the backlog Feature card. It is **written in business language**, readable by any stakeholder. The ACs below formalize the testable rules; BDD appears only in the User Stories (§5).

### 4.1 Goals and business rules (G)

| ID | Business rule (regra de negócio) |
|---|---|
| `G-01` | Toda informação pertence a exatamente uma organização. |
| `G-02` | Administrador de uma organização não acessa nem modifica dados de outra organização. |
| `G-03` | O nascimento de uma organização ou acontece por completo ou não acontece — nunca deixa registros órfãos. |
| `G-04` | Os dados de uma organização podem ser exportados e excluídos isoladamente, sem afetar as demais. |

### 4.2 Non-functional requirements (quantitative, EARS body)

| ID | NFR | Measurement method | Priority |
|---|---|---|---|
| `RNF-01` | **Isolamento de dados entre organizações.** ENQUANTO uma sessão estiver vinculada à organização X, O SISTEMA DEVE retornar 0 (zero) registros pertencentes a qualquer organização Y ≠ X, em 100% das consultas de leitura e escrita, garantido por política de RLS no banco. | Suíte de testes de isolamento cruzado (1 cenário por tabela tenant-scoped) executando com o filtro de aplicação desligado; meta: 0 vazamentos em 100% dos casos. | 🔴 Imediata |
| `RNF-02` | **Negação de acesso cruzado.** SE uma requisição tentar ler ou escrever um registro de organização diferente da sessão, ENTÃO O SISTEMA DEVE negar a operação e registrar a tentativa no log de auditoria em ≤ 200 ms. | Teste BDD de tentativa de acesso cruzado verifica resposta negada e presença de 1 entrada no log de auditoria. | 🔴 Imediata |
| `RNF-03` | **Cota e limite de uso por organização.** ENQUANTO uma organização consumir recursos, O SISTEMA DEVE limitar a 600 requisições/min e 5 GB de armazenamento por organização, sem que o consumo de uma organização eleve a latência p95 das demais acima de 400 ms. | Teste de carga com 1 tenant "barulhento" (10× tráfego) e medição da latência p95 dos demais tenants via APM. | 🟠 Alta |
| `RNF-04` | **Provisionamento atômico de nova organização.** QUANDO um cadastro de nova organização for submetido, O SISTEMA DEVE criar o tenant e seus dados-semente numa única transação; SE qualquer passo falhar, ENTÃO DEVE reverter integralmente, deixando 0 registros órfãos. | Teste que injeta falha no passo final do provisionamento e verifica contagem 0 em todas as tabelas para o tenant. | 🔴 Imediata |
| `RNF-05` | **Exportação de dados por organização.** QUANDO um administrador solicitar a exportação, O SISTEMA DEVE produzir um pacote contendo somente os dados da sua organização, em ≤ 5 min para até 1 M de registros. | Teste de exportação valida que o pacote contém apenas IDs do tenant solicitante e mede o tempo de geração. | 🟡 Normal |
| `RNF-06` | **Exclusão de dados por organização (esquecimento).** QUANDO um administrador confirmar a exclusão da organização, O SISTEMA DEVE remover 100% dos dados daquele tenant em ≤ 24 h, sem afetar nenhum registro de outra organização. | Teste de exclusão verifica contagem 0 para o tenant alvo e contagem inalterada para um tenant vizinho. | 🟡 Normal |

### 4.3 Acceptance Criteria (declarative style)

11 ACs, **grouped by theme**. ACs with **`[...]`** at the end of the title must be read together with the detail in §4.4.

#### 📋 CA - Pertencimento e isolamento

| ID | Description | Detail? |
|---|---|---|
| `CA01` | Toda leitura retorna apenas registros da organização da sessão atual; nenhum registro de outra organização aparece. | — |
| `CA02` | Toda escrita grava o registro vinculado à organização da sessão atual; não é possível gravar em nome de outra organização. | — |
| `CA03` | A rede de segurança no banco (RLS) continua isolando mesmo quando o filtro de aplicação é omitido **[...]** | ✅ |
| `CA04` | Tentativa de acessar registro de outra organização é negada e registrada no log de auditoria **[...]** | ✅ |

#### 📋 CA - Cota e limite por organização

| ID | Description | Detail? |
|---|---|---|
| `CA05` | Uma organização que ultrapassa o limite de requisições recebe resposta de limite excedido, sem afetar as demais **[...]** | ✅ |
| `CA06` | Uma organização que atinge o limite de armazenamento é impedida de gravar novos dados até liberar espaço, sem afetar as demais. | — |

#### 📋 CA - Nascimento de organização

| ID | Description | Detail? |
|---|---|---|
| `CA07` | O cadastro de uma nova organização cria o tenant e seus dados-semente como uma única unidade **[...]** | ✅ |
| `CA08` | Se qualquer passo do cadastro falhar, nada é persistido — não restam registros órfãos da organização incompleta. | — |

#### 📋 CA - Portabilidade e esquecimento

| ID | Description | Detail? |
|---|---|---|
| `CA09` | A exportação de uma organização contém somente os dados daquela organização **[...]** | ✅ |
| `CA10` | A exclusão de uma organização remove todos os dados daquele tenant e nenhum de outro tenant **[...]** | ✅ |
| `CA11` | Após a exclusão, o identificador da organização não pode ser reutilizado para acessar dados antigos; qualquer acesso retorna como inexistente. | — |

### 4.4 Detail of ACs with `[...]`

Each block below is what appears in the **item body** in the backlog (AC Description field), following the `Regras a serem aplicadas:` + bullets convention.

#### CA03 — Detail

```
Regras a serem aplicadas:
- A política de isolamento no banco (RLS) vale independentemente da camada de aplicação.
- Mesmo que um endpoint novo esqueça o filtro por organização, o banco devolve apenas linhas da organização da sessão.
- Consultas diretas (relatórios, exportações internas, ações administrativas) também respeitam a política do banco.
- A aplicação continua filtrando por organização — a RLS é a segunda linha de defesa, não a substituição da primeira.
```

#### CA04 — Detail

```
Regras a serem aplicadas:
- Toda tentativa de ler ou escrever um registro de organização diferente da sessão é negada.
- A tentativa negada gera uma entrada no log de auditoria (quem, qual organização alvo, quando, qual recurso).
- O recurso de outra organização responde como inexistente, sem revelar que ele existe (não diferencia "não encontrado" de "proibido").
- Nenhum dado da organização alvo é exposto na resposta de negação.
```

#### CA05 — Detail

```
Regras a serem aplicadas:
- Cada organização tem um limite próprio de requisições por minuto.
- Ao exceder o limite, a organização recebe resposta de "limite excedido" (retry depois de um intervalo).
- O consumo de uma organização não pode elevar a latência das outras acima do alvo do RNF-03.
- O limite é medido e aplicado por organização, nunca de forma global que penalize tenants comportados.
```

#### CA07 — Detail

```
Regras a serem aplicadas:
- O cadastro cria a organização, seus papéis-semente (administrador, operador) e o primeiro usuário administrador.
- Todos esses passos ocorrem numa única transação: ou todos persistem, ou nenhum persiste.
- Não existe estado intermediário visível: nunca há uma organização "meio criada" acessível.
- O administrador inicial só consegue entrar depois que a transação inteira foi confirmada.
```

#### CA09 — Detail

```
Regras a serem aplicadas:
- A exportação inclui somente registros cuja organização é a do solicitante.
- Nenhum identificador, referência ou metadado de outra organização aparece no pacote.
- O pacote é entregue em formato aberto e legível (portabilidade LGPD), com as entidades principais da organização.
- A geração da exportação respeita o tempo-limite definido no RNF-05.
```

#### CA10 — Detail

```
Regras a serem aplicadas:
- A exclusão remove todos os registros pertencentes ao tenant alvo, em todas as tabelas tenant-scoped.
- Nenhum registro de qualquer outra organização é tocado durante a exclusão.
- A exclusão é confirmada explicitamente pelo administrador da própria organização (ação irreversível).
- A contagem de registros de um tenant vizinho permanece inalterada antes e depois da exclusão.
```

> **Technical note (does not go on the cards)**: the isolation safety net is implemented as a PostgreSQL Row-Level Security policy keyed on the session variable `app.current_org`, set per request from the authenticated user's organization. Deny-and-audit (CA04) maps to HTTP 404 (not 403) to avoid resource enumeration. This technical mapping is the responsibility of the Tasks (see §7 Traceability), not the AC.

### 4.5 Technical annex — Cross-tenant access matrix

> **Note**: this annex is a **technical derivation** of G-01/G-02 + CA01/CA02/CA04 for whoever implements the isolation layer. It is not AC detail in the "Regras a serem aplicadas:" style — it is an exhaustive truth table. In a real project, this becomes a `pytest.mark.parametrize` table.

```
Exhaustive matrix: session_org(S) accessing record_org(R)

       • S=A reads record(org=A)        → allowed (rows returned)
       • S=A reads record(org=B)        → denied (0 rows; 404; audit log)
       • S=A writes record(org=A)       → allowed
       • S=A writes record(org=B)       → denied (404; audit log)
       • S=A raw query without filter    → RLS scopes to org=A only (CA03)
       • S=None (no org bound)          → denied (RLS yields 0 rows)
       • S=A reads org A after A deleted → denied (CA11; resource gone)
```

---

## 5. User Stories (with BDD)

### US 1 — Apply isolation at the database layer

```
US Aplicar política de isolamento por organização no banco (RLS)

Descrição (BDD):
  DADO que a sessão está vinculada à organização A
  E existem registros das organizações A e B na mesma tabela
  QUANDO uma consulta de leitura é executada SEM o filtro de aplicação
  ENTÃO o banco retorna apenas registros da organização A
  E nenhum registro da organização B aparece

Relacionado a: CA01, CA03, G-01, RNF-01
Story Points: 5
```

### US 2 — Deny and audit cross-tenant access

```
US Negar e registrar tentativa de acesso a outra organização

Descrição (BDD):
  DADO que o usuário autenticado pertence à organização A
  E um registro pertence à organização B
  QUANDO faço GET /api/v1/pacientes/{id_de_B}/
  ENTÃO o sistema responde como recurso inexistente (404)
  E nenhum dado da organização B é exposto
  E uma entrada é gravada no log de auditoria com a organização alvo

Relacionado a: CA04, G-02, RNF-02
Story Points: 3
```

### US 3 — Atomic provisioning of a new organization

```
US Provisionar nova organização de forma atômica

Descrição (BDD):
  DADO que o provisionamento cria organização + papéis-semente + administrador
  QUANDO um dos passos falha (simulado via mock no passo final)
  ENTÃO toda a transação é revertida
  E não resta nenhum registro da organização incompleta
  E o identificador da organização não fica reservado

  Cenário 2: Provisionamento bem-sucedido
  DADO um cadastro válido de nova organização
  QUANDO o provisionamento conclui
  ENTÃO a organização, os papéis-semente e o administrador existem
  E o administrador consegue entrar somente após a confirmação da transação

Relacionado a: CA07, CA08, G-03, RNF-04
Story Points: 5
```

### US 4 — Per-organization quota and limit

```
US Aplicar cota e limite de uso por organização

Descrição (BDD):
  DADO que a organização A excede o limite de requisições por minuto
  QUANDO A envia mais requisições no mesmo minuto
  ENTÃO A recebe resposta de limite excedido
  E a organização B, comportada, continua respondendo dentro do alvo de latência

Relacionado a: CA05, CA06, RNF-03
Story Points: 3
```

### US 5 — Export an organization's data (portability)

```
US Exportar os dados de uma organização

Descrição (BDD):
  DADO que sou administrador da organização A
  QUANDO solicito a exportação dos dados da minha organização
  ENTÃO recebo um pacote contendo apenas registros da organização A
  E nenhum identificador de outra organização aparece no pacote
  E o pacote é gerado dentro do tempo-limite definido

Relacionado a: CA09, G-04, RNF-05
Story Points: 3
```

### US 6 — Erase an organization's data (right to be forgotten)

```
US Excluir os dados de uma organização

Descrição (BDD):
  DADO que sou administrador da organização A
  E existe uma organização vizinha B com N registros
  QUANDO confirmo a exclusão da minha organização
  ENTÃO todos os registros da organização A são removidos
  E a contagem de registros da organização B permanece N
  E acessos posteriores à organização A retornam como inexistente

Relacionado a: CA10, CA11, G-04, RNF-06
Story Points: 5
```

---

## 6. Applied validation (Sommerville 5 + Falbo 7)

Applying [06-validacao.md](../references/06-validacao.md):

| Check | Application |
|---|---|
| **Validity** (Sommerville) | Confirmed with the product owner: "Yes — a tenant must never, under any circumstance, see another tenant's data" |
| **Consistency** | CA01/CA02 (application filter) and CA03 (RLS) are consistent — RLS reinforces, never contradicts, the application filter |
| **Completeness** | The initial set was missing CA11 (no reuse of a deleted org's identifier); discovered in review before coding |
| **Realism** | Implementable in PostgreSQL 16 RLS + Django session variables, no exotic dependency |
| **Verifiability** | Each AC has a corresponding pytest test in `tests/test_tenant_isolation.py` |
| **Complete (Falbo)** | ACs describe input (request + session org), rule (RLS + matrix), output (rows / 404 / audit log) |
| **Correct (Falbo)** | Validated with the product owner and the DPO (LGPD scope) |
| **Necessary (Falbo)** | Yes — a cross-tenant leak is an existential risk for the product |
| **Prioritizable (Falbo)** | Isolation 🔴 Imediata; export/erasure 🟡 Normal (regulatory but not launch-blocking) |
| **Verifiable (Falbo)** | Cross-tenant leak suite runs with the application filter disabled — 0 leaks required to pass |

---

## 7. Implemented traceability

Applying [07-mudanca-rastreabilidade.md](../references/07-mudanca-rastreabilidade.md):

```
Commit b7c3f02: feat(tenancy): isolamento por organização com RLS + provisionamento atômico
├─ apps/tenancy/models.py
│    ├─ Organization (tenant raiz)
│    └─ TenantScopedModel (abstract: organization FK + manager filtrado)
├─ apps/tenancy/db/policies.sql
│    └─ RLS policy USING (organization_id = current_setting('app.current_org')::uuid)
├─ apps/tenancy/middleware.py
│    └─ set_current_org(request) → SET app.current_org = user.organization_id
├─ apps/tenancy/services.py
│    ├─ provision_organization(payload) → Organization   [transaction.atomic]
│    │    └─ rollback total se qualquer passo falhar (CA08)
│    ├─ export_organization(org) → ZIP   (somente registros do tenant)
│    └─ delete_organization(org) → None  (cascade tenant-scoped + invalida id)
├─ apps/tenancy/throttling.py
│    └─ PerOrganizationRateThrottle (600/min) + StorageQuotaGuard (5 GB)
├─ apps/tenancy/tests/test_tenant_isolation.py
│    ├─ test_read_returns_only_session_org (CA01)
│    ├─ test_write_binds_to_session_org (CA02)
│    ├─ test_rls_isolates_when_app_filter_disabled (CA03, RNF-01)
│    ├─ test_cross_tenant_read_returns_404_and_audits (CA04, RNF-02)
│    └─ test_cross_tenant_matrix (exhaustive parametrize)
├─ apps/tenancy/tests/test_provisioning.py
│    ├─ test_provision_is_atomic (CA07, RNF-04)
│    └─ test_provision_rollback_leaves_no_orphans (CA08)
├─ apps/tenancy/tests/test_quota.py
│    ├─ test_noisy_tenant_throttled_others_unaffected (CA05, RNF-03)
│    └─ test_storage_limit_blocks_writes (CA06)
└─ apps/tenancy/tests/test_lgpd.py
     ├─ test_export_contains_only_tenant_data (CA09, RNF-05)
     ├─ test_delete_removes_only_target_tenant (CA10, RNF-06)
     └─ test_deleted_org_id_not_reusable (CA11)
```

**Every AC has a traceable test**, every test describes a domain rule.

---

## 8. Ethical layer (*"SBC"* 002/2024)

Applying [09-etica-sbc.md](../references/09-etica-sbc.md):

| Principle | Application in the case |
|---|---|
| **§1.1 Well-being** | Patients and students trust that their records stay within one organization; isolation protects that trust |
| **§1.2 Avoid harm** | A cross-tenant leak of health or school records is grave, possibly irreversible harm; the RLS safety net reduces the risk |
| **§1.3 Honesty** | The declared promise ("your data is yours alone") now matches the implementation — not just an application filter |
| **§1.4 Non-discrimination** | Quota and limits apply per organization by the same rule; no tenant is privileged by who they are |
| **§2.5 Privacy (LGPD)** | Per-tenant export (portability) and erasure (right to be forgotten) are first-class features, not afterthoughts |
| **§2.9 Secure systems** | Defence in depth: application filter + database RLS + deny-and-audit + atomic provisioning |
| **§3.6 Care when modifying** | A forgotten filter no longer leaks data, because the database holds the line (regression risk neutralized) |

**Ethical decision**: chose a **shared base with RLS** over **a separate database per tenant**. Justification: at *"GestorPro"* scale (many small clinics/schools), a database-per-tenant model multiplies operational cost and migration risk; RLS gives a provable isolation boundary at the row level. Trade-off documented: shared base demands the RLS net be tested as rigorously as the application filter — hence RNF-01 runs with the application filter disabled.

---

## 9. Lessons from the case (applicable to future *"GestorPro"* features)

1. **Tenant isolation declared in the pitch** had become an implicit requirement; **making it explicit via ACs + a database safety net** was the missing step
2. **Defence in depth** beats a single filter: application manager + database RLS + deny-and-audit, all enforce the boundary
3. **Test the safety net with the first layer disabled** — RNF-01 only proves anything if the application filter is off during the leak suite
4. **Provisioning is part of the requirement** — "an organization is born atomically or not at all" (G-03) prevents the orphan-row class of bug at the source
5. **LGPD is a feature, not paperwork** — per-tenant export and erasure are testable ACs (CA09, CA10, CA11), traceable to RNF-05/RNF-06
6. **Quota protects the commons** — a per-organization limit (RNF-03) keeps one noisy tenant from degrading every other tenant on the shared base

---

## 10. Applying this template to next *"GestorPro"* features

For any new tenant-scoped feature (e.g., "appointment scheduling", "grade book"), reuse this structure:

1. **Stakeholders explicitly identified** (including the data subject and the DPO)
2. **AS-IS / TO-BE** documented (clear gap, especially the "forgotten filter" risk)
3. **Business rules (G) stated as invariants** (`G-01` belonging, `G-02` no cross-tenant access)
4. **Declarative ACs with stable IDs** (`CANN`), grouped by theme
5. **NFRs always quantitative** with a measurement method, optionally an EARS body
6. **User Stories slicing ACs into incremental slices** with BDD in the description
7. **Validation against Falbo 7 + Sommerville 5** before coding
8. **Ethical layer**: concrete question — whose privacy is at stake, and what happens on a leak?
9. **Defence in depth**: enforce the tenant invariant in ≥2 independent layers (application + database)
10. **Tests traceable to the ACs**, with the cross-tenant suite running against the database net alone

In multi-tenant SaaS like *"GestorPro"*, this level of RE ceremony **prevents the one bug you cannot recover from** — a cross-tenant data leak — by turning "remember the filter" into a provable, tested invariant.
