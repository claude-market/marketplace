# Template — Documento de Requisitos (exemplo trabalhado completo)

> Template **preenchido com exemplo real**, não esqueleto vazio. Use-o como ponto de partida concreto para qualquer documento de requisitos do projeto. Estrutura combina IEEE 830 (clássico), Sommerville 10e cap. 4, Wiegers 3e (cap. 10) e a convenção Interpop. Substitua o exemplo pelo seu domínio mantendo todas as convenções.

---

## 0. O documento de requisitos é a fonte da verdade

**Regra zero (não negociável)**: este documento é a **base** do projeto. Tudo o que vai ser construído nasce daqui — backlog, planos de sprint, código, testes. Por isso:

- 📌 **Toda alteração de escopo passa por este documento PRIMEIRO**, depois propaga para o backlog. Nunca o contrário.
- 🔁 **Mudanças são versionadas** com data, autor, motivo e impacto (ver §11 Histórico de revisões).
- 📎 **O backlog do projeto aponta de volta** para este documento (`Origem (requisitos)` em cada Epic/Feature/CA/RNF).
- ✋ **Quando surge necessidade nova durante implementação** (refinamento técnico revela buraco, cliente pede ajuste em conversa), o fluxo correto é: **(1)** registrar a discussão; **(2)** atualizar este documento; **(3)** propagar para o backlog; **(4)** só então implementar. Pular passos cria scope creep silencioso.

---

## 1. Regras duras (não negociáveis)

1. **Linguagem de negócio em pt-BR** em todo o documento. Endpoints REST, libs, frameworks, nomes de tabelas, comandos shell, métodos — tudo isso **NÃO entra aqui**. Vai para o backlog (Tasks) ou para os ADRs técnicos. Quem lê este documento é o cliente, o PO, o analista, o dev júnior, o auditor — todos têm que entender sem glossário técnico.
2. **TODOS os artefatos têm descrição**: RF, RNF, regras de negócio (G), classes de usuários, restrições. Não basta título; descrição explica o "porquê" e o "como o cliente vai sentir isso".
3. **Toda regra é testável**. Se a frase contém adjetivos vagos ("rápido", "amigável", "intuitivo", "robusto"), não é requisito — é desejo. Reescreva com métrica ou comportamento observável.
4. **IDs estáveis** (`RF-NN`, `RNF-NN`, `G-NN`). IDs não mudam quando o conteúdo evolui — só a versão.
5. **Cada RF/RNF declara fonte** (stakeholder, documento normativo, observação) — para validar e justificar em revisão.
6. **Cada RF/RNF declara prioridade** (🔴 Immediate, 🟠 High, 🟡 Normal, 🟢 Low) — para o backlog herdar a ordem.

---

# Documento de Requisitos — Busca Editorial do Interpop

> **Projeto**: Interpop — editorial brasileiro de Soft Power (cultura pop crítica)
> **Versão**: 1.2 (revisão de 28/05/2026)
> **Autor**: Gabriel Marques
> **Stakeholders aprovadores**: Gabriel Marques (dev/dono), equipe editorial (3 redatores)
> **Backlog correspondente**: [`docs/specs/busca-editorial/BACKLOG.md`](../../../../Documentos/Projetos/interpop/docs/specs/busca-editorial/BACKLOG.md)

---

## 2. Introdução

### 2.1 Propósito

Especificar os requisitos para a funcionalidade de **busca editorial** do site Interpop. A busca permite que leitores encontrem artigos publicados por palavra-chave e por filtros temáticos, e que compartilhem o resultado da busca por link. Este documento é a base do backlog correspondente e a referência para validação ao final do desenvolvimento.

### 2.2 Escopo

A busca cobre **artigos publicados** (não rascunhos, não em moderação). Indexa três campos: título, resumo e corpo. Suporta filtragem por **temas editoriais** (definidos pela equipe editorial — atualmente: Música, Moda, Cinema, Literatura, Cultura Digital). Inclui ordenação por relevância (peso decrescente título > resumo > corpo, desempate por data) e compartilhamento por link.

