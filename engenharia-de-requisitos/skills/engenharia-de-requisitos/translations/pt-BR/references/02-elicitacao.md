# 02 — Elicitação de Requisitos

> Como descobrir o que o sistema deve fazer. Combina AULAS 04-06 IFPB + Sommerville 4.3. Seis técnicas: entrevistas, questionários, brainstorming/workshops, etnografia, análise de documentos, histórias e cenários. Nenhuma sozinha basta — combine ≥2.

---

## 1. O que é elicitação

**Não é "pegar requisitos" — é descobri-los, em colaboração com stakeholders.** Sommerville (4.3): "Os engenheiros de software trabalham com os stakeholders para saber mais sobre o domínio da aplicação, as atividades envolvidas no trabalho, os serviços e características do sistema que eles querem, o desempenho desejado, as limitações de hardware etc."

Os stakeholders **não sabem** o que querem completamente. Você ajuda a articular.

---

## 2. As 5 dificuldades fundamentais (Sommerville)

1. **Stakeholders não sabem o que querem** em aspectos específicos, só em gerais. Acham difícil articular. Fazem exigências irreais por não saber o que é viável.
2. **Expressam em seus próprios termos** com conhecimento implícito. Eng. sem experiência no domínio entende errado.
3. **Stakeholders diferentes expressam de modos diferentes.** Eng. precisa descobrir TODAS as fontes + pontos de convergência + conflito.
4. **Fatores políticos** influenciam. Gerente exige requisito específico para ampliar sua influência.
5. **Ambiente econômico/negócio é dinâmico** — muda durante o processo. Requisitos podem surgir/desaparecer; stakeholders novos podem entrar.

### 2.1 Christel & Kang (apud Pressman, 2006) — 3 categorias adicionais

- **Problemas de escopo**: fronteiras mal definidas; cliente especifica detalhes técnicos desnecessários que confundem
- **Problemas de entendimento**: clientes não estão certos do necessário; pouca compreensão das capacidades do ambiente computacional; omitem informação "óbvia"; especificam requisitos ambíguos ou impossíveis de testar
- **Problemas de volatilidade**: requisitos mudam ao longo do tempo

### 2.2 Kotonya — barreiras adicionais

- Muitos termos desconhecidos / manuais técnicos
- Especialistas do problema são ocupados (não têm tempo para o analista)
- Políticas organizacionais (decisões reais ≠ org chart)

---

## 3. As 6 técnicas (visão comparada)

| Categoria | Técnicas | Quando usar | Vantagens / Limitações |
|---|---|---|---|
| **Entrevistas** | Individuais ou em grupo | Há stakeholders disponíveis e boa comunicação | Alta qualidade da informação, mas depende da habilidade do entrevistador |
| **Questionários** | Estruturados ou abertos | Muitos usuários dispersos | Rápida coleta, mas respostas superficiais |
| **Workshops / Brainstorming** | Sessões colaborativas | Há necessidade de consenso / inovação | Promove integração, mas pode gerar conflitos / groupthink |
| **Observação / Etnografia** | Acompanhar trabalho real | Quer entender processos reais (vs formais) | Revela requisitos tácitos, mas é demorado |
| **Análise de documentos** | Leitura de sistemas e relatórios existentes | Manutenção, substituição, processos formais documentados | Ajuda contexto, mas não revela novas necessidades |
| **Histórias e cenários** | Texto narrativo / fluxo estruturado | Cliente leigo; discussão exploratória | Fácil para todos, mas pouco preciso |

**Regra**: nenhuma técnica isolada é suficiente. Combine sempre 2+ (entrevista → questionário; observação + análise docs; brainstorming → protótipo).

---

## 4. Entrevistas (a técnica mais comum — Aurum & Wohlin 2005)

### 4.1 Definição

Conversa direcionada com propósito específico, formato pergunta-resposta (Kendall & Kendall 2010). Requisitos derivam das respostas (Sommerville 2007).

### 4.2 Quando usam bem

- Obter objetivos organizacionais e pessoais
- Entendimento geral do problema + interação com novo sistema
- Sentimentos do entrevistado sobre sistemas atuais
- Levantar procedimentos informais

### 4.3 Tipos (Sommerville)

