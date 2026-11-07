# agent-guardrails

agent-guardrails is a Claude Code plugin that adds a safety-and-audit layer for teams adopting coding agents. Through Claude Code hooks it blocks (or warns about) destructive shell commands, secrets written into files, edits to protected paths and commands your team has banned, and it records every tool call to a local JSONL audit log that you can summarise with a report command. It uses only the Python 3 standard library and is MIT licensed.

## 30-second demo

The agent tries two things it should not. Claude Code shows each one-line reason to the agent, which then adjusts:

```
> Bash: rm -rf ~
[agent-guardrails] destructive_shell: blocked - rm -rf on root, home or working directory. To allow: edit .claude/guardrails.json (add a regex to rules.destructive_shell.allow_patterns, or set rules.destructive_shell.mode to "warn").

> Write src/config.py  (content: AWS_KEY = "AKIA...")
[agent-guardrails] secrets_in_content: blocked - content looks like a secret (aws-access-key) in 'src/config.py'; value not shown. To allow: edit .claude/guardrails.json (append '# guardrails:allow' to the line, or add the path to rules.secrets_in_content.ignore_paths).
```

Afterwards, `/agent-guardrails:report` summarises the session (excerpt):

```
# agent-guardrails audit report

- Records: 4 across 1 session(s)
- Blocked tool calls: 2

## Blocks by rule

| Rule | Blocks |
|---|---|
| destructive_shell | 1 |
| secrets_in_content | 1 |

## Most recent blocks

- 2026-11-07T07:13:59Z `destructive_shell`: rm -rf ~
- 2026-11-07T07:13:59Z `secrets_in_content`: src/config.py (33 chars)
```

### What's new in 0.2.1

- The audit log and the active policy files are always protected from Edit/Write, whatever your `paths` list says (`allow_paths` can still exempt them).
- `scope_shell` entries match whole words: `ssh` no longer matches `ssh-keygen`.
- The report command follows `audit.path`, so a relocated log is found without `--log`.

### What's new in 0.2.0

- `secrets_in_content.patterns`: per-pattern objects `{name, regex, mode}` with `block` or `warn` mode (built-in patterns keep the rule mode).
- `protected_branches` accepts globs such as `release/*`.
- Self-protection: `.claude/guardrails.json` and `.claude/guardrails.*.json` are protected from Edit/Write by default.
- `rules.protected_paths.allow_paths_override_scope` (default `false`) lets `scope.allowed_paths` override protected globs.
- Protected-path blocks now tell you to use `allow_paths` to permit a single file.

## 60-second install

Local, from a clone:

```bash
claude --plugin-dir ./agent-guardrails
```

From a marketplace, once published:

```
/plugin marketplace add RichFloForge/agent-guardrails
/plugin install agent-guardrails@agent-guardrails-marketplace
```

Then, in your project, optionally create a config:

```
/agent-guardrails:init
```

Requires `python3` on the PATH. Defaults work with no config.

## What it checks

| Rule | Applies to | What it does |
|---|---|---|
| `destructive_shell` | Bash | Blocks `rm -rf` of `/`, `~`, `.`, `*`; force-push or deletion of protected branches; `git reset --hard`; `git clean -fd`; `git branch -D` of protected branches; `DROP TABLE/DATABASE`; `truncate`; `mkfs`; `dd if=`; `chmod -R 777`; `curl/wget ... \| sh`; fork bomb. |
| `secrets_in_content` | Edit, Write, MultiEdit | Blocks new content containing AWS keys, private key headers, GitHub tokens, Slack tokens, Stripe live keys, or `api_key/secret/password/token = "<12+ chars>"`. Values are never printed or logged. |
| `protected_paths` | Edit, Write, MultiEdit | Blocks `.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa*`, `.git/**`, `secrets/`, the plugin's own config (`.claude/guardrails.json`, `.claude/guardrails.*.json`) and your additions. Optional `scope` restricts edits to `allowed_paths`. |
| `scope_shell` | Bash | Off by default. Blocks commands containing listed substrings (`npm publish`, `terraform apply`, ...). |
| `audit` | all tools, Stop | Appends JSON lines to `.claude/guardrails-audit.jsonl`. |

## Configuration reference

Config is read from the first of these that exists: `$CLAUDE_PROJECT_DIR/.claude/guardrails.json`, `./.claude/guardrails.json`, then the hook payload's `cwd`. It is **merged over** `config/default.json` (objects merge key by key; lists replace the default list), so you only write what you change. A commented reference is in `config/guardrails.example.jsonc` (written next to your config by `/agent-guardrails:init`).

