# 11 — EARS (Easy Approach to Requirements Syntax) — **camada de precisão opcional**

> **Quando usar esta referência**: quando você precisa que um requisito seja inequívoco, testável e
> parseável por máquina por um agente de codificação de IA. EARS fica *entre* o catálogo `RF`/`RNF` em
> linguagem de negócio ([`01-fundamentos.md`](01-fundamentos.md)) e os cenários Gherkin executáveis
> ([`04-bdd-criterios-aceitacao.md`](04-bdd-criterios-aceitacao.md)). Ele transforma um `RF` difuso num contrato
> que um LLM consegue implementar e um testador consegue verificar.

> 🟡 **OPCIONAL por design — leia isto antes de aplicar EARS.** EARS é uma *capacidade na qual você opta*, não uma
> regra que a skill impõe. A espinha obrigatória é `RF` em **linguagem de negócio pt-BR** (sem jargão técnico nos
> títulos — `05-convencoes-interpop.md`, regra de nomenclatura 2) + CAs + BDD. EARS é uma **camada extra de precisão** adicionada
> ao **corpo** de um requisito (ou aos seus CAs) *quando o retorno compensa a formalidade*. Ele **coexiste**
> com o enunciado de negócio; não o substitui e nunca aparece no título de negócio.
>
> **Quando NÃO usar EARS:** elicitação inicial (os enunciados ainda estão difusos de propósito); requisitos que você está
> prestes a **validar com um stakeholder não técnico** (um *"cooperado"* lê "acompanhar meu saldo", não
> "THE SYSTEM SHALL"); artefatos puramente educacionais/de extensão. **Quando EARS vale o esforço:** entregar um
> requisito a um implementador de IA; capturar **casos de borda / comportamento de erro**; requisitos de segurança/regulados
> que precisam ser exatos; qualquer coisa que você queira rastrear mecanicamente `requisito → CA → teste`.

---

## 1. Por que EARS

Requisitos em linguagem natural falham de três maneiras previsíveis: ambiguidade ("o sistema deve ser rápido"),
gatilhos ausentes ("o login é validado" — quando?) e estados ocultos ("admins podem excluir" — sempre? só quando
logados?). EARS elimina os três forçando o enunciado a um de **cinco modelos de frase** construídos
em torno de uma única palavra-chave de obrigação (`SHALL` / pt-BR `DEVE`).

O retorno para um fluxo orientado por IA: um enunciado EARS mapeia quase 1:1 para um cenário Gherkin e para um
CA, de modo que a rastreabilidade se torna **mecânica** em vez de interpretativa.

Esta referência mantém os identificadores pt-BR (`RF`, `RNF`, `CA`, `G`) de `05-convencoes-interpop.md`. **EARS
é a *redação*; a sigla é o *identificador*. Eles coexistem** — `RF-22` é a identidade; sua linha EARS é
como você o redige com precisão.

---

## 2. Os cinco padrões (palavra-chave EN / palavra-chave pt-BR)

| # | Padrão | Esqueleto EN | Esqueleto pt-BR | Use para |
|---|---------|-------------|----------------|---------|
| 1 | **Ubíquo** | THE SYSTEM SHALL `<response>` | O SISTEMA DEVE `<resposta>` | Propriedades sempre verdadeiras, invariantes |
| 2 | **Orientado a evento** | WHEN `<trigger>` THE SYSTEM SHALL `<response>` | QUANDO `<gatilho>` O SISTEMA DEVE `<resposta>` | Reação a um evento discreto |
| 3 | **Orientado a estado** | WHILE `<state>` THE SYSTEM SHALL `<response>` | ENQUANTO `<estado>` O SISTEMA DEVE `<resposta>` | Comportamento que vale durante um estado |
| 4 | **Comportamento indesejado** | IF `<condition>` THEN THE SYSTEM SHALL `<response>` | SE `<condição>` ENTÃO O SISTEMA DEVE `<resposta>` | Erros, falhas, casos de borda |
| 5 | **Recurso opcional** | WHERE `<feature included>` THE SYSTEM SHALL `<response>` | ONDE `<recurso habilitado>` O SISTEMA DEVE `<resposta>` | Comportamento condicionado a uma config/flag |

