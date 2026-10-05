# PromptBrake Free Tools

Prepare AI test inputs and release plans with one skill and five hosted MCP tools.

## Install

After this contribution is merged:

```text
/plugin marketplace add claude-market/marketplace
/plugin install promptbrake-free-tools@claude-market
```

Restart Claude Code after installation. Approve the remote MCP connection when
prompted. Avoid configuring a second copy of the same server.

## Tools and examples

- `get_prompt_injection_payloads`: “Get retrieval-based prompt-injection inputs for my own support RAG system.”
- `map_owasp_llm_risk`: “Map prompt-injection risk to test ideas and review responsibilities.”
- `plan_adlc_release`: “Help me plan my refund agent release; keep unknown decisions explicit.”
- `build_agent_tool_tests`: “Check that my agent does not call send_email without approval.”
- `build_test_pack`: “Build a test pack from my chatbot’s expected and forbidden response text.”

The `promptbrake-free-tools` skill clarifies missing inputs, calls the matching
tool, and explains the returned artifacts and limitations. See
[example tool arguments](skills/promptbrake-free-tools/references/examples.md).
There are no commands, agents, hooks, local executable scripts, or dependencies.

## Requirements and limitations

Requires a Claude Code version supporting skills and HTTP MCP, plus internet
access to https://promptbrake.com/free-tools/mcp. No PromptBrake account, API key,
or environment variables are required for these five preparation tools.

The tools do not scan or execute against your application. Running generated test
response packs requires a configured PromptBrake runner and CI access. Tool-call packs run in free Action v0.2.0 with staging dispatcher capture. Missing or incomplete capture cannot pass; dispatched calls do not prove successful backend effects. Response checks
compare text, not backend actions. Release scores measure planning completeness,
not security assurance. Use injection inputs only on authorized systems.

Tool arguments are sent to the declared PromptBrake service. PromptBrake does not
store tool inputs or results; operational request metadata is logged. Use synthetic
test data rather than secrets or customer information. Your assistant has its own
data policies. [Privacy](https://promptbrake.com/privacy).

## Support and source

[Setup](https://promptbrake.com/free-tools) ·
[Support](https://promptbrake.com/contact) ·
[Canonical package](https://github.com/AJ888/promptbrake-skills)

## License

MIT for these plugin files and skill instructions. The hosted service and private
PromptBrake server implementation are not covered by this license.
