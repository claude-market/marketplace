# Exemplo Trabalhado — Agendamento de Atendimento Presencial no Projeto *"Portal do Cidadão"*

> Caso fictício, porém realista, do projeto *"Portal do Cidadão"* (serviço de governo digital municipal brasileiro; Django 5 + DRF + Next.js 15). Mostra como uma funcionalidade do **setor público** se mapeia no framework de ER da skill — útil para times que constroem serviços voltados ao cidadão, em que acessibilidade (*"eMAG"*/WCAG AA), minimização de dados (LGPD), trilhas de auditoria e fallback não-digital não são "diferenciais", mas obrigações legais e éticas. Commit de referência (ilustrativo): `b7f3a90` (feat(agendamento): identidade confirmada + minimização LGPD + canal de baixa conectividade).
>
> **Nota sobre preservação de idioma**: títulos de Feature, User Story, AC, RF, RNF e regras de negócio, bem como o conteúdo BDD, são mantidos em **pt-BR** porque espelham os identificadores que um time municipal brasileiro usaria no repositório, nos commits, nos cartões do backlog e nas instruções do `CLAUDE.md`. **Explicações, tabelas e análises estão em pt-BR**; **o conteúdo dos artefatos está em pt-BR**.

---

## 1. Contexto e problema

**Problema de serviço público**: o município oferece serviços presenciais (emissão de 2ª via de documentos, marcação em postos de saúde) em várias *"unidades de atendimento"*. Historicamente, o cidadão tinha de enfrentar fila física de madrugada para conseguir uma das poucas vagas diárias — por ordem de chegada, sem opção remota. O *"Portal do Cidadão"* busca substituir a fila de madrugada por um agendamento on-line.

**Diagnóstico**: um formulário de agendamento ingênuo *resolveria a fila, mas criaria novas exclusões*. Um cidadão idoso com baixa conectividade ou sem smartphone simplesmente ficaria de fora de um serviço a que tem direito por lei. Da mesma forma, um formulário descuidado coletaria dados pessoais em excesso (CPF, endereço, condição de saúde) sem finalidade declarada nem prazo de retenção — uma violação de LGPD à espera de acontecer. **O requisito implícito** aqui é que ir para o digital não pode estreitar o acesso nem enfraquecer os direitos do cidadão — o tipo de restrição que a etnografia e a análise de stakeholders trazem à tona (ver [02-elicitacao.md §7](../references/02-elicitacao.md)). Uma vez discutido, tornou-se explícito por meio dos RNFs e regras de negócio abaixo.

---

## 2. Stakeholders

Aplicando Wiegers 2003 (ver [01-fundamentos.md §5](../references/01-fundamentos.md)):

| Stakeholder | Interesse |
|---|---|
| **Cidadão (geral)** | Agendar uma vaga remotamente, sem filas de madrugada, com uma confirmação confiável |
| **Cidadão idoso / baixa conectividade** | Acessar o serviço sem depender de uma conexão rápida ou de um smartphone; ter um fallback não-digital |
| **Atendente da unidade** | Receber uma agenda limpa, com identidade confirmada; não lidar com no-shows nem agendamentos duplicados |
| **Gestor público da secretaria** | Reduzir filas, comprovar transparência, cumprir a LGPD e a lei de acessibilidade |
| **Encarregado de dados (DPO)** | Garantir que cada campo pessoal tenha finalidade declarada, consentimento e prazo de retenção |
| **Auditor / controladoria** | Inspecionar uma trilha completa de quem agendou, alterou ou cancelou o quê, e quando |
| **Pessoa com deficiência** | Operar todo o fluxo por teclado e leitor de tela, com contraste suficiente |

---

## 3. Análise AS-IS → TO-BE

Aplicando a análise de [08-analista-negocios.md §3](../references/08-analista-negocios.md):

### AS-IS (antes do *"Portal do Cidadão"*)

```
Cidadão → vai presencialmente à unidade de madrugada
  → pega senha física por ordem de chegada
  → vagas do dia esgotam; muitos voltam para casa sem atendimento
  → dado pessoal anotado em papel, sem prazo de descarte
  → idoso e quem mora longe são os mais penalizados
```

**Dores**:

