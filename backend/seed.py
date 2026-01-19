import os, random
from datetime import timedelta
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tourism_api.settings")

import django
django.setup()

from django.utils import timezone
from faker import Faker

# Models
from analytics.models import Place as APlace, SocialPost
from events.models import Event
from stays.models import Stay
from vendors.models import Vendor
from users.models import User

fake = Faker()

# ───────────────────────────────────────────────────────────
# Create Test Users (for portals and testing)
# ───────────────────────────────────────────────────────────
print("\n🔐 Creating test user accounts...")

test_users = [
    {'username': 'admin', 'email': 'admin@example.com', 'password': 'admin123', 'role': 'admin', 'first_name': 'Admin', 'last_name': 'User', 'is_staff': True, 'is_superuser': True},
    {'username': 'vendor1', 'email': 'vendor1@example.com', 'password': 'vendor123', 'role': 'vendor', 'first_name': 'Vendor', 'last_name': 'One'},
    {'username': 'vendor2', 'email': 'vendor2@example.com', 'password': 'vendor123', 'role': 'vendor', 'first_name': 'Vendor', 'last_name': 'Two'},
    {'username': 'OuryRestau', 'email': 'amadouodiallo77@gmail.com', 'password': 'vendor123', 'role': 'vendor', 'first_name': 'Amadou', 'last_name': 'Diallo'},
    {'username': 'stayowner1', 'email': 'stay@example.com', 'password': 'stay123', 'role': 'stay_owner', 'first_name': 'Stay', 'last_name': 'Owner One'},
    {'username': 'stayowner2', 'email': 'stay2@test.com', 'password': 'stay123', 'role': 'stay_owner', 'first_name': 'Stay', 'last_name': 'Owner Two'},
    {'username': 'NaimFOOD', 'email': 'hasib.naeim08@gmail.com', 'password': 'stay123', 'role': 'stay_owner', 'first_name': 'Hasib', 'last_name': 'Naeim'},
]

for user_data in test_users:
    password = user_data.pop('password')
    username = user_data['username']
    email = user_data['email']
    
    # Try to get by username first, then email
    user = None
    created = False
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create(**user_data)
            created = True
    
    # Update password and settings
    if created or not user.check_password(password):
        user.set_password(password)
    user.is_approved = True
    user.is_active = True
    user.username = username
    user.email = email
    user.role = user_data['role']
    if 'is_staff' in user_data:
        user.is_staff = user_data['is_staff']
    if 'is_superuser' in user_data:
        user.is_superuser = user_data['is_superuser']
    user.save()
    print(f"✅ {'Created' if created else 'Updated'}: {user.username} ({user.email})")

# Get admin user for foreign keys (use the test admin we just created)
admin_user = User.objects.get(username='admin')

# ───────────────────────────────────────────────────────────
# Helper
# ───────────────────────────────────────────────────────────
def pct(n, p):  # percent utility
    return int(round(n * p))

now = timezone.now()
today = now.date()

