# Stay Image Upload System

## Overview
Complete image upload system for accommodations with support for multiple images, primary image selection, and automatic URL generation.

## Backend Implementation

### Models

**Stay Model** (`backend/stays/models.py`):
- `images`: JSONField - Array of image URLs/paths (legacy, still supported)
- `main_image`: ImageField - Primary property image upload
- Uses `stay_image_upload_path()` function for organized file storage in `media/stays/{stay_id}/`

**StayImage Model** (New):
- `stay`: ForeignKey to Stay (related_name='stay_images')
- `image`: ImageField - Individual image upload
- `caption`: CharField - Optional image description
- `is_primary`: BooleanField - Mark as main/featured image
- `order`: PositiveIntegerField - Display order
- `uploaded_at`: DateTimeField - Auto timestamp

**Features:**
- Automatic primary image management (only one primary per stay)
- Image ordering for gallery display
- Automatic file path generation

### Serializers

**StayImageSerializer**:
- Returns `image_url` with absolute URL (includes domain)
- Read-only timestamp field

**StaySerializer** (Enhanced):
- `stay_images`: Nested read-only field showing all images
- `main_image_url`: Computed field with absolute URL
- `uploaded_images`: Write-only list field for bulk upload
- Automatically creates StayImage objects on creation/update

### API Endpoints

#### 1. Upload Multiple Images
```bash
POST /api/stays/{stay_id}/upload_images/
Content-Type: multipart/form-data

files: images (multiple files)
```

**Response:**
```json
{
  "message": "3 images uploaded successfully",
  "images": [
    {
      "id": 1,
      "image": "/media/stays/123/hotel_image1.jpg",
      "image_url": "http://localhost:8000/media/stays/123/hotel_image1.jpg",
      "caption": "",
      "is_primary": true,
      "order": 0,
      "uploaded_at": "2025-11-21T10:00:00Z"
    },
    ...
  ]
}
```

**Permission:** Only stay owner or admin can upload

#### 2. Delete Image
```bash
DELETE /api/stays/{stay_id}/images/{image_id}/
```

**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

#### 3. Set Primary Image
```bash
PATCH /api/stays/{stay_id}/images/{image_id}/set-primary/
```

**Response:**
```json
{
  "message": "Primary image updated",
  "image": { ... }
}
```

#### 4. Create Stay with Images
```bash
POST /api/stays/stays/
Content-Type: multipart/form-data

name: "Luxury Hotel"
type: "Hotel"
district: "Langkawi"
priceNight: 250
uploaded_images: [file1, file2, file3]
```

#### 5. List Stay Images
```bash
GET /api/stays/images/?stay_id=123
```

**Response:**
```json
[
  {
    "id": 1,
    "image": "/media/stays/123/image1.jpg",
    "image_url": "http://localhost:8000/media/stays/123/image1.jpg",
    "caption": "Main entrance",
    "is_primary": true,
    "order": 0,
    "uploaded_at": "2025-11-21T10:00:00Z"
  },
  ...
]
```

## Frontend Integration

### TypeScript Interface (Add to `frontend/src/types/stay.ts`)

```typescript
export interface StayImage {
  id: number;
  image: string;
  image_url: string;
  caption: string;
  is_primary: boolean;
  order: number;
  uploaded_at: string;
}

export interface Stay {
  id: number;
  name: string;
  // ... existing fields ...
  images: string[];  // Legacy field
  main_image?: string;
  main_image_url?: string;
  stay_images?: StayImage[];
  // ... rest of fields ...
}
```

### Example: Upload Images Component

```typescript
import React, { useState } from 'react';
import axios from 'axios';

interface ImageUploadProps {
  stayId: number;
  onUploadComplete: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ stayId, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('images', file);
    });

    setUploading(true);
    try {
      const response = await axios.post(
        `/api/stays/${stayId}/upload_images/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Upload successful:', response.data);
      onUploadComplete();
      setSelectedFiles(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="block w-full text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={!selectedFiles || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {uploading ? 'Uploading...' : `Upload ${selectedFiles?.length || 0} Images`}
      </button>
    </div>
  );
};
```

### Example: Image Gallery Component

```typescript
import React from 'react';
import { Stay, StayImage } from '../types/stay';

