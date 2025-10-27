#!/usr/bin/env bash
set -euo pipefail
cd /var/app/current
. /var/app/venv/*/bin/activate

echo "[migrate] settings: $DJANGO_SETTINGS_MODULE"

# Show DB engine/path and tables BEFORE
python - <<'PY'
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.environ.get("DJANGO_SETTINGS_MODULE","backend.settings"))
django.setup()
from django.conf import settings
from django.db import connection
print("[db]", settings.DATABASES["default"]["ENGINE"], settings.DATABASES["default"]["NAME"])
print("[tables_before]", sorted(connection.introspection.table_names()))
PY

# Apply migrations (analytics first, then all)
python backend/manage.py migrate analytics --noinput
python backend/manage.py migrate --noinput
python backend/manage.py showmigrations analytics

# Show tables AFTER
python - <<'PY'
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.environ.get("DJANGO_SETTINGS_MODULE","backend.settings"))
django.setup()
from django.db import connection
print("[tables_after]", sorted(connection.introspection.table_names()))
PY

# Collect static
python backend/manage.py collectstatic --noinput
