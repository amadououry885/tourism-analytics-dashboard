#!/usr/bin/env bash
set -euo pipefail
cd /var/app/current
. /var/app/venv/*/bin/activate

# Ensure Django can import your settings
export DJANGO_SETTINGS_MODULE=tourism_api.settings
export PYTHONPATH=/var/app/current/backend:$PYTHONPATH

python - <<'PY'
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.environ.get("DJANGO_SETTINGS_MODULE","tourism_api.settings"))
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
email    = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "change-me")

u, created = User.objects.get_or_create(
    username=username,
    defaults={"email": email, "is_staff": True, "is_superuser": True},
)
# Update flags/password each deploy to be safe
u.email = email
u.is_staff = True
u.is_superuser = True
u.set_password(password)
u.save()
print(f"[superuser] {username} {'created' if created else 'updated'}")
PY
