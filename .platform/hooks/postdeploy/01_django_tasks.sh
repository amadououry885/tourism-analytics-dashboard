#!/usr/bin/env bash
# Safe, but do NOT exit the whole deploy on errors from these tasks.
set -u
set -o pipefail

# EB checks out your app to /var/app/current
cd /var/app/current/backend || exit 0

# Activate EB's application venv (randomized path)
if ls /var/app/venv/*/bin/activate >/dev/null 2>&1; then
  # shellcheck source=/dev/null
  source /var/app/venv/*/bin/activate
fi

# Run Django tasks (non-fatal while stabilizing)
python manage.py migrate --noinput || true
python manage.py collectstatic --noinput || true