- O acesso depende de presença física de madrugada — exclui idosos, trabalhadores e pessoas distantes da unidade
- Sem confirmação remota; o cidadão nunca sabe se haverá vaga
- Dados pessoais em papel, sem finalidade declarada nem prazo de retenção
- Sem registro auditável de quem foi atendido e por quê

### TO-BE

```
Cidadão → acessa o Portal (ou liga para a central — canal de fallback)
  → confirma identidade → escolhe serviço, unidade e horário disponível
  → recebe confirmação (com protocolo) por e-mail/SMS
  → coleta-se apenas o dado necessário, com finalidade declarada e prazo de retenção
  → toda ação fica registrada em trilha de auditoria consultável
```

### Análise de GAP

| Gap | Solução |
|---|---|
| Agendamento sem confirmação de identidade abre espaço para fraude e no-shows | RF: confirmação de identidade obrigatória antes de reservar; G: "Nenhum agendamento sem confirmação de identidade do cidadão" |
| Formulário coleta dados pessoais em excesso, sem finalidade nem prazo | RNF: minimização + RF de consentimento; G: "Dado pessoal coletado tem finalidade declarada e prazo de retenção" |
| Caminho só-digital exclui cidadãos com baixa conectividade / sem smartphone | RNF de disponibilidade + RF de canal de fallback (central telefônica) |
| Fluxo inutilizável por leitor de tela / apenas teclado | RNF de acessibilidade (*"eMAG"*/WCAG AA) + CA de acessibilidade |
| Ações administrativas não deixam rastro inspecionável | RNF de trilha de auditoria; toda ação administrativa registrada e consultável |

---

## 4. Feature: Agendamento de Atendimento Presencial

**Descrição da feature (entregável ao cliente, em pt-BR):**

Permite que o cidadão reserve, de forma remota, um horário para atendimento presencial em uma unidade do município (por exemplo, emissão de 2ª via de documento ou marcação em posto de saúde), substituindo a fila de madrugada. O agendamento só é efetivado após a confirmação da identidade do cidadão, e a confirmação é enviada com um número de protocolo. O sistema coleta apenas os dados estritamente necessários para o atendimento, sempre com finalidade declarada, consentimento explícito e prazo de retenção definido — o cidadão pode consultar e solicitar a exclusão dos seus dados. Para não excluir quem tem internet ruim ou não usa smartphone, existe um canal de fallback (central telefônica) que registra o mesmo agendamento no sistema. Todo o fluxo é operável por teclado e leitor de tela, com contraste adequado (*"eMAG"*/WCAG AA). Toda ação administrativa (criar, remarcar, cancelar, atender) fica registrada em uma trilha de auditoria consultável pela controladoria.

> Esta descrição é o que entra no cartão de Feature do backlog. Está **escrita em linguagem de negócio**, legível por qualquer stakeholder — inclusive um gestor público que não seja técnico. Os ACs abaixo formalizam as regras testáveis; o BDD aparece apenas nas User Stories (§5).

### 4.1 Critérios de Aceite (estilo declarativo)

11 ACs, **agrupados por tema** (Regra 7 de [05-convencoes-interpop.md](../references/05-convencoes-interpop.md)). ACs com **`[...]`** no fim do título devem ser lidos junto com o detalhe em §4.2.

#### 📋 CA - Identidade e reserva do horário

| ID | Descrição | Detalhe? |
|---|---|---|
| `CA01` | Nenhum horário é reservado sem que a identidade do cidadão tenha sido confirmada antes **[...]** | ✅ |
| `CA02` | Um mesmo cidadão não pode ter duas reservas ativas para o mesmo serviço na mesma unidade **[...]** | ✅ |
| `CA03` | Ao confirmar a reserva, o cidadão recebe um protocolo e uma confirmação por um canal escolhido (e-mail ou SMS). | — |
| `CA04` | Um horário já reservado por outro cidadão deixa de aparecer como disponível. | — |

#### 📋 CA - Privacidade e dados do cidadão (LGPD)

| ID | Descrição | Detalhe? |
|---|---|---|
| `CA05` | O sistema coleta apenas os dados necessários ao atendimento; nenhum campo extra é exigido **[...]** | ✅ |
| `CA06` | Cada dado pessoal coletado tem finalidade declarada e prazo de retenção visível ao cidadão no momento da coleta **[...]** | ✅ |
| `CA07` | O cidadão pode consultar e solicitar a exclusão dos seus dados pessoais a qualquer momento **[...]** | ✅ |

