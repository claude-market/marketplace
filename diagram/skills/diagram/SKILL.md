---
name: diagram
description: Generate architecture diagrams, flowcharts, sequence diagrams, and system maps from actual codebase analysis. Use this skill whenever the user asks to "draw a diagram", "create a flowchart", "map the architecture", "visualize the system", "show me how X works as a diagram", "create an architecture chart", "generate a sequence diagram", "map the data flow", "show me the database schema", "what calls what", or wants any visual representation of how their code, system, or feature works. Also trigger when the user says "update the diagram", "the diagram is outdated", "how does this work" (when a visual would help), or "explain the architecture". This skill analyzes real code paths first, then generates accurate Mermaid (.mmd) files — not guesswork.
---

# Diagram

Generate accurate diagrams by analyzing real code, then producing Mermaid `.mmd` files.

Two-agent pipeline:

1. **code-explorer** (`../../agents/code-explorer.md`) — analyzes the codebase, traces execution paths, maps architecture
2. **diagram-builder** (`../../agents/diagram-builder.md`) — reads the correct syntax reference, converts analysis into Mermaid with color-coded actors

The orchestrator (this skill) decides what to analyze, which diagram type to use, and coordinates the agents.

## When to Create Diagrams

Proactively suggest diagrams when:

- Starting a new project or feature — diagram the architecture before coding
- Explaining a complex system — a diagram communicates faster than paragraphs
- Debugging a multi-service flow — trace the path visually to find where it breaks
- Documenting an existing codebase — onboarding is faster with diagrams
- Planning a refactor — map what exists before changing it
- Reviewing a PR that touches many files — show the data flow
- After completing a major feature — capture the architecture while it's fresh

If the user doesn't ask for a diagram but the context would benefit from one, suggest it.

## Best Practices

- **Start simple, add detail incrementally** — high-level flow first, then error paths and edge cases
- **One diagram per concept** — split large systems into multiple focused diagrams
- **Keep it readable** — more than 20 nodes is too complex; break it up
- **Use comments** — `%%` comments explain why something is structured a certain way
- **Store alongside code** — save `.mmd` files in `docs/` for version control
- **Update, don't regenerate** — when code changes, edit the existing `.mmd`

## Common Pitfalls

- **Breaking characters** — avoid `{}` in node labels (use `( )` or `[" "]`). Special characters need quotes.
- **The word "end"** — reserved keyword. If a node starts with "end", use quotes: `["Endpoint"]`
- **Overcomplexity** — more than 20 nodes is unreadable. Split into sub-diagrams.
- **Missing relationships** — every node should connect to at least one other
- **Wrong diagram type** — flowcharts for processes, sequenceDiagram for temporal interactions, erDiagram for data
- **Outdated syntax** — newer types (kanban, architecture, block, radar) have different syntax. Always read the reference file.

## Configuration and Theming

Configure with frontmatter at the top of the `.mmd` file:

```
%%{ init: { 'theme': 'dark', 'themeVariables': { 'fontSize': '14px' } } }%%
```

**Themes:** `default`, `forest`, `dark`, `neutral`, `base`
**Looks:** `'look': 'classic'` (default) or `'look': 'handDrawn'` (sketch style)
**Layouts:** `'flowchart': { 'defaultRenderer': 'dagre' }` (default) or `'elk'` (complex diagrams)

Default: dark theme, 14px font. Override if user prefers different.

---

## The Pipeline

### Step 1: Decide what to diagram

Based on the user's request, determine:

- **What feature/system** to diagram
- **What diagram type** fits best (see Diagram Type Selection below)
- **Code analysis needed?** Yes for code-derived diagrams (flowchart, sequence, ER, state, architecture, C4, class). No for user-provided data (pie, gantt, timeline, mindmap, kanban).

### Step 2: Analyze (code-derived diagrams only)

Launch code-explorer agents using the Agent tool with `subagent_type: "feature-dev:code-explorer"`. Give focused prompts based on diagram type:

**Flowcharts / sequence diagrams** — launch 2 agents in parallel:

- "Trace the execution path for [feature]. Find entry points, follow call chains through handlers, mutations, external API calls. Report function names, file paths with line numbers, and what each step does."
- "Find all decision points and error paths in [feature]. Where does the flow branch? What conditions determine the path?"

**Architecture / C4 diagrams** — launch 2 agents in parallel:

- "Map all entry points: HTTP routes, WebSocket handlers, cron jobs, webhooks. For each, trace what services and databases they touch."
- "Map all external integrations: APIs called, webhooks received, OAuth flows, third-party services."

