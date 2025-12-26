# backend/events/management/commands/fix_event_creators.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from events.models import Event

User = get_user_model()


class Command(BaseCommand):
    help = 'Fix events without created_by field by assigning to admin user'

    def handle(self, *args, **options):
        # Get or create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@kedahtourism.com',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_approved': True,
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Created admin user'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✅ Found existing admin user: {admin_user.username}'))
        
        # Fix events without created_by
        events_without_creator = Event.objects.filter(created_by__isnull=True)
        count = events_without_creator.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('✅ All events already have created_by set'))
            return
        
        self.stdout.write(f'Found {count} events without created_by')
        events_without_creator.update(created_by=admin_user)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Updated {count} events to have created_by={admin_user.username}'))