#### 📋 CA - Acessibilidade e inclusão

| ID | Descrição | Detalhe? |
|---|---|---|
| `CA08` | Todo o fluxo de agendamento é operável apenas por teclado e anunciado corretamente por leitor de tela **[...]** | ✅ |
| `CA09` | Existe um canal de fallback não-digital (central telefônica) que registra o mesmo agendamento no sistema **[...]** | ✅ |

#### 📋 CA - Transparência e trilha de auditoria

| ID | Descrição | Detalhe? |
|---|---|---|
| `CA10` | Toda ação administrativa sobre um agendamento (criar, remarcar, cancelar, atender) fica registrada com autor, data e motivo **[...]** | ✅ |
| `CA11` | A trilha de auditoria é consultável pela controladoria e não pode ser editada nem apagada por um atendente comum. | — |

### 4.2 Detalhe dos ACs com `[...]`

Cada bloco abaixo é o que aparece no **corpo do item** no backlog (campo Descrição do AC), seguindo a convenção `Regras a serem aplicadas:` + bullets.

#### CA01 — Detalhe

```
Regras a serem aplicadas:
- A identidade do cidadão é confirmada antes de qualquer reserva ser criada.
- Se a confirmação de identidade falhar, nenhum horário é bloqueado nem reservado.
- O horário só sai do conjunto de disponíveis depois que a reserva é efetivada com identidade confirmada.
- A reserva fica vinculada à identidade confirmada, permitindo consulta e cancelamento posteriores pelo próprio cidadão.
```

#### CA02 — Detalhe

```
Regras a serem aplicadas:
- Um cidadão com reserva ativa para o mesmo serviço na mesma unidade não pode criar uma segunda reserva ativa.
- A tentativa de reserva duplicada é recusada com a mensagem "Você já possui um agendamento ativo para este serviço nesta unidade".
- Reservas para serviços diferentes (ou unidades diferentes) são permitidas em paralelo.
- Após o atendimento, o cancelamento ou a remarcação, a reserva deixa de contar como ativa e uma nova pode ser criada.
```

#### CA05 — Detalhe

```
Regras a serem aplicadas:
- O formulário solicita apenas o necessário ao atendimento escolhido (ex.: nome, documento de identificação, contato para confirmação).
- Nenhum campo de dado sensível é exigido quando o serviço não o requer.
- Quando um serviço de saúde exige dado sensível (ex.: especialidade), esse dado é solicitado de forma destacada e justificada.
- Campos opcionais ficam claramente marcados como opcionais; o cidadão pode concluir o agendamento sem preenchê-los.
```

#### CA06 — Detalhe

```
Regras a serem aplicadas:
- No momento da coleta, cada dado exibe para que será usado (finalidade) e por quanto tempo será guardado (prazo de retenção).
- O cidadão dá consentimento explícito antes de a coleta ser efetivada.
- A finalidade declarada não pode ser ampliada depois sem novo consentimento.
- Esgotado o prazo de retenção, o dado é descartado ou anonimizado automaticamente.
```

#### CA07 — Detalhe

```
Regras a serem aplicadas:
- O cidadão tem uma área onde consulta todos os dados pessoais que o sistema guarda sobre ele.
- O cidadão pode solicitar a exclusão dos seus dados; a solicitação é registrada e atendida no prazo legal.
- A exclusão não apaga registros que a lei exige preservar (ex.: trilha de auditoria de um atendimento já realizado), mas anonimiza o vínculo pessoal quando possível.
- A resposta ao pedido de acesso/exclusão é confirmada ao cidadão por um canal de contato.
```

#### CA08 — Detalhe

```
Regras a serem aplicadas:
- Todo controle do fluxo (escolher serviço, unidade, horário, confirmar) é alcançável e acionável apenas pelo teclado, em ordem lógica.
- Cada campo e botão tem rótulo anunciado corretamente pelo leitor de tela.
- Mensagens de erro e de sucesso são anunciadas ao leitor de tela, não apenas exibidas visualmente.
- O contraste entre texto e fundo atende ao mínimo exigido para leitura confortável.
```

