# xvary-stock-research

Claude Code skill for **institutional-style equity snapshots** from public data: SEC EDGAR fundamentals and filing metadata plus lightweight market context. Use the documented flows **`/analyze`**, **`/score`**, and **`/compare`** (see `skills/xvary-stock-research/SKILL.md`).

## Requirements

- Python 3.10+ on the machine where Claude Code runs the bundled `tools/edgar.py` and `tools/market.py`.
- Network access to SEC EDGAR and the public quote endpoints used in `tools/market.py` (no API keys required for the default paths).

## Canonical source

This directory is vendored into Claude Market for discovery. The **canonical public repo** (issue tracker, full history) is:

**https://github.com/xvary-research/claude-code-stock-analysis-skill**

Please open issues and PRs against that repository unless the change is specific to this marketplace listing.

## Install (Claude Code)

After adding the Claude Market marketplace:

```text
/plugin install xvary-stock-research
```

Or install directly from GitHub:

```text
/plugin marketplace add xvary-research/claude-code-stock-analysis-skill
/plugin install xvary-stock-research
```

(Uses the plugin layout under `plugins/xvary-stock-research` in that repo.)

## License

MIT — see [LICENSE](./LICENSE).
