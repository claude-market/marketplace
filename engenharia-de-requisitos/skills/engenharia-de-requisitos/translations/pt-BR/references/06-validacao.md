# 06 — Validação de Requisitos

> Como conferir que os requisitos definem o sistema que o cliente realmente quer. Combina AULA 10 IFPB + Sommerville 4.5 + Falbo (7 dimensões por requisito). Validação ≠ verificação: **validação** é "estamos construindo o sistema certo?"; **verificação** é "estamos construindo o sistema certo de forma correta?". Esta seção foca validação.

---

## 1. Por que validar é crítico

Sommerville (4.5):

> O custo de corrigir um problema nos requisitos com uma alteração no sistema normalmente é **muito maior** do que o de consertar erros de projeto ou de código. Uma mudança nos requisitos significa, geralmente, que o projeto e a implementação do sistema também deverão ser modificados.

Custo histórico ("regra do 10x" de Boehm):

```
Requisito ─→ Design ─→ Código ─→ Teste ─→ Produção
   1x         10x       100x      1000x    10000x
```

Bug em requisito que vaza para produção custa **10.000×** o custo de pegá-lo na elicitação. Toda hora gasta em validação retorna multiplicado.

---

## 2. As 5 conferências de Sommerville

> Durante a validação, diferentes tipos de conferências devem ser executados:

| # | Conferência | O que checa |
|---|---|---|
| 1 | **Validade** | Os requisitos refletem as **reais necessidades** dos usuários? Em virtude da mudança de circunstâncias, podem ter mudado desde a elicitação |
| 2 | **Consistência** | Os requisitos no documento entram em conflito entre si? Restrições contraditórias? Descrições diferentes da mesma função? |
| 3 | **Completude** | O documento inclui todos os requisitos para as funções e restrições pretendidas? |
| 4 | **Realismo** | Os requisitos podem ser implementados dentro do orçamento + cronograma proposto, usando tecnologias existentes? |
| 5 | **Verificabilidade** | É possível escrever testes que demonstrem que o sistema entregue satisfaz cada requisito? |

Cada uma é uma **pergunta a fazer ao documento de requisitos** durante a revisão.

---

## 3. As 7 dimensões de Falbo (por requisito individual)

Falbo (2012) propõe validar **cada requisito** segundo 7 propriedades:

| Dimensão | Verificação |
|---|---|
| **Completo** | Descreve a funcionalidade (RF), regra (negócio) ou restrição (RNF) inteira. Contém informações necessárias para projetar, implementar e testar |
| **Correto** | Descreve **exatamente** a funcionalidade, regra ou restrição a ser construída |
| **Consistente** | Não é ambíguo. Não conflita com outro requisito |
| **Realista** | Implementável dado a capacidade e limitações do sistema e do ambiente de desenvolvimento |
| **Necessário** | Cliente realmente precisa OU exige fator externo / padrão organizacional |
| **Passível de priorização** | Tem ordem de prioridade para facilitar gerenciamento |
| **Verificável e passível de confirmação** | Possível desenvolver testes que verifiquem se foi implementado |

### 3.1 Checklist por requisito

Antes de aceitar um requisito (ou CA, ou US) no backlog:

```
[ ] Completo     — tem entradas, saídas, exceções, contexto?
[ ] Correto      — descreve exatamente o que o stakeholder quer?
[ ] Consistente  — não conflita com nenhum outro requisito?
[ ] Realista     — cabe na stack atual + cronograma + orçamento?
[ ] Necessário   — quem precisa disto e por quê?
[ ] Priorizável  — onde fica na ordem global do backlog?
[ ] Verificável  — quais testes vou escrever para confirmar?
```

Falhou em ≥1 → **NÃO pronto.** Volte ao stakeholder.

---

## 4. As 3 técnicas de validação (Sommerville 4.5)

### 4.1 Revisões de requisitos (walkthrough)

Grupo de pessoas (cliente + dev) lê o documento em detalhes, em sessão. Conferem erros, anomalias, inconsistências.

**Procedimento típico:**

