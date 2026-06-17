# Registry

Master lookup table for all assistants, tools, workflows, skills, sub-agents, and references in the Cantos system.

Check here before building anything new. If something viable already exists, load and reuse it.

---

## Assistants

| Name | Brain path | Status | Owned projects |
| --- | --- | --- | --- |
| cantos | `.assistants/cantos/cantos.md` | Active | — |
| folio | `.assistants/folio/folio.md` | Active | — |
| lyren | `.assistants/lyren/lyren.md` | Active | — |
| pylon | `.assistants/pylon/pylon.md` | Active | — |

---

## Tools

| Name | Path | Owning assistant | Accessible by |
| --- | --- | --- | --- |
| block_dangerous_git.py | `tools/cantos/block_dangerous_git.py` | cantos | all |
| brain_update_hook.py | `tools/cantos/brain_update_hook.py` | cantos | cantos |
| file_usage_audit.py | `tools/cantos/file_usage_audit.py` | cantos | all |
| test_file_usage_audit.py | `tools/cantos/test_file_usage_audit.py` | cantos | cantos |
| flux.py | `tools/cantos/flux.py` | cantos | all |
| cite.py (install deps from `tools/folio/requirements.txt`) | `tools/folio/cite.py` | folio | folio |
| serve.mjs | `tools/pylon/serve.mjs` | pylon | all |
| screenshot.mjs | `tools/pylon/screenshot.mjs` | pylon | all |

---

## Workflows

| Name | Path | Owning assistant | Accessible by |
| --- | --- | --- | --- |
| first_run_setup | `workflows/cantos/first_run_setup.md` | cantos | cantos |
| create_assistant | `workflows/cantos/create_assistant.md` | cantos | cantos |
| create_sub_agent | `workflows/cantos/create_sub_agent.md` | cantos | all |
| system_audit | `workflows/cantos/system_audit.md` | cantos | all |
| audit_brain_files | `workflows/cantos/audit_brain_files.md` | cantos | cantos |
| archive_project | `workflows/cantos/archive_project.md` | cantos | all |
| mla_citation_generator | `workflows/folio/mla_citation_generator.md` | folio | folio |
| writing_review | `workflows/folio/writing_review.md` | folio | folio |
| source_research | `workflows/folio/source_research.md` | folio | folio |
| analyze_writing_voice | `workflows/folio/analyze_writing_voice.md` | folio | folio |
| consolidate_worktrees | `workflows/pylon/consolidate_worktrees.md` | pylon | all |
| design_website | `workflows/pylon/design_website.md` | pylon | all |
| export_public_repo | `workflows/pylon/export_public_repo.md` | pylon | all |
| weekly_briefing | `workflows/lyren/weekly_briefing.md` | lyren | lyren |

---

## Skills