> **Nota técnica (não vai no cartão do CA08)**: o contraste mínimo se mapeia a uma razão de pelo menos 4.5:1 para texto normal (WCAG AA), e os anúncios do leitor de tela se mapeiam a regiões `aria-live` mais a associação correta de `label`. Esse mapeamento técnico é responsabilidade das Tasks (ver §7 Rastreabilidade), não do AC.

#### CA09 — Detalhe

```
Regras a serem aplicadas:
- Existe uma central telefônica onde um atendente registra o agendamento em nome do cidadão.
- O agendamento criado pela central é o mesmo registro do sistema — aparece na mesma agenda da unidade e gera o mesmo protocolo.
- A confirmação de identidade pela central segue uma verificação equivalente à do canal digital.
- Nenhum cidadão fica sem acesso ao serviço por não ter internet adequada ou smartphone.
```

#### CA10 — Detalhe

```
Regras a serem aplicadas:
- Toda criação, remarcação, cancelamento e marcação de atendimento gera um registro na trilha de auditoria.
- Cada registro guarda quem fez a ação, quando, e o motivo (quando aplicável, ex.: motivo do cancelamento).
- O registro é imutável após criado: correções entram como novos registros, não sobrescrevem.
- A trilha permite reconstruir a história completa de um agendamento.
```

### 4.3 Anexo técnico — Tabela de decisão para `pode_reservar(cidadao, servico, unidade)`

> **Nota**: este anexo é uma **derivação técnica** de CA01 + CA02 para quem implementa a guarda de agendamento. Não é detalhe de AC no estilo "Regras a serem aplicadas:" — é uma tabela de decisão exaustiva. Em um projeto real, isto vira um comentário no código ou uma tabela de teste (`pytest.mark.parametrize`).

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

## 5. User Stories (com BDD)

### US 1 — Confirmar identidade antes de reservar o horário

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

### US 2 — Bloquear reserva ativa duplicada

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

### US 3 — Coletar apenas o necessário, com finalidade declarada e retenção

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

### US 4 — Cidadão acessa e exclui os próprios dados

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

### US 5 — Fluxo inteiro operável por teclado e leitor de tela

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

### US 6 — Canal de fallback não-digital

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

### US 7 — Trilha de auditoria imutável de ações administrativas

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

## 6. Validação aplicada (Sommerville 5 + Falbo 7)

Aplicando [06-validacao.md](../references/06-validacao.md):

| Verificação | Aplicação |
|---|---|
| **Validade** (Sommerville) | Confirmado com o gestor e o DPO: "Sim, ir para o digital não pode excluir o idoso nem coletar dados em excesso" |
| **Consistência** | CA09 (fallback) e CA01 (identidade) são consistentes — a central confirma identidade por uma verificação equivalente |
| **Completude** | O conjunto inicial não tinha o CA07 (direito de acesso/exclusão); descoberto na revisão com o DPO antes de codar |
| **Realismo** | Implementável em Django 5 + DRF + Next.js 15 sem dependência externa; o fallback reusa o mesmo serviço de agendamento |
| **Verificabilidade** | Cada AC tem um teste correspondente em `tests/test_agendamento.py` e `tests/test_acessibilidade.py` |
| **Completo (Falbo)** | Os ACs descrevem entrada (pedido de agendamento), regra (identidade + minimização + acesso), saída (reserva + protocolo + registro de auditoria) |
| **Correto (Falbo)** | Validado com o gestor público, o DPO e um revisor de acessibilidade |
| **Necessário (Falbo)** | Sim — obrigação legal (LGPD + lei de acessibilidade) e risco real de exclusão |
| **Priorizável (Falbo)** | 🔴 Imediata para CA01/CA06/CA08 (legal/ético), 🟠 Alta para CA09, 🟡 Normal para CA03 |
| **Verificável (Falbo)** | Checks automáticos de acessibilidade + testes de agendamento passam antes do release |

---

## 7. Rastreabilidade implementada

Aplicando [07-mudanca-rastreabilidade.md](../references/07-mudanca-rastreabilidade.md):

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

**Todo AC tem um teste rastreável**, todo teste descreve uma regra de domínio.

### RNF (sempre quantitativos + método de medição; EARS opcional)

| ID | RNF | Alvo quantitativo + medição | EARS (opcional) |
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

## 8. Camada ética (*"SBC"* 002/2024)

