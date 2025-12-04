#!/usr/bin/env python
"""
Add custom registration forms to existing events
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from events.models import Event, EventRegistrationForm, EventRegistrationField

def add_forms_to_events():
    # Event 12: Kedah New Year Celebration 2025
    event = Event.objects.get(id=12)
    if not hasattr(event, 'registration_form'):
        form = EventRegistrationForm.objects.create(
            event=event,
            title='New Year Celebration Registration',
            description='Join us for an unforgettable New Year celebration! Free entry for all.',
            confirmation_message='🎉 You\'re registered! Get ready to celebrate the New Year with us!',
            allow_guest_registration=True
        )
        EventRegistrationField.objects.create(
            form=form, label='Full Name', field_type='text', is_required=True,
            placeholder='Enter your full name', order=1
        )
        EventRegistrationField.objects.create(
            form=form, label='Email Address', field_type='email', is_required=True,
            placeholder='you@example.com', order=2
        )
        EventRegistrationField.objects.create(
            form=form, label='Phone Number', field_type='phone', is_required=True,
            placeholder='+60123456789', order=3
        )
        EventRegistrationField.objects.create(
            form=form, label='Number of Guests', field_type='number', is_required=True,
            placeholder='How many people are coming?', help_text='Including yourself', order=4
        )
        EventRegistrationField.objects.create(
            form=form, label='Dietary Requirements', field_type='dropdown', is_required=False,
            options=['None', 'Vegetarian', 'Vegan', 'Halal', 'No Seafood'], order=5
        )
        print(f'✅ Event {event.id}: {event.title} - {form.fields.count()} fields')

    # Event 13: Kedah International Food Festival 2025
    event = Event.objects.get(id=13)
    if not hasattr(event, 'registration_form'):
        form = EventRegistrationForm.objects.create(
            event=event,
            title='Food Festival Registration',
            description='Experience the best of international cuisine! Register now to secure your spot.',
            confirmation_message='🍽️ Thank you for registering! Prepare your taste buds for an amazing culinary journey!',
            allow_guest_registration=True
        )
        EventRegistrationField.objects.create(
            form=form, label='Full Name', field_type='text', is_required=True,
            placeholder='Enter your full name', order=1
        )
        EventRegistrationField.objects.create(
            form=form, label='Email Address', field_type='email', is_required=True,
            placeholder='you@example.com', order=2
        )
        EventRegistrationField.objects.create(
            form=form, label='Phone Number', field_type='phone', is_required=True,
            placeholder='+60123456789', order=3
        )
        EventRegistrationField.objects.create(
            form=form, label='Food Preferences', field_type='checkbox', is_required=False,
            options=['Asian', 'Western', 'Middle Eastern', 'Vegetarian', 'Seafood', 'Desserts'],
            help_text='Select all that interest you', order=4
        )
        EventRegistrationField.objects.create(
            form=form, label='Dietary Restrictions', field_type='dropdown', is_required=False,
            options=['None', 'Vegetarian', 'Vegan', 'Halal Only', 'No Pork', 'No Seafood', 'Gluten-Free', 'No Nuts'],
            order=5
        )
        print(f'✅ Event {event.id}: {event.title} - {form.fields.count()} fields')

    # Event 14: Langkawi Sky Marathon 2025
    event = Event.objects.get(id=14)
    if not hasattr(event, 'registration_form'):
        form = EventRegistrationForm.objects.create(
            event=event,
            title='Langkawi Sky Marathon Registration',
            description='Challenge yourself in this scenic marathon! Registration fee: RM80 (10KM), RM150 (21KM), RM200 (42KM).',
            confirmation_message='🏃 Registration confirmed! Start your training and we\'ll see you at the starting line!',
            allow_guest_registration=False  # Require login for marathon
        )
        EventRegistrationField.objects.create(
            form=form, label='Full Name', field_type='text', is_required=True,
            placeholder='Full name as per IC/Passport', help_text='Will appear on race bib', order=1
        )
        EventRegistrationField.objects.create(
            form=form, label='Email Address', field_type='email', is_required=True,
            placeholder='you@example.com', order=2
        )
        EventRegistrationField.objects.create(
            form=form, label='Phone Number', field_type='phone', is_required=True,
            placeholder='+60123456789', order=3
        )
        EventRegistrationField.objects.create(
            form=form, label='Race Category', field_type='dropdown', is_required=True,
            options=['10KM Challenge', '21KM Half Marathon', '42KM Full Marathon'],
            help_text='Select your race distance', order=4
        )
        EventRegistrationField.objects.create(
            form=form, label='T-Shirt Size', field_type='dropdown', is_required=True,
            options=['XS', 'S', 'M', 'L', 'XL', 'XXL'], order=5
        )
        EventRegistrationField.objects.create(
            form=form, label='Age', field_type='number', is_required=True,
            placeholder='Your age', help_text='Minimum age: 16 years', order=6
        )
        EventRegistrationField.objects.create(
            form=form, label='Emergency Contact Name', field_type='text', is_required=True,
            placeholder='Emergency contact person', order=7
        )
        EventRegistrationField.objects.create(
            form=form, label='Emergency Contact Phone', field_type='phone', is_required=True,
            placeholder='+60123456789', order=8
        )
        EventRegistrationField.objects.create(
            form=form, label='Medical Conditions', field_type='textarea', is_required=False,
            placeholder='Any medical conditions we should know? (asthma, diabetes, heart condition, etc.)',
            help_text='Helps our medical team prepare', order=9
        )
        print(f'✅ Event {event.id}: {event.title} - {form.fields.count()} fields')

    # Event 15: Kedah Heritage Week 2025
    event = Event.objects.get(id=15)
    if not hasattr(event, 'registration_form'):
        form = EventRegistrationForm.objects.create(
            event=event,
            title='Heritage Week Registration',
            description='Join us for a week celebrating Kedah\'s rich cultural heritage. Free admission!',
            confirmation_message='🏛️ Registration confirmed! Get ready to explore Kedah\'s amazing heritage!',
            allow_guest_registration=True
        )
        EventRegistrationField.objects.create(
            form=form, label='Full Name', field_type='text', is_required=True,
            placeholder='Enter your full name', order=1
        )
        EventRegistrationField.objects.create(
            form=form, label='Email Address', field_type='email', is_required=True,
            placeholder='you@example.com', order=2
        )
        EventRegistrationField.objects.create(
            form=form, label='Phone Number', field_type='phone', is_required=False,
            placeholder='+60123456789', order=3
        )
        EventRegistrationField.objects.create(
            form=form, label='Interest Areas', field_type='checkbox', is_required=False,
            options=['Traditional Architecture', 'Local Cuisine', 'Arts & Crafts', 'Historical Sites', 'Cultural Performances'],
            help_text='Select all that interest you', order=4
        )
        EventRegistrationField.objects.create(
            form=form, label='Preferred Tour Language', field_type='dropdown', is_required=False,
            options=['English', 'Bahasa Malaysia', 'Mandarin', 'Tamil'], order=5
        )
        print(f'✅ Event {event.id}: {event.title} - {form.fields.count()} fields')

    # Event 16: Langkawi International Jazz Festival
    event = Event.objects.get(id=16)
    if not hasattr(event, 'registration_form'):
        form = EventRegistrationForm.objects.create(
            event=event,
            title='Jazz Festival Registration',
            description='Experience world-class jazz performances! Early bird: RM100, Regular: RM150.',
            confirmation_message='🎷 You\'re in! Get ready for an amazing night of jazz music!',
            allow_guest_registration=True
        )
        EventRegistrationField.objects.create(
            form=form, label='Full Name', field_type='text', is_required=True,
            placeholder='Enter your full name', order=1
        )
        EventRegistrationField.objects.create(
            form=form, label='Email Address', field_type='email', is_required=True,
            placeholder='you@example.com', order=2
        )
        EventRegistrationField.objects.create(
            form=form, label='Phone Number', field_type='phone', is_required=True,
            placeholder='+60123456789', order=3
        )
        EventRegistrationField.objects.create(
            form=form, label='Ticket Type', field_type='dropdown', is_required=True,
            options=['Early Bird (RM100)', 'Regular (RM150)', 'VIP (RM300)'],
            help_text='Select your ticket category', order=4
        )
        EventRegistrationField.objects.create(
            form=form, label='Number of Tickets', field_type='number', is_required=True,
            placeholder='How many tickets?', help_text='Maximum 4 per person', order=5
        )
        EventRegistrationField.objects.create(
            form=form, label='Seating Preference', field_type='radio', is_required=False,
            options=['Front Section', 'Middle Section', 'Back Section', 'No Preference'],
            order=6
        )
        print(f'✅ Event {event.id}: {event.title} - {form.fields.count()} fields')

    # Event 17: Kedah Tech & Innovation Expo 2025
    event = Event.objects.get(id=17)
    if not hasattr(event, 'registration_form'):
        form = EventRegistrationForm.objects.create(
            event=event,
            title='Tech & Innovation Expo Registration',
            description='Explore the latest in technology and innovation. Free for students, RM50 for professionals.',
            confirmation_message='💻 Registration confirmed! See you at the forefront of innovation!',
            allow_guest_registration=True
        )
        EventRegistrationField.objects.create(
            form=form, label='Full Name', field_type='text', is_required=True,
            placeholder='Enter your full name', order=1
        )
        EventRegistrationField.objects.create(
            form=form, label='Email Address', field_type='email', is_required=True,
            placeholder='you@example.com', order=2
        )
        EventRegistrationField.objects.create(
            form=form, label='Phone Number', field_type='phone', is_required=True,
            placeholder='+60123456789', order=3
        )
        EventRegistrationField.objects.create(
            form=form, label='Attendee Type', field_type='radio', is_required=True,
            options=['Student', 'Professional', 'Entrepreneur', 'Academic/Researcher'],
            order=4
        )
        EventRegistrationField.objects.create(
            form=form, label='Organization/Institution', field_type='text', is_required=False,
            placeholder='Company or university name', order=5
        )
        EventRegistrationField.objects.create(
            form=form, label='Job Title/Field of Study', field_type='text', is_required=False,
            placeholder='Your role or area of study', order=6
        )
        EventRegistrationField.objects.create(
            form=form, label='Technology Interests', field_type='checkbox', is_required=False,
            options=['AI & Machine Learning', 'IoT', 'Blockchain', 'Cybersecurity', 'Robotics', 'FinTech', 'HealthTech'],
            help_text='Select areas of interest', order=7
        )
        print(f'✅ Event {event.id}: {event.title} - {form.fields.count()} fields')

    # Event 18: Langkawi Underwater World Festival
    event = Event.objects.get(id=18)
    if not hasattr(event, 'registration_form'):
        form = EventRegistrationForm.objects.create(
            event=event,
            title='Underwater World Festival Registration',
            description='Dive into marine conservation and ocean exploration! Family-friendly event.',
            confirmation_message='🐠 Registration confirmed! Get ready to explore the underwater world!',
            allow_guest_registration=True
        )
        EventRegistrationField.objects.create(
            form=form, label='Full Name', field_type='text', is_required=True,
            placeholder='Enter your full name', order=1
        )
        EventRegistrationField.objects.create(
            form=form, label='Email Address', field_type='email', is_required=True,
            placeholder='you@example.com', order=2
        )
        EventRegistrationField.objects.create(
            form=form, label='Phone Number', field_type='phone', is_required=True,
            placeholder='+60123456789', order=3
        )
        EventRegistrationField.objects.create(
            form=form, label='Number of Adults', field_type='number', is_required=True,
            placeholder='Adults (age 13+)', order=4
        )
        EventRegistrationField.objects.create(
            form=form, label='Number of Children', field_type='number', is_required=False,
            placeholder='Children (age 3-12)', order=5
        )
        EventRegistrationField.objects.create(
            form=form, label='Activities Interest', field_type='checkbox', is_required=False,
            options=['Snorkeling', 'Diving Demo', 'Marine Life Talk', 'Conservation Workshop', 'Touch Pool'],
            help_text='Select activities you\'d like to participate in', order=6
        )
        print(f'✅ Event {event.id}: {event.title} - {form.fields.count()} fields')

    # Event 19: Kedah Paddy Festival 2025
    event = Event.objects.get(id=19)
    if not hasattr(event, 'registration_form'):
        form = EventRegistrationForm.objects.create(
            event=event,
            title='Paddy Festival Registration',
            description='Celebrate Kedah\'s agricultural heritage! Experience rice planting, harvest activities, and more.',
            confirmation_message='🌾 Registration confirmed! We can\'t wait to see you at the festival!',
            allow_guest_registration=True
        )
        EventRegistrationField.objects.create(
            form=form, label='Full Name', field_type='text', is_required=True,
            placeholder='Enter your full name', order=1
        )
        EventRegistrationField.objects.create(
            form=form, label='Email Address', field_type='email', is_required=True,
            placeholder='you@example.com', order=2
        )
        EventRegistrationField.objects.create(
            form=form, label='Phone Number', field_type='phone', is_required=True,
            placeholder='+60123456789', order=3
        )
        EventRegistrationField.objects.create(
            form=form, label='Group Type', field_type='radio', is_required=True,
            options=['Individual', 'Family', 'School Group', 'Tour Group'],
            order=4
        )
        EventRegistrationField.objects.create(
            form=form, label='Number of Participants', field_type='number', is_required=True,
            placeholder='Total number in your group', help_text='Including yourself', order=5
        )
        EventRegistrationField.objects.create(
            form=form, label='Activities Interest', field_type='checkbox', is_required=False,
            options=['Rice Planting Experience', 'Harvest Demonstration', 'Traditional Cooking', 'Farm Tour', 'Cultural Performances'],
            help_text='Select all that interest you', order=6
        )
        EventRegistrationField.objects.create(
            form=form, label='Dietary Requirements', field_type='dropdown', is_required=False,
            options=['None', 'Vegetarian', 'Vegan', 'Halal', 'No Seafood'],
            help_text='For the traditional lunch provided', order=7
        )
        print(f'✅ Event {event.id}: {event.title} - {form.fields.count()} fields')

    # Event 20: Langkawi International Book Fair
    event = Event.objects.get(id=20)
    if not hasattr(event, 'registration_form'):
        form = EventRegistrationForm.objects.create(
            event=event,
            title='Book Fair Registration',
            description='Meet authors, attend workshops, and discover new books! Free entry.',
            confirmation_message='📚 Registration confirmed! Happy reading and see you at the book fair!',
            allow_guest_registration=True
        )
        EventRegistrationField.objects.create(
            form=form, label='Full Name', field_type='text', is_required=True,
            placeholder='Enter your full name', order=1
        )
        EventRegistrationField.objects.create(
            form=form, label='Email Address', field_type='email', is_required=True,
            placeholder='you@example.com', order=2
        )
        EventRegistrationField.objects.create(
            form=form, label='Phone Number', field_type='phone', is_required=False,
            placeholder='+60123456789', order=3
        )
        EventRegistrationField.objects.create(
            form=form, label='Reader Type', field_type='radio', is_required=False,
            options=['Casual Reader', 'Book Enthusiast', 'Author/Writer', 'Publisher', 'Educator', 'Student'],
            order=4
        )
        EventRegistrationField.objects.create(
            form=form, label='Favorite Genres', field_type='checkbox', is_required=False,
            options=['Fiction', 'Non-Fiction', 'Mystery/Thriller', 'Romance', 'Science Fiction', 'Biography', 'Children\'s Books', 'Self-Help'],
            help_text='Select all that apply', order=5
        )
        EventRegistrationField.objects.create(
            form=form, label='Workshop Interests', field_type='checkbox', is_required=False,
            options=['Writing Workshop', 'Publishing 101', 'Book Illustration', 'Author Meet & Greet', 'Children\'s Storytelling'],
            help_text='Workshops you\'d like to attend', order=6
        )
        print(f'✅ Event {event.id}: {event.title} - {form.fields.count()} fields')

    print('\n' + '='*60)
    print('🎉 All registration forms created successfully!')
    print('='*60)
    print('\n📊 Summary:')
    all_events = Event.objects.filter(id__in=range(12, 21))
    for event in all_events:
        if hasattr(event, 'registration_form'):
            form = event.registration_form
            print(f'\n✅ {event.title}')
            print(f'   Form: {form.title}')
            print(f'   Fields: {form.fields.count()}')
            print(f'   Guest Registration: {"Allowed" if form.allow_guest_registration else "Login Required"}')

if __name__ == '__main__':
    add_forms_to_events()
