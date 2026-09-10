---
name: aidelly-social-autopilot
description: Create, schedule, and manage social posts via Aidelly's public MCP server — post creation, scheduling, approval workflows, and analytics.
---

# Aidelly Social Autopilot — Claude Code Skill

Automate social content workflows in Aidelly via Claude Code. This skill documents the Aidelly MCP server endpoints for creating/scheduling posts, checking approval status, and pulling analytics summaries.

## Authentication

Set up environment variables before using:

```bash
export AIDELLY_API_KEY=your_api_key_here
export AIDELLY_WORKSPACE_ID=your_workspace_id  # optional; required if managing multiple workspaces
```

The MCP server (`https://app.aidelly.ai/api/mcp/public-api`) will use these headers:

- `Authorization: Bearer ${AIDELLY_API_KEY}`
- `x-aidelly-workspace-id: ${AIDELLY_WORKSPACE_ID}` (if set)

## Core Tools

### 1. Create a Post (Instant Publish)

**Tool:** `aidelly_create_post`

Create and publish a post immediately across one or more social platforms.

**Parameters:**

- `text` (string, required): Post content (max 63,206 chars; platform-specific limits enforced)
- `content.media` (array, optional): List of media objects
  - `media.id` (string): Media ID from `aidelly_upload_media` or `aidelly_create_media_upload_url`
  - `media.type` (string): 'image' or 'video'
- `accounts` (array, required): List of account IDs or connection IDs to post to
- `scheduled_for` (string, optional): ISO 8601 timestamp for scheduled publish

**Example:**

```json
{
  "text": "New blog post is live!",
  "content": {
    "media": [{ "id": "media_abc123", "type": "image" }]
  },
  "accounts": ["account_123", "account_456"]
}
```

**Returns:** Post object with `id`, `status`, `accounts`, `created_at`

---

### 2. Schedule a Post

**Tool:** `aidelly_create_scheduled_post`

Schedule a post for future publish (with optional approval workflow).

**Parameters:**

- `text` (string, required): Post content
- `content.media` (array, optional): Media objects (same as create_post)
- `accounts` (array, required): Account IDs to post to
- `scheduled_for` (string, required): ISO 8601 timestamp for publish
- `platform_specific` (object, optional): Platform-specific settings
  - `platform_specific.comments` (array): First-comment blocks (LinkedIn, Facebook, Twitter support)
  - `platform_specific.linkedInAuthorTarget` (object): LinkedIn org/member routing
- `approval_required` (boolean, optional): Require approval before publishing

**Returns:** Scheduled post object with `id`, `status: 'scheduled'`, `scheduled_for`, `accounts`

---

### 3. Check Pending Approvals

**Tool:** `aidelly_list_pending_approvals`

List posts awaiting approval in the workspace.

**Parameters:**

- `limit` (integer, optional): Max results (default 25)
- `offset` (integer, optional): Pagination offset (default 0)

**Returns:** Array of approval objects with:

- `id`, `post_id`, `workspace_id`, `status` ('pending', 'approved', 'rejected')
- `created_at`, `created_by_id` (if available)

---

### 4. Approve or Reject a Post

**Tool:** `aidelly_post_approvals_id_action`

Approve or reject a pending post.

**Parameters:**

- `id` (string, required): Approval ID
- `action` (string, required): 'approve' or 'reject'
- `reason` (string, optional): Reason for rejection

**Returns:** Updated approval object with new status

---

### 5. Get Analytics Summary

**Tool:** `aidelly_get_analytics_summary`

Pull engagement metrics for published posts (last 30 days by default).

**Parameters:**

- `accounts` (array, optional): Filter by account IDs
- `platforms` (array, optional): Filter by platforms (e.g., ['instagram', 'twitter'])
- `start_date` (string, optional): ISO 8601 start date
- `end_date` (string, optional): ISO 8601 end date

**Returns:** Analytics object with:

- `total_posts`: Count of posts in period
- `total_engagements`: Likes + comments + shares + reposts
- `total_reach`: Impressions
- `top_posts`: Array of highest-performing posts with metrics
- `platform_breakdown`: Metrics per platform

---

### 6. Get Post Details

**Tool:** `aidelly_get_post`

Retrieve a single post's details, status, and platform-specific data.

**Parameters:**

- `id` (string, required): Post ID

**Returns:** Post object with:

- `id`, `text`, `accounts`, `status` ('published', 'scheduled', 'failed')
- `created_at`, `published_at`
- `provider_post_ids`: Map of platform → remote post ID
- `analytics`: (if published) engagement metrics

---

### 7. Upload Media

**Tool:** `aidelly_upload_media`

Upload an image or video for inclusion in a post.

**Parameters:**

- `source_url` (string): Public HTTPS URL of image/video to fetch
- `alt_text` (string, optional): Accessibility description

**Returns:** Media object with:

- `id`: Media ID (use in `content.media`)
- `url`: Hosted media URL
- `type`: 'image' or 'video'
- `size`, `width`, `height`

---

## Common Workflows

### Workflow: Create and Schedule with Approval

```
1. aidelly_upload_media (fetch image from URL)
2. aidelly_create_scheduled_post (schedule for tomorrow, approval_required: true)
3. aidelly_list_pending_approvals (check approval status)
4. aidelly_post_approvals_id_action (approve when ready)
```

### Workflow: Multi-Platform Campaign Analytics

```
1. aidelly_get_analytics_summary (last 7 days, all platforms)
2. For each top post: aidelly_get_post (detailed metrics)
3. Aggregate platform-specific performance
```

---

## Platform-Specific Constraints

### Text Length Limits

- **Twitter/X:** 280 characters (URLs, emoji counted differently)
- **LinkedIn:** 3,000 characters
- **Facebook:** 63,206 characters
- **Instagram:** 2,200 characters
- **TikTok:** 2,200 characters
- **Threads:** 500 characters
- **Bluesky:** 300 characters

### Media Support

- **Instagram:** Images, Reels (video), carousel (1–10 items)
- **TikTok:** Video (primary), photo carousel (up to 35)
- **YouTube:** Video only
- **Pinterest:** Images only (board selection required)
- **LinkedIn:** Images, documents (PDF), carousel, video
- **Facebook:** Images, video, carousel
- **Twitter/X:** Images (4 max), video (1), GIF
- **Threads:** Images, video
- **Bluesky:** Images, video
- **Mastodon:** Images, video
- **Google Business:** Images (local posts)

### Unsupported Operations

- **Instagram, TikTok:** Cannot delete posts after publishing (API limitations)
- **YouTube:** Cannot delete via Aidelly (manual deletion only)

---

## Error Handling

All MCP calls follow standard error responses:

```json
{
  "content": [{ "type": "text", "text": "<error message>" }],
  "isError": true
}
```

Common errors:

- **401 Unauthorized:** Missing or invalid `AIDELLY_API_KEY`
- **403 Forbidden:** Insufficient permissions for workspace/account
- **422 Unprocessable Entity:** Invalid payload (e.g., text too long for platform)
- **429 Too Many Requests:** Rate limit exceeded (retry with backoff)
- **500 Internal Server Error:** Server error (transient; safe to retry)

---

## Rate Limits

- **Tool calls:** 120 per minute per API key
- **Batch requests:** 20 maximum per batch

---

## Related Resources

- **Public API Docs:** https://docs.aidelly.ai/api/v1
- **Plugin Repository:** https://github.com/Aidelly/claude-plugin
- **Aidelly Dashboard:** https://app.aidelly.ai

---

## Version

- **Skill version:** 0.1.0
- **MCP protocol:** 2024-11-05+
- **Last updated:** 2026-07-13