- **Fechadas** — conjunto predefinido de perguntas
- **Abertas** — sem programação; exploração ampla

Na prática, **mistura**. Discussões totalmente abertas raramente funcionam. Comece com algumas perguntas para focar.

### 4.4 Planejamento — 5W (Kendall & Kendall 2010)

| W | Pergunta | Resposta |
|---|---|---|
| **Por que** | Objetivos da entrevista | 1as entrevistas exploratórias (capturar objetivos organizacionais); depois foco restrito |
| **Quem** | Quem entrevistar | Identificar quem tem conhecimento; papel/posição (alta gerência → visão; operacional → detalhe). Cliente ajuda a indicar |
| **Quando** | Data, hora, duração | Marcar com antecedência (alguns dias); informar objetivo e tema. Duração: 1h (focada), até 2h (exploratória/alta gerência) |
| **Onde** | Local | Normalmente no local de trabalho do entrevistado |
| **Como** | Preparação | Tipos de questão, redação, ordem, modo de registro |

### 4.5 Passos de Kendall & Kendall

1. **Estudar material existente** sobre domínio e organização (vocabulário comum, evita perguntas básicas)
2. **Estabelecer objetivos** (fontes de informação, formatos, frequência/estilo de decisão)
3. **Decidir quem entrevistar** (pessoas-chave de cada classe; cliente ajuda)
4. **Preparar o entrevistado** (marcar com antecedência, tema)
5. **Preparar a entrevista** (tipos de questão, estrutura, registro)

### 4.6 Tipos de questões

| Tipo | O que é | Exemplos | Pontos positivos | Desvantagens |
|---|---|---|---|---|
| **Subjetivas** | Respostas abertas | "O que você acha de…?", "Explique como…" | Riqueza de detalhes; novos questionamentos; espontaneidade | Detalhes irrelevantes; perda de controle; respostas longas; passa impressão de analista perdido |
| **Objetivas** | Respostas limitadas | "Quantos…?", "Quem…?", "Quanto tempo…?", "Qual das seguintes…?" | Tempo eficiente; mantém controle; dados relevantes | Maçantes; perdem detalhes importantes; não criam afinidade |
| **Aprofundamento (probing)** | Exploram detalhes | "Por quê?", "Você pode dar um exemplo?", "Como isso acontece?" | Subjetivas ou objetivas | — |

**Tabela síntese Kendall & Kendall 2010 (Tab 3.1):**

| Critério | Subjetivas | Objetivas |
|---|---|---|
| Confiabilidade dos dados | Baixa | Alta |
| Uso eficiente do tempo | Baixo | Alto |
| Precisão dos dados | Baixa | Alta |
| Amplitude e profundidade | Alta | Baixa |
| Habilidade requerida do entrevistador | Alta | Baixa |
| Facilidade de análise | Baixa | Alta |

### 4.7 Estruturas da entrevista

- **Pirâmide (indutivo)**: começa com específicas → termina com gerais. Útil quando entrevistado precisa de "aquecimento" ou quando se quer fechar com visão geral
- **Funil (dedutivo)**: começa com gerais subjetivas → termina com específicas objetivas. **Estrutura padrão para começar** uma bateria; amigável; evita longas sequências objetivas
- **Diamante**: pirâmide invertida + pirâmide. Específica → geral → específica. Boa para manter interesse; tende a ser longa

### 4.8 Estruturada vs não-estruturada (Tab 3.2 Kendall & Kendall)

| Critério | Não Estruturada | Estruturada |
|---|---|---|
| Avaliação | Mais difícil | Mais fácil |
| Tempo requerido | Maior | Menor |
| Treinamento requerido | Maior | Menor |
| Espontaneidade | Maior | Menor |
| Oportunidades de insight | Maior | Menor |
| Flexibilidade | Maior | Menor |
| Controle | Menor | Maior |
| Precisão | Menor | Maior |
| Confiabilidade | Menor | Maior |
| Amplitude/profundidade | Maior | Menor |

### 4.9 Entrevista eficaz — 5 práticas

