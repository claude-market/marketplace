# 05 — Estimativa: Story Points + Planning Poker

> Como dimensionar User Stories de forma colaborativa. Combina AULA 09.2 IFPB + Cohn (User Stories Applied) + James Grenning (Planning Poker original 2002). Story Points são **medida abstrata de complexidade**, não horas. Planning Poker é o **método de consenso** para chegar nesses pontos.

---

## 1. Por que NÃO estimar em horas

Estimativa em horas falha por 4 razões:

1. **Habilidade varia** — 1h do João ≠ 1h da Maria
2. **Foco varia** — interrupções, reuniões consomem horas, não complexidade
3. **Ancoragem** — gerente vê "8h" como deadline ("amanhã às 17h"), não como estimativa
4. **Comparação difícil** — você sabe se feature X é "mais complexa" que Y; raramente sabe quantas horas exatas X leva

**Story Points resolvem isso**: você não estima tempo, estima **complexidade RELATIVA**. Um item de 5 pontos é ~5× mais complexo que um de 1 ponto. Quanto isso vira em horas é problema da **velocity** (ver §7).

---

## 2. Story Points — definição (AULA 09.2)

> Story points são números **abstratos** que dão **ideia de proporcionalidade** entre os requisitos (stories). A técnica consiste em contar a **complexidade do Backlog**.

**Analogia visual** (slide do curso):

```
┌─────────────────────┐ ← Living: 13pts
│                     │
│ Bedroom 1 │ Bedroom 2│   Bedroom1: 8pts
│  8pts     │   5pts   │   Bedroom2: 5pts
│           │          │   Kitchen: 5pts
├───────────┼──────────┤   Hall: 3pts
│  M.Bedroom│  Kitchen │   Bath: 3pts
│   8pts    │   5pts   │   M.Bath: 2pts
│           │          │   Closet: 1pt
│ ┌───┐ Bath│          │
│ │1pt│3pts │          │
└─┴───┴─────┴──────────┘
```

Não importa quantos m² o Living tem em valor absoluto. O que importa é que o Living é **~3× mais complexo** que o Hall (13 vs 3) e ~13× mais complexo que o Closet (13 vs 1).

---

## 3. Planning Poker — origem e propósito

- **2002 — James Grenning** propõe a técnica no artigo *"Planning Poker"*
- **2005 — Mike Cohn** populariza no livro *Agile Estimating and Planning*

**Por que poker** (e não consenso por discussão aberta):

- Evita **ancoragem** (1ª voz dominante influencia as demais)
- Força cada membro a **pensar antes de falar**
- Revela **divergências grandes** (sinal de que falta entendimento da história)

---

## 4. O baralho (escala Fibonacci modificada)

