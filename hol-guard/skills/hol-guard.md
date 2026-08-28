---
name: hol-guard
description: Use when installing, configuring, verifying, troubleshooting, or reviewing HOL Guard protection for Claude Code, Guard approvals and receipts, or plugin and skill package scanning.
allowed-tools: Bash,Read,Glob,Grep
model: inherit
version: 0.1.0
license: Apache-2.0
---

# HOL Guard

Operate the real HOL Guard CLI for Claude Code security. HOL Guard is an external local runtime; this skill supplies the workflow, while Guard-owned commands install and enforce Claude Code harness protection.

## Safety rules

- Never read `.env` files.
- Never bypass Guard approvals.
- Do not manually edit Claude Code hook/config files when `hol-guard` owns the mutation.
- Do not claim a workspace is protected until Guard status or doctor output proves it.
- Treat `hol-guard command test ... --json` as side-effect-free command inspection only, not as a substitute for full Guard policy and approval enforcement.

## Install and verify

```bash
pipx install hol-guard
hol-guard status
hol-guard detect --json
```

If `pipx` is unavailable, explain that isolated CLI installation is preferred instead of silently changing the user's Python environment.

## Protect Claude Code

```bash
hol-guard bootstrap
hol-guard install claude-code
hol-guard run claude-code --dry-run
hol-guard run claude-code
hol-guard doctor claude-code --json
```

Claude Code is a first-class HOL Guard target. Prefer the canonical `claude-code` harness name in documented commands.

## Review blocked or approval-gated work

```bash
hol-guard approvals
hol-guard approvals open <request-id>
hol-guard receipts
hol-guard diff claude-code
```

Pass the pending approval request ID to `hol-guard approvals open` so the CLI opens the specific queued request.

For terminal-only resolution:

```bash
hol-guard approvals approve <request-id>
hol-guard approvals deny <request-id>
```

Only approve after reading the risk reason and understanding the requested scope.

## Gather evidence

```bash
hol-guard receipts
hol-guard inventory
hol-guard abom --format json
hol-guard events
hol-guard explain <artifact-id>
```

Cloud sync is optional and user-directed:

```bash
hol-guard connect
hol-guard connect status
hol-guard sync
```

## Scan plugins, skills, MCP packages, or agent workspaces

`plugin-scanner` is a separate distribution:

```bash
pipx install plugin-scanner
plugin-scanner lint .
plugin-scanner verify .
```

Scan the package or repository root that contains the relevant plugin, skill, MCP, or harness metadata.

## Debug

```bash
hol-guard doctor
hol-guard doctor claude-code --json
hol-guard detect --json
hol-guard settings show
plugin-scanner verify . --json
```

Report the command that ran, what Guard found, what remains blocked or risky, and the exact next action. Never report protection, approval, or release readiness without command output proving it.
