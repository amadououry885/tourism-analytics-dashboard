#!/usr/bin/env bash
set -euo pipefail

# Go to your app directory on the instance
cd /var/app/current/backend || exit 0

# Activate EB's venv
if ls /var/app/venv/*/bin/activate >/dev/null 2>&1; then
  # shellcheck source=/dev/null
  source /var/app/venv/*/bin/activate
fi

# Helper: run as webapp user if it exists
if id webapp >/dev/null 2>&1; then
  RUN_AS_WEBAPP='sudo -u webapp -H bash -lc'
else
  RUN_AS_WEBAPP='bash -lc'
fi

USE_SQLITE="${USE_SQLITE:-0}"
SQLITE_PATH="${SQLITE_PATH:-/tmp/tourism.sqlite3}"

if [ "$USE_SQLITE" = "1" ]; then
  echo "[postdeploy] USE_SQLITE=1 detected; ensuring SQLite file/dir is writable by webapp at ${SQLITE_PATH}"
  SQLITE_DIR="$(dirname "$SQLITE_PATH")"
  mkdir -p "$SQLITE_DIR"
  # Create file if missing, then set ownership/permissions
  touch "$SQLITE_PATH" || true
  chown webapp:webapp "$SQLITE_PATH" "$SQLITE_DIR" 2>/dev/null || true
  chmod 775 "$SQLITE_DIR" || true
  chmod 664 "$SQLITE_PATH" || true

  echo "[postdeploy] Running Django migrate/collectstatic as webapp (SQLite)"
  $RUN_AS_WEBAPP 'cd /var/app/current/backend && python manage.py migrate --noinput || true'
  $RUN_AS_WEBAPP 'cd /var/app/current/backend && python manage.py collectstatic --noinput || true'
else
  echo "[postdeploy] Using Postgres; running migrate/collectstatic normally"
  python manage.py migrate --noinput || true
  python manage.py collectstatic --noinput || true
fi

echo "[postdeploy] 01_django_tasks.sh completed."
