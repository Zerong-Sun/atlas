#!/usr/bin/env bash
# Detached P1 orchestrator — run from your terminal: ./run_p1.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
LOG=/tmp/run_p1.log
PIDFILE=/tmp/run_p1.pid

if pgrep -f 'orchestrate_req.py --prompts-file ART_PROMPTS_REQ_P1.md' >/dev/null 2>&1; then
  echo "P1 orchestrator already running"
  pgrep -fl 'orchestrate_req.py --prompts-file ART_PROMPTS_REQ_P1.md'
  exit 0
fi

echo "" >> "$LOG"
echo "=== START $(date '+%Y-%m-%d %H:%M:%S') ===" >> "$LOG"
nohup "$ROOT/.venv/bin/python" -u orchestrate_req.py \
  --prompts-file ART_PROMPTS_REQ_P1.md \
  --max-windows 1 \
  --poll-sec 120 \
  --skip-existing \
  --wait-login-ms 600000 \
  --rate-limit-ms 600000 \
  >> "$LOG" 2>&1 &
echo $! > "$PIDFILE"
disown -a 2>/dev/null || true
echo "P1 started pid=$(cat "$PIDFILE") — tail -f $LOG"
