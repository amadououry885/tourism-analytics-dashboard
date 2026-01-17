from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Create default admin users if they do not exist'

    def handle(self, *args, **options):
        # Create main admin user
        if User.objects.filter(username='admin').exists():
            self.stdout.write(self.style.WARNING('Admin user (admin) already exists'))
        else:
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@kedahtourism.com',
                password='admin123',
                role='admin',
                is_staff=True,
                is_superuser=True,
                is_approved=True
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Created admin user: admin'))
            self.stdout.write(self.style.WARNING('⚠️  Default password: admin123'))

        # Create second admin user (adminn) for group mate
        if User.objects.filter(username='adminn').exists():
            self.stdout.write(self.style.WARNING('Admin user (adminn) already exists'))
        else:
            adminn_user = User.objects.create_user(
                username='adminn',
                email='adminn@kedahtourism.com',
                password='admin321',
                role='admin',
                is_staff=True,
                is_superuser=True,
                is_approved=True
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Created admin user: adminn'))
            self.stdout.write(self.style.WARNING('⚠️  Password: admin321'))
