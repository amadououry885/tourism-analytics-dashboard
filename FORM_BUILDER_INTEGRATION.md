# How to Add Form Builder to Admin Portal

## Step 1: Add Import (Line 27, after PlacesManagement import)

```typescript
import RegistrationFormBuilder from '../../components/RegistrationFormBuilder';
```

## Step 2: Add State (Line 91, after editingEvent state)

```typescript
const [formBuilderEvent, setFormBuilderEvent] = useState<Event | null>(null);
```

## Step 3: Add "Create Form" Button (Line 865, before "Attendees" button)

Replace the button group starting at line 865 with:

```typescript
<div className="flex gap-1">
  <button
    onClick={() => setFormBuilderEvent(event)}
    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors font-bold shadow-sm"
    title="Create/Edit Registration Form"
  >
    📋 Form
  </button>
  <button
    onClick={() => {/* existing Attendees button code */}}
    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors font-bold shadow-sm"
  >
    <Users className="w-3 h-3" />
    Attendees
  </button>
  <button
    onClick={() => {/* existing Edit button code */}}
    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors font-bold shadow-sm"
  >
    <Edit2 className="w-3 h-3" />
    Edit
  </button>
  <button
    onClick={() => handleDeleteEvent(event.id)}
    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors font-bold shadow-sm"
  >
    <Trash2 className="w-3 h-3" />
    Delete
  </button>
</div>
```

## Step 4: Add Form Builder Modal (Line 1660, before closing div)

```typescript
{/* Registration Form Builder */}
{formBuilderEvent && (
  <RegistrationFormBuilder
    eventId={formBuilderEvent.id}
    eventTitle={formBuilderEvent.title}
    onClose={() => setFormBuilderEvent(null)}
    onSave={() => {
      fetchEvents();
      setFormBuilderEvent(null);
    }}
  />
)}
```

## Usage for Admin:

1. Go to Events tab in admin portal
2. Find an event
3. Click the purple "📋 Form" button
4. Drag-and-drop to reorder fields
5. Click "+ Add Field" to add more fields
6. Click "Show Preview" to see how it looks
7. Click "Save Form"

Done! No coding required!
