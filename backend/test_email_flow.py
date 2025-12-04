#!/usr/bin/env python
"""
Test script for email automation in event registration system
Tests both automatic thank-you emails and admin reminder emails
"""

import os
import sys
import django
import json
from datetime import datetime

# Setup Django
sys.path.insert(0, '/home/amadou-oury-diallo/tourism-analytics-dashboard/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from events.models import Event, EventRegistration
from events.emails import send_registration_confirmation, send_event_reminder

def test_registration_confirmation():
    """Test automatic thank-you email on registration"""
    print("\n" + "="*70)
    print("TEST 1: Registration Confirmation Email")
    print("="*70)
    
    # Get an event with a registration
    event = Event.objects.filter(id=13).first()
    if not event:
        print("❌ Event 13 not found")
        return
    
    registration = EventRegistration.objects.filter(event=event).first()
    if not registration:
        print("❌ No registrations found for this event")
        return
    
    print(f"\n📋 Event: {event.title}")
    print(f"📅 Date: {event.start_date.strftime('%B %d, %Y at %I:%M %p')}")
    print(f"📍 Location: {event.location_name}")
    print(f"👤 Attendee: {registration.contact_name}")
    print(f"📧 Email: {registration.contact_email}")
    
    print("\n🔄 Sending confirmation email...")
    result = send_registration_confirmation(registration, event)
    
    if result:
        print("✅ Confirmation email sent successfully!")
        print("\n📬 Check your terminal output above for the email content")
        print("   (Email backend is set to console, so it prints here)")
    else:
        print("❌ Failed to send confirmation email")
    
    return result

def test_reminder_email():
    """Test admin reminder email to all attendees"""
    print("\n" + "="*70)
    print("TEST 2: Admin Reminder Email")
    print("="*70)
    
    # Get an event with registrations
    event = Event.objects.filter(id=13).first()
    if not event:
        print("❌ Event 13 not found")
        return
    
    confirmed = event.registrations.filter(status='confirmed')
    count = confirmed.count()
    
    if count == 0:
        print("❌ No confirmed registrations for this event")
        return
    
    print(f"\n📋 Event: {event.title}")
    print(f"👥 Confirmed Attendees: {count}")
    
    # Show attendee list
    print("\n📝 Attendee List:")
    for i, reg in enumerate(confirmed, 1):
        print(f"   {i}. {reg.contact_name} - {reg.contact_email}")
    
    custom_message = (
        "This is a friendly reminder about our upcoming event! "
        "Please arrive 15 minutes early for registration. "
        "Looking forward to seeing you there! 🎉"
    )
    
    print(f"\n💬 Custom Message: {custom_message[:80]}...")
    print("\n🔄 Sending reminder emails...")
    
    sent_count, failed_count = send_event_reminder(confirmed, event, custom_message)
    
    print(f"\n✅ Sent: {sent_count} emails")
    print(f"❌ Failed: {failed_count} emails")
    print(f"📊 Total: {count} attendees")
    
    print("\n📬 Check your terminal output above for the email content")
    print("   (Email backend is set to console, so it prints here)")
    
    return sent_count > 0

def show_email_config():
    """Display current email configuration"""
    print("\n" + "="*70)
    print("EMAIL CONFIGURATION")
    print("="*70)
    
    from django.conf import settings
    
    print(f"\nEmail Backend: {settings.EMAIL_BACKEND}")
    print(f"Email Host: {settings.EMAIL_HOST}")
    print(f"Email Port: {settings.EMAIL_PORT}")
    print(f"Use TLS: {settings.EMAIL_USE_TLS}")
    print(f"From Email: {settings.DEFAULT_FROM_EMAIL}")
    
    if 'console' in settings.EMAIL_BACKEND.lower():
        print("\n📌 NOTE: Using console email backend (development mode)")
        print("   Emails will be printed to the terminal instead of being sent")
        print("\n🔧 To enable real email sending:")
        print("   1. Set EMAIL_HOST_USER environment variable (Gmail address)")
        print("   2. Set EMAIL_HOST_PASSWORD environment variable (App Password)")
        print("   3. Django will automatically switch to SMTP backend")
    else:
        print("\n✅ Using SMTP email backend (production mode)")
        print("   Emails will be sent to actual recipients")

def main():
    """Run all email tests"""
    print("\n🧪 EVENT REGISTRATION EMAIL SYSTEM TEST")
    print("Started at:", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    # Show config first
    show_email_config()
    
    # Test confirmation email
    test1_result = test_registration_confirmation()
    
    # Test reminder email
    test2_result = test_reminder_email()
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Registration Confirmation: {'✅ PASSED' if test1_result else '❌ FAILED'}")
    print(f"Admin Reminder Email: {'✅ PASSED' if test2_result else '❌ FAILED'}")
    
    if test1_result and test2_result:
        print("\n🎉 All tests passed! Email system is working correctly.")
        print("\n📝 Next Steps:")
        print("   1. Test registration through the UI")
        print("   2. Check terminal for automatic thank-you email")
        print("   3. Test Send Reminder button in admin panel")
        print("   4. For production, set up Gmail App Password")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
    
    print("\nCompleted at:", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

if __name__ == '__main__':
    main()
