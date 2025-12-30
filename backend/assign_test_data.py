#!/usr/bin/env python3
"""Assign vendors and stays to test accounts"""
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tourism_api.settings")

import django
django.setup()

from users.models import User
from vendors.models import Vendor
from stays.models import Stay

print("🔄 Assigning vendors and stays to test accounts...\n")

# Get test users
vendor1 = User.objects.get(email='vendor1@example.com')
vendor2 = User.objects.get(email='vendor2@example.com')
stay1 = User.objects.get(email='stay@example.com')
stay2 = User.objects.get(email='stay2@test.com')
admin = User.objects.get(email='admin@example.com')

# Assign some admin vendors to vendor accounts
admin_vendors = Vendor.objects.filter(owner=admin)[:20]

# Give 10 to vendor1
for v in admin_vendors[:10]:
    v.owner = vendor1
    v.save()
print(f"✅ Assigned 10 vendors to vendor1@example.com")

# Give 10 to vendor2  
for v in admin_vendors[10:20]:
    v.owner = vendor2
    v.save()
print(f"✅ Assigned 10 vendors to vendor2@example.com")

# Assign some admin stays to stay owner accounts
admin_stays = Stay.objects.filter(owner=admin)[:20]

# Give 10 to stay1
for s in admin_stays[:10]:
    s.owner = stay1
    s.save()
print(f"✅ Assigned 10 stays to stay@example.com")

# Give 10 to stay2
for s in admin_stays[10:20]:
    s.owner = stay2
    s.save()
print(f"✅ Assigned 10 stays to stay2@test.com")

print("\n" + "="*50)
print("📊 FINAL OWNERSHIP SUMMARY")
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
print("✅ Test accounts are ready for portal testing!")
print("="*50)
