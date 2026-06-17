# Cantos

**A personal-assistant operating system for Claude Code that builds itself for you in one conversation — and refines itself the more you use it.**

Cantos is an orchestrator that delegates every request to the right specialist assistant, each with its own brain file, tools, and workflows. Nothing is a black box. Every instruction is plain markdown you can read and edit. The first time you run it, Cantos interviews you and assembles a system tailored to your work, then routes each request to the assistant that owns that domain. And it is built to sharpen over time rather than decay: each session can fold what it learned back into its own instructions, with guardrails that keep those instructions short instead of letting rules pile up.

```
                          You
                           │
                           ▼
                ┌──────────────────────┐
                │   Cantos              │
                │   orchestrator +      │
                │   system architect    │
                └──────────┬────────────┘
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
        ┌───────┐     ┌───────┐     ┌───────┐
        │ folio │     │ lyren │     │ pylon │
        │ write │     │ admin │     │ build │
        └───┬───┘     └───┬───┘     └───┬───┘
            │             │             │
       sub-agents    sub-agents    sub-agents
     (research,      (week-        (website-
      reviewers,      planner,      builder,
      citations)      calendar)     ...)
```

Cantos delegates the work. It picks who should do it, hands off, and (for multi-domain requests) synthesizes the results. The only things Cantos does itself are system maintenance (it owns the health of the instruction files) and trivial one-off requests that fit no existing assistant.

---

## Quickstart

