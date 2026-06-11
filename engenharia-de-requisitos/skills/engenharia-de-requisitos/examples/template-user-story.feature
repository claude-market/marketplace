# language: pt
#
# Template — ready-to-copy .feature file (Gherkin pt-BR)
# ------------------------------------------------------
#
# NOTE ON LANGUAGE: this template uses **pt-BR Gherkin** (`# language: pt`,
# `Funcionalidade:`, `Cenário:`, `Dado/Quando/Então`) because it reproduces
# the actual format used by Interpop, SIRA, and Controle de Dopagem
# projects, whose stakeholders read Portuguese. For projects in en-CA,
# remove the `# language: pt` header at the top and use the English
# keywords (`Feature:`, `Scenario:`, `Given/When/Then`). Gherkin
# semantics are identical in both dialects (Cucumber, Behave, SpecFlow,
# Behat all support both natively).
#
# HOW TO USE:
#   1. Copy this file into the project repository (Django: backend/features/<US-id>.feature;
#      React + Playwright: e2e/features/<US-id>.feature).
#   2. Rename the file to reflect the User Story ID (e.g.: US30-1-busca-editorial.feature).
#   3. Replace the Busca Editorial example with the real content of YOUR User Story.
#   4. Each `Cenário:` runs separately. Cover: happy path + error/edge + (if useful)
#      alternative path.
#
# HOW TO MAP TO THE BACKLOG:
#   - "Funcionalidade:" (Gherkin keyword) is NOT the Feature of the OpenProject hierarchy!
#     It generally maps 1-to-1 with ONE User Story of the backlog.
#     See references/04-bdd-criterios-aceitacao.md §3.5 for the terminological false friend.
#
#   - "Cenário:" is the content of the User Story "Description" field.
#     Does not create a child card in OpenProject.
#
# HARD RULES FOR SCENARIOS (Liz Keogh — BDD scenario quality):
#   - Concrete — use real values ("CAD $100", "kpop", "joao@email.com"), not placeholders.
#   - Short — 3-7 steps per scenario. More than that, split into multiple scenarios.
#   - Focus on ONE behaviour — do not test 3 things in the same scenario.
#   - UI-independent — talk in domain terms ("the reader searches for X"),
#     not implementation ("the user clicks the #submit-search button").
#   - Deterministic — same Dado+Quando → always the same Então (no Date.now(), no random).
#   - Non-coupling — Dado of one scenario does NOT depend on execution of another.
#
# STEP CONVENTION:
#   Dado / Given  → STATE (pre-condition, no action, no verification)
#   Quando / When → ACTION (no verification)
#   Então / Then  → VERIFICATION (no state change)
#   E / Mas       → conjunction/negation (of any clause)
#
# MANDATORY TRACEABILITY IN THE TOP COMMENT:
#   @US: User Story ID from the backlog
#   @F:  parent Feature ID
#   @EP: Epic ID
#   @CAs: list of covered ACs
#   @SP: story points
#   @Doc-Req: relative path to the requirements document
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
  # CONTEXT — pre-conditions common to all scenarios below
  # ----------------------------------------------------------------------------
  Contexto:
    Dado que o sistema Interpop está acessível ao público
    E o acervo tem artigos publicados sobre vários temas
    E não exijo login para realizar busca

  # ----------------------------------------------------------------------------
  # SCENARIO 1 — happy path (CA01, CA02, CA05, CA06, CA08, CA09, CA11)
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
  # SCENARIO 2 — alternative path / no result (CA03)
  # ----------------------------------------------------------------------------
  Cenário: Leitor não encontra resultados
    Dado que o leitor está na página de busca
    E NÃO existe nenhum artigo publicado com a palavra "xkcdunicornio"
    Quando o leitor digita "xkcdunicornio" e pressiona Enter
    Então o sistema exibe a mensagem "Nenhum artigo encontrado para xkcdunicornio"
    E o campo de busca permanece preenchido com o termo digitado

  # ----------------------------------------------------------------------------
  # SCENARIO 3 — link sharing (CA10, connects with US30.2)
  # ----------------------------------------------------------------------------
  Cenário: Leitor compartilha a busca por link
    Dado que o leitor está vendo os resultados da busca por "kpop"
    Quando o leitor copia a URL da barra de endereços
    E envia para outra pessoa
    E essa outra pessoa abre o link em outro navegador
    Então a outra pessoa vê os mesmos resultados, na mesma ordem
    E o termo "kpop" aparece preenchido no campo de busca

  # ----------------------------------------------------------------------------
  # SCENARIO 4 — edge: term too short (CA04)
  # ----------------------------------------------------------------------------
  Cenário: Leitor digita termo abaixo do mínimo
    Dado que o leitor está na página de busca
    Quando o leitor digita "k" no campo de busca
    Então o sistema NÃO dispara a consulta
    E o campo exibe a mensagem "Digite entre 2 e 100 caracteres"
    E nenhum card é renderizado

  # ----------------------------------------------------------------------------
  # SCENARIO OUTLINE — input variations for CA05 (case + diacritic insensitive)
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
# TECHNICAL NOTE (for the team that will automate)
# ==============================================================================
#
# This .feature file is EXECUTABLE via:
#   - Python backend  → pytest-bdd OR behave (we recommend pytest-bdd in Interpop).
#   - Frontend E2E    → @cucumber/cucumber + Playwright (cucumber-playwright).
#
# READY STEP-DEFINITION SKELETONS for SIX stacks — pytest-bdd, behave, cucumber-js,
# cucumber-playwright, Reqnroll/SpecFlow (C#), and Behat (PHP) — that bind THIS exact
# feature live in  feature-step-defs/  (see feature-step-defs/README.md). Write the
# Gherkin once; pick any stack without rewriting the requirement.
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
