#!/usr/bin/env bash
set -euo pipefail

# Log to EB engine log
echo "[postdeploy] Running Django migrate & collectstatic..."

# Activate EB venv & run commands inside backend/
source /var/app/venv/*/bin/activate
cd /var/app/current/backend

python manage.py migrate --noinput
python manage.py collectstatic --noinput || true

echo "[postdeploy] Done."
