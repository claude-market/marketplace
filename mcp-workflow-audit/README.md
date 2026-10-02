# MCP Workflow Audit

A read-first Claude Code Skill for auditing MCP and AI-agent workflows before changing them.

It focuses on the operational problems that make automations fragile or risky: excessive permissions, unclear approval boundaries, duplicate writes, missing-data behavior, unbounded retries, partial failures, weak verification, and missing operator handoff.

## What it does

- inventories Claude/MCP workflow configuration
- maps consequential actions and permission boundaries
- reviews idempotency, retries, failure recovery, and verification
- checks representative failure paths where safe
- produces an evidence-first audit with bounded remediation recommendations

The Skill does not require external services and does not intentionally mutate the target workspace during the audit.

## Extended toolkit

The maintained source repository includes a dependency-free static scanner, workflow generator, tests, and synthetic appointment, trades-operations, and retail-pricing references:

https://github.com/OssaBellator/claude-mcp-workflow-audit

The examples are explicitly synthetic/open-source methodology rather than customer deployments.

## License

MIT