**ER / class diagrams** — launch 1 agent:

- "Map the database schema: all tables, fields, relationships, indexes. Identify which modules read/write which tables."

**State diagrams** — launch 1 agent:

- "Find all status/state fields in [feature]. What are the possible values? What transitions exist? What triggers each transition?"

**Updating an existing diagram** — read the `.mmd` file first, then launch 1 agent:

- "The current diagram shows [summarize]. Check if code still matches. Report ONLY what changed."

**For non-code diagrams** (pie, gantt, mindmap, kanban, timeline):
Skip this step. Ask the user for the data/content, then go directly to Step 3.

### Step 3: Build the diagram

Read `../../agents/diagram-builder.md` for the full rules, then follow them:

1. **Read the reference file first** — find the correct file from `references/` for the chosen diagram type. Read the FULL file including examples. Do not write syntax from memory.
2. **Apply color coding** — for flowcharts, add classDef blocks for agent (blue), backend (purple), database (dark blue), external (green), human (red), decision (orange)
3. **Label every node** with WHO (actor in caps) and WHAT (specific action with API path/table name)
4. **Save to `docs/`** with descriptive name (e.g., `docs/flow-bounty-lifecycle.mmd`, `docs/erd-database-schema.mmd`)
5. **Add theme config** at the top: `%%{ init: { 'theme': 'dark', 'themeVariables': { 'fontSize': '14px' } } }%%`

### Step 4: Preview

1. **Cursor** — user previews `.mmd` with Mermaid Chart extension (default, just save the file)
2. **Browser** — build HTML with `<script type="module">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'</script>`, write to `/tmp/diagram-preview.html`, run `open`
3. **mcp-mermaid** — render to PNG/SVG via `mcp__mcp-mermaid__generate_mermaid_diagram`

## Diagram Type Selection

| What you're showing   | Mermaid type         | Reference file                        | Needs code analysis? |
| --------------------- | -------------------- | ------------------------------------- | -------------------- |
| Feature step-by-step  | `flowchart TD`       | `references/flowcharts.md`            | Yes                  |
| Service communication | `sequenceDiagram`    | `references/sequence-diagrams.md`     | Yes                  |
| System components     | `flowchart LR`       | `references/architecture-diagrams.md` | Yes                  |
| Object lifecycle      | `stateDiagram-v2`    | `references/state-diagrams.md`        | Yes                  |
| Type relationships    | `classDiagram`       | `references/class-diagrams.md`        | Yes                  |
| Database schema       | `erDiagram`          | `references/erd-diagrams.md`          | Yes                  |
| Architecture layers   | `C4Context`          | `references/c4-diagrams.md`           | Yes                  |
| Task board            | `kanban`             | `references/kanban.md`                | No                   |
| Project timeline      | `gantt`              | `references/gantt.md`                 | No                   |
| Data proportions      | `pie`                | `references/pie.md`                   | No                   |
| Concept map           | `mindmap`            | `references/mindmap.md`               | No                   |
| Git branches          | `gitGraph`           | `references/gitgraph.md`              | No                   |
| Historical events     | `timeline`           | `references/timeline.md`              | No                   |
| Priority matrix       | `quadrantChart`      | `references/quadrant-chart.md`        | No                   |
| Data charts           | `xychart-beta`       | `references/xy-chart.md`              | No                   |
| Flow volumes          | `sankey-beta`        | `references/sankey.md`                | No                   |
| Component blocks      | `block-beta`         | `references/block.md`                 | No                   |
| Network packets       | `packet-beta`        | `references/packet.md`                | No                   |
| User experience       | `journey`            | `references/user-journey.md`          | No                   |
| Requirements          | `requirementDiagram` | `references/requirement-diagram.md`   | No                   |
| Comparison radar      | `radar-beta`         | `references/radar.md`                 | No                   |
| Set overlaps          | `venn`               | `references/venn.md`                  | No                   |
| Hierarchical data     | `treemap`            | `references/treemap.md`               | No                   |
| Tree structure        | `treeView`           | `references/tree-view.md`             | No                   |
| Cause-effect          | `ishikawa`           | `references/ishikawa.md`              | No                   |
| Strategy map          | `wardley`            | `references/wardley.md`               | No                   |
| Alt. sequence         | `zenuml`             | `references/zenuml.md`                | Yes                  |

> **Source:** Reference files from [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid/tree/develop/packages/mermaid/src/docs/syntax). Code-explorer agent from [anthropics/claude-code](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev).