| Key | Default | Meaning |
|---|---|---|
| `fail_closed` | `false` | If hook input is unreadable or the engine hits an internal error, block PreToolUse calls (`true`) or allow and log (`false`). |
| `protected_branches` | `main, master, production` | Used by the git rules in `destructive_shell`. Exact names or fnmatch globs (`release/*`, `hotfix-*`). |
| `rules.<rule>.enabled` | see above | Turn a rule on or off. |
| `rules.<rule>.mode` | `block` | `block` denies the call; `warn` allows it, prints a warning, and logs `decision: warn`. |
| `rules.destructive_shell.allow_patterns` | `[]` | Regexes; a command matching any is exempt from the whole rule. |
| `rules.destructive_shell.extra_patterns` | `[]` | Extra regexes to treat as destructive. |
| `rules.secrets_in_content.ignore_paths` | `*.md, *.example, *.sample, test*` | Globs exempt from scanning. |
| `rules.secrets_in_content.extra_patterns` | `[]` | Extra secret regexes (use the rule's mode). |
| `rules.secrets_in_content.patterns` | `[]` | Extra patterns as strings or objects `{ "name", "regex", "mode": "block"\|"warn" }`; an object's `mode` overrides the rule mode for that pattern only. |
| `rules.protected_paths.paths` | see default.json | Protected globs, including `.claude/guardrails.json` and `.claude/guardrails.*.json` (self-protection). Lists replace the default, so keep those two entries if you set your own `paths` (the bundled policies do). |
| `rules.protected_paths.allow_paths` | `.env.example, ...` | Exceptions to `paths`; also exempts the file from `scope`. Use it to permit a single file. |
| `rules.protected_paths.allow_paths_override_scope` | `false` | When `true`, a file matching an enabled `scope.allowed_paths` is exempt from the protected `paths` globs (scope wins over protection). Default behaviour: protection always wins, and `scope` only adds a restriction. |
| `rules.protected_paths.scope.enabled` / `.allowed_paths` | `false` / `[]` | When enabled, only files matching `allowed_paths` may be edited. |
| `rules.scope_shell.blocked_commands` | `npm publish, terraform apply, kubectl delete` | Case-insensitive substrings; rule is off until `enabled: true`. |
| `audit.enabled` / `audit.path` | `true` / `.claude/guardrails-audit.jsonl` | Log location (relative to the project dir). |

Glob notes: a pattern without `/` matches any path component (`.env` matches `app/.env`); with `/` it is matched against the whole project-relative path; `**` crosses directories.

Per-pattern secret modes, for example warn on NHS-style numbers but still block keys:

```json
{ "rules": { "secrets_in_content": { "patterns": [
  { "name": "nhs-number", "regex": "\\b\\d{3} \\d{3} \\d{4}\\b", "mode": "warn" } ] } } }
```

Self-protection: the agent cannot edit `.claude/guardrails.json` by default, so it cannot silently loosen its own policy; you edit it yourself. To allow it deliberately, add `".claude/guardrails.json"` to `rules.protected_paths.allow_paths` (this change must be made by you outside the agent, or temporarily), or remove the entries from `paths`.

Per-line secret escape: add `guardrails:allow` to the line (for example `# guardrails:allow`).

## Starter policies

Copy one with `/agent-guardrails:init --policy <name>` (or `python3 scripts/init_config.py --policy <name>`).

| Policy | Intent |
|---|---|
| `strict-fintech` | `fail_closed: true`, more protected branches, edits limited to `src/`, `tests/`, `docs/`; migrations, CI workflows and infra protected; many commands banned (publish, deploy, DB clients). |
| `oss-maintainer` | Fail open; protects `main`/`master` and LICENSE; bans publishing/release commands. |
| `agency-client-work` | Protects client deployment config and vendored directories; `scope_shell` in **warn** mode for `git push`, `ssh`, `scp`, `rsync`, `terraform apply`. |

These are starting points, not compliance guarantees. Review and adapt them.

## How blocks appear

A blocked call returns exit code 2, a one-line reason on stderr, and a JSON deny decision on stdout, so it works across hook versions. Claude sees the reason and can adjust. Example:

```
[agent-guardrails] destructive_shell: blocked - git reset --hard (discards uncommitted work). To allow: edit .claude/guardrails.json (add a regex to rules.destructive_shell.allow_patterns, or set rules.destructive_shell.mode to "warn").
```

## Audit log and report

Each line of `.claude/guardrails-audit.jsonl` has `ts`, `session_id`, `event` (`pre-bash`, `pre-edit`, `post`, `stop`, `warning`), `tool_name`, a redacted `summary`, `decision` (`allow`, `block`, `warn`) and `rule`; plus `command` (redacted, 200 chars), `file` and `reason` where relevant. File contents are never logged. Add the log to `.gitignore` unless you want it versioned.

```
/agent-guardrails:report            # Markdown summary
python3 scripts/report.py --json    # machine output; also --session ID, --log PATH, --top N
```

The report shows time range, events, tool counts, blocks by rule, recent blocks, files touched and top commands.

## FAQ

**Fail open or closed?** Default is open: if the hook gets garbage input it allows the call and logs a warning, so a bug never stops your work. Set `fail_closed: true` for stricter environments; then unreadable input or an internal error blocks PreToolUse calls (audit-only hooks never block).

**Performance?** Each hook starts one short Python process, typically tens of milliseconds, with a 10 second timeout. The PostToolUse audit hook runs for every tool call.

**Limitations.** Hooks only see tool calls Claude Code makes; they do not cover commands a script runs internally, other processes, or what happens outside the session. This is not a sandbox. Pattern matching can be bypassed by obfuscation (variables, encoding, `bash -c` with built strings, symlinks, indirect scripts). Pair it with proper sandboxing, least-privilege credentials and Claude Code's own permission settings. `git push --force` with no explicit branch is blocked because the target cannot be known.

**Can I allow one command?** Add a regex to `allow_patterns`, or append `guardrails:allow` for a secret false positive.

## Compatibility

Written against the Claude Code hooks documentation (code.claude.com/docs/en/hooks) checked while building: plugin `hooks/hooks.json` with `matcher` groups, `${CLAUDE_PLUGIN_ROOT}`, stdin JSON with `session_id`, `cwd`, `hook_event_name`, `tool_name`, `tool_input`, exit code 2 to block, and `hookSpecificOutput.permissionDecision`. Only part of the long hooks page was read, and the plugin has not been run inside a live Claude Code session or checked with `claude plugin validate` in this build, so run `claude plugin validate .` and test locally with `--plugin-dir` first. Tests use `unittest`: `python3 -m unittest discover -s tests -v`.

## Commercial support

Optional paid help for teams: team rollout, custom policies, and custom MCP servers. Details: https://agentguardrails.app (placeholder). The plugin itself is, and stays, free and open source.

## License

MIT. See [LICENSE](LICENSE).