1. **Construir base de confiança** + entendimento
2. **Manter controle** da entrevista
3. **Vender a ideia do Sistema** — informações relevantes ao entrevistado
4. **Mente aberta** — evitar pré-concepções, disposição para ouvir
5. **Incentivar com trampolim**: pergunta-gancho ou proposta de requisito. "Diga-me o que você quer" **NÃO** funciona — é mais fácil falar em contexto definido

### 4.10 Registro

3 opções, com trade-offs:

| Forma | Vantagens | Desvantagens |
|---|---|---|
| **Gravação/filmagem** | Registro completo + reproduzível | Entrevistado desconfortável; entrevistador distraído; transcrição custosa; perigoso confiar para "tirar dúvidas depois" |
| **Anotações** | Mantém alerta; esquema = roteiro; mostra interesse | Compromete andamento; foco em fatos, perde sentimentos |
| **Relatório/ata** | Captura pontos principais | Deve ser escrito rapidamente para qualidade |

**Itens obrigatórios da ata** (Kendall & Kendall):
- Entrevistado(s) + Entrevistador(es)
- Data e hora + Duração
- Assunto + Objetivos
- Principais pontos discutidos

**Após escrever, enviar para todos os participantes validarem (validação de achados).**

---

## 5. Questionários (surveys)

### 5.1 Definição (Kendall & Kendall)

Captura, de várias pessoas afetadas pelo sistema:

- **Atitudes** — o que dizem querer
- **Crenças** — o que pensam ser realmente verdade
- **Comportamento** — o que fazem
- **Características** — propriedades de pessoas/coisas

### 5.2 Quando usar

- Stakeholders geograficamente dispersos
- Grande N e precisa saber proporção que aprova/desaprova
- Estudo exploratório (opinião global antes de definir direção)
- Confirmar que problemas identificados em entrevistas atingem amostra maior

### 5.3 Entrevistas vs Questionários

| Aspecto | Entrevistas | Questionários |
|---|---|---|
| Objetivo principal | Detalhadas, qualitativas | Amplas, quantitativas |
| Forma de interação | Direta, pessoal | Indireta, assíncrona |
| Profundidade | Alta | Baixa |
| Quantidade de participantes | Poucos (1-10/rodada) | Dezenas/centenas |
| Tempo e custo | Elevado | Reduzido |
| Flexibilidade | Alta (analista adapta) | Baixa (perguntas fixas) |
| Tipo de dado | Qualitativo | Quantitativo |
| Quando | Profundidade + motivações | Abrangência + tendências |
| Limitação principal | Habilidade do entrevistador | Pouca profundidade |

### 5.4 Uso combinado

**Entrevista → Questionário** (entrevista descobre temas; questionário quantifica em amostra).
**Questionário → Entrevista** (refinar respostas não claras).

### 5.5 Tipos de escala (para perguntas fechadas)

| Tipo | O que mede | Tipo de dado | Exemplo |
|---|---|---|---|
| **Nominal** | Categorias distintas | Qualitativo | "Qual seu perfil?" ( ) Estudante ( ) Professor ( ) Outro |
| **Ordinal** | Ranking sem intervalo numérico | Qualitativo ordenado | "Com que frequência usa?" ( ) Raramente ( ) Às vezes ( ) Frequentemente ( ) Sempre |
| **Intervalar (Likert)** | Intensidade em intervalos iguais | Quantitativo | "Concordo que o sistema atende" 1-Discordo totalmente … 5-Concordo totalmente |
| **Numérica (0-10)** | Valor numérico em escala contínua/discreta | Quantitativo | "Avalie de 0 a 10 sua satisfação" |
| **Diferencial semântico** | Pares opostos de adjetivos | Misto | "A interface é: Difícil ↔ Fácil" |
| **Escolha forçada (ranking)** | Ordenar por preferência | Quantitativo ordinal | "Ordene as funcionalidades por importância (1 a 4)" |

**Regra crítica**: cada escala define **como você pode tratar estatisticamente o resultado**. Calcular média em escala ordinal é estatisticamente inválido — use mediana ou ranking.

### 5.6 Os 8 problemas com escalas + mitigação

