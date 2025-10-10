#!/bin/bash
set -euo pipefail

# EB checks out your app to /var/app/current
cd /var/app/current/backend

# Activate EB's venv (pattern uses the random directory EB creates)
source /var/app/venv/*/bin/activate

# Run Django tasks (won't fail deploy while we stabilize)
python manage.py migrate --noinput || true
python manage.py collectstatic --noinput || true
