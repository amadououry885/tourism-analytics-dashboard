web: cd backend && python manage.py migrate --noinput && gunicorn --bind :8000 --workers 2 --timeout 120 --log-level debug tourism_api.wsgi:application
