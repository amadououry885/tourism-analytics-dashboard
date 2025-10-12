
#!/usr/bin/env bash
# Robust postdeploy that works whether or not sudo/runuser are present
set -euo pipefail
cd /var/app/current/backend

# Activate EB venv
if ls /var/app/venv/*/bin/activate >/dev/null 2>&1; then
  # shellcheck disable=SC1090
  source /var/app/venv/*/bin/activate
fi

USE_SQLITE="${USE_SQLITE:-0}"
SQLITE_PATH="${SQLITE_PATH:-/tmp/tourism.sqlite3}"

# Helper: try to run as webapp if possible, else just run directly
as_webapp() {
  if command -v runuser >/dev/null 2>&1 && id webapp >/dev/null 2>&1; then
    runuser -u webapp -- "$@"
  elif command -v sudo >/dev/null 2>&1 && id webapp >/dev/null 2>&1; then
    sudo -u webapp -H "$@"
  else
    # Fallback: run as current user (root in hooks). We'll fix ownership after.
    "$@"
  fi
}

if [[ "$USE_SQLITE" == "1" ]]; then
  # Ensure DB file exists and is writable by webapp
  touch "$SQLITE_PATH"
  # Directory /tmp is writable; make sure file perms are generous the first time
  chmod 666 "$SQLITE_PATH" || true
  # If webapp user exists, make it owner (non-fatal if user/group missing)
  if id webapp >/dev/null 2>&1; then
    chown webapp:webapp "$SQLITE_PATH" || true
  fi

  # Run migrate/collectstatic (try as webapp; OK if it falls back)
  as_webapp python manage.py migrate --noinput || true
  as_webapp python manage.py collectstatic --noinput || true

  # Create superuser if env vars provided (same user strategy)
  as_webapp python - <<'PY'
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE","tourism_api.settings")
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
u = os.getenv("DJANGO_SUPERUSER_USERNAME", "")
e = os.getenv("DJANGO_SUPERUSER_EMAIL", "")
p = os.getenv("DJANGO_SUPERUSER_PASSWORD", "")
if u and e and p:
    if not User.objects.filter(username=u).exists():
        User.objects.create_superuser(u, e, p)
        print(f"[postdeploy] Created superuser: {u}")
    else:
        print(f"[postdeploy] Superuser '{u}' already exists.")
else:
    print("[postdeploy] Superuser vars not set; skipping.")
PY

  # FINAL FIX: after migrations (which might have re-created the file), ensure ownership again
  if id webapp >/dev/null 2>&1; then
    chown webapp:webapp "$SQLITE_PATH" || true
    chmod 664 "$SQLITE_PATH" || true
  fi

else
  # Postgres path — just do the usual
  python manage.py migrate --noinput || true
  python manage.py collectstatic --noinput || true

  python - <<'PY'
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE","tourism_api.settings")
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
u = os.getenv("DJANGO_SUPERUSER_USERNAME", "")
e = os.getenv("DJANGO_SUPERUSER_EMAIL", "")
p = os.getenv("DJANGO_SUPERUSER_PASSWORD", "")
if u and e and p:
    if not User.objects.filter(username=u).exists():
        User.objects.create_superuser(u, e, p)
        print(f"[postdeploy] Created superuser: {u}")
    else:
        print(f"[postdeploy] Superuser '{u}' already exists.")
else:
    print("[postdeploy] Superuser vars not set; skipping.")
PY
fi

echo "[postdeploy] 02_run_once.sh completed."
