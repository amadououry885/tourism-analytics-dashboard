#!/usr/bin/env bash
set -euxo pipefail
VENV_BIN=$(ls -d /var/app/venv/*/bin | head -n1)
PY="$VENV_BIN/python"
cd /var/app/current
$PY -V || true
$PY backend/manage.py migrate --noinput
# If you use static files later, you can enable:
# $PY backend/manage.py collectstatic --noinput || true
