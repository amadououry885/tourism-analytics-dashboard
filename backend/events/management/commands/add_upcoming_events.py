from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from events.models import Event
from users.models import User


class Command(BaseCommand):
    help = 'Add upcoming events for testing'

    def handle(self, *args, **kwargs):
        # Get or create admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@kedah.gov.my',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_approved': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('✅ Created admin user'))

        # Delete existing future events
        deleted = Event.objects.filter(start_date__gte=timezone.now()).delete()[0]
        self.stdout.write(self.style.WARNING(f'🗑️ Deleted {deleted} existing future events'))

        # Create upcoming events
        upcoming_events = [
            {
                "title": "Kedah International Food Festival 2025",
                "description": "A grand celebration of Kedah's culinary heritage featuring local and international cuisines. Enjoy cooking demonstrations, food competitions, and tastings from over 100 vendors.",
                "days_ahead": 5,
                "duration_days": 2,
                "location_name": "Alor Setar Stadium",
                "city": "Alor Setar",
                "lat": 6.1248,
                "lon": 100.3678,
                "tags": ["food", "festival"],
                "expected_attendance": 15000,
                "max_capacity": 20000,
                "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
            },
            {
                "title": "Langkawi Sky Marathon 2025",
                "description": "Annual running event with routes showcasing Langkawi's scenic beauty. Categories: 5K, 10K, half marathon, and full marathon.",
                "days_ahead": 12,
                "duration_days": 0,
                "location_name": "Pantai Cenang",
                "city": "Langkawi",
                "lat": 6.2885,
                "lon": 99.7431,
                "tags": ["sports", "marathon"],
                "expected_attendance": 3000,
                "max_capacity": 3500,
                "image_url": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
            },
            {
                "title": "Kedah Heritage Week 2025",
                "description": "Week-long celebration of Kedah's rich history and culture. Features exhibitions, traditional performances, batik workshops, and historical tours.",
                "days_ahead": 18,
                "duration_days": 6,
                "location_name": "Balai Seni Negeri Kedah",
                "city": "Alor Setar",
                "lat": 6.1168,
                "lon": 100.3685,
                "tags": ["cultural", "heritage"],
                "expected_attendance": 8000,
                "max_capacity": 10000,
                "image_url": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
            },
            {
                "title": "Langkawi International Jazz Festival",
                "description": "Three nights of world-class jazz performances featuring international and local artists. Beachside venue with stunning sunset views.",
                "days_ahead": 25,
                "duration_days": 2,
                "location_name": "Pantai Tengah Beach",
                "city": "Langkawi",
                "lat": 6.2668,
                "lon": 99.7250,
                "tags": ["entertainment", "music"],
                "expected_attendance": 5000,
                "max_capacity": 6000,
                "image_url": "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800",
            },
            {
                "title": "Kedah Tech & Innovation Expo 2025",
                "description": "Showcase of technology, startups, and innovation in Kedah. Includes tech talks, product demos, investor pitching sessions, and networking events.",
                "days_ahead": 32,
                "duration_days": 2,
                "location_name": "Aman Central Convention Hall",
                "city": "Alor Setar",
                "lat": 6.1333,
                "lon": 100.3667,
                "tags": ["business", "technology"],
                "expected_attendance": 4000,
                "max_capacity": 5000,
                "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            },
            {
                "title": "Langkawi Underwater World Festival",
                "description": "Marine life conservation event with diving demonstrations, marine biology talks, and kids' activities. Special night aquarium tours available.",
                "days_ahead": 40,
                "duration_days": 0,
                "location_name": "Langkawi Underwater World",
                "city": "Langkawi",
                "lat": 6.3500,
                "lon": 99.7289,
                "tags": ["exhibition", "family"],
                "expected_attendance": 2500,
                "max_capacity": 3000,
                "image_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
            },
            {
                "title": "Kedah Paddy Festival 2025",
                "description": "Annual celebration of rice harvest season. Features traditional farming demonstrations, rice cooking competitions, and cultural performances.",
                "days_ahead": 45,
                "duration_days": 2,
                "location_name": "Gunung Keriang",
                "city": "Alor Setar",
                "lat": 6.1667,
                "lon": 100.3833,
                "tags": ["cultural", "festival"],
                "expected_attendance": 12000,
                "max_capacity": 15000,
                "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800",
            },
            {
                "title": "Langkawi International Book Fair",
                "description": "Southeast Asia's premier book fair featuring author meet-and-greets, writing workshops, children's storytelling sessions, and book exhibitions.",
                "days_ahead": 52,
                "duration_days": 3,
                "location_name": "Mahsuri International Exhibition Centre",
                "city": "Langkawi",
                "lat": 6.3307,
                "lon": 99.7258,
                "tags": ["exhibition", "cultural"],
                "expected_attendance": 6000,
                "max_capacity": 8000,
                "image_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
            },
        ]

        created_count = 0
        for event_data in upcoming_events:
            days_ahead = event_data.pop('days_ahead')
            duration_days = event_data.pop('duration_days')
            
            start_date = timezone.now() + timedelta(days=days_ahead)
            end_date = start_date + timedelta(days=duration_days) if duration_days > 0 else None
            
            event = Event.objects.create(
                start_date=start_date,
                end_date=end_date,
                created_by=admin,
                is_published=True,
                **event_data
            )
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Created: {event.title} - {event.start_date.strftime("%B %d, %Y")}'
                )
            )

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Successfully created {created_count} upcoming events!'))
        
        # Show summary
        total = Event.objects.count()
        upcoming = Event.objects.filter(start_date__gte=timezone.now()).count()
        past = Event.objects.filter(start_date__lt=timezone.now()).count()
        
        self.stdout.write(self.style.SUCCESS('\n📊 Event Summary:'))
        self.stdout.write(f'  Total events: {total}')
        self.stdout.write(f'  Upcoming: {upcoming}')
        self.stdout.write(f'  Past: {past}')
