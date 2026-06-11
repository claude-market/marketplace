# 01 — Fundamentos de Engenharia de Requisitos

> Base teórica que precede qualquer atividade prática. Combina Sommerville 10e (Cap. 4), Pressman 9e (7 etapas), Wiegers 3e, Thayer (IEEE Computer Society Press), e as definições conceituais que aparecem repetidas em todas as 11 aulas IFPB.

---

## 1. O que é um requisito

**Não há consenso na indústria sobre a definição.** Davis (1993) explica por quê: numa licitação, o requisito precisa ser abstrato (vários fornecedores podem competir); no contrato assinado, precisa ser detalhado o suficiente para que o cliente valide a entrega. As duas necessidades coexistem no mesmo documento.

Três definições canônicas que valem ler juntas:

**Sommerville (10e, cap. 4)**:
> Os requisitos de um sistema são as **descrições dos serviços que ele deve prestar e as restrições à sua operação**. Refletem as necessidades dos clientes para um propósito específico.

**Pressman (9e)**:
> Requisito é uma **especificação do que deve ser implementado**, ou algum tipo de **restrição** do sistema.

**IEEE Std (Glossary of SE Terminology)** — apresenta 3 sentidos complementares:
1. Uma condição ou capacidade **necessária a um usuário** para resolver um problema ou alcançar um objetivo.
2. Uma condição ou capacidade que deve ser **alcançada ou possuída por um sistema** (ou componente do sistema) para satisfazer um contrato, padrão, especificação ou outros documentos formalmente expostos.
3. Uma **representação documentada** de uma condição ou capacidade como nos itens 1 e 2.

Note como Sommerville foca em "o que o sistema faz/restringe", Pressman foca em "o que deve ser implementado/restringido", e o IEEE separa o requisito **conceitual** (1 e 2) do requisito **documentado** (3). Os três sentidos convivem.

**Engenharia de Requisitos (ER)** é o processo de descobrir, analisar, documentar e conferir esses serviços e restrições. Thayer formula que ER fornece o mecanismo para "**entender aquilo que o cliente deseja**, analisando as **necessidades**, avaliando a **viabilidade**, **negociando soluções**, **especificando-as sem ambiguidade** e **gerenciando suas mudanças**".

---

## 1.5 Requisitos no ciclo de vida do software (Sommerville Figs 2.1–2.3)

**Independente do modelo de processo escolhido**, requisitos são sempre a etapa inicial. Sommerville (cap. 2) mostra três modelos clássicos com a mesma observação:

| Modelo | Etapa inicial obrigatória |
|---|---|
| **Cascata (Fig 2.1)** | Definição dos requisitos → projeto → implementação/teste → integração/teste → operação/manutenção |
| **Incremental (Fig 2.2)** | Descrição geral → especificação → desenvolvimento → validação (ciclos) → versões intermediárias → versão final |
| **Orientado a reúso (Fig 2.3)** | Especificação dos requisitos → descoberta/avaliação do software → refinamento dos requisitos → configuração/adaptação/desenvolvimento → integração |

> Em **qualquer fluxo de desenvolvimento** — cascata clássica, incremental, ágil/Scrum, reúso, dirigido a modelos —, a primeira atividade é **entender e especificar o que precisa ser construído**. Muda a granularidade (cascata = doc detalhado upfront; ágil = backlog incremental refinado por sprint), mas não a posição na cadeia: **sem requisito, não há o que projetar**.

### Por que essa observação é importante (analogia profissional — AULA 01 IFPB)

A AULA 01 abre com uma reflexão: **em outras engenharias, ninguém produz sem projeto antes**:

- **Engenheiros mecânicos fazem desenhos** antes de produzirem máquinas (furadeira, motor).
- **Engenheiros eletrônicos fazem esquemas** antes de produzirem equipamentos (placa Arduino).
- **Engenheiros civis fazem plantas** antes de produzirem prédios.

**Engenheiros de software**, frequentemente, partem direto para o código — como se fossem "superdotados pela Mãe Natureza" que dispensariam projeto. Resultado: **software construído como casa de cachorro** — pode até segurar a chuva, mas não suporta crescimento, não é manutenível, e quando o cliente pede uma sala extra a estrutura desaba.

A profissão de software tem ~70 anos (Sommerville). É a mais nova das engenharias. A imaturidade explica — não justifica — a permanência da prática "codar sem requisito". ER é o que coloca SW no mesmo patamar das outras engenharias.

### A charge canônica (referência cultural)

