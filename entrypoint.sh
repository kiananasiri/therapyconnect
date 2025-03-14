#!/bin/sh

echo "DOMAIN is set to: $DOMAIN"

if [ -z "$DOMAIN" ]; then
  echo "ERROR: DOMAIN environment variable is not set!"
  exit 1
fi

if [ ! -f /etc/nginx/conf.d/default.conf.template ]; then
  echo "ERROR: Template file /etc/nginx/conf.d/default.conf.template not found!"
  exit 1
fi

echo "Template content:"
cat /etc/nginx/conf.d/default.conf.template

echo "Generating NGINX configuration..."
envsubst '$DOMAIN' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

if [ $? -ne 0 ]; then
  echo "ERROR: Failed to generate NGINX configuration!"
  exit 1
fi

echo "Generated configuration:"
cat /etc/nginx/conf.d/default.conf

echo "Starting NGINX..."
nginx -g 'daemon off;'