#!/usr/bin/env bash
set -euo pipefail
mkdir -p /var/app/data
if id webapp >/dev/null 2>&1; then
  chown -R webapp:webapp /var/app/data
else
  chown -R ec2-user:ec2-user /var/app/data
fi
echo "[postdeploy] ensured /var/app/data exists and is writable"
