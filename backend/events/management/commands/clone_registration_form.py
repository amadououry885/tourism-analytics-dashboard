# backend/events/management/commands/clone_registration_form.py
from django.core.management.base import BaseCommand
from events.models import Event, EventRegistrationForm, EventRegistrationField


class Command(BaseCommand):
    help = 'Clone registration form from one event to another'

    def add_arguments(self, parser):
        parser.add_argument('source_event_id', type=int, help='Event ID to copy form from')
        parser.add_argument('target_event_ids', type=int, nargs='+', help='Event IDs to copy form to')

    def handle(self, *args, **options):
        source_id = options['source_event_id']
        target_ids = options['target_event_ids']
        
        # Get source event and form
        try:
            source_event = Event.objects.get(id=source_id)
            source_form = source_event.registration_form
        except Event.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ Event {source_id} not found'))
            return
        except EventRegistrationForm.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ Event {source_id} has no registration form'))
            return
        
        self.stdout.write(f'📋 Cloning form from: {source_event.title}')
        self.stdout.write(f'   Form: {source_form.title}')
        self.stdout.write(f'   Fields: {source_form.fields.count()}')
        
        # Clone to target events
        cloned_count = 0
        for target_id in target_ids:
            try:
                target_event = Event.objects.get(id=target_id)
                
                # Delete existing form if any
                if hasattr(target_event, 'registration_form'):
                    target_event.registration_form.delete()
                    self.stdout.write(f'   ⚠️  Deleted existing form from: {target_event.title}')
                
                # Create new form
                new_form = EventRegistrationForm.objects.create(
                    event=target_event,
                    title=source_form.title,
                    description=source_form.description,
                    confirmation_message=source_form.confirmation_message,
                    allow_guest_registration=source_form.allow_guest_registration,
                )
                
                # Clone all fields
                for field in source_form.fields.all():
                    EventRegistrationField.objects.create(
                        form=new_form,
                        label=field.label,
                        field_type=field.field_type,
                        is_required=field.is_required,
                        placeholder=field.placeholder,
                        help_text=field.help_text,
                        options=field.options,
                        order=field.order,
                        min_length=field.min_length,
                        max_length=field.max_length,
                        pattern=field.pattern,
                    )
                
                cloned_count += 1
                self.stdout.write(self.style.SUCCESS(f'   ✅ Cloned to: {target_event.title} (Event #{target_id})'))
                
            except Event.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'   ❌ Event {target_id} not found - skipped'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully cloned form to {cloned_count}/{len(target_ids)} events'))
