---
description: Generate a reviewer profile by mining a team member's PR review history from the last 3 years.
---

# Add Team Member Profile

Generate a reviewer profile by mining a team member's PR review history from the last 3 years.

## Invocation

```
/t2a-review:add-team-member <github-username>
```

---

## Step 0 — Bootstrap (installed-plugin mode only)

If `config.md` doesn't exist in the current project root, this is the first run after installing via `/plugin install` rather than cloning the repo. Copy the templates in before continuing:

```bash
cp "$CLAUDE_PLUGIN_ROOT/config.md" ./config.md
mkdir -p team-members
cp "$CLAUDE_PLUGIN_ROOT/team-members/_template.md" ./team-members/_template.md
cp "$CLAUDE_PLUGIN_ROOT/checklist.md" ./checklist.md 2>/dev/null || true
```

Tell the user `config.md` was created and needs their repo list before this can run.

---

## Step 1 — Validate

```bash
gh api users/<USERNAME> --jq '.name // .login'
```

Abort with a clear message if the user doesn't exist.

Read `config.md` to get the list of repos to search.

---

## Step 2 — Collect review comments (last 3 years, all PRs)

```bash
SINCE=$(date -v-3y +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -d '3 years ago' +%Y-%m-%dT%H:%M:%SZ)
```

For each repo in `config.md`, get all PR numbers the user reviewed:

```bash
gh api "search/issues?q=repo:<OWNER>/<REPO>+is:pr+reviewed-by:<USERNAME>+created:>${SINCE}&per_page=100" \
  --paginate --jq '.items[].number' > /tmp/t2a-prs-<REPO>.txt
```

Then for every PR, fetch their inline comments and review bodies:

```bash
> /tmp/t2a-comments-<REPO>.jsonl
while read PR; do
  gh api "repos/<OWNER>/<REPO>/pulls/${PR}/comments" \
    --jq --arg user "<USERNAME>" --arg pr "$PR" --arg repo "<REPO>" \
    '[.[] | select(.user.login == $user) | {pr: $pr, repo: $repo, path: .path, body: .body, created_at: .created_at}][]' \
    2>/dev/null >> /tmp/t2a-comments-<REPO>.jsonl

  gh api "repos/<OWNER>/<REPO>/pulls/${PR}/reviews" \
    --jq --arg user "<USERNAME>" --arg pr "$PR" --arg repo "<REPO>" \
    '[.[] | select(.user.login == $user and (.body | length) > 20) | {pr: $pr, repo: $repo, type: "review_body", body: .body}][]' \
    2>/dev/null >> /tmp/t2a-comments-<REPO>.jsonl
done < /tmp/t2a-prs-<REPO>.txt
```

Merge all repo files:
```bash
cat /tmp/t2a-comments-*.jsonl > /tmp/t2a-all-comments.jsonl
```

Print totals:
```
PRs found per repo: ...
Total comments collected: X
```

If total comments < 20, warn: not enough history yet for a reliable profile.

This step takes ~5-10 minutes for prolific reviewers. That's expected.

---

## Step 3 — Synthesize (Sonnet agent)

Spawn one Sonnet agent:

```
You are building a PR reviewer profile from raw review comment history.

Comments are in /tmp/t2a-all-comments.jsonl — one JSON object per line (pr, repo, path, body, created_at).
Read the file.

Your job: find recurring patterns — things this reviewer flags repeatedly.

INSTRUCTIONS:
1. Group comments by theme (naming, error handling, tests, architecture, performance, etc.)
2. Count approximate occurrences per theme
3. Classify severity:
   [must]       = they block or push back hard
   [should]     = consistent ask, not a hard block
   [suggestion] = gentle, phrased as a question or "consider..."
4. Quote the reviewer directly for representative examples
5. Separate frontend and backend sections if both appear
6. Skip one-off comments and personal opinions that don't repeat

OUTPUT FORMAT:

## 👤 What <DisplayName> cares about

> Patterns from ~<N> PRs reviewed <year>–<year> across <repos>. <1-2 sentences on their review style>.

### <Category>
- [must] <rule> (~<N> occurrences)
- [should] <rule> — "<direct quote>" (~<N> occurrences)
- [suggestion] <rule> (~<N> occurrences)

Only include categories with 2+ occurrences. Order by frequency. Aim for 8-15 categories. Be specific.
```

---

## Step 4 — Confirm

Show the draft profile to the user. Ask:

> Does this look accurate? Say "looks good" to write it, or give feedback to regenerate.

Wait for confirmation before writing.

---

## Step 5 — Write the profile

```bash
# Write to team-members directory (relative to this repo)
cat > team-members/<USERNAME>.md << 'EOF'
<CONFIRMED_CONTENT>
EOF
```

Confirm the file was written and remind the user to commit it.