Os padrões **combinam** (o requisito "complexo"): as palavras-chave se empilham na ordem
`WHILE … WHEN … IF … THEN THE SYSTEM SHALL …` (pt-BR: `ENQUANTO … QUANDO … SE … ENTÃO O SISTEMA DEVE …`).

> **Disciplina de palavra-chave**: exatamente **um** `SHALL`/`DEVE` por enunciado → exatamente um comportamento testável.
> Nunca "should/must/will" ou "deveria/pode". Dois `SHALL`s = dois requisitos; separe-os.
>
> **Escolha de idioma**: num projeto pt-BR-first, prefira as palavras-chave pt-BR para que o enunciado continue legível para o
> time. A forma EN existe para contextos internacionais/de ferramentas de IA. Escolha uma por projeto e mantenha a consistência.

---

## 3. Os cinco padrões, com exemplos

Os exemplos vêm do domínio *"Interpop"* (moderação editorial) para manter a consistência com `examples/`.

### 3.1 Ubíquo — propriedade permanente

```
RF-12  O SISTEMA DEVE armazenar senhas com hash Argon2id (fator de trabalho >= 3).
RNF-04 O SISTEMA DEVE servir todo artigo publicado sobre HTTPS.
```

Mapeia para um CA invariante — frequentemente uma verificação de segurança/lint, e não um cenário comportamental.

### 3.2 Orientado a evento — `QUANDO … O SISTEMA DEVE`

O padrão mais comum: um gatilho discreto produz uma resposta.

```
RF-21  QUANDO um editor submete um artigo para revisão
       O SISTEMA DEVE mover o artigo para a fila "pending-moderation".
RF-22  QUANDO um moderador aprova um artigo pendente
       O SISTEMA DEVE publicá-lo e notificar o autor.
```

Mapeia quase diretamente para Gherkin:

```gherkin
Funcionalidade: Submissão para moderação
  Cenário: Artigo enviado entra na fila
    Quando um editor submete um artigo para revisão
    Então o artigo é movido para a fila "pending-moderation"
```

### 3.3 Orientado a estado — `ENQUANTO … O SISTEMA DEVE`

Comportamento que precisa valer durante toda a *duração* de um estado, não apenas num instante.

```
RF-30  ENQUANTO uma conta de usuário está suspensa
       O SISTEMA DEVE rejeitar todas as ações de publicar e comentar dessa conta.
RF-31  ENQUANTO a plataforma está em modo de manutenção somente-leitura
       O SISTEMA DEVE retornar HTTP 503 para todos os endpoints de escrita.
```

### 3.4 Comportamento indesejado — `SE … ENTÃO O SISTEMA DEVE`

Reservado para erros, falhas e casos de borda — a parte mais frequentemente esquecida na prosa, e a adição
de maior valor que EARS traz.

```
RF-40  SE um moderador tenta aprovar um artigo que foi excluído
       ENTÃO O SISTEMA DEVE rejeitar a ação e exibir "artigo não existe mais".
RF-41  SE o login falha 5 vezes em 10 minutos
       ENTÃO O SISTEMA DEVE bloquear a conta por 15 minutos.
```

### 3.5 Recurso opcional — `ONDE … O SISTEMA DEVE`

Comportamento que só existe quando um recurso/config está presente (multi-tenant / white-label).

```
RF-50  ONDE o módulo white-label está habilitado
       O SISTEMA DEVE servir o domínio custom do tenant via delegação CNAME.
```

### 3.6 Complexo (combinado)

```
RF-60  ENQUANTO uma assinatura está ativa
       QUANDO a data de renovação é atingida
       SE o método de pagamento primário falha
       ENTÃO O SISTEMA DEVE tentar o método secundário antes de marcar a assinatura como vencida.
```

---

## 4. O pipeline: `RF` (negócio) → EARS → CA → Gherkin

