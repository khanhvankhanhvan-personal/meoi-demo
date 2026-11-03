#!/usr/bin/env bash
# Lane A guard: reads changed file paths on stdin (git diff --name-only ...).
# Exit 0 if EVERY file is a plain UI file (Lane A); exit 1 and list the offenders otherwise.
# Safety UI, content, API client and state are deliberately NOT Lane A (see docs/process/quy-trinh-cai-tien.md).
set -u
ALLOW='^frontend/src/(screens|components|test)/|^frontend/src/(styles\.css|App\.tsx|lib/dates\.ts)$|^frontend/src/.*\.test\.tsx?$'
DENY='^frontend/src/(screens/Chat\.tsx|components/(CrisisBanner|SupportList)\.tsx|content\.ts|lib/(opener|api)\.ts|store\.tsx?)$'

bad=0
seen=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  seen=1
  if echo "$f" | grep -Eq "$DENY" || ! echo "$f" | grep -Eq "$ALLOW"; then
    echo "not Lane A: $f"
    bad=1
  fi
done
[ "$seen" -eq 0 ] && { echo "no changed files"; exit 1; }
exit "$bad"
