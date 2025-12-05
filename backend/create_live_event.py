#!/usr/bin/env python
"""Create a live event happening NOW for testing"""

import os
import sys
import django
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from events.models import Event
from django.utils import timezone

now = timezone.now()

# Create a live event
live_event = Event.objects.create(
    title="🔴 LIVE: Sunday Night Market",
    description="Weekly night market with local food, crafts, and entertainment. Happening NOW!",
    location_name="Pekan Rabu Market, Alor Setar",
    city="Alor Setar",
    start_date=now - timedelta(hours=1),  # Started 1 hour ago
    end_date=now + timedelta(hours=3),     # Ends in 3 hours
    recurrence_type="weekly",
    max_capacity=1000,
    is_published=True,
    tags=["food", "market", "cultural"]
)

print(f"✅ Created LIVE event: {live_event.title}")
print(f"   ID: {live_event.id}")
print(f"   Start: {live_event.start_date}")
print(f"   End: {live_event.end_date}")
print(f"   Recurring: {live_event.recurrence_type}")
print(f"   is_happening_now: {live_event.is_happening_now}")
print(f"\n🌐 Test endpoint: http://127.0.0.1:8000/api/events/happening-now/")
print(f"🌐 All events: http://127.0.0.1:8000/api/events/")
print(f"🌐 Frontend: http://localhost:3002/")
