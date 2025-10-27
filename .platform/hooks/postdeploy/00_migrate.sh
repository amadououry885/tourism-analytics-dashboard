#!/usr/bin/env bash
set -euo pipefail
cd /var/app/current
. /var/app/venv/*/bin/activate
python backend/manage.py migrate --noinput
python backend/manage.py collectstatic --noinput