EARS **não** substitui o enunciado de negócio — ele o refina dentro do corpo do requisito.

```
RF-22  (título de negócio, pt-BR, SEM jargão — fica no docs/requirements/RF/)
       "Aprovação de artigo publica e notifica o autor."
   │  precisão opcional ↓ (no corpo do RF, quando útil)
   ▼
EARS:  QUANDO um moderador aprova um artigo pendente
       O SISTEMA DEVE publicá-lo e notificar o autor.
   │  one DEVE → one CA group
   ▼
CA01:  Artigo aprovado fica publicamente visível.
CA02:  Autor recebe notificação de aprovação.
   │  cada CA → um ou mais Cenário
   ▼
Gherkin: Cenário "Aprovação publica e notifica autor"
```

> **Os IDs de CA seguem `05-convencoes-interpop.md`: `CANN` (`CA01`, `CA02`…) dentro da Feature — sem hífen.**
> **Regra prática**: um enunciado EARS → um grupo de `CA` → um ou mais `Cenário`. Se uma única linha EARS
> explode em muitos CAs não relacionados, o requisito foi sub-decomposto — separe-o.

---

## 5. Checklist de anti-padrões

Rejeite ou reescreva qualquer enunciado EARS que:

- [ ] use "should/must/will" / "deveria/pode/irá" em vez de `SHALL`/`DEVE`
- [ ] contenha dois ou mais `SHALL`/`DEVE` num único enunciado
- [ ] tenha uma resposta sem resultado mensurável ("ser amigável", "ser rápido")
- [ ] seja orientado a evento mas omita o gatilho `WHEN`/`QUANDO`
- [ ] descreva um erro como caminho feliz (use `IF … THEN` / `SE … ENTÃO`)
- [ ] esconda uma pré-condição na prosa em vez de uma cláusula `WHILE`/`WHERE` (`ENQUANTO`/`ONDE`)
- [ ] misture detalhe de solução (o "como") no requisito (o "o quê")
- [ ] **coloque palavras-chave EARS no título de negócio do RF/Feature** (EARS pertence ao corpo/CA, nunca ao título)

---

## 6. EARS vs o resto desta skill

| Camada | Artefato | Vive em |
|-------|----------|----------|
| Catálogo / identidade (linguagem de negócio) | `RF-NN`, `RNF-NN` | `docs/requirements/` (`01-fundamentos.md`) |
| **Redação precisa (opcional)** | **enunciado EARS** | **dentro do corpo do RF — este arquivo** |
| Regra testável | `CANN` | `docs/backlog/features/F-NN.md` (`04-bdd-criterios-aceitacao.md`) |
| Spec executável | `Cenário` (Gherkin) | `04-…` + `examples/template-user-story.feature` |
| Rastreabilidade | RTM | `07-mudanca-rastreabilidade.md` |

EARS **alimenta** o BDD, não o substitui. Use EARS ao capturar/especificar com precisão; use Gherkin
quando esses requisitos se tornam testes de aceitação executáveis.

---

## 7. Hook de validação (MCP)

A ferramenta MCP [`validate_ears(text)`](../mcp-server/README.md) sinaliza redação fora do padrão EARS: ausência de `SHALL`/`DEVE`,
múltiplas palavras-chave de obrigação, ausência de gatilho numa frase temporal, palavras fracas/subjetivas e palavras-chave EARS
vazando para um título. Ela transforma o checklist da §5 num gate automatizado — **consultivo**, condizente com a
natureza opcional desta camada.

---

*Fontes: Mavin et al., "Easy Approach to Requirements Syntax (EARS)" (IEEE RE 2009); EARS Ruleset de Alistair Mavin;
cruzado com Sommerville Cap. 4 e Wiegers & Beatty Cap. 11. Notação alinhada com os fluxos spec-driven do AWS
Kiro e do GitHub Spec Kit 2026 — adotada aqui como uma camada **opcional**, condizente com
a convenção desta skill de linguagem-de-negócio-primeiro, pt-BR.*
