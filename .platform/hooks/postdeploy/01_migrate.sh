#!/usr/bin/env bash
set -euxo pipefail
VENV_BIN=$(ls -d /var/app/venv/*/bin | head -n1)
PY="$VENV_BIN/python"
cd /var/app/current
$PY backend/manage.py migrate --noinput
