#!/usr/bin/env bash
set -euo pipefail

# Ensure persistent dir for sqlite exists and is writable
mkdir -p /var/app/data
if id webapp >/dev/null 2>&1; then
  chown -R webapp:webapp /var/app/data
else
  chown -R ec2-user:ec2-user /var/app/data
fi
chmod 775 /var/app/data

# Activate venv and run migrations/static
cd /var/app/current
. /var/app/venv/*/bin/activate
python backend/manage.py migrate --noinput
python backend/manage.py collectstatic --noinput
echo "[postdeploy] migrate + collectstatic OK"
