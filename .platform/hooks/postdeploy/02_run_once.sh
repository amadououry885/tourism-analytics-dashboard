#!/usr/bin/env bash
set -euo pipefail
cd /var/app/current/backend

# Activate EB venv
if ls /var/app/venv/*/bin/activate >/dev/null 2>&1; then
  # shellcheck disable=SC1090
  source /var/app/venv/*/bin/activate
fi

# Safe to run multiple times
python manage.py migrate --noinput || true
python manage.py collectstatic --noinput || true

# Optional: create admin if env vars are set
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

echo "[postdeploy] 02_run_once.sh completed."
