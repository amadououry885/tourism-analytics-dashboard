#!/usr/bin/env python
"""
Script to add max_capacity to all events in production database.
Run this in Render Shell:
    python update_event_capacities.py
"""

import os
import django
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from events.models import Event

def update_event_capacities():
    """Add max_capacity and attendee_count to all events"""
    events = Event.objects.all()
    updated_count = 0
    
    for event in events:
        if event.max_capacity is None:
            # Set random capacity between 100-500
            event.max_capacity = random.randint(100, 500)
            event.attendee_count = random.randint(10, int(event.max_capacity * 0.7))
            event.save()
            print(f'✅ Updated {event.title}:')
            print(f'   Capacity: {event.max_capacity}')
            print(f'   Attendees: {event.attendee_count}')
            print(f'   Spots remaining: {event.max_capacity - event.attendee_count}\n')
            updated_count += 1
    
    print(f'\n🎉 Successfully updated {updated_count} out of {events.count()} events')
    return updated_count

if __name__ == '__main__':
    print('Starting event capacity update...\n')
    update_event_capacities()
    print('\n✅ Done!')