| Problema | Mitigação |
|---|---|
| Ambiguidade ("rápido", "fácil") | Especificar contexto ("em menos de 5s", "em horários de pico") |
| Resposta neutra / socialmente desejada (centralização, aquiescência) | Afirmações balanceadas (positivas + negativas); escalas com nº par de opções (sem ponto neutro) |
| Escalas mal calibradas (intervalos desiguais) | Padronizar (todas 5 ou 7 pontos; rótulos proporcionais) |
| Excesso de escalas (fadiga cognitiva) | Máximo 2-3 tipos por questionário; aplicação piloto |
| Escala vs objetivo desalinhados (ordinal medindo intensidade) | Definir tipo de info desejada PRIMEIRO; depois escolher escala |
| Interpretação incorreta (média em ordinal) | Médias só com intervalar/numérica; ordinal usa mediana/frequência/ranking |
| Questionários longos/repetitivos | 10-12 perguntas relevantes; variar fechado/aberto; agrupar |
| Falta de contexto | Frase curta antes de cada escala |

### 5.7 Diretrizes Kendall & Kendall 2010

- Espaços em branco (legibilidade)
- Espaço suficiente para respostas abertas
- Marcação clara para objetivas
- Estilo consistente

---

## 6. Workshops e Brainstorming

### 6.1 Brainstorming (Alex Osborn, 1940)

Geração colaborativa de ideias, **sem julgamentos** ou críticas durante a fase inicial. Na ER:

- Coleta ideias de múltiplos stakeholders rapidamente
- Explora perspectivas de uso
- Identifica funcionalidades novas ou alternativas para conflitos

### 6.2 Quando usar

| Contexto | Aplicação |
|---|---|
| Início do projeto | Identificar funcionalidades e serviços desejados |
| Análise de requisitos | Resolver conflitos / priorizar |
| Projetos inovadores ou pouco definidos | Explorar quando o problema ainda não está totalmente compreendido |
| Equipes multidisciplinares | Alinhar visões técnica + negócio + usuário |

**Ideal para**: software novo, produtos inovadores, sistemas com múltiplos tipos de usuário.

### 6.3 Como conduzir — 4 etapas

1. **Preparação**: objetivo da sessão + participantes diversos + facilitador (moderador)
2. **Geração de ideias (fase livre)**: todos apresentam livremente; **nenhuma é julgada/criticada/filtrada**; anotar visivelmente (quadro, post-its, Miro/Mural/Trello/Jamboard)
3. **Agrupamento e discussão**: ideias semelhantes agrupadas; redundantes fundidas; inicia viabilidade + prioridade
4. **Síntese e documentação**: lista final de ideias agrupadas e selecionadas; ideias aprovadas viram requisitos funcionais ou não funcionais

### 6.4 Sete boas práticas

1. **Ambiente seguro, livre de julgamentos** — liberdade para falar
2. **Quantidade > qualidade** inicial — refinamento vem depois
3. **Valorize contribuições "fora da caixa"** — ideias incomuns inspiram
4. **Recursos visuais** — quadro, post-its, Miro/Mural/Trello/Jamboard
5. **Limite tempo de cada fase** — sessões longas geram fadiga (30-45min)
6. **Registre tudo** — nada se perde; alguém é o registrador
7. **Encerre com síntese** — destacar 3-5 ideias mais promissoras para virar requisitos

### 6.5 Cinco limitações conhecidas

- **Dominância** por participantes mais comunicativos
- **Groupthink**: convergência precoce sem explorar alternativas
- **Foco em quantidade** sem moderação → ruído > requisitos úteis
- **Dificuldade de priorização** depois (muitas, nem todas viáveis)
- **Dependência da facilitação** — qualidade do facilitador é determinante

---

## 7. Etnografia

### 7.1 Definição (Sommerville 4.3.1.2)

Técnica de observação imersiva. Analista fica no ambiente de trabalho onde o sistema será usado, observa o dia a dia, registra tarefas reais.

**Vantagem central**: descobre **requisitos implícitos** — o verdadeiro modo de trabalho, diferente dos processos formais da organização. Suchman (1983, pioneira no estudo de escritório): "Práticas de trabalho reais são muito mais ricas, complexas e dinâmicas do que os modelos simples presumidos pelos sistemas de automação."

### 7.2 Dois tipos de requisitos que ela revela bem

