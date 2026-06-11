# language: pt
#
# Template — arquivo .feature pronto para copiar (Gherkin pt-BR)
# ---------------------------------------------------------------
#
# COMO USAR:
#   1. Copie este arquivo para o repositório do projeto (Django: backend/features/<US-id>.feature;
#      React + Playwright: e2e/features/<US-id>.feature).
#   2. Renomeie o arquivo refletindo o ID da User Story (ex.: US30-1-busca-editorial.feature).
#   3. Substitua o exemplo da Busca Editorial pelo conteúdo real da SUA User Story.
#   4. Cada `Cenário:` é executável separadamente. Cubra: caminho feliz + erro/borda + (se útil)
#      caminho alternativo.
#
# COMO MAPEAR PARA O BACKLOG:
#   - "Funcionalidade:" (palavra-chave Gherkin) NÃO é a Feature da hierarquia OpenProject!
#     Em geral mapeia 1-para-1 com UMA User Story do backlog.
#     Ver references/04-bdd-criterios-aceitacao.md §3.5 para o falso amigo terminológico.
#
#   - "Cenário:" é o conteúdo do campo "Descrição" da User Story.
#     Não cria card filho no OpenProject.
#
# REGRAS DURAS DOS CENÁRIOS (Liz Keogh — qualidade de cenário BDD):
#   - Concreto — use valores reais ("R$ 100", "kpop", "joão@email.com"), não placeholders.
#   - Curto — 3-7 steps por cenário. Mais que isso, fatie em múltiplos cenários.
#   - Foco em UM comportamento — não teste 3 coisas no mesmo cenário.
#   - Independente de UI — fale em termos de domínio ("leitor busca por X"),
#     não de implementação ("usuário clica no botão #submit-search").
#   - Determinístico — mesmo Dado+Quando → sempre o mesmo Então (sem Date.now(), sem random).
#   - Não acopla — Dado de um cenário NÃO depende de execução de outro.
#
# CONVENÇÃO DE STEP:
#   Dado / Given  → ESTADO (pré-condição, sem ação, sem verificação)
#   Quando / When → AÇÃO (sem verificação)
#   Então / Then  → VERIFICAÇÃO (sem mudar estado)
#   E / Mas       → conjunção/negação (de qualquer cláusula)
#
# RASTREABILIDADE OBRIGATÓRIA NO COMENTÁRIO DE TOPO:
#   @US: ID da User Story do backlog
#   @F:  ID da Feature pai
#   @EP: ID do Epic
#   @CAs: lista dos CAs cobertos
#   @SP: story points
#   @Doc-Req: caminho relativo do documento de requisitos
#
# ==============================================================================

# @US:    US30.1 — Apresentação básica e ordenação dos resultados da busca
# @F:     F-30  — Busca de artigos por texto
# @EP:    EP-10 — Busca Editorial
# @CAs:   CA01, CA02, CA05, CA06, CA08, CA09, CA11
# @SP:    8
# @Doc-Req: docs/specs/busca-editorial/REQUISITOS.md (rev. 1.2 de 28/05/2026)