**Fora do escopo (versão 1.2)**: busca por autor, busca dentro de comentários, busca semântica via embeddings, sugestões de termo enquanto o leitor digita ("autocomplete"). Estes podem virar Epics futuros.

### 2.3 Definições, acrônimos e abreviações

| Termo | Significado |
|---|---|
| **Leitor** | Visitante do site, autenticado ou anônimo, que consome o conteúdo editorial. |
| **Artigo** | Texto editorial publicado, com título, resumo, corpo, autor, data, tema. |
| **Tema editorial** | Categoria fixa definida pela equipe editorial. Atualmente são 5 (Música, Moda, Cinema, Literatura, Cultura Digital). |
| **Relevância** | Score numérico calculado pela posição do termo buscado (título > resumo > corpo) e pela data do artigo (mais recente vence em empate). |
| **p95** | Percentil 95 do tempo de resposta — 95% das requisições respondem em ≤ ao valor declarado. |
| **CWV** | Core Web Vitals (LCP, INP, CLS) — métricas de qualidade percebida pelo Google. |

### 2.4 Referências externas

- LGPD (Lei nº 13.709/2018) — proteção de dados pessoais do leitor (queries armazenadas, se houver).
- WCAG 2.2 AA — acessibilidade da interface de busca.
- Diretriz editorial Interpop, v3 (2026-03) — define temas e critérios de moderação.

---

## 3. Descrição geral

### 3.1 Perspectiva do produto

A busca é uma funcionalidade transversal do site Interpop. Aparece como menu superior em todas as páginas e como campo destacado na home. Não é uma aplicação isolada; reusa o índice de artigos publicados já mantido pelo CMS interno. Integra com a camada de filtros temáticos já existente (Epic anterior `EP-09`).

### 3.2 Classes de usuários

| Classe | Descrição | Frequência de uso esperada |
|---|---|---|
| **Leitor anônimo** | Visitante sem cadastro. Pode buscar e ler. Maior volume de uso. | ~70% das buscas. Várias buscas por sessão. |
| **Leitor cadastrado** | Leitor com conta (favorita artigos, comenta). Mesmo comportamento de busca. | ~20%. Comportamento similar ao anônimo. |
| **Redator/Editor** | Membro da equipe editorial. Usa busca para revisar publicações próprias e do time. | ~5%. Buscas mais específicas, com nome de autor (futuro). |
| **Admin/Dev** | Equipe operacional. Usa busca para validar conteúdo, debugar, monitorar. | ~5%. Buscas frequentes, com termos técnicos. |

### 3.3 Restrições do projeto

| Tipo | Restrição |
|---|---|
| **Tecnologia obrigatória** | Backend Django 5 + Postgres; frontend React 19 + Vite. (Stack do projeto.) |
| **Hospedagem** | Hostinger KVM 1 — 1 CPU, 4GB RAM. Limita uso intensivo de CPU para indexação. |
| **Orçamento** | Sem licença paga. Apenas libs gratuitas. Sem serviço externo de busca (Algolia, Elasticsearch hosted, etc.) na v1.2. |
| **Compliance** | LGPD: queries de leitor anônimo não podem ser associadas a identificador persistente sem consentimento. |
| **Acessibilidade** | WCAG 2.2 AA: campo de busca navegável por teclado, contraste mínimo 4.5:1, mensagens lidas por screen reader. |

### 3.4 Premissas e dependências

- **Premissa 1**: o acervo cresce em ritmo controlado (10–30 artigos/mês). Não há necessidade de re-indexação dinâmica em tempo real — atualização noturna basta para a v1.2.
- **Premissa 2**: 99% das buscas são em pt-BR. Stop words em inglês podem ser ignoradas para simplificar a v1.2.
- **Dependência 1**: a Feature de temas editoriais (`EP-09`) já está em produção desde Sprint 1.
- **Dependência 2**: o índice `tsvector` do Postgres precisa estar disponível (extensão padrão, OK no Postgres 16).

---

## 4. Stakeholders

Identificação seguindo Wiegers 3e (cap. 6) — 5 critérios: quem usa, quem decide, quem é afetado, quem aprova, quem fornece input.

