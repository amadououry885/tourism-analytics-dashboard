web: sh -lc 'cd backend && exec gunicorn tourism_api.wsgi:application --bind 127.0.0.1:8000 --workers 2 --threads 2 --timeout 60 --access-logfile - --error-logfile - --log-level info'
