# Exemplo prático — Isolamento de dados entre organizações no projeto *"GestorPro"*

> Caso fictício, porém realista, do projeto *"GestorPro"* (um SaaS multi-tenant para gestão de clínicas e escolas; Django 5 + DRF + PostgreSQL 16 + React 19). Cada organização-cliente é um **tenant** que compartilha a mesma base física com as demais, mantendo-se isolado delas. Mostra como uma feature **multi-tenant de base compartilhada** se mapeia no framework de ER da skill — útil para auditar especificações de tenancy ou como template para novas features tenant-scoped. Commit de referência (ilustrativo): `b7c3f02` (feat(tenancy): isolamento por organização com RLS + provisionamento atômico).
>
> **Nota sobre preservação de idioma**: títulos de Feature, User Story, CA, RF, RNF, regra de negócio e o conteúdo BDD são mantidos em **pt-BR** porque espelham os identificadores usados no repositório, nos commits e nos cards de backlog do *"GestorPro"*. **Explicações, tabelas e análise estão em pt-BR**; **o conteúdo dos artefatos está em pt-BR**.

---

## 1. Contexto e problema

**Problema de negócio**: o *"GestorPro"* vende software de gestão para clínicas e escolas. Cada cliente (uma clínica, uma escola) é uma **organização** — um tenant — e todos os tenants vivem em uma única base PostgreSQL compartilhada para manter baixo o custo operacional. A primeira versão restringia as consultas por `organization_id` apenas na camada de aplicação (um `.filter(organization=request.user.organization)` espalhado pelos viewsets). Isso é frágil: um único filtro esquecido, uma query raw, uma ação administrativa descuidada ou um erro de ORM faz vazar os prontuários de uma clínica para a tela de outra clínica — um incidente catastrófico de LGPD e o fim da reputação do produto.

**Diagnóstico**: o isolamento de tenant era um **requisito implícito, restrito à aplicação**, sem rede de segurança no banco de dados. Também não havia contrato formal para "como uma nova organização nasce" (o provisionamento podia deixar registros órfãos) nem caminho para uma organização **exportar** ou **apagar** seus dados (portabilidade e direito ao esquecimento da LGPD). Esses são os tipos de requisito que só afloram quando se pergunta "o que acontece quando esse único filtro é esquecido?" — ver [02-elicitacao.md §7](../references/02-elicitacao.md). Uma vez levantados, tornaram-se explícitos.

---

## 2. Stakeholders

Aplicando Wiegers 2003 (ver [01-fundamentos.md §5](../references/01-fundamentos.md)):

| Stakeholder | Interesse |
|---|---|
| **Product owner (*"GestorPro"*)** | Garantir que nenhum tenant jamais veja os dados de outro tenant; proteger a marca de um vazamento |
| **Administrador da organização** (dono da clínica/escola) | Gerenciar seus próprios usuários e dados; nunca tocar em outra organização |
| **Usuário final** (recepcionista, professor) | Operar dentro de uma organização sem enxergar o isolamento como atrito |
| **Titular dos dados** (paciente, aluno) | Ter seus dados isolados, exportáveis e elimináveis sob a LGPD |
| **DPO / encarregado de privacidade** | Demonstrar o isolamento e atender pedidos de portabilidade/eliminação por tenant |
| **SRE da plataforma** | Garantir que um tenant "barulhento" não degrade os demais (cota e limites) |
| **Auditor externo** (hipotético) | Verificar que o acesso cruzado entre tenants é comprovadamente impossível, não apenas improvável |

---

## 3. Análise AS-IS → TO-BE

Aplicando a análise de [08-analista-negocios.md §3](../references/08-analista-negocios.md):

### AS-IS (antes do commit b7c3f02)

```
ReceptionistA (Org A) → GET /api/v1/pacientes/
  → Viewset filters .filter(organization=user.organization)  [application only]
  → Returns Org A patients  ✅ (when the filter is present)

DeveloperX adds a new report endpoint, forgets the filter
  → GET /api/v1/relatorios/ returns ALL patients, every org  ❌ LEAK
  → Database has no second line of defence
```

**Dores**:

- O isolamento depende de cada desenvolvedor lembrar de um filtro, em todos os lugares, para sempre
- Uma query SQL raw ou uma listagem do Django Admin contorna o filtro por completo
- O cadastro de nova organização rodava vários inserts sem transação → registros órfãos em caso de falha
- Não havia forma de uma organização exportar ou excluir o próprio conjunto de dados (lacuna de LGPD)
- Uma organização importando 2 M de linhas podia esgotar os recursos compartilhados de todo mundo

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

