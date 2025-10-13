#!/bin/bash
set -euo pipefail

PYBIN=$(ls /var/app/venv/*/bin/python | head -n1)
MANAGE="/var/app/current/backend/manage.py"

echo "[01_django_tasks] Running migrations..."
"$PYBIN" "$MANAGE" migrate --noinput

echo "[01_django_tasks] Collecting static..."
"$PYBIN" "$MANAGE" collectstatic --noinput

echo "[01_django_tasks] Done."
