# backend/events/management/commands/test_db.py
from django.core.management.base import BaseCommand
from events.models import Event


class Command(BaseCommand):
    help = 'Test database connectivity and event count'

    def handle(self, *args, **options):
        try:
            total_events = Event.objects.count()
            non_recurring = Event.objects.filter(is_recurring_instance=False).count()
            recurring_instances = Event.objects.filter(is_recurring_instance=True).count()
            with_creator = Event.objects.filter(created_by__isnull=False).count()
            without_creator = Event.objects.filter(created_by__isnull=True).count()
            
            self.stdout.write(f'Total events: {total_events}')
            self.stdout.write(f'Non-recurring: {non_recurring}')
            self.stdout.write(f'Recurring instances: {recurring_instances}')
            self.stdout.write(f'With created_by: {with_creator}')
            self.stdout.write(f'Without created_by: {without_creator}')
            
            # Try to serialize first 3 events
            self.stdout.write('\nFirst 3 events:')
            for event in Event.objects.all()[:3]:
                creator = event.created_by.username if event.created_by else 'None'
                self.stdout.write(f'  - {event.title} (creator: {creator})')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