# ───────────────────────────────────────────────────────────
# Seed Places (Analytics & Transport)
# ───────────────────────────────────────────────────────────
kedah_places = [
    # (name, city, lat, lon, category)
    # Alor Setar attractions
    ("Menara Alor Setar", "Alor Setar", 6.1185, 100.3680, "Attraction"),
    ("Zahir Mosque", "Alor Setar", 6.1180, 100.3660, "Religious Site"),
    ("Alor Setar Tower", "Alor Setar", 6.1248, 100.3676, "Landmark"),
    ("Pekan Rabu Complex", "Alor Setar", 6.1200, 100.3690, "Shopping"),
    ("Balai Nobat", "Alor Setar", 6.1175, 100.3665, "Historical"),
    
    # Langkawi attractions
    ("Pantai Cenang", "Langkawi", 6.2850, 99.7260, "Beach"),
    ("Langkawi Sky Bridge", "Langkawi", 6.3800, 99.6650, "Attraction"),
    ("Eagle Square (Dataran Lang)", "Langkawi", 6.3070, 99.8490, "Landmark"),
    ("Kilim Karst Geoforest Park", "Langkawi", 6.4330, 99.8650, "Nature"),
    ("Underwater World Langkawi", "Langkawi", 6.2800, 99.7240, "Attraction"),
    ("Langkawi Cable Car", "Langkawi", 6.3800, 99.6650, "Attraction"),
    ("Tanjung Rhu Beach", "Langkawi", 6.4320, 99.8230, "Beach"),
    
    # Gunung Jerai attractions
    ("Gunung Jerai", "Gurun", 5.7900, 100.4300, "Nature"),
    ("Sungai Teroi Forest Recreation", "Gurun", 5.7800, 100.4200, "Nature"),
    
    # Sungai Petani attractions
    ("Bujang Valley", "Sungai Petani", 5.6300, 100.4650, "Historical"),
    ("Candi Bukit Batu Pahat", "Sungai Petani", 5.6350, 100.4600, "Historical"),
    
    # Kulim attractions
    ("Kulim Golf & Country Resort", "Kulim", 5.3650, 100.5620, "Recreation"),
    ("Lunas Hot Springs", "Kulim", 5.4100, 100.5400, "Nature"),
]

# Analytics places (richer schema)
aplace_objs = []
for item in kedah_places:
    name, city, lat, lon = item[0], item[1], item[2], item[3]
    category = item[4] if len(item) > 4 else random.choice(["Attraction", "Nature", "Beach", "Food", "Shopping"])
    
    obj, _ = APlace.objects.get_or_create(
        name=name,
        defaults=dict(
            description=fake.paragraph(nb_sentences=3),
            category=category,
            city=city,
            state="Kedah",
            country="Malaysia",
            is_free=random.choice([True, False]),
            price=(None if random.random() < 0.6 else round(random.uniform(5, 50), 2)),
            currency="MYR",
            latitude=lat,
            longitude=lon,
            created_by=admin_user,  # Set the admin user as creator
        ),
    )
    aplace_objs.append(obj)

print(f"✅ Analytics Places: {APlace.objects.count()}")

# ───────────────────────────────────────────────────────────
# Vendors (in Kedah)
# ───────────────────────────────────────────────────────────
cuisine_pool = [
    "Malay", "Nasi Kandar", "Seafood", "Thai", "Indian-Muslim", "Cafe",
    "Western", "Satay", "Laksa", "Dessert"
]
vendor_cities = list(set([p[1] for p in kedah_places]))  # Unique cities from places

created = 0
for i in range(18):
    city = random.choice(vendor_cities)
    name = f"{fake.last_name()} {random.choice(['Food','Kitchen','Cafe','Corner','Bistro'])}"
    obj, made = Vendor.objects.get_or_create(
        name=name, city=city,
        defaults=dict(
            cuisines=random.sample(cuisine_pool, k=random.randint(1, 3)),
            lat=round(random.uniform(5.3, 6.6), 6),
            lon=round(random.uniform(99.6, 100.8), 6),
            is_active=True,
        ),
    )
    if made:
        created += 1
print(f"✅ Vendors created: {created} (total: {Vendor.objects.count()})")

# ───────────────────────────────────────────────────────────
# Stays (in Kedah)
# ───────────────────────────────────────────────────────────
stay_types = ["Hotel", "Apartment", "Guest House", "Homestay"]
stay_created = 0
for i in range(22):
    district = random.choice(vendor_cities)
    obj, made = Stay.objects.get_or_create(
        name=fake.company(),
        district=district,
        defaults=dict(
            type=random.choice(stay_types),
            rating=(None if random.random() < 0.2 else round(random.uniform(6.5, 9.6), 1)),
            priceNight=round(random.uniform(80, 420), 2),
            amenities=random.sample(
                ["WiFi", "Parking", "Breakfast", "Pool", "Gym", "AC", "Shuttle"],
                k=random.randint(2, 5),
            ),
            lat=round(random.uniform(5.3, 6.6), 6),
            lon=round(random.uniform(99.6, 100.8), 6),
            images=[],
            landmark=random.choice(["Near city center", "By the beach", "Near mall", "Near jetty"]),
            distanceKm=round(random.uniform(0.2, 12.0), 2),
            is_active=True,
        ),
    )
    if made:
        stay_created += 1
