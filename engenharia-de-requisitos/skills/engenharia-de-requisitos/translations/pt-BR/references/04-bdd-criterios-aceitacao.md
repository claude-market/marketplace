# 04 — Critérios de Aceitação + BDD

> Como tornar requisitos **testáveis**. Combina AULA 08 (CA estilo declarativo IFPB), AULA 09 (integração CA + BDD no OpenProject), e metodologia BDD (Dan North, Liz Keogh, Aslak Hellesøy). **CA é o invariante por feature; BDD é o cenário executável por User Story.** Use os dois, não escolha um.

---

## 1. Por que CAs + BDD são camadas COMPLEMENTARES

Há confusão recorrente entre "CA é Gherkin" e "Gherkin substitui CA". Os dois servem propósitos diferentes:

| | Critério de Aceitação (CA) | BDD (Gherkin) |
|---|---|---|
| **Nível** | Feature | User Story |
| **Forma** | Frase declarativa imperativa | Cenário DADO/QUANDO/ENTÃO |
| **O que define** | Invariante / regra de negócio | Interação concreta usuário-sistema |
| **Audiência** | PO + analista + dev + QA | Toda a equipe + executável como teste |
| **Ferramenta** | Lista de regras numeradas | Cucumber, Behat, SpecFlow, Behave, RSpec |
| **Exemplo (saúde)** | "CA02: Senha deve ter 8+ chars, 1 maiúscula, 1 número" | "DADO usuário na tela de cadastro / QUANDO digita senha 'abc123' / ENTÃO sistema mostra erro de senha fraca" |

**O mapeamento típico**:

```
FEATURE                                       ← agrupa regras
  ├─ DESCRIÇÃO (parágrafo em pt-BR)           ← entregável ao cliente
  ├─ CA01: regra A                            ← invariantes testáveis
  ├─ CA02: regra B
  ├─ CA03: regra C
  └─ USER STORY (fatia de 1 sprint)
       ├─ Título curto descritivo             ← "US Listagem básica de atletas"
       ├─ DESCRIÇÃO = BDD                     ← cenários DADO/QUANDO/ENTÃO
       │     ├─ Cenário 1 — exercita CA01 + CA02
       │     ├─ Cenário 2 — exercita CA02 + CA03
       │     └─ Cenário 3 — fluxo de erro
       └─ Relação a: CAs (rastreabilidade)    ← lista de CAs cobertos
```

**Regra dura** (ver SKILL.md): **Feature tem descrição, NUNCA BDD. User Story tem BDD, sempre.** A descrição da Feature é o "o que vamos entregar ao cliente, em uma frase de negócio"; o BDD da US é "como o usuário vai exercitar isso em um cenário concreto".

CAs são **regras** (lista de invariantes por feature); BDDs são **cenários** (sequência de eventos por user story). Você precisa dos dois para ter cobertura.

---

## 2. Critérios de Aceitação (CAs)

### 2.1 Definição IFPB (AULA 08)

> **Condições para que uma Feature seja considerada concluída/aceita.**

São especificados **POR FEATURE** (regra inegociável do curso). Sem CAs, a feature é desejo, não requisito. A User Story **herda os CAs por rastreabilidade** (campo "Relacionado a: CA01, CA03, CA07") — ela mesma não tem CAs próprios; o que ela tem é o BDD do cenário concreto que exercita os CAs herdados da Feature pai.

> A confusão "CAs por user story" aparece em material introdutório porque, no Jira/Trello, costuma-se grudar CAs no card de US por conveniência operacional. **Na hierarquia formal IFPB seguida aqui, CAs pertencem à Feature**; a US apenas referencia.

### 2.2 Estilo declarativo (modelo IFPB)

Cada CA é uma frase imperativa que descreve uma regra ou condição testável. **Não usa Gherkin** — é texto livre prescritivo.

