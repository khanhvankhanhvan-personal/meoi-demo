#!/usr/bin/env bash
# Smoke test against a running `docker compose up` stack (used by CI and runnable locally).
# Needs no LLM key: it checks that the stack is up and that the Tier 3 safety path works.
set -euo pipefail

BASE="${BASE:-http://localhost:8080}"
fail() { echo "FAIL: $*" >&2; exit 1; }

echo "web index"
curl -fsS "$BASE/" | grep -q '<div id="root">' || fail "web index does not look like the app"

echo "api health through nginx"
curl -fsS "$BASE/api/health" | grep -q '"status":"ok"' || fail "/api/health"

echo "support list always includes 115"
curl -fsS "$BASE/api/support" | grep -q '"phone":"115"' || fail "/api/support has no 115"

post() {  # $1 = JSON body; prints the HTTP status, the body goes to /tmp/smoke.out
  # The body goes through stdin so that UTF-8 survives on Windows shells too (argv would be re-encoded).
  printf '%s' "$1" | curl -sS -o /tmp/smoke.out -w '%{http_code}' -X POST "$BASE/api/chat/send" \
    -H 'Content-Type: application/json; charset=utf-8' --data-binary @-
}

echo "Tier 3 message is answered by the server-side safety path"
code=$(post '{"messages":[{"role":"user","content":"Có lúc em nghĩ nếu em biến mất thì mọi thứ sẽ dễ hơn"}]}')
[ "$code" = "200" ] || fail "tier 3 chat returned HTTP $code"
grep -q '"tier":"3-PSYCHIATRIC"' /tmp/smoke.out || fail "tier 3 message was not tier 3-PSYCHIATRIC"
grep -q '"source":"script"' /tmp/smoke.out || fail "tier 3 message did not use the fixed script"
grep -q '"pinnable":false' /tmp/smoke.out || fail "tier 3 reply must not be pinnable"
grep -q '"phone":"115"' /tmp/smoke.out || fail "tier 3 reply has no 115 contact"

echo "normal message: LLM answer if a key is set, otherwise a clean 503"
code=$(post '{"messages":[{"role":"user","content":"Hôm nay em mệt quá"}]}')
case "$code" in
  200) grep -q '"source":"llm"' /tmp/smoke.out || fail "200 but not from the LLM" ;;
  503) grep -q 'llm_not_configured' /tmp/smoke.out || fail "503 without llm_not_configured" ;;
  *) fail "normal chat returned HTTP $code" ;;
esac

echo "OK"
