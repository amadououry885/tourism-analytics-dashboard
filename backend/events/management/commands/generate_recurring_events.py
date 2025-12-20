"""
Management command to generate recurring event instances
Usage: python manage.py generate_recurring_events
"""
from django.core.management.base import BaseCommand
from django.utils.timezone import now
from events.models import Event


class Command(BaseCommand):
    help = 'Generate upcoming instances for all recurring events'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=6,
            help='Number of future instances to generate per recurring event',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Regenerate instances even if they already exist',
        )

    def handle(self, *args, **options):
        count = options['count']
        force = options['force']
        
        # Find all parent recurring events
        recurring_events = Event.objects.filter(
            recurrence_type__in=['daily', 'weekly', 'monthly', 'yearly'],
            is_recurring_instance=False
        )
        
        self.stdout.write(f'Found {recurring_events.count()} recurring event(s)')
        
        total_generated = 0
        
        for event in recurring_events:
            if force:
                # Delete existing future instances
                deleted = Event.objects.filter(
                    parent_event=event,
                    start_date__gte=now()
                ).delete()
                if deleted[0] > 0:
                    self.stdout.write(f'  Deleted {deleted[0]} existing instances for "{event.title}"')
            
            # Check if there are future instances
            future_count = Event.objects.filter(
                parent_event=event,
                start_date__gte=now()
            ).count()
            
            if future_count == 0 or force:
                self.stdout.write(f'Generating instances for: {event.title} ({event.recurrence_type})')
                instances = event.generate_recurring_instances(count=count)
                total_generated += len(instances)
                self.stdout.write(
                    self.style.SUCCESS(f'  ✓ Generated {len(instances)} instance(s)')
                )
            else:
                self.stdout.write(f'  → Skipping "{event.title}" ({future_count} future instances exist)')
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Total instances generated: {total_generated}')
        )