```
CA01 - Apenas usuários autorizados podem ter acesso a funcionalidade
       de Consulta GERAL de ATLETAS.

CA02 - A consulta deve exibir apenas os atletas das FEDERAÇÕES
       esportivas que o usuário tem acesso no seu cadastro.

CA03 - A tela de consulta deve conter os campos e layout conforme
       definido no protótipo.

CA04 - A consulta deverá ser realizada levando-se em conta as
       opções de filtro informadas pelo usuário.

CA05 - O campo CPF não é obrigatório. Mas se preenchido, deverá ser
       no formato XXX.XXX.XXX-XX. Se o CPF for inválido, emitir
       mensagem de erro.

CA13 - A listagem geral de atletas deverá ser exibida em ordem
       alfabética, por default.

CA14 - A listagem geral de atletas poderá ser reordenada ao clicar
       no título das colunas.

CA14 - A listagem geral de atletas deverá ser paginada com as
       opções de visualizar 10, 50, 100 ou todos.

CA15 - A listagem geral de atletas deverá exibir todos os atletas
       por default.
```

### 2.3 Decomposição de CAs complexos (modelo IFPB)

Quando um CA agrupa múltiplas sub-regras, expanda em sub-bullets no campo de detalhamento. Exemplo CA09:

```
CA09 - O combobox FEDERAÇÃO deve aplicar as regras de preenchimento
       e validação conforme detalhamento:

       Regras a serem aplicadas:
       • O combobox FEDERAÇÃO só deverá ser habilitado se tiver uma
         CONFEDERAÇÃO selecionada
       • Só deve exibir as Federações ATIVAS
       • Em ordem ALFABÉTICA
       • Deve exibir apenas as federações que o usuário logado está
         associado no seu cadastro de acesso
       • Deve permitir busca parcial ao digitar
```

### 2.4 Boas práticas de CA

| ✅ Faça | ❌ Evite |
|---|---|
| Linguagem imperativa ("deve", "não pode") | Linguagem vaga ("seria bom", "preferencialmente") |
| Verbos testáveis ("exibir", "validar", "rejeitar") | Adjetivos qualitativos sem métrica ("amigável", "rápido") |
| Uma regra por CA (atômico) | Múltiplas regras misturadas |
| Numeração estável (CA01..CA20) | Renumerar a cada mudança |
| Ligar CA a feature explicitamente | CA órfão sem feature pai |
| Versionar (CA não muda silenciosamente) | Editar CA sem histórico |

### 2.5 Convenção `[...]` — CA com sub-regras (regra dura)

Quando um CA precisa de sub-regras para ser totalmente testável, **encerre o título com `[...]`** e detalhe no corpo do item (campo "descrição" no OpenProject) abrindo com `Regras a serem aplicadas:` seguido de bullets.

**Por que existe**: quem lê o backlog em modo **lista** (visão padrão do OpenProject, com 50+ itens na tela) precisa decidir em 1 segundo se aquele CA é autossuficiente ou exige clique. O `[...]` sinaliza isso sem ambiguidade.

#### Exemplo concreto (caso real do curso IFPB)

**Título no card** (visível em modo lista):

```
CA09 - O combobox FEDERAÇÃO deve aplicar as regras de preenchimento e validação conforme detalhamento [...]
```

**Descrição (corpo do item, lida ao abrir)**:

```
Regras a serem aplicadas:
- O combobox FEDERAÇÃO só deverá ser habilitado se tiver uma CONFEDERAÇÃO selecionada.
- Só deve exibir as Federações ATIVAS.
- Em ordem ALFABÉTICA.
- Deve exibir apenas as federações que o usuário logado está associado no seu cadastro de acesso.
- Deve permitir busca parcial ao digitar.
```

**Contraste — CA autossuficiente (sem `[...]`)**:

```
CA05 - O campo CPF não é obrigatório. Mas se preenchido, deverá ser no formato XXX.XXX.XXX-XX. Se o CPF for inválido, emitir mensagem de erro.
```

Não tem `[...]` porque o título já contém tudo que é necessário para testar.

#### Quando usar `[...]`

