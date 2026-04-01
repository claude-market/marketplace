#!/bin/bash

# Winning Orchestrator Stop Hook
# Evolutionary loop engine — keeps session alive, feeds orchestrator prompt back
# No round limits. Runs until goal is achieved or user cancels.

set -euo pipefail

HOOK_INPUT=$(cat)

STATE_FILE=".claude/winning-orchestrator.local.md"

# Graceful degradation if jq is not installed
if ! command -v jq >/dev/null 2>&1; then
  echo "FATAL: Winning orchestrator stop hook requires jq but it is not installed." >&2
  echo "  Install it:" >&2
  echo "    macOS:  brew install jq" >&2
  echo "    Debian: sudo apt-get install jq" >&2
  echo "    Arch:   sudo pacman -S jq" >&2
  echo "    Fedora: sudo dnf install jq" >&2
  echo "" >&2
  echo "  Removing state file to prevent stuck loop." >&2
  rm -f "$STATE_FILE"
  exit 0
fi

if [[ ! -f "$STATE_FILE" ]]; then
  exit 0
fi

# Parse YAML frontmatter
FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$STATE_FILE")

if [[ -z "$FRONTMATTER" ]]; then
  echo "FATAL: State file exists but contains no YAML frontmatter." >&2
  echo "  Recovery: rm .claude/winning-orchestrator.local.md" >&2
  exit 0
fi

ROUND=$(echo "$FRONTMATTER" | grep '^round:' | sed 's/round: *//')
COMPLETION_PROMISE=$(echo "$FRONTMATTER" | grep '^completion_promise:' | sed 's/completion_promise: *//' | sed 's/^"\(.*\)"$/\1/')
STRATEGIES=$(echo "$FRONTMATTER" | grep '^strategies:' | sed 's/strategies: *//')
STARTED_AT=$(echo "$FRONTMATTER" | grep '^started_at:' | sed 's/started_at: *//' | sed 's/^"\(.*\)"$/\1/')
LAST_OUTPUT_HASH=$(echo "$FRONTMATTER" | grep '^last_output_hash:' | sed 's/last_output_hash: *//' || echo "")

# Session isolation
STATE_SESSION=$(echo "$FRONTMATTER" | grep '^session_id:' | sed 's/session_id: *//' || true)
HOOK_SESSION=$(echo "$HOOK_INPUT" | jq -r '.session_id // ""')
if [[ -n "$STATE_SESSION" ]] && [[ "$STATE_SESSION" != "$HOOK_SESSION" ]]; then
  exit 0
fi

# Validate round is numeric
if [[ ! "$ROUND" =~ ^[0-9]+$ ]]; then
  echo "FATAL: State file corrupted — 'round' is not a valid number (got: '$ROUND')." >&2
  echo "  Recovery: rm .claude/winning-orchestrator.local.md" >&2
  rm "$STATE_FILE"
  exit 0
fi

if [[ ! "$STRATEGIES" =~ ^[0-9]+$ ]]; then
  echo "FATAL: State file corrupted — 'strategies' is not a valid number (got: '$STRATEGIES')." >&2
  echo "  Recovery: rm .claude/winning-orchestrator.local.md" >&2
  rm "$STATE_FILE"
  exit 0
fi

# Calculate elapsed time
ELAPSED_MSG=""
ELAPSED_SECS=0
if [[ -n "$STARTED_AT" ]]; then
  START_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$STARTED_AT" +%s 2>/dev/null \
    || date -d "$STARTED_AT" +%s 2>/dev/null \
    || echo "")
  if [[ -n "$START_EPOCH" ]]; then
    NOW_EPOCH=$(date +%s)
    ELAPSED_SECS=$((NOW_EPOCH - START_EPOCH))
    ELAPSED_MIN=$((ELAPSED_SECS / 60))
    ELAPSED_SEC=$((ELAPSED_SECS % 60))
    if [[ $ELAPSED_MIN -gt 0 ]]; then
      ELAPSED_MSG="${ELAPSED_MIN}m${ELAPSED_SEC}s"
    else
      ELAPSED_MSG="${ELAPSED_SEC}s"
    fi
  fi
fi

# No max round check — winning runs until goal is achieved

# Get transcript and check for completion promise
TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcript_path')

if [[ ! -f "$TRANSCRIPT_PATH" ]]; then
  echo "FATAL: Transcript file not found at: $TRANSCRIPT_PATH" >&2
  echo "  Recovery: rm .claude/winning-orchestrator.local.md" >&2
  rm "$STATE_FILE"
  exit 0
fi

if ! grep -q '"role":"assistant"' "$TRANSCRIPT_PATH"; then
  # No assistant messages yet — first round, keep going
  :
