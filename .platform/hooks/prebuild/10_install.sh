#!/usr/bin/env bash
set -euo pipefail
VENV_ACTIVATE=$(echo /var/app/venv/*/bin/activate)
REQ=/var/app/staging/requirements.txt
if [ -f "$VENV_ACTIVATE" ]; then
  . "$VENV_ACTIVATE"
  echo "[prebuild] $(python -V) / $(pip --version)"
  if [ -f "$REQ" ]; then
    pip install --no-cache-dir -r "$REQ"
  else
    echo "[prebuild] requirements.txt not found at $REQ"
    exit 1
  fi
else
  echo "[prebuild] No EB venv found"
  exit 1
fi
