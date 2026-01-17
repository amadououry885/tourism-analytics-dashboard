#!/usr/bin/env python
"""
Seed events for all categories - February/March 2026 onwards
"""
import os
import sys
import django
from datetime import datetime

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
    
    # Define events with FIXED future dates (February - June 2026)
    events_data = [
        {
            'title': 'Langkawi International Food Festival 2026',
            'description': 'A culinary extravaganza featuring Kedah\'s finest local delicacies, international cuisine, celebrity chef demonstrations, and food competitions. Taste authentic Nasi Ulam, Laksa Kedah, and fresh seafood from local vendors.',
            'location_name': 'Pantai Cenang Beach, Langkawi',
            'start_date': datetime(2026, 2, 14, 10, 0),  # Feb 14, 2026
            'end_date': datetime(2026, 2, 17, 22, 0),    # Feb 17, 2026
            'tags': ['Food', 'Culinary', 'Festival', 'Dining'],
            'city': 'Langkawi',
            'expected_attendance': 20000,
            'max_capacity': 25000,
            'created_by': admin,
        },
        {
            'title': 'Kedah Heritage Art Exhibition',
            'description': 'Discover Kedah\'s artistic legacy through contemporary and traditional art. Featuring local artists, historical artifacts from the Kedah Sultanate, batik demonstrations, and interactive art workshops for all ages.',
            'location_name': 'Balai Seni Negeri Kedah, Alor Setar',
            'start_date': datetime(2026, 2, 20, 9, 0),   # Feb 20, 2026
            'end_date': datetime(2026, 3, 15, 18, 0),   # Mar 15, 2026
            'tags': ['Exhibition', 'Art', 'Heritage', 'Culture'],
            'city': 'Alor Setar',
            'expected_attendance': 8000,
            'max_capacity': 10000,
            'created_by': admin,
        },
        {
            'title': 'Langkawi International Marathon 2026',
            'description': 'Join thousands of runners from around the world in this scenic marathon through Langkawi\'s beautiful landscapes. Routes include 42km full marathon, 21km half marathon, and 10km fun run.',
            'location_name': 'Dataran Lang, Kuah, Langkawi',
            'start_date': datetime(2026, 3, 1, 6, 0),    # Mar 1, 2026
            'end_date': datetime(2026, 3, 1, 14, 0),    # Mar 1, 2026
            'tags': ['Sports', 'Marathon', 'Running', 'Fitness'],
            'city': 'Langkawi',
            'expected_attendance': 5000,
            'max_capacity': 6000,
            'created_by': admin,
        },
        {
            'title': 'Kedah Business & Trade Expo 2026',
            'description': 'Premier business networking event connecting local entrepreneurs, international investors, and SMEs. Features trade exhibitions, business seminars, product launches, and investment opportunities in Kedah\'s growing economy.',
            'location_name': 'Sungai Petani Convention Center',
            'start_date': datetime(2026, 3, 8, 9, 0),    # Mar 8, 2026
            'end_date': datetime(2026, 3, 10, 18, 0),   # Mar 10, 2026
            'tags': ['Business', 'Trade', 'Expo', 'Networking'],
            'city': 'Sungai Petani',
            'expected_attendance': 10000,
            'max_capacity': 12000,
            'created_by': admin,
        },
        {
            'title': 'Kedah Paddy Festival (Pesta Padi) 2026',
            'description': 'Celebrate Kedah\'s rich agricultural heritage at the annual Paddy Festival. Experience traditional rice harvesting ceremonies, cultural performances, local cuisine, and agricultural exhibitions showcasing Kedah as the "Rice Bowl of Malaysia".',
            'location_name': 'Alor Setar Paddy Museum Complex',
            'start_date': datetime(2026, 3, 20, 8, 0),   # Mar 20, 2026
            'end_date': datetime(2026, 3, 22, 22, 0),   # Mar 22, 2026
            'tags': ['Cultural', 'Agriculture', 'Traditional', 'Heritage'],
            'city': 'Alor Setar',
            'expected_attendance': 15000,
            'max_capacity': 20000,
            'created_by': admin,
        },
        {
            'title': 'Royal Kedah Regatta 2026',
            'description': 'Traditional boat racing competition showcasing centuries-old maritime heritage. Watch colorful traditional boats compete in thrilling races, accompanied by cultural performances and water sports exhibitions.',
            'location_name': 'Tanjung Chali Beach, Kedah',
            'start_date': datetime(2026, 4, 4, 8, 0),    # Apr 4, 2026
            'end_date': datetime(2026, 4, 5, 18, 0),    # Apr 5, 2026
            'tags': ['Sports', 'Traditional', 'Boat Racing', 'Water Sports'],
            'city': 'Kedah Darul Aman Negara',
            'expected_attendance': 6000,
            'max_capacity': 8000,
            'created_by': admin,
        },
        {
            'title': 'Langkawi Jazz Festival 2026',
            'description': 'An electrifying weekend of world-class jazz performances under the stars. International and local jazz artists perform at this premier music event in a stunning beachfront setting.',
            'location_name': 'Lagenda Park, Kuah, Langkawi',
            'start_date': datetime(2026, 4, 17, 18, 0),  # Apr 17, 2026
            'end_date': datetime(2026, 4, 19, 23, 0),   # Apr 19, 2026
            'tags': ['Concert', 'Music', 'Jazz', 'Entertainment'],
            'city': 'Langkawi',
            'expected_attendance': 12000,
            'max_capacity': 15000,
            'created_by': admin,
        },
        {
            'title': 'Langkawi Fest - Island Music & Arts 2026',
            'description': 'A vibrant celebration of music, arts, and island culture. Multiple stages featuring rock, pop, traditional music, street art, craft markets, and beach parties creating an unforgettable festival atmosphere.',
            'location_name': 'Pantai Tengah, Langkawi',
            'start_date': datetime(2026, 5, 1, 10, 0),   # May 1, 2026
            'end_date': datetime(2026, 5, 3, 23, 0),    # May 3, 2026
            'tags': ['Festival', 'Music', 'Arts', 'Beach'],
            'city': 'Langkawi',
            'expected_attendance': 18000,
            'max_capacity': 22000,
            'created_by': admin,
        },
        {
            'title': 'Hari Raya Open House Kedah 2026',
            'description': 'Join the Kedah state government and local communities in celebrating Hari Raya Aidilfitri. Experience warm Malaysian hospitality with traditional festive foods, cultural performances, and meet the Sultan of Kedah.',
            'location_name': 'Balai Besar, Alor Setar',
            'start_date': datetime(2026, 5, 15, 10, 0),  # May 15, 2026
            'end_date': datetime(2026, 5, 15, 18, 0),   # May 15, 2026
            'tags': ['Cultural', 'Festival', 'Hari Raya', 'Religious'],
            'city': 'Alor Setar',
            'expected_attendance': 25000,
            'max_capacity': 30000,
            'created_by': admin,
        },
        {
            'title': 'Langkawi International Maritime & Aerospace Exhibition (LIMA) 2026',
            'description': 'Asia\'s largest maritime and aerospace exhibition. Witness breathtaking aerial displays, naval ship exhibitions, defense technology showcases, and meet industry leaders from around the globe.',
            'location_name': 'Mahsuri International Exhibition Centre, Langkawi',
            'start_date': datetime(2026, 6, 10, 9, 0),   # Jun 10, 2026
            'end_date': datetime(2026, 6, 14, 18, 0),   # Jun 14, 2026
            'tags': ['Exhibition', 'Aerospace', 'Maritime', 'Technology'],
            'city': 'Langkawi',
            'expected_attendance': 50000,
            'max_capacity': 60000,
            'created_by': admin,
        },
    ]
    
    # Create events
    created_count = 0
    for event_data in events_data:
        event = Event.objects.create(**event_data)
        created_count += 1
        now = datetime.now()
        status = "📅 PAST" if event.end_date.replace(tzinfo=None) < now else "✅ UPCOMING"
        category = event.tags[0] if event.tags else "General"
        print(f"{status} Created: {event.title} ({category}) - {event.city}")
        print(f"         📅 {event.start_date.strftime('%b %d, %Y')} → {event.end_date.strftime('%b %d, %Y')}")
    
    print(f"\n🎉 Successfully created {created_count} events!")
    print(f"📊 Categories covered: Sports, Cultural, Food, Exhibition, Concert, Business, Festival")
    
    # Summary
    now = datetime.now()
    upcoming = Event.objects.filter(end_date__gte=now).count()
    past = Event.objects.filter(end_date__lt=now).count()
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
