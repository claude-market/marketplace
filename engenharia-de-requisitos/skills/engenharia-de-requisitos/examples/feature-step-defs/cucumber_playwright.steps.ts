// Step definitions — @cucumber/cucumber + Playwright (TypeScript, browser E2E)
// Binds: ../template-user-story.feature  (pt-BR Gherkin, `# language: pt`)
//
// @US: US30.1 · @F: F-30 · @EP: EP-10 · @CAs: CA01..CA11 · @Doc-Req: docs/specs/busca-editorial/REQUISITOS.md
//
// Setup:  npm i -D @cucumber/cucumber @playwright/test
// Run:    npx cucumber-js
// The custom World owns the Playwright `page`; open/close it in support/hooks.ts
// (Before → browser.newPage(); After → page.close()). Keep steps UI-light: prefer
// role/label locators over brittle CSS, and assert domain outcomes, not pixels.

import { Given, When, Then, setWorldConstructor, World } from '@cucumber/cucumber';
import { expect, Page, Browser, chromium } from '@playwright/test';

class UiWorld extends World {
  browser!: Browser;
  page!: Page;
  async open() {
    this.browser = await chromium.launch();
    this.page = await this.browser.newPage();
  }
  async close() {
    await this.browser?.close();
  }
}
setWorldConstructor(UiWorld);

// --- DADO ----------------------------------------------------------------------
Given('que o leitor está na página principal do Interpop', async function (this: UiWorld) {
  await this.open();
  await this.page.goto('/');
});

Given(
  'existem {int} artigos publicados que contêm a palavra {string}',
  async function (this: UiWorld, n: number, term: string) {
    await this.page.request.post('/test/seed', { data: { count: n, term } });
  },
);

// --- QUANDO --------------------------------------------------------------------
When('o leitor acessa a busca pelo menu superior', async function (this: UiWorld) {
  await this.page.getByRole('link', { name: /buscar/i }).click();
});

When('digita {string} no campo de busca', async function (this: UiWorld, term: string) {
  await this.page.getByRole('searchbox').fill(term);
});

When('pressiona Enter', async function (this: UiWorld) {
  await this.page.getByRole('searchbox').press('Enter');
});

// --- ENTÃO ---------------------------------------------------------------------
Then('o sistema apresenta uma lista de cards de artigos', async function (this: UiWorld) {
  await expect(this.page.getByTestId('article-card').first()).toBeVisible();
});

Then('os primeiros 20 artigos aparecem na primeira tela', async function (this: UiWorld) {
  await expect(this.page.getByTestId('article-card')).toHaveCount(20);
});

Then(
  'o termo {string} aparece destacado em amarelo em cada card',
  async function (this: UiWorld, term: string) {
    const mark = this.page.getByTestId('article-card').first().locator('mark');
    await expect(mark).toContainText(new RegExp(term, 'i'));
  },
);

Then(
  'o resultado deve conter o artigo {string}',
  async function (this: UiWorld, title: string) {
    // Scenario Outline binding (case/diacritic-insensitive search)
    await expect(this.page.getByRole('article', { name: title })).toBeVisible();
  },
);