1. **Preparação**: distribuir documento 1 semana antes; revisores anotam dúvidas
2. **Sessão de revisão** (1-3h): autor apresenta, revisores apontam
3. **Registro**: ata com problemas encontrados
4. **Negociação**: cliente + dev decidem como resolver
5. **Re-revisão**: confirma correção

**Quem deve estar na sala** (regra mínima):

- Autor do documento (analista)
- 1+ stakeholder da área impactada
- 1 dev sênior (avalia realismo)
- 1 QA (avalia verificabilidade)
- Moderador / facilitador

### 4.2 Prototipação

> Desenvolvimento de modelo executável do sistema e uso desse modelo com usuários finais para ver se satisfaz suas necessidades. Stakeholders experimentam e opinam sobre mudanças nos requisitos.

**A técnica mais eficaz** porque o usuário **VÊ** o resultado. Linguagem natural sempre vaza; protótipo é concreto.

#### 4.2.1 Níveis de fidelidade

| Nível | O que é | Quando usar |
|---|---|---|
| **Baixa fidelidade (lo-fi)** | Sketches em papel; whiteboard | Início. Testar ideias rapidamente |
| **Média fidelidade** | Wireframes (Balsamiq, Pencil) | Validar fluxos + layout |
| **Alta fidelidade (hi-fi)** | Mockups (Figma, Adobe XD) | Validar visual + interação fina |
| **Funcional** | Protótipo navegável (Figma + InVision; protótipo HTML/React) | Validar usabilidade |

**Regra IFPB**: **começar simples, evoluir progressivamente, evitar apaixonar-se pelo design inicial**. A prototipação é feita para ser ajustada e descartada se necessário.

#### 4.2.2 Como o protótipo pode ser feito (AULA 10)

- Desenho das interfaces em **papel → foto**
- Desenho das interfaces no **quadro → foto**
- **Figma, Adobe XD**, ou similares

Não importa a ferramenta — importa **VER + DISCUTIR + ITERAR**.

#### 4.2.3 7 grupos de boas práticas (AULA 10)

**Clareza e Simplicidade**
- Evite poluição visual: use apenas elementos necessários para a tarefa
- Reduza o número de passos: menos cliques/telas, melhor
- Linguagem simples e direta nos botões e rótulos ("Enviar", "Salvar", "Cancelar")
- Agrupe elementos relacionados: campos de formulário próximos por função

**Consistência e Padrões**
- Consistência visual: cores, ícones, espaçamentos e tipografia seguem padrão
- Reutilize componentes: mesmo estilo de botão em todas as telas
- Respeite convenções do sistema (web, Android, iOS) — menus, ícones, interações familiares

**Hierarquia Visual e Layout**
- Destaque o que é mais importante: use tamanho, contraste, posição
- Espaçamento (respiro visual)
- Alinhamento e grade

**Feedback e Interação**
- Prototipe respostas do sistema (mensagens, carregamento, mudança de cor)
- Mostre estados de componentes (botões desabilitados, campos preenchidos, erros)
- Evite surpresas — usuário entende resultado antes de executar

**Foco no Usuário**
- Conheça o público-alvo (adaptar linguagem e complexidade)
- Priorize tarefas mais frequentes
- Inclua usuário na validação (teste com colegas + coleta de feedback)

**Fidelidade e Iteração**
- Comece simples (baixa fidelidade) para testar ideias rapidamente
- Evolua progressivamente conforme requisitos e feedback ficam claros
- Não se apaixone pelo design inicial

**Usabilidade e Acessibilidade**
- Contraste adequado (textos legíveis para usuários com deficiência visual)
- Não dependa apenas de cores para transmitir informação
- Fontes legíveis + tamanhos adequados
- Navegação por teclado / leitor de tela (em hi-fi)

**Coerência com Requisitos**
- Cada elemento da interface corresponde a um requisito funcional
- Não crie telas/funcionalidades não previstas sem justificativa
- Revise protótipo + requisitos juntos para rastreabilidade

#### 4.2.4 Erros frequentes em protótipos (AULA 10)

