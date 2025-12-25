#!/usr/bin/env python3
"""
Add demo contact information to all internal stays
"""
import os
import sys
import django
import random

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from stays.models import Stay

# Demo contact templates
PHONE_PREFIXES = ['+60 4-', '+60 16-', '+60 17-', '+60 12-', '+60 19-']
WHATSAPP_PREFIXES = ['60164', '60174', '60124', '60194', '60134']

def generate_phone():
    """Generate a realistic Malaysian phone number"""
    prefix = random.choice(PHONE_PREFIXES)
    if prefix.startswith('+60 4-'):
        # Landline
        number = f"{random.randint(700, 799)} {random.randint(1000, 9999)}"
    else:
        # Mobile
        number = f"{random.randint(100, 999)} {random.randint(1000, 9999)}"
    return f"{prefix}{number}"

def generate_whatsapp():
    """Generate WhatsApp number (Malaysian format)"""
    prefix = random.choice(WHATSAPP_PREFIXES)
    number = f"{random.randint(1000000, 9999999)}"
    return f"{prefix}{number}"

def generate_email(stay_name):
    """Generate email based on stay name"""
    # Clean stay name
    name_parts = stay_name.lower().replace(',', '').replace('and', '').split()
    if len(name_parts) > 0:
        base_name = name_parts[0]
    else:
        base_name = 'stay'
    
    domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    suffixes = ['kedah', 'langkawi', 'alorsetar', 'malaysia', 'stay', 'hotel']
    
    return f"{base_name}.{random.choice(suffixes)}@{random.choice(domains)}"

def main():
    print("🏨 Adding contact information to internal stays...")
    
    # Get all internal stays
    internal_stays = Stay.objects.filter(is_internal=True)
    total = internal_stays.count()
    
    print(f"Found {total} internal stays")
    
    updated = 0
    for stay in internal_stays:
        # Only update if contacts are missing
        if not stay.contact_phone and not stay.contact_whatsapp and not stay.contact_email:
            stay.contact_phone = generate_phone()
            stay.contact_whatsapp = generate_whatsapp()
            stay.contact_email = generate_email(stay.name)
            stay.save()
            updated += 1
            print(f"✅ {stay.name}")
            print(f"   📞 {stay.contact_phone}")
            print(f"   💬 {stay.contact_whatsapp}")
            print(f"   📧 {stay.contact_email}")
        else:
            print(f"⏭️  {stay.name} (already has contacts)")
    
    print(f"\n✨ Updated {updated} out of {total} internal stays")
    print("🎉 Done!")

if __name__ == '__main__':
    main()
