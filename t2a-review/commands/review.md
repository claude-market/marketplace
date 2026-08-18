---
description: Run a multi-agent pre-PR review against your diff (or a GitHub PR URL) using your team's reviewer profiles.
---

# T2A Pre-PR Self-Review

Run a multi-agent review on the current diff (or a GitHub PR URL) using your team's reviewer profiles.

## Invocation

```
/t2a-review:review [PR_URL]
```

- No argument: reviews local `git diff main...HEAD`
- PR URL: reviews that PR's diff

---

## Step 0 — Bootstrap (installed-plugin mode only)

If `checklist.md` doesn't exist in the current project root, this is the first run after installing via `/plugin install` rather than cloning the repo. Copy the templates in before continuing:

```bash
cp "$CLAUDE_PLUGIN_ROOT/checklist.md" ./checklist.md
mkdir -p team-members
cp "$CLAUDE_PLUGIN_ROOT/team-members/_template.md" ./team-members/_template.md 2>/dev/null || true
```

Tell the user `checklist.md` was created with placeholder conventions and should be edited to match their team, and that they should run `/t2a-review:add-team-member` for each reviewer before profiles exist.

---

## Step 1 — Gather the diff

**If a PR URL was provided:**
```bash
gh pr view <PR_URL>
gh pr diff <PR_URL> > /tmp/t2a-review-diff.patch
```
Use the PR title and description as context.

**If no argument (local diff):**
```bash
git diff main...HEAD > /tmp/t2a-review-diff.patch
git diff main...HEAD --stat
git branch --show-current
```

Check each changed directory for an `AGENTS.md` file and read it — package-specific rules override everything.

---

## Step 2 — Classify the PR and build the reviewer bundle

Inspect changed file paths:
```bash
git diff --name-only main...HEAD  # or: gh pr diff --name-only <PR_URL>
```

Classify as `frontend`, `backend`, or `mixed` based on extensions.

Then build a `<<<TEAM_CONVENTIONS>>>` bundle:
- Always include `checklist.md`
- For `frontend` PRs: include only the frontend sections from each `team-members/*.md`
- For `backend` PRs: include only the backend sections
- For `mixed`: include both sections
- Skip `_template.md`

Cap the bundle at ~30k tokens. If it overflows, drop lowest-priority profiles for this PR type.

---

## Step 3 — Spawn 3 agents in parallel + skeptic

Spawn all three agents in a **single message** so they run in parallel. Each reads from `/tmp/t2a-review-diff.patch`.

### A. General reviewer (Haiku)

```
You are a senior engineer doing a general code review — universal software engineering quality only.

The diff is at /tmp/t2a-review-diff.patch. Read it.

PR context: <<<PR_TITLE_AND_DESCRIPTION>>>

Focus ONLY on:
- Logic bugs, off-by-ones, wrong conditionals
- Race conditions and async correctness
- Security vulnerabilities (XSS, injection, data exposure)
- Memory leaks (missing cleanup, stale subscriptions)
- Type unsafety that strict mode doesn't catch
- Missing error handling at system boundaries
- Test gaps for entirely untested new behavior

Do NOT flag naming, formatting, or team-specific conventions.

Return ONLY a JSON array. Each finding: {file, line, severity (must|should|suggestion), category, description, reviewer: "General"}. Return [] if none.
```

### B. Team-conventions reviewer (Sonnet)

```
You are doing a code review applying this team's conventions. Below are the reviewer profiles and checklist, pre-filtered for this PR's tech stack.

The diff is at /tmp/t2a-review-diff.patch. Read it.

PR context: <<<PR_TITLE_AND_DESCRIPTION>>>

TEAM CONVENTIONS:
<<<TEAM_CONVENTIONS>>>

INSTRUCTIONS:
- Only flag issues clearly present in the diff — cite file and exact line number
- Skip anything a linter or type-checker already catches automatically
- A finding without a specific line is not a finding
- Attribute each finding to the reviewer whose rule was applied (from section headers)

Return ONLY a JSON array. Each finding: {file, line, severity (must|should|suggestion), category, description, rule, reviewer}. Return [] if none.
```

### C. Holistic reviewer (Haiku)

```
You are a senior engineer doing a holistic PR review.

The diff is at /tmp/t2a-review-diff.patch. Read it.

PR context: <<<PR_TITLE_AND_DESCRIPTION>>>

Review for correctness, code quality, performance, test coverage, and security.

Return ONLY a JSON array. Each finding: {file, line, severity, category, description, reviewer: "Holistic"}. Return [] if none.
```

---

## Step 4 — Deduplicate (orchestrator, no agent)

Merge all JSON arrays. Same finding = same file + line within ±3 + same category.
Keep highest severity. Union the reviewer names.

---

## Step 5 — Skeptic pass (Opus)

```
You are a skeptical senior engineer reviewing these findings.

The diff is at /tmp/t2a-review-diff.patch. Read it.

For each finding:
1. Does the cited file + line actually contain the issue described?
2. Is there enough context to confirm the rule was violated?
3. Is this a false positive from over-broad pattern matching?

Remove findings that fail any check. Return the filtered list as the same JSON array.

FINDINGS:
<<<FINDINGS_JSON>>>
```

---

## Step 6 — Escalation

Fire escalation if the team-conventions agent returned fewer than 8 findings OR the PR touches a domain with a dedicated profile owner.

Spawn 2-3 additional Haiku agents, each loading ONE team-member profile (not the full bundle). Haiku handles single profiles well — it struggles with 10+ concatenated. Merge results and re-run the skeptic.

---

## Step 7 — Output

```
## Pre-PR Review: <branch-name>

**Summary:** <1-2 sentences on what this PR does>

---

### Must Fix (<N>)
- [Category] Description — `path/to/file.ts:42`

### Should Fix (<N>)
- [Category] Description — `path/to/file.ts:42`

### Suggestions (<N>)
- [Category] Description — `path/to/file.ts:42`

### Strengths
1-3 specific things done well.

---

### Pre-Merge Checklist
- [ ] Type-check passes
- [ ] Tests pass for affected paths
- [ ] PR description written
- [ ] No debug artifacts

---

**Verdict: APPROVED** / **CHANGES REQUIRED**
```

Omit sections with no findings. Drop per-finding reviewer attribution from the output.

---

## Cost telemetry

After the report, print a token/cost breakdown per agent:

```
Cost breakdown:
  General    (Haiku):   ~Xk tokens  ~$0.XX
  Conventions (Sonnet): ~Xk tokens  ~$0.XX
  Holistic   (Haiku):   ~Xk tokens  ~$0.XX
  Skeptic    (Opus):    ~Xk tokens  ~$0.XX
  Total:                ~Xk tokens  ~$X.XX
```

Rough pricing: Haiku ~$1/Mtok in, $5/Mtok out. Sonnet ~$3/$15. Opus ~$15/$75.
If a run exceeds $8, the conventions bundle likely overflowed — tighten the section filter in Step 2.
