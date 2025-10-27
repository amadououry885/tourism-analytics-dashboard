#!/usr/bin/env bash
set -euxo pipefail

# EB’s staging venv name changes per deploy; resolve it dynamically:
VENV_BIN=$(ls -d /var/app/venv/*/bin | head -n1)
PY="$VENV_BIN/python"
PIP="$VENV_BIN/pip"

cd /var/app/current

# Log versions & where we are
$PY -V || true
$PIP -V || true
pwd; ls -la

# Run migrations with no input; be explicit about the manage.py location
$PY backend/manage.py migrate --noinput

# (Optional) collectstatic only if you actually use it
# $PY backend/manage.py collectstatic --noinput || true
