# Team Checklist

These are applied to every PR regardless of reviewer profiles.
Replace these placeholders with your team's actual conventions.

## Always

- [ ] No `console.log` / debug artifacts left in the diff
- [ ] New behavior has at least one test
- [ ] PR description explains the why, not just the what
- [ ] No commented-out code

## TypeScript / JavaScript

- [ ] No `any` without a comment explaining why
- [ ] No `@ts-ignore` without a comment
- [ ] Named exports preferred over default exports for utilities

## Tests

- [ ] Tests cover the happy path and at least one error/edge case
- [ ] Test names describe the scenario, not the implementation

## Add your team's conventions below

<!-- 
Examples:
- All user-visible strings must be translated
- Use dayjs for date operations, not native Date
- Async operations need a catch/error state
-->
