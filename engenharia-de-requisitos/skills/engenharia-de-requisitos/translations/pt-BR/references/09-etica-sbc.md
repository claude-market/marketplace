# 09 — Ética Profissional aplicada à Engenharia de Requisitos

> Camada **transversal e inegociável**. Baseada no Código de Ética e Conduta Profissional da SBC — Resolução 002/2024 (assinada pela Profa. Thais Vasconcelos Batista, presidente SBC, em 21/03/2024). É uma tradução do código IFIP, que por sua vez é adaptação do ACM Code of Ethics. **Não está acima das outras camadas; está embaixo de todas — toda decisão de ER passa por ela.**

---

## 1. Estrutura do documento SBC 002/2024

| Seção | O que cobre |
|---|---|
| **1. Princípios Éticos Gerais** | 7 princípios fundamentais (bem-estar, evitar danos, honestidade, justiça, propriedade intelectual, privacidade, confidencialidade) |
| **2. Responsabilidades Profissionais** | 9 deveres (qualidade, competência, leis, peer review, avaliação, áreas de competência, conscientização pública, acesso autorizado, sistemas seguros) |
| **3. Princípios de Liderança Profissional** | 7 deveres de quem lidera (bem público, responsabilidade social, qualidade de vida no trabalho, políticas, oportunidades, cuidado ao mudar/encerrar, sistemas integrados à sociedade) |
| **4. Conformidade com o Código** | Apoiar, promover, respeitar; tratar violações como incompatíveis |

> "Este código **não é um algoritmo para resolver problemas éticos**. Em vez disso, serve como base para a tomada de decisões éticas. Ao pensar em um problema específico, um profissional da Computação pode achar que vários princípios devem ser levados em consideração e que princípios diferentes terão relevâncias diferentes para o problema."

---

## 2. Princípios que mais incidem em ER (mapeamento)

### 2.1 §1.1 — Contribuir para a sociedade e bem-estar humano

> Esse princípio afirma a obrigação dos profissionais da Computação de usar suas habilidades em benefício da sociedade. Inclui promoção de **direitos humanos** e proteção do direito à **autonomia** de cada indivíduo. Quando os interesses de vários grupos entram em conflito, **as necessidades dos menos favorecidos devem receber maior atenção e prioridade**.

**Aplicação em ER**:

- Toda priorização de backlog deve perguntar: "Quem é prejudicado se isto não for entregue?". Se a resposta inclui grupo vulnerável, esse item sobe na ordem
- RFs e RNFs devem garantir **acessibilidade** (WCAG, leitor de tela, navegação por teclado)
- "Falha em projetar para inclusão é uma discriminação injusta" (§1.4 do código)

**Exemplo**: feature de cadastro online. Se ela exige smartphone moderno e há população-alvo sem acesso (vulnerável), o requisito deve **incluir** alternativa (atendimento presencial, ligação telefônica), não excluir essa população silenciosamente.

### 2.2 §1.2 — Evitar danos

> "Dano" significa consequências negativas, especialmente quando significativas e injustas. Ações **bem-intencionadas**, incluindo as em cumprimento a tarefas atribuídas, podem causar danos. Quando esse dano não é intencional, os responsáveis são obrigados a **desfazer ou mitigar** o dano tanto quanto possível.

**Obrigação adicional**:

> Um profissional da Computação tem a obrigação adicional de **relatar quaisquer sinais de riscos** do sistema que possam resultar em danos. Se os líderes não agirem para reduzir ou mitigar tais riscos, **pode ser necessário denunciar** essas situações para reduzir possíveis danos.

**Aplicação em ER**:

- Identificar **RNFs de segurança e safety** desde a fase de elicitação
- Levantar **cenários de mau uso** (não só uso correto) na fase de análise — quem pode tentar abusar do sistema?
- Toda mudança de requisito deve incluir avaliação de **risco residual**
- Se um requisito do cliente vai causar dano (a usuários, terceiros, ambiente), **profissional deve recusar ou contestar** — não pode "só implementar porque foi pedido"

