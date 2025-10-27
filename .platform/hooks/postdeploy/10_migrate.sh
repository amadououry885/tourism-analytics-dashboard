#!/usr/bin/env bash
set -euo pipefail
echo "[postdeploy] Running Django migrations…"
cd /var/app/current/backend

# activate EB venv (matches 'staging-' or other)
if compgen -G "/var/app/venv/*/bin/activate" > /dev/null; then
  # shellcheck source=/dev/null
  source /var/app/venv/*/bin/activate
else
  echo "[postdeploy] Could not find EB virtualenv" >&2
  exit 1
fi

python manage.py migrate --noinput
echo "[postdeploy] Migrations complete."
