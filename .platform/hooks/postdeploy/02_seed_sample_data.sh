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

def mk_place(name, city, lat, lon, description="", price=None, currency="MYR",
             is_in_kedah=True, category=None, state="Kedah", country="Malaysia"):
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
    if not created:
        changed = False
        updates = dict(
            city=city, latitude=lat, longitude=lon, description=description,
            price=price, currency=currency, is_in_kedah=is_in_kedah,
            category=category, state=state, country=country
        )
        for k, v in updates.items():
            if v is not None and getattr(obj, k, None) != v:
                setattr(obj, k, v); changed = True
        if changed:
            obj.save()
    return obj

def mk_post(place, post_id, text, likes, shares, comments, hours_ago=12, platform="demo"):
    posted_at = timezone.now() - timedelta(hours=hours_ago)
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
        obj.place = place
        obj.text = text
        obj.like_count = likes
        obj.share_count = shares
        obj.comment_count = comments
        obj.posted_at = posted_at
        obj.save()
    return obj

places = {}
places['Pantai Cenang'] = mk_place("Pantai Cenang", "Langkawi", 6.292, 99.728,
    description="Langkawi’s lively beach with cafes & watersports.", category="Beach")
places['Langkawi Sky Bridge'] = mk_place("Langkawi Sky Bridge", "Langkawi", 6.384, 99.665,
    description="Curved pedestrian bridge with mountain & sea views.", category="Landmark")
places['Gunung Jerai'] = mk_place("Gunung Jerai", "Yan", 5.793, 100.435,
    description="Iconic mountain with cool highland scenery.", category="Nature")
places['Alor Setar Tower'] = mk_place("Alor Setar Tower", "Alor Setar", 6.121, 100.371,
    description="Telecoms tower with an observation deck.", category="Landmark")
places['Zahir Mosque'] = mk_place("Zahir Mosque", "Alor Setar", 6.1218, 100.3663,
    description="Historic mosque—symbol of Kedah’s heritage.", category="Religious")
places['Tanjung Rhu Beach'] = mk_place("Tanjung Rhu Beach", "Langkawi", 6.467, 99.817,
    description="Calmer beach with scenic limestone formations.", category="Beach")

mk_post(places['Pantai Cenang'], "cenang-001", "Sunset vibes at Pantai Cenang 🌅 #Langkawi", 320, 24, 18, hours_ago=6)
mk_post(places['Langkawi Sky Bridge'], "skybridge-001", "Sky Bridge views are unreal! 😍", 540, 61, 44, hours_ago=12)
mk_post(places['Gunung Jerai'], "jerai-001", "Cooling off at Gunung Jerai—foggy and fresh!", 210, 12, 8, hours_ago=26)
mk_post(places['Alor Setar Tower'], "astower-001", "City lights from the tower at night ✨", 155, 7, 10, hours_ago=16)
mk_post(places['Zahir Mosque'], "zahir-001", "Architectural beauty at Zahir Mosque 🕌", 270, 19, 15, hours_ago=20)
mk_post(places['Tanjung Rhu Beach'], "trhu-001", "Quiet morning walk on Tanjung Rhu beach", 190, 9, 6, hours_ago=8)
mk_post(places['Pantai Cenang'], "cenang-002", "Parasailing time! 🪂", 410, 33, 27, hours_ago=30)
mk_post(places['Langkawi Sky Bridge'], "skybridge-002", "Clouds rolled in—still magical.", 230, 11, 9, hours_ago=40)
mk_post(places['Gunung Jerai'], "jerai-002", "Local hawker stall near the trail—sedap!", 120, 6, 5, hours_ago=45)
mk_post(places['Alor Setar Tower'], "astower-002", "Day view is crisp—paddy fields visible.", 98, 3, 4, hours_ago=55)

print("[seed] Done.")
PY

echo "[seed] Completed."
