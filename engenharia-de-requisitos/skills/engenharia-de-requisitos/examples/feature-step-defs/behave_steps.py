# Step definitions — behave (Python)
# Binds: ../template-user-story.feature  (pt-BR Gherkin, `# language: pt`)
#
# @US: US30.1 · @F: F-30 · @EP: EP-10 · @CAs: CA01..CA11 · @Doc-Req: docs/specs/busca-editorial/REQUISITOS.md
#
# Setup:  uv add --dev behave        |     Run:  uv run behave
# behave reads `# language: pt` natively; state lives on the `context` object.
# Hooks (DB reset per scenario) go in features/environment.py, e.g.:
#     def before_scenario(context, scenario): context.db = fresh_test_db()

import time

from behave import given, when, then


# --- DADO ------------------------------------------------------------------------
@given("que o sistema Interpop está acessível ao público")
def step_system_up(context):
    assert context.client is not None


@given('existem {n:d} artigos publicados que contêm a palavra "{term}"')
def step_seed(context, n, term):
    context.article_factory.create_batch(n, title=f"Sobre {term}", status="publicado")


@given('que o leitor está na página de busca')
def step_on_search(context):
    context.page = "/busca"


# --- QUANDO ----------------------------------------------------------------------
@when('o leitor digita "{term}" e pressiona Enter')
def step_search(context, term):
    context.term = term
    start = time.perf_counter()
    context.response = context.client.get(f"/api/v1/search/articles?q={term}")
    context.elapsed_ms = (time.perf_counter() - start) * 1000


@when('o leitor busca por "{term}"')  # Scenario Outline
def step_outline_search(context, term):
    context.response = context.client.get(f"/api/v1/search/articles?q={term}")


# --- ENTÃO -----------------------------------------------------------------------
@then("o sistema apresenta uma lista de cards de artigos")
def step_list(context):
    assert context.response.status_code == 200
    assert len(context.response.json()["results"]) > 0


@then('o sistema exibe a mensagem "{message}"')
def step_message(context, message):
    assert message in context.response.json().get("message", "")


@then("a primeira tela completa carrega em menos de 800ms")
def step_budget(context):
    assert context.elapsed_ms < 800


@then('o resultado deve conter o artigo "{title}"')  # Scenario Outline
def step_outline_assert(context, title):
    titles = [a["title"] for a in context.response.json()["results"]]
    assert title in titles
