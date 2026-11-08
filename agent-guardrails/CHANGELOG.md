# Changelog

## 0.2.2

Closes the ways an agent could talk or work its way around its own rails.

- Block messages no longer tell the agent how to lift a rule. They name the rule and the policy file for the human, and end with: "Agent: do not change the policy; take a safer approach or ask the user."
- The `guardrails:allow` inline escape for secret detection is now opt-in (`secrets_in_content.inline_allow_marker`, default `false`). The agent writes the line, so by default it could have exempted itself.
- Shell commands that name the policy or the audit log are refused (`echo > .claude/guardrails.json`, `sed -i ... guardrails.json`, `rm -rf .claude`), under `protected_paths`. Protecting these files from Edit/Write alone was hollow. `allow_paths` exempts a file for the shell too. Read the policy with the Read tool.
- `.claude/settings.json` and `.claude/settings.local.json` are protected by default, because an agent that can edit them can turn hooks off. Add them to `allow_paths` if you want the agent to manage settings.
- README gains a "What it is, and is not" section: a seat belt against mistakes and drift, not a cage for an adversarial agent.

## 0.2.1

- The audit log (`audit.path`) and the active policy files are now always protected from Edit/Write, even when a policy replaces the `protected_paths.paths` list. `allow_paths` can still exempt them explicitly.
- `scope_shell.blocked_commands` match on word boundaries: `ssh` blocks `ssh host` but no longer blocks `ssh-keygen` or `sshfs`.
- `/agent-guardrails:report` reads the log location from `audit.path` in the merged config instead of assuming the default path; `--log` still overrides.

## 0.2.0

- `secrets_in_content.patterns`: per-pattern `{name, regex, mode}` objects (`block` or `warn`); string patterns and built-ins keep the rule mode.
- `protected_branches` supports fnmatch globs such as `release/*`.
- Self-protection: `.claude/guardrails.json` and `.claude/guardrails.*.json` added to default `protected_paths` (and to the bundled policies).
- New `protected_paths.allow_paths_override_scope` (default `false`, behaviour unchanged): `scope.allowed_paths` can override protected globs.
- Protected-path block message now mentions `allow_paths` for permitting a single file.
- README: 30-second demo and what's new.

## 0.1.0

- Initial release: hooks for Bash and Edit/Write/MultiEdit, rules `destructive_shell`, `secrets_in_content`, `protected_paths` (with optional scope), `scope_shell`.
- JSONL audit log, `/agent-guardrails:report` and `/agent-guardrails:init` commands.
- Starter policies: strict-fintech, oss-maintainer, agency-client-work.
