# Changelog

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
