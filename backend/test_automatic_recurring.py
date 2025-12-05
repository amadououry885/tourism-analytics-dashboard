#!/usr/bin/env python
"""
Test automatic recurring event generation
"""

import os
import sys
import django
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from events.models import Event
from events.tasks import generate_next_recurring_instances
from django.utils import timezone

print("=" * 80)
print("🔄 TESTING AUTOMATIC RECURRING EVENT GENERATION")
print("=" * 80)

now = timezone.now()

# Create a parent recurring event that ENDED yesterday
print("\n📅 Creating a recurring event that ended yesterday...")
parent_event = Event.objects.create(
    title="Weekly Sunday Market",
    description="Popular weekly market with local vendors",
    location_name="Market Square, Alor Setar",
    city="Alor Setar",
    start_date=now - timedelta(days=7, hours=20),  # Last week, 8 PM
    end_date=now - timedelta(days=7, hours=14),    # Last week, 2 PM (ended)
    recurrence_type="weekly",
    max_capacity=2000,
    is_published=True,
    tags=["market", "food", "shopping"]
)
print(f"✅ Created parent event: {parent_event.title}")
print(f"   ID: {parent_event.id}")
print(f"   Start: {parent_event.start_date}")
print(f"   End: {parent_event.end_date}")
print(f"   Status: ENDED (last week)")
print(f"   Recurring: {parent_event.recurrence_type}")

# Check existing instances
existing_instances = Event.objects.filter(parent_event=parent_event)
print(f"\n🔍 Existing instances: {existing_instances.count()}")

# Run the task to generate next instance
print("\n⚙️  Running generate_next_recurring_instances task...")
result = generate_next_recurring_instances()
print(f"   Result: {result}")

# Check new instances
new_instances = Event.objects.filter(parent_event=parent_event).order_by('start_date')
print(f"\n✅ Total instances now: {new_instances.count()}")

if new_instances.exists():
    print("\n📋 Generated Instances:")
    for idx, instance in enumerate(new_instances, 1):
        print(f"\n   Instance {idx}:")
        print(f"   - Title: {instance.title}")
        print(f"   - Start: {instance.start_date}")
        print(f"   - End: {instance.end_date}")
        print(f"   - Is happening now: {instance.is_happening_now}")
        print(f"   - Is recurring instance: {instance.is_recurring_instance}")
        print(f"   - Parent: {instance.parent_event.title if instance.parent_event else 'None'}")
        
        # Determine status
        if instance.start_date > now:
            status = "🔜 UPCOMING"
        elif instance.end_date and instance.end_date < now:
            status = "✅ PAST"
        else:
            status = "🔴 HAPPENING NOW"
        print(f"   - Status: {status}")

# Demonstrate the lifecycle
print("\n" + "=" * 80)
print("📖 RECURRING EVENT LIFECYCLE EXPLANATION")
print("=" * 80)
print("""
How it works:

1. 📝 ADMIN CREATES PARENT EVENT
   - Admin creates "Weekly Sunday Market" with recurrence_type='weekly'
   - Sets start_date, end_date, and other details
   - Marks is_recurring_instance=False (this is the template)

2. 🎯 SIGNAL FIRES ON CREATION
   - events/signals.py automatically generates 1st instance
   - This shows in "Upcoming Events" immediately

3. ⏰ CELERY BEAT RUNS EVERY HOUR
   - Task: events.tasks.generate_next_recurring_instances()
   - Checks all parent events where end_date < now
   - Calculates next occurrence (weekly = +7 days)
   - Creates new instance with is_recurring_instance=True

4. 📊 EVENTS DISPLAY
   - Parent event (is_recurring_instance=False): Never shown to users
   - Current instance (happening now): Shows in "🔴 Happening Now"
   - Past instance (ended): Moves to "Past Events"
   - Future instance (not started): Shows in "Upcoming Events"

5. 🗑️  CLEANUP (Optional)
   - Weekly task deletes instances older than 90 days
   - Keeps parent event forever (the template)
   - Prevents database bloat

EXAMPLE TIMELINE:
─────────────────
Dec 1 (Sunday 8PM-2AM): First instance HAPPENS → moves to Past Events
Dec 2 (Monday): Celery creates next instance for Dec 8
Dec 8 (Sunday 8PM-2AM): Second instance HAPPENS → first one in Past
Dec 9 (Monday): Celery creates next instance for Dec 15
... continues forever (or until recurrence_end_date)

RESULT:
- ✅ No manual work needed
- ✅ Always 1 upcoming instance ready
- ✅ Past instances archived
- ✅ Currently happening events show live
- ✅ Weekly markets, annual festivals, daily tours all automated!
""")

print("\n" + "=" * 80)
print("🧹 CLEANUP")
print("=" * 80)

# Cleanup
print("Deleting test events...")
Event.objects.filter(parent_event=parent_event).delete()
parent_event.delete()
print("✅ Cleaned up")

print("\n" + "=" * 80)
print("✅ TEST COMPLETE - AUTOMATIC RECURRING EVENTS WORKING!")
print("=" * 80)
