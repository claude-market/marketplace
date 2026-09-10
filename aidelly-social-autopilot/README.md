# Aidelly Claude Code Plugin

[![Aidelly/claude-plugin MCP server](https://glama.ai/mcp/servers/Aidelly/claude-plugin/badges/score.svg)](https://glama.ai/mcp/servers/Aidelly/claude-plugin)

Automate Aidelly social media management directly from Claude Code. Create, schedule, and manage posts across all connected platforms with AI-powered MCP tools.

## Features

- **Create & Schedule Posts** – Publish instantly or schedule for later across multiple platforms
- **Approval Workflows** – Require and manage post approvals before publishing
- **Analytics** – Pull engagement metrics and top-performing content
- **Multi-Platform Support** – Instagram, Facebook, LinkedIn, Twitter/X, TikTok, YouTube, Pinterest, Bluesky, Threads, Mastodon, Google Business
- **Media Upload** – Fetch and upload images/videos directly

## Installation

> **Sign-in is one click.** The Aidelly MCP server supports OAuth 2.1 with PKCE and dynamic client registration, so Claude walks you through an Aidelly login and consent screen automatically — no API key or workspace ID to copy. (An API-key header remains supported for scripted/headless use.)


### Install via Claude Code Plugin Marketplace

```bash
/plugin marketplace add Aidelly/claude-plugin
```

Then configure your API key (see [Setup](#setup) below).

### Manual Installation (Development)

Clone this repository and point Claude Code to the local plugin path:

```bash
git clone https://github.com/Aidelly/claude-plugin
cd claude-plugin
# Add to Claude Code plugin settings
```

> **Note:** Ensure `.mcp.json` is committed in your local clone. The Aidelly monorepo ignores `*.mcp.json` files, so the public `Aidelly/claude-plugin` repository explicitly commits it. If you see a missing `.mcp.json` after cloning, run `git check-ignore .mcp.json` — if no output, it's been properly committed.

## Setup

### 1. Generate an API Key

1. Log in to [Aidelly Dashboard](https://app.aidelly.ai)
2. Go to **Settings → API Keys**
3. Create a new API key (or use an existing one)
4. Copy the key

### 2. Configure Environment Variables

Set the following environment variables in your Claude Code environment:

```bash
export AIDELLY_API_KEY=your_api_key_here
export AIDELLY_WORKSPACE_ID=your_workspace_id  # Optional; required if managing multiple workspaces
```

**macOS/Linux (shell):**

```bash
# Add to ~/.zshrc, ~/.bashrc, or equivalent
echo 'export AIDELLY_API_KEY=sk_...' >> ~/.zshrc
source ~/.zshrc
```

**Windows (PowerShell):**

```powershell
[Environment]::SetEnvironmentVariable('AIDELLY_API_KEY', 'sk_...', 'User')
```

### 3. Verify Connection

In Claude Code, run:

```
Use the MCP server to list accounts or get workspace info.
```

The plugin should successfully connect and list your Aidelly workspace data.

## Usage

### Create a Post

```
Create a new post on Instagram with the text "Hello world!" and upload media.
```

### Schedule a Post

```
Schedule a post for tomorrow at 2 PM with approval required.
```

### Check Pending Approvals

```
List all posts waiting for approval and approve the first one.
```

### Pull Analytics

```
Get the top 10 posts from the last 30 days and their engagement metrics.
```

## Skill Documentation

Full endpoint reference and examples: [skills/aidelly-social/SKILL.md](./skills/aidelly-social/SKILL.md)

## Configuration

### .mcp.json

The plugin wires to Aidelly's MCP server via `.mcp.json`:

```json
{
  "mcpServers": {
    "aidelly": {
      "url": "https://app.aidelly.ai/api/mcp/public-api",
      "transportType": "http",
      "auth": {
        "type": "headers",
        "headers": {
          "Authorization": "Bearer ${AIDELLY_API_KEY}",
          "x-aidelly-workspace-id": "${AIDELLY_WORKSPACE_ID}"
        }
      }
    }
  }
}
```

### plugin.json

Metadata for Claude Code plugin marketplace:

```json
{
  "name": "aidelly",
  "description": "Aidelly social content automation for Claude Code",
  "author": "Aidelly",
  "version": "0.1.0"
}
```

## Troubleshooting

### "Unauthorized" Error

- Verify `AIDELLY_API_KEY` is set correctly
- Confirm the API key is active in Aidelly Dashboard
- Check that the workspace exists

### "Forbidden" Error

- Ensure your API key has access to the workspace
- If using `AIDELLY_WORKSPACE_ID`, verify it matches a workspace you have access to

### Rate Limit Exceeded

- The plugin enforces 120 tool calls per minute per API key
- Retry after a few seconds with exponential backoff

### Platform-Specific Issues

- **Instagram/TikTok deletion:** These platforms don't allow post deletion via API
- **LinkedIn org routing:** Double-check that the author target matches your account type (member vs. organization)
- **Text too long:** Verify text length against platform limits in the skill documentation

## Architecture

```
.claude-plugin/
  └─ plugin.json          # Plugin metadata
.mcp.json                 # MCP server configuration
skills/
  └─ aidelly-social/
     └─ SKILL.md          # Tool documentation & examples
```

## API Endpoints

The plugin connects to `https://app.aidelly.ai/api/mcp/public-api` (Aidelly's MCP HTTP endpoint).

**Authentication:** `Authorization: Bearer <API_KEY>` (required)

**Tools exposed by the server:**

- `aidelly_create_post` – Instant post publish
- `aidelly_create_scheduled_post` – Schedule a post
- `aidelly_list_pending_approvals` – Check pending approvals
- `aidelly_post_approvals_id_action` – Approve/reject posts
- `aidelly_get_analytics_summary` – Pull engagement metrics
- `aidelly_get_post` – Get post details
- `aidelly_upload_media` – Upload image/video
- [Full list of available tools](./skills/aidelly-social/SKILL.md)

## Publishing & Distribution

This repository is designed to be published to Claude Code plugin marketplaces. Follow the checklist below for each distribution channel.

### Distribution Channels

#### 1. Anthropic Claude Code Plugin Directory

**Status:** [Pending / In progress / Published]

**Submission checklist:**

- [ ] README.md complete with features, installation, setup
- [ ] .claude-plugin/plugin.json valid and descriptive
- [ ] .mcp.json correctly configured for production MCP endpoint
- [ ] Skills documentation comprehensive with examples
- [ ] All JSON files validate (no parse errors)
- [ ] Version bumped to match release (semver)
- [ ] LICENSE file included (if required)
- [ ] Documentation reviewed for accuracy

**How to submit:**

1. Contact Anthropic at plugins@anthropic.com with:
   - GitHub repository link
   - Brief description of plugin capabilities
   - API authentication requirements
2. Follow Anthropic's submission process
3. Monitor distribution portal for approval status

#### 2. Official MCP Registry (Smithery)

**Status:** [Pending / In progress / Published]

**Registry:** https://smithery.ai or https://registry.smithery.ai

**Submission checklist:**

- [ ] Repository public on GitHub
- [ ] .mcp.json follows MCP spec v1.0+
- [ ] Version in package.json matches .claude-plugin/plugin.json
- [ ] README includes authentication setup
- [ ] Endpoint URL is production-ready (https://)
- [ ] Rate limits documented
- [ ] Error handling documented
- [ ] Test credentials available for verification (optional)

**How to submit:**

1. Fork the MCP registry (https://github.com/smithery/smithery-registry)
2. Add entry in registries.json (or equivalent)
3. Include metadata: name, version, description, auth requirements, URL
4. Open pull request
5. Address review feedback

#### 3. Listed on

**Glama** – https://glama.ai/mcp/servers/Aidelly/claude-plugin

The badge at the top of this README reflects Glama's live quality score for
this server.

#### 4. Alternative MCP Registries

**mcp.so** – https://mcp.so
**PulseMCP** – https://pulsemcp.com

**Submission checklist (each):**

- [ ] Plugin discoverable via their search
- [ ] Correct metadata (name, description, author)
- [ ] Production MCP endpoint working
- [ ] Authentication method documented
- [ ] Contact/support information provided

**How to submit:**

- Each registry has its own submission process (check their websites)
- Generally requires GitHub repo + metadata + contact info

### Pre-Release Checklist

Before submitting to any marketplace:

```bash
# 1. Validate JSON files
jq . .claude-plugin/plugin.json
jq . .mcp.json

# 2. Verify MCP endpoint connectivity
curl -H "Authorization: Bearer $AIDELLY_API_KEY" \
  https://app.aidelly.ai/api/mcp/public-api \
  -X POST \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}' \
  -H "Content-Type: application/json"

# 3. Test API key setup
export AIDELLY_API_KEY=test_key
echo "API key set: $AIDELLY_API_KEY"

# 4. Review skill documentation
cat skills/aidelly-social/SKILL.md | wc -l  # Should be > 200 lines
```

### Release Notes

When bumping version in `.claude-plugin/plugin.json` and README:

```
## Version 0.1.0

**Initial release**
- Create, schedule, and publish posts across multiple platforms
- Approval workflow integration
- Analytics summary pull
- Media upload support
- 11 platforms supported
```

## Support

- **Issues:** https://github.com/Aidelly/claude-plugin/issues
- **Docs:** https://docs.aidelly.ai
- **Email:** support@aidelly.ai

## License

[License TBD – check Aidelly open-source policy]

## Maintainers

- Aidelly Team (@aidelly)

---

**Last updated:** 2026-07-13  
**Plugin version:** 0.1.0  
**MCP protocol version:** 2024-11-05+
