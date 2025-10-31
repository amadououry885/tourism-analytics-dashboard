#!/usr/bin/env bash
set -euo pipefail

echo "[repair] Starting analytics migration repair..."

# Go to Django app
cd /var/app/current/backend || { echo "[repair] backend dir missing"; exit 1; }

# Activate venv if present
if compgen -G "/var/app/venv/*/bin/activate" > /dev/null; then
  # shellcheck disable=SC1090
  source /var/app/venv/*/bin/activate
fi

export DJANGO_SETTINGS_MODULE=tourism_api.settings

# Show DB in use (sanity)
python - <<'PY'
import django, os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tourism_api.settings")
django.setup()
from django.conf import settings
print("[repair] DB:", settings.DATABASES['default']['ENGINE'], settings.DATABASES['default']['NAME'])
PY

# If analytics_place is missing but 0001 is marked applied, reset analytics migrations safely.
missing_table=$(python - <<'PY'
import django, os
os.environ.setdefault("DJANGO_SETTINGS_MODULE","tourism_api.settings")
django.setup()
from django.db import connection
with connection.cursor() as c:
    c.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='analytics_place');")
    print("yes" if c.fetchone()[0] else "no")
PY
)

echo "[repair] analytics_place exists? $missing_table"

if [ "$missing_table" = "no" ]; then
  echo "[repair] Resetting analytics migration history (no SQL) ..."
  python manage.py migrate analytics zero --fake

  echo "[repair] Applying analytics migrations (real SQL) ..."
  python manage.py migrate analytics --noinput
else
  echo "[repair] Table exists—no repair needed."
fi

echo "[repair] Done."
