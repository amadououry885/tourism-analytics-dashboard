#!/usr/bin/env bash
# Do NOT fail deploy if something errors
set +e

echo "===== DEBUG DUMP START ====="
echo "Date: $(date)"

echo "--- /etc/systemd/system/web.service (exists?) ---"
ls -l /etc/systemd/system/web.service || true

echo "--- systemctl status web ---"
systemctl status web --no-pager || true

echo "--- journalctl -u web (last 200 lines) ---"
journalctl -u web -n 200 --no-pager || true

echo "--- processes: gunicorn & python ---"
ps aux | egrep 'gunicorn|python' | grep -v egrep || true

echo "--- listeners on 8000 ---"
ss -ltnp | grep ':8000' || echo 'nothing listening on 8000'

echo "--- Procfile content ---"
sed -n '1,120p' /var/app/current/Procfile || true

echo "--- environment (PORT, DJANGO_*, DB_*) ---"
env | egrep '^(PORT=|DJANGO_|DB_|RDS_)' | sort || true

echo "--- curl localhost:8000/healthz ---"
curl -sS -i http://127.0.0.1:8000/healthz | sed -n '1,20p' || true

echo "===== DEBUG DUMP END ====="