interface ImageGalleryProps {
  stay: Stay;
  onSetPrimary?: (imageId: number) => void;
  onDelete?: (imageId: number) => void;
  editable?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  stay,
  onSetPrimary,
  onDelete,
  editable = false,
}) => {
  const images = stay.stay_images || [];
  const primaryImage = images.find(img => img.is_primary) || images[0];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      {primaryImage && (
        <div className="relative">
          <img
            src={primaryImage.image_url}
            alt={stay.name}
            className="w-full h-96 object-cover rounded-lg"
          />
          <span className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded text-sm">
            Primary
          </span>
        </div>
      )}

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.image_url}
              alt={image.caption || `Image ${image.order}`}
              className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
            />
            {editable && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                {!image.is_primary && onSetPrimary && (
                  <button
                    onClick={() => onSetPrimary(image.id)}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                  >
                    Set Primary
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(image.id)}
                    className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Example: Update StayOwnerDashboard

Add image management to the stay owner dashboard:

```typescript
// In StayOwnerDashboard.tsx
import ImageUpload from '../components/ImageUpload';
import ImageGallery from '../components/ImageGallery';

// Add handlers
const handleSetPrimary = async (stayId: number, imageId: number) => {
  try {
    await axios.patch(`/api/stays/${stayId}/images/${imageId}/set-primary/`);
    // Refresh stay data
    fetchStays();
  } catch (error) {
    console.error('Error setting primary image:', error);
  }
};

const handleDeleteImage = async (stayId: number, imageId: number) => {
  try {
    await axios.delete(`/api/stays/${stayId}/images/${imageId}/`);
    // Refresh stay data
    fetchStays();
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// In JSX, for each stay:
<div>
  <ImageGallery
    stay={stay}
    editable={true}
    onSetPrimary={(imageId) => handleSetPrimary(stay.id, imageId)}
    onDelete={(imageId) => handleDeleteImage(stay.id, imageId)}
  />
  <ImageUpload
    stayId={stay.id}
    onUploadComplete={() => fetchStays()}
  />
</div>
```

## Admin Interface

The Django admin now includes:
- Inline image management when editing stays
- Separate StayImage admin for bulk operations
- Filtering by primary status and upload date

## File Storage

**Development:**
- Files stored in `backend/media/stays/{stay_id}/`
- Served by Django during development
- URLs: `http://localhost:8000/media/stays/123/image.jpg`

**Production:**
- Configure `MEDIA_ROOT` and `MEDIA_URL` in settings
- Use cloud storage (AWS S3, Google Cloud Storage) for production
- Update `DEFAULT_FILE_STORAGE` setting

## Testing

Example test cases:

```bash
# Upload images
curl -X POST http://localhost:8000/api/stays/1/upload_images/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"

# Set primary image
curl -X PATCH http://localhost:8000/api/stays/1/images/5/set-primary/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete image
curl -X DELETE http://localhost:8000/api/stays/1/images/5/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# List stay images
curl http://localhost:8000/api/stays/images/?stay_id=1
```

## Migration Notes

**Migration 0005** adds:
- `main_image` field to Stay model (nullable)
- `StayImage` model with FK to Stay

Existing stays will have `main_image=None` and no `stay_images` until images are uploaded.

## Security Considerations

1. **File Size Limits**: Add `DATA_UPLOAD_MAX_MEMORY_SIZE` in settings.py
2. **File Types**: Pillow validates image files automatically
3. **Permissions**: Only owners can upload/delete images for their stays
4. **Storage Quotas**: Consider adding per-stay image limits

## Performance Tips

1. Generate thumbnails on upload for faster gallery loading
2. Use lazy loading for image galleries
3. Implement CDN for media files in production
4. Add image compression/optimization pipeline

## Next Steps

- [ ] Add thumbnail generation (use PIL/Pillow)
- [ ] Implement image cropping/editing
- [ ] Add drag-and-drop reordering
- [ ] Implement image compression
- [ ] Add watermarking for branding
- [ ] Integrate with cloud storage (S3/GCS)