1. **Requisitos derivados de como as pessoas REALMENTE trabalham** (vs como o processo de negócio diz que deveriam). Ex.: controladores de tráfego aéreo desligam sistema de alerta de colisão (alerta sensível demais) e usam heurística própria
2. **Requisitos de cooperação** — conhecimento das atividades de outras pessoas. Ex.: controladores precisam ver carga de trabalho de setores adjacentes para ajustar estratégia

### 7.3 Limites (importante!)

- **Não inova**: revela como é, não como poderia ser. Caso clássico: Nokia usava etnografia para evoluir telefones; Apple **ignorou uso atual** e revolucionou com iPhone
- **Não obtém requisitos de domínio** (regras de negócio)
- **Caro** (tempo do analista no local)

**Combine sempre com outras técnicas** — confirma/nega achados de entrevistas e questionários.

### 7.4 Diretrizes (Kotonya & Sommerville 1998)

- **Tempo conhecendo as pessoas** + estabelecendo confiança
- **Presumir que pessoas são boas no que fazem** — capturar workarounds não-padronizados (eles apontam ineficiências do processo formal que foram incorporadas pela experiência)
- **Tomar notas detalhadas** durante observação; redigir relatório
- **Informar pessoas antes** sobre como será conduzido + propósito (transparência ética; ver [09-etica-sbc.md](09-etica-sbc.md) §1.6 privacidade)

### 7.5 Planejamento (5W para observação)

- O QUE observar
- QUEM observar
- QUANDO
- ONDE
- POR QUE
- COMO

### 7.6 Etnografia + Prototipação combinadas

Sommerville et al. 1993: etnografia informa o protótipo; o protótipo identifica problemas/questões para a próxima fase etnográfica. **Ciclo virtuoso**.

---

## 8. Análise de Documentos

### 8.1 Definição

Analista examina fontes de informação existentes:

- Processos atuais
- Regras de negócio
- Formulários utilizados
- Registros e relatórios
- Procedimentos operacionais
- Documentação de sistemas legados

### 8.2 Quando usar

- Sistemas que serão substituídos ou evoluídos
- Pouca disponibilidade de usuários para entrevistas
- Organizações com processos formais documentados
- Regras, restrições, obrigações legais
- Antes de entrevistas e observações (preparar vocabulário)

### 8.3 Aviso fundamental

⚠️ **Documentos mostram como o processo DEVERIA funcionar, não como realmente funciona.** Sempre combinar com entrevistas ou observação para validar a aderência ao real.

### 8.4 Tipos de documentos e o que revelam

| Tipo de documento | O que revela | Exemplos |
|---|---|---|
| Formulários e fichas | Dados necessários + fluxos de entrada | Fichas de matrícula, formulários de atendimento |
| Relatórios gerenciais | Indicadores, métricas, necessidades informacionais | Relatórios de frequência, auditorias, balanços |
| Procedimentos e normas | Regras de negócio + restrições | POPs, normas internas, políticas de acesso |
| Documentação de sistemas legados | Funcionalidades existentes + problemas | Manuais, diagramas, especificações antigas |
| E-mails e comunicados | Fluxos informais e exceções do processo | Trocas frequentes entre setores |
| Mapas de processo | Relacionamento entre atividades e atores | BPMN, fluxogramas |

### 8.5 Como conduzir — 4 passos

1. **Identificar documentos relevantes** — solicitar a stakeholders + verificar oficiais + avaliar confiabilidade e atualidade
2. **Ler e anotar** buscando:
   - Entradas e saídas de informação
   - Regras formais + exceções documentadas
   - Pontos do processo que envolvem decisões
   - Atividades que exigem interação com sistemas
3. **Extrair requisitos potenciais**, para cada documento:
   - Requisitos funcionais (ex.: "registrar solicitações")
   - Requisitos não funcionais (ex.: "registrar em até 5s")
   - Regras de negócio (ex.: "somente alunos regulares podem usar o RU")
   - Dependências externas (ex.: "integração com sistema acadêmico")
4. **Consolidar achados** — produzir:
   - Lista de requisitos extraídos
   - **Lacunas** percebidas
   - **Dúvidas** a serem validadas com usuários
   - **Contradições** entre documentos

### 8.6 Exemplo concreto — extração de um formulário

Um formulário revela:

