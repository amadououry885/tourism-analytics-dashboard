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
from transport.models import Place as TPlace, Route
from vendors.models import Vendor
from users.models import User

fake = Faker()

# Get or create admin user for foreign keys
admin_user, _ = User.objects.get_or_create(
    email='admin@kedahtourism.com',
    defaults={
        'name': 'Admin User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
        'is_approved': True,
    }
)
if _:
    admin_user.set_password('admin123')
    admin_user.save()
    print(f"✅ Created admin user: {admin_user.email}")

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
    # name, city, lat, lon
    ("Alor Setar",     "Alor Setar",    6.1248, 100.3676),
    ("Langkawi",       "Langkawi",      6.3500,  99.8000),
    ("Gunung Jerai",   "Gurun",         5.7900, 100.4300),
    ("Sungai Petani",  "Sungai Petani", 5.6497, 100.4873),
    ("Kulim",          "Kulim",         5.3647, 100.5616),
]

outside_places = [
    ("Kuala Lumpur",   3.1390, 101.6869),
    ("George Town",    5.4141, 100.3288),  # Penang
    ("Ipoh",           4.5975, 101.0901),
]

# Analytics places (richer schema)
aplace_objs = []
for name, city, lat, lon in kedah_places:
    obj, _ = APlace.objects.get_or_create(
        name=name,
        defaults=dict(
            description=fake.paragraph(nb_sentences=3),
            category=random.choice(["Attraction", "Nature", "Beach", "Food", "Shopping"]),
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

# Transport places (Kedah + outside)
tplace_map = {}
for name, city, lat, lon in kedah_places:
    obj, _ = TPlace.objects.get_or_create(
        name=name,
        defaults=dict(lat=lat, lon=lon, is_in_kedah=True),
    )
    tplace_map[name] = obj

for name, lat, lon in outside_places:
    obj, _ = TPlace.objects.get_or_create(
        name=name,
        defaults=dict(lat=lat, lon=lon, is_in_kedah=False),
    )
    tplace_map[name] = obj

print(f"✅ Analytics Places: {APlace.objects.count()} | Transport Places: {TPlace.objects.count()}")

# ───────────────────────────────────────────────────────────
# Vendors (in Kedah)
# ───────────────────────────────────────────────────────────
cuisine_pool = [
    "Malay", "Nasi Kandar", "Seafood", "Thai", "Indian-Muslim", "Cafe",
    "Western", "Satay", "Laksa", "Dessert"
]
vendor_cities = [c for _, c, _, _ in kedah_places]

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
    city = random.choice([c for _, c, _, _ in kedah_places])

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
# Routes (Transport)
# ───────────────────────────────────────────────────────────
def add_route(fp, tp, rtype, options):
    obj, _ = Route.objects.get_or_create(
        from_place=fp, to_place=tp, route_type=rtype,
        defaults=dict(options=options, polyline=None)
    )
    return obj

# Key nodes
AS = tplace_map["Alor Setar"]
LGK = tplace_map["Langkawi"]
SP = tplace_map["Sungai Petani"]
KUL = tplace_map["Kuala Lumpur"]
PEN = tplace_map["George Town"]
IPOH = tplace_map["Ipoh"]

# Intra-Kedah
add_route(AS, LGK, "intra_kedah", [
    {"mode": "Bus", "durationMin": 210, "priceMin": 35, "priceMax": 55, "provider": "Transnasional"},
    {"mode": "Ferry (via Kuala Kedah)", "durationMin": 120, "priceMin": 18, "priceMax": 28, "provider": "Langkawi Ferry"},
])
add_route(AS, SP, "intra_kedah", [
    {"mode": "Train (ETS)", "durationMin": 35, "priceMin": 12, "priceMax": 20, "provider": "KTMB"},
    {"mode": "Bus", "durationMin": 50, "priceMin": 8, "priceMax": 12, "provider": "Local"},
])
add_route(SP, LGK, "intra_kedah", [
    {"mode": "Bus+Ferry", "durationMin": 180, "priceMin": 30, "priceMax": 45, "provider": "Combo"},
])

# Coming to Kedah
add_route(KUL, AS, "coming_to_kedah", [
    {"mode": "Train (ETS)", "durationMin": 300, "priceMin": 60, "priceMax": 90, "provider": "KTMB"},
    {"mode": "Flight to LGK + Bus", "durationMin": 180, "priceMin": 120, "priceMax": 280, "provider": "Various"},
])
add_route(PEN, AS, "coming_to_kedah", [
    {"mode": "Bus", "durationMin": 120, "priceMin": 12, "priceMax": 20, "provider": "Rapid"},
    {"mode": "Car", "durationMin": 90, "priceMin": 40, "priceMax": 60, "provider": "Drive"},
])

# Leaving Kedah
add_route(AS, KUL, "leaving_kedah", [
    {"mode": "Train (ETS)", "durationMin": 300, "priceMin": 60, "priceMax": 90, "provider": "KTMB"},
    {"mode": "Bus", "durationMin": 420, "priceMin": 50, "priceMax": 70, "provider": "Transnasional"},
])
add_route(AS, IPOH, "leaving_kedah", [
    {"mode": "Train (ETS)", "durationMin": 180, "priceMin": 35, "priceMax": 55, "provider": "KTMB"},
])

print("✅ Routes ensured (intra, coming_to_kedah, leaving_kedah)")

# ───────────────────────────────────────────────────────────
# Summary
# ───────────────────────────────────────────────────────────
print("\n🎉 All tables seeded successfully!")
print(f"Places(analytics): {APlace.objects.count()}")
print(f"SocialPosts:       {SocialPost.objects.count()}")
print(f"Vendors:           {Vendor.objects.count()}")
print(f"Stays:             {Stay.objects.count()}")
print(f"Events:            {Event.objects.count()}")
print(f"Places(transport): {TPlace.objects.count()}")
print(f"Routes:            {Route.objects.count()}")