1. Install [Claude Code](https://claude.com/claude-code).
2. **Make your own copy.** This is a public template, and your configured copy will hold your personal context and your writing, so keep it in a repo you control and keep private. Two ways:
   - On GitHub, click **Use this template → Create a new repository**, set it to **Private**, then clone your new repo.
   - Or clone, then repoint the remote at your own private repo:
     ```bash
     git clone https://github.com/ne11nn/cantos.git
     cd cantos
     git remote set-url origin git@github.com:<your-username>/cantos-private.git
     claude
     ```
   Either way, work in your own private copy, not in the public source. Cantos never pushes to the upstream template.
3. Send any first message. "set me up" works, so does just "hi". On the first run, `context/me.md` still contains the marker `<!-- SETUP-NOT-DONE -->`, which tells Cantos to run the first-run interview (`workflows/cantos/first_run_setup.md`) before anything else.
4. Answer the interview. Cantos asks about your work, your priorities, your tools, and the communication style you want, then writes `context/me.md` and `context/work.md`, tunes the starter assistants (rename, remove, or add), and removes the marker so setup never runs again.
5. From then on, just talk to it. Cantos routes each request to the right assistant automatically.

The marker is the whole trigger. Delete it by hand and setup is considered done; restore the literal line `<!-- SETUP-NOT-DONE -->` to `context/me.md` to run the interview again.

---

## Privacy

This system stores your personal context (`context/me.md`, `context/work.md`) and, if you use folio's voice features, your own writing samples and the style analysis derived from them (`references/writing-voice/`).

- **Keep your configured copy private.** Use a private repo, as in the Quickstart. Do not push your personalized clone to a public location.
- **The assistants never push to the upstream public template.** Your work stays in the remote you control.
- **Raw writing samples and voice analysis are gitignored** so they are not committed even by accident. The style profiles built from them (`references/writing-voice/profile-*.md`) are tracked, so the `write-like-me` skill can load them across sessions and clones. Those profiles are abstracted style guides, but they do include a few short, anonymized cadence lines taken from your writing. If even that is too sensitive, delete the "Cadence samples" section from a profile before you commit it.
- **Setup never asks for secret values.** API keys and connector credentials live in your environment or in Claude Code's own settings, never pasted into a tracked file. See [Setup and dependencies](#setup-and-dependencies).

---

## Concepts

The vocabulary below is used throughout the repo. Learn these and every file reads cleanly.

| Term | What it means |
| --- | --- |
| **Orchestrator** | Cantos. The single entry point. It routes requests and owns the structural health of every instruction file. It delegates domain work to assistants; the only work it does itself is system maintenance and trivial one-offs that fit no assistant. |
| **Assistant** | A specialist with its own brain file, scope, tools, and workflows. The template ships with folio, lyren, and pylon. Each owns one domain end to end. |
| **Brain file** | The markdown file that defines an assistant: `.assistants/<name>/<name>.md`. Its identity, scope, gates, and operating rules. Kept under ~200 lines so the model actually follows it. |
| **Morph vs Orchestrate** | Two ways Cantos handles a request. **Morph** (default): for a single-domain request, Cantos becomes that assistant for the whole session. **Orchestrate**: for a request spanning several domains, Cantos stays in charge, dispatches multiple assistants in parallel, and synthesizes their outputs. |
| **Sub-agent** | A narrower process an assistant spawns when a task is too big for one context window or needs an isolated role. Lives under `.assistants/<owner>/sub-agents/`. Some are callable by name (symlinked into `.claude/agents/`); others are prose templates loaded by path. |
| **Workflow** | A reusable, multi-step procedure an assistant follows. Lives in `workflows/<owner>/`. Generalized standard operating procedures, not one-off scripts. |
| **Tool** | A deterministic script (Python, shell, Node) an assistant can run. Lives in `tools/<owner>/`. Code, not prompt instructions. |
| **Skill** | A self-contained, quick-invocable instruction set in `.claude/skills/`, triggered by `/name` or by keywords. Reusable cognitive patterns that can make tool calls. |
| **Reference** | On-demand knowledge in `references/`. Loaded only when an assistant needs it, so it does not bloat every session. |
| **Registry** | `registry/index.md`. The master index of every assistant, tool, workflow, sub-agent, skill, reference, and rule. Check it before building anything; register anything new in the same edit. |
| **Gate** | A numbered, non-negotiable checklist inside a brain file that must pass before an action proceeds (for example, "draft, never send, until confirmed"). Gates are what make each assistant sharp. They block, they do not suggest. |
| **Context files** | `context/me.md` and `context/work.md`. Who you are and your daily working context, loaded every session. The first-run interview fills these in. |

---

## What's included

Four starter assistants. Keep them, rename them, remove them, or add your own during setup.

| Assistant | Role | What it does |
| --- | --- | --- |
| **cantos** | Orchestrator + system architect | Routes every request to the right assistant; spawns parallel workstreams when a task spans domains; owns the health of all instruction files. Delegates domain work; does only system maintenance and trivial one-offs itself. |
| **folio** | Research + writing | Source finding, argument building, drafting, citations, AI-detection, and writing in *your* voice — it studies your own samples (parallel deep analysis across voice, vocabulary, sentence rhythm, and structure) and drafts to match while avoiding AI tells. The automated AI-detection pass (the `ai-detect` skill / `writing_review` workflow) is optional: it uploads your text to GPTZero and needs a GPTZero login, so it is opt-in, with a manual fallback that applies `references/signs-of-ai-writing.md` by hand. See [Setup and dependencies](#setup-and-dependencies). |
| **lyren** | Executive assistant | Email, calendar, tasks, and admin through MCP connectors you connect. Always drafts first; never sends, creates, or deletes without your explicit confirmation. |
| **pylon** | Engineer | Builds web apps, sites, games, and extensions; self-iterates against screenshots and tests; ships finished, deployed work. |

Bundled alongside the assistants:

- **Skills** (`.claude/skills/`): a library of invocable patterns covering UI/UX design and review, motion and animation, codebase architecture, research, AI-detection, writing in your own voice, session naming and wrap-up, and skill authoring itself.
- **Workflows** (`workflows/<owner>/`): standard operating procedures such as `create_assistant`, `audit_brain_files`, `first_run_setup`, `system_audit`, and per-assistant procedures for citations, source research, writing review, and website design.
- **Tools** (`tools/<owner>/`): deterministic scripts including a local preview server and screenshot helper for pylon, a citation generator for folio, and system-maintenance utilities for cantos.
- **References** (`references/`): on-demand docs on brain-file architecture, Claude Code foundations, documentation best practices, common library gotchas, UI anti-patterns, and the overall system architecture.

---

## Customizing

Everything is markdown. Edit prose, and the system reads the change next session.

- **Edit an assistant.** Open its brain file (`.assistants/<name>/<name>.md`) and change the text. Keep it under ~200 lines so the model stays adherent.
- **Add an assistant.** Tell Cantos "I need an assistant for X." It runs `workflows/cantos/create_assistant.md`, interviews you, writes the brain file and folder, updates the routing table in `CLAUDE.md`, and registers it in `registry/index.md`.
- **Rename or remove a starter assistant.** Do it during the first-run interview, or ask Cantos any time. Routing in `CLAUDE.md` and the registry are updated in the same pass.
- **Change communication style.** Edit `.claude/rules/communication-style.md` (tone, formatting, emoji and em-dash discipline). It loads automatically every session.
- **Register everything new.** Any new tool, workflow, sub-agent, skill, or reference gets a row in `registry/index.md` in the same edit. An unregistered artifact is one no assistant will find.

---

## It improves itself

Most assistant setups decay as instructions pile up. Cantos is built to do the opposite — it gets sharper the more you use it.

- **`/wrap` ends a session by updating the system.** It reviews what happened and folds genuine lessons into the right brain file, workflow, or rule, then commits. Nothing is padded; only real rules get recorded.
- **Every correction routes through a decision tree, not a pile of notes.** A three-question test (`references/brain-file-architecture.md`) sends each lesson to its proper home — existing prose, a gate, a workflow, or a reference — so brain files stay short and adherent instead of bloating.
- **The orchestrator owns its own structural health.** Cantos audits its instruction files for rot, migrates rules into prose, and prunes what is redundant. A clean system after a year has *fewer* loose rules than after a month.

The result learns your preferences and tightens its own guardrails over time, while staying entirely in plain, reviewable markdown.

---

## How it works under the hood

- **`CLAUDE.md` is loaded as context every session.** It holds the orchestrator's standing instructions: the first-run setup gate, the routing logic, and the conventions every assistant follows. Claude reads it and follows it. It is context, not a hard runtime, so the rules are written concrete and gated rather than vague.
- **Assistants are markdown brain files.** No code generates them. `.assistants/<name>/<name>.md` is the assistant. When Cantos morphs, it loads that file and adopts the identity for the session.
- **The registry is the index.** `registry/index.md` maps every assistant, tool, workflow, sub-agent, skill, and reference to its path. It is how the system finds and reuses what already exists instead of rebuilding it.
- **Rules and references load on their own terms.** Files in `.claude/rules/` load every session. References load on demand, only when an assistant needs them, which keeps each session lean.

```
CLAUDE.md                  orchestrator instructions, loaded every session
context/                   me.md + work.md, who you are and your daily context
.assistants/<name>/        brain file + sub-agents for each assistant
.claude/rules/             always-on conventions (style, auto-updates, sub-agents)
.claude/skills/            invocable patterns (/name or keyword triggered)
workflows/<owner>/         reusable multi-step procedures
tools/<owner>/             deterministic scripts
references/                on-demand knowledge
registry/index.md          the master index
decisions/log.md           append-only record of meaningful decisions
projects/                  per-project working folders (starts empty)
```

---

## Requirements

| Requirement | Needed for |
| --- | --- |
| [Claude Code](https://claude.com/claude-code) | Everything. This is the runtime. |
| MCP connectors (optional) | lyren's admin work. Connect Gmail, Google Calendar, Notion, Google Drive, or GitHub through Claude Code, and lyren works against them. Without them, lyren still drafts and plans; it just cannot reach your accounts. |
| API keys (optional) | A few tools that call external APIs (for example, image generation). Set them as environment variables only when you use the tool that needs them. |

No keys or connectors are required to run setup, draft with folio, or have pylon write code. The dependencies below are only needed when you actually use the tool or skill that calls them.

---

## Setup and dependencies

Everything runs on [Claude Code](https://claude.com/claude-code) alone. The bundled tools and skills pull in a few extra dependencies, but each is **optional and only needed when you run the specific tool that uses it**. Nothing here is required for setup or for everyday routing, drafting, and planning.

| Dependency | Install | Needed for |
| --- | --- | --- |
| Node.js (18+) | [nodejs.org](https://nodejs.org) | pylon's local preview server (`tools/pylon/serve.mjs`) and screenshot helper (`tools/pylon/screenshot.mjs`), plus Playwright. |
| Playwright + a browser | From the repo root: `npm install` then `npx playwright install chromium` | pylon's `screenshot.mjs` (visual self-iteration) and the browser-driven skills (`impeccable` live mode, `ai-detect`). `npm install` pulls Playwright in via the bundled `package.json`. The standalone `playwright-cli` skill expects a separate `playwright-cli` tool — see that skill's own Installation section. |
| Python deps for folio | `pip install -r tools/folio/requirements.txt` | `tools/folio/cite.py` (citation `.docx` generation) needs `python-docx`. |
| Python deps for cantos | `pip install -r tools/cantos/requirements.txt` | `tools/cantos/flux.py` (image generation) needs `requests` and `python-dotenv`. |
| git-filter-repo (and optionally the GitHub CLI) | `pip install git-filter-repo`; [GitHub CLI](https://cli.github.com) for `gh` | Only for pylon's `export_public_repo` workflow, which splits a subproject out of a monorepo into a clean standalone public repo. Not needed for normal use. |

### Optional external services

- **GPTZero (folio's AI-detection pass).** The `ai-detect` skill and the `writing_review` workflow can run an automated detection loop, but doing so **uploads your text to GPTZero**, a third-party site, and requires you to be logged in to a GPTZero account. This step is **opt-in**. If you skip it, folio still applies the same patterns manually from `references/signs-of-ai-writing.md` — the manual fallback needs no account and no upload.
- **Image generation (`tools/cantos/flux.py`).** Calls the NVIDIA NIM Flux endpoint and needs an API key in your environment. Only required if you invoke it.

API keys and credentials live in your environment or in Claude Code's own settings. Setup never asks you to paste a secret value into a tracked file.

---

## License

MIT. Use it, fork it, build your own on top of it. See [LICENSE](LICENSE). When you spin up your own private copy (see the Quickstart), point the clone remote at your own repo; the MIT license only asks that you keep the existing copyright notice.

The MIT license covers the Cantos system's own files: this orchestrator, the assistant brain files, workflows, tools, references, rules, and templates. It does **not** relicense the third-party skills vendored under `.claude/skills/`. Each of those keeps its own license (for example `impeccable`, Apache 2.0; `ux-heuristics`, MIT), and skills with no declared license are bundled as-is with unverified provenance and are **not** covered by this repo's MIT grant. All of it is cataloged in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) — verify a skill's origin before redistributing it or building something commercial on it, or delete it from `.claude/skills/` before you ship.

Built on [Claude Code](https://claude.com/claude-code) by Anthropic. Cantos is an architecture pattern, not a fork of Claude Code.
