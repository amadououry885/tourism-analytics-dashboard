#!/bin/bash -xe
# Runs on the EB EC2 instance after each deploy (AL2023).

APP_DIR="/var/app/current"
DATA_DIR="/var/app/data"

# Ensure the SQLite data dir exists and is owned by the app user on EB
sudo mkdir -p "$DATA_DIR"
if id -u webapp >/dev/null 2>&1; then
  sudo chown webapp:webapp "$DATA_DIR"
fi

# Apply migrations against the currently deployed code
cd "$APP_DIR"
python manage.py migrate --noinput
