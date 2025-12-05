"""
Celery tasks for recurring events management
"""
from celery import shared_task
from django.utils.timezone import now
from datetime import timedelta
from .models import Event


@shared_task
def generate_next_recurring_instances():
    """
    Periodic task to create next instances for recurring events that have ended.
    Should run every hour via Celery Beat.
    """
    current_time = now()
    
    # Find all parent recurring events that have ended
    ended_recurring_events = Event.objects.filter(
        recurrence_type__in=['daily', 'weekly', 'monthly', 'yearly'],
        is_recurring_instance=False,
        end_date__lt=current_time,
        is_published=True
    )
    
    created_count = 0
    for parent_event in ended_recurring_events:
        # Calculate next occurrence date
        next_start = None
        if parent_event.recurrence_type == 'daily':
            # For daily events, keep adding days until we get a future date
            days_passed = (current_time.date() - parent_event.start_date.date()).days
            next_start = parent_event.start_date + timedelta(days=days_passed + 1)
        elif parent_event.recurrence_type == 'weekly':
            weeks_passed = (current_time.date() - parent_event.start_date.date()).days // 7
            next_start = parent_event.start_date + timedelta(weeks=weeks_passed + 1)
        elif parent_event.recurrence_type == 'monthly':
            from dateutil.relativedelta import relativedelta
            months_passed = ((current_time.year - parent_event.start_date.year) * 12 + 
                           (current_time.month - parent_event.start_date.month))
            next_start = parent_event.start_date + relativedelta(months=months_passed + 1)
        elif parent_event.recurrence_type == 'yearly':
            from dateutil.relativedelta import relativedelta
            years_passed = current_time.year - parent_event.start_date.year
            next_start = parent_event.start_date + relativedelta(years=years_passed + 1)
        
        if next_start and next_start > current_time:
            # Check if recurrence end date is set and we've passed it
            if parent_event.recurrence_end_date and next_start.date() > parent_event.recurrence_end_date:
                continue
            
            # Check if this instance already exists
            existing = Event.objects.filter(
                parent_event=parent_event,
                start_date__date=next_start.date()
            ).exists()
            
            if not existing:
                # Calculate end date
                duration = parent_event.end_date - parent_event.start_date if parent_event.end_date else timedelta(hours=2)
                next_end = next_start + duration
                
                # Create the next instance
                Event.objects.create(
                    title=parent_event.title,
                    description=parent_event.description,
                    start_date=next_start,
                    end_date=next_end,
                    location_name=parent_event.location_name,
                    city=parent_event.city,
                    lat=parent_event.lat,
                    lon=parent_event.lon,
                    tags=parent_event.tags,
                    expected_attendance=parent_event.expected_attendance,
                    is_published=parent_event.is_published,
                    image_url=parent_event.image_url,
                    created_by=parent_event.created_by,
                    max_capacity=parent_event.max_capacity,
                    parent_event=parent_event,
                    is_recurring_instance=True,
                    recurrence_type='none'
                )
                created_count += 1
    
    return f"Created {created_count} recurring event instances"


@shared_task
def cleanup_old_recurring_instances(days=90):
    """
    Clean up old recurring instances to prevent database bloat.
    Keep the parent events, only delete old instances.
    """
    cutoff_date = now() - timedelta(days=days)
    
    deleted = Event.objects.filter(
        is_recurring_instance=True,
        end_date__lt=cutoff_date
    ).delete()
    
    return f"Deleted {deleted[0]} old recurring instances older than {days} days"
