#!/usr/bin/env bash
set -u
set -o pipefail

# App checkout location on EB
cd /var/app/current/backend || exit 0

# Activate EB app venv
if ls /var/app/venv/*/bin/activate >/dev/null 2>&1; then
  # shellcheck source=/dev/null
  source /var/app/venv/*/bin/activate
fi

# 1) Create target DB if it doesn't exist (connect to 'postgres' maintenance DB)
python - <<'PY'
import os, sys
import psycopg2

host = os.environ.get("DB_HOST")
user = os.environ.get("DB_USER")
pwd  = os.environ.get("DB_PASSWORD")
port = os.environ.get("DB_PORT", "5432")
target_db = os.environ.get("DB_NAME", "tourism")

if not (host and user and pwd):
    sys.exit(0)  # no creds; skip quietly

try:
    conn = psycopg2.connect(host=host, user=user, password=pwd, port=port, dbname="postgres")
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname=%s", (target_db,))
    exists = cur.fetchone() is not None
    if not exists:
        cur.execute(f'CREATE DATABASE "{target_db}" OWNER %s', (user,))
    cur.close(); conn.close()
except Exception as e:
    # Don't fail deploy while stabilizing; print for logs
    print("DB bootstrap warning:", e)
PY

# 2) Run Django migrations & collectstatic (non-fatal while stabilizing)
python manage.py migrate --noinput || true
python manage.py collectstatic --noinput || true