```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│  0  │ 1/2 │  1  │  2  │  3  │  5  │  8  │ 13  │ 21  │ 34  │ 55  │ 89  │ + ? + 100
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

**Por que Fibonacci**: gaps crescentes refletem incerteza crescente. Diferença entre 1 e 2 é precisa; entre 13 e 21 é vaga, como deve ser.

**Significados especiais**:

| Carta | Significado |
|---|---|
| `0` | Trivial (label change, color tweak) — **NÃO usado na 1ª rodada** |
| `1/2` | Quase trivial — **NÃO usado na 1ª rodada** |
| `1` | Mais simples possível do backlog atual (história-guia) |
| `2..89` | Proporcional à história-guia |
| `?` | **Não entendi** — preciso conversar com PO. Bloqueio o planning |
| `100` | **Isto é épico disfarçado** — fatiar em US menores antes de estimar |

### 4.1 Por que 0 e 1/2 ficam de fora na 1ª rodada

Da AULA 09.2: *"Não agora, mas no futuro, pois a prática demonstra que ao longo do desenvolvimento sempre haverá itens mais simples que o estimado com 1 ponto, como por exemplo: o acerto de um bug de layout, a troca de um label ou mesmo a troca de um botão da interface."*

Você **reserva** o 0 e 1/2 para itens futuros que serão mais simples que o atual menor item. Se você gastasse o 1 num item trivial agora, depois não teria espaço para algo ainda menor.

---

## 5. Procedimento (AULA 09.2, 4 passos)

### 5.1 Passo 1 — Leitura conjunta do backlog

A equipe lê **todas as stories** do backlog (do produto ou só da sprint) para ter visão geral do que será estimado.

**Tempo típico**: 15-30min para 20-30 stories.

### 5.2 Passo 2 — Escolha da história-guia

> Das stories do Backlog, a equipe seleciona a que julga ser a **mais simples de todas**, isto é, a que demandará **menos esforço** para implementação. Para essa história a estimativa será de **1 ponto**.

**Dica de pro** (AULA 09.2):
> Buscar um item já desenvolvido pelo time em uma sprint passada (se existir) e utilizar ele como referência de comparação. Com algo já realizado as estimativas serão mais assertivas.

### 5.3 Passo 3 — Pontuar as demais em proporção

> Seguindo a ordem apresentada no Backlog, **cada Story é relida e pontuada**, tomando-se a história guia como referência.
>
> Uma história que demande um esforço maior que a história guia **não necessariamente será pontuada com o valor seguinte** na escala de pontos. O esforço deve ser pontuado seguindo uma **proporção** ao esforço definido para a história guia.

**Exemplo concreto**:

- Histórica-guia (1pt): "Adicionar campo 'apelido' ao formulário de atleta (string opcional)"
- Story A: "Adicionar combo de seleção de federação com filtro por confederação" → essa é **8×** mais complexa (envio de dados em cascata, validação cruzada, integração com cache). Pontuação = **8**, não 2.

A escala Fibonacci tem buracos (1, 2, 3, 5, 8, 13…) **propositalmente**. Você não desliza pelos valores; você compara magnitude.

### 5.4 Passo 4 — Voto + discussão + revoto

Por história:

1. Facilitador lê a story em voz alta
2. Cada membro escolhe sua carta **em silêncio**
3. Todos viram a carta ao mesmo tempo
4. Se há consenso → registra pontuação
5. Se há divergência → **menor e maior valor justificam**
6. Re-discute → vota de novo
7. Repetir até consenso ou registrar discordância

### 5.5 O que fazer com `?` e `100`

- **`?` apareceu** → para a discussão da story. Quem votou `?` fala que dúvida tem. PO esclarece. Re-vota.
- **`100` apareceu** → story é épico. Sai do planning. Volta para refinamento do backlog.

---

## 6. Quem participa do Planning Poker

| Papel | Vota? | Por quê |
|---|---|---|
| Dev | ✅ | Implementa |
| QA / Tester | ✅ | Testa, conhece risco |
| Designer | ✅ se a story tem UI | Designa, conhece complexidade de UX |
| PO / Product Manager | ❌ | Quem define o "o quê", não estima o "quanto" |
| Scrum Master / Facilitador | ❌ | Só facilita, não vota |
| Gerente / Stakeholder externo | ❌ | Geraria ancoragem por autoridade |

**Regra ouro**: quem **NÃO vai implementar não vota**.

---

## 7. Velocity — onde Story Points viram tempo

**Velocity** = soma de pontos entregues por sprint (média das últimas 3-5 sprints).

Exemplo:
- Sprint 1: entregou 23pts
- Sprint 2: entregou 28pts
- Sprint 3: entregou 25pts
- **Velocity média = 25pts/sprint**

**Para próxima sprint**: equipe escolhe ~25pts do backlog priorizado. Não 40 (overcommit), não 10 (sub-utilização).

**Conversão para deadline**:
- Backlog total = 150pts
- Velocity = 25pts/sprint
- Sprints restantes = 150 / 25 = **6 sprints**

Esta é **estimativa, não promessa**. Recalcule a cada sprint.

### 7.1 Quando velocity NÃO funciona

- **1as 3 sprints** — equipe ainda calibrando. Use range (10-30pts), não média
- **Equipe muda** — velocity reseta (membro novo aprendendo, membro saindo)
- **Stack muda** — migração de framework destrói baseline
- **Tipo de trabalho muda** — sprint só de refactor não é comparável a sprint de feature

---

## 8. O que NÃO fazer com Story Points

### 8.1 Não converta pontos em horas explicitamente

```
❌ "1pt = 4h, 2pt = 8h, 3pt = 12h"
   → reintroduz o problema que story points resolvem