Funcionalidade: US30.1 — Apresentação básica e ordenação dos resultados da busca
  Como leitor do Interpop
  Eu quero buscar artigos por palavra-chave e ver resultados ordenados por relevância
  Para encontrar conteúdo do meu interesse rapidamente

  # ----------------------------------------------------------------------------
  # CONTEXTO — pré-condições comuns a todos os cenários abaixo
  # ----------------------------------------------------------------------------
  Contexto:
    Dado que o sistema Interpop está acessível ao público
    E o acervo tem artigos publicados sobre vários temas
    E não exijo login para realizar busca

  # ----------------------------------------------------------------------------
  # CENÁRIO 1 — caminho feliz (CA01, CA02, CA05, CA06, CA08, CA09, CA11)
  # ----------------------------------------------------------------------------
  Cenário: Leitor realiza busca simples e visualiza resultados ordenados
    Dado que o leitor está na página principal do Interpop
    E existem 142 artigos publicados que contêm a palavra "kpop"
    Quando o leitor acessa a busca pelo menu superior
    E digita "kpop" no campo de busca
    E pressiona Enter
    Então o sistema apresenta uma lista de cards de artigos
    E os artigos aparecem ordenados do mais relevante para o menos relevante
    E os primeiros 20 artigos aparecem na primeira tela
    E o termo "kpop" aparece destacado em amarelo em cada card
    E a primeira tela completa carrega em menos de 800ms

  # ----------------------------------------------------------------------------
  # CENÁRIO 2 — caminho alternativo / ausência de resultado (CA03)
  # ----------------------------------------------------------------------------
  Cenário: Leitor não encontra resultados
    Dado que o leitor está na página de busca
    E NÃO existe nenhum artigo publicado com a palavra "xkcdunicornio"
    Quando o leitor digita "xkcdunicornio" e pressiona Enter
    Então o sistema exibe a mensagem "Nenhum artigo encontrado para xkcdunicornio"
    E o campo de busca permanece preenchido com o termo digitado

  # ----------------------------------------------------------------------------
  # CENÁRIO 3 — compartilhamento por link (CA10, conecta com US30.2)
  # ----------------------------------------------------------------------------
  Cenário: Leitor compartilha a busca por link
    Dado que o leitor está vendo os resultados da busca por "kpop"
    Quando o leitor copia a URL da barra de endereços
    E envia para outra pessoa
    E essa outra pessoa abre o link em outro navegador
    Então a outra pessoa vê os mesmos resultados, na mesma ordem
    E o termo "kpop" aparece preenchido no campo de busca

  # ----------------------------------------------------------------------------
  # CENÁRIO 4 — borda: termo curto demais (CA04)
  # ----------------------------------------------------------------------------
  Cenário: Leitor digita termo abaixo do mínimo
    Dado que o leitor está na página de busca
    Quando o leitor digita "k" no campo de busca
    Então o sistema NÃO dispara a consulta
    E o campo exibe a mensagem "Digite entre 2 e 100 caracteres"
    E nenhum card é renderizado

  # ----------------------------------------------------------------------------
  # ESQUEMA DO CENÁRIO — variações de input para CA05 (case + diacritic insensitive)
  # ----------------------------------------------------------------------------
  Esquema do Cenário: Busca é case-insensitive e diacritic-insensitive
    Dado que existe 1 artigo publicado com o título "Pop coreano: o caso BTS"
    Quando o leitor busca por "<termo>"
    Então o resultado deve conter o artigo "Pop coreano: o caso BTS"

    Exemplos:
      | termo |
      | pop   |
      | POP   |
      | Pop   |
      | póp   |
      | PÓP   |

# ==============================================================================
# NOTA TÉCNICA (para a equipe que vai automatizar)
# ==============================================================================
#
# Este arquivo .feature é EXECUTÁVEL via:
#   - Backend Python  → pytest-bdd OU behave (recomendamos pytest-bdd no Interpop).
#   - Frontend E2E    → @cucumber/cucumber + Playwright (cucumber-playwright).
#
# Step definitions (Python — pytest-bdd):
#
#   from pytest_bdd import scenarios, given, when, then
#   scenarios("US30-1-busca-editorial.feature")
#
#   @given('que existem 142 artigos publicados que contêm a palavra "kpop"')
#   def seed_artigos(article_factory):
#       article_factory.create_batch(142, title="Sobre kpop", status="publicado")
#
#   @when('o leitor digita "{termo}" no campo de busca')
#   def busca(client, termo):
#       response = client.get(f"/api/v1/search/articles?q={termo}")
#       return response
#
#   @then('o sistema apresenta uma lista de cards de artigos')
#   def verifica(response):
#       assert response.status_code == 200
#       assert len(response.json()["results"]) > 0
#
# Step definitions (TypeScript — Playwright):
#
#   import { Given, When, Then } from "@cucumber/cucumber";
#   import { expect } from "@playwright/test";
#
#   Given('que o leitor está na página principal do Interpop', async function () {
#     await this.page.goto("/");
#   });
#
#   When('o leitor digita "{string}" no campo de busca', async function (termo) {
#     await this.page.fill('input[name="q"]', termo);
#     await this.page.press('input[name="q"]', "Enter");
#   });
#
#   Then('a primeira tela completa carrega em menos de 800ms', async function () {
#     const elapsed = await this.page.evaluate(() => performance.now());
#     expect(elapsed).toBeLessThan(800);
#   });
