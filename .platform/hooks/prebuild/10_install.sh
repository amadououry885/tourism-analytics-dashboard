#!/usr/bin/env bash
set -euo pipefail
VENV_ACTIVATE=$(echo /var/app/venv/*/bin/activate)
if [ -f "$VENV_ACTIVATE" ]; then
  . "$VENV_ACTIVATE"
  echo "[prebuild] Python: $(python -V)  Pip: $(pip --version)"
  # install the root requirements.txt that you just created (has gunicorn, django, etc.)
  pip install --no-cache-dir -r /var/app/staging/requirements.txt
else
  echo "[prebuild] No EB venv found; fallback to system python"
  python3 -m pip install --no-cache-dir -r /var/app/staging/requirements.txt
fi