| Erro frequente | Consequência | Solução |
|---|---|---|
| Não considerar o público | Interface confusa | Criar personas e fluxos |
| Ignorar requisitos | Protótipo inconsistente | Rastrear RF → Tela |
| Fluxo mal planejado | Usuário se perde | Mapa de telas antes |
| Inconsistência e excesso | Poluição visual | Padrão de design |
| Falta de feedback | Dificuldade de uso | Mensagens e estados |

### 4.3 Geração de casos de teste

> Os requisitos devem ser testáveis. Se os testes dos requisitos forem **concebidos como parte do processo de validação**, frequentemente isso **revela problemas nos requisitos**.

**Princípio TDD aplicado a ER**: tentar escrever o teste para um requisito é a melhor forma de descobrir se ele é **verificável** (dimensão 7 de Falbo) e **completo**.

```
Pergunta de validação: "Como vou testar este requisito?"

Se a resposta for:
  ✓ "Vou enviar input X e verificar que saída é Y"  → testável
  ✓ Cenário BDD claro                              → testável
  ✗ "Vou olhar e ver se está bom"                  → não testável
  ✗ "Depende do contexto"                          → não testável
```

**Desenvolvimento dirigido por testes a partir dos requisitos** = forma forte de validação.

---

## 5. Limitação fundamental (Sommerville)

> Não se deve subestimar os problemas envolvidos na validação dos requisitos. No final das contas, é **difícil mostrar que um conjunto de requisitos satisfaz de fato as necessidades de um usuário**. Os usuários precisam imaginar o sistema em operação e como se encaixaria em seu trabalho.
>
> Como consequência, **é raro encontrar todos os problemas de requisitos durante o processo de validação**. Inevitavelmente, serão necessárias outras alterações nos requisitos para corrigir omissões e mal-entendidos.

**Conclusão**: validação reduz erros, não os elimina. Tenha sempre um processo de gestão de mudança (ver [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)) preparado para acomodar requisitos que escaparam.

---

## 6. Quando validar (timing)

| Momento | Foco da validação |
|---|---|
| Após Elicitação | Validade + Necessidade (estes são os requisitos certos?) |
| Após Especificação | Consistência + Completude + Verificabilidade (estão bem escritos?) |
| Após Protótipo | Validade + Realismo (vendo isso, o usuário ainda quer?) |
| Pré-Sprint Planning | INVEST por US |
| Pré-Release | Critérios de Aceitação atendidos |
| Pós-Release | Validade contínua (o sistema entregue resolve mesmo o problema?) |

---

## 7. Validação para sistemas de IA / ML (camada adicional)

Para sistemas que usam ML, validação tradicional **não basta**. Adicione:

- **Reavaliação contínua de risco** (Código SBC 2.5 — ver [09-etica-sbc.md](09-etica-sbc.md))
- **Validação de viés**: o modelo trata grupos demograficamente diferentes de forma igualmente justa?
- **Drift detection**: distribuição dos dados em produção mudou em relação ao treino?
- **Explicabilidade**: o sistema pode justificar suas decisões para o usuário afetado?
- **Reversibilidade**: usuário pode contestar e ter a decisão revista por humano?

Sommerville (Cap 11 e 12, livro completo) aprofunda dependabilidade — para ML, fontes adicionais: Goodfellow et al. *Deep Learning* (cap. 12 práticas), Russell & Norvig *AI: A Modern Approach* (cap. ética).

---

## 8. Sinalizadores de validação ruim

- Validação = "PO leu o documento e disse 'tá bom'" — não vale, falta confronto + protótipo
- Não há ata de revisão (sem registro = não aconteceu)
- Protótipo nunca foi mostrado a usuário final, só ao PO
- Cliente nunca disse "não" a nenhum requisito — sinal de validação superficial
- "Validamos com testes" — testes verificam se código bate com requisito; não validam se o requisito está certo
- Validação aconteceu uma vez, no início, e nunca mais
- Cenários BDD escritos só pelo dev (sem Three Amigos) — viés de implementação
- Equipe trata "está implementado" como sinônimo de "está validado"

---

## 9. Conexão com as próximas references

- **Gestão de mudança após validação revelar problemas**: [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md)
- **Ética em validação (especialmente IA/ML)**: [09-etica-sbc.md](09-etica-sbc.md)
