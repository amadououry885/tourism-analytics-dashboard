#!/usr/bin/env python3
"""Restore original ownership - undo the incorrect assignments"""
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tourism_api.settings")

import django
django.setup()

from users.models import User
from vendors.models import Vendor
from stays.models import Stay

print("🔄 Restoring original ownership (reverting incorrect changes)...\n")

# Get admin user
admin = User.objects.get(email='admin@example.com')

# Restore all vendors back to admin (since they're real businesses)
vendor1 = User.objects.get(email='vendor1@example.com')
vendor2 = User.objects.get(email='vendor2@example.com')

vendors_v1 = Vendor.objects.filter(owner=vendor1)
vendors_v2 = Vendor.objects.filter(owner=vendor2)

v1_count = vendors_v1.count()
v2_count = vendors_v2.count()

vendors_v1.update(owner=admin)
vendors_v2.update(owner=admin)

print(f"✅ Restored {v1_count} vendors from vendor1 back to admin")
print(f"✅ Restored {v2_count} vendors from vendor2 back to admin")

# Restore all stays back to admin (since they're real accommodations)
stay1 = User.objects.get(email='stay@example.com')
stay2 = User.objects.get(email='stay2@test.com')

stays_s1 = Stay.objects.filter(owner=stay1)
stays_s2 = Stay.objects.filter(owner=stay2)

s1_count = stays_s1.count()
s2_count = stays_s2.count()

stays_s1.update(owner=admin)
stays_s2.update(owner=admin)

print(f"✅ Restored {s1_count} stays from stay1 back to admin")
print(f"✅ Restored {s2_count} stays from stay2 back to admin")

print("\n" + "="*50)
print("📊 CURRENT OWNERSHIP")
print("="*50)

from django.db.models import Count

print("\n🍽️ VENDORS:")
vendor_ownership = Vendor.objects.values('owner__email').annotate(count=Count('id'))
for o in vendor_ownership:
    print(f"   {o['owner__email']}: {o['count']} restaurants")

print("\n🏨 STAYS:")
stay_ownership = Stay.objects.values('owner__email').annotate(count=Count('id'))
for o in stay_ownership:
    print(f"   {o['owner__email']}: {o['count']} accommodations")

print("\n" + "="*50)
print("✅ Original ownership restored!")
print("="*50)