| Name | Path | Owning assistant | Accessible by | Consult when |
| --- | --- | --- | --- | --- |
| skill-builder | `.claude/skills/skill-builder/SKILL.md` | cantos | all | Creating, optimizing, or auditing a skill |
| design-sub-agent | `.claude/skills/design-sub-agent/SKILL.md` | cantos | all | Planning, building, or auditing a sub-agent file |
| wrap | `.claude/skills/wrap/SKILL.md` | cantos | all | Ending a session — "/wrap", "wrap up", "update files" |
| name-session | `.claude/skills/name-session/SKILL.md` | shared | all | Naming the current session from the active assistant and topics |
| generate-daily-schedule | `.claude/skills/generate-daily-schedule/SKILL.md` | shared | all | Turning a day's commitments, tasks, and free windows into a 15-minute schedule |
| playwright-cli | `.claude/skills/playwright-cli/SKILL.md` | shared | all | Automating a browser or interacting with a live/JS-rendered web page |
| market-research | `.claude/skills/market-research/SKILL.md` | shared | all | Researching a market, competitors, or audience; validating a business idea |
| grill-with-docs | `.claude/skills/grill-with-docs/SKILL.md` | shared | all | Stress-testing a plan against the project's domain language and documented decisions; sharpening terminology and updating glossary/ADRs inline |
| ai-detect | `.claude/skills/ai-detect/SKILL.md` | folio | all | Scanning a draft through GPTZero and auto-remediating flagged sentences |
| write-like-me | `.claude/skills/write-like-me/SKILL.md` | folio | all | Drafting or rewriting text in the user's own voice; humanizing AI-sounding writing |
| improve-codebase-architecture | `.claude/skills/improve-codebase-architecture/SKILL.md` | pylon | all | Improving architecture, finding refactoring opportunities, consolidating tightly-coupled modules, or making a codebase more testable and AI-navigable |
| nodejs-expert | `.claude/skills/nodejs-expert/SKILL.md` | pylon | all | Writing or debugging Node.js — async pitfalls, Express/NestJS patterns |
| full-output-enforcement | `.claude/skills/full-output-enforcement/SKILL.md` | pylon | all | Any task needing complete, unabridged output with no placeholder truncation |
| scroll-video | `.claude/skills/scroll-video/SKILL.md` | pylon | all | Building an Apple-style scroll-driven video / canvas-frame website |
| motion-animations | `.claude/skills/motion-animations/SKILL.md` | pylon | all | Building scroll effects, entrance reveals, parallax, or any animated UI |
| ui-ux-pro-max | `.claude/skills/ui-ux-pro-max/SKILL.md` | pylon | all | Planning, building, or reviewing UI/UX — styles, palettes, fonts, components, stacks |
| ui-refactor | `.claude/skills/ui-refactor/SKILL.md` | pylon | all | Tactical UI fixes — "make this look better", layout, color/font, design system |
| ux-heuristics | `.claude/skills/ux-heuristics/SKILL.md` | pylon | all | Usability audit, heuristic evaluation, form/navigation problems, Nielsen heuristics |
| impeccable | `.claude/skills/impeccable/SKILL.md` | pylon | all | Designing, redesigning, critiquing, or polishing any frontend interface |
| emil-design-eng | `.claude/skills/emil-design-eng/SKILL.md` | pylon | all | UI polish, component/animation decisions, the invisible details that make software feel great |
| design-taste-frontend | `.claude/skills/design-taste-frontend/SKILL.md` | pylon | all | Architecting interfaces with metric-based rules and strict component architecture |
| redesign-existing-projects | `.claude/skills/redesign-existing-projects/SKILL.md` | pylon | all | Upgrading an existing website/app — auditing and replacing generic AI patterns |
| high-end-visual-design | `.claude/skills/high-end-visual-design/SKILL.md` | pylon | all | Making a site feel expensive — agency-grade fonts, spacing, shadows, cards |
| minimalist-ui | `.claude/skills/minimalist-ui/SKILL.md` | pylon | all | Building clean editorial UI — warm monochrome, flat bento grids, no gradients/heavy shadows |
| gpt-taste | `.claude/skills/gpt-taste/SKILL.md` | pylon | all | Building bold editorial layouts with GSAP ScrollTriggers and randomized variance |

---

## Sub-agents

> **Name** for a `Symlinked = Y` agent is its callable dispatch name (the Task-tool `subagent_type`) — it matches the `.claude/agents/` symlink, the frontmatter `name`, and the source-file stem. `Symlinked = N` agents have no callable name; they are prose templates spawned by reading their Path into a Task brief.

| Name | Path | Owning assistant | Accessible by | Symlinked |
| --- | --- | --- | --- | --- |
| browser-agent | `.assistants/cantos/sub-agents/browser-agent.md` | cantos | all | Y |
| memory_gatherer | `.assistants/cantos/sub-agents/memory_gatherer.md` | cantos | cantos | N |
| system-audit-gatherer | `.assistants/cantos/sub-agents/system-audit-gatherer.md` | cantos | cantos | Y |
| system-audit-reasoner | `.assistants/cantos/sub-agents/system-audit-reasoner.md` | cantos | cantos | Y |
| ai-pattern-analyzer | `.assistants/folio/sub-agents/ai-pattern-analyzer.md` | folio | folio | Y |
| citation-reviewer | `.assistants/folio/sub-agents/citation-reviewer.md` | folio | folio | Y |
| writing-researcher | `.assistants/folio/sub-agents/writing-researcher.md` | folio | folio | Y |
| writing-reviewer | `.assistants/folio/sub-agents/writing-reviewer.md` | folio | folio | Y |
| writing-executor | `.assistants/folio/sub-agents/writing-executor.md` | folio | folio | Y |
| writing-style-analyzer | `.assistants/folio/sub-agents/writing-style-analyzer.md` | folio | folio | Y |
| calendar-blocker | `.assistants/lyren/sub-agents/calendar-blocker.md` | lyren | all | Y |
| week-planner | `.assistants/lyren/sub-agents/week-planner.md` | lyren | lyren | Y |
| website-builder | `.assistants/pylon/sub-agents/website-builder.md` | pylon | pylon | N |

