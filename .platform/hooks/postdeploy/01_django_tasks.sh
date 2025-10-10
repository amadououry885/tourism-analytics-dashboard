#!/bin/bash
set -euo pipefail

# EB puts your code at /var/app/current
cd /var/app/current/backend

# Activate EB's application venv (patterned path)
# This expands to /var/app/venv/<random>/bin/activate
source /var/app/venv/*/bin/activate

# Run Django tasks; don't fail the whole deploy while we're stabilizing
python manage.py migrate --noinput || true
python manage.py collectstatic --noinput || true
