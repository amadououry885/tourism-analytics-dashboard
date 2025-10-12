#!/usr/bin/env bash
set -euo pipefail
VENV_ACTIVATE=$(echo /var/app/venv/*/bin/activate)
if [ -f "$VENV_ACTIVATE" ]; then
  . "$VENV_ACTIVATE"
  echo "[prebuild] Using venv: $(python -V) @ $(which python)"
  pip install --no-cache-dir -r /var/app/staging/requirements.txt
else
  echo "[prebuild] No EB venv found; using system python"
  python3 -m pip install --no-cache-dir -r /var/app/staging/requirements.txt
fi
