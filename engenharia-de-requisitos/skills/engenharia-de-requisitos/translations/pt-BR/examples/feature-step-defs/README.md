# Variantes de step-definition de feature — um Gherkin, seis stacks

> **Escreva o `.feature` uma vez, ligue-o a qualquer stack.** O feature canônico
> [`../template-user-story.feature`](../template-user-story.feature) é uma spec **Gherkin pt-BR** (`# language: pt`,
> `Funcionalidade/Cenário/Dado/Quando/Então`). O Gherkin é o *contrato* entre o stakeholder que o lê e o runner
> de teste que o executa — e **todo runner BDD relevante parseia o mesmo arquivo nativamente**. Os esqueletos de
> step-definition prontos para 6 ecossistemas ligam esse único feature, de modo que a escolha da stack de teste
> nunca obriga a reescrever o requisito.

> 🟡 **O código dos step-defs é neutro de idioma e não se traduz** — ele liga os passos do Gherkin pt-BR
> independentemente do idioma da documentação. Por isso os arquivos `.py/.js/.ts/.cs/.php` vivem **uma única vez**
> na raiz autoritativa em [`../../../examples/feature-step-defs/`](../../../examples/feature-step-defs/); este
> README é a tradução pt-BR do guia. Compõe com
> [`../../references/04-bdd-criterios-aceitacao.md`](../../references/04-bdd-criterios-aceitacao.md) (BDD + CA) e a
> disciplina `e2e-testing-patterns`.

## As seis ligações

| Stack | Linguagem | Liga via | Instalar | Rodar |
|---|---|---|---|---|
| [`pytest_bdd_steps.py`](../../../examples/feature-step-defs/pytest_bdd_steps.py) | Python | `@given/@when/@then` + `scenarios()` | `uv add --dev pytest-bdd` | `uv run pytest` |
| [`behave_steps.py`](../../../examples/feature-step-defs/behave_steps.py) | Python | `@given/@when/@then` + `environment.py` | `uv add --dev behave` | `uv run behave` |
| [`cucumber_js.steps.js`](../../../examples/feature-step-defs/cucumber_js.steps.js) | JS (API/unit) | World do `@cucumber/cucumber` | `npm i -D @cucumber/cucumber` | `npx cucumber-js` |
| [`cucumber_playwright.steps.ts`](../../../examples/feature-step-defs/cucumber_playwright.steps.ts) | TS (E2E browser) | `@cucumber/cucumber` + `@playwright/test` | `npm i -D @cucumber/cucumber @playwright/test` | `npx cucumber-js` |
| [`specflow_Steps.cs`](../../../examples/feature-step-defs/specflow_Steps.cs) | C# / .NET | `[Binding]` + `[Given]/[When]/[Then]` | `dotnet add package Reqnroll.xUnit` | `dotnet test` |
| [`behat_FeatureContext.php`](../../../examples/feature-step-defs/behat_FeatureContext.php) | PHP | `FeatureContext` + `@Given/@When/@Then` | `composer require --dev behat/behat` | `vendor/bin/behat` |

> **Gherkin pt-BR funciona de imediato** nas seis — Cucumber/Behave/SpecFlow-Reqnroll/Behat leem o cabeçalho
> `# language: pt` e casam `Dado/Quando/Então` com seus passos. Você **não** traduz o feature para ligá-lo; não
> traduz nada. (O pytest-bdd também honra o cabeçalho.)

> **SpecFlow → Reqnroll.** O SpecFlow foi descontinuado em 2024; **[Reqnroll](https://reqnroll.net)** é o sucessor
> open-source drop-in (mesma API `[Binding]`/`[Given]`, mesmo Gherkin). O esqueleto `.cs` usa namespaces do
> Reqnroll; num projeto SpecFlow legado, troque `using Reqnroll;` → `using TechTalk.SpecFlow;` — nada mais muda.

## Onde os arquivos de step ficam num projeto real (eles NÃO ficam aqui)

`examples/` é uma *referência*; no projeto hospedeiro a cola vive ao lado da suíte:

```
# Python (pytest-bdd / behave)
features/US30-1-busca-editorial.feature
features/steps/test_busca.py          # pytest-bdd
features/steps/busca_steps.py         # behave  (+ features/environment.py para hooks)

# JS/TS (cucumber-js / cucumber-playwright)
e2e/features/US30-1-busca-editorial.feature
e2e/features/step_definitions/busca.steps.ts
e2e/support/world.ts                  # World customizado (guarda a page do Playwright)

# .NET (Reqnroll)            # PHP (Behat)
Features/BuscaEditorial.feature        features/US30-1-busca-editorial.feature
StepDefinitions/BuscaSteps.cs          features/bootstrap/FeatureContext.php
```

## A rastreabilidade permanece intacta

Cada esqueleto repete o cabeçalho de rastreabilidade do feature (`@US`, `@F`, `@EP`, `@CAs`, `@Doc-Req`) como
comentário, de modo que um revisor lendo o arquivo de step ainda consegue voltar até o `RF` no documento de
requisitos ([`../../references/07-mudanca-rastreabilidade.md`](../../references/07-mudanca-rastreabilidade.md)).
Ligar um feature a uma nova stack nunca rompe a cadeia `RF ↔ CA ↔ Cenário ↔ teste`.
