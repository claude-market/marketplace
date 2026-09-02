# SEOAgent

The persistent AI SEO agent for Claude Code. Other SEO tools write the prompt — SEOAgent runs it, on your own model, in your own repo.

This plugin is a **bootstrap**: it adds one skill that walks Claude through installing the real `seoagent` CLI from npm. The CLI then scaffolds `.seoagent/` in your project and installs the full, versioned SEOAgent skill — audits, keyword strategy, content briefs, and articles — directly into your repo.

## What you get after install

- **Technical SEO audits** — crawl errors, indexing issues, schema markup, Core Web Vitals
- **Keyword strategy** — clustering, competitor research, topic gap analysis
- **Content briefs and articles** — written by your own coding agent, into your own repo
- **`.seoagent/`** — a plain-markdown workspace, committed to your repo

## Install

Ask Claude: *"Install SEOAgent in this repo"* — this skill responds with the exact commands, or run them yourself:

```bash
npm install -g @seoagent-official/seoagent && seoagent init
```

`init` scans your `package.json` and env files to infer your domain, then creates `.seoagent/` and installs the skill at `.claude/skills/seoagent/SKILL.md`.

## Links

- [npm package](https://www.npmjs.com/package/@seoagent-official/seoagent)
- [SEOAgent.com](https://seoagent.com)
- [Source](https://github.com/Baxter-Inc/seoagent-npm)

## Publisher

Baxter Inc — contact: support@seoagent.com

## License

MIT
