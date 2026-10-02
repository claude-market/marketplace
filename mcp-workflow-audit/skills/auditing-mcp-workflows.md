---
name: auditing-mcp-workflows
description: Audit an existing Claude Code, MCP, or AI-agent workspace for configuration, permissions, consequential actions, failure handling, verification, and operator handoff. Use when a workflow is fragile, risky, hard to maintain, or needs a read-first reliability review.
---

# Auditing MCP workflows

Perform a read-first operational audit. Do not modify the target workspace unless the user explicitly asks for fixes after reviewing findings.

## Procedure

1. Establish the target workspace and intended business outcome.
2. Inventory agent instructions, MCP configuration, Skills, hooks, scheduled automation, package metadata, and credential-boundary files.
3. Map consequential actions: external writes, messages, deployments, purchases, deletions, permission changes, and scheduled actions.
4. Review least privilege, credential storage, duplicate/obsolete configuration, bounded retries, idempotency, missing/conflicting-data behavior, and recovery.
5. Verify representative happy, missing-data, permission-denied, partial-failure, and recovery paths where safe.
6. Produce a report separating observed evidence, interpretation, recommended bounded fixes, and items requiring human review.

## Safety rules

- Never request or reproduce passwords, API keys, tokens, private keys, recovery phrases, or customer secrets.
- Do not treat documentation examples as evidence that a command actually runs.
- Do not execute destructive commands to test whether they are dangerous.
- Do not broaden permissions merely to make a workflow pass.
- Require explicit approval before consequential writes when approval boundaries are part of the workflow.
- Preserve existing successful side effects during partial-failure recovery; avoid duplicate writes.
- State when runtime behavior could not be reproduced.

## Report structure

1. Executive summary
2. Inventory
3. Findings with evidence and severity
4. Reliability/failure-path observations
5. Credential and permission boundaries
6. Recommended bounded fixes
7. Verification plan/results
8. Human review required
9. Operator handoff

For the optional deterministic scanner, workflow contracts, tests, and synthetic appointment/retail/trades references, use the public source repository: https://github.com/OssaBellator/claude-mcp-workflow-audit

The audit must remain useful without purchasing anything. Public examples are methodology evidence, not claims of customer deployments.
