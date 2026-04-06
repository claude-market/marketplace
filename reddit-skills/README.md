# reddit-skills

Reddit automation skills for AI agents — browse, search, comment, vote, and publish using your real browser via a Chrome extension bridge.

## Installation

```bash
/plugin install reddit-skills
```

Or clone from GitHub:

```bash
git clone https://github.com/1146345502/reddit-skills.git
cd reddit-skills && uv sync
```

## Skills

### reddit-auth
Check Reddit login status and get the current username.

### reddit-explore
Browse subreddit feeds, search posts, view full post details with comments, and explore user profiles.

### reddit-interact
Comment on posts, reply to comments, upvote, downvote, and save posts.

### reddit-publish
Submit text posts, link posts, and image posts to any subreddit.

### reddit-compound
Compound operations combining explore + interact + publish for multi-step workflows.

## Requirements

- Python 3.11+
- Chrome browser with the included extension loaded
- `uv` package manager

## How It Works

A Chrome extension communicates with a local Python bridge server via WebSockets. The AI agent invokes Python CLI commands that send instructions to the extension, which executes actions in the real browser. No API keys needed.

## License

MIT
