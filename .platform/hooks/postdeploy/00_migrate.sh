#!/usr/bin/env bash
set -Eeuo pipefail

cd /var/app/current
. /var/app/venv/*/bin/activate

# Make sure Python can import the project package that lives in ./backend/
export PYTHONPATH="/var/app/current/backend:${PYTHONPATH:-}"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-tourism_api.settings}"

echo "[postdeploy] Python: $(python -V)"
echo "[postdeploy] Django settings: $DJANGO_SETTINGS_MODULE"
echo "[postdeploy] PYTHONPATH: $PYTHONPATH"

# helper
manage () { python backend/manage.py "$@"; }

# DB info + connectivity check
python - <<'PY'
import os, sys
print("[import] sys.path[0:3]:", sys.path[:3])
import django
django.setup()
from django.conf import settings
from django.db import connection
cfg = settings.DATABASES["default"]
print("[db.engine]", cfg.get("ENGINE"))
print("[db.name]",   cfg.get("NAME"))
print("[db.user]",   cfg.get("USER"))
print("[db.host]",   cfg.get("HOST"))
print("[db.port]",   cfg.get("PORT"))
with connection.cursor() as c:
    c.execute("SELECT 1")
print("[db.check] ok")
PY

echo "[postdeploy] showmigrations (before)"
manage showmigrations analytics || true

echo "[postdeploy] migrate analytics (v=3)"
manage migrate analytics --noinput -v 3

echo "[postdeploy] migrate all (v=2)"
manage migrate --noinput -v 2

echo "[postdeploy] showmigrations (after)"
manage showmigrations analytics || true

python - <<'PY'
import django, os
django.setup()
from django.db import connection
print("[tables_after]", sorted(connection.introspection.table_names()))
PY
