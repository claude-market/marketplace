#!/bin/bash

# Winning Orchestrator Status Script
# Reports current round, elapsed time, and history summary

set -euo pipefail

STATE_FILE=".claude/winning-orchestrator.local.md"
HISTORY_FILE=".claude/winning-history.local.md"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "No active winning orchestration."
  exit 0
fi

FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$STATE_FILE")

if [[ -z "$FRONTMATTER" ]]; then
  echo "ERROR: State file exists but contains no valid YAML frontmatter." >&2
  echo "  File: $STATE_FILE" >&2
  echo "  Recovery: rm $STATE_FILE" >&2
  exit 1
fi

ROUND=$(echo "$FRONTMATTER" | grep '^round:' | sed 's/round: *//')
COMPLETION_PROMISE=$(echo "$FRONTMATTER" | grep '^completion_promise:' | sed 's/completion_promise: *//' | sed 's/^"\(.*\)"$/\1/')
STRATEGIES=$(echo "$FRONTMATTER" | grep '^strategies:' | sed 's/strategies: *//')
STARTED_AT=$(echo "$FRONTMATTER" | grep '^started_at:' | sed 's/started_at: *//' | sed 's/^"\(.*\)"$/\1/')
SESSION_ID=$(echo "$FRONTMATTER" | grep '^session_id:' | sed 's/session_id: *//' || true)

# Calculate elapsed time
ELAPSED_DISPLAY="unknown"
ELAPSED_SECS=0

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

echo "Winning Orchestration Status"
echo "================================================================"
echo ""
echo "  Round:              $ROUND (no limit)"
echo "  Agents per round:   $STRATEGIES"
echo "  Elapsed time:       $ELAPSED_DISPLAY"
echo "  Completion promise: $COMPLETION_PROMISE"
echo "  Started at:         $STARTED_AT"
echo "  Session:            ${SESSION_ID:-<not set>}"
echo ""

# Extract goal from prompt
GOAL=$(awk '/^---$/{i++; next} i>=2' "$STATE_FILE" | grep '^GOAL:' | sed 's/^GOAL: *//')
if [[ -n "$GOAL" ]]; then
  echo "  Goal: $GOAL"
  echo ""
fi

# Show history summary if available
if [[ -f "$HISTORY_FILE" ]]; then
  HISTORY_ROUNDS=$(grep -c '^## Round' "$HISTORY_FILE" 2>/dev/null || echo "0")
  echo "  History: $HISTORY_ROUNDS completed round(s) in $HISTORY_FILE"

  # Show latest KEY INSIGHT if available
  LAST_INSIGHT=$(grep '^KEY INSIGHT:' "$HISTORY_FILE" | tail -1)
  if [[ -n "$LAST_INSIGHT" ]]; then
    echo "  Latest insight: ${LAST_INSIGHT#KEY INSIGHT: }"
  fi

  # Show latest APPROACHES TO AVOID
  LAST_AVOID=$(grep '^APPROACHES TO AVOID:' "$HISTORY_FILE" | tail -1)
  if [[ -n "$LAST_AVOID" ]]; then
    echo "  Avoiding: ${LAST_AVOID#APPROACHES TO AVOID: }"
  fi
  echo ""
else
  echo "  History: no completed rounds yet"
  echo ""
fi

# Staleness warning: started > 1 hour ago with round still at 1
if [[ $ELAPSED_SECS -gt 3600 ]] && [[ "$ROUND" =~ ^[0-9]+$ ]] && [[ $ROUND -le 1 ]]; then
  echo "  WARNING: Orchestration may be stale — running for over 1 hour"
  echo "  still on round $ROUND. Consider /winning:cancel."
  echo ""
fi

echo "  State file:   $STATE_FILE"
echo "  History file:  $HISTORY_FILE"