```

Velocity é a única conversão válida — e ela é **estatística** (média), não **determinística**.

### 8.2 Não compare velocity entre equipes

Equipe A entrega 30pts/sprint, Equipe B entrega 50pts/sprint. **Isso não significa nada.** Os pontos são relativos à história-guia de cada equipe. Comparar é como comparar reais com euros sem câmbio — números diferentes, valor incomparável.

### 8.3 Não use pontos para avaliação de performance

Dev sob pressão para "marcar mais pontos" infla estimativas. Quebra o sistema todo. **Pontos servem para planejamento, não avaliação.**

### 8.4 Não re-estime mid-sprint

Story estimada como 5 está se mostrando ser 13. **Não muda o número.** Resultado: velocity da sprint cai → próxima sprint absorve menos. O sistema se autoajusta.

### 8.5 Não estime sem CA + BDD prontos

Como você estima complexidade de "fazer login" se não sabe se é com email/senha, OAuth, 2FA, SSO? **Story sem critério é story sem estimativa.** Lembrando: os CAs vivem na **Feature pai** (ver [04-bdd-criterios-aceitacao.md §2.1](04-bdd-criterios-aceitacao.md)); a US herda por rastreabilidade e adiciona o **BDD** no seu próprio campo "Descrição". Se a Feature pai não tem CAs ou se a US ainda não tem BDD escrito, volte para refinamento.

---

## 9. Sinalizadores de Planning Poker mal feito

| Sintoma | Causa provável | Ação |
|---|---|---|
| Todo mundo vota o mesmo número sempre | Ancoragem (alguém comenta antes) ou groupthink | Lembrar: silêncio antes de virar |
| Divergência crônica em toda story | Time não compartilha visão de domínio | Investir em onboarding + refinamento prévio |
| Muitos `?` | Backlog não refinado | Voltar para refinamento; agendar Three Amigos |
| Muitos `100` | Stories grandes demais | Fatiar antes do planning |
| Equipe estima sempre baixo | Otimismo + medo de "ser lento" | Comparar com history; mostrar velocity |
| Equipe estima sempre alto | Defensa contra cobrança ou risco real | Investigar cause-root: é estimativa ou risco? |
| Velocity flutua >30% sprint-a-sprint | Estimativa inconsistente ou eventos externos | Estabilizar equipe; introduzir buffer técnico |

---

## 10. Variações úteis

### 10.1 T-shirt sizing (estágio inicial, backlog cru)

Em vez de números, use **PP, P, M, G, GG**. Útil para **épico inteiro** quando ainda não tem detalhe.

```
Epic "Notificações push" — T-shirt: GG
Epic "Theme switcher dark mode" — T-shirt: M
Epic "Adicionar avatar no perfil" — T-shirt: P
```

Depois converte para Fibonacci quando fatiar em features/US.

### 10.2 Bucket System (50+ items rapidamente)

Para backlog grande, dispensa Poker tradicional:

1. Coloca todas as stories num lado
2. Escolhe 1 representante de cada "complexidade típica" (1, 3, 8, 21)
3. Equipe **move stories** para o bucket que cabem
4. Discute só os limites (entre 1 e 3, entre 8 e 13)

**Tempo**: 50 stories em ~1h. Sacrifica precisão por velocidade.

### 10.3 Magic Estimation (totalmente silencioso)

Variação: equipe estima 30+ stories **sem falar**, movendo cards numa linha de complexidade. Discute só ao final.

---

## 11. Pós-estimativa: Definition of Ready

Antes de uma US entrar na sprint, deve ter:

- [ ] Título curto descritivo
- [ ] BDD na descrição (DADO/QUANDO/ENTÃO)
- [ ] CAs associados via relações
- [ ] Story points estimados
- [ ] INVEST validado
- [ ] Definição de "pronto" (Definition of Done) clara
- [ ] Sem dependências externas bloqueadoras

Falta qualquer um → **NÃO entra na sprint.** Vai para refinamento.

---

## 12. Conexão com as próximas references

- **Validação (Falbo 7 dimensões + Sommerville 5 conferências)**: [06-validacao.md](06-validacao.md)
- **Gestão de mudança quando estimativa erra muito**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
