#!/usr/bin/env python
"""Show all events with registration forms"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from events.models import Event

print('='*80)
print('ALL EVENTS WITH CUSTOM REGISTRATION FORMS')
print('='*80)

events = Event.objects.filter(id__gte=12).order_by('id')
for event in events:
    if hasattr(event, 'registration_form'):
        form = event.registration_form
        guest = 'Guest Allowed' if form.allow_guest_registration else 'Login Required'
        capacity = event.max_capacity if event.max_capacity else 'Unlimited'
        
        print(f'\nEvent #{event.id}: {event.title}')
        print(f'  Form: {form.title}')
        print(f'  Fields: {form.fields.count()}')
        print(f'  Guest: {guest}')
        print(f'  City: {event.city}')
        print(f'  Capacity: {capacity}')
        print(f'  API: GET /api/events/{event.id}/registration_form/')

total = Event.objects.filter(id__gte=12).count()
print(f'\nTotal events with forms: {total}')
print('='*80)
