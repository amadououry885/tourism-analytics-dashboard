#!/usr/bin/env python
"""
Populate sample event attendance data for testing the attendance trend chart
Run: python manage.py shell < populate_attendance.py
"""

from events.models import Event
from datetime import datetime

# Update existing events with attendance data
events_to_update = [
    {
        'title_contains': 'Food Festival',
        'expected': 15000,
        'actual': 18500
    },
    {
        'title_contains': 'Tourism Expo',
        'expected': 10000,
        'actual': 9200
    }
]

print("Updating events with attendance data...\n")

for event_data in events_to_update:
    try:
        event = Event.objects.filter(title__icontains=event_data['title_contains']).first()
        if event:
            event.expected_attendance = event_data['expected']
            event.actual_attendance = event_data['actual']
            event.save()
            print(f"✓ Updated: {event.title}")
            print(f"  Expected: {event.expected_attendance:,}")
            print(f"  Actual: {event.actual_attendance:,}")
            print(f"  Variance: {event.actual_attendance - event.expected_attendance:+,}\n")
        else:
            print(f"✗ Event not found: {event_data['title_contains']}\n")
    except Exception as e:
        print(f"✗ Error updating {event_data['title_contains']}: {e}\n")

# Create some additional past events with attendance
new_events = [
    {
        'title': 'Kedah Heritage Walking Tour',
        'start_date': datetime(2024, 9, 20, 9, 0),
        'end_date': datetime(2024, 9, 20, 17, 0),
        'location_name': 'Alor Setar City Center',
        'city': 'Alor Setar',
        'description': 'Guided tour of historical sites in Alor Setar',
        'tags': ['cultural', 'heritage', 'walking'],
        'expected_attendance': 500,
        'actual_attendance': 620
    },
    {
        'title': 'Langkawi Night Market Festival',
        'start_date': datetime(2024, 10, 5, 18, 0),
        'end_date': datetime(2024, 10, 5, 23, 0),
        'location_name': 'Pantai Cenang',
        'city': 'Langkawi',
        'description': 'Evening market featuring local food and crafts',
        'tags': ['food', 'festival', 'market'],
        'expected_attendance': 8000,
        'actual_attendance': 9500
    },
    {
        'title': 'Kedah Adventure Sports Day',
        'start_date': datetime(2024, 8, 15, 8, 0),
        'end_date': datetime(2024, 8, 15, 18, 0),
        'location_name': 'Pedu Lake Resort',
        'city': 'Pedu Lake',
        'description': 'Water sports and outdoor activities competition',
        'tags': ['sport', 'adventure', 'outdoor'],
        'expected_attendance': 2000,
        'actual_attendance': 1850
    }
]

print("\nCreating new past events...\n")

for event_data in new_events:
    try:
        event, created = Event.objects.get_or_create(
            title=event_data['title'],
            defaults=event_data
        )
        if created:
            print(f"✓ Created: {event.title}")
            print(f"  Date: {event.start_date.strftime('%Y-%m-%d')}")
            print(f"  Expected: {event.expected_attendance:,}")
            print(f"  Actual: {event.actual_attendance:,}")
            print(f"  Variance: {event.actual_attendance - event.expected_attendance:+,}\n")
        else:
            print(f"○ Already exists: {event.title}\n")
    except Exception as e:
        print(f"✗ Error creating {event_data['title']}: {e}\n")

print("Done! Check the attendance trend chart in the dashboard.")
