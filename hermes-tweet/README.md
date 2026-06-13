# Hermes Tweet

Hermes Tweet is the native Hermes Agent plugin for X/Twitter automation through
Xquik. It brings X search, account reads, tweet posting, replies, likes,
retweets, follows, DMs, monitors, webhooks, draws, extraction jobs, media, and
trend reads into Hermes as structured tools.

This Claude Market entry provides a lightweight skill companion for the
published Hermes Agent plugin. Install the runtime plugin from the canonical
repository or PyPI package before using the skill guidance.

## Install

Recommended Hermes plugin install:

```bash
hermes plugins install Xquik-dev/hermes-tweet --enable
```

Or install the published Python package into the Hermes Python environment:

```bash
uv pip install --python ~/.hermes/hermes-agent/venv/bin/python hermes-tweet
hermes plugins enable hermes-tweet
```

Add Claude Market and install this companion entry:

```bash
/plugin marketplace add claude-market/marketplace
/plugin install hermes-tweet
```

## Configure

Create an API key in the Xquik dashboard, then set it where the Hermes runtime
executes:

```bash
export XQUIK_API_KEY="xq_..."
```

Action endpoints are disabled unless explicitly enabled:

```bash
export HERMES_TWEET_ENABLE_ACTIONS="false"
```

Keep `HERMES_TWEET_ENABLE_ACTIONS=false` for unattended sessions unless the
workflow includes an explicit approval step for posting, DMs, follows, monitor
changes, webhook changes, or media changes.

## Tools

| Tool | Purpose |
| --- | --- |
| `tweet_explore` | Search the bundled Xquik endpoint catalog. No API call. |
| `tweet_read` | Call catalog-listed read-only endpoints. |
| `tweet_action` | Call write-like or private endpoints. Disabled by default. |

Use `tweet_explore` first, then call `tweet_read` or `tweet_action` with a
concrete `/api/v1/...` path.

## Requirements

- Hermes Agent with plugin support.
- The `hermes-tweet` runtime plugin installed and enabled.
- `XQUIK_API_KEY` configured for read and action tools.
- `HERMES_TWEET_ENABLE_ACTIONS=true` only when the session intentionally allows
  account-changing actions.

## Links

- Repository: <https://github.com/Xquik-dev/hermes-tweet>
- PyPI: <https://pypi.org/project/hermes-tweet/>
- Documentation: <https://github.com/Xquik-dev/hermes-tweet#readme>
- License: MIT
