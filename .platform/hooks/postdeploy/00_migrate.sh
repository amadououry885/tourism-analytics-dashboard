#!/usr/bin/env bash
set -euo pipefail

echo "[postdeploy] START migrate"

# 1) cd into your Django app and activate EB's venv
cd /var/app/current/backend || { echo "[postdeploy] backend dir missing"; exit 1; }
if compgen -G "/var/app/venv/*/bin/activate" > /dev/null; then
  # shellcheck disable=SC1090
  source /var/app/venv/*/bin/activate
fi

export DJANGO_SETTINGS_MODULE=tourism_api.settings
export PYTHONPATH="/var/app/current/backend:${PYTHONPATH:-}"

# 2) Print DB being used (sanity in logs)
python - <<'PY'
import os, django
django.setup()
from django.conf import settings
db = settings.DATABASES['default']
print(f"[db.engine] {db['ENGINE']}")
print(f"[db.name]   {db.get('NAME')}")
print(f"[db.user]   {db.get('USER')}")
print(f"[db.host]   {db.get('HOST')}")
print(f"[db.port]   {db.get('PORT')}")
PY

# 3) Plain, idempotent migrate (will do nothing if up-to-date)
echo "[postdeploy] Running migrate --noinput"
python manage.py migrate --noinput

# 4) (Optional) collectstatic AFTER migrate if you like (either here or a separate hook)
# python manage.py collectstatic --noinput

echo "[postdeploy] DONE migrate"