| Situação | Usa `[...]`? |
|---|---|
| CA com 1 regra autossuficiente (título completo) | Não |
| CA cujo título excederia ~250 caracteres se autossuficiente | Sim |
| CA com 3+ sub-regras paralelas (formato lista no corpo) | Sim |
| CA que herda comportamento condicional ("Só ativa se X foi selecionado") com várias condições | Sim |
| CA com regra única, mas com nota lateral (ex.: "exceto em fim de semana") | Não — coloque a exceção no próprio título |

#### Anti-padrão: `[...]` sem detalhamento

Título termina com `[...]` mas o corpo está vazio ou só repete o título. **Sempre detalhe** com pelo menos 2 bullets em "Regras a serem aplicadas:". Se não tiver o que detalhar, remova o `[...]`.

#### Sempre agrupado: convenção do agrupador `CA - <Tema>`

CAs ficam sempre dentro de um agrupador `CA - <Tema>`, mesmo quando a Feature tem 1 só CA. O agrupador é um item do tipo "Critério de Aceitação" no OpenProject, sem `[...]`, sem ID (`CANN`), apenas com título descritivo (`CA - Acesso e visibilidade`). Os CAs específicos (`CA01`, `CA02`, …) vivem como filhos do agrupador. Detalhamento em [05-convencoes-interpop.md](05-convencoes-interpop.md) e exemplo trabalhado em [examples/template-backlog-openproject.md](../examples/template-backlog-openproject.md) §4.

---

### 2.6 Erros frequentes em CA (com exemplos)

```
❌ CA: "A consulta deve ser rápida."
✅ CA: "A consulta deve retornar resultado em ≤2s para até 10k
       registros e ≤5s para até 100k."

❌ CA: "Sistema deve aceitar CPF."
✅ CA: "O campo CPF deve aceitar o formato XXX.XXX.XXX-XX. Se inválido,
       exibir 'CPF inválido' próximo ao campo, em vermelho."

❌ CA: "Usuário pode fazer login com email ou usuário e senha
       criptografada via OAuth e a senha deve ter pelo menos 8
       caracteres ou usar 2FA."
✅ CA1: "Usuário deve fazer login com email + senha."
   CA2: "Senha deve ter ≥8 chars, ≥1 maiúscula, ≥1 número."
   CA3: "Após 3 tentativas inválidas, conta bloqueada por 15min."
   CA4: "Usuário pode habilitar 2FA via app TOTP."
```

---

## 3. BDD — Behavior-Driven Development

### 3.1 Origem e propósito

- **2003 — Dan North** cunha BDD em artigo *"Introducing BDD"*
- **2006-2008 — Aslak Hellesøy** desenvolve **Cucumber**
- **2010+ — Liz Keogh, Gojko Adzic** formalizam Specification by Example

**Ideia central de North**: TDD funciona, mas o nome "test" confunde o cliente. **Renomear "test" para "comportamento"** e usar linguagem de domínio resolve. BDD não é teste — é **conversação executável**.

### 3.2 Os 3 pilares do BDD

1. **Outside-In** — começa pelo comportamento esperado (visão do usuário) e desce para implementação
2. **Three Amigos** — PO (negócio) + Dev (implementação) + QA (teste) discutem **JUNTOS** cada cenário ANTES da codificação
3. **Ubiquitous Language** — vocabulário compartilhado entre todos (mesmo termo significa mesma coisa em conversa, código e teste)

### 3.3 Ciclo BDD (Discovery → Formulation → Automation)

```
1. DISCOVERY (Three Amigos)
   ↓ "Vamos descobrir o comportamento juntos"
   Resultado: lista de cenários em linguagem natural

2. FORMULATION (Gherkin)
   ↓ "Vamos formular cada cenário com DADO/QUANDO/ENTÃO"
   Resultado: arquivo .feature versionado

3. AUTOMATION (step definitions)
   ↓ "Vamos automatizar a verificação"
   Resultado: cenário executável como teste
```

**Erro comum**: pular Discovery e ir direto para Gherkin. Resultado: cenários técnicos que não refletem comportamento real do domínio.

### 3.4 Gherkin (sintaxe pt-BR)

