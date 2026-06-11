// Step definitions — @cucumber/cucumber (Node.js, API/unit level — no browser)
// Binds: ../template-user-story.feature  (pt-BR Gherkin, `# language: pt`)
//
// @US: US30.1 · @F: F-30 · @EP: EP-10 · @CAs: CA01..CA11 · @Doc-Req: docs/specs/busca-editorial/REQUISITOS.md
//
// Setup:  npm i -D @cucumber/cucumber
// Run:    npx cucumber-js
// cucumber.js config (cucumber.cjs):
//   module.exports = { default: { paths: ['e2e/features/**/*.feature'],
//                                 require: ['e2e/features/step_definitions/**/*.js'] } };
// Cucumber matches `Dado/Quando/Então` from the `# language: pt` header automatically.

const { Given, When, Then, setWorldConstructor } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');

// Custom World keeps per-scenario state (isolated; Cucumber builds a new World per scenario).
class SearchWorld {
  constructor() {
    this.response = null;
    this.elapsedMs = null;
    this.term = null;
  }
}
setWorldConstructor(SearchWorld);

// --- DADO ----------------------------------------------------------------------
Given('que o sistema Interpop está acessível ao público', function () {
  assert.ok(this.api, 'API client must be wired in support/hooks');
});

Given(
  'existem {int} artigos publicados que contêm a palavra {string}',
  async function (n, term) {
    await this.api.seedArticles(n, { title: `Sobre ${term}`, status: 'publicado' });
  },
);

// --- QUANDO --------------------------------------------------------------------
When('o leitor digita {string} no campo de busca', function (term) {
  this.term = term;
});

When('o leitor busca por {string}', async function (term) {
  // Scenario Outline binding
  const start = performance.now();
  this.response = await this.api.get(`/api/v1/search/articles?q=${term}`);
  this.elapsedMs = performance.now() - start;
});

// --- ENTÃO ---------------------------------------------------------------------
Then('o sistema apresenta uma lista de cards de artigos', function () {
  assert.equal(this.response.status, 200);
  assert.ok(this.response.body.results.length > 0);
});

Then(
  'os artigos aparecem ordenados do mais relevante para o menos relevante',
  function () {
    const scores = this.response.body.results.map((a) => a.relevance);
    assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
  },
);

Then('o resultado deve conter o artigo {string}', function (title) {
  const titles = this.response.body.results.map((a) => a.title);
  assert.ok(titles.includes(title));
});

Then('a primeira tela completa carrega em menos de 800ms', function () {
  assert.ok(this.elapsedMs < 800, `budget exceeded: ${this.elapsedMs}ms`);
});
