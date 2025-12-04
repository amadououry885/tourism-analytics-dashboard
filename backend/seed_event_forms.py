#!/usr/bin/env python
"""
Seed script to create sample events with custom registration forms
Run: python seed_event_forms.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from django.utils import timezone
from datetime import timedelta
from events.models import Event, EventRegistrationForm, EventRegistrationField
from users.models import User

def create_sample_events():
    # Get or create admin user
    admin, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@tourism.com',
            'role': 'admin',
            'is_approved': True,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if _:
        admin.set_password('admin123')
        admin.save()
        print("✅ Created admin user (username: admin, password: admin123)")
    
    # Event 1: Food Festival with simple form
    event1, created1 = Event.objects.get_or_create(
        title="Alor Setar Food Festival 2025",
        defaults={
            'description': 'Experience the best of Kedah cuisine! Join us for a culinary journey through traditional and modern Malaysian dishes.',
            'start_date': timezone.now() + timedelta(days=30),
            'end_date': timezone.now() + timedelta(days=32),
            'location_name': 'Aman Central, Alor Setar',
            'city': 'Alor Setar',
            'lat': 6.1248,
            'lon': 100.3678,
            'tags': ['food', 'festival', 'culture', 'family'],
            'image_url': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
            'is_published': True,
            'max_capacity': 500,
            'expected_attendance': 400,
            'created_by': admin,
        }
    )
    
    if created1 or not hasattr(event1, 'registration_form'):
        # Create registration form for food festival
        form1, _ = EventRegistrationForm.objects.get_or_create(
            event=event1,
            defaults={
                'title': 'Food Festival Registration',
                'description': 'Please fill in your details to join us at the festival! Entry is free.',
                'confirmation_message': 'Thank you for registering! See you at the Food Festival! 🍜',
                'allow_guest_registration': True,
            }
        )
        
        # Clear existing fields
        form1.fields.all().delete()
        
        # Add fields
        EventRegistrationField.objects.create(
            form=form1,
            label='Full Name',
            field_type='text',
            is_required=True,
            placeholder='Enter your full name',
            order=1
        )
        
        EventRegistrationField.objects.create(
            form=form1,
            label='Email Address',
            field_type='email',
            is_required=True,
            placeholder='you@example.com',
            help_text='We will send you event updates and reminders',
            order=2
        )
        
        EventRegistrationField.objects.create(
            form=form1,
            label='Phone Number',
            field_type='phone',
            is_required=True,
            placeholder='+60123456789',
            order=3
        )
        
        EventRegistrationField.objects.create(
            form=form1,
            label='Dietary Requirements',
            field_type='dropdown',
            is_required=False,
            options=['None', 'Vegetarian', 'Vegan', 'Halal Only', 'No Seafood', 'No Nuts'],
            help_text='Let us know if you have any dietary restrictions',
            order=4
        )
        
        print(f"✅ Created Food Festival with {form1.fields.count()} registration fields")
    
    # Event 2: Marathon with detailed form
    event2, created2 = Event.objects.get_or_create(
        title="Alor Setar Marathon 2025",
        defaults={
            'description': 'Join thousands of runners in the annual Alor Setar Marathon! Choose from 5KM, 10KM, or Full Marathon categories.',
            'start_date': timezone.now() + timedelta(days=60),
            'end_date': timezone.now() + timedelta(days=60),
            'location_name': 'Dataran Keris, Alor Setar',
            'city': 'Alor Setar',
            'lat': 6.1211,
            'lon': 100.3683,
            'tags': ['sports', 'marathon', 'health', 'fitness'],
            'image_url': 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3',
            'is_published': True,
            'max_capacity': 1000,
            'expected_attendance': 800,
            'created_by': admin,
        }
    )
    
    if created2 or not hasattr(event2, 'registration_form'):
        # Create registration form for marathon
        form2, _ = EventRegistrationForm.objects.get_or_create(
            event=event2,
            defaults={
                'title': 'Marathon Registration 2025',
                'description': 'Please fill all fields carefully. Registration closes 1 week before race day. Registration fee: RM50 (5KM), RM80 (10KM), RM150 (Full Marathon).',
                'confirmation_message': 'Thank you for registering! Check your email for payment instructions and race pack collection details. See you at the finish line! 🏃',
                'allow_guest_registration': False,  # Require login for marathon
            }
        )
        
        # Clear existing fields
        form2.fields.all().delete()
        
        # Add fields
        EventRegistrationField.objects.create(
            form=form2,
            label='Full Name',
            field_type='text',
            is_required=True,
            placeholder='Enter your full name as per IC/Passport',
            help_text='Name will appear on your race bib',
            order=1
        )
        
        EventRegistrationField.objects.create(
            form=form2,
            label='Email Address',
            field_type='email',
            is_required=True,
            placeholder='you@example.com',
            order=2
        )
        
        EventRegistrationField.objects.create(
            form=form2,
            label='Phone Number',
            field_type='phone',
            is_required=True,
            placeholder='+60123456789',
            order=3
        )
        
        EventRegistrationField.objects.create(
            form=form2,
            label='Race Category',
            field_type='dropdown',
            is_required=True,
            options=['5KM Fun Run', '10KM Challenge', 'Full Marathon (42KM)'],
            help_text='Select your race distance',
            order=4
        )
        
        EventRegistrationField.objects.create(
            form=form2,
            label='T-Shirt Size',
            field_type='dropdown',
            is_required=True,
            options=['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            help_text='Free race t-shirt included in registration',
            order=5
        )
        
        EventRegistrationField.objects.create(
            form=form2,
            label='Emergency Contact Name',
            field_type='text',
            is_required=True,
            placeholder='Emergency contact person',
            order=6
        )
        
        EventRegistrationField.objects.create(
            form=form2,
            label='Emergency Contact Phone',
            field_type='phone',
            is_required=True,
            placeholder='+60123456789',
            order=7
        )
        
        EventRegistrationField.objects.create(
            form=form2,
            label='Age',
            field_type='number',
            is_required=True,
            placeholder='Your age',
            help_text='Minimum age: 12 years old',
            order=8
        )
        
        EventRegistrationField.objects.create(
            form=form2,
            label='Medical Conditions',
            field_type='textarea',
            is_required=False,
            placeholder='Any medical conditions we should know about? (asthma, diabetes, heart condition, etc.)',
            help_text='This helps our medical team prepare. Leave blank if none.',
            order=9
        )
        
        EventRegistrationField.objects.create(
            form=form2,
            label='Dietary Requirements',
            field_type='dropdown',
            is_required=False,
            options=['None', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-Free'],
            help_text='For post-race refreshments',
            order=10
        )
        
        print(f"✅ Created Marathon with {form2.fields.count()} registration fields")
    
    # Event 3: Workshop with simple form
    event3, created3 = Event.objects.get_or_create(
        title="Photography Workshop: Capturing Kedah",
        defaults={
            'description': 'Learn professional photography techniques while exploring the beautiful landscapes of Kedah. Suitable for beginners and intermediate photographers.',
            'start_date': timezone.now() + timedelta(days=14),
            'end_date': timezone.now() + timedelta(days=14),
            'location_name': 'Kedah State Art Gallery',
            'city': 'Alor Setar',
            'lat': 6.1192,
            'lon': 100.3692,
            'tags': ['workshop', 'photography', 'art', 'education'],
            'image_url': 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848',
            'is_published': True,
            'max_capacity': 30,
            'expected_attendance': 25,
            'created_by': admin,
        }
    )
    
    if created3 or not hasattr(event3, 'registration_form'):
        # Create registration form for workshop
        form3, _ = EventRegistrationForm.objects.get_or_create(
            event=event3,
            defaults={
                'title': 'Photography Workshop Registration',
                'description': 'Limited to 30 participants. Workshop fee: RM150 (includes lunch and course materials).',
                'confirmation_message': 'Registration confirmed! Payment instructions have been sent to your email. Bring your camera and enthusiasm! 📸',
                'allow_guest_registration': True,
            }
        )
        
        # Clear existing fields
        form3.fields.all().delete()
        
        # Add fields
        EventRegistrationField.objects.create(
            form=form3,
            label='Full Name',
            field_type='text',
            is_required=True,
            placeholder='Enter your full name',
            order=1
        )
        
        EventRegistrationField.objects.create(
            form=form3,
            label='Email Address',
            field_type='email',
            is_required=True,
            placeholder='you@example.com',
            order=2
        )
        
        EventRegistrationField.objects.create(
            form=form3,
            label='Phone Number',
            field_type='phone',
            is_required=True,
            placeholder='+60123456789',
            order=3
        )
        
        EventRegistrationField.objects.create(
            form=form3,
            label='Photography Experience Level',
            field_type='radio',
            is_required=True,
            options=['Beginner (just starting)', 'Intermediate (some experience)', 'Advanced (experienced photographer)'],
            order=4
        )
        
        EventRegistrationField.objects.create(
            form=form3,
            label='What camera will you bring?',
            field_type='text',
            is_required=False,
            placeholder='e.g., Canon EOS 90D, iPhone 13, etc.',
            help_text='Any camera is fine, even smartphones!',
            order=5
        )
        
        EventRegistrationField.objects.create(
            form=form3,
            label='Dietary Requirements',
            field_type='dropdown',
            is_required=False,
            options=['None', 'Vegetarian', 'Vegan', 'Halal', 'No Seafood'],
            help_text='For lunch provided during workshop',
            order=6
        )
        
        print(f"✅ Created Photography Workshop with {form3.fields.count()} registration fields")
    
    print("\n" + "="*60)
    print("🎉 Sample Events Created Successfully!")
    print("="*60)
    print(f"\n1. {event1.title}")
    print(f"   - Registration Form: {form1.title}")
    print(f"   - Fields: {form1.fields.count()}")
    print(f"   - Guest Registration: {'Allowed' if form1.allow_guest_registration else 'Login Required'}")
    print(f"   - Capacity: {event1.max_capacity}")
    
    print(f"\n2. {event2.title}")
    print(f"   - Registration Form: {form2.title}")
    print(f"   - Fields: {form2.fields.count()}")
    print(f"   - Guest Registration: {'Allowed' if form2.allow_guest_registration else 'Login Required'}")
    print(f"   - Capacity: {event2.max_capacity}")
    
    print(f"\n3. {event3.title}")
    print(f"   - Registration Form: {form3.title}")
    print(f"   - Fields: {form3.fields.count()}")
    print(f"   - Guest Registration: {'Allowed' if form3.allow_guest_registration else 'Login Required'}")
    print(f"   - Capacity: {event3.max_capacity}")
    
    print("\n" + "="*60)
    print("📡 Test the API:")
    print("="*60)
    print(f"\n# View Food Festival registration form:")
    print(f"GET http://localhost:8000/api/events/{event1.id}/registration_form/")
    
    print(f"\n# View Marathon registration form:")
    print(f"GET http://localhost:8000/api/events/{event2.id}/registration_form/")
    
    print(f"\n# View Workshop registration form:")
    print(f"GET http://localhost:8000/api/events/{event3.id}/registration_form/")
    
    print(f"\n# Submit registration (example for Food Festival):")
    print(f"POST http://localhost:8000/api/events/{event1.id}/submit_registration/")
    print("""
Body:
{
  "form_data": {
    "full_name": "Ahmad bin Abdullah",
    "email_address": "ahmad@example.com",
    "phone_number": "+60123456789",
    "dietary_requirements": "Halal Only"
  }
}
""")
    
    print("\n✅ All done! You can now test the custom registration forms.")

if __name__ == '__main__':
    create_sample_events()
