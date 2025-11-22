"""
Add more tourist destinations for Alor Setar
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from analytics.models import Place

# Alor Setar tourist destinations
alor_setar_places = [
    {
        "name": "Aman Central Mall",
        "category": "Shopping",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Major shopping complex in Alor Setar with numerous retail stores, restaurants, and entertainment facilities.",
        "latitude": 6.1186,
        "longitude": 100.3683,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Zahir Mosque (Masjid Zahir)",
        "category": "Religious Site",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "One of the most beautiful and iconic mosques in Malaysia, built in 1912 with stunning Moorish architecture.",
        "latitude": 6.1244,
        "longitude": 100.3684,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Alor Setar Tower (Menara Alor Setar)",
        "category": "Landmark",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "421-meter tall tower with observation deck offering panoramic city views and a revolving restaurant.",
        "latitude": 6.1241,
        "longitude": 100.3691,
        "is_free": False,
        "price": 15.00,
        "image_url": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Muzium Padi (Kedah Paddy Museum)",
        "category": "Museum",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Rice museum showcasing the history and cultivation of paddy in Kedah, the rice bowl of Malaysia.",
        "latitude": 6.1372,
        "longitude": 100.3897,
        "is_free": False,
        "price": 5.00,
        "image_url": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Kedah Royal Museum (Muzium Diraja Kedah)",
        "category": "Museum",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Former royal palace now a museum showcasing Kedah's royal heritage and history.",
        "latitude": 6.1234,
        "longitude": 100.3674,
        "is_free": False,
        "price": 3.00,
        "image_url": "https://images.unsplash.com/photo-1585241645927-c7a8e5840c42?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Al-Bukhary Mosque",
        "category": "Religious Site",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Grand mosque with distinctive modern Islamic architecture and beautiful interior design.",
        "latitude": 6.1103,
        "longitude": 100.3614,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1564769610326-7195c9ea0d7e?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Sultan Abdul Halim Mu'adzam Shah Gallery",
        "category": "Museum",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Former High Court building now a gallery dedicated to the Sultan's life and Kedah's royal history.",
        "latitude": 6.1235,
        "longitude": 100.3676,
        "is_free": False,
        "price": 3.00,
        "image_url": "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Balai Nobat",
        "category": "Historical",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Historic octagonal tower housing the royal Nobat musical instruments, used for royal ceremonies.",
        "latitude": 6.1238,
        "longitude": 100.3679,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Balai Besar (Grand Audience Hall)",
        "category": "Historical",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Historic royal hall built in 1898, used for royal ceremonies and state functions.",
        "latitude": 6.1237,
        "longitude": 100.3678,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Kedah State Art Gallery (Balai Seni Negeri)",
        "category": "Art & Culture",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Art gallery housed in a beautiful neoclassical building, featuring local Malaysian art.",
        "latitude": 6.1233,
        "longitude": 100.3681,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Wat Nikrodharam",
        "category": "Religious Site",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Beautiful Siamese-style Thai Buddhist temple with intricate architecture and peaceful atmosphere.",
        "latitude": 6.1156,
        "longitude": 100.3642,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Tanjung Chali Waterfront",
        "category": "Park & Recreation",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Scenic riverfront area with park, food court, town square, and beautiful river views.",
        "latitude": 6.1198,
        "longitude": 100.3701,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "City Plaza Alor Setar",
        "category": "Shopping",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Shopping mall in the heart of Alor Setar with retail stores, dining options, and entertainment.",
        "latitude": 6.1201,
        "longitude": 100.3695,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Darul Aman Stadium",
        "category": "Sports & Recreation",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Main stadium in Alor Setar, home to Kedah FA football team and venue for major sporting events.",
        "latitude": 6.1311,
        "longitude": 100.3725,
        "is_free": False,
        "price": 10.00,
        "image_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=800&fit=crop&q=80"
    },
    {
        "name": "Pasar Karat Kampung Berjaya",
        "category": "Market",
        "city": "Alor Setar",
        "state": "Kedah",
        "country": "Malaysia",
        "description": "Vintage flea market selling antiques, collectibles, and local items - great for treasure hunting.",
        "latitude": 6.1167,
        "longitude": 100.3658,
        "is_free": True,
        "image_url": "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&h=800&fit=crop&q=80"
    },
]

print("Adding Alor Setar tourist destinations...")
print("=" * 60)

added = 0
updated = 0

for place_data in alor_setar_places:
    # Check if place already exists
    existing = Place.objects.filter(name=place_data['name'], city='Alor Setar').first()
    
    if existing:
        # Update existing place
        for key, value in place_data.items():
            setattr(existing, key, value)
        existing.save()
        print(f"✓ Updated: {place_data['name']} ({place_data['category']})")
        updated += 1
    else:
        # Create new place
        Place.objects.create(**place_data)
        print(f"✓ Added: {place_data['name']} ({place_data['category']})")
        added += 1

print("=" * 60)
print(f"\n✅ Complete!")
print(f"   Added: {added} new places")
print(f"   Updated: {updated} existing places")
print(f"   Total Alor Setar destinations: {Place.objects.filter(city='Alor Setar').count()}")
