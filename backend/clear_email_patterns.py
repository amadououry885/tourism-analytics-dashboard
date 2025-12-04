#!/usr/bin/env python3
"""Clear strict email validation patterns from registration form fields"""
import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')

# Setup Django
django.setup()

from events.models import EventRegistrationField

# Find all email fields and clear their patterns
email_fields = EventRegistrationField.objects.filter(field_type='email')

print(f"Found {email_fields.count()} email fields")
print("-" * 50)

for field in email_fields:
    print(f"Event: {field.form.event.title}")
    print(f"Label: {field.label}")
    print(f"Old Pattern: '{field.pattern}'")
    
    # Clear the pattern to allow any format
    field.pattern = ''
    field.save()
    
    print("✓ Pattern cleared - now accepts any case!")
    print("-" * 50)

print("\nAll email fields updated successfully!")
print("Email addresses will now accept uppercase, lowercase, and mixed case.")
