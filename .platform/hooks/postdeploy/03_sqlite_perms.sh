#!/usr/bin/env bash
set -euo pipefail

SQLITE_PATH="${SQLITE_PATH:-/var/app/data/tourism.sqlite3}"
mkdir -p "$(dirname "$SQLITE_PATH")"

# EB app user is 'webapp'
sudo chown -R webapp:webapp "$(dirname "$SQLITE_PATH")"
sudo touch "$SQLITE_PATH" || true
sudo chown webapp:webapp "$SQLITE_PATH"
sudo chmod 664 "$SQLITE_PATH"
echo "[03_sqlite_perms] ensured ownership and perms for $SQLITE_PATH"
