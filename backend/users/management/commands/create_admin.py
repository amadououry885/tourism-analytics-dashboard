from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Create default admin user if it does not exist'

    def handle(self, *args, **options):
        # Check if admin exists
        if User.objects.filter(email='admin@kedahtourism.com').exists():
            self.stdout.write(self.style.WARNING('Admin user already exists'))
            return

        # Create admin user
        admin_user = User.objects.create_user(
            email='admin@kedahtourism.com',
            password='admin123',  # Change this in production!
            name='Admin User',
            role='admin',
            is_staff=True,
            is_superuser=True,
            is_approved=True
        )
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created admin user: {admin_user.email}'))
        self.stdout.write(self.style.WARNING('⚠️  Default password: admin123 (Please change this!)'))
