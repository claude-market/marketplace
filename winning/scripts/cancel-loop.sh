#!/bin/bash

# Winning Orchestrator Cancel Script
# Removes orchestrator state file to stop the loop
# Preserves history file for future reference

set -euo pipefail

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

STATE_FILE=".claude/winning-orchestrator.local.md"
HISTORY_FILE=".claude/winning-history.local.md"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "No active winning orchestration to cancel."
  exit 0
fi

FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$STATE_FILE")
ROUND=$(echo "$FRONTMATTER" | grep '^round:' | sed 's/round: *//')
STRATEGIES=$(echo "$FRONTMATTER" | grep '^strategies:' | sed 's/strategies: *//')
STARTED_AT=$(echo "$FRONTMATTER" | grep '^started_at:' | sed 's/started_at: *//' | sed 's/^"\(.*\)"$/\1/')
STATE_SESSION=$(echo "$FRONTMATTER" | grep '^session_id:' | sed 's/session_id: *//' || true)

# Session verification
CURRENT_SESSION="${CLAUDE_CODE_SESSION_ID:-}"
if [[ -n "$STATE_SESSION" ]] && [[ -n "$CURRENT_SESSION" ]] && [[ "$STATE_SESSION" != "$CURRENT_SESSION" ]]; then
  if [[ $FORCE -eq 0 ]]; then
    echo "ERROR: This orchestration belongs to a different session." >&2
    echo "" >&2
    echo "  Orchestration session: $STATE_SESSION" >&2
    echo "  Current session:       $CURRENT_SESSION" >&2
    echo "" >&2
    echo "  To cancel anyway: /winning:cancel --force" >&2
    exit 1
  else
    echo "================================================================" >&2
    echo "WARNING: FORCE-CANCELLING ANOTHER SESSION'S ORCHESTRATION" >&2
    echo "================================================================" >&2
    echo "  Orchestration session: $STATE_SESSION" >&2
    echo "  Current session:       $CURRENT_SESSION" >&2
    echo "================================================================" >&2
    echo "" >&2
  fi
fi

# Calculate elapsed time
ELAPSED_DISPLAY="unknown"

if [[ -n "$STARTED_AT" ]]; then
  START_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$STARTED_AT" +%s 2>/dev/null \
    || date -d "$STARTED_AT" +%s 2>/dev/null \
    || echo "")
  if [[ -n "$START_EPOCH" ]]; then
    NOW_EPOCH=$(date +%s)
    ELAPSED_SECS=$((NOW_EPOCH - START_EPOCH))
    ELAPSED_HRS=$((ELAPSED_SECS / 3600))
    ELAPSED_MIN=$(( (ELAPSED_SECS % 3600) / 60 ))
    ELAPSED_SEC=$((ELAPSED_SECS % 60))

    if [[ $ELAPSED_HRS -gt 0 ]]; then
      ELAPSED_DISPLAY="${ELAPSED_HRS}h ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
    elif [[ $ELAPSED_MIN -gt 0 ]]; then
      ELAPSED_DISPLAY="${ELAPSED_MIN}m ${ELAPSED_SEC}s"
    else
      ELAPSED_DISPLAY="${ELAPSED_SEC}s"
    fi
  fi
fi

# Extract goal
GOAL=$(awk '/^---$/{i++; next} i>=2' "$STATE_FILE" | grep '^GOAL:' | sed 's/^GOAL: *//')

rm "$STATE_FILE"

echo "Winning orchestration cancelled."
echo ""
echo "  Summary:"
echo "  --------"
echo "  Current round:        $ROUND"
echo "  Agents per round:     $STRATEGIES"
echo "  Elapsed time:         $ELAPSED_DISPLAY"
if [[ -n "$GOAL" ]]; then
  echo "  Goal:                 $GOAL"
fi
echo ""

# History file status
if [[ -f "$HISTORY_FILE" ]]; then
  HISTORY_ROUNDS=$(grep -c '^## Round' "$HISTORY_FILE" 2>/dev/null || echo "0")
  echo "  History preserved: $HISTORY_FILE ($HISTORY_ROUNDS round(s) of learnings)"
  echo "  To resume later, the history provides context for a fresh /winning:launch."
else
  echo "  No history file — cancelled before any rounds completed."
fi
echo ""

echo "  Note: Background agents may still be running."
echo "  They will complete on their own but results won't be orchestrated."

# Check for leftover worktree directories
WORKTREES=$(git worktree list --porcelain 2>/dev/null | grep '^worktree ' | grep -v "$(git rev-parse --show-toplevel 2>/dev/null)" || true)
if [[ -n "$WORKTREES" ]]; then
  WORKTREE_COUNT=$(echo "$WORKTREES" | wc -l | tr -d ' ')
  echo ""
  echo "  Found $WORKTREE_COUNT git worktree(s) from strategy agents:"
  echo "$WORKTREES" | sed 's/^worktree /    /'
  echo ""
  echo "  To clean up: git worktree prune"
fi
