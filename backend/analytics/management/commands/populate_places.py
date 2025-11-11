from django.core.management.base import BaseCommand
from analytics.models import Place


class Command(BaseCommand):
    help = 'Populate the database with Kedah cities/places'

    def handle(self, *args, **kwargs):
        """Create places for major cities in Kedah"""
        
        cities = [
            {
                'name': 'Langkawi',
                'description': 'A beautiful archipelago of 104 islands, known for pristine beaches, luxury resorts, and duty-free shopping.',
                'category': 'City',
                'city': 'Langkawi',
                'state': 'Kedah',
                'country': 'Malaysia',
                'latitude': 6.3500,
                'longitude': 99.8000,
                'is_free': True,
            },
            {
                'name': 'Alor Setar',
                'description': 'The capital city of Kedah, featuring the iconic Alor Setar Tower and rich cultural heritage.',
                'category': 'City',
                'city': 'Alor Setar',
                'state': 'Kedah',
                'country': 'Malaysia',
                'latitude': 6.1248,
                'longitude': 100.3678,
                'is_free': True,
            },
            {
                'name': 'Sungai Petani',
                'description': "Kedah's largest town and commercial hub, known for shopping and local cuisine.",
                'category': 'City',
                'city': 'Sungai Petani',
                'state': 'Kedah',
                'country': 'Malaysia',
                'latitude': 5.6467,
                'longitude': 100.4876,
                'is_free': True,
            },
            {
                'name': 'Kulim',
                'description': 'An industrial city with a growing technology sector and modern infrastructure.',
                'category': 'City',
                'city': 'Kulim',
                'state': 'Kedah',
                'country': 'Malaysia',
                'latitude': 5.3659,
                'longitude': 100.5614,
                'is_free': True,
            },
            {
                'name': 'Jitra',
                'description': 'A charming town in northern Kedah, known for agriculture and local markets.',
                'category': 'City',
                'city': 'Jitra',
                'state': 'Kedah',
                'country': 'Malaysia',
                'latitude': 6.2683,
                'longitude': 100.4194,
                'is_free': True,
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for city_data in cities:
            place, created = Place.objects.get_or_create(
                name=city_data['name'],
                defaults=city_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"✓ Created: {city_data['name']}"))
            else:
                # Update existing place with new data
                for key, value in city_data.items():
                    setattr(place, key, value)
                place.save()
                updated_count += 1
                self.stdout.write(self.style.WARNING(f"↻ Updated: {city_data['name']}"))
        
        self.stdout.write(self.style.SUCCESS(f"\n{'='*50}"))
        self.stdout.write(self.style.SUCCESS(f"Places populated successfully!"))
        self.stdout.write(self.style.SUCCESS(f"Created: {created_count} | Updated: {updated_count}"))
        self.stdout.write(self.style.SUCCESS(f"Total places in database: {Place.objects.count()}"))
        self.stdout.write(self.style.SUCCESS(f"{'='*50}"))
