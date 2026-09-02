---
name: seoagent-cli-setup
description: "Install or set up SEOAgent for Claude Code — persistent technical SEO audits, keyword strategy, content briefs, and articles under .seoagent/. Use when the user asks to install SEOAgent, add the SEOAgent skill, set up SEO in this repo, or wants npm / CLI instructions for SEOAgent."
---

# SEOAgent — install via npm (marketplace bootstrap)

This marketplace plugin does **not** embed the full SEOAgent protocols. Those are installed into the project when the user runs the **official CLI** from npm.

## What to tell the user

1. Open a terminal at the **repository root** (same directory as `package.json`).
2. Run:

```bash
npm install -g @seoagent-official/seoagent && seoagent init
```

3. **pnpm:** `pnpm add -g @seoagent-official/seoagent && seoagent init`
4. **Non-interactive / CI:** `npx @seoagent-official/seoagent init --yes --domain example.com`

`init` scans env files and `package.json`, asks for anything it cannot infer, then creates **`.seoagent/`** and copies the full skill to **`.claude/skills/seoagent/SKILL.md`** (or **`.agents/skills/seoagent/SKILL.md`** if `.agents` already exists).

## After install

The user should use the **project-local** SEOAgent skill (large `SKILL.md`) for audits, strategy, briefs, drafts, roadmap, and onboarding site context. Your job here is **onboarding only**: make sure they run the commands above and understand that **persistence lives in `.seoagent/`**.

## Docs

Package README: [npm `@seoagent-official/seoagent`](https://www.npmjs.com/package/@seoagent-official/seoagent) and [SEOAgent](https://seoagent.com).