**Exemplo**: cliente pede "queremos um botão que envia mensagem para todos os contatos do usuário sem confirmação". Ético profissional **recusa esse requisito** ou exige redesenho — abre a chance de assédio/spam/abuso.

### 2.3 §1.3 — Ser honesto e confiável

> Profissional da Computação deve ser **transparente** e fornecer divulgação completa de todos os recursos, limitações e problemas potenciais do sistema para as partes apropriadas. Devem ser honestos sobre suas **qualificações** e sobre quaisquer **limitações em sua competência**.

**Aplicação em ER**:

- Estimativas de Story Points devem refletir incerteza real, não pressão política
- Limitações do sistema (não vai funcionar offline, não escala além de N usuários, latência mínima Xms) devem estar **explicitamente** documentadas como RNFs
- Quando você não sabe responder uma pergunta técnica de stakeholder, fale "não sei, vou pesquisar" — não invente

### 2.4 §1.4 — Ser justo e adotar ações não discriminatórias

> A discriminação preconceituosa com base em idade, cor, deficiência, etnia, situação familiar, identidade de gênero, filiação sindical, situação militar, nacionalidade, raça, religião ou crença, sexo, orientação sexual ou qualquer outro fator inadequado é **uma violação explícita** deste código.
>
> O uso da informação e da tecnologia pode causar novas desigualdades ou aumentar as já existentes. As tecnologias e práticas devem ser **tão inclusivas e acessíveis quanto possível** e os profissionais da Computação devem tomar medidas para evitar a criação de sistemas ou tecnologias que privem de direitos ou oprimam as pessoas. **A falha em projetar para inclusão e acessibilidade pode constituir discriminação injusta.**

**Aplicação em ER**:

- WCAG 2.2 AA é **piso**, não topo. RNFs de acessibilidade explícitos em **toda** feature
- Decisões automatizadas (ML/IA) que afetam pessoas precisam de **auditoria de viés**
- Linguagem dos sistemas deve evitar gendered defaults, deve permitir nome social, deve respeitar identidades
- Personas usadas em design não podem assumir um único perfil socioeconômico/educacional/etário

### 2.5 §1.6 — Respeitar a privacidade

> A responsabilidade de respeitar a privacidade se aplica aos profissionais da Computação **de maneira particularmente profunda**. Novas tecnologias permitem a coleta, monitoramento e troca de informações pessoais de forma rápida, barata e muitas vezes **sem o conhecimento das pessoas afetadas**.

**Princípios operacionais**:

- Informações pessoais usadas apenas **para fins legítimos e sem violar direitos**
- **Apenas a quantidade mínima** de informação pessoal necessária deve ser coletada
- **Períodos de retenção e eliminação** claramente definidos
- Consentimento informado para coleta automática
- Permitir revisar, obter, **corrigir** e **excluir** dados pessoais
- Cuidado especial ao **mesclar conjuntos de dados** (privacidade pode ser comprometida pela agregação)

**Aplicação em ER (LGPD inclusa)**:

- RNFs explícitos para **minimização de coleta**: cada campo de cadastro precisa justificativa
- RNF: **retenção limitada** com prazo definido + processo de exclusão automática
- RNF: **portabilidade** (usuário exporta seus dados)
- RNF: **direito ao esquecimento** (delete profile + cascade nos dados associados)
- Logs de auditoria: o que fazem? quem acessa? por quanto tempo guarda?
- Dados sensíveis (saúde, biometria, orientação política) sempre exigem fundamentação extra

### 2.6 §1.7 — Honrar a confidencialidade

Aplicação em ER:
- Documentos de requisitos contendo segredos comerciais não vazam em PRs públicos
- Análise de mercado / inteligência competitiva tratadas como confidenciais
- **Exceção**: violação de lei → reportar às autoridades competentes (whistleblower)

### 2.7 §2.5 — Avaliação abrangente, especialmente para ML/IA

