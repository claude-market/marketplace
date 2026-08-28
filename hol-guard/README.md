# HOL Guard

HOL Guard is a local security layer for AI coding agents. This Claude Market plugin adds an Agent Skill that installs and operates the real `hol-guard` CLI for Claude Code protection, approval review, receipts/evidence, and package verification.

## Install

```bash
/plugin marketplace add claude-market/marketplace
/plugin install hol-guard
pipx install hol-guard
hol-guard status
```

For package and skill scanning, install the separate scanner distribution:

```bash
pipx install plugin-scanner
```

## Protect Claude Code

```bash
hol-guard bootstrap
hol-guard install claude-code
hol-guard run claude-code --dry-run
hol-guard run claude-code
hol-guard doctor claude-code --json
```

HOL Guard owns the harness configuration and approval boundary. Do not bypass Guard approvals or claim a workspace is protected without command output proving it.

## Review approvals and evidence

```bash
hol-guard approvals
hol-guard receipts
hol-guard inventory
hol-guard events
```

## Verify a plugin or skill package

```bash
plugin-scanner lint .
plugin-scanner verify .
```

`hol-guard command test ... --json` is side-effect-free command inspection. It is not a replacement for the Guard-owned Claude Code harness integration or full policy/approval enforcement.

## Requirements

- Python 3.10+
- `pipx` recommended for isolated CLI installation
- Claude Code for this marketplace plugin

## Source

- https://github.com/hashgraph-online/hol-guard
- https://github.com/hashgraph-online/hol-guard-plugin
- https://hol.org/guard

## License

Apache-2.0. See `LICENSE`.
