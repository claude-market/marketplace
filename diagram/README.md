# Diagram Plugin

Generate accurate Mermaid diagrams from codebase analysis.

## How it works

Two-agent pipeline:

1. **code-explorer** — analyzes the codebase: traces execution paths, maps architecture, documents dependencies
2. **diagram-builder** — converts analysis results into correct Mermaid `.mmd` files with color-coded actors

The orchestrator (`SKILL.md`) decides what to analyze and which diagram type to use.

## Supported diagram types (27)

**Code-analysis diagrams** (agent traces code first):
flowchart, sequenceDiagram, stateDiagram, classDiagram, erDiagram, architecture, C4

**User-provided diagrams** (no code analysis needed):
gantt, pie, mindmap, timeline, kanban, gitgraph, quadrantChart, xyChart, sankey, radar, block, packet, userJourney, requirementDiagram, ishikawa, zenuml, venn, wardley, treemap, treeView

## Usage

Say "diagram the auth flow" or "create an architecture diagram" — the skill triggers automatically.

## Preview

1. **Cursor** — Mermaid Chart extension renders `.mmd` live
2. **Browser** — generates HTML with Mermaid CDN
3. **mcp-mermaid** — renders to PNG/SVG

## Structure

```
diagram/
├── .claude-plugin/
│   └── plugin.json             # Plugin manifest
├── agents/
│   ├── code-explorer.md        # Analyzes code (from Anthropic feature-dev)
│   ├── code-architect.md       # Maps architecture (from Anthropic feature-dev)
│   ├── code-reviewer.md        # Reviews code (from Anthropic feature-dev)
│   └── diagram-builder.md      # Builds .mmd from analysis
├── commands/
│   └── feature-dev-orchestrator.md  # Reference orchestration pattern
└── skills/
    └── diagram/
        ├── SKILL.md            # Orchestrator skill
        └── references/         # 27 official Mermaid syntax docs
```

## Credits

- Code analysis agents: [anthropics/claude-code/plugins/feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev)
- Mermaid syntax: [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid/tree/develop/packages/mermaid/src/docs/syntax)
- Advanced features: [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit/tree/main/skills/mermaid-diagrams)