print(f"✅ Stays created: {stay_created} (total: {Stay.objects.count()})")

# ───────────────────────────────────────────────────────────
# Events (in Kedah)
# ───────────────────────────────────────────────────────────
# ───────────────────────────────────────────────────────────
# Events (in Kedah)
# ───────────────────────────────────────────────────────────
event_created = 0
for i in range(12):
    # first half are recent past (5–20 days ago), second half are upcoming (1–25 days ahead)
    if i < 6:
        start = now - timedelta(days=random.randint(5, 20))
    else:
        start = now + timedelta(days=random.randint(1, 25))
    end = start + timedelta(hours=random.randint(2, 48))
    city = random.choice(vendor_cities)

    obj, made = Event.objects.get_or_create(
        title=f"{random.choice(['Festival','Food Fair','Cultural Night','Marathon','Carnival','Expo'])} {fake.color_name()}",
        start_date=start,
        defaults=dict(
            description=fake.paragraph(nb_sentences=4),
            end_date=end,
            location_name=random.choice(["Dataran Alor Setar", "Langkawi Jetty", "City Park", "Town Hall"]),
            city=city,
            lat=round(random.uniform(5.3, 6.6), 6),
            lon=round(random.uniform(99.6, 100.8), 6),
            tags=random.sample(["festival", "music", "food", "sport", "family", "culture"], k=2),
            is_published=True,
            created_by=admin_user,  # Set the admin user as creator
        ),
    )
    if made:
        event_created += 1
print(f"✅ Events created: {event_created} (total: {Event.objects.count()})")


# ───────────────────────────────────────────────────────────
# Social Posts (link to Analytics Places)
# ───────────────────────────────────────────────────────────
post_created = 0
for place in aplace_objs:
    n_posts = random.randint(8, 18)
    for _ in range(n_posts):
        created_at = now - timedelta(days=random.randint(0, 28), hours=random.randint(0, 23))
        platform = random.choice(["facebook", "instagram", "tiktok", "twitter"])
        post_id = f"{platform}-{fake.uuid4()[:8]}"
        content = f"{place.name} {random.choice(['is amazing','is beautiful','so relaxing','must visit','worth it'])}! " \
                  f"{fake.sentence(nb_words=8)}"

        obj, made = SocialPost.objects.get_or_create(
            platform=platform,
            post_id=post_id,
            defaults=dict(
                url=f"https://{platform}.com/p/{post_id}",
                content=content,
                created_at=created_at,
                likes=random.randint(0, 1200),
                comments=random.randint(0, 180),
                shares=random.randint(0, 220),
                is_tourism=True,
                place=place,
                extra={"hashtags": random.sample(["#kedah", "#malaysia", "#travel", "#langkawi", "#food", "#nature"], k=2)},
            ),
        )
        if made:
            post_created += 1
print(f"✅ SocialPosts created: {post_created} (total: {SocialPost.objects.count()})")

# ───────────────────────────────────────────────────────────
# Summary
# ───────────────────────────────────────────────────────────
print("\n🎉 All tables seeded successfully!")
print(f"Places(analytics): {APlace.objects.count()}")
print(f"SocialPosts:       {SocialPost.objects.count()}")
print(f"Vendors:           {Vendor.objects.count()}")
print(f"Stays:             {Stay.objects.count()}")
print(f"Events:            {Event.objects.count()}")