fi

# Cap transcript grep to last 200 lines for safety
LAST_LINES=$(grep '"role":"assistant"' "$TRANSCRIPT_PATH" | tail -n 200)
if [[ -z "$LAST_LINES" ]]; then
  # No assistant output yet — continue loop
  LAST_OUTPUT=""
else
  set +e
  LAST_OUTPUT=$(echo "$LAST_LINES" | jq -rs '
    map(.message.content[]? | select(.type == "text") | .text) | last // ""
  ' 2>&1)
  JQ_EXIT=$?
  set -e

  if [[ $JQ_EXIT -ne 0 ]]; then
    echo "FATAL: Failed to parse transcript with jq." >&2
    echo "  jq output: $LAST_OUTPUT" >&2
    echo "  Recovery: rm .claude/winning-orchestrator.local.md" >&2
    rm "$STATE_FILE"
    exit 0
  fi
fi

# Detect stuck loop — hash the last output and compare to previous
CURRENT_HASH=$(printf '%s' "$LAST_OUTPUT" | shasum -a 256 | cut -d' ' -f1)
STUCK_WARNING=""
if [[ -n "$LAST_OUTPUT_HASH" ]] && [[ "$LAST_OUTPUT_HASH" == "$CURRENT_HASH" ]]; then
  STUCK_WARNING=" | WARNING: Output identical to previous — may be stuck"
fi

# Check completion promise
if [[ "$COMPLETION_PROMISE" != "null" ]] && [[ -n "$COMPLETION_PROMISE" ]]; then
  PROMISE_TEXT=$(echo "$LAST_OUTPUT" | perl -0777 -pe 's/.*?<promise>(.*?)<\/promise>.*/$1/s; s/^\s+|\s+$//g; s/\s+/ /g' 2>/dev/null || echo "")
  if [[ -n "$PROMISE_TEXT" ]] && [[ "$PROMISE_TEXT" = "$COMPLETION_PROMISE" ]]; then
    echo "Winning orchestrator: Goal achieved after ${ELAPSED_MSG:-unknown time} (round $ROUND)"
    rm "$STATE_FILE"
    exit 0
  fi
fi

# Continue orchestrator loop — increment round
NEXT_ROUND=$((ROUND + 1))

# Extract prompt text (everything after closing ---)
PROMPT_TEXT=$(awk '/^---$/{i++; next} i>=2' "$STATE_FILE")

if [[ -z "$PROMPT_TEXT" ]]; then
  echo "FATAL: No prompt text in state file." >&2
  echo "  Recovery: rm .claude/winning-orchestrator.local.md" >&2
  rm "$STATE_FILE"
  exit 0
fi

# Update round and last_output_hash atomically
TEMP_FILE="${STATE_FILE}.tmp.$$"
trap 'rm -f "$TEMP_FILE" "${TEMP_FILE}.2"' EXIT

sed "s/^round: .*/round: $NEXT_ROUND/" "$STATE_FILE" > "$TEMP_FILE"

# Update or insert last_output_hash in frontmatter
if grep -q '^last_output_hash:' "$TEMP_FILE"; then
  sed -i.bak "s/^last_output_hash:.*$/last_output_hash: $CURRENT_HASH/" "$TEMP_FILE" && rm -f "${TEMP_FILE}.bak"
else
  awk -v hash="$CURRENT_HASH" '
    /^---$/ { count++; if (count == 2) print "last_output_hash: " hash }
    { print }
  ' "$TEMP_FILE" > "${TEMP_FILE}.2"
  mv "${TEMP_FILE}.2" "$TEMP_FILE"
fi

mv "$TEMP_FILE" "$STATE_FILE"
trap - EXIT

# Build system message
ELAPSED_PART=""
if [[ -n "$ELAPSED_MSG" ]]; then
  ELAPSED_PART=" | elapsed: $ELAPSED_MSG"
fi

if [[ "$COMPLETION_PROMISE" != "null" ]] && [[ -n "$COMPLETION_PROMISE" ]]; then
  SYSTEM_MSG="Winning round ${NEXT_ROUND} | ${STRATEGIES} agents/round${ELAPSED_PART}${STUCK_WARNING} | No round limit — runs until done | <promise>$COMPLETION_PROMISE</promise> when achieved"
else
  SYSTEM_MSG="Winning round ${NEXT_ROUND} | ${STRATEGIES} agents/round${ELAPSED_PART}${STUCK_WARNING} | No round limit"
fi

jq -n \
  --arg prompt "$PROMPT_TEXT" \
  --arg msg "$SYSTEM_MSG" \
  '{
    "decision": "block",
    "reason": $prompt,
    "systemMessage": $msg
  }'

exit 0
