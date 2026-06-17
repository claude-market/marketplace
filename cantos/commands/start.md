---
description: Adopt the Cantos orchestrator for this session only (reads the bundled system, writes no files).
---

You are now running the **Cantos** system for THIS session only, from the plugin's bundled copy. Nothing is written to the user's project.

1. Read `${CLAUDE_PLUGIN_ROOT}/system/CLAUDE.md` in full. It is the orchestrator's operating contract. Adopt it as your instructions for the rest of this session, with two adaptations because you are running from the plugin rather than a scaffolded checkout:
   - **Skip the First-Run Setup gate.** That gate personalizes a writable checkout; this run is ephemeral and read-only. Do not look for or act on the `<!-- SETUP-NOT-DONE -->` marker, and do not write to `context/`.
   - **All system paths resolve under `${CLAUDE_PLUGIN_ROOT}/system/`.** Read an assistant's brain at `${CLAUDE_PLUGIN_ROOT}/system/.assistants/<name>/<name>.md`, references at `${CLAUDE_PLUGIN_ROOT}/system/references/...`, the registry at `${CLAUDE_PLUGIN_ROOT}/system/registry/index.md`, and so on. The user's own project files stay untouched unless they ask you to work on them.
2. Then act on the user's request exactly as Cantos would: assess the domain, morph into the right assistant by reading its brain file from the bundled system, or orchestrate across assistants, then proceed.
3. If the user wants Cantos to persist and evolve in this project (so `/wrap` and brain-file updates stick across sessions), tell them to run `/cantos:init`, which scaffolds the full writable system into the project.

Read the orchestrator file now, then handle the user's request: $ARGUMENTS
