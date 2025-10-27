#!/usr/bin/env bash
set -euo pipefail
VENV_BIN=$(ls -d /var/app/venv/*/bin | head -n1)
PY="$VENV_BIN/python"
cd /var/app/current

# Exit code 10 means: 0001 recorded as applied, but tables missing -> repair
$PY - <<'PYCODE'
import sys
from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE","backend.settings")
get_wsgi_application()

from django.db import connection
from django.apps import apps

def row_exists(sql, params=()):
    with connection.cursor() as c:
        c.execute(sql, params)
        return c.fetchone() is not None

applied_0001 = row_exists(
    "SELECT 1 FROM django_migrations WHERE app=%s AND name=%s",
    ("analytics","0001_initial")
)

tables = set(connection.introspection.table_names())
missing_tables = {"analytics_socialpost","analytics_place"} - tables

# Signal to shell what to do
sys.exit(10 if (applied_0001 and missing_tables) else 0)
PYCODE

case $? in
  10)
    echo "[repair] analytics drift detected. Resetting and reapplying 0001..."
    $PY backend/manage.py migrate analytics zero --fake --noinput
    $PY backend/manage.py migrate analytics 0001_initial --noinput
    ;;
  0)
    echo "[repair] no drift detected."
    ;;
  *)
    echo "[repair] unexpected check error" >&2
    exit 1
    ;;
esac
