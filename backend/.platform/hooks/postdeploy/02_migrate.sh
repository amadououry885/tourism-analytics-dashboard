#!/usr/bin/env bash
set -euo pipefail
log() { printf "[postdeploy] %s\n" "$*"; }
fail() { printf "[postdeploy][ERROR] %s\n" "$*" >&2; exit 1; }

log "START migrate"

APP_ROOT="/var/app/current"
[ -d "$APP_ROOT" ] || fail "App root missing at $APP_ROOT"

if compgen -G "/var/app/venv/*/bin/activate" >/dev/null; then
  # shellcheck disable=SC1090
  source /var/app/venv/*/bin/activate
  log "Activated EB venv"
else
  log "EB venv not found; relying on system python"
fi

DJANGO_DIR="$(dirname "$(find "$APP_ROOT" -maxdepth 2 -name manage.py -print -quit)")"
if [[ -z "$DJANGO_DIR" ]]; then
  DJANGO_DIR="$APP_ROOT/backend"
fi
[ -f "$DJANGO_DIR/manage.py" ] || fail "manage.py not found (looked in $DJANGO_DIR)"
cd "$DJANGO_DIR"

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-tourism_api.settings}"
export PYTHONPATH="${PYTHONPATH:-$APP_ROOT/backend:$APP_ROOT}"

python - <<'PY'
import django; django.setup()
from django.conf import settings
db = settings.DATABASES['default'].copy()
db.pop('PASSWORD', None)
print("[db.engine]", db.get('ENGINE'))
print("[db.name]  ", db.get('NAME'))
print("[db.user]  ", db.get('USER'))
print("[db.host]  ", db.get('HOST'))
print("[db.port]  ", db.get('PORT'))
PY

RETRIES="${DB_WAIT_RETRIES:-20}"
SLEEPSECS="${DB_WAIT_SLEEP:-3}"
i=0
until python manage.py check --database=default >/dev/null 2>&1; do
  i=$((i+1))
  if [ "$i" -ge "$RETRIES" ]; then
    fail "Database not reachable after $RETRIES attempts"
  fi
  log "DB not ready yet, retry $i/$RETRIES …"
  sleep "$SLEEPSECS"
done
log "DB reachable"

log "Running: manage.py migrate --noinput"
python manage.py migrate --noinput

if [[ "${COLLECTSTATIC:-0}" == "1" ]]; then
  log "Running: manage.py collectstatic --noinput"
  python manage.py collectstatic --noinput
else
  log "Skipping collectstatic (set COLLECTSTATIC=1 to enable)"
fi

if command -v curl >/dev/null 2>&1; then
  HEALTH_URL="${HEALTHCHECK_URL:-http://localhost/healthz}"
  log "Health probe: $HEALTH_URL"
  curl -fsS "$HEALTH_URL" && log "Health OK" || log "Health probe failed (non-fatal)"
fi

log "DONE migrate"
