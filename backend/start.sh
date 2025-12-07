#!/bin/bash
set -e

echo "🔧 Starting Django backend..."

# Create staticfiles directory if it doesn't exist
mkdir -p staticfiles

# Collect static files (don't fail if it doesn't work)
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear || echo "Warning: Static files collection failed, continuing..."

# Run database migrations
echo "🗄️  Running database migrations..."
python manage.py migrate --noinput

# Start Gunicorn (remove the database check that might be slow)
echo "🚀 Starting Gunicorn..."
exec gunicorn --bind :8000 --workers 2 --timeout 120 --access-logfile - --error-logfile - tourism_api.wsgi:application