### Análise de GAP

| Lacuna | Solução |
|---|---|
| O isolamento vive só nos filtros de aplicação; uma omissão vaza dados | RNF: política de Row-Level Security no PostgreSQL como rede de segurança no nível do banco (ADR-021) |
| Tentativas de acesso cruzado entre tenants não são explicitamente negadas nem registradas | RF: negar + registrar em log de auditoria qualquer tentativa de acesso fora do tenant |
| A fronteira do tenant não está expressa como invariante de domínio | G: "Toda informação pertence a exatamente uma organização" |
| O cadastro rodava múltiplos inserts sem proteção → órfãos em caso de falha | RNF: provisionamento atômico em uma única transação (sem registros órfãos) |
| Sem exportação/eliminação LGPD por organização | RF: endpoints de exportação e eliminação por tenant |
| Um tenant barulhento pode sufocar os recursos compartilhados | RNF: cota e rate limit por organização |

---

## 4. Feature: Isolamento de dados entre organizações

**Descrição da feature (entregável ao cliente, em pt-BR):**

Garante que cada organização-cliente do *"GestorPro"* enxergue e manipule exclusivamente os seus próprios dados, mesmo compartilhando a mesma base física com as demais. A regra de pertencimento — toda informação pertence a exatamente uma organização — é aplicada de forma consistente em todas as operações de leitura e escrita, com uma rede de segurança no banco de dados (Row-Level Security) que continua valendo mesmo que um filtro de aplicação seja esquecido. O entregável ao cliente é a garantia de que nenhuma clínica ou escola consegue, sob nenhuma circunstância — inclusive consulta direta, relatório novo ou ação administrativa —, acessar dados de outra organização. A feature também cobre o nascimento de uma nova organização (cadastro que cria o tenant e seus dados-semente numa única transação, sem deixar registros órfãos), a portabilidade dos dados de uma organização (exportação completa) e o direito ao esquecimento (exclusão completa por organização), em conformidade com a LGPD.

> Esta descrição é o que entra no card de Feature do backlog. Está **escrita em linguagem de negócio**, legível por qualquer stakeholder. Os CAs abaixo formalizam as regras testáveis; o BDD aparece somente nas User Stories (§5).

### 4.1 Metas e regras de negócio (G)

| ID | Regra de negócio |
|---|---|
| `G-01` | Toda informação pertence a exatamente uma organização. |
| `G-02` | Administrador de uma organização não acessa nem modifica dados de outra organização. |
| `G-03` | O nascimento de uma organização ou acontece por completo ou não acontece — nunca deixa registros órfãos. |
| `G-04` | Os dados de uma organização podem ser exportados e excluídos isoladamente, sem afetar as demais. |

### 4.2 Requisitos não funcionais (quantitativos, corpo EARS)

| ID | RNF | Método de medição | Prioridade |
|---|---|---|---|
| `RNF-01` | **Isolamento de dados entre organizações.** ENQUANTO uma sessão estiver vinculada à organização X, O SISTEMA DEVE retornar 0 (zero) registros pertencentes a qualquer organização Y ≠ X, em 100% das consultas de leitura e escrita, garantido por política de RLS no banco. | Suíte de testes de isolamento cruzado (1 cenário por tabela tenant-scoped) executando com o filtro de aplicação desligado; meta: 0 vazamentos em 100% dos casos. | 🔴 Imediata |
| `RNF-02` | **Negação de acesso cruzado.** SE uma requisição tentar ler ou escrever um registro de organização diferente da sessão, ENTÃO O SISTEMA DEVE negar a operação e registrar a tentativa no log de auditoria em ≤ 200 ms. | Teste BDD de tentativa de acesso cruzado verifica resposta negada e presença de 1 entrada no log de auditoria. | 🔴 Imediata |
| `RNF-03` | **Cota e limite de uso por organização.** ENQUANTO uma organização consumir recursos, O SISTEMA DEVE limitar a 600 requisições/min e 5 GB de armazenamento por organização, sem que o consumo de uma organização eleve a latência p95 das demais acima de 400 ms. | Teste de carga com 1 tenant "barulhento" (10× tráfego) e medição da latência p95 dos demais tenants via APM. | 🟠 Alta |
| `RNF-04` | **Provisionamento atômico de nova organização.** QUANDO um cadastro de nova organização for submetido, O SISTEMA DEVE criar o tenant e seus dados-semente numa única transação; SE qualquer passo falhar, ENTÃO DEVE reverter integralmente, deixando 0 registros órfãos. | Teste que injeta falha no passo final do provisionamento e verifica contagem 0 em todas as tabelas para o tenant. | 🔴 Imediata |
| `RNF-05` | **Exportação de dados por organização.** QUANDO um administrador solicitar a exportação, O SISTEMA DEVE produzir um pacote contendo somente os dados da sua organização, em ≤ 5 min para até 1 M de registros. | Teste de exportação valida que o pacote contém apenas IDs do tenant solicitante e mede o tempo de geração. | 🟡 Normal |
| `RNF-06` | **Exclusão de dados por organização (esquecimento).** QUANDO um administrador confirmar a exclusão da organização, O SISTEMA DEVE remover 100% dos dados daquele tenant em ≤ 24 h, sem afetar nenhum registro de outra organização. | Teste de exclusão verifica contagem 0 para o tenant alvo e contagem inalterada para um tenant vizinho. | 🟡 Normal |

