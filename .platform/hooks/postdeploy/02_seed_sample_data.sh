#!/usr/bin/env bash
set -euo pipefail

# Only seed when explicitly enabled
if [ "${SEED_SAMPLE:-0}" != "1" ]; then
  echo "[seed] SEED_SAMPLE != 1, skipping sample data seeding."
  exit 0
fi

echo "[seed] Seeding sample Places + SocialPosts..."

cd /var/app/current/backend || { echo "[seed] backend dir missing"; exit 1; }

# Activate EB venv if present
if compgen -G "/var/app/venv/*/bin/activate" > /dev/null; then
  # shellcheck disable=SC1090
  source /var/app/venv/*/bin/activate
fi

export DJANGO_SETTINGS_MODULE=tourism_api.settings
export PYTHONPATH="/var/app/current/backend:${PYTHONPATH:-}"

python - <<'PY'
from django.utils import timezone
from datetime import timedelta
from analytics.models import Place, SocialPost

# --- Helper creators (idempotent) ---
def mk_place(name, city, lat, lon, description="", price=None, currency="MYR", is_in_kedah=True, category=None, state="Kedah", country="Malaysia"):
    obj, created = Place.objects.get_or_create(
        name=name,
        defaults=dict(
            city=city,
            latitude=lat,
            longitude=lon,
            description=description,
            price=price,
            currency=currency,
            is_in_kedah=is_in_kedah,
            category=category,
            state=state,
            country=country,
        )
    )
    # If it already exists, update key fields (so you can tweak text later)
    if not created:
        changed = False
        for k, v in dict(
            city=city, latitude=lat, longitude=lon,
            description=description, price=price, currency=currency,
            is_in_kedah=is_in_kedah, category=category,
            state=state, country=country
        ).items():
            if getattr(obj, k, None) != v and v is not None:
                setattr(obj, k, v); changed = True
        if changed: obj.save()
    return obj

def mk_post(place, post_id, text, likes, shares, comments, hours_ago=12, platform="demo"):
    posted_at = timezone.now() - timedelta(hours=hours_ago)
    # Uniqueness is typically by (platform, post_id). Adjust if your model differs.
    obj, created = SocialPost.objects.get_or_create(
        platform=platform, post_id=post_id,
        defaults=dict(
            place=place,
            text=text,
            like_count=likes,
            share_count=shares,
            comment_count=comments,
            posted_at=posted_at,
        )
    )
    if not created:
        # keep it fresh on re-seed
        obj.place = place
        obj.text = text
        obj.like_count = likes
        obj.share_count = shares
        obj.comment_count = comments
        obj.posted_at = posted_at
        obj.save()
    return obj

# --- Places (sample) ---
places = {}
places['Pantai Cenang'] = mk_place(
    name="Pantai Cenang", city="Langkawi", lat=6.292, lon=99.728,
    description="Langkawi’s lively beach with cafes & watersports.", category="Beach"
)
places['Langkawi Sky Bridge'] = mk_place(
    name="Langkawi Sky Bridge", city="Langkawi", lat=6.384, lon=99.665,
    description="Curved pedestrian bridge with mountain & sea views.", category="Landmark"
)
places['Gunung Jerai'] = mk_place(
    name="Gunung Jerai", city="Yan", lat=5.793, lon=100.435,
    description="Iconic mountain of Kedah with cool highland scenery.", category="Nature"
)
places['Alor Setar Tower'] = mk_place(
    name="Alor Setar Tower", city="Alor Setar", lat=6.121, lon=100.371,
    description="Telecoms tower with an observation deck over the city.", category="Landmark"
)
places['Zahir Mosque'] = mk_place(
    name="Zahir Mosque", city="Alor Setar", lat=6.1218, lon=100.3663,
    description="Historic mosque and symbol of Kedah’s heritage.", category="Religious"
)
places['Tanjung Rhu Beach'] = mk_place(
    name="Tanjung Rhu Beach", city="Langkawi", lat=6.467, lon=99.817,
    description="Calmer beach with scenic limestone formations.", category="Beach"
)

# --- Social posts (sample) ---
mk_post(places['Pantai Cenang'], "cenang-001",
        "Sunset vibes at Pantai Cenang 🌅 #Langkawi", likes=320, shares=24, comments=18, hours_ago=6)
mk_post(places['Langkawi Sky Bridge'], "skybridge-001",
        "Sky Bridge views are unreal! 😍", likes=540, shares=61, comments=44, hours_ago=12)
mk_post(places['Gunung Jerai'], "jerai-001",
        "Cooling off at Gunung Jerai—foggy and fresh!", likes=210, shares=12, comments=8, hours_ago=26)
mk_post(places['Alor Setar Tower'], "astower-001",
        "City lights from the tower at night ✨", likes=155, shares=7, comments=10, hours_ago=16)
mk_post(places['Zahir Mosque'], "zahir-001",
        "Architectural beauty at Zahir Mosque 🕌", likes=270, shares=19, comments=15, hours_ago=20)
mk_post(places['Tanjung Rhu Beach'], "trhu-001",
        "Quiet morning walk on Tanjung Rhu beach", likes=190, shares=9, comments=6, hours_ago=8)

# a few extra variants to simulate activity
mk_post(places['Pantai Cenang'], "cenang-002",
        "Parasailing time! 🪂", likes=410, shares=33, comments=27, hours_ago=30)
mk_post(places['Langkawi Sky Bridge'], "skybridge-002",
        "Clouds rolled in—still magical.", likes=230, shares=11, comments=9, hours_ago=40)
mk_post(places['Gunung Jerai'], "jerai-002",
        "Local hawker stall near the trail—sedap!", likes=120, shares=6, comments=5, hours_ago=45)
mk_post(places['Alor Setar Tower'], "astower-002",
        "Day view is crisp—can see the paddy fields.", likes=98, shares=3, comments=4, hours_ago=55)

print("[seed] Done.")
PY

echo "[seed] Completed."
