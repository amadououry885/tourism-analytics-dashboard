#!/usr/bin/env bash
# Minimal, non-failing hook for SQLite perms
# (no set -e; everything best-effort)
cd /var/app/current/backend 2>/dev/null || true

# Use the same defaults as settings.py
SQLITE_PATH="${SQLITE_PATH:-/tmp/tourism.sqlite3}"
USE_SQLITE="${USE_SQLITE:-0}"

if [ "$USE_SQLITE" = "1" ]; then
  touch "$SQLITE_PATH" 2>/dev/null || true
  chmod 666 "$SQLITE_PATH" 2>/dev/null || true
  if id webapp >/dev/null 2>&1; then
    chown webapp:webapp "$SQLITE_PATH" 2>/dev/null || true
    chmod 664 "$SQLITE_PATH" 2>/dev/null || true
  fi
  echo "[postdeploy] sqlite perms ensured at $SQLITE_PATH"
else
  echo "[postdeploy] USE_SQLITE!=1; skipping sqlite perms."
fi

# Don’t run migrate here; your app already works on SQLite without it.