### 4.3 Critérios de Aceitação (estilo declarativo)

11 CAs, **agrupados por tema**. CAs com **`[...]`** ao final do título devem ser lidos junto com o detalhe na §4.4.

#### 📋 CA - Pertencimento e isolamento

| ID | Descrição | Detalhe? |
|---|---|---|
| `CA01` | Toda leitura retorna apenas registros da organização da sessão atual; nenhum registro de outra organização aparece. | — |
| `CA02` | Toda escrita grava o registro vinculado à organização da sessão atual; não é possível gravar em nome de outra organização. | — |
| `CA03` | A rede de segurança no banco (RLS) continua isolando mesmo quando o filtro de aplicação é omitido **[...]** | ✅ |
| `CA04` | Tentativa de acessar registro de outra organização é negada e registrada no log de auditoria **[...]** | ✅ |

#### 📋 CA - Cota e limite por organização

| ID | Descrição | Detalhe? |
|---|---|---|
| `CA05` | Uma organização que ultrapassa o limite de requisições recebe resposta de limite excedido, sem afetar as demais **[...]** | ✅ |
| `CA06` | Uma organização que atinge o limite de armazenamento é impedida de gravar novos dados até liberar espaço, sem afetar as demais. | — |

#### 📋 CA - Nascimento de organização

| ID | Descrição | Detalhe? |
|---|---|---|
| `CA07` | O cadastro de uma nova organização cria o tenant e seus dados-semente como uma única unidade **[...]** | ✅ |
| `CA08` | Se qualquer passo do cadastro falhar, nada é persistido — não restam registros órfãos da organização incompleta. | — |

#### 📋 CA - Portabilidade e esquecimento

| ID | Descrição | Detalhe? |
|---|---|---|
| `CA09` | A exportação de uma organização contém somente os dados daquela organização **[...]** | ✅ |
| `CA10` | A exclusão de uma organização remove todos os dados daquele tenant e nenhum de outro tenant **[...]** | ✅ |
| `CA11` | Após a exclusão, o identificador da organização não pode ser reutilizado para acessar dados antigos; qualquer acesso retorna como inexistente. | — |

### 4.4 Detalhe dos CAs com `[...]`

Cada bloco abaixo é o que aparece no **corpo do item** no backlog (campo Descrição do CA), seguindo a convenção `Regras a serem aplicadas:` + bullets.

#### CA03 — Detalhe

```
Regras a serem aplicadas:
- A política de isolamento no banco (RLS) vale independentemente da camada de aplicação.
- Mesmo que um endpoint novo esqueça o filtro por organização, o banco devolve apenas linhas da organização da sessão.
- Consultas diretas (relatórios, exportações internas, ações administrativas) também respeitam a política do banco.
- A aplicação continua filtrando por organização — a RLS é a segunda linha de defesa, não a substituição da primeira.
```

#### CA04 — Detalhe

```
Regras a serem aplicadas:
- Toda tentativa de ler ou escrever um registro de organização diferente da sessão é negada.
- A tentativa negada gera uma entrada no log de auditoria (quem, qual organização alvo, quando, qual recurso).
- O recurso de outra organização responde como inexistente, sem revelar que ele existe (não diferencia "não encontrado" de "proibido").
- Nenhum dado da organização alvo é exposto na resposta de negação.
```

#### CA05 — Detalhe

```
Regras a serem aplicadas:
- Cada organização tem um limite próprio de requisições por minuto.
- Ao exceder o limite, a organização recebe resposta de "limite excedido" (retry depois de um intervalo).
- O consumo de uma organização não pode elevar a latência das outras acima do alvo do RNF-03.
- O limite é medido e aplicado por organização, nunca de forma global que penalize tenants comportados.
```

