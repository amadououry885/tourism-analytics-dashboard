# backend/events/management/commands/fix_recurring_events.py
from django.core.management.base import BaseCommand
from events.models import Event


class Command(BaseCommand):
    help = 'Fix AIU events recurrence type and add upcoming January 2026 events'

    def handle(self, *args, **options):
        # Fix AIU events - change from yearly to none
        aiu_events = Event.objects.filter(title__icontains='AIU') | Event.objects.filter(title__icontains='Albukhary')
        count = aiu_events.count()
        
        if count > 0:
            for event in aiu_events:
                self.stdout.write(f'Fixing: {event.title} (was: {event.recurrence_type})')
                event.recurrence_type = 'none'
                event.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Fixed {count} AIU events - changed to recurrence_type="none"'))
        else:
            self.stdout.write('No AIU events found to fix')
        
        # Add upcoming January 2026 events
        from django.contrib.auth import get_user_model
        from django.utils import timezone
        from datetime import datetime
        
        User = get_user_model()
        admin_user = User.objects.filter(role='admin').first()
        
        if not admin_user:
            self.stdout.write(self.style.ERROR('No admin user found!'))
            return
        
        events_to_create = [
            {
                'title': 'Kedah Tech Innovation Summit 2026',
                'description': 'Annual technology and innovation summit showcasing Kedah\'s digital transformation initiatives. Features keynote speakers, startup pitches, and tech exhibitions.',
                'location_name': 'Aman Central Convention Hall',
                'city': 'Alor Setar',
                'start_date': datetime(2026, 1, 20, 9, 0, tzinfo=timezone.get_current_timezone()),
                'end_date': datetime(2026, 1, 20, 17, 0, tzinfo=timezone.get_current_timezone()),
                'tags': ['Business', 'Technology', 'Innovation'],
                'expected_attendance': 3000,
                'max_capacity': 3000,
            },
            {
                'title': 'Langkawi International Food Festival 2026',
                'description': 'A grand celebration of Langkawi\'s culinary heritage featuring local and international cuisines. Enjoy cooking demonstrations, food competitions, and tastings from over 100 vendors.',
                'location_name': 'Pantai Cenang',
                'city': 'Langkawi',
                'start_date': datetime(2026, 1, 15, 10, 0, tzinfo=timezone.get_current_timezone()),
                'end_date': datetime(2026, 1, 15, 22, 0, tzinfo=timezone.get_current_timezone()),
                'tags': ['Food', 'Festival', 'Cultural'],
                'expected_attendance': 12000,
                'max_capacity': 15000,
            },
            {
                'title': 'Langkawi International Maritime and Aerospace Exhibition',
                'description': 'Biennial exhibition showcasing maritime and aerospace technology, defense systems, and innovation. Attracts global exhibitors and industry professionals.',
                'location_name': 'Mahsuri International Exhibition Centre',
                'city': 'Langkawi',
                'start_date': datetime(2026, 3, 15, 9, 0, tzinfo=timezone.get_current_timezone()),
                'end_date': datetime(2026, 3, 19, 18, 0, tzinfo=timezone.get_current_timezone()),
                'tags': ['Exhibition', 'Business', 'Technology'],
                'expected_attendance': 15000,
                'max_capacity': 20000,
            },
            {
                'title': 'Alor Setar Heritage Festival 2026',
                'description': 'Experience the rich cultural heritage of Alor Setar through traditional performances, historical exhibitions, craft workshops, and heritage walks through the old town.',
                'location_name': 'Dataran Alor Setar',
                'city': 'Alor Setar',
                'start_date': datetime(2026, 4, 5, 8, 0, tzinfo=timezone.get_current_timezone()),
                'end_date': datetime(2026, 4, 7, 22, 0, tzinfo=timezone.get_current_timezone()),
                'tags': ['Cultural', 'Heritage', 'Festival'],
                'expected_attendance': 8000,
                'max_capacity': 10000,
            },
            {
                'title': 'Kedah Paddy Festival 2026',
                'description': 'Celebrate Kedah\'s agricultural heritage at the annual Paddy Festival. Features traditional paddy harvesting demonstrations, agricultural exhibitions, and local food fair.',
                'location_name': 'Gunung Keriang',
                'city': 'Alor Setar',
                'start_date': datetime(2026, 1, 9, 7, 0, tzinfo=timezone.get_current_timezone()),
                'end_date': datetime(2026, 1, 11, 19, 0, tzinfo=timezone.get_current_timezone()),
                'tags': ['Cultural', 'Agriculture', 'Festival'],
                'expected_attendance': 5000,
                'max_capacity': 6000,
            },
            {
                'title': 'Langkawi Underwater World Festival 2026',
                'description': 'Marine conservation and underwater photography festival featuring diving exhibitions, marine life talks, and underwater photography competitions.',
                'location_name': 'Langkawi Underwater World',
                'city': 'Langkawi',
                'start_date': datetime(2026, 1, 4, 9, 0, tzinfo=timezone.get_current_timezone()),
                'end_date': datetime(2026, 1, 6, 18, 0, tzinfo=timezone.get_current_timezone()),
                'tags': ['Exhibition', 'Environmental', 'Educational'],
                'expected_attendance': 3500,
                'max_capacity': 4000,
            },
        ]
        
        created_count = 0
        for event_data in events_to_create:
            # Check if event already exists
            existing = Event.objects.filter(
                title=event_data['title'],
                start_date=event_data['start_date']
            ).exists()
            
            if not existing:
                Event.objects.create(
                    **event_data,
                    created_by=admin_user,
                    recurrence_type='none',
                    is_published=True
                )
                created_count += 1
                self.stdout.write(f'  ✓ Created: {event_data["title"]}')
            else:
                self.stdout.write(f'  - Skipped (already exists): {event_data["title"]}')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Added {created_count} new upcoming events for January-April 2026'))
        
        # Final summary
        total_events = Event.objects.count()
        upcoming_events = Event.objects.filter(
            recurrence_type='none',
            start_date__gte=timezone.now()
        ).count()
        
        self.stdout.write(self.style.SUCCESS(f'\n📊 Final Stats:'))
        self.stdout.write(f'   Total events: {total_events}')
        self.stdout.write(f'   Upcoming events: {upcoming_events}')
