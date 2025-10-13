#!/usr/bin/env bash
set -euo pipefail

# Remove any old HTTPS-redirect snippets that may be left from earlier deploys.
for dir in \
  /etc/nginx/conf.d/elasticbeanstalk \
  /var/proxy/staging/nginx/conf.d/elasticbeanstalk \
  /var/proxy/nginx/conf.d/elasticbeanstalk
do
  if [ -d "$dir" ]; then
    sudo rm -f "$dir"/*https*redirect*.conf || true
    sudo rm -f "$dir"/https_redirect.conf   || true
  fi
done

# Sanity check & reload nginx
sudo nginx -t
sudo systemctl reload nginx