---

## References

On-demand knowledge. Most references don't auto-load — assistants must know to consult them. Use the "Consult when" column as the trigger. The "Load mode" column distinguishes files that auto-import from CLAUDE.md or brain files (always in context) from files that load only when invoked.

| Name | Path | Consult when | Load mode | Primary user |
| --- | --- | --- | --- | --- |
| claude-code-foundations | `references/claude-code-foundations.md` | Building or auditing brain files, skills, sub-agents, hooks, settings, or rules — need authoritative Anthropic patterns | @-imported by cantos | cantos |
| brain-file-architecture | `references/brain-file-architecture.md` | Routing a new lesson (run the three-question test); auditing Auto-updates sections; deciding prose vs gate vs gotchas | @-imported by cantos (also referenced by `.claude/rules/auto-updates.md`) | all |
| system-architecture | `references/system-architecture.md` | Onboarding to the Cantos system or explaining how the pieces fit together | @-imported by every brain file | all |
| wat-framework | `references/wat-framework.md` | Building a new workflow, assistant, or tool — separation of concerns | @-imported by cantos, pylon, folio (not lyren) | all |
| doc-best-practices | `references/doc-best-practices.md` | Writing any new instruction file (brain, skill, workflow, sub-agent, template) | @-imported by every brain file | all |
| gotchas | `references/gotchas.md` | Before working with Tailwind v4, Vercel, smplr, Tone.js, React event delegation, or any library that has bitten the system before | on-demand | pylon, all |
| signs-of-ai-writing | `references/signs-of-ai-writing.md` | Running an AI-detection pass or humanizing flagged sentences | on-demand | folio |
| writing-voice | `references/writing-voice/` | Drafting or humanizing in the user's voice — the synthesized per-register style profiles, samples, and analysis | on-demand | folio |
| ui-anti-slop | `references/ui-anti-slop.md` | Any UI build, polish, or redesign — the canonical anti-slop ruleset (typography, color, layout, motion, states, content, icons, code quality, accessibility) | on-demand | pylon, all |
| ui-skill-routing | `references/ui-skill-routing.md` | Starting any UI task and deciding which UI skill(s) to invoke — task-type to skill decision table | on-demand | all |
| project-memory | `references/project-memory.md` | Maintaining a project's Active Issues; running /wrap's distill/prune step; deciding what persists across sessions vs migrates to Technical notes/gotchas | on-demand (any assistant on a project; /wrap; consolidate_worktrees) | all |

---

## Context

User-specific facts. Auto-imported via `CLAUDE.md`. Both files ship as placeholder templates that the first-run setup interview fills in.

| Name | Path | Consult when | Load mode |
| --- | --- | --- | --- |
| me | `context/me.md` | Identity, priorities, roles, timezone; also carries the `<!-- SETUP-NOT-DONE -->` first-run marker until setup completes | @-imported by CLAUDE.md |
| work | `context/work.md` | Daily schedule, tools, task schema, MCP servers connected | @-imported by CLAUDE.md |

---

## Rules

`.claude/rules/` files auto-load at session start (per Anthropic's docs — rules without a `paths:` field load unconditionally). Do NOT @-import them from brain files.

| Name | Path | Governs |
| --- | --- | --- |
| auto-updates | `.claude/rules/auto-updates.md` | What belongs in a brain file's Auto-updates section; the three-question routing test |
| communication-style | `.claude/rules/communication-style.md` | Tone, formatting, em-dash and emoji discipline |
| sub-agents | `.claude/rules/sub-agents.md` | Where sub-agents live and how they're refined |

---

*Populated as tools, workflows, and sub-agents are built. Update this file whenever a new item is added or an existing item changes path or ownership.*
