# RouterBase Model Gateway

Claude Code skill plugin for integrating applications with [routerbase](https://routerbase.com/) as an OpenAI-compatible model gateway.

## Overview

This plugin helps Claude Code update existing AI provider integrations so applications can route requests through RouterBase. It focuses on practical migration work:

- Finding existing SDK clients, model names, and provider-specific base URLs
- Moving API credentials into environment variables
- Updating OpenAI-compatible client configuration
- Documenting model routing and fallback choices
- Verifying changes without committing secrets or private prompts

## Installation

```bash
/plugin install ./routerbase-model-gateway
```

From Claude Market after publication:

```bash
/plugin marketplace add claude-market/marketplace
/plugin install routerbase-model-gateway
```

## Skill Included

- `routerbase-model-gateway` - Configure RouterBase as an OpenAI-compatible gateway for text, image, audio, video, and embedding workflows.

## Safe Usage

Store real RouterBase credentials only in local environment variables or deployment secret stores. The skill examples use placeholder values such as `ROUTERBASE_API_KEY=your_routerbase_api_key`.

## Resources

- [RouterBase](https://routerbase.com/) - product and documentation entry point
- [RouterBase agent skills](https://github.com/zenlee123/routerbase-agent-skills) - source skill collection