> **Cuidados extraordinários devem ser tomados para identificar e mitigar riscos potenciais em sistemas de aprendizado de máquina.** Um sistema para o qual os riscos futuros não podem ser previstos de forma confiável **requer reavaliação frequente do risco à medida que o uso do sistema evolui, ou não deve ser implantado.**

**Aplicação em ER de sistemas com ML**:

- RNFs explícitos para:
  - **Reavaliação periódica do risco** (cadência mínima por trimestre)
  - **Drift detection** (distribuição de dados em produção ≠ treino)
  - **Explicabilidade** das decisões aos usuários afetados
  - **Direito de contestação** (humano-no-loop para casos críticos)
  - **Auditoria de viés** por grupos demográficos
- RF: **logging completo** das decisões automatizadas (para análise post-hoc)

### 2.8 §2.6 — Trabalhar somente em áreas de competência

> Se a qualquer momento, antes ou durante o trabalho, o profissional identificar a falta de competências necessárias, deve **comunicá-la ao empregador ou cliente**.

Aplicação em ER:
- Engenheiro sem conhecimento de domínio crítico (saúde, jurídico, finanças) **deve declarar** e exigir especialista no time
- "Eu sei TI mas não conheço medicina" não é vergonha — vergonha é fingir que sabe

### 2.9 §2.9 — Projetar e implementar sistemas robustos e seguros

> **Nos casos em que o uso indevido ou danos são previstos ou inevitáveis, a melhor opção pode ser não implementar o sistema.**

**Princípio do veto profissional**. O profissional pode (e deve) recusar contribuir para sistema que vai gerar dano significativo.

**Aplicação em ER**:

- Análise de **threat model** desde a elicitação
- Cenários de **abuso intencional** especificados (não só "fluxo feliz")
- **Recurso à recusa de implementar** quando análise mostra dano inevitável

Exemplos clássicos onde a recusa profissional foi aplicada:
- Engenheiros do Google se recusam a trabalhar no Project Maven (drones militares com IA)
- Engenheiros do Microsoft contestam contrato com ICE
- Engenheiros do Facebook recusam features de microtargeting político

### 2.10 §3.1 — Bem público como preocupação central — **CITA ER EXPLICITAMENTE**

> As pessoas — incluindo usuários, clientes, colegas e outros afetados direta ou indiretamente — sempre devem ser a preocupação central da Computação. O bem público deve sempre ser uma preocupação **explícita** ao se avaliar tarefas associadas a: pesquisa, **análise de requisitos**, projeto, implementação, teste, validação, implantação, manutenção, retirada e descarte de sistemas.

ER é citada nominalmente como momento de avaliação ética. **Toda revisão de requisito deve perguntar: "Como isto serve o bem público?"**

### 2.11 §3.6 — Cuidado ao modificar ou encerrar a operação de sistemas

> Mudanças de interface, remoção de recursos e até atualizações de software impactam na produtividade dos usuários e na qualidade de seu trabalho. Os líderes devem tomar **cuidado ao alterar ou descontinuar o suporte para recursos do sistema dos quais as pessoas ainda dependem**. Os líderes devem investigar minuciosamente alternativas viáveis para remover o suporte para um sistema legado. **Se essas alternativas forem inaceitavelmente arriscadas ou impraticáveis, o desenvolvedor deve ajudar na migração tranquila** das partes interessadas do sistema para uma alternativa.

**Aplicação em ER de mudança**:

- Antes de remover feature usada → analisar quem depende, comunicar com **antecedência ampla**, oferecer **caminho de migração**
- Quando descontinuar produto inteiro → planejar exportação de dados, prazo de transição, suporte mínimo durante migração
- Em ER (ver [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md) §3.4), atualizar documentação retrospectivamente em ≤24h após mudança emergencial

### 2.12 §3.7 — Sistemas integrados à infraestrutura da sociedade

> Mesmo os sistemas computacionais mais simples têm o potencial de impactar todos os aspectos da sociedade quando integrados às atividades cotidianas, como comércio, turismo, governo, saúde e educação. Quando organizações e grupos desenvolvem sistemas que se tornam uma **parte importante da infraestrutura da sociedade**, seus líderes têm a **responsabilidade adicional de serem bons administradores** desses sistemas.

