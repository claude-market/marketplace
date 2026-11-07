# Changelog

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