Aplicando [09-etica-sbc.md](../references/09-etica-sbc.md):

| Princípio | Aplicação no caso |
|---|---|
| **§1.1 Bem-estar** | Substituir a fila de madrugada por agendamento remoto reduz o sofrimento, especialmente para idosos e moradores distantes |
| **§1.2 Evitar dano** | A confirmação de identidade impede agendamentos fraudulentos que tirariam vagas de cidadãos legítimos |
| **§1.3 Honestidade** | Cada campo pessoal declara finalidade e retenção; nada é coletado silenciosamente |
| **§1.4 Não-discriminação** | O fallback não-digital garante que cidadãos de baixa conectividade não sejam usuários de segunda classe |
| **§2.9 Sistemas seguros** | Defesa em profundidade: guarda de identidade (serviço) + minimização (modelo de privacidade) + trilha de auditoria append-only |
| **§3.6 Cuidado ao modificar** | O canal de fallback escreve no mesmo serviço de agendamento, de modo que mudanças futuras não possam excluir silenciosamente o caminho telefônico |

**Decisão ética**: escolheu-se um **fallback não-digital como requisito de primeira classe** (CA09 + RNF-03) em vez de um **MVP só-digital** que teria sido entregue mais rápido. Justificativa: um serviço público não pode excluir cidadãos por falta de conectividade — aqui, a inclusão se sobrepõe à velocidade de entrega. Trade-off documentado.

---

## 9. Lições do caso (aplicáveis a futuras features do *"Portal do Cidadão"*)

1. **Ir para o digital não é automaticamente inclusivo** — sem o CA09 (fallback), o portal teria *estreitado* o acesso justamente para quem mais precisava
2. **LGPD é requisito, não algo a se pensar depois** — finalidade + retenção + consentimento + acesso/exclusão pertencem aos ACs (CA05..CA07), não a uma política de privacidade que ninguém lê
3. **Acessibilidade tem alvo mensurável** — o RNF-01 (teclado 100%, contraste ≥ 4.5:1, 0 violação crítica do axe) transforma "ser acessível" em algo que um pipeline de CI pode reprovar
4. **A trilha de auditoria é parte do requisito** — prestação de contas pública significa que toda ação administrativa é reconstruível (CA10/CA11), e a trilha precisa ser append-only
5. **Uma regra de negócio (G) se sobrepõe a uma tela** — G-01 (nenhum agendamento sem identidade) e G-03 (ninguém excluído) são invariantes que toda feature futura herda
6. **A confirmação de identidade veio de um risco, não de uma tela** — torná-la explícita como CA01 evitou toda uma classe de fraude e no-shows antes de uma linha ser codada

---

## 10. Aplicando este template às próximas features do *"Portal do Cidadão"*

Para qualquer feature nova (ex.: "consulta de protocolo de atendimento"), reuse esta estrutura:

1. **Stakeholders explicitamente identificados** — e sempre incluir o cidadão mais excluído (idoso, baixa conectividade, deficiência)
2. **AS-IS / TO-BE** documentado (gap claro), nomeando quem hoje fica de fora
3. **ACs declarativos com IDs estáveis** (`CA-PROTO-01`, `CA-PROTO-02`, ...), agrupados por tema
4. **User Stories fatiando os ACs em fatias incrementais** com BDD na descrição
5. **RNFs sempre quantitativos + método de medição**, opcionalmente em EARS; nunca "ser rápido/acessível/privado" sem um número
6. **Regras de negócio (G)** capturam os invariantes — identidade, dado com finalidade declarada, inclusão, auditabilidade
7. **Validação contra Falbo 7 + Sommerville 5** antes de codar, com o DPO e um revisor de acessibilidade na sala
8. **Camada ética**: pergunta concreta — quem pode ser *excluído* ou *prejudicado* por esta feature, e qual é o fallback?
9. **Defesa em profundidade**: aplicar cada invariante em ≥2 camadas independentes (guarda de serviço + modelo de dados + auditoria)
10. **Testes rastreáveis aos ACs** (agendamento, LGPD, acessibilidade, auditoria), não testes orientados a código

Em projetos do setor público, esse nível de cerimônia de ER não é burocracia — é como o time **prova** aos cidadãos, ao DPO e à controladoria que o serviço é inclusivo, legal e auditável por design.
