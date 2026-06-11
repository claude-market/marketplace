<?php
// Step definitions — Behat (PHP)
// Binds: ../template-user-story.feature  (pt-BR Gherkin, `# language: pt`)
//
// @US: US30.1 · @F: F-30 · @EP: EP-10 · @CAs: CA01..CA11 · @Doc-Req: docs/specs/busca-editorial/REQUISITOS.md
//
// Setup:  composer require --dev behat/behat      Run:  vendor/bin/behat
// behat.yml:
//   default:
//     suites:
//       default:
//         paths: ['%paths.base%/features']
//         contexts: ['FeatureContext']
// Behat reads `# language: pt` from the feature header; annotations match Dado/Quando/Então.

use Behat\Behat\Context\Context;
use PHPUnit\Framework\Assert;

final class FeatureContext implements Context
{
    private ApiClient $api;
    private object $response;
    private float $elapsedMs;

    public function __construct()
    {
        $this->api = new ApiClient();   // or inject a test double via behat.yml
    }

    // --- DADO -------------------------------------------------------------------
    /** @Given que o sistema Interpop está acessível ao público */
    public function sistemaAcessivel(): void
    {
        Assert::assertNotNull($this->api);
    }

    /** @Given existem :n artigos publicados que contêm a palavra :termo */
    public function semearArtigos(int $n, string $termo): void
    {
        $this->api->seedArticles($n, ['title' => "Sobre {$termo}", 'status' => 'publicado']);
    }

    // --- QUANDO -----------------------------------------------------------------
    /** @When o leitor busca por :termo */
    public function leitorBusca(string $termo): void   // Scenario Outline binding
    {
        $start = microtime(true);
        $this->response = $this->api->get("/api/v1/search/articles?q={$termo}");
        $this->elapsedMs = (microtime(true) - $start) * 1000;
    }

    // --- ENTÃO ------------------------------------------------------------------
    /** @Then o sistema apresenta uma lista de cards de artigos */
    public function listaPresente(): void
    {
        Assert::assertSame(200, $this->response->status);
        Assert::assertNotEmpty($this->response->body['results']);
    }

    /** @Then o resultado deve conter o artigo :titulo */
    public function resultadoContem(string $titulo): void   // Scenario Outline
    {
        $titles = array_column($this->response->body['results'], 'title');
        Assert::assertContains($titulo, $titles);
    }

    /** @Then a primeira tela completa carrega em menos de 800ms */
    public function dentroDoOrcamento(): void
    {
        Assert::assertLessThan(800, $this->elapsedMs);
    }
}
