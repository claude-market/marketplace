# Step definitions — pytest-bdd (Python)
# Binds: ../template-user-story.feature  (pt-BR Gherkin, `# language: pt`)
#
# @US: US30.1 · @F: F-30 · @EP: EP-10 · @CAs: CA01,CA02,CA03,CA04,CA05,CA06,CA08,CA09,CA11
# @Doc-Req: docs/specs/busca-editorial/REQUISITOS.md
#
# Setup:  uv add --dev pytest-bdd     |     Run:  uv run pytest
# pytest-bdd reads the `# language: pt` header natively — no translation needed.

import time

from pytest_bdd import scenarios, given, when, then, parsers

# Bind every scenario in the feature file (relative to this test module).
scenarios("../template-user-story.feature")


# --- fixtures hold scenario state (one dict per scenario, no cross-coupling) ---
import pytest


@pytest.fixture
def ctx():
    return {"response": None, "elapsed_ms": None, "term": None}


# --- DADO (state / pre-conditions) ----------------------------------------------
@given("que o sistema Interpop está acessível ao público")
def system_up():
    pass  # base fixture / test server already running


@given(parsers.parse('existem {n:d} artigos publicados que contêm a palavra "{term}"'))
def seed_articles(article_factory, n, term):
    article_factory.create_batch(n, title=f"Sobre {term}", status="publicado")


@given('que o leitor está na página principal do Interpop')
def reader_on_home(ctx):
    ctx["page"] = "/"


# --- QUANDO (action, no assertion) ----------------------------------------------
@when(parsers.parse('digita "{term}" no campo de busca'))
def type_term(ctx, term):
    ctx["term"] = term


@when("pressiona Enter")
def press_enter(ctx, client):
    start = time.perf_counter()
    ctx["response"] = client.get(f"/api/v1/search/articles?q={ctx['term']}")
    ctx["elapsed_ms"] = (time.perf_counter() - start) * 1000


@when(parsers.parse('o leitor busca por "{term}"'))  # Scenario Outline binding
def reader_searches(ctx, client, term):
    ctx["term"] = term
    ctx["response"] = client.get(f"/api/v1/search/articles?q={term}")


# --- ENTÃO (verification, no state change) --------------------------------------
@then("o sistema apresenta uma lista de cards de artigos")
def list_present(ctx):
    assert ctx["response"].status_code == 200
    assert len(ctx["response"].json()["results"]) > 0


@then("os artigos aparecem ordenados do mais relevante para o menos relevante")
def ordered_by_relevance(ctx):
    scores = [a["relevance"] for a in ctx["response"].json()["results"]]
    assert scores == sorted(scores, reverse=True)


@then("a primeira tela completa carrega em menos de 800ms")
def under_budget(ctx):
    assert ctx["elapsed_ms"] is not None and ctx["elapsed_ms"] < 800


@then(parsers.parse('o sistema exibe a mensagem "{message}"'))
def shows_message(ctx, message):
    assert message in ctx["response"].json().get("message", "")


@then(parsers.parse('o resultado deve conter o artigo "{title}"'))  # Scenario Outline
def result_contains(ctx, title):
    titles = [a["title"] for a in ctx["response"].json()["results"]]
    assert title in titles
