#!/bin/bash
set -euo pipefail
PYBIN=$(ls /var/app/venv/*/bin/python | head -n1)
MANAGE="/var/app/current/backend/manage.py"

if [ -n "${ADMIN_PASSWORD:-}" ]; then
  echo "[02_admin_password] Ensuring admin user exists and setting password..."
  "$PYBIN" "$MANAGE" shell <<'PY'
import os
from django.contrib.auth import get_user_model
User = get_user_model()
pwd = os.environ.get("ADMIN_PASSWORD")
u, created = User.objects.get_or_create(
    username="admin",
    defaults={"email": "admin@example.com", "is_staff": True, "is_superuser": True},
)
u.set_password(pwd)
u.save()
print(f"Admin user ready. Created={created}")
PY
else
  echo "[02_admin_password] ADMIN_PASSWORD not set; skipping."
fi
