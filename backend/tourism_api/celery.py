import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')

app = Celery('backend')

# Load config from Django settings, using the CELERY namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# ✅ SCHEDULE: Define when tasks should run
app.conf.beat_schedule = {
    # Run social media collection every 2 hours
    'collect-social-media-every-2-hours': {
        'task': 'analytics.tasks.collect_and_process_social_posts',
        'schedule': crontab(minute=0, hour='*/2'),  # Every 2 hours
    },
    
    # ✨ NEW: Generate next recurring event instances every hour
    'generate-recurring-events-hourly': {
        'task': 'events.tasks.generate_next_recurring_instances',
        'schedule': crontab(minute=0, hour='*/1'),  # Every hour
    },
    
    # ✨ NEW: Clean up old recurring instances weekly
    'cleanup-old-recurring-instances': {
        'task': 'events.tasks.cleanup_old_recurring_instances',
        'schedule': crontab(minute=0, hour=0, day_of_week=0),  # Every Sunday at midnight
    },
    
    # Alternative schedules you can use:
    # 'collect-social-media-hourly': {
    #     'task': 'analytics.tasks.collect_and_process_social_posts',
    #     'schedule': crontab(minute=0, hour='*/1'),  # Every hour
    # },
    
    # 'collect-social-media-daily': {
    #     'task': 'analytics.tasks.collect_and_process_social_posts',
    #     'schedule': crontab(minute=0, hour=0),  # Daily at midnight
    # },
}

app.conf.timezone = 'Asia/Kuala_Lumpur'  # Your timezone
