"""
Signals for automatic recurring event instance generation
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta
from .models import Event


@receiver(post_save, sender=Event)
def generate_initial_recurring_instances(sender, instance, created, **kwargs):
    """
    When a recurring event is created, automatically generate the next instance
    """
    if created and instance.recurrence_type != 'none' and not instance.is_recurring_instance:
        # Generate just 1 next instance initially (to show in "Upcoming Events")
        instance.generate_recurring_instances(count=1)


def create_next_recurring_instance(event):
    """
    Create the next recurring instance when the current one ends
    Should be called by a periodic task (Celery beat)
    """
    if event.recurrence_type == 'none' or event.is_recurring_instance:
        return None
    
    # Check if event has ended
    if event.end_date and event.end_date < now():
        # Check if next instance already exists
        next_start = None
        if event.recurrence_type == 'daily':
            next_start = event.start_date + timedelta(days=1)
        elif event.recurrence_type == 'weekly':
            next_start = event.start_date + timedelta(weeks=1)
        elif event.recurrence_type == 'monthly':
            from dateutil.relativedelta import relativedelta
            next_start = event.start_date + relativedelta(months=1)
        elif event.recurrence_type == 'yearly':
            from dateutil.relativedelta import relativedelta
            next_start = event.start_date + relativedelta(years=1)
        
        if next_start:
            # Check if instance doesn't already exist
            existing = Event.objects.filter(
                parent_event=event,
                start_date__date=next_start.date()
            ).exists()
            
            if not existing:
                # Create the next instance
                instance = event.generate_recurring_instances(count=1)
                return instance[0] if instance else None
    
    return None
