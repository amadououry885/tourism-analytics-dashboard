# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
import os

# Only load Celery if Redis is configured (prevents crashes on Render without Redis)
if os.environ.get('REDIS_URL') or os.environ.get('CELERY_BROKER_URL'):
    try:
        from .celery import app as celery_app
        __all__ = ('celery_app',)
    except Exception as e:
        # Celery failed to initialize, skip (allows app to run without Celery)
        print(f"⚠️ Celery initialization skipped: {e}")
        __all__ = ()
else:
    # No Redis configured, skip Celery entirely
    print("⚠️ Celery disabled: No REDIS_URL or CELERY_BROKER_URL environment variable")
    __all__ = ()
