# Vynn — Self-Improving AI Workflows & Backtesting

MCP server plugin that gives Claude Code access to 21 tools for building, running, and optimizing AI workflows — plus quantitative backtesting with natural language strategies.

## What You Can Do

**Build & Run AI Workflows**
```
> Create a workflow that summarizes my daily RSS feeds and emails me the digest
> Run my "Market Brief" workflow with input "Focus on energy sector"
> Show me the last 5 runs of my research workflow
```

**Backtest Trading Strategies**
```
> Backtest "Buy when RSI(14) < 30, sell when RSI(14) > 70" on NVDA, AAPL, MSFT
> Run a parameter sweep: RSI period [10, 14, 21], threshold [25, 30, 35]
> Optimize portfolio weights for AAPL, MSFT, GOOGL, TSLA using max Sharpe
```

**Self-Improve**
```
> Optimize the prompt for step 2 of my workflow
> What model should I use for the research step?
> Schedule this workflow to run weekdays at 8am ET
> Show me analytics — success rate, latency, cost breakdown
```

## Installation

```bash
pip install vynn-mcp
```

## Setup

Get a free API key:
```bash
curl -X POST https://the-vynn.com/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com"}'
```

The plugin auto-configures the MCP server. Set your API key in the environment:
```bash
export VYNN_API_KEY="vynn_free_..."
```

## Tools (21)

| Category | Tools | Description |
|----------|-------|-------------|
| Workflows | 6 | Create, run, list, inspect workflows and runs |
| Self-Improving | 9 | Prompt optimization, model recommendations, scheduling, triggers, analytics |
| Backtesting | 3 | Single backtest, parameter sweep, portfolio optimization |
| Utilities | 3 | Templates, tool discovery |

## Links

- [Website](https://the-vynn.com)
- [PyPI](https://pypi.org/project/vynn-mcp/)
- [Repository](https://github.com/beee003/vynn-mcp)

## License

MIT
