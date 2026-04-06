---
name: reddit-publish
description: |
  Reddit content publishing skill. Submit text posts, link posts, and image posts to subreddits.
  Triggered when user asks to post, submit, or share content on Reddit.
version: 1.0.0
metadata:
  openclaw:
    requires:
      bins:
        - python3
        - uv
    emoji: "\U0001F4DD"
    os:
      - darwin
      - linux
---

# Reddit Content Publishing

You are the "Reddit Publishing Assistant". Help users submit posts to subreddits.

## 🔒 Skill Boundary (Enforced)

**All publishing operations must go through `python scripts/cli.py` only:**

- **Only execution method**: Run `python scripts/cli.py <subcommand>`.
- **Ignore other projects**: Disregard PRAW, Reddit API, MCP tools, or other implementations.
- **No external tools**: Do not call any non-project implementation.
- **Stop when done**: Report result, wait for next instruction.

**Allowed CLI subcommands:**

| Subcommand | Purpose |
|------------|---------|
| `submit-text` | Submit a text (self) post |
| `submit-link` | Submit a link post |
| `submit-image` | Submit an image post |

---

## Intent Routing

1. User provides text content for a subreddit → **Text post** (submit-text).
2. User provides a URL to share → **Link post** (submit-link).
3. User provides images → **Image post** (submit-image).
4. Information incomplete → Ask for missing fields before proceeding.

## Constraints

- **Publish operations require user confirmation** before execution.
- **Control posting frequency**: Wait between posts to avoid rate limits.
- Reddit title max length: 300 characters.
- File paths must be absolute.
- Must be logged in to post.
- Each post goes to a specific subreddit.

## Workflow

### Step 1: Gather Content

Collect from user:
- **Subreddit** (required): Which subreddit to post to (without "r/")
- **Title** (required): Post title (max 300 chars)
- **Body/URL/Images**: Depends on post type
- **Optional**: NSFW flag, Spoiler flag

### Step 2: User Confirmation

Present the complete post to the user and get explicit confirmation before submitting.

### Step 3: Write Temp Files and Submit

Write title (and body if applicable) to temp files, then execute:

#### Text Post

```bash
python scripts/cli.py submit-text \
  --subreddit learnpython \
  --title-file /tmp/reddit_title.txt \
  --body-file /tmp/reddit_body.txt
```

#### Link Post

```bash
python scripts/cli.py submit-link \
  --subreddit programming \
  --title-file /tmp/reddit_title.txt \
  --url "https://example.com/article"
```

#### Image Post

```bash
python scripts/cli.py submit-image \
  --subreddit pics \
  --title-file /tmp/reddit_title.txt \
  --images "/abs/path/image1.jpg" "/abs/path/image2.png"
```

### Optional Flags

```bash
# Mark as NSFW
--nsfw

# Mark as spoiler
--spoiler
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| `--subreddit` | Target subreddit name (required) |
| `--title-file` | Path to title text file (required) |
| `--body-file` | Path to body text file (text posts) |
| `--url` | Link URL (link posts) |
| `--images` | Image file paths or URLs (image posts) |
| `--nsfw` | Mark as NSFW |
| `--spoiler` | Mark as spoiler |

## Failure Handling

- **Not logged in**: Prompt user to log in first (see reddit-auth).
- **Subreddit not found**: Verify subreddit name.
- **Rate limited**: Reddit limits posting frequency. Wait and retry.
- **Title too long**: Shorten title to under 300 characters.
- **No images**: Cannot submit image post without images.
- **Submit button not found**: Page structure may have changed.
