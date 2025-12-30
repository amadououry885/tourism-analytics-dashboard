#!/usr/bin/env python3
"""Reset passwords for test accounts"""
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tourism_api.settings")

import django
django.setup()

from users.models import User

# Reset passwords for test accounts
test_accounts = [
    ('admin@example.com', 'admin123', 'admin'),
    ('vendor1@example.com', 'vendor123', 'vendor'),
    ('vendor2@example.com', 'vendor123', 'vendor'),
    ('stay@example.com', 'stay123', 'stay_owner'),
    ('stay2@test.com', 'stay123', 'stay_owner'),
]

print("🔐 Resetting test account passwords...\n")

for email, password, role in test_accounts:
    try:
        user = User.objects.get(email=email)
        user.set_password(password)
        user.is_approved = True
        user.is_active = True
        user.save()
        print(f"✅ {email}")
        print(f"   Password: {password}")
        print(f"   Role: {role}")
        print(f"   Approved: {user.is_approved}")
        print()
    except User.DoesNotExist:
        print(f"❌ User not found: {email}")
        print()

print("\n" + "="*50)
print("📋 TEST CREDENTIALS SUMMARY")
print("="*50)
print("\n🔹 ADMIN:")
print("   Email: admin@example.com")
print("   Password: admin123")
print("\n🔹 VENDOR 1:")
print("   Email: vendor1@example.com")
print("   Password: vendor123")
print("\n🔹 VENDOR 2:")
print("   Email: vendor2@example.com")
print("   Password: vendor123")
print("\n🔹 STAY OWNER 1:")
print("   Email: stay@example.com")
print("   Password: stay123")
print("\n🔹 STAY OWNER 2:")
print("   Email: stay2@test.com")
print("   Password: stay123")
print("="*50)