#### CA07 — Detalhe

```
Regras a serem aplicadas:
- O cadastro cria a organização, seus papéis-semente (administrador, operador) e o primeiro usuário administrador.
- Todos esses passos ocorrem numa única transação: ou todos persistem, ou nenhum persiste.
- Não existe estado intermediário visível: nunca há uma organização "meio criada" acessível.
- O administrador inicial só consegue entrar depois que a transação inteira foi confirmada.
```

#### CA09 — Detalhe

```
Regras a serem aplicadas:
- A exportação inclui somente registros cuja organização é a do solicitante.
- Nenhum identificador, referência ou metadado de outra organização aparece no pacote.
- O pacote é entregue em formato aberto e legível (portabilidade LGPD), com as entidades principais da organização.
- A geração da exportação respeita o tempo-limite definido no RNF-05.
```

#### CA10 — Detalhe

```
Regras a serem aplicadas:
- A exclusão remove todos os registros pertencentes ao tenant alvo, em todas as tabelas tenant-scoped.
- Nenhum registro de qualquer outra organização é tocado durante a exclusão.
- A exclusão é confirmada explicitamente pelo administrador da própria organização (ação irreversível).
- A contagem de registros de um tenant vizinho permanece inalterada antes e depois da exclusão.
```

> **Nota técnica (não vai nos cards)**: a rede de segurança de isolamento é implementada como uma política de Row-Level Security do PostgreSQL chaveada na variável de sessão `app.current_org`, definida por requisição a partir da organização do usuário autenticado. O negar-e-auditar (CA04) mapeia para HTTP 404 (não 403) para evitar enumeração de recursos. Esse mapeamento técnico é responsabilidade das Tasks (ver §7 Rastreabilidade), não do CA.

### 4.5 Anexo técnico — Matriz de acesso cruzado entre tenants

> **Nota**: este anexo é uma **derivação técnica** de G-01/G-02 + CA01/CA02/CA04 para quem implementa a camada de isolamento. Não é detalhe de CA no estilo "Regras a serem aplicadas:" — é uma tabela-verdade exaustiva. Em um projeto real, isso vira uma tabela `pytest.mark.parametrize`.

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

## 5. User Stories (com BDD)

### US 1 — Aplicar o isolamento na camada do banco

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

### US 2 — Negar e auditar acesso cruzado entre tenants

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

### US 3 — Provisionamento atômico de uma nova organização

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

### US 4 — Cota e limite por organização

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

### US 5 — Exportar os dados de uma organização (portabilidade)

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

### US 6 — Excluir os dados de uma organização (direito ao esquecimento)

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

## 6. Validação aplicada (Sommerville 5 + Falbo 7)

Aplicando [06-validacao.md](../references/06-validacao.md):

| Verificação | Aplicação |
|---|---|
| **Validade** (Sommerville) | Confirmado com o product owner: "Sim — um tenant nunca, sob nenhuma circunstância, pode ver os dados de outro tenant" |
| **Consistência** | CA01/CA02 (filtro de aplicação) e CA03 (RLS) são consistentes — a RLS reforça, nunca contradiz, o filtro de aplicação |
| **Completude** | O conjunto inicial não tinha o CA11 (não reutilização do identificador de uma org excluída); descoberto na revisão, antes de codificar |
| **Realismo** | Implementável em RLS do PostgreSQL 16 + variáveis de sessão do Django, sem dependência exótica |
| **Verificabilidade** | Cada CA tem um teste pytest correspondente em `tests/test_tenant_isolation.py` |
| **Completo (Falbo)** | Os CAs descrevem entrada (requisição + org da sessão), regra (RLS + matriz), saída (linhas / 404 / log de auditoria) |
| **Correto (Falbo)** | Validado com o product owner e o DPO (escopo LGPD) |
| **Necessário (Falbo)** | Sim — um vazamento cruzado entre tenants é um risco existencial para o produto |
| **Priorizável (Falbo)** | Isolamento 🔴 Imediata; exportação/eliminação 🟡 Normal (regulatório, mas não bloqueante para o lançamento) |
| **Verificável (Falbo)** | A suíte de vazamento cruzado roda com o filtro de aplicação desligado — 0 vazamentos são exigidos para passar |

---

## 7. Rastreabilidade implementada

Aplicando [07-mudanca-rastreabilidade.md](../references/07-mudanca-rastreabilidade.md):

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