**Aplicação em ER**:

- Sistemas críticos (saúde, finanças, energia, transporte) exigem RNFs adicionais de:
  - **Resiliência** (continuar funcionando sob carga anômala)
  - **Acesso justo** (não excluir populações marginalizadas)
  - **Monitoramento contínuo** do nível de adoção e impacto social
  - **Padrões adequados** desenvolvidos quando não existem

---

## 3. Como integrar ética no processo de ER (não como anexo)

### 3.1 Como NÃO fazer

❌ Anexo "Considerações éticas" no fim do documento de requisitos que ninguém lê.
❌ Reunião isolada sobre ética uma vez por ano.
❌ "Privacy by design" como slogan sem RNFs concretos.

### 3.2 Como fazer

✅ **Cada feature passa por checkpoint ético** na revisão (sim/não para perguntas concretas).
✅ **Critérios de Aceitação incluem RNFs éticos** quando relevante (acessibilidade, privacidade).
✅ **Three Amigos inclui ética** — uma das vozes é "quem pode ser prejudicado?".
✅ **Cenários BDD incluem mau-uso intencional** ao lado dos felizes.
✅ **Métricas pós-release acompanham impacto demográfico** (não só agregados).

### 3.3 Checkpoint ético — perguntas concretas (faça em toda feature substantiva)

```
[ ] Quem é afetado por esta feature, direta e indiretamente?
[ ] Há grupo vulnerável (menores, idosos, baixa renda, deficiência)
    que pode ser excluído ou prejudicado?
[ ] Quais dados pessoais coletamos? Por quê? Por quanto tempo
    retemos? Quem acessa?
[ ] Há decisão automatizada? Usuário pode contestar?
[ ] Há cenário de mau-uso plausível? Como prevenimos?
[ ] WCAG 2.2 AA está atendido?
[ ] Logs de auditoria adequados ao impacto da feature?
[ ] Documentamos limitações conhecidas?
[ ] Stakeholder vulnerável teve voz no design?
```

Falhou em qualquer um → discussão Three Amigos + ajuste de requisito ou recusa.

---

## 4. Cenários éticos típicos em ER (com tratamento)

### 4.1 Cliente pede coleta excessiva de dados

**Situação**: cliente quer coletar CPF, RG, endereço, telefone, e-mail, profissão, renda, estado civil para "qualificar lead".

**Tratamento**:
- §1.6 — coleta mínima necessária
- Questionar: cada campo justificado para a finalidade declarada?
- Renegociar: coletar mínimo agora, expandir só se necessário com consentimento
- Se cliente insiste sem justificativa → escalar ou recusar

### 4.2 Sistema vai automatizar decisão crítica sobre pessoas

**Situação**: ML decide aprovação de crédito / matrícula escolar / atendimento médico.

**Tratamento**:
- §2.5 — reavaliação contínua de risco; auditoria de viés
- §1.4 — auditoria por grupos demográficos (mesmo erro afeta todos igualmente?)
- §2.6 — equipe tem competência em ML responsável?
- RNFs: explicabilidade + direito de contestação + humano-no-loop para borderline

### 4.3 Feature pode ser usada para vigilância

**Situação**: gestor pede dashboard com produtividade individual em tempo real (key strokes, screen captures).

**Tratamento**:
- §1.1 — autonomia individual; vigilância corrói autonomia
- §1.2 — danos psicológicos previsíveis (ansiedade, gaming do sistema)
- Renegociar: foco em métricas de equipe, não individuais; granularidade temporal mais grossa
- Se insiste → escalar ou recusar (§2.9 — não implementar)

### 4.4 Mudança vai prejudicar grupo dependente

**Situação**: app vai descontinuar suporte a navegadores antigos. Usuários idosos / baixa renda dependem desses navegadores.

