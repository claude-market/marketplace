# Configuration

Set your GitHub repos below. These are used by `/t2a-review-add-team-member` to fetch PR review history.

## Repos

```
REPOS=owner/repo-1 owner/repo-2
```

Replace `owner/repo-1` and `owner/repo-2` with your actual repos. Add as many as needed.

## PR classification (optional)

By default, `/t2a-review` classifies PRs as `frontend`, `backend`, or `mixed` based on file extensions.
If your stack uses different conventions, note them here so the skill can be adjusted.

Example:
- Frontend files: `*.tsx`, `*.ts`, `*.css`
- Backend files: `*.rb`, `*.py`, `*.go`
