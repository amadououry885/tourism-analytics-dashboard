#!/usr/bin/env bash
set -euo pipefail
cd /var/app/current
. /var/app/venv/*/bin/activate

echo "[migrate] using settings: $DJANGO_SETTINGS_MODULE"
python backend/manage.py showmigrations analytics
python backend/manage.py migrate --noinput
python backend/manage.py showmigrations analytics

python backend/manage.py collectstatic --noinput

