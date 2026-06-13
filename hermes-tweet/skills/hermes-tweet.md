---
name: hermes-tweet
description: Use Hermes Tweet for X/Twitter reads and approval-gated actions through Hermes Agent.
---

# Hermes Tweet

Use Hermes Tweet when a Hermes Agent session needs X/Twitter data or controlled
X actions through Xquik.

## When to Use

Use this skill for social listening, launch monitoring, support triage, creator
research, brand research, giveaway audits, community audits, and controlled
publishing workflows.

Use `tweet_explore` first when the user asks for a capability, endpoint, route,
or Xquik API surface. Use `tweet_read` only after a read-only endpoint is known.
Use `tweet_action` only after the user requests a write, private read, monitor,
webhook, extraction job, giveaway draw, or media operation that requires action
permissions.

## Workflow

1. Use `tweet_explore` to find the endpoint.
2. Use `tweet_read` for public read-only endpoints.
3. Use `tweet_action` only for writes or private reads after stating the exact endpoint and payload.

## Decision Rules

- If the task is endpoint discovery, call `tweet_explore` with a short query.
- If the endpoint method is `GET` and the catalog does not mark it as an action,
  call `tweet_read`.
- If the endpoint method is not `GET`, or the route touches private account
  state, call `tweet_action` only when actions are enabled and the user has
  approved the operation.
- If `tweet_action` is unavailable or disabled, explain that action tools are
  intentionally gated by `HERMES_TWEET_ENABLE_ACTIONS=true`.
- If `XQUIK_API_KEY` is missing, ask the user to set it in the Hermes runtime
  environment without requesting the key value in chat.
- If Hermes lists the plugin as `not enabled`, tell the user to run
  `hermes plugins enable hermes-tweet` or reinstall with `--enable`.

## Safety

- Never ask for or reveal API keys, signing keys, passwords, cookies, or TOTP secrets.
- Never pass credentials in tool arguments.
- Use only catalog-listed `/api/v1/...` endpoints.
- Do not use account connection, re-authentication, API key, billing, credit
  top-up, or support-ticket endpoints.
- For posting, deleting, following, DMs, profile changes, monitors, webhooks,
  extraction jobs, and draws, summarize the action before calling `tweet_action`.

## Testing

After installing or upgrading the plugin in Hermes Agent:

1. Run `hermes plugins enable hermes-tweet` unless the install used `--enable`.
2. Run `hermes plugins list` and confirm the plugin is `enabled`.
3. Run `hermes tools list` and confirm the `hermes-tweet` toolset is enabled.
4. Confirm `tweet_explore` is available without `XQUIK_API_KEY`.
5. Confirm `tweet_read` appears only when `XQUIK_API_KEY` is configured.
6. Confirm `tweet_action` stays hidden or disabled unless `HERMES_TWEET_ENABLE_ACTIONS=true`.
