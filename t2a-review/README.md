# t2a-review-template

> An AI code reviewer that thinks like your team — built from your team's actual PR comment history.

Forked from the system described in [We Accidentally Built an AI Code Reviewer That Thinks Like Us](https://honeybook.engineering/we-accidentally-built-an-ai-code-reviewer-that-thinks-like-us-411f7c083629).

## What it does

`/t2a-review:review` runs a multi-agent pre-PR review against your diff. It applies:

- Your team's reviewer profiles (mined from real PR comment history)
- Your codebase's conventions (`checklist.md`)
- A general engineering quality pass
- An Opus skeptic that filters false positives

Cost: ~$3 per review on a typical 400-500 line diff (Haiku + Sonnet + Opus).

## How it works

The pipeline has a cheap deterministic phase before any model runs, then three reviewer agents in parallel, then a cleanup pass:

1. **Classify, then trim (no inference cost).** Plain code looks at the changed file paths and classifies the PR (`frontend`, `backend`, `mixed`, etc.). Each reviewer profile is stripped down to just the sections relevant to that classification before any agent reads it — a `.tsx`-only PR never pays to load someone's Ruby/Rails rules. This runs in milliseconds and shrinks what the models have to read.

2. **Three reviewer agents, in parallel, each on a different model tier:**
   - **Team conventions** (Sonnet) — reads the bundled, trimmed reviewer profiles + `checklist.md`. This is the synthesis-heavy pass, so it gets the stronger model: Haiku reading eleven profiles in one shot returns a handful of findings, Sonnet on the same input returns several times more.
   - **General engineering review** (Haiku) — universal correctness/security/quality checks, independent of team convention. Narrow and prescriptive enough that Haiku handles it well.
   - **Generic PR review** (Haiku) — a holistic pass over the diff: logic, tests, performance, security. Same reasoning — bounded scope, cheaper model is enough.

3. **Deduplicate (no model call).** Findings from the three agents are merged in plain code: same file + nearby line + same category collapses to one finding, keeping the highest severity and the union of which reviewers flagged it.

4. **Opus skeptic pass.** One Opus agent re-reads the diff against the merged findings and drops anything with a hallucinated line number, insufficient evidence, or a pattern applied too broadly. It's cheaper to over-produce findings with fast models and prune with a strong one than to make every fast-model finding perfect up front.

5. **Escalate if the signal is thin.** If the team-conventions pass returns unusually few findings, or the PR touches an area historically owned by a specific reviewer, a few extra targeted agents re-run against just the relevant profile(s) before the skeptic pass runs again on the combined set.

**Why tiered models matter here:** going from a single cheap pass to full multi-agent review is what makes findings attributable and catches patterns a single call merges or drops — but running every agent on the frontier model doesn't pay for itself. An earlier, untiered version of this pipeline ran thirteen Opus agents per review (~$20 on a 469-line diff). Tiering by task — Haiku for breadth, Sonnet for synthesis, Opus only as the skeptic — cut that to ~$3 per review while surfacing *more* issues, not fewer, because the deterministic pre-phase and dedup step free up the model budget for the checks that actually need judgment.

## Prerequisites

- [Claude Code](https://claude.ai/code)
- `gh` CLI authenticated to your GitHub org

## Setup

Three ways to get this into your project — pick one.

### Option A: Install from Claude Market

If you already have this marketplace added:

```
/plugin install t2a-review@claude-market
```

### Option B: Install from the standalone repo

```
/plugin marketplace add ayaniv/t2a-review-template
/plugin install t2a-review@t2a-review-template
```

First run of either command copies `config.md`, `checklist.md`, and `team-members/_template.md` into your current project root (nothing is written outside it). Continue at step 2 below.

### Option C: Clone and install locally (or a shared team repo)

```bash
git clone https://github.com/ayaniv/t2a-review-template
/plugin install ./t2a-review-template
```

Use this if you want the commands and templates version-controlled alongside your project from the start, or want to edit the commands themselves. The `/plugin install` step is required — Claude Code only auto-discovers commands from `.claude/commands/`, and this repo's commands live in the plugin-standard `commands/` directory instead, so a plain clone alone won't register the slash commands.

### 2. Configure your repos

Edit `config.md` and set your GitHub repos — the ones your team reviews PRs in.

### 3. Generate reviewer profiles

For each team member who reviews PRs, run:

```
/t2a-review:add-team-member <github-username>
```

This mines their last 3 years of PR review comments, synthesizes recurring patterns, and writes a profile to `team-members/<username>.md`. Takes ~5-10 minutes for prolific reviewers.

Or write profiles manually — see `team-members/_template.md` for the format.

### 4. Update checklist.md

Unlike the reviewer profiles, `checklist.md` isn't mined — it's meant to be written and maintained by hand. Replace the placeholder checklist with your team's actual conventions — framework preferences, naming rules, test requirements, etc. Treat it as a living document your team edits directly, not something the tool regenerates for you.

### 5. Run it

```
/t2a-review:review
```

Run it on your local diff before pushing a PR for review. Pass a PR URL to review an existing PR:

```
/t2a-review:review https://github.com/your-org/your-repo/pull/123
```

## File structure

```
.claude-plugin/
  plugin.json                      # plugin manifest
  marketplace.json                 # lets this repo self-install as a marketplace
commands/
  review.md                        # main review skill (/t2a-review:review)
  add-team-member.md               # profile generator skill (/t2a-review:add-team-member)
team-members/
  _template.md                     # format reference
  <username>.md                    # one file per reviewer
checklist.md                       # your team's base conventions
config.md                          # repo configuration
```

## Adding a new team member

```
/t2a-review:add-team-member <github-username>
```

The skill fetches all PRs they reviewed in the last 3 years, extracts patterns, shows you a draft, and writes the file on confirmation.

## Updating a profile

Open `team-members/<username>.md` and edit it directly. Each profile is one file — no coordination needed with the rest of the team.

## License

MIT