| Inglês | pt-BR | Significado |
|---|---|---|
| `Feature` | `Funcionalidade` | Cabeçalho |
| `Scenario` | `Cenário` | Caso específico |
| `Given` | `Dado` ou `DADO` | Pré-condição (estado inicial) |
| `When` | `Quando` ou `QUANDO` | Evento (ação do usuário/sistema) |
| `Then` | `Então` ou `ENTÃO` | Resultado esperado |
| `And` | `E` | Conjunção (de qualquer cláusula) |
| `But` | `Mas` | Negação esperada |
| `Background` | `Contexto` | Pré-condições comuns a todos cenários |
| `Scenario Outline` | `Esquema do Cenário` | Cenário parametrizado |
| `Examples` | `Exemplos` | Tabela de dados para esquema |

### 3.5 Exemplo concreto (do curso IFPB AULA 09)

```gherkin
Funcionalidade: Listagem básica de atletas

  Cenário: Acesso autorizado exibe listagem básica
    DADO que o usuário esteja logado na aplicação e tenha permissão de acesso
    QUANDO acessar o menu administrativo > ATLETAS
    ENTÃO deve-se exibir a relação básica de atletas
```

> **Atenção a um falso amigo terminológico**: a palavra-chave `Funcionalidade:` (Gherkin pt-BR, traduz `Feature:` em inglês) **NÃO é a mesma Feature da nossa hierarquia de backlog**. No Gherkin, `Funcionalidade:` é apenas o **cabeçalho de um arquivo `.feature`** — e cada arquivo `.feature` tipicamente corresponde a **uma User Story** da nossa hierarquia (ou no máximo a uma fatia coesa dela). Não tente mapear `Funcionalidade:` 1-para-1 com a Feature do OpenProject; a granularidade é diferente.

Este cenário implementa **simultaneamente** os CA01 (acesso autorizado), CA02 (filtro por federação implícito), CA03 (layout do protótipo), CA13 (ordem alfabética default), CA15 (exibir todos por default).

### 3.6 Mais exemplos (cobertura ampla)

```gherkin
Funcionalidade: Validação de CPF no cadastro de atleta

  Contexto:
    DADO que o usuário está na tela de cadastro de atleta
    E está logado como admin

  Cenário: CPF válido é aceito
    QUANDO preenche o campo CPF com "111.222.333-44"
    E clica em Salvar
    ENTÃO o atleta deve ser cadastrado com sucesso

  Cenário: CPF inválido é rejeitado
    QUANDO preenche o campo CPF com "123.456.789-00"
    E clica em Salvar
    ENTÃO o sistema exibe a mensagem "CPF inválido"
    E o atleta NÃO é cadastrado

  Esquema do Cenário: Validação de formato
    QUANDO preenche o campo CPF com "<entrada>"
    ENTÃO o sistema exibe "<mensagem>"

    Exemplos:
      | entrada            | mensagem                          |
      | 111.222.333-44     |                                   |
      | 123                | CPF deve estar no formato         |
      | abc.def.ghi-jk     | CPF deve conter apenas números    |
      |                    |                                   |
```

### 3.7 Quando o BDD vira teste automatizado

Cada cenário Gherkin tem **step definitions** que executam de verdade:

```ruby
# Em Ruby + Cucumber
Dado('que o usuário esteja logado na aplicação e tenha permissão de acesso') do
  @user = create(:user, role: 'admin')
  login_as(@user)
end

Quando('acessar o menu administrativo > ATLETAS') do
  visit '/admin/atletas'
end

Então('deve-se exibir a relação básica de atletas') do
  expect(page).to have_css('.lista-atletas')
  expect(page).to have_content(@user.federacao.atletas.first.nome)
end
```

```python
# Em Python + Behave
@given('que o usuário esteja logado na aplicação e tenha permissão de acesso')
def step_impl(context):
    context.user = create_user(role='admin')
    login_as(context, context.user)
```

```typescript
// Em TypeScript + Cucumber.js
Given('que o usuário esteja logado na aplicação e tenha permissão de acesso', async function() {
  this.user = await createUser({ role: 'admin' });
  await loginAs(this.user);
});
```

### 3.8 Três tipos de "step"

