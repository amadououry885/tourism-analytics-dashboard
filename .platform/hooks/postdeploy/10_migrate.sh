#!/usr/bin/env bash
set -euo pipefail

echo "[postdeploy] Running Django migrate & collectstatic..."
source /var/app/venv/*/bin/activate
cd /var/app/current/backend
python manage.py migrate --noinput
python manage.py collectstatic --noinput || true
echo "[postdeploy] Done."
