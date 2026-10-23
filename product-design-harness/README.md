# Product Design Harness (UX3)

Make product decisions before implementation and carry their boundaries into structured handoffs. UX3 provides Quick, Council, and live-coding workflows, machine-readable review and context-pack examples, and local validation scripts. It is a skill, with no registered commands, agents, hooks, MCP servers, or LSP servers.

## Installation and use

Add the Claude Market marketplace, then choose product-design-harness in the native plugin menu. For maintainer review of a local checkout, select this plugin directory with the host's local plugin workflow. This candidate has not been published or installed in a Claude session.

Ask: “Use product-design-harness to review whether this feature should proceed before implementation.” For an implementation handoff, ask it to create a review and a matching context pack, keep the allowed scope explicit, and validate both before proceeding. Council is a workflow option; this package does not register or automatically spawn agents.

## Requirements, data, and costs

Use a compatible Claude Code host and Python 3 with jsonschema for the bundled local validators. The skill reads the project and evidence explicitly supplied or authorized by the user, and can write local review/context-pack artifacts. It contains executable local validators, not a text-only prompt. Optional external evidence tools remain subject to the host's permissions and the user's authorization. No credentials, OAuth grant, or external service are bundled or preauthorized. Host/model usage and optional external tools may carry their own costs; this is not a promise of free inference or a security certification.

## Source and known limitations

The full skill directory contains 91 unchanged files from cis2042/ux3-product-design-harness at commit 48965c6b501f61ebbb8130c9c2e4f9af08922b9f. The skill's original LICENSE and all resources are retained; the plugin-root LICENSE is an identical copy. The only skill registered by this wrapper is the skills/product-design-harness directory, whose entrypoint is SKILL.md. The marketplace's existing examples use Markdown file paths, while the locally available Claude validator requires skill directory paths. This candidate follows that validator's directory contract; maintainer acceptance of this format has not been established, and the existing marketplace plugins are unchanged.

Known source defects remain: a forbidden override action padded with trailing whitespace is incorrectly accepted by the existing validator; referenced ux3-model.svg, intersections.svg, and product-vs-coding-harness.svg are missing. Source PRs 23 and 24 are not merged and their fixes are not included. These validators are development aids, not production authorization enforcement or a guarantee that all referenced evidence is true. This package does not claim production readiness, measured model performance, user adoption, or marketplace approval.

## License and contact

MIT. Original source and rights: https://github.com/cis2042/ux3-product-design-harness/tree/48965c6b501f61ebbb8130c9c2e4f9af08922b9f/skills/product-design-harness . For questions or integration discussion, use the upstream repository's public issue entrypoint; this package sends no messages automatically.
