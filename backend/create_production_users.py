#!/usr/bin/env python3
"""
Create test user accounts for production deployment.
Run this script on the production server to create the same test accounts.

Usage:
    python create_production_users.py
"""
import os
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tourism_api.settings")
django.setup()

from users.models import User
from vendors.models import Vendor
from stays.models import Stay

print("\n" + "="*70)
print("🔐 Creating Production Test Accounts")
print("="*70)

# Define test accounts
test_accounts = [
    {
        'username': 'admin',
        'email': 'admin@example.com',
        'password': 'admin123',
        'role': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'username': 'vendor1',
        'email': 'vendor1@example.com',
        'password': 'vendor123',
        'role': 'vendor',
        'first_name': 'Vendor',
        'last_name': 'One',
    },
    {
        'username': 'vendor2',
        'email': 'vendor2@example.com',
        'password': 'vendor123',
        'role': 'vendor',
        'first_name': 'Vendor',
        'last_name': 'Two',
    },
    {
        'username': 'OuryRestau',
        'email': 'amadouodiallo77@gmail.com',
        'password': 'vendor123',
        'role': 'vendor',
        'first_name': 'Amadou',
        'last_name': 'Diallo',
    },
    {
        'username': 'stayowner1',
        'email': 'stay@example.com',
        'password': 'stay123',
        'role': 'stay_owner',
        'first_name': 'Stay',
        'last_name': 'Owner One',
    },
    {
        'username': 'stayowner2',
        'email': 'stay2@test.com',
        'password': 'stay123',
        'role': 'stay_owner',
        'first_name': 'Stay',
        'last_name': 'Owner Two',
    },
    {
        'username': 'NaimFOOD',
        'email': 'hasib.naeim08@gmail.com',
        'password': 'stay123',
        'role': 'stay_owner',
        'first_name': 'Hasib',
        'last_name': 'Naeim',
    },
]

created = 0
updated = 0
errors = 0

for account in test_accounts:
    try:
        username = account['username']
        email = account['email']
        password = account.pop('password')
        
        # Check if user exists by email or username
        user = None
        try:
            user = User.objects.get(email=email)
            print(f"\n⚠️  User exists: {username} ({email})")
            # Update password and approval
            user.set_password(password)
            user.is_approved = True
            user.is_active = True
            user.username = username
            user.role = account['role']
            user.save()
            print(f"   ✅ Updated password and settings")
            updated += 1
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create(**account)
            user.set_password(password)
            user.is_approved = True
            user.is_active = True
            user.save()
            print(f"\n✅ Created: {username} ({email})")
            print(f"   Role: {account['role']}")
            print(f"   Password: {password}")
            created += 1
            
    except Exception as e:
        print(f"\n❌ Error creating {account.get('username', 'unknown')}: {e}")
        errors += 1

print("\n" + "="*70)
print("📊 SUMMARY")
print("="*70)
print(f"Created: {created}")
print(f"Updated: {updated}")
print(f"Errors: {errors}")
print(f"Total: {created + updated}")

print("\n" + "="*70)
print("✅ CREDENTIALS READY FOR USE")
print("="*70)
print("\n👨‍💼 ADMIN:")
print("   Username: admin")
print("   Password: admin123")
print("\n🍽️  VENDORS:")
print("   Username: vendor1 / Password: vendor123")
print("   Username: vendor2 / Password: vendor123")
print("   Username: OuryRestau / Password: vendor123")
print("\n🏨 STAY OWNERS:")
print("   Username: stayowner1 / Password: stay123")
print("   Username: stayowner2 / Password: stay123")
print("   Username: NaimFOOD / Password: stay123")
print("="*70)

# Optional: Link OuryRestau to their restaurant if it exists
print("\n🔗 Linking businesses to owners...")
try:
    oury_user = User.objects.get(username='OuryRestau')
    oury_restaurant = Vendor.objects.filter(name__icontains='OuryRestau').first()
    
    if oury_restaurant:
        oury_restaurant.owner = oury_user
        oury_restaurant.save()
        print(f"✅ Linked OuryRestau restaurant to {oury_user.username}")
    else:
        print("⚠️  OuryRestau restaurant not found in database")
except Exception as e:
    print(f"⚠️  Could not link restaurant: {e}")

print("\n✅ Production users setup complete!")