**Tratamento**:
- §3.6 — investigar alternativas; ajudar migração tranquila
- Estender prazo de suporte
- Oferecer caminho alternativo (versão lite, atendimento presencial)
- Comunicar antecipadamente com canais que esses usuários efetivamente usam

### 4.5 Pressão para entregar sem validar

**Situação**: prazo apertado, gestor pede para "pular testes" ou "validar depois".

**Tratamento**:
- §2.1 — qualidade no trabalho profissional
- §1.3 — honestidade sobre limitações
- §2.5 — riscos identificados devem ser relatados
- Documentar formalmente: "se entregarmos sem teste X, o risco é Y, com impacto Z em N usuários"
- Se gestor mantém decisão → continuar trabalho sob direção, mas com paper trail

---

## 5. Conexão entre ética e as demais references

| Reference | Conexão ética |
|---|---|
| [01-fundamentos.md](01-fundamentos.md) | RNFs externos incluem requisitos éticos (LGPD, acessibilidade) |
| [02-elicitacao.md](02-elicitacao.md) | Etnografia exige informar pessoas antes (§1.3 honestidade) |
| [03-especificacao.md](03-especificacao.md) | CAs devem cobrir cenários de exclusão; US devem ter persona vulnerável testada |
| [04-bdd-criterios-aceitacao.md](04-bdd-criterios-aceitacao.md) | Cenários BDD incluem cases de mau-uso intencional |
| [05-estimativa.md](05-estimativa.md) | Estimativa honesta (§1.3) — sem inflar nem reduzir sob pressão |
| [06-validacao.md](06-validacao.md) | Stakeholder vulnerável tem voz na validação |
| [07-mudanca-rastreabilidade.md](07-mudanca-rastreabilidade.md) | §3.6 — cuidado ao descontinuar; rastreabilidade ética |
| [08-analista-negocios.md](08-analista-negocios.md) | Análise estratégica avalia bem público (§3.1) |

---

## 6. O artigo §4 — Conformidade

> Os profissionais da Computação devem aderir aos princípios deste código e contribuir para aprimorá-los. Os profissionais da Computação que reconhecerem violações deste código devem tomar medidas para resolver as questões éticas que reconheçam, incluindo, quando razoável, a expressão de sua preocupação à pessoa ou pessoas que estejam violando este código.

**Mecanismo**: violação observada → relato ao Comitê de Ética SBC. Ação corretiva conforme Regimento da Comissão de Ética.

---

## 7. Bibliografia adicional sobre ética em computação

- **SBC.** Resolução 002/2024 — texto oficial em https://www.sbc.org.br
- **ACM Code of Ethics** — código de origem (https://www.acm.org/code-of-ethics)
- **IFIP Code of Ethics** — versão intermediária (https://www.ipthree.org/ifip-code-of-ethics)
- **IEEE Code of Ethics** — complementar (https://www.ieee.org/about/corporate/governance/p7-8.html)
- **Vallor, S.** *Technology and the Virtues*, Oxford 2016 — fundamentação filosófica
- **O'Neil, C.** *Weapons of Math Destruction*, 2016 — casos de viés algorítmico
- **Eubanks, V.** *Automating Inequality*, 2018 — sistemas que prejudicam vulneráveis
- **Crawford, K.** *Atlas of AI*, 2021 — ética em ML

---

## 8. Resumo executivo (caso você não tenha tempo de ler tudo)

**3 perguntas a fazer a cada decisão importante de ER**:

1. **Quem é prejudicado?** Especialmente os menos favorecidos (§1.1)
2. **Quais danos são previsíveis?** Inclusive os não intencionais (§1.2)
3. **Posso recusar contribuir?** Se uso indevido é inevitável, talvez deva (§2.9)

Se as 3 respostas forem aceitáveis → siga. Se uma delas levanta bandeira vermelha → discussão Three Amigos + escalar para liderança + documentar a decisão.

**Princípio síntese**: requisitos não são tecnicalidade. Cada requisito é uma escolha sobre como nossa tecnologia molda a vida das pessoas. Tratemos com a gravidade que merece.
