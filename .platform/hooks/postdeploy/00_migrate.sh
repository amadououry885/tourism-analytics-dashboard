#!/usr/bin/env bash
set -euo pipefail

echo "[postdeploy] START migrate (with repair)"

cd /var/app/current/backend || { echo "[postdeploy] backend dir missing"; exit 1; }

# Activate EB venv if present
if compgen -G "/var/app/venv/*/bin/activate" > /dev/null; then
  # shellcheck disable=SC1090
  source /var/app/venv/*/bin/activate
fi

export DJANGO_SETTINGS_MODULE=tourism_api.settings
export PYTHONPATH="/var/app/current/backend:${PYTHONPATH:-}"

# Show DB settings (sanity)
python - <<'PY'
import django, os
os.environ.setdefault("DJANGO_SETTINGS_MODULE","tourism_api.settings")
django.setup()
from django.conf import settings
db = settings.DATABASES["default"]
print("[db.engine]", db["ENGINE"])
print("[db.name]", db.get("NAME"))
print("[db.user]", db.get("USER"))
print("[db.host]", db.get("HOST"))
print("[db.port]", db.get("PORT"))
PY

# --- REPAIR LOGIC: if analytics_place missing but 0001 is marked applied, reset analytics history then re-migrate analytics.
need_repair=$(python - <<'PY'
import django, os
os.environ.setdefault("DJANGO_SETTINGS_MODULE","tourism_api.settings")
django.setup()
from django.db import connection
def exists(sql, params=()):
    with connection.cursor() as c:
        c.execute(sql, params)
        return c.fetchone()[0]
has_table = exists("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='analytics_place');")
has_0001 = exists("SELECT EXISTS (SELECT 1 FROM django_migrations WHERE app='analytics' AND name='0001_initial');")
print("yes" if (not has_table and has_0001) else "no")
PY
)

echo "[repair] needed? $need_repair"

if [ "$need_repair" = "yes" ]; then
  echo "[repair] Resetting analytics migration history (fake to zero)..."
  python manage.py migrate analytics zero --fake
  echo "[repair] Re-applying analytics migrations (real SQL)..."
  python manage.py migrate analytics --noinput
fi

echo "[postdeploy] migrate all apps"
python manage.py migrate --noinput

echo "[postdeploy] showmigrations analytics (after)"
python manage.py showmigrations analytics

echo "[postdeploy] DONE migrate"
