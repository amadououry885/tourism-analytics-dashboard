"""
Seed script to add internal stays with contact information for testing hybrid search.
Run: python manage.py shell < seed_internal_stays.py
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from stays.models import Stay
from users.models import User

# Get or create a stay owner
try:
    owner = User.objects.filter(role='stay_owner', is_approved=True).first()
    if not owner:
        owner = User.objects.create_user(
            username='stay_owner_test',
            email='stayowner@test.com',
            password='testpass123',
            role='stay_owner',
            is_approved=True
        )
        print(f"✅ Created test stay owner: {owner.username}")
    else:
        print(f"✅ Using existing stay owner: {owner.username}")
except Exception as e:
    print(f"⚠️ Could not create stay owner: {e}")
    owner = None

# Internal stays data with contact info
internal_stays = [
    {
        'name': 'Langkawi Sunset Resort',
        'type': 'Hotel',
        'district': 'Langkawi',
        'rating': 4.5,
        'priceNight': 250.00,
        'amenities': ['WiFi', 'Pool', 'Breakfast', 'Air Conditioning', 'Parking'],
        'lat': 6.3500,
        'lon': 99.8000,
        'landmark': 'Near Pantai Cenang Beach',
        'distanceKm': 2.5,
        'is_active': True,
        'is_internal': True,
        'contact_email': 'info@langkawisunset.com',
        'contact_phone': '+60124567890',
        'contact_whatsapp': '+60124567890',
        'owner': owner,
    },
    {
        'name': 'Alor Setar City Hotel',
        'type': 'Hotel',
        'district': 'Alor Setar',
        'rating': 4.0,
        'priceNight': 150.00,
        'amenities': ['WiFi', 'Breakfast', 'Air Conditioning', 'TV', 'Parking'],
        'lat': 6.1200,
        'lon': 100.3600,
        'landmark': 'Near Alor Setar Tower',
        'distanceKm': 1.0,
        'is_active': True,
        'is_internal': True,
        'contact_email': 'reservations@alorsstarhotel.my',
        'contact_phone': '+60123456789',
        'contact_whatsapp': '+60123456789',
        'owner': owner,
    },
    {
        'name': 'Kuah Bay Homestay',
        'type': 'Homestay',
        'district': 'Langkawi',
        'rating': 4.8,
        'priceNight': 120.00,
        'amenities': ['WiFi', 'Kitchen', 'Air Conditioning', 'Parking'],
        'lat': 6.3333,
        'lon': 99.8667,
        'landmark': 'Kuah Town Center',
        'distanceKm': 0.5,
        'is_active': True,
        'is_internal': True,
        'contact_email': 'stay@kuahbay.com',
        'contact_phone': '+60198765432',
        'contact_whatsapp': '+60198765432',
        'owner': owner,
    },
    {
        'name': 'Sungai Petani Guest House',
        'type': 'Guest House',
        'district': 'Sungai Petani',
        'rating': 3.8,
        'priceNight': 80.00,
        'amenities': ['WiFi', 'Air Conditioning', 'Parking'],
        'lat': 5.6478,
        'lon': 100.4878,
        'landmark': 'Near Central Square',
        'distanceKm': 1.2,
        'is_active': True,
        'is_internal': True,
        'contact_email': 'info@sgpetaniguesthouse.my',
        'contact_phone': '+60167891234',
        'contact_whatsapp': '+60167891234',
        'owner': owner,
    },
    {
        'name': 'Kulim Apartment Suites',
        'type': 'Apartment',
        'district': 'Kulim',
        'rating': 4.2,
        'priceNight': 180.00,
        'amenities': ['WiFi', 'Kitchen', 'Air Conditioning', 'Gym', 'Pool', 'Parking'],
        'lat': 5.3647,
        'lon': 100.5611,
        'landmark': 'Kulim Hi-Tech Park',
        'distanceKm': 3.0,
        'is_active': True,
        'is_internal': True,
        'contact_email': 'rent@kulimapts.com',
        'contact_phone': '+60123334444',
        'contact_whatsapp': '+60123334444',
        'owner': owner,
    },
]

print("\n🏨 Creating internal stays with contact information...\n")

for stay_data in internal_stays:
    # Check if stay already exists
    existing = Stay.objects.filter(name=stay_data['name']).first()
    
    if existing:
        # Update existing stay with new fields
        for key, value in stay_data.items():
            setattr(existing, key, value)
        existing.save()
        print(f"✅ Updated: {existing.name} - {existing.district}")
        print(f"   📧 Email: {existing.contact_email}")
        print(f"   📞 Phone: {existing.contact_phone}")
        print(f"   💬 WhatsApp: {existing.contact_whatsapp}\n")
    else:
        # Create new stay
        stay = Stay.objects.create(**stay_data)
        print(f"✅ Created: {stay.name} - {stay.district}")
        print(f"   📧 Email: {stay.contact_email}")
        print(f"   📞 Phone: {stay.contact_phone}")
        print(f"   💬 WhatsApp: {stay.contact_whatsapp}\n")

print(f"\n🎉 Seeding complete! Total internal stays: {Stay.objects.filter(is_internal=True).count()}")
print(f"📊 Total stays in database: {Stay.objects.count()}\n")