**Todo CA tem um teste rastreável**, todo teste descreve uma regra de domínio.

---

## 8. Camada ética (*"SBC"* 002/2024)

Aplicando [09-etica-sbc.md](../references/09-etica-sbc.md):

| Princípio | Aplicação no caso |
|---|---|
| **§1.1 Bem-estar** | Pacientes e alunos confiam que seus registros permanecem dentro de uma organização; o isolamento protege essa confiança |
| **§1.2 Evitar dano** | Um vazamento cruzado de registros de saúde ou escolares é dano grave, possivelmente irreversível; a rede de segurança da RLS reduz o risco |
| **§1.3 Honestidade** | A promessa declarada ("seus dados são só seus") agora corresponde à implementação — não apenas a um filtro de aplicação |
| **§1.4 Não discriminação** | Cota e limites aplicam-se por organização pela mesma regra; nenhum tenant é privilegiado por quem é |
| **§2.5 Privacidade (LGPD)** | Exportação por tenant (portabilidade) e eliminação (direito ao esquecimento) são features de primeira classe, não acessórios tardios |
| **§2.9 Sistemas seguros** | Defesa em profundidade: filtro de aplicação + RLS no banco + negar-e-auditar + provisionamento atômico |
| **§3.6 Cuidado ao modificar** | Um filtro esquecido não vaza mais dados, porque o banco segura a linha (risco de regressão neutralizado) |

**Decisão ética**: escolheu-se uma **base compartilhada com RLS** em vez de **um banco de dados separado por tenant**. Justificativa: na escala do *"GestorPro"* (muitas clínicas/escolas pequenas), um modelo de banco-por-tenant multiplica o custo operacional e o risco de migração; a RLS dá uma fronteira de isolamento comprovável no nível da linha. Trade-off documentado: a base compartilhada exige que a rede da RLS seja testada com o mesmo rigor que o filtro de aplicação — por isso o RNF-01 roda com o filtro de aplicação desligado.

---

## 9. Lições do caso (aplicáveis a futuras features do *"GestorPro"*)

1. **O isolamento de tenant declarado no pitch** havia se tornado um requisito implícito; **torná-lo explícito via CAs + uma rede de segurança no banco** era o passo que faltava
2. **Defesa em profundidade** vence um único filtro: manager de aplicação + RLS no banco + negar-e-auditar, todos impõem a fronteira
3. **Teste a rede de segurança com a primeira camada desligada** — o RNF-01 só prova algo se o filtro de aplicação estiver desligado durante a suíte de vazamento
4. **O provisionamento faz parte do requisito** — "uma organização nasce atomicamente ou não nasce" (G-03) previne na origem a classe de bug dos registros órfãos
5. **LGPD é feature, não papelada** — exportação e eliminação por tenant são CAs testáveis (CA09, CA10, CA11), rastreáveis aos RNF-05/RNF-06
6. **Cota protege o bem comum** — um limite por organização (RNF-03) impede que um tenant barulhento degrade todos os demais tenants na base compartilhada

---

## 10. Aplicando este template às próximas features do *"GestorPro"*

Para qualquer nova feature tenant-scoped (ex.: "agendamento de consultas", "diário de classe"), reutilize esta estrutura:

1. **Stakeholders identificados explicitamente** (incluindo o titular dos dados e o DPO)
2. **AS-IS / TO-BE** documentado (lacuna clara, especialmente o risco do "filtro esquecido")
3. **Regras de negócio (G) declaradas como invariantes** (`G-01` pertencimento, `G-02` sem acesso cruzado entre tenants)
4. **CAs declarativos com IDs estáveis** (`CANN`), agrupados por tema
5. **RNFs sempre quantitativos** com método de medição, opcionalmente um corpo EARS
6. **User Stories fatiando os CAs em fatias incrementais** com BDD na descrição
7. **Validação contra Falbo 7 + Sommerville 5** antes de codificar
8. **Camada ética**: pergunta concreta — de quem é a privacidade em jogo e o que acontece num vazamento?
9. **Defesa em profundidade**: imponha o invariante de tenant em ≥2 camadas independentes (aplicação + banco)
10. **Testes rastreáveis aos CAs**, com a suíte cruzada entre tenants rodando contra a rede do banco isoladamente

Em SaaS multi-tenant como o *"GestorPro"*, esse nível de cerimônia de ER **previne o único bug do qual não se recupera** — um vazamento cruzado de dados entre tenants — transformando o "lembre do filtro" em um invariante comprovável e testado.
