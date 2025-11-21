#!/usr/bin/env python
"""
Seed events for all categories
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from events.models import Event
from users.models import User

def create_events():
    # Get or create admin user
    admin = User.objects.filter(role='admin').first()
    if not admin:
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@kedah.tourism',
            password='admin123',
            role='admin'
        )
        print(f"✅ Created admin user: {admin.username}")
    
    # Clear existing events
    Event.objects.all().delete()
    print("🗑️  Cleared existing events")
    
    # Define events for each category
    events_data = [
        {
            'title': 'Langkawi International Marathon 2025',
            'description': 'Join thousands of runners from around the world in this scenic marathon through Langkawi\'s beautiful landscapes. Routes include 42km full marathon, 21km half marathon, and 10km fun run.',
            'location_name': 'Dataran Lang, Kuah, Langkawi',
            'start_date': datetime.now() + timedelta(days=45),
            'end_date': datetime.now() + timedelta(days=45),
            'tags': ['Sports', 'Marathon', 'Running', 'Fitness'],
            'city': 'Langkawi',
            'expected_attendance': 5000,
            'created_by': admin,
        },
        {
            'title': 'Kedah Paddy Festival (Pesta Padi)',
            'description': 'Celebrate Kedah\'s rich agricultural heritage at the annual Paddy Festival. Experience traditional rice harvesting ceremonies, cultural performances, local cuisine, and agricultural exhibitions showcasing Kedah as the "Rice Bowl of Malaysia".',
            'location_name': 'Alor Setar Paddy Museum Complex',
            'start_date': datetime.now() + timedelta(days=60),
            'end_date': datetime.now() + timedelta(days=62),
            'tags': ['Cultural', 'Agriculture', 'Traditional', 'Heritage'],
            'city': 'Alor Setar',
            'expected_attendance': 15000,
            'created_by': admin,
        },
        {
            'title': 'Langkawi Food Festival 2025',
            'description': 'A culinary extravaganza featuring Kedah\'s finest local delicacies, international cuisine, celebrity chef demonstrations, and food competitions. Taste authentic Nasi Ulam, Laksa Kedah, and fresh seafood from local vendors.',
            'location_name': 'Pantai Cenang Beach, Langkawi',
            'start_date': datetime.now() + timedelta(days=30),
            'end_date': datetime.now() + timedelta(days=33),
            'tags': ['Food', 'Culinary', 'Festival', 'Dining'],
            'city': 'Langkawi',
            'expected_attendance': 20000,
            'created_by': admin,
        },
        {
            'title': 'Kedah Heritage Art Exhibition',
            'description': 'Discover Kedah\'s artistic legacy through contemporary and traditional art. Featuring local artists, historical artifacts from the Kedah Sultanate, batik demonstrations, and interactive art workshops for all ages.',
            'location_name': 'Balai Seni Negeri Kedah, Alor Setar',
            'start_date': datetime.now() + timedelta(days=15),
            'end_date': datetime.now() + timedelta(days=45),
            'tags': ['Exhibition', 'Art', 'Heritage', 'Culture'],
            'city': 'Alor Setar',
            'expected_attendance': 8000,
            'created_by': admin,
        },
        {
            'title': 'Langkawi Jazz Festival 2025',
            'description': 'An electrifying weekend of world-class jazz performances under the stars. International and local jazz artists perform at this premier music event in a stunning beachfront setting.',
            'location_name': 'Lagenda Park, Kuah, Langkawi',
            'start_date': datetime.now() + timedelta(days=90),
            'end_date': datetime.now() + timedelta(days=92),
            'tags': ['Concert', 'Music', 'Jazz', 'Entertainment'],
            'city': 'Langkawi',
            'expected_attendance': 12000,
            'created_by': admin,
        },
        {
            'title': 'Royal Kedah Regatta',
            'description': 'Traditional boat racing competition showcasing centuries-old maritime heritage. Watch colorful traditional boats compete in thrilling races, accompanied by cultural performances and water sports exhibitions.',
            'location_name': 'Tanjung Chali Beach, Kedah',
            'start_date': datetime.now() + timedelta(days=75),
            'end_date': datetime.now() + timedelta(days=76),
            'tags': ['Sports', 'Traditional', 'Boat Racing', 'Water Sports'],
            'city': 'Kedah Darul Aman Negara',
            'expected_attendance': 6000,
            'created_by': admin,
        },
        {
            'title': 'Hari Raya Open House Kedah',
            'description': 'Join the Kedah state government and local communities in celebrating Hari Raya Aidilfitri. Experience warm Malaysian hospitality with traditional festive foods, cultural performances, and meet the Sultan of Kedah.',
            'location_name': 'Balai Besar, Alor Setar',
            'start_date': datetime.now() + timedelta(days=120),
            'end_date': datetime.now() + timedelta(days=120),
            'tags': ['Cultural', 'Festival', 'Hari Raya', 'Religious'],
            'city': 'Alor Setar',
            'expected_attendance': 25000,
            'created_by': admin,
        },
        {
            'title': 'Kedah Business & Trade Expo',
            'description': 'Premier business networking event connecting local entrepreneurs, international investors, and SMEs. Features trade exhibitions, business seminars, product launches, and investment opportunities in Kedah\'s growing economy.',
            'location_name': 'Sungai Petani Convention Center',
            'start_date': datetime.now() + timedelta(days=50),
            'end_date': datetime.now() + timedelta(days=52),
            'tags': ['Business', 'Trade', 'Expo', 'Networking'],
            'city': 'Sungai Petani',
            'expected_attendance': 10000,
            'created_by': admin,
        },
        {
            'title': 'Langkawi International Maritime & Aerospace Exhibition (LIMA)',
            'description': 'Asia\'s largest maritime and aerospace exhibition. Witness breathtaking aerial displays, naval ship exhibitions, defense technology showcases, and meet industry leaders from around the globe.',
            'location_name': 'Mahsuri International Exhibition Centre, Langkawi',
            'start_date': datetime.now() + timedelta(days=180),
            'end_date': datetime.now() + timedelta(days=184),
            'tags': ['Exhibition', 'Aerospace', 'Maritime', 'Technology'],
            'city': 'Langkawi',
            'expected_attendance': 50000,
            'created_by': admin,
        },
        {
            'title': 'Langkawi Fest - Island Music & Arts',
            'description': 'A vibrant celebration of music, arts, and island culture. Multiple stages featuring rock, pop, traditional music, street art, craft markets, and beach parties creating an unforgettable festival atmosphere.',
            'location_name': 'Pantai Tengah, Langkawi',
            'start_date': datetime.now() + timedelta(days=100),
            'end_date': datetime.now() + timedelta(days=102),
            'tags': ['Festival', 'Music', 'Arts', 'Beach'],
            'city': 'Langkawi',
            'expected_attendance': 18000,
            'created_by': admin,
        },
        # Add one past event for testing
        {
            'title': 'Kedah New Year Celebration 2025',
            'description': 'Spectacular New Year countdown celebration with live performances, fireworks display, and cultural shows. A memorable way to welcome 2025 in Kedah!',
            'location_name': 'Alor Setar Tower, Alor Setar',
            'start_date': datetime.now() - timedelta(days=320),
            'end_date': datetime.now() - timedelta(days=320),
            'tags': ['Festival', 'Celebration', 'New Year', 'Fireworks'],
            'city': 'Alor Setar',
            'expected_attendance': 30000,
            'actual_attendance': 28500,
            'created_by': admin,
        },
    ]
    
    # Create events
    created_count = 0
    for event_data in events_data:
        event = Event.objects.create(**event_data)
        created_count += 1
        status = "📅 PAST" if event.end_date < datetime.now() else "✅ UPCOMING"
        category = event.tags[0] if event.tags else "General"
        print(f"{status} Created: {event.title} ({category}) - {event.city}")
    
    print(f"\n🎉 Successfully created {created_count} events!")
    print(f"📊 Categories covered: Sports, Cultural, Food, Exhibition, Concert, Business, Festival")
    
    # Summary
    upcoming = Event.objects.filter(end_date__gte=datetime.now()).count()
    past = Event.objects.filter(end_date__lt=datetime.now()).count()
    print(f"\n📈 Summary:")
    print(f"   ✅ Upcoming Events: {upcoming}")
    print(f"   📅 Past Events: {past}")
    print(f"   📍 Total Events: {upcoming + past}")

if __name__ == '__main__':
    print("🌟 Seeding Events for Kedah Tourism Dashboard...")
    print("=" * 60)
    create_events()
    print("=" * 60)
    print("✅ Event seeding complete!")
