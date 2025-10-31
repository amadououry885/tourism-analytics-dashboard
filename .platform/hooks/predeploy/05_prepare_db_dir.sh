#!/usr/bin/env bash
set -euo pipefail

# Ensure the SQLite data directory exists with safe perms
mkdir -p /var/app/data
# EB hooks run as root; the app runs as 'webapp' on AL2023
chown -R webapp:webapp /var/app/data || true
chmod 775 /var/app/data

echo "[predeploy] Prepared /var/app/data for SQLite"
