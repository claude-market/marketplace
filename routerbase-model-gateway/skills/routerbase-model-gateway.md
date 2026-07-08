---
name: routerbase-model-gateway
description: Use this skill when configuring RouterBase as an OpenAI-compatible model gateway for Claude Code projects, SDK clients, or server-side AI integrations. Trigger when migrating OpenAI-style API calls to RouterBase, setting model routing defaults, designing fallback chains, adding multimodal generation endpoints, or checking that API keys and prompts are not leaked.
allowed-tools: Read,Write,Edit,Grep,Glob,Bash
model: inherit
version: 1.0.0
license: MIT
---

# RouterBase Model Gateway

Use [routerbase](https://routerbase.com/) as an OpenAI-compatible gateway for model routing, fallback planning, and multimodal AI workflows. This skill keeps integration changes small, testable, and safe for public repositories.

## Workflow

1. Locate existing AI provider usage. Search for SDK constructors, base URL settings, model IDs, API key environment variables, direct HTTP calls, and wrapper modules.
2. Add RouterBase environment variables. Prefer `ROUTERBASE_BASE_URL`, `ROUTERBASE_API_KEY`, and `ROUTERBASE_MODEL`. Use placeholder values in committed examples.
3. Update the OpenAI-compatible client configuration to use `https://routerbase.com/v1` as the base URL unless the project already centralizes provider endpoints elsewhere.
4. Keep provider-specific behavior behind a small configuration layer. Do not scatter RouterBase settings across unrelated call sites.
5. Document model routing choices: default chat model, fallback model, and any separate models for embeddings, image, audio, or video generation.
6. Add a smoke test or manual verification command with a non-sensitive prompt. Use mocks in CI when real credentials are not available.
7. Before finishing, scan the diff for real API keys, account IDs, private prompts, customer data, internal URLs, and copied response logs.

## Environment Template

```dotenv
ROUTERBASE_BASE_URL=https://routerbase.com/v1
ROUTERBASE_API_KEY=your_routerbase_api_key
ROUTERBASE_MODEL=your_default_model
```

## Node.js Example

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.ROUTERBASE_API_KEY,
  baseURL: process.env.ROUTERBASE_BASE_URL || "https://routerbase.com/v1"
});

const result = await client.chat.completions.create({
  model: process.env.ROUTERBASE_MODEL || "your_default_model",
  messages: [{ role: "user", content: "Return OK." }]
});
```

## Curl Smoke Test

```bash
curl "$ROUTERBASE_BASE_URL/chat/completions" \
  -H "Authorization: Bearer $ROUTERBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "'"$ROUTERBASE_MODEL"'",
    "messages": [{"role": "user", "content": "Return OK."}]
  }'
```

## Output

- RouterBase client configuration wired through environment variables
- Model routing defaults documented in the project
- Test or smoke-check path for the integration
- Privacy check confirming that no real keys, user prompts, or provider response logs were committed

## Common Issues

| Issue | Likely Cause | Fix |
|---|---|---|
| 401 Unauthorized | Missing or invalid API key | Set `ROUTERBASE_API_KEY` in the runtime environment and do not commit it |
| Requests still hit the old provider | A wrapper or direct URL was missed | Search for provider URLs and centralize client creation |
| Model not found | The configured model is unavailable | Confirm the model ID in RouterBase and update `ROUTERBASE_MODEL` |
| CI fails on network calls | Live API call is running without credentials | Mock the AI client in CI and keep live checks manual |

## Resources

- [RouterBase](https://routerbase.com/) - product and documentation entry point
- [RouterBase agent skills](https://github.com/zenlee123/routerbase-agent-skills) - source repository
