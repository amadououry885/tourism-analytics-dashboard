#!/usr/bin/env bash
# Do NOT fail the deploy if any command errors
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
echo "--- env subset (PORT, DJANGO_*, DB_*) ---"
printenv | egrep '^(PORT|DJANGO_|DB_)' | sort || true
echo "===== DEBUG DUMP END ====="
