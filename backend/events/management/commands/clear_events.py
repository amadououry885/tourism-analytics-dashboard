# backend/events/management/commands/clear_events.py
from django.core.management.base import BaseCommand
from events.models import Event, EventRegistration, EventReminder


class Command(BaseCommand):
    help = 'Clear all events and related data (for fixing production database)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion of all events',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(self.style.WARNING(
                'This will DELETE ALL EVENTS. Run with --confirm to proceed.'
            ))
            return
        
        # Delete related data first
        reminder_count = EventReminder.objects.count()
        registration_count = EventRegistration.objects.count()
        event_count = Event.objects.count()
        
        EventReminder.objects.all().delete()
        EventRegistration.objects.all().delete()
        Event.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS(
            f'✅ Deleted {event_count} events, {registration_count} registrations, and {reminder_count} reminders'
        ))
