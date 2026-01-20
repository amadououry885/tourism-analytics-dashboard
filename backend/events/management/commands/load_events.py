"""
Management command to load events from the exported JSON file.
Run on Render: python manage.py load_events
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
import os


class Command(BaseCommand):
    help = 'Load events data from events_export.json'

    def handle(self, *args, **options):
        # Find the events_export.json file
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        json_file = os.path.join(base_dir, 'events_export.json')
        
        if not os.path.exists(json_file):
            self.stderr.write(self.style.ERROR(f'File not found: {json_file}'))
            return
        
        self.stdout.write(f'Loading events from: {json_file}')
        
        try:
            # Use Django's loaddata command
            call_command('loaddata', json_file, verbosity=2)
            self.stdout.write(self.style.SUCCESS('✅ Events loaded successfully!'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error loading events: {e}'))
