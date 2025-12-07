#!/bin/bash
set -e

echo "🔧 Starting Django backend..."

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Run database migrations
echo "🗄️  Running database migrations..."
python manage.py migrate --noinput

# Check database connection
echo "✅ Checking database..."
python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print('Database connected!')"

# Start Gunicorn
echo "🚀 Starting Gunicorn..."
exec gunicorn --bind :8000 --workers 2 --timeout 120 tourism_api.wsgi:application