- `Given/Dado` — **estado** (sem ação, sem verificação)
- `When/Quando` — **ação** (sem verificação)
- `Then/Então` — **verificação** (sem mudar estado)

**Erro comum**: misturar ação e verificação. `Quando o usuário se cadastra e o sistema exibe sucesso` — duas coisas, separar.

### 3.9 BDD em pt-BR — vantagens no Brasil

A regra de oro é **falar a língua do negócio**. Se PO e stakeholders falam português, **escreva os cenários em português**. Cucumber, Behave, SpecFlow, Behat suportam Gherkin localizado nativamente.

```yaml
# Arquivo .feature com cabeçalho de idioma
# language: pt
Funcionalidade: ...
  Cenário: ...
    Dado ...
    Quando ...
    Então ...
```

---

## 4. Onde o BDD se encaixa no processo (curso IFPB)

```
ELICITAÇÃO
     ↓
ESPECIFICAÇÃO
     │
     ├─ Epic
     │   ↓
     │   Feature
     │      │
     │      ├─ DESCRIÇÃO da Feature ◄────── parágrafo pt-BR (entregável ao cliente)
     │      ├─ CAs (regras declarativas, invariantes)
     │      └─ User Stories (fatiamento por sprint)
     │           │
     │           ├─ Título curto descritivo
     │           ├─ DESCRIÇÃO da US = BDD ◄── BDD entra AQUI (cenários DADO/QUANDO/ENTÃO)
     │           └─ Relações = CAs associados (rastreabilidade)
     │
VALIDAÇÃO
     ↓
EXECUÇÃO BDD (testes vivos durante validação) ◄────── BDD vira teste AQUI
```

**Posição do BDD**: ponte entre **Especificação** e **Validação**. Na especificação, é a forma de descrever o comportamento da **User Story** (nunca da Feature — a Feature tem descrição em prosa, não cenário). Na validação, vira teste executável que confirma que o código entrega o comportamento.

---

## 5. Three Amigos — a prática-chave que NÃO pular

Antes de escrever qualquer linha de Gherkin, **junte os 3 papéis**:

| Papel | Pergunta que ele faz |
|---|---|
| **PO / negócio** | "É isso que o cliente precisa?" |
| **Dev** | "É implementável? Quais APIs/dados eu preciso?" |
| **QA** | "Como vou testar? Quais edge cases? Quais cenários de erro?" |

**Tempo típico**: 30-60min por feature. **Resultado**: lista de cenários (felizes + tristes + edge cases) que entram no .feature.

**Anti-pattern**: dev escreve Gherkin sozinho. Resultado: cenários que cobrem implementação, não comportamento. Quebram a cada refactor.

---

## 6. Critérios de qualidade de cenário BDD (Liz Keogh)

Um bom cenário:

- **Concreto** — usa valores reais ("R$ 100", "joão@email.com"), não placeholders ("um valor", "um email")
- **Curto** — 3-7 steps. Mais que isso, fatie em múltiplos cenários
- **Foco em UM comportamento** — não testa 3 coisas no mesmo cenário
- **Independente de implementação** — fala em termos de domínio ("usuário cadastra atleta"), não de UI ("usuário clica no botão azul")
- **Determinístico** — mesmo Given+When → sempre o mesmo Then (sem `Date.now()`, sem random)
- **Não acopla** — Given de um cenário NÃO depende de execução de outro

---

## 7. Anti-patterns frequentes em CAs e BDD

### 7.1 CA e BDD competindo (escrever só um)

```
❌ "Eu uso só CAs. BDD é overengineering."
   → Você perde a executabilidade. O sistema é validado por leitura
     manual. Em 6 meses, ninguém lembra qual CA foi de fato implementado.

❌ "Eu uso só BDD. CAs são redundantes."
   → Você perde o invariante por feature. Cada nova US só sabe seus
     cenários, não as regras gerais. Conflitos silenciosos entre US.
```

### 7.2 BDD acoplado à UI

```
❌ DADO que estou na página /login
   QUANDO clico no botão #submit-btn
   ENTÃO vejo elemento .error com texto "fail"

✅ DADO que sou um usuário não cadastrado
   QUANDO tento fazer login com email "x@y.com" e senha "errada"
   ENTÃO o sistema rejeita o login com mensagem de credenciais inválidas
```

### 7.3 Dev escreve Gherkin sozinho

PO/QA não revisam → cenários cobrem implementação, não comportamento → refactor quebra 30 cenários por mudança trivial.

### 7.4 CA qualitativo sem métrica

```
❌ "Sistema deve ter boa performance."
✅ "Endpoint POST /atletas deve responder em ≤500ms (p95) com payload
   de até 10kB."
```

### 7.5 BDD virou regression test sem revisão

Cenários se acumulam, ninguém revisa. Suite roda em 45min, ninguém olha o resultado. **Cenário sem dono = lixo executável.**

### 7.6 Esperar BDD substituir teste unitário

BDD = **comportamento end-to-end ou de subsistema**. Lógica interna ainda precisa de teste unitário rápido. Pirâmide de teste continua valendo: muitos unit, alguns integration, poucos BDD.

### 7.7 Feature com BDD em vez de descrição (anti-pattern crítico)

```
❌ Feature: Hierarquia de Banimento
   DADO que o usuário é admin
   QUANDO tenta banir outro admin
   ENTÃO o sistema rejeita com HTTP 400
```

Erro de granularidade: BDD pertence à **User Story** (cenário concreto, fatia de 1 sprint), não à Feature (entregável global). Quando você cola BDD direto na Feature, três coisas quebram:

1. **Não há descrição em prosa** — stakeholder não-técnico não consegue ler "DADO/QUANDO/ENTÃO" no card sem treino. Perde-se o documento conversacional.
2. **CAs ficam órfãos** — sem o "guarda-chuva" da descrição, CAs viram lista de regras sem narrativa que as justifique.
3. **Sprint Planning trava** — devs não conseguem fatiar a Feature em US porque ela já vem como cenário único; ou criam US falsas que repetem o BDD da Feature.

```
✅ Feature: Hierarquia de Banimento
   Descrição: Define quem pode banir e desbanir quem dentro da equipe
   editorial. Implementa hierarquia dev > admin > editor > user...
   [parágrafo de negócio]

   CA01: Dev é imune a banimento por qualquer outro usuário.
   CA02: Admin só pode ser banido por dev.
   ...

   US 1: Aplicar hierarquia no model
     DADO sistema com usuários de roles distintas
     QUANDO user.can_be_banned_by(actor) é chamado
     ENTÃO o resultado segue a matriz CA01..CA04
     Relacionado a: CA01, CA02, CA03, CA04

   US 2: Aplicar hierarquia no endpoint de banimento
     DADO admin autenticado e alvo também admin
     QUANDO tenta criar banimento
     ENTÃO sistema retorna HTTP 400
     Relacionado a: CA02, CA06
```

Cenários múltiplos por User Story, descrição em prosa para Feature, CAs no meio como invariantes. Cada artefato no seu nível.

---

## 8. Quando NÃO usar BDD

- **Projeto sem PO/cliente engajado** — sem Three Amigos, BDD vira Gherkin obrigatório (e ruim)
- **Time não conhece a sintaxe** + sem tempo de treinar — texto livre é melhor que Gherkin errado
- **Stack sem suporte adequado** — alguns frameworks JS antigos tornam step definitions custosas
- **Equipe muito pequena (1 dev)** — overhead de Gherkin > valor do cenário compartilhado. Use só CAs declarativos
- **Sistema interno raramente alterado** — investimento de BDD não se paga

**Em qualquer um desses casos, CA declarativo IFPB (sem Gherkin) ainda vale.** Não troque CA por nada.

---

## 9. Conexão com as próximas references

- **Como estimar US com CAs+BDD prontos**: [05-estimativa.md](05-estimativa.md)
- **Como validar (revisar CAs + protótipo + Gherkin)**: [06-validacao.md](06-validacao.md)
- **Rastreabilidade CA → BDD → código → teste**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
