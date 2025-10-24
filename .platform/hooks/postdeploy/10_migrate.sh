#!/usr/bin/env bash
set -euo pipefail
cd /var/app/current/backend
source /var/app/venv/*/bin/activate
python manage.py migrate --noinput
if [[ -n "${DJANGO_SUPERUSER_USERNAME:-}" && -n "${DJANGO_SUPERUSER_EMAIL:-}" && -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]]; then
  python manage.py createsuperuser --noinput || true
fi
echo "[postdeploy] migrate + optional superuser done"
