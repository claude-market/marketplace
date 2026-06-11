// Step definitions — Reqnroll (C# / .NET; the maintained successor of SpecFlow)
// Binds: ../template-user-story.feature  (pt-BR Gherkin, `# language: pt`)
//
// @US: US30.1 · @F: F-30 · @EP: EP-10 · @CAs: CA01..CA11 · @Doc-Req: docs/specs/busca-editorial/REQUISITOS.md
//
// Setup:  dotnet add package Reqnroll.xUnit        Run:  dotnet test
// Legacy SpecFlow project? swap `using Reqnroll;` -> `using TechTalk.SpecFlow;` (identical API).
// Reqnroll/SpecFlow read the `# language: pt` header; [Given]/[When]/[Then] regex match Dado/Quando/Então.

using System.Diagnostics;
using Reqnroll;
using Xunit;

namespace Interpop.Specs;

[Binding]
public class BuscaEditorialSteps
{
    private readonly ScenarioContext _ctx;   // per-scenario state bag (isolated)
    private readonly ApiClient _api;          // injected via Reqnroll context-injection

    public BuscaEditorialSteps(ScenarioContext ctx, ApiClient api) => (_ctx, _api) = (ctx, api);

    // --- DADO -------------------------------------------------------------------
    [Given(@"que o sistema Interpop está acessível ao público")]
    public void SistemaAcessivel() => Assert.NotNull(_api);

    [Given(@"existem (\d+) artigos publicados que contêm a palavra ""(.*)""")]
    public async Task SemearArtigos(int n, string termo) =>
        await _api.SeedArticlesAsync(n, title: $"Sobre {termo}", status: "publicado");

    // --- QUANDO -----------------------------------------------------------------
    [When(@"o leitor busca por ""(.*)""")]   // Scenario Outline binding
    public async Task LeitorBusca(string termo)
    {
        var sw = Stopwatch.StartNew();
        _ctx["response"] = await _api.GetAsync($"/api/v1/search/articles?q={termo}");
        _ctx["elapsedMs"] = sw.Elapsed.TotalMilliseconds;
    }

    // --- ENTÃO ------------------------------------------------------------------
    [Then(@"o sistema apresenta uma lista de cards de artigos")]
    public void ListaPresente()
    {
        var res = _ctx.Get<SearchResponse>("response");
        Assert.Equal(200, res.Status);
        Assert.NotEmpty(res.Results);
    }

    [Then(@"o resultado deve conter o artigo ""(.*)""")]   // Scenario Outline
    public void ResultadoContem(string titulo)
    {
        var res = _ctx.Get<SearchResponse>("response");
        Assert.Contains(res.Results, a => a.Title == titulo);
    }

    [Then(@"a primeira tela completa carrega em menos de 800ms")]
    public void DentroDoOrcamento() =>
        Assert.True(_ctx.Get<double>("elapsedMs") < 800);
}