A imagem icônica do **balanço na árvore em 12 painéis** ("Como o cliente explicou / Como o líder de projeto entendeu / Como o analista planejou / Como o programador codificou / Como os beta testers receberam / Como o consultor de negócios descreveu / Valor que o cliente pagou / Como o projeto foi documentado / O que a assistência técnica instalou / Como foi suportado / Quando foi entregue / **O que o cliente realmente queria**") é a referência cultural mais usada para explicar a importância da ER. Cada caixa representa uma camada de tradução — e cada tradução perde informação.

ER existe justamente para **comprimir a perda entre as caixas**, validando o entendimento em cada elo da cadeia.

---

## 1.5.1 Técnicas modernas complementares — MVP e Testes A/B (Valente 2020)

Marco Tulio Valente em *Engenharia de Software Moderna* (cap. 3, disponível em [engsoftmoderna.info](https://engsoftmoderna.info)) acrescenta às técnicas clássicas duas que vieram do mundo ágil e do lean startup, e que pertencem ao conjunto de ferramentas do engenheiro de requisitos contemporâneo:

### MVP — Produto Mínimo Viável

**Definição**: a menor versão funcional de um produto capaz de **gerar aprendizado validado** sobre o cliente com o mínimo de esforço. É um instrumento de **descoberta de requisitos por experimentação no mundo real** — em vez de só elicitar o que o cliente diz que quer, observe o que ele faz com uma versão básica e ajuste o backlog.

**Como conecta com a skill**:
- Substitui parte da elicitação clássica em **projetos com alta incerteza** (produto novo, mercado novo, persona não-validada) — onde entrevistas e questionários falham porque ninguém sabe responder.
- Não substitui CAs, BDD ou stakeholders identificados — apenas **comprime o ciclo descoberta → especificação → validação** em iterações de semanas em vez de meses.
- Anti-padrão: confundir MVP com "primeira versão crua sem qualidade". MVP é mínimo em **escopo**, não em qualidade dos requisitos especificados para esse escopo mínimo.

### Testes A/B

**Definição**: experimento controlado em que dois grupos de usuários recebem versões diferentes de uma feature (variante A vs variante B), e métricas de negócio (conversão, retenção, tempo de tarefa) decidem qual fica.

**Como conecta com a skill**:
- Ferramenta de **validação quantitativa de requisitos** quando há ambiguidade entre stakeholders ("o botão deve ser azul ou vermelho?" → teste A/B decide com dados).
- Combina com **RNFs de produto** (taxa de conversão, tempo p95, abandono no formulário) — o A/B mede impacto real, não estimado.
- Anti-padrão: A/B testar tudo. Funciona quando há **hipótese clara + métrica direta + volume estatisticamente significativo**. Sem essas 3, é teatro de dados.

### Fontes Valente (livros digitais gratuitos)

- *Engenharia de Software Moderna* — [engsoftmoderna.info](https://engsoftmoderna.info), cap. 3 cobre Requisitos com foco em histórias, casos de uso, MVP e A/B.
- *Fundamentos de Manutenção de Software* — [manutencaosoftware.org](https://manutencaosoftware.org), relevante para a fase pós-entrega (cap. 4 breaking changes, cap. 7 dívida técnica, cap. 8 descontinuação) — conecta com [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md) e §3.6 de [09-etica-sbc.md](09-etica-sbc.md).

---

## 1.6 Casos reais de falha por requisitos mal feitos

A AULA 01 IFPB monta o argumento com sete casos públicos. Todos são exemplos de **erro que não foi de código** — foi de requisito incompleto, ambíguo, mal validado ou ignorado.

| Caso | Ano | Custo / impacto | Causa-raiz de requisito |
|---|---|---|---|
| **Mariner 1** (NASA) | 1962 | US$ 18,5 milhões | Fórmula transcrita errada para o código; **especificação não exigia smoothing function**. Foguete destruído 293s após decolagem. |
| **Hartford Coliseum Collapse** | 1978 | US$ 70M + US$ 20M de danos | Software estrutural não considerou neve real; **requisito de carga foi mal especificado**. |
| **Citibank** | 2021 | US$ 500M perdidos (queria pagar US$ 7,8M, mandou US$ 900M) | **Design de UI mal especificado**: o operador clicou "ok" achando que confirmava o juros, na verdade pagou o principal. |
| **UEFA Champions League** | 2021 | Sorteio anulado (vergonha pública) | Erro de software no sistema que define duelos das oitavas. Requisito de regras de cabeças-de-chave mal implementado. |
| **INSS aposentadoria** | 2020 | Trabalhadora com direito não conseguia pedir | Site do INSS apresenta erro genérico ("Tente novamente mais tarde"). Requisitos de fluxo de exceção mal especificados. |
| **IPTU São Paulo** | 2019 | 90 mil imóveis com aumento de até 50% indevido | Falha de cálculo no sistema da Secretaria da Fazenda — **regra de negócio mal especificada**. |
| **Boeing 737 MAX** | 2018–2019 | 300+ mortes em 2 quedas | MCAS (sistema de estabilização) com **requisitos de segurança incompletos**: confiava num único sensor de ângulo de ataque, sem redundância. Resultado: bug fatal. |

Estes casos viraram a frase de Brooks: *"the hardest single part of building a software system is deciding precisely what to build"*. Pressman ecoa: "Os bons projetos não saem da cabeça do engenheiro; saem da **conversa rigorosa** com quem vai usar."

> **Lição prática para o backlog**: cada CA mal especificado é um vetor latente desse tipo de catástrofe. Por isso a regra dura da skill: CA testável, com métrica, validado pelo stakeholder.

---

## 2. Dois níveis: usuário e sistema

| Aspecto | Requisito de **Usuário** | Requisito de **Sistema** |
|---|---|---|
| Audiência | Cliente, gerente, usuário final, regulador | Dev, arquiteto, tester, equipe de manutenção |
| Linguagem | Natural + diagramas + tabelas simples | Natural estruturada / templates / UML / fórmulas |
| Nível de detalhe | Abstrato, alto-nível | Preciso, exato, contratual |
| Exemplo (Mentcare) | "O sistema deve gerar relatórios mensais de custo de medicamentos por clínica." | "1.1 No último dia útil do mês, gerar resumo com nome do medicamento, quantidade de prescrições, dose total e custo. 1.5 Acesso restrito a usuários autorizados conforme lista de controle." |

**Ambos coexistem no mesmo documento.** Stakeholder leigo lê o de cima; dev implementa o de baixo. Sem o nível usuário, o cliente não valida; sem o de sistema, o dev adivinha.

---

## 3. RF vs RNF: a distinção crítica

### 3.1 Requisito Funcional (RF)

Descreve **o que** o sistema faz: serviços, entradas, saídas, comportamento, exceções. Em alguns casos, declara também o que o sistema **não deve fazer**.

Exemplos (Mentcare):
- "Um usuário deve poder fazer uma busca na lista de consultas de todas as clínicas."
- "O sistema deve gerar, a cada dia e para cada clínica, uma lista de pacientes que devam comparecer naquele dia."
- "Cada membro da equipe que utiliza o sistema deve ser identificado exclusivamente por seu número de funcionário de oito dígitos."

### 3.2 Requisito Não Funcional (RNF)

Restrição **sobre** os serviços ou funções. Frequentemente se aplica ao sistema **inteiro**, não a uma feature isolada.

**Classificação Sommerville (Fig 4.3):**

```
                          RNFs
        ┌──────────────────┼──────────────────┐
        │                  │                  │
     PRODUTO        ORGANIZACIONAL          EXTERNO
        │                  │                  │
    ┌───┼───┐         ┌────┼────┐         ┌───┼───┐
 Desemp.  Confiab.  Processo  Padrão  Regulatório  Legal
 Segurança Usabil.  Operac.   de dev. (LGPD, BACEN) Ético
```

**Exemplos Mentcare (Fig 4.4):**
- **Produto**: "Disponível para todas as clínicas em expediente (seg-sex, 8h30-17h30), com indisponibilidade máxima 5s/dia."
- **Organizacional**: "Usuários se identificam pelo cartão de identificação da autoridade de saúde."
- **Externo**: "Implementar providências para privacidade do paciente conforme HStan-03-2006-priv."

### 3.3 Por que RNFs são MAIS críticos que RFs

Sommerville (4.1.2): *"Descumprir um requisito não funcional pode significar a inutilização total do sistema."*

- Sistema funciona, mas é lento → usuários abandonam
- Sistema funciona, mas vaza dados → multa LGPD + reputação destruída
- Sistema funciona, mas não passa em homologação → não pode entrar em produção
- Avião funciona, mas não atende confiabilidade → não pode voar

**RFs individuais podem ter workaround. RNFs raramente.**

### 3.4 Regra de ouro: RNF tem que ser quantificável

**Errado**: "O sistema deve ser fácil de usar."
**Certo**: "Após 2h de treinamento, usuário experiente deve cometer ≤2 erros/h ao executar tarefas T1, T2, T3."

**Métricas para RNFs (Sommerville Fig 4.5):**

| Propriedade | Métrica |
|---|---|
| Velocidade | Transações/s; tempo de resposta; tempo de atualização da tela |
| Tamanho | MB; chips ROM |
| Facilidade de uso | Tempo de treinamento; nº de quadros de ajuda |
| Confiabilidade | MTBF (tempo médio até falha); probabilidade de indisponibilidade; taxa de falhas |
| Robustez | Tempo para reinício; % eventos causando falha; probabilidade de corromper dados |
| Portabilidade | % de código dependente da plataforma; nº de plataformas-alvo |

---

## 4. Requisitos de domínio

Sub-categoria atravessada. **Derivados do domínio de aplicação, não dos usuários.** Podem ser novos RFs, restrições sobre RFs existentes, ou regras de cálculo específicas.

**Problema crítico**: o engenheiro de software pode desconhecer características do domínio → requisito passa despercebido OU entra em conflito silencioso com outro.

**Exemplo IFPB-Controle Dopagem**: regra G14 — "ATLETA classificado tem prioridade automática em sorteio para teste antidoping". Esse não veio do usuário, veio do **código da WADA** (World Anti-Doping Agency) que rege o domínio.

**Estratégia**: sempre que possível, ter um especialista do domínio (médico, advogado, contador, esportista) participando da revisão.

---

## 5. Stakeholders

**Todos os afetados pelo sistema, direta ou indiretamente.** Não restringir a "usuário final".

**Exemplo Sommerville-Mentcare — 8 categorias:**
1. Pacientes (dados registrados) e familiares
2. Médicos (avaliação/tratamento)
3. Profissionais de enfermagem (coordenação/admin. de tratamentos)
4. Recepcionistas (agenda)
5. Equipe de TI (instalação/manutenção)
6. Gestor de ética médica (conformidade ética)
7. Gestores de saúde (informação gerencial)
8. Controle de prontuário (auditoria/retenção)

**Como mapear stakeholders (Wiegers 2003):**

1. Identificar **classes de usuários** agrupando por:
   - Frequência de uso
   - Experiência no domínio
   - Perícia com sistemas computadorizados
   - Características do sistema que usam
   - Tarefas que realizam no processo de negócio
   - Níveis de privilégio de acesso e segurança

2. **Selecionar representantes** de cada classe (não todos — amostra gerenciável)

3. Estabelecer **acordo sobre quem decide** quando houver conflito de prioridade

**Stakeholder esquecido = requisito esquecido.** Pior: aparece tarde no projeto (geralmente em homologação) e exige refactor.

---

## 6. Estudo de viabilidade (FAÇA antes de qualquer planejamento)

**Pré-requisito de qualquer projeto.** 3 perguntas (Sommerville):

1. **O sistema contribui para os objetivos da organização?**
2. **Pode ser implementado dentro do cronograma e orçamento usando tecnologia atual?**
3. **Pode ser integrado com os outros sistemas em uso?**

Qualquer "não" → projeto provavelmente não deve prosseguir. Saída saudável: cancelar agora custa baixo; cancelar em 6 meses custa altíssimo.

---

## 7. O processo de ER (a espiral)

**Sommerville Fig 4.6** — processo iterativo (não cascata):

```
                     ┌─→ Especificação ─→ Documento de
                     │   de requisitos    requisitos
                     │                     │
        Especific.   │                     │ retorno
        inicial      │                     ↓
                     │              Validação
                     ↑                de requisitos
                Elicitação                  │
                e análise ←──────────────────┘
                de requisitos
                     ↑
                     │
              decisão de viabilidade
              + entradas externas
```

A quantidade de tempo dedicada a cada atividade varia por iteração. No início, foco em **negócio + RNFs + requisitos de usuário**. Em iterações mais avançadas, foco em **detalhamento técnico dos requisitos de sistema**.

**A espiral acomoda ágil**: cada volta da espiral pode coincidir com uma sprint, e o desenvolvimento incremental substitui a prototipação formal.

### 7.1 Sub-processo dentro da Elicitação (Sommerville Fig 4.7)

```
   ┌──────────────────────┐
   │ 1. Descoberta e      │
   │    compreensão       │←─────────────────┐
   │                      │                  │
   └──────────────────────┘                  │
              ↓                              │
   ┌──────────────────────┐                  │
   │ 2. Classificação e   │                  │
   │    organização       │                  │
   └──────────────────────┘                  │
              ↓                              │
   ┌──────────────────────┐                  │
   │ 3. Priorização e     │                  │
   │    negociação        │                  │
   └──────────────────────┘                  │
              ↓                              │
   ┌──────────────────────┐                  │
   │ 4. Documentação      │──────────────────┘
   │                      │   loop com feedback
   └──────────────────────┘   contínuo
```

**É comum identificar novos requisitos durante o ciclo** — a espiral interna existe para acomodar isso sem reescrever do zero.

### 7.2 Pressman: 7 etapas (visão complementar)

1. **Concepção** — clarificar a natureza do problema
2. **Levantamento** — coletar requisitos das fontes
3. **Elaboração** — refinar, expandir, modelar
4. **Negociação** — resolver conflitos entre stakeholders
5. **Especificação** — escrever documento canônico
6. **Validação** — verificar com cliente
7. **Gestão** — controlar mudanças ao longo do ciclo

Não é incompatível com Sommerville — é um corte diferente (mais granular) do mesmo processo.

---

## 8. Compreensão necessária ANTES de elicitar (AULA 02 IFPB)

Antes de a equipe começar a entrevistar ninguém, deve-se:

1. **Compreender os objetivos gerais do negócio** + restrições (orçamento, cronograma, interoperabilidade)
2. **Levantar contexto de desenvolvimento** — organização onde o sistema será implantado, domínio da aplicação, sistemas existentes a serem substituídos
3. **Organizar informações + descartar irrelevantes + priorizar metas organizacionais**
4. **Identificar stakeholders + seus papéis**

Pular esta etapa → entrevista inicia sem foco, perde tempo do entrevistado (custo político), gera requisitos rasos.

---

## 9. As 4 dimensões da Descoberta/Compreensão (Falbo)

Cada novo projeto precisa cobrir:

1. **Domínio da Aplicação** — entendimento geral da área (saúde, esporte, educação, finanças)
2. **Problema a ser solucionado** — detalhes do problema específico
3. **Necessidades e restrições dos interessados** — o que cada stakeholder precisa, processos atuais que serão apoiados/substituídos
4. **Contexto do negócio** — como o sistema afetará a organização, como contribuirá para objetivos estratégicos

Frequentemente representadas como **quadrante**:

```
     Domínio da     │  Problema a ser
     Aplicação      │  solucionado
     ───────────────┼──────────────────
     Necessidades   │  Contexto
     e restrições   │  do negócio
     dos envolvidos │
```

---

## 10. Quando dispensar formalidade

Sistemas pequenos / startups / MVPs podem trabalhar com:

- Cartões/wiki ao invés de documento ABNT
- Histórias informais ao invés de SRS-IEEE
- Conversa direta ao invés de entrevistas formais

**Mas as 4 dimensões + 3 perguntas de viabilidade + identificação de stakeholders permanecem.** O que muda é o formalismo do registro, não a substância.

**Antipattern**: usar "somos ágeis" como pretexto para pular elicitação. Manifesto Ágil prioriza "indivíduos e interações" — isso INCLUI análise dos stakeholders, não as exclui.

---

## 11. Sinalizadores ("smells") de elicitação mal feita

- Stakeholder fala em jargão técnico e o analista assente sem entender
- Requisitos são todos do tipo "deve ser bom/rápido/fácil" (qualitativos, não testáveis)
- Não há nenhum requisito não funcional na lista
- Lista de stakeholders tem apenas "usuário final"
- Não há requisitos derivados do domínio
- Ninguém perguntou sobre os sistemas existentes que serão substituídos
- A primeira reunião com o cliente já fala em telas/wireframes

Qualquer um desses → volte para a Fase A.

---

## 12. Conexão com as próximas references

- **Como elicitar**: [02-elicitacao.md](02-elicitacao.md)
- **Como especificar (Epic → Feature → US → CA)**: [03-especificacao.md](03-especificacao.md)
- **CA + BDD**: [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md)
- **Como dimensionar**: [05-estimativa.md](05-estimativa.md)
- **Como validar**: [06-validacao.md](06-validacao.md)
- **Como gerenciar mudança**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
- **Análise de negócio (camada acima)**: [08-analista-negocios.md](08-analista-negocios.md)
- **Ética (camada transversal)**: [09-etica-sbc.md](09-etica-sbc.md)
