# Adlicio

Customer-voice research for Claude Code. Scrape comments and reviews from
public discussion and review pages, search Reddit, YouTube and Blind, pull the
on-screen hooks from top-performing short-form video, find creators, find live
competitor ads, and build brand and voice-of-customer reports.

Website: <https://tryadlicio.com> · Setup guide: <https://tryadlicio.com/mcp>

## Installation

```bash
/plugin install adlicio
```

On first use, Claude Code connects to the hosted MCP server and the browser
opens an OAuth consent page. Sign in with an Adlicio account. There is no API
key to paste and nothing to configure.

## Components

### MCP server

One remote server, `adlicio`, at `https://mcp.tryadlicio.com/mcp` over
streamable HTTP. Authentication is OAuth 2.1 with dynamic client registration.

It exposes 27 tools. The main ones:

| Tool | Purpose |
| --- | --- |
| `scrape_url` | Extract comments or reviews from a supported URL |
| `search_reddit` | Find Reddit threads matching a keyword |
| `search_youtube` | Find YouTube videos matching a keyword |
| `search_blind` | Find teamblind.com posts matching a keyword |
| `research_topic` | Search Reddit and scrape the matching threads in one call |
| `find_scroll_stoppers` | Top-performing TikTok and Instagram videos with their on-screen hooks |
| `find_creators` | Rank TikTok and Instagram creators and potential affiliates for a niche |
| `find_competitor_ads` | Ads a brand is running right now, from the Meta Ad Library |
| `find_products` | Google Shopping listings with price, rating, and merchant |
| `list_history`, `get_history_item`, `search_history` | Read and search what the account already collected |
| `start_voc_report`, `get_voc_report` | Voice-of-customer reports from stored scrapes |
| `whoami` | Check the signed-in account, plan, and remaining research credits |

Supported scrape sources include Reddit, YouTube, Amazon, the Apple App Store,
Google Play, Steam, Trustpilot, Reviews.io, G2, Etsy, Walmart, Sephora, Ulta,
eBay, Better Business Bureau, AliExpress, TripAdvisor, Stack Exchange,
Discourse, phpBB, XenForo, vBulletin, Invision Community, Hacker News, Quora,
Product Hunt, Shopify product pages including stores on Yotpo or Loox, Disqus
blog comments, public Facebook posts, public LinkedIn posts, public Blind
posts, public Instagram posts and reels, TikTok videos, and Notion pages.

### Skills

| Skill | When it applies |
| --- | --- |
| `adlicio-mcp` | Any research task that should run through the remote MCP server. Documents every tool, its credit cost, the background-job polling rules, and the reporting contract for a research write-up. |
| `commentscraper` | The `commentscraper` npm CLI workflow, for shells and CI where the MCP server is not connected. |

Both skills trigger on customer-voice research, pain-point mining, review
analysis, competitor research, and requests to extract the comments from a
supported URL. Neither triggers on general web crawling or documentation
lookup.

## Usage examples

```text
What do people complain about in Reddit threads on standing desks?
```
Runs `research_topic`, then reports themes with permalinks.

```text
Pull the hooks from the best TikToks for cold plunge tubs.
```
Runs `find_scroll_stoppers` and returns each video's on-screen hook with its
engagement metrics.

```text
What ads is Ridge Wallet running right now?
```
Runs `find_competitor_ads` against the Meta Ad Library.

```text
Search everything we already collected for the phrase "too expensive".
```
Runs `search_history`, which costs no credits and scrapes nothing.

## Requirements

- An Adlicio account on the All Access plan. The Pro plan covers the Chrome
  extension only, so Pro and free accounts can connect and see the tool list
  but calls return a structured `upgrade_required` result. Sign up at
  <https://tryadlicio.com>.
- Network access to `https://mcp.tryadlicio.com`.
- Node.js 18 or newer, only if you also use the `commentscraper` CLI.

Most tools draw on a monthly pool of included research credits. Reading tools
such as `whoami`, `list_history`, `get_history_item` and `search_history` cost
no credits. The `adlicio-mcp` skill carries the full per-tool cost table.

## License

MIT. See [LICENSE](./LICENSE).

Upstream repository: <https://github.com/daniel-ddtech/commentscraper-cli>