| Stakeholder | Interesse | Tipo de participação |
|---|---|---|
| **Leitor (anônimo + cadastrado)** | Encontrar artigos rapidamente. Tela limpa, sem atrito. | Usuário final — input via pesquisa de UX. |
| **Equipe editorial (3 redatores)** | Garantir que seus artigos sejam encontráveis. Validar que filtros temáticos refletem a editoria. | Aprovação dos critérios de relevância. |
| **Gabriel (dev/dono)** | Sustentabilidade técnica (KVM 1). Manutenibilidade. Conformidade LGPD. | Decisor técnico final. Aprova trade-offs. |
| **Auditor externo (hipotético)** | LGPD: queries de leitor não criam perfil sem consentimento. WCAG 2.2 AA atendida. | Validação de compliance. |

---

## 5. Requisitos Funcionais

### RF-08 — Busca por texto livre

| Campo | Valor |
|---|---|
| **ID** | `RF-08` |
| **Prioridade** | 🟠 High |
| **Fonte** | Leitor (pesquisa de UX 04/2026); equipe editorial. |
| **Validação** | Equipe editorial 28/05/2026 (ata em Notion). |

**Descrição:**

O sistema deve permitir que qualquer leitor (anônimo ou cadastrado) digite um termo (palavra ou frase curta) e receba a lista de artigos publicados que contêm aquele termo no título, no resumo ou no corpo. Os resultados são ordenados por relevância (artigos com o termo no título aparecem primeiro). A busca deve funcionar em qualquer página do site através de campo no menu superior, e em destaque na página principal.

**Critério de aceitação (resumo — detalhamento no backlog F-30)**:

A primeira tela de resultados deve aparecer em ≤800ms para acervo de até 5.000 artigos. A busca deve ser case-insensitive e diacritic-insensitive (digitar "POP" ou "pop" ou "póp" deve retornar os mesmos artigos). A busca não deve depender de login.

### RF-09 — Filtragem da busca por tema editorial

| Campo | Valor |
|---|---|
| **ID** | `RF-09` |
| **Prioridade** | 🟠 High |
| **Fonte** | Equipe editorial (reunião 15/03/2026); leitor (sugestão recorrente em pesquisa de UX). |
| **Validação** | Equipe editorial 28/05/2026. |

**Descrição:**

O sistema deve permitir que o leitor refine a busca por texto livre selecionando um ou mais temas editoriais (Música, Moda, Cinema, Literatura, Cultura Digital). Os filtros aparecem como chips clicáveis acima da lista de resultados; selecionar um filtro reduz a lista; remover todos os filtros volta a considerar todos os temas. A combinação de termo de busca + filtro de tema é a forma mais comum esperada de uso (≥60% das buscas, segundo pesquisa).

### RF-10 — Compartilhamento da busca por link

| Campo | Valor |
|---|---|
| **ID** | `RF-10` |
| **Prioridade** | 🟡 Normal |
| **Fonte** | Leitor (pesquisa de UX 04/2026, comentário em rede social). |
| **Validação** | Gabriel 28/05/2026. |

**Descrição:**

A URL da página de busca deve preservar o termo digitado e os filtros aplicados, de forma que ao copiar e enviar o link, o destinatário visualize os mesmos resultados (mesma ordem, mesmos filtros). Isso transforma cada busca em um link compartilhável — útil para a equipe editorial divulgar "tudo o que a gente já cobriu sobre kpop" sem mandar lista manual.

---

## 6. Requisitos Não Funcionais

Organização clássica Sommerville: produto · organizacionais · externos.

### 6.1 Requisitos de produto

#### RNF-04 — Tempo de resposta da primeira tela de busca

| Campo | Valor |
|---|---|
| **ID** | `RNF-04` |
| **Categoria** | Produto — Desempenho |
| **Prioridade** | 🟠 High |
| **Fonte** | Diretriz Interpop (CWV — LCP ≤ 2.5s). |

**Descrição:**

A primeira tela de resultados da busca deve aparecer em ≤800ms (p95) para acervo de até 5.000 artigos publicados, medido na rede 4G simulada do Lighthouse. Quando o tempo exceder 800ms, o sistema deve mostrar um indicador visual de carregamento (skeleton dos cards) em até 300ms após o início da consulta — para que o leitor não tenha impressão de tela travada.

