#!/bin/bash

# Winning Orchestrator Setup Script
# Creates orchestrator state file for evolutionary loop

set -euo pipefail

# Dependency checks — the stop hook requires jq and perl
MISSING_DEPS=()
if ! command -v jq >/dev/null 2>&1; then
  MISSING_DEPS+=("jq")
fi
if ! command -v perl >/dev/null 2>&1; then
  MISSING_DEPS+=("perl")
fi

if [[ ${#MISSING_DEPS[@]} -gt 0 ]]; then
  echo "ERROR: Missing required dependencies: ${MISSING_DEPS[*]}" >&2
  echo "" >&2
  echo "  The winning orchestrator stop hook requires these tools at runtime." >&2
  echo "  Install them before launching:" >&2
  for dep in "${MISSING_DEPS[@]}"; do
    case "$dep" in
      jq)
        echo "    macOS:  brew install jq" >&2
        echo "    Debian: sudo apt-get install jq" >&2
        echo "    Arch:   sudo pacman -S jq" >&2
        echo "    Fedora: sudo dnf install jq" >&2
        ;;
      perl)
        echo "    perl is usually pre-installed on macOS/Linux" >&2
        echo "    Debian: sudo apt-get install perl" >&2
        echo "    Arch:   sudo pacman -S perl" >&2
        echo "    Fedora: sudo dnf install perl" >&2
        ;;
    esac
  done
  exit 1
fi

# Validate session ID is available for session isolation
if [[ -z "${CLAUDE_CODE_SESSION_ID:-}" ]]; then
  echo "WARNING: CLAUDE_CODE_SESSION_ID is not set." >&2
  echo "  Session isolation will be disabled." >&2
  echo "" >&2
fi

PROMPT_PARTS=()
COMPLETION_PROMISE="GOAL ACHIEVED"
STRATEGIES=3

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      cat << 'HELP_EOF'
Winning Orchestrator — evolutionary parallel strategy deployment

USAGE:
  /winning:launch GOAL [OPTIONS]

ARGUMENTS:
  GOAL    The task to achieve with parallel strategies

OPTIONS:
  --strategies <n>               Number of parallel strategies per round (default: 3)
  --completion-promise '<text>'  Promise phrase signaling goal achieved (default: "GOAL ACHIEVED")
  -h, --help                     Show this help

EXAMPLES:
  /winning:launch "Build a REST API with full test coverage" --strategies 3
  /winning:launch "Fix the auth bug" --completion-promise "BUG FIXED"

HOW IT WORKS:
  Each round deploys N agents on different strategies. Agents work until done
  (no cycle limits). Results are compared against VERIFICATION_COMMAND.
  If none pass, learnings are recorded and a new round starts with adjusted
  strategies. Repeats until the goal is verifiably achieved.

STOPPING:
  /winning:cancel    Cancel the orchestration
  /winning:status    Check current progress
HELP_EOF
      exit 0
      ;;
    --completion-promise)
      if [[ -z "${2:-}" ]]; then
        echo "ERROR: --completion-promise requires a text argument" >&2
        exit 1
      fi
      COMPLETION_PROMISE="$2"
      shift 2
      ;;
    --strategies)
      if [[ -z "${2:-}" ]] || ! [[ "$2" =~ ^[1-9][0-9]*$ ]]; then
        echo "ERROR: --strategies requires a positive integer (1-10)" >&2
        exit 1
      fi
      if [[ "$2" -gt 10 ]]; then
        echo "ERROR: --strategies max is 10 (got: $2)" >&2
        exit 1
      fi
      STRATEGIES="$2"
      shift 2
      ;;
    *)
      PROMPT_PARTS+=("$1")
      shift
      ;;
  esac
done

PROMPT="${PROMPT_PARTS[*]:-}"

# Validate prompt doesn't contain characters that break the heredoc
if [[ "$PROMPT" == *'EOF'* ]]; then
  echo "ERROR: Goal text must not contain the literal string 'EOF'" >&2
  exit 1
fi

if [[ -z "$PROMPT" ]]; then
  echo "ERROR: No goal provided" >&2
  echo "" >&2
  echo "  Examples:" >&2
  echo "    /winning:launch Build a REST API with tests" >&2
  echo "    /winning:launch Fix the auth bug --strategies 2" >&2
  echo "" >&2
  echo "  For all options: /winning:launch --help" >&2
  exit 1
fi

# Check for existing orchestration
if [[ -f ".claude/winning-orchestrator.local.md" ]]; then
  EXISTING_ROUND=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' ".claude/winning-orchestrator.local.md" | grep '^round:' | sed 's/round: *//')
  echo "WARNING: Active orchestration found at round $EXISTING_ROUND" >&2
  echo "   Cancel it first with /winning:cancel" >&2
  exit 1
fi

mkdir -p .claude

STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
COMPLETION_PROMISE_YAML="\"$COMPLETION_PROMISE\""

cat > .claude/winning-orchestrator.local.md <<EOF
---
active: true
round: 1
session_id: ${CLAUDE_CODE_SESSION_ID:-}
completion_promise: $COMPLETION_PROMISE_YAML
strategies: $STRATEGIES
started_at: "$STARTED_AT"
last_output_hash: ""
---

WINNING ORCHESTRATOR — EVOLUTIONARY LOOP

GOAL: $PROMPT

STRATEGY_COUNT: $STRATEGIES agents per round

LOOP PROTOCOL:
1. Deploy $STRATEGIES agents (different strategies, same goal) with run_in_background: true, model: "opus", and isolation: "worktree"
2. Wait for all to complete
3. Run VERIFICATION_COMMAND on each agent's output
4. If any passes -> VICTORY (consolidate that agent's work, output completion promise)
5. If none pass -> collect LEARNINGS from all agents
6. Append learnings to .claude/winning-history.local.md
7. Design $STRATEGIES NEW strategies informed by learnings (must address previous failures, must avoid failed approaches)
8. Each new agent reads .claude/winning-history.local.md before starting
9. -> Next round

RULES:
- No cycle limits on agents. They work until done or blocked.
- No round limits on the orchestrator. Loop until VERIFICATION_COMMAND passes.
- Each round's agents read .claude/winning-history.local.md so they don't repeat mistakes.
- Every round must try at least one fundamentally different approach from all previous rounds.
When the goal is fully achieved, output: <promise>$COMPLETION_PROMISE</promise>
EOF

cat <<EOF
Winning orchestration activated!

Goal: $PROMPT
Strategies: $STRATEGIES agents per round
Completion promise: $COMPLETION_PROMISE
Session: ${CLAUDE_CODE_SESSION_ID:-<not set>}
Started at: $STARTED_AT

No round limits. No cycle limits. Runs until the goal is verifiably achieved.
Learnings persist in .claude/winning-history.local.md across rounds.

To monitor: /winning:status
To cancel:  /winning:cancel

================================================================
Completion Promise
================================================================

To complete, output this EXACT text:
  <promise>$COMPLETION_PROMISE</promise>

ONLY when the goal is genuinely and verifiably achieved.
================================================================
EOF

echo ""
echo "GOAL: $PROMPT"
echo ""
echo "Begin by refining this goal (Phase 0) then deploying $STRATEGIES competing strategies."
