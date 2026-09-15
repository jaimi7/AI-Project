#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
api_log="${TMPDIR:-/tmp}/reminderly-e2e-api.log"
web_log="${TMPDIR:-/tmp}/reminderly-e2e-web.log"

if [[ ! -x "$project_dir/backend/.venv/bin/uvicorn" ]]; then
  echo "Backend environment is missing. Run: cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

"$project_dir/backend/.venv/bin/uvicorn" app.main:app \
  --app-dir "$project_dir/backend" --host 127.0.0.1 --port 8000 >"$api_log" 2>&1 &
e2e_api_pid=$!

npm --prefix "$project_dir/frontend" run dev -- --host 127.0.0.1 >"$web_log" 2>&1 &
e2e_web_pid=$!

cleanup() {
  kill "$e2e_api_pid" "$e2e_web_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for attempt in {1..30}; do
  if curl --fail --silent http://127.0.0.1:8000/api/v1/health >/dev/null \
    && curl --fail --silent http://127.0.0.1:3000 >/dev/null; then
    npm --prefix "$project_dir/frontend" run e2e
    exit $?
  fi
  sleep 1
done

echo "E2E servers did not become ready."
sed -n '1,120p' "$api_log"
sed -n '1,120p' "$web_log"
exit 1
