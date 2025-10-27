#!/usr/bin/env bash
set -euo pipefail
cd /var/app/current/backend
/var/app/venv/*/bin/python manage.py collectstatic --noinput
echo "[postdeploy] collectstatic done"
