#!/usr/bin/env bash
set -euo pipefail

# Directories Nginx uses on EB AL2023
DIRS=(
  /etc/nginx/conf.d/elasticbeanstalk
  /var/proxy/nginx/conf.d/elasticbeanstalk
  /var/proxy/staging/nginx/conf.d/elasticbeanstalk
  /etc/nginx/conf.d
  /var/proxy/nginx/conf.d
  /var/proxy/staging/nginx/conf.d
)

# 1) Remove obvious redirect files if present
for d in "${DIRS[@]}"; do
  if [[ -d "$d" ]]; then
    sudo rm -f "$d"/*https*redirect*.conf || true
    sudo rm -f "$d"/https_redirect.conf   || true
  fi
done

# 2) Comment out any inline redirect rules like:
#    - return 301 https://$host$request_uri;
#    - if ($http_x_forwarded_proto != "https") { return 301 ... }
for d in "${DIRS[@]}"; do
  if [[ -d "$d" ]]; then
    for f in $(sudo /bin/sh -c "ls -1 $d/*.conf 2>/dev/null" || true); do
      # Only touch if the file actually contains a redirect to https
      if sudo grep -qiE 'return +301 +https://|\$http_x_forwarded_proto.*return +301' "$f"; then
        echo "Neutralizing redirect in $f"
        sudo cp "$f" "$f.bak" || true
        # Comment lines with 'return 301 ... https'
        sudo sed -i -E 's/^\s*(return\s+301\s+https:\/\/.*);/# \1/Ig' "$f"
        # Comment the common conditional block
        sudo sed -i -E 's/^\s*if\s*\(\s*\$http_x_forwarded_proto\s*!\=\s*"https"\s*\)\s*\{\s*return\s+301\s+[^;]+;\s*\}/# disabled https redirect block/Ig' "$f"
      fi
    done
  fi
done

# 3) Validate & reload Nginx
sudo nginx -t
sudo systemctl reload nginx
