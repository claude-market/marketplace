# 13 — Requisitos de dependabilidade e segurança (confiabilidade · segurança (safety) · segurança da informação (security) · resiliência)

> **Quando usar esta referência**: sempre que um sistema tiver `RNF` que, se não atendidos, tornam o produto inteiro
> *inutilizável* em vez de meramente pior — movimentação de dinheiro, saúde, segurança de vida, dados pessoais, infraestrutura,
> qualquer coisa regulada (*"LGPD"* / GDPR / PCI). É a profundidade por trás da linha única do `SKILL.md §4.2` "RNF de produto:
> confiabilidade, segurança, usabilidade". Sommerville (4.1.2): *"Failure to meet a non-functional requirement may
> mean that the entire system becomes unusable."* Este arquivo transforma as quatro dimensões de dependabilidade em
> **`RNF` quantitativos e testáveis** que se encaixam na mesma espinha de todos os outros requisitos desta skill.

> 🟡 **Esta é uma camada de profundidade, não um novo teto.** As convenções nunca mudam: um `RNF` aqui ainda é um
> requisito em linguagem de negócio em `docs/requirements/`, ainda **quantitativo** (regra de ouro §4.2), ainda
> verificável por um `CA` + BDD, opcionalmente expresso em **EARS** (`references/11-ears.md`) — os padrões de erro/comportamento indesejado
> (`IF…THEN` / `SE…ENTÃO`) e os padrões de estado (`WHILE` / `ENQUANTO`) foram *feitos* para este material.
> Requisitos de dependabilidade compõem-se com a ética (`references/09-etica-sbc.md` — princípio 2.9 "sistemas robustos e
> seguros") e com a rastreabilidade (`references/07-mudanca-rastreabilidade.md`); não as contornam.

---

## 1. As cinco dimensões da dependabilidade (Sommerville Cap. 10)

Dependabilidade é a propriedade guarda-chuva: o grau de confiança que um usuário justificadamente deposita em um sistema. Não é um
único `RNF` — é uma família, e você elicita cada dimensão separadamente porque cada uma é quantificada de forma diferente.

| Dimensão | A pergunta que ela responde | Família de métricas primária |
|---|---|---|
| **Disponibilidade** | Está no ar quando preciso dele? | `AVAIL` (% de uptime), MTTR |
| **Confiabilidade** | Ele entrega serviço correto ao longo do tempo? | `POFOD`, `ROCOF`, `MTTF` |
| **Segurança (safety)** | Ele pode causar dano físico/financeiro? | severidade do perigo × probabilidade (risco) |
| **Segurança da informação (security)** | Ele resiste a ataque deliberado? | risco = valor do ativo × exposição × ameaça |
| **Resiliência** | Ele consegue manter o serviço crítico *durante/após* um ataque ou falha? | tempo de reconhecimento/recuperação (4R, §6) |

> **Por que merecem sua própria referência**: um sistema pode estar 100 % completo funcionalmente e ainda falhar em cada uma
> dessas. "Funciona na minha máquina" nada diz sobre *POFOD sob carga*, *o que acontece quando um atacante está
> dentro*, ou *se uma saída errada pode machucar alguém*. Sommerville reorganizou toda a Parte 2 da 10e
> exatamente em torno disso — Cap. 10 sistemas dependáveis, Cap. 11 confiabilidade, Cap. 12 segurança (safety), Cap. 13 segurança
> da informação (security), Cap. 14 resiliência.

**Os custos crescem de forma não linear.** Cada "nove" extra de confiabilidade (99 % → 99,9 % → 99,99 %) custa aproximadamente uma ordem
de magnitude a mais. Então o requisito é uma decisão *econômica* — superespecificar dependabilidade é um modo de falha
real, não só subespecificá-la. Quantifique o nível que o negócio realmente precisa, e nada além disso.

---

## 2. Vocabulário que você precisa manter reto (falta/defeito → erro → falha)

A cadeia causal de Sommerville — confundir esses termos torna o requisito não testável:

- **Falta/defeito (fault)** — um defeito latente no sistema (um bug, uma configuração errada). Pode nunca ser disparado.
- **Erro (error)** — um *estado interno* errôneo alcançado quando uma falta é ativada.
- **Falha (failure)** — *desvio* observável externamente em relação ao serviço especificado. É esta que o usuário vê.

A engenharia de confiabilidade ataca a cadeia de três formas, e um requisito pode exigir qualquer uma delas: **prevenção de
faltas** (não introduzi-la), **detecção e remoção de faltas** (encontrá-la antes do lançamento), **tolerância a faltas**
(o sistema continua entregando serviço *apesar* da falta — §5). Nomear qual estratégia um `RNF` mira o torna
verificável: "tolerante a faltas" ≠ "livre de bugs".

---

## 3. Requisitos de confiabilidade — quantifique ou é um desejo (Sommerville §11.2)

É aqui que a regra de ouro do §4.2 (RNF deve ser quantitativo) tem mais força. As quatro métricas canônicas:

| Métrica | Lê-se como | Use quando |
|---|---|---|
| **POFOD** — probabilidade de falha sob demanda | "1 em cada N requisições falha" (ex.: `POFOD = 0.001`) | O sistema é invocado **sob demanda** e uma única falha é grave — sistemas de proteção/desligamento, autorização de pagamento |
| **ROCOF** — taxa de ocorrência de falhas | "X falhas por unidade de operação/tempo" (ex.: `ROCOF = 2/1000 transactions`) | O sistema roda transações **regulares e frequentes** e você se importa com a *frequência* das falhas |
| **MTTF** — tempo médio até a falha | inverso do ROCOF — "tempo médio de operação antes de uma falha" | Sessões de longa duração em que a operação ininterrupta importa |
| **AVAIL** — disponibilidade | "% do tempo em que o sistema está no ar e entregando serviço" (ex.: `0.9999`) | O sistema precisa **estar lá** quando chamado — serviços, infraestrutura |

> **Exemplo trabalhado — transformando um desejo em um `RNF`** (o movimento que esta referência existe para ensinar):
>
> ❌ *"A fila de moderação precisa ser confiável."* — um desejo; nada a testar.
> ✅ `RNF-12` — *"O serviço de publicação de artigos deve manter uma disponibilidade de pelo menos 99,95 % medida
> mensalmente (`AVAIL ≥ 0.9995`), com uma probabilidade de falha sob demanda abaixo de 1 em 1000 para a ação de publicar
> (`POFOD < 0.001`)."* — agora um testador pode medi-lo e um `CA` pode afirmá-lo.

**`RNF` de confiabilidade são candidatos perfeitos a EARS** (`references/11-ears.md`): a forma de *estado* para propriedades
sustentadas e a forma de *comportamento indesejado* para o caminho de falha —

```
RNF-12  THE SYSTEM SHALL sustain AVAIL ≥ 0.9995 for the publish action, measured monthly.   (ubiquitous)
RNF-13  IF the primary datastore is unreachable
        THEN THE SYSTEM SHALL serve cached read-only content within 2 s and queue writes.    (IF…THEN)
```

> **Confiabilidade vs. a plataforma que você não controla.** Especifique a confiabilidade do *serviço que você entrega* e
> declare a confiabilidade assumida das dependências (SLA de nuvem, API de terceiros) como uma fronteira `RNF` explícita —
> caso contrário, o número é inverificável na primeira vez que um fornecedor tiver uma indisponibilidade.

---

## 4. Requisitos de segurança (safety) — orientados a perigo, frequentemente "shall NOT" (Sommerville §12.2)

Segurança (safety) = liberdade de circunstâncias que causam morte, ferimento ou dano **financeiro/ambiental**. **Não** é
o mesmo que confiabilidade: um sistema pode ser perfeitamente confiável e ainda inseguro (ele confiavelmente faz a coisa errada e danosa).
Requisitos de segurança (safety) são derivados *de trás para a frente a partir dos perigos*, não para a frente a partir das funcionalidades:

1. **Identificação de perigos** — quais estados do sistema poderiam levar a um acidente? (ex.: *"dois administradores
   rebaixando um ao outro simultaneamente, deixando zero administradores"*; *"uma dose calculada acima do teto seguro"*).
2. **Avaliação de perigos** — severidade × probabilidade → risco; mantenha apenas os intoleráveis/ALARP.
3. **Análise de perigos** — rastreie cada perigo até suas causas-raiz (ex.: análise de árvore de falhas, FTA — perigo de topo na
   raiz, decomposto via AND/OR em faltas contribuintes).
4. **Requisito de segurança (safety)** — uma restrição que remove o perigo ou controla sua consequência.

`RNF` de segurança (safety) são frequentemente **negativos / defensivos** — o padrão EARS de comportamento indesejado é a forma natural:

```
RNF-20  THE SYSTEM SHALL never allow the last active administrator of a workspace to be removed.   (invariant)
RNF-21  IF a computed value exceeds the configured safe ceiling
        THEN THE SYSTEM SHALL reject it, hold the last safe value, and raise an alert.              (IF…THEN)
```

> **Nível de Integridade de Segurança (SIL)** classifica quão rigorosamente uma função deve ser engenheirada (SIL 1–4 na IEC
> 61508). Você raramente definirá um SIL formal em um produto web, mas a *ideia* — "ajustar o rigor de engenharia ao
> dano que uma falha pode causar" — é o que justifica revisões/testes extras nas poucas funcionalidades verdadeiramente perigosas.
> Um **caso de segurança (safety case)** (§12.4) é o argumento documentado de que o sistema é aceitavelmente seguro; nesta skill ele
> vive como uma seção dedicada do documento de requisitos + a matriz de rastreabilidade de perigo → `RNF` → teste.

---

## 5. Requisitos de segurança da informação (security) — orientados a risco (Sommerville §13.3)

> Esta seção compõe-se diretamente com a skill **`security-requirement-extraction`** (ameaça → requisito) e
> com o princípio ético **1.6 Privacidade** + **2.9 sistemas robustos e seguros**. Requisitos de segurança da informação são derivados
> de uma **avaliação preliminar de risco**, nunca de um checklist genérico aparafusado no final.

**O vocabulário (acerte exato):** **ativo (asset)** (algo de valor a proteger) · **exposição (exposure)** (perda/dano possível
a um ativo) · **vulnerabilidade (vulnerability)** (uma fraqueza que pode ser explorada) · **ameaça (threat)** (circunstância com potencial de
causar perda) · **ataque (attack)** (exploração de uma vulnerabilidade) · **controle (control)** (medida protetiva que reduz
a vulnerabilidade).

**O processo orientado a risco** (Sommerville Fig. 13.5/13.7) — e é a mesma sequência de quatro tempos de
`security-requirement-extraction`:

```
1. Asset identification     → what must be protected, and its value (the moderation DB, user PII, the audit log)
2. Exposure / threat assess.→ for each asset: who would attack it, how, and what is lost (Fig 13.7 threat table)
3. Control identification   → the measure that blocks/limits each threat (the "how to defend")
4. Security requirement     → the control, written as a testable RNF in business language
```

**Tipos de `RNF` de segurança da informação** a cobrir (um checklist de elicitação útil — nenhum deles é funcionalidade, são
restrições sobre toda funcionalidade): **identificação** · **autenticação** · **autorização** · **imunidade**
(resistir a malware/injeção) · **integridade** (dados não corrompidos) · **detecção de intrusão** · **não repúdio**
(ações comprovadamente atribuíveis) · **privacidade** (minimização de dados, consentimento, retenção — `RNF` *e* uma obrigação ética).

**Elicite com casos de uso indevido / abuso.** Para cada caso de uso importante, pergunte "como um atacante distorceria isto?" — o
*negativo* de uma user story. O resultado é, novamente, um `RNF` EARS de comportamento indesejado:

```
RNF-30  THE SYSTEM SHALL store credentials only as Argon2id hashes (work factor ≥ 3).               (invariant)
RNF-31  WHILE an account is flagged for suspected compromise
        THE SYSTEM SHALL require step-up authentication for any state-changing action.              (WHILE/state)
RNF-32  IF the same credential fails authentication 5 times within 10 minutes
        THEN THE SYSTEM SHALL lock the account for 15 minutes and log the source.                   (IF…THEN)
```

> **Requisitos de segurança da informação são, na maioria, escritos como `SHALL NOT` / "o sistema previne…"** — eles restringem o
> espaço do *atacante*, não o caminho feliz do usuário. É exatamente por isso que são esquecidos em backlogs orientados a funcionalidade
> e por que precisam dessa elicitação orientada a risco, não de uma auditoria a posteriori.

---

## 6. Requisitos de resiliência — sobreviver à brecha (Sommerville Cap. 14)

Confiabilidade/segurança (safety)/segurança da informação (security) tentam *prevenir* falhas e ataques. **A resiliência assume que alguns terão sucesso
de qualquer forma** e pergunta: o sistema consegue continuar entregando seus serviços *críticos* e se recuperar? A ciber-resiliência é
especificada ao longo de quatro Rs (os "4R", Sommerville §14.x):

| R | O requisito pergunta | Forma de `RNF` de exemplo |
|---|---|---|
| **Reconhecimento (Recognition)** | Quão rápido *detectamos* um ataque/falha em andamento? | "detectar exportação em massa anômala em até 60 s" |
| **Resistência (Resistance)** | O que continua rodando sob ataque? | "serviço de leitura central permanece disponível durante uma onda de credential-stuffing" |
| **Recuperação (Recovery)** | Quão rápido o serviço crítico é restaurado? | "restaurar moderação em até 15 min (RTO); perder ≤ 5 min de dados (RPO)" |
| **Reinstauração (Reinstatement)** | Como retornamos à operação normal *plena*, com segurança? | "reaplicar escritas enfileiradas e verificar integridade antes de reabilitar a publicação" |

A resiliência é **sociotécnica** (§14.2): inclui pessoas e processo, não apenas código — runbooks de incidente,
plantão (on-call), o humano que percebe. Então alguns `RNF` de resiliência rastreiam para RNF *organizacionais* (a classe
organizacional de Sommerville, `SKILL.md §4.2`), não apenas para os de produto. **RTO/RPO** (objetivos de tempo/ponto de recuperação) são
os dois ganchos quantitativos mais reaproveitáveis — sempre elicite-os para qualquer serviço crítico.

---

## 7. Redundância e diversidade — a técnica transversal

Tanto a confiabilidade quanto a resiliência apoiam-se nos mesmos dois mecanismos, e um `RNF` pode exigi-los explicitamente:

- **Redundância** — capacidade reserva que assume o controle (réplicas, failover, backups). Defende contra faltas
  *aleatórias*.
- **Diversidade** — as partes redundantes são *diferentes* (implementação, fornecedor, caminho diferentes), de modo que uma única
  falha não derruba todas elas. Defende contra faltas *sistemáticas/de modo comum* e vulnerabilidades compartilhadas.

Redundância sem diversidade dá a você duas cópias do mesmo bug. Declare qual delas um `RNF` precisa:
`"warm standby in a second availability zone"` (redundância) vs. `"the fallback auth path shall not share the
primary's identity provider"` (diversidade).

---

## 8. Como escrever esses `RNF` nesta skill (a integração)

Nada de novo na maquinaria — mesma espinha, aplicada à dependabilidade:

1. **Lar** — estes são `RNF`, então vivem em `docs/requirements/` ao lado dos `RF` funcionais
   (`references/10-estrutura-projeto.md`), agrupados por classe de Sommerville (produto / organizacional / externo).
2. **Quantitativo** — cada um carrega um número e um *método de medição* (§4.2). "Seguro" / "confiável" /
   "safe" sozinhos são rejeitados na revisão (§9 antipadrões).
3. **EARS para os casos difíceis** (`references/11-ears.md`) — propriedades sustentadas → ubiquitous/`WHILE`; caminhos de falha &
   ataque → `IF…THEN`. Um `SHALL`/`DEVE` por declaração → um grupo de `CA`.
4. **Verificado por `CA` + BDD** (`references/04-bdd-criterios-aceitacao.md`) — um `RNF` de confiabilidade vira um teste de
   carga afirmando a métrica; um `RNF` de segurança da informação vira um cenário de caso de uso indevido; um `RNF` de segurança (safety) vira um teste de invariante
   "nunca deve".
5. **Rastreável** (`references/07-mudanca-rastreabilidade.md`) — perigo → `RNF` → controle → teste, nas duas direções. Para
   segurança (safety)/segurança da informação (security) esse rastro **é** o caso de segurança.
6. **Submetido a portão ético** (`references/09-etica-sbc.md`) — princípio **2.9**: *"when misuse or harm is foreseen or
   unavoidable, the best option may be to not implement the system."* Uma análise de dependabilidade que conclui
   que o risco não pode ser controlado é uma saída válida e exigida — não uma falha em entregar.

> **`RNF` trabalhado (classes produto / externo), linguagem de negócio + corpo EARS:**
>
> `RNF-40` (produto · segurança da informação) — *"Os dados pessoais do usuário são protegidos contra acesso não autorizado."*
> corpo (EARS): `WHILE a session is unauthenticated THE SYSTEM SHALL expose no personal data field.`
> origem: avaliação de risco §5 (ativo = PII; ameaça = scraping); ética 1.6; *"LGPD"* Art. 46.
> verificado por: `CA` "requisição anônima a qualquer endpoint de PII retorna 403" + BDD de caso de uso indevido.

---

## 9. Antipadrões específicos de dependabilidade/segurança

1. **Dependabilidade qualitativa** — "precisa ser confiável/seguro/safe/rápido". O pecado do §4.2, fatal aqui. Sempre uma
   métrica + método de medição.
2. **Segurança da informação como uma lista de funcionalidades aparafusada no final** — "adicione OAuth, adicione um firewall". Segurança é uma *restrição
   sobre toda funcionalidade*, derivada de uma avaliação de risco (§5), não uma sprint própria no final.
3. **Segurança (safety) sem análise de perigos** — escrever "o sistema deve ser seguro" sem nunca enumerar os
   perigos. Sem lista de perigos → os `RNF` de segurança (safety) são chutes.
4. **Confundir confiabilidade com segurança (safety)** — um sistema confiável que confiavelmente faz uma coisa danosa é *inseguro*.
   Eles são elicitados separadamente.
5. **Apenas prevenção, sem resiliência** — assumir que os controles nunca falham. Sempre elicite reconhecimento/recuperação
   (RTO/RPO) para serviços críticos — brechas acontecem.
6. **Redundância sem diversidade** — "duas réplicas" que compartilham o mesmo bug/vulnerabilidade/IdP. Declare a
   diversidade explicitamente quando a falha de modo comum for o risco.
7. **Superespecificar noves** — exigir 99,999 % onde o negócio precisa de 99,9 %. Cada nove é ~10× o custo;
   dependabilidade é um requisito econômico, não uma maximização.
8. **Privacidade tratada apenas como segurança da informação** — minimização de dados/consentimento/retenção são *também* uma obrigação ética + legal
   (1.6, *"LGPD"*), não apenas um `RNF` de controle de acesso.

---

## 10. Checklist de elicitação (por serviço crítico / ativo)

- [ ] **Quais dimensões se aplicam?** (disponibilidade / confiabilidade / segurança (safety) / segurança da informação (security) / resiliência — nem todas se aplicam)
- [ ] **Confiabilidade**: métrica escolhida (`POFOD`/`ROCOF`/`MTTF`/`AVAIL`) + valor-alvo + **método de medição**
- [ ] **Segurança (safety)**: perigos enumerados → avaliados (severidade×probabilidade) → cada perigo intolerável tem um `RNF`
- [ ] **Segurança da informação (security)**: ativos identificados + valorados → ameaças/exposição por ativo → controle → `RNF` (orientado a risco, §5)
- [ ] **Tipos de segurança cobertos**: authn · authz · integridade · imunidade · detecção de intrusão · não repúdio · privacidade
- [ ] **Resiliência**: tempo de reconhecimento + **RTO/RPO** para cada serviço crítico; procedimento de reinstauração
- [ ] **Redundância/diversidade** declaradas onde a falha de modo comum ou a vulnerabilidade compartilhada forem um risco
- [ ] Todo `RNF` de dependabilidade é **quantitativo**, em **linguagem de negócio**, opcionalmente **EARS**, com um `CA`
- [ ] **Portão ético** aplicado (2.9): há um dano previsto que argumenta por *não* construí-lo como especificado?
- [ ] Cada `RNF` de segurança (safety)/segurança da informação (security) é **rastreável** perigo/ameaça → `RNF` → controle → teste (o caso de segurança)

Falhou em ≥1 num serviço crítico → a especificação de dependabilidade está incompleta. Volte à avaliação de risco.

---

*Sources: Sommerville 10e, Part 2 — Ch. 10 (Dependable systems), §11.2 (Reliability requirements & metrics:
POFOD/ROCOF/MTTF/AVAIL), §12.2 (Safety requirements; hazard-driven derivation, SIL, safety cases §12.4), §13.3
(Security requirements; risk-driven process, Fig. 13.5/13.7 — asset/exposure/threat/control), Ch. 14
(Resilience engineering: §14.1 cybersecurity, §14.2 sociotechnical resilience, §14.3 resilient system design —
the 4R). Cross-referenced with Wiegers & Beatty Ch. 14 (quality attributes) and the `security-requirement-extraction`
threat→requirement process. Integrated as a **depth layer** for `RNF`, consistent with this skill's
quantitative, business-language-first, traceable conventions — it adds rigour to §4.2, it does not replace it.*
