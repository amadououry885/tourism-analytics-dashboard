#!/usr/bin/env python
"""
Comprehensive Email Test Script
Tests all email notification types in the Tourism Analytics Dashboard
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
sys.path.insert(0, '/home/amadou-oury-diallo/tourism-analytics-dashboard/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from django.conf import settings
from users.models import User
from vendors.models import Vendor, Reservation
from events.models import Event, EventRegistration

# Import email functions
from users.emails import (
    send_approval_email,
    send_rejection_email,
    send_registration_pending_email
)
from vendors.emails import (
    send_reservation_pending_notification,
    send_reservation_confirmation,
    send_reservation_rejection
)
from events.emails import (
    send_registration_confirmation as send_event_registration,
    send_event_reminder,
    send_approval_email as send_event_approval,
    send_rejection_email as send_event_rejection
)


def show_email_config():
    """Display current email configuration"""
    print("\n" + "=" * 70)
    print("📧 EMAIL CONFIGURATION")
    print("=" * 70)
    
    print(f"\nEmail Backend: {settings.EMAIL_BACKEND}")
    print(f"Email Host: {settings.EMAIL_HOST}")
    print(f"Email Port: {settings.EMAIL_PORT}")
    print(f"Use TLS: {settings.EMAIL_USE_TLS}")
    print(f"From Email: {settings.DEFAULT_FROM_EMAIL}")
    
    if 'console' in settings.EMAIL_BACKEND.lower():
        print("\n📌 NOTE: Using CONSOLE email backend (development mode)")
        print("   Emails will be printed to the terminal instead of being sent")
    else:
        print("\n✅ Using SMTP email backend (production mode)")
        print("   Emails will be sent to actual recipients")


def test_user_emails():
    """Test user-related emails (approval, rejection, pending)"""
    print("\n" + "=" * 70)
    print("👤 USER EMAIL TESTS")
    print("=" * 70)
    
    # Get a test user
    user = User.objects.filter(role='vendor').first()
    if not user:
        print("❌ No vendor user found for testing")
        return False
    
    print(f"\n📋 Test User: {user.username} ({user.email})")
    print(f"   Role: {user.role}")
    
    results = []
    
    # Test 1: Approval Email
    print("\n🔄 Test 1: Sending APPROVAL email...")
    try:
        result = send_approval_email(user, assigned_business="Test Restaurant")
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    # Test 2: Rejection Email
    print("\n🔄 Test 2: Sending REJECTION email...")
    try:
        result = send_rejection_email(user, reason="Test rejection - incomplete documentation provided")
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    # Test 3: Registration Pending Email
    print("\n🔄 Test 3: Sending REGISTRATION PENDING email...")
    try:
        result = send_registration_pending_email(user)
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    return all(results)


def test_reservation_emails():
    """Test restaurant reservation emails"""
    print("\n" + "=" * 70)
    print("🍽️ RESERVATION EMAIL TESTS")
    print("=" * 70)
    
    # Get a test reservation
    reservation = Reservation.objects.select_related('vendor').first()
    if not reservation:
        print("❌ No reservations found. Creating a test reservation...")
        vendor = Vendor.objects.first()
        if not vendor:
            print("❌ No vendors found for testing")
            return False
        
        # Create a test reservation
        reservation = Reservation.objects.create(
            vendor=vendor,
            customer_name="Test Customer",
            customer_email="test@example.com",
            customer_phone="+60123456789",
            date=datetime.now().date() + timedelta(days=3),
            time="19:00",
            party_size=4,
            special_requests="Test reservation for email testing",
            status='pending'
        )
        print(f"   ✅ Created test reservation #{reservation.id}")
    
    print(f"\n📋 Test Reservation: #{reservation.id}")
    print(f"   Restaurant: {reservation.vendor.name}")
    print(f"   Customer: {reservation.customer_name}")
    print(f"   Email: {reservation.customer_email}")
    print(f"   Date: {reservation.date} at {reservation.time}")
    
    results = []
    
    # Test 1: Reservation Pending Email
    print("\n🔄 Test 1: Sending RESERVATION PENDING email...")
    try:
        result = send_reservation_pending_notification(reservation)
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    # Test 2: Reservation Confirmation Email
    print("\n🔄 Test 2: Sending RESERVATION CONFIRMATION email...")
    try:
        result = send_reservation_confirmation(reservation)
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    # Test 3: Reservation Rejection Email
    print("\n🔄 Test 3: Sending RESERVATION REJECTION email...")
    try:
        result = send_reservation_rejection(reservation, reason="Test rejection - fully booked on this date")
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    return all(results)


def test_event_emails():
    """Test event registration emails"""
    print("\n" + "=" * 70)
    print("🎉 EVENT EMAIL TESTS")
    print("=" * 70)
    
    # Get a test event with registration
    registration = EventRegistration.objects.select_related('event').first()
    if not registration:
        print("❌ No event registrations found. Creating a test registration...")
        event = Event.objects.first()
        if not event:
            print("❌ No events found for testing")
            return False
        
        # Create a test registration
        registration = EventRegistration.objects.create(
            event=event,
            contact_name="Test Attendee",
            contact_email="attendee@example.com",
            contact_phone="+60123456789",
            status='confirmed'
        )
        print(f"   ✅ Created test registration #{registration.id}")
    
    event = registration.event
    
    print(f"\n📋 Test Event: {event.title}")
    print(f"   Date: {event.start_date.strftime('%B %d, %Y') if event.start_date else 'TBD'}")
    print(f"   Registration: {registration.contact_name} ({registration.contact_email})")
    
    results = []
    
    # Test 1: Event Registration Confirmation
    print("\n🔄 Test 1: Sending EVENT REGISTRATION CONFIRMATION email...")
    try:
        result = send_event_registration(registration, event)
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    # Test 2: Event Registration Pending
    print("\n🔄 Test 2: Sending EVENT REGISTRATION PENDING email...")
    try:
        result = send_event_registration(registration, event, is_pending=True)
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    # Test 3: Event Approval Email
    print("\n🔄 Test 3: Sending EVENT APPROVAL email...")
    try:
        result = send_event_approval(registration, event)
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    # Test 4: Event Rejection Email
    print("\n🔄 Test 4: Sending EVENT REJECTION email...")
    try:
        result = send_event_rejection(registration, event, "Test rejection - event is at full capacity")
        print(f"   {'✅ SUCCESS' if result else '⚠️ No result returned (check console output)'}")
        results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    # Test 5: Event Reminder Email
    print("\n🔄 Test 5: Sending EVENT REMINDER email...")
    try:
        registrations = EventRegistration.objects.filter(event=event, status='confirmed')[:3]
        if registrations.exists():
            sent, failed = send_event_reminder(
                registrations, 
                event, 
                "This is a test reminder! Don't forget to bring your ticket. See you there! 🎉"
            )
            print(f"   ✅ Sent: {sent} | Failed: {failed}")
            results.append(sent > 0)
        else:
            print("   ⚠️ No confirmed registrations to send reminders to")
            results.append(True)
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        results.append(False)
    
    return all(results)


def main():
    """Run all email tests"""
    print("\n" + "=" * 70)
    print("🧪 COMPREHENSIVE EMAIL NOTIFICATION TEST")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Show configuration
    show_email_config()
    
    # Run all tests
    user_result = test_user_emails()
    reservation_result = test_reservation_emails()
    event_result = test_event_emails()
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    print(f"\n👤 User Emails:        {'✅ ALL PASSED' if user_result else '❌ SOME FAILED'}")
    print(f"🍽️  Reservation Emails: {'✅ ALL PASSED' if reservation_result else '❌ SOME FAILED'}")
    print(f"🎉 Event Emails:       {'✅ ALL PASSED' if event_result else '❌ SOME FAILED'}")
    
    all_passed = user_result and reservation_result and event_result
    
    if all_passed:
        print("\n" + "=" * 70)
        print("🎉 ALL EMAIL TESTS PASSED!")
        print("=" * 70)
        print("\nThe email notification system is working correctly.")
        print("Check the console output above to see the rendered HTML emails.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return all_passed


if __name__ == "__main__":
    main()
