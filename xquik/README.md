# Xquik

Xquik adds Claude Code planning and setup guidance for X data workflows through
the public REST contract, remote MCP server, SDKs, webhooks, and exports.

## Installation

```bash
/plugin marketplace add claude-market/marketplace
/plugin install xquik
```

## Components

- `x-twitter-scraper` skill: choose the right Xquik workflow for tweet search,
  profile data, followers, media downloads, monitors, webhooks, MCP setup, and
  exports.

## Requirements

- Xquik account for API-backed workflows.
- Public docs: https://docs.xquik.com
- Source repository: https://github.com/Xquik-dev/x-twitter-scraper

## Usage

Ask Claude Code for X/Twitter data workflow help, for example:

```text
Use Xquik to plan a tweet search export with webhook delivery.
```

The skill provides guidance from public documentation. Keep API keys in the
secure client that executes a workflow and never paste credentials into Claude
Code. Ask for explicit approval before writes, private reads, monitors, webhooks,
or metered exports.

## License

MIT. See [LICENSE](./LICENSE).

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.
