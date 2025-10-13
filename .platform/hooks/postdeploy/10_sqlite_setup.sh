#!/usr/bin/env bash
set -euxo pipefail

APP_DIR="/var/app/current/backend"
DB_DIR="/var/app/data"
DB_FILE="${SQLITE_PATH:-$DB_DIR/tourism.sqlite3}"

# Ensure persistent dir exists and belongs to the app user
mkdir -p "$DB_DIR"
chown -R webapp:webapp "$DB_DIR"

# Find the current EB python binary
PY_BIN="$(/usr/bin/readlink -f /var/app/venv/*/bin/python || command -v python3)"

cd "$APP_DIR"

# Run migrations as the app user
sudo -u webapp "$PY_BIN" manage.py migrate --noinput

# Create superuser once if env vars provided and user doesn't exist (safe to run every deploy)
if [[ -n "${DJANGO_SUPERUSER_USERNAME:-}" && -n "${DJANGO_SUPERUSER_EMAIL:-}" && -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]]; then
  sudo -u webapp "$PY_BIN" manage.py shell <<'PYCODE'
from django.contrib.auth import get_user_model
import os
User = get_user_model()
u = os.environ["DJANGO_SUPERUSER_USERNAME"]
e = os.environ["DJANGO_SUPERUSER_EMAIL"]
p = os.environ["DJANGO_SUPERUSER_PASSWORD"]
if not User.objects.filter(username=u).exists():
    User.objects.create_superuser(u, e, p)
PYCODE
fi
