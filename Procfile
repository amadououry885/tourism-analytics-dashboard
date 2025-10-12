web: sh -lc '
  set -euxo pipefail

  echo "=== runtime info ==="
  which python || true
  python -V || true
  pip show gunicorn || true
  ls -la || true
  echo "=== env skim ==="
  env | egrep "DJANGO|DB_|RDS_|ALLOWED|DEBUG|PORT" || true

  echo "=== sanity: backend present? ==="
  test -f backend/manage.py
  test -f backend/tourism_api/wsgi.py
  test -f backend/tourism_api/settings.py

  echo "=== Django manage.py check ==="
  python - <<PY
import os, sys
os.environ.setdefault("DJANGO_SETTINGS_MODULE","tourism_api.settings")
sys.path.insert(0, "backend")
from django.core.management import execute_from_command_line
execute_from_command_line(["manage.py","check"])
PY

  echo "=== starting gunicorn ==="
  export DJANGO_SETTINGS_MODULE=tourism_api.settings
  exec gunicorn --chdir backend tourism_api.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 2 --threads 2 --timeout 60 \
    --access-logfile - --error-logfile - --log-level info
'
