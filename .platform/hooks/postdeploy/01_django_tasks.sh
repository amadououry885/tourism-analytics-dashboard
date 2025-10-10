#!/usr/bin/env bash
set -u
set -o pipefail

# Go to your app directory on the instance
cd /var/app/current/backend || exit 0

# Activate EB's venv
if ls /var/app/venv/*/bin/activate >/dev/null 2>&1; then
  # shellcheck source=/dev/null
  source /var/app/venv/*/bin/activate
fi

# 1) Create target DB if missing (connects to maintenance DB 'postgres')
python - <<'PY'
import os, psycopg2
host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
pwd  = os.getenv("DB_PASSWORD")
port = os.getenv("DB_PORT", "5432")
target_db = os.getenv("DB_NAME", "tourism")
if not (host and user and pwd): raise SystemExit(0)
conn = psycopg2.connect(host=host, user=user, password=pwd, port=port, dbname="postgres")
conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname=%s", (target_db,))
if not cur.fetchone():
    cur.execute(f'CREATE DATABASE "{target_db}" OWNER %s', (user,))
cur.close(); conn.close()
PY

# 2) Run Django tasks (non-fatal while stabilizing)
python manage.py migrate --noinput || true
python manage.py collectstatic --noinput || true
