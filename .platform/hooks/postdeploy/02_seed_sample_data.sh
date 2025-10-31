#!/usr/bin/env bash
set -euo pipefail

# Only seed when explicitly enabled
if [ "${SEED_SAMPLE:-0}" != "1" ]; then
  echo "[seed] SEED_SAMPLE != 1, skipping sample data seeding."
  exit 0
fi

echo "[seed] Seeding sample Places + SocialPosts (model-aware)..."

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
from django.apps import apps

Place = apps.get_model("analytics", "Place")
SocialPost = apps.get_model("analytics", "SocialPost")

# Build a set of REAL field names for safety
place_field_names = {f.name for f in Place._meta.get_fields() if hasattr(f, "attname")}
social_field_names = {f.name for f in SocialPost._meta.get_fields() if hasattr(f, "attname")}

def filter_defaults(model_fields, data: dict):
    """Keep only keys that are real model fields."""
    return {k: v for k, v in data.items() if k in model_fields}

def mk_place(**kwargs):
    # Minimal required: name (and anything your model requires)
    name = kwargs["name"]
    defaults = filter_defaults(place_field_names, kwargs)
    defaults.pop("name", None)  # not a default
    obj, created = Place.objects.get_or_create(name=name, defaults=defaults)
    if not created:
        changed = False
        for k, v in defaults.items():
            if getattr(obj, k, None) != v:
                setattr(obj, k, v); changed = True
        if changed:
            obj.save()
    return obj

def mk_post(place, **kwargs):
    # Ensure required fields exist, compute posted_at if not given
    data = dict(kwargs)
    if "posted_at" not in data and "posted_at" in social_field_names:
        hours_ago = data.pop("hours_ago", 12)
        data["posted_at"] = timezone.now() - timedelta(hours=hours_ago)
    # Upsert by (platform, post_id) if those fields exist
    lookup = {}
    for key in ("platform", "post_id"):
        if key in social_field_names and key in data:
            lookup[key] = data[key]
    defaults = filter_defaults(social_field_names, data)
    defaults["place"] = place
    if lookup:
        obj, created = SocialPost.objects.get_or_create(**lookup, defaults=defaults)
        if not created:
            # update mutable fields safely
            for k, v in defaults.items():
                setattr(obj, k, v)
            obj.save()
    else:
        # Fallback: create blindly if no unique lookup fields exist
        obj = SocialPost.objects.create(**defaults)
    return obj

# ---- Seed data (these keys are safely filtered) ----
P = {}
P["Pantai Cenang"] = mk_place(
    name="Pantai Cenang", city="Langkawi",
    latitude=6.292, longitude=99.728,
    description="Langkawi’s lively beach with cafes & watersports.",
    category="Beach", is_in_kedah=True, state="Kedah", country="Malaysia", currency="MYR",
)
P["Langkawi Sky Bridge"] = mk_place(
    name="Langkawi Sky Bridge", city="Langkawi",
    latitude=6.384, longitude=99.665,
    description="Curved pedestrian bridge with mountain & sea views.",
    category="Landmark", is_in_kedah=True, state="Kedah", country="Malaysia",
)
P["Gunung Jerai"] = mk_place(
    name="Gunung Jerai", city="Yan",
    latitude=5.793, longitude=100.435,
    description="Iconic mountain with cool highland scenery.",
    category="Nature", is_in_kedah=True,
)
P["Alor Setar Tower"] = mk_place(
    name="Alor Setar Tower", city="Alor Setar",
    latitude=6.121, longitude=100.371,
    description="Telecoms tower with an observation deck.",
    category="Landmark", is_in_kedah=True,
)
P["Zahir Mosque"] = mk_place(
    name="Zahir Mosque", city="Alor Setar",
    latitude=6.1218, longitude=100.3663,
    description="Historic mosque—symbol of Kedah’s heritage.",
    category="Religious", is_in_kedah=True,
)
P["Tanjung Rhu Beach"] = mk_place(
    name="Tanjung Rhu Beach", city="Langkawi",
    latitude=6.467, longitude=99.817,
    description="Calmer beach with scenic limestone formations.",
    category="Beach", is_in_kedah=True,
)

mk_post(P["Pantai Cenang"], platform="demo", post_id="cenang-001",
        text="Sunset vibes at Pantai Cenang 🌅 #Langkawi",
        like_count=320, share_count=24, comment_count=18, hours_ago=6)
mk_post(P["Langkawi Sky Bridge"], platform="demo", post_id="skybridge-001",
        text="Sky Bridge views are unreal! 😍",
        like_count=540, share_count=61, comment_count=44, hours_ago=12)
mk_post(P["Gunung Jerai"], platform="demo", post_id="jerai-001",
        text="Cooling off at Gunung Jerai—foggy and fresh!",
        like_count=210, share_count=12, comment_count=8, hours_ago=26)
mk_post(P["Alor Setar Tower"], platform="demo", post_id="astower-001",
        text="City lights from the tower at night ✨",
        like_count=155, share_count=7, comment_count=10, hours_ago=16)
mk_post(P["Zahir Mosque"], platform="demo", post_id="zahir-001",
        text="Architectural beauty at Zahir Mosque 🕌",
        like_count=270, share_count=19, comment_count=15, hours_ago=20)
mk_post(P["Tanjung Rhu Beach"], platform="demo", post_id="trhu-001",
        text="Quiet morning walk on Tanjung Rhu beach",
        like_count=190, share_count=9, comment_count=6, hours_ago=8)
mk_post(P["Pantai Cenang"], platform="demo", post_id="cenang-002",
        text="Parasailing time! 🪂",
        like_count=410, share_count=33, comment_count=27, hours_ago=30)
mk_post(P["Langkawi Sky Bridge"], platform="demo", post_id="skybridge-002",
        text="Clouds rolled in—still magical.",
        like_count=230, share_count=11, comment_count=9, hours_ago=40)
mk_post(P["Gunung Jerai"], platform="demo", post_id="jerai-002",
        text="Local hawker stall near the trail—sedap!",
        like_count=120, share_count=6, comment_count=5, hours_ago=45)
mk_post(P["Alor Setar Tower"], platform="demo", post_id="astower-002",
        text="Day view is crisp—paddy fields visible.",
        like_count=98, share_count=3, comment_count=4, hours_ago=55)

print("[seed] Done (model-aware).")
PY

echo "[seed] Completed."