**Como verificar:**

Teste automatizado de performance no CI: `backend/tests/test_search_perf.py::test_p95_under_800ms` mede 100 buscas com termos variados sobre acervo simulado de 5k artigos e calcula p95.

#### RNF-05 — Acessibilidade WCAG 2.2 AA

| Campo | Valor |
|---|---|
| **ID** | `RNF-05` |
| **Categoria** | Produto — Acessibilidade |
| **Prioridade** | 🟠 High |
| **Fonte** | Diretriz Interpop (acessibilidade obrigatória). |

**Descrição:**

A tela de busca e todos os seus elementos interativos (campo de texto, botão de submit, chips de filtro, cards de resultado, botão "Carregar mais") devem ser navegáveis por teclado. Mensagens dinâmicas (resultado de busca, ausência de resultado, indicador de carregamento) devem ser anunciadas por screen reader via ARIA live regions. Contraste mínimo 4.5:1 em todos os textos.

**Como verificar:**

Auditoria automatizada `axe-core` em CI (≥95 score) + revisão manual com NVDA antes de cada release.

### 6.2 Requisitos organizacionais

#### RNF-06 — Stack obrigatória

| Campo | Valor |
|---|---|
| **ID** | `RNF-06` |
| **Categoria** | Organizacional — Tecnologia |
| **Prioridade** | 🔴 Immediate |
| **Fonte** | Gabriel (decisão técnica de projeto). |

**Descrição:**

A busca deve ser implementada usando apenas as tecnologias já presentes no stack do Interpop: backend Django 5 + DRF + Postgres 16 (com `tsvector` e índice GIN); frontend React 19 + Vite. Sem serviço externo de busca (Algolia, Elasticsearch hosted, Meilisearch SaaS) na v1.2. Sem nova lib paga.

### 6.3 Requisitos externos

#### RNF-07 — Conformidade com LGPD

| Campo | Valor |
|---|---|
| **ID** | `RNF-07` |
| **Categoria** | Externo — Compliance |
| **Prioridade** | 🔴 Immediate |
| **Fonte** | Lei nº 13.709/2018; diretriz de privacidade Interpop. |

**Descrição:**

Os termos buscados por leitores anônimos não devem ser associados a identificador persistente (cookie, fingerprint) sem consentimento explícito do leitor. O sistema pode coletar termos de busca de forma agregada (estatística geral, sem ligação ao leitor individual) — mas não pode montar perfil de busca individual sem opt-in. Logs de busca devem ser retidos por no máximo 90 dias e ser anonimizados (sem IP completo) antes de qualquer análise.

---

## 7. Regras de Negócio

Regras de domínio editorial que não são RF nem RNF — são restrições do negócio do Interpop.

### G-01 — Artigos em moderação não aparecem

| Campo | Valor |
|---|---|
| **ID** | `G-01` |
| **Prioridade** | 🔴 Immediate |
| **Fonte** | Política editorial Interpop. |

**Descrição:**

Artigos com status `em moderação` (pendentes de revisão editorial após denúncia) NUNCA devem aparecer em resultados de busca, mesmo para o autor original. Só artigos com status `publicado` são buscáveis. Esta regra protege a equipe editorial e os leitores de exposição precoce a conteúdo sob revisão.

### G-02 — Temas editoriais são fixos

| Campo | Valor |
|---|---|
| **ID** | `G-02` |
| **Prioridade** | 🟠 High |
| **Fonte** | Diretriz editorial Interpop, v3. |

**Descrição:**

Os temas editoriais (Música, Moda, Cinema, Literatura, Cultura Digital) são definidos pela equipe editorial e fixos na v1.2. Mudança no conjunto de temas exige decisão editorial (não é decisão técnica), revisão da especificação e migração dos artigos existentes. A v1.2 não permite cadastro dinâmico de temas via interface.

---

## 8. Diagrama de fluxo principal

> Exemplo de fluxo principal — leitor faz busca + filtro:

```
[Leitor abre o site]
        │
        ▼
[Vê campo de busca no menu superior + tela inicial com artigos]
        │
        ▼
[Digita termo + (opcional) seleciona chips de tema]
        │
        ▼
[Sistema valida termo (2-100 caracteres) e consulta Postgres com tsvector]
        │
        ▼
[Resultados ordenados por relevância (título > resumo > corpo) + data]
        │
        ▼
[Tela renderiza 20 cards + URL atualizada com termo + filtros]
        │
        ▼
[Leitor pode "Carregar mais", clicar em card, ou copiar URL para compartilhar]
```

---

## 9. Glossário (terminologia específica do projeto)

| Termo | Definição |
|---|---|
| **Artigo** | Texto editorial publicado no Interpop, com título, resumo, corpo, autor, data, tema. |
| **Editorial** | Conteúdo crítico produzido pela equipe Interpop sobre cultura pop (música, moda, cinema, etc.). |
| **Tema** | Categoria fixa que classifica os artigos. v1.2 tem 5 temas. |
| **Soft Power** | Conceito de Joseph Nye (1990) — capacidade de influenciar através de cultura, valores, narrativa. Foco editorial do Interpop. |

---

## 10. Anexos

### 10.1 Protótipos

> Em projeto real, links ou imagens dos protótipos lo-fi e hi-fi aprovados.

- Wireframe lo-fi `docs/specs/busca-editorial/protótipo-v1-lofi.png` (15/04/2026)
- Hi-fi Figma `https://figma.com/file/...` (10/05/2026, aprovado pela equipe editorial em 12/05)

### 10.2 Pesquisa de UX (fonte de alguns RFs)

- Relatório `docs/specs/busca-editorial/pesquisa-ux-04-2026.md` — entrevistas com 12 leitores, perguntas sobre como buscavam conteúdo no site atual.

---

## 11. Histórico de revisões

> **Cada alteração no documento gera uma entrada nova aqui.** Backlog não muda sem que esta tabela seja atualizada primeiro.

| Versão | Data | Autor | Mudança | Impacto no backlog |
|---|---|---|---|---|
| 1.0 | 12/03/2026 | Gabriel | Versão inicial. RF-08 (busca por texto) + RNF-04 (tempo de resposta). | Criação de `EP-10` + `F-30`. |
| 1.1 | 15/03/2026 | Gabriel | Adicionado RF-09 (filtro temático) após reunião com equipe editorial. | Criação de `F-31`. |
| 1.2 | 28/05/2026 | Gabriel | Adicionado RF-10 (compartilhamento por link) após pesquisa de UX. RNF-04 ajustado: era 1000ms p95, virou 800ms p95 após estudo de CWV. RNF-07 (LGPD) explicitado. | Criação de `F-32`. `CA11` da `F-30` ajustado de 1000ms para 800ms. Nota no `BACKLOG.md` (data 28/05). |

---

## 12. Aprovação

| Stakeholder | Função | Data | Forma |
|---|---|---|---|
| Gabriel Marques | dev/dono — aprovador final | 28/05/2026 | Assinatura no git (commit `c8c5c7c`). |
| Equipe editorial (3 redatores) | Aprovação editorial | 28/05/2026 | Ata Notion `notion.so/...`. |

---

## ✅ Smell test do documento de requisitos

- [ ] Toda RF/RNF/G tem **descrição** em pt-BR sem termo técnico (sem URL, sem nome de método, sem nome de tabela)?
- [ ] Toda RF/RNF/G tem **fonte declarada** (quem pediu, quando)?
- [ ] Toda RF/RNF/G tem **prioridade** (🔴/🟠/🟡/🟢)?
- [ ] Adjetivos vagos ("rápido", "amigável", "intuitivo", "robusto") foram substituídos por **métrica ou comportamento observável**?
- [ ] Restrições, premissas e dependências estão **explícitas** (§3.3, §3.4)?
- [ ] Stakeholders identificados pelos 5 critérios de Wiegers (§4)?
- [ ] Glossário cobre todos os termos do domínio que aparecem no documento?
- [ ] Histórico de revisões (§11) está atualizado com a última mudança e seu impacto no backlog?
- [ ] Backlog correspondente (link no topo) referencia este documento em todos os Epics/Features?