- **Campos obrigatórios** → requisitos funcionais (sistema deve aceitar essas entradas)
- **Regras de preenchimento** → regras de negócio (formato CPF, valor mínimo)
- **Dados sensíveis** → requisitos de segurança e privacidade (LGPD)

Um POP (Procedimento Operacional Padrão) revela:

- **Ordem de atividades** → casos de uso potenciais
- **Funções de cada ator** → papéis no sistema (RBAC)
- **Práticas obrigatórias** → requisitos não funcionais (rastreabilidade, auditoria)
- **Exceções** → cenários alternativos (tratamento de erro)

### 8.7 Limitações e desafios

| Limitação | Impacto prático |
|---|---|
| Documentos desatualizados | Risco de extrair requisitos obsoletos |
| Muitas regras implícitas (não documentadas) | Perda de requisitos importantes |
| Processos formais ≠ processos reais | Falta de aderência ao uso real |
| Interpretação errada do documento | Risco de ambiguidade |
| Necessidade de validação posterior | Sempre complementar com entrevistas/observação |

### 8.8 Boas práticas

- Verificar **data e versão** dos documentos
- Consultar **diversas fontes**, não apenas um documento
- Registrar **não apenas requisitos, mas dúvidas**
- **Combinar com outras técnicas** (especialmente entrevistas)
- Identificar **inconsistências** entre documentos distintos
- Usar **matriz de requisitos extraídos**, mapas de processo, anotações estruturadas

---

## 9. Histórias e Cenários (Sommerville 4.3.2)

### 9.1 Histórias

Texto narrativo, alto nível, descreve como o sistema pode ser usado numa tarefa. **Excelente para "panorama geral"** com stakeholder leigo.

Exemplo (Sommerville, sistema iLearn): "Jack é um professor de escola primária em Ullapool. Ele decidiu que um projeto de sala de aula deveria se concentrar na indústria pesqueira da região, examinando a história, o desenvolvimento e o impacto econômico..."

### 9.2 Cenários

Versão **estruturada** da história, com campos específicos:

- **Pressuposto inicial**: estado do sistema e do usuário quando começa
- **Normal**: fluxo de eventos
- **O que pode dar errado**: exceções e tratamentos
- **Outras atividades**: o que ocorre em paralelo
- **Estado final do sistema** quando termina

Cenários alimentam diretamente RF + RNF + casos de teste.

### 9.3 Diferença para User Stories ágeis

User Stories do XP (Beck 1997+) são **cenários narrativos curtos**, não histórias para elicitar requisitos. Detalhamento em [03-especificacao.md §3](03-especificacao.md).

---

## 10. Combinações canônicas (use isto, não técnica isolada)

| Situação | Combinação recomendada |
|---|---|
| Projeto novo, domínio desconhecido | Análise de docs → entrevistas com especialistas → workshop/brainstorming → cenários |
| Sistema substituindo legado | Análise de docs (manuais antigos) → etnografia (uso real) → entrevistas |
| Produto inovador (não há sistema atual) | Brainstorming → histórias/cenários → protótipo → entrevistas para validar |
| Stakeholders muitos e dispersos | Entrevistas com amostra → questionários para quantificar |
| Stakeholders ocupados (alta gerência) | Análise de docs prévia + entrevista curta focada |
| Conflitos entre stakeholders | Workshop facilitado + cenários alternativos |
| Sistema crítico (saúde, finanças) | Todas — incluindo etnografia + revisão por especialista do domínio |

---

## 11. Sinalizadores ("smells") de elicitação ruim

- Só usou 1 técnica (geralmente "perguntei pro PO o que ele queria")
- Não há nenhum stakeholder de outras camadas (suporte, manutenção, regulador, financeiro)
- A lista de requisitos é toda "deve ser fácil/rápido/bom"
- Nenhum requisito vem de análise documental
- Não há requisitos de domínio (regras específicas da área)
- Não foram feitos cenários de exceção (só fluxo feliz)
- Stakeholder concorda com tudo (não há conflito = ninguém engajado, ou um stakeholder dominante silenciou os outros)

---

## 12. Conexão com as próximas references

Saída desta fase = entrada de [03-especificacao.md](03-especificacao.md) — onde os achados viram Epic → Feature → US → CA.
