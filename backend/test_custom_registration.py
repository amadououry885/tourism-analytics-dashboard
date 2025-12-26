#!/usr/bin/env python3
"""
Test script for custom registration forms and approval workflow
Run from backend directory: python3 test_custom_registration.py
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from events.models import Event, EventRegistration
from users.models import User
from django.utils import timezone
from datetime import timedelta

def test_auto_approval_event():
    """Test 1: Create event with auto-approval (requires_approval=False)"""
    print("\n" + "="*60)
    print("TEST 1: Auto-Approval Event")
    print("="*60)
    
    # Get admin user
    admin = User.objects.filter(role='admin').first()
    if not admin:
        print("❌ No admin user found. Please create one first.")
        return
    
    # Create event with custom form
    event = Event.objects.create(
        title="Community Workshop - Auto Approved",
        description="A workshop open to all community members",
        start_date=timezone.now() + timedelta(days=30),
        location_name="Community Center",
        city="Alor Setar",
        created_by=admin,
        requires_approval=False,  # Auto-approve
        registration_form_config=[
            {
                "id": "field_1",
                "label": "Full Name",
                "field_type": "text",
                "is_required": True,
                "placeholder": "Enter your full name",
                "order": 0
            },
            {
                "id": "field_2",
                "label": "Email Address",
                "field_type": "email",
                "is_required": True,
                "placeholder": "your.email@example.com",
                "order": 1
            },
            {
                "id": "field_3",
                "label": "Skill Level",
                "field_type": "select",
                "is_required": True,
                "options": ["Beginner", "Intermediate", "Advanced"],
                "order": 2
            }
        ]
    )
    
    print(f"✅ Created event: {event.title}")
    print(f"   ID: {event.id}")
    print(f"   Requires Approval: {event.requires_approval}")
    print(f"   Custom Fields: {len(event.registration_form_config)}")
    
    # Simulate registration
    registration = EventRegistration.objects.create(
        event=event,
        status='confirmed',  # Auto-confirmed
        form_data={
            "full_name": "Alice Johnson",
            "email_address": "alice@example.com",
            "skill_level": "Intermediate"
        },
        contact_name="Alice Johnson",
        contact_email="alice@example.com"
    )
    
    print(f"\n✅ Registration created:")
    print(f"   Name: {registration.contact_name}")
    print(f"   Status: {registration.status}")
    print(f"   Form Data: {registration.form_data}")
    
    return event

def test_approval_required_event():
    """Test 2: Create event requiring approval"""
    print("\n" + "="*60)
    print("TEST 2: Approval Required Event")
    print("="*60)
    
    admin = User.objects.filter(role='admin').first()
    if not admin:
        print("❌ No admin user found")
        return
    
    # Create VIP event requiring approval
    event = Event.objects.create(
        title="VIP Networking Event - Approval Required",
        description="Exclusive networking event for industry professionals",
        start_date=timezone.now() + timedelta(days=45),
        location_name="Grand Hotel Ballroom",
        city="Alor Setar",
        created_by=admin,
        requires_approval=True,  # Requires approval
        approval_message="Thank you for applying! Your application will be reviewed within 2 business days.",
        registration_form_config=[
            {
                "id": "field_1",
                "label": "Full Name",
                "field_type": "text",
                "is_required": True,
                "order": 0
            },
            {
                "id": "field_2",
                "label": "Email Address",
                "field_type": "email",
                "is_required": True,
                "order": 1
            },
            {
                "id": "field_3",
                "label": "Phone Number",
                "field_type": "tel",
                "is_required": True,
                "order": 2
            },
            {
                "id": "field_4",
                "label": "Company/Organization",
                "field_type": "text",
                "is_required": True,
                "order": 3
            },
            {
                "id": "field_5",
                "label": "Why do you want to attend?",
                "field_type": "textarea",
                "is_required": True,
                "order": 4
            }
        ]
    )
    
    print(f"✅ Created event: {event.title}")
    print(f"   ID: {event.id}")
    print(f"   Requires Approval: {event.requires_approval}")
    print(f"   Approval Message: {event.approval_message[:50]}...")
    print(f"   Custom Fields: {len(event.registration_form_config)}")
    
    # Create pending registration
    pending_reg = EventRegistration.objects.create(
        event=event,
        status='pending',  # Pending approval
        form_data={
            "full_name": "Bob Smith",
            "email_address": "bob@company.com",
            "phone_number": "+60 12-345-6789",
            "company_organization": "Tech Innovations Ltd",
            "why_do_you_want_to_attend": "I'm interested in networking with local tourism industry leaders to explore partnership opportunities."
        },
        contact_name="Bob Smith",
        contact_email="bob@company.com",
        contact_phone="+60 12-345-6789"
    )
    
    print(f"\n✅ Pending registration created:")
    print(f"   Name: {pending_reg.contact_name}")
    print(f"   Status: {pending_reg.status}")
    print(f"   Company: {pending_reg.form_data.get('company_organization')}")
    
    # Simulate approval
    pending_reg.status = 'confirmed'
    pending_reg.reviewed_by = admin
    pending_reg.reviewed_at = timezone.now()
    pending_reg.admin_notes = "Application approved - meets criteria"
    pending_reg.save()
    
    print(f"\n✅ Registration approved:")
    print(f"   New Status: {pending_reg.status}")
    print(f"   Reviewed By: {pending_reg.reviewed_by.username}")
    print(f"   Admin Notes: {pending_reg.admin_notes}")
    
    return event

def test_rejection_workflow():
    """Test 3: Create and reject a registration"""
    print("\n" + "="*60)
    print("TEST 3: Registration Rejection Workflow")
    print("="*60)
    
    admin = User.objects.filter(role='admin').first()
    
    # Find an approval-required event or create one
    event = Event.objects.filter(requires_approval=True).first()
    if not event:
        event = Event.objects.create(
            title="Limited Capacity Workshop",
            start_date=timezone.now() + timedelta(days=20),
            location_name="Training Center",
            city="Alor Setar",
            created_by=admin,
            requires_approval=True,
            max_capacity=5,
            approval_message="Applications reviewed on first-come basis."
        )
    
    print(f"✅ Using event: {event.title}")
    
    # Create registration to be rejected
    rejected_reg = EventRegistration.objects.create(
        event=event,
        status='pending',
        form_data={
            "full_name": "Charlie Brown",
            "email_address": "charlie@example.com"
        },
        contact_name="Charlie Brown",
        contact_email="charlie@example.com"
    )
    
    print(f"\n✅ Created pending registration:")
    print(f"   Name: {rejected_reg.contact_name}")
    print(f"   Status: {rejected_reg.status}")
    
    # Simulate rejection
    rejected_reg.status = 'rejected'
    rejected_reg.reviewed_by = admin
    rejected_reg.reviewed_at = timezone.now()
    rejected_reg.admin_notes = "Unfortunately, the event has reached capacity. We encourage you to apply for future events."
    rejected_reg.save()
    
    print(f"\n✅ Registration rejected:")
    print(f"   New Status: {rejected_reg.status}")
    print(f"   Reviewed By: {rejected_reg.reviewed_by.username}")
    print(f"   Reason: {rejected_reg.admin_notes}")

def show_statistics():
    """Show overall statistics"""
    print("\n" + "="*60)
    print("OVERALL STATISTICS")
    print("="*60)
    
    total_events = Event.objects.count()
    auto_approve = Event.objects.filter(requires_approval=False).count()
    approval_required = Event.objects.filter(requires_approval=True).count()
    
    total_registrations = EventRegistration.objects.count()
    confirmed = EventRegistration.objects.filter(status='confirmed').count()
    pending = EventRegistration.objects.filter(status='pending').count()
    rejected = EventRegistration.objects.filter(status='rejected').count()
    
    print(f"\n📊 Events:")
    print(f"   Total: {total_events}")
    print(f"   Auto-Approve: {auto_approve}")
    print(f"   Approval Required: {approval_required}")
    
    print(f"\n📊 Registrations:")
    print(f"   Total: {total_registrations}")
    print(f"   Confirmed: {confirmed}")
    print(f"   Pending: {pending}")
    print(f"   Rejected: {rejected}")
    
    # Show events with custom forms
    events_with_forms = Event.objects.exclude(registration_form_config=[])
    print(f"\n📋 Events with Custom Forms: {events_with_forms.count()}")
    for event in events_with_forms[:3]:
        print(f"   • {event.title} ({len(event.registration_form_config)} fields)")

if __name__ == "__main__":
    print("\n" + "🚀 CUSTOM REGISTRATION FORMS - TEST SUITE" + "\n")
    
    try:
        test_auto_approval_event()
        test_approval_required_event()
        test_rejection_workflow()
        show_statistics()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
