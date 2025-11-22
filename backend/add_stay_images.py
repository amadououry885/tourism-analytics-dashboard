"""
Script to add sample images to existing stays.
Uses placeholder images from various sources.
"""
import os
import django

os.environ.setdefault('DJANGO_SETDEFAULT', 'tourism_api.settings')
django.setup()

from stays.models import Stay

# Sample image URLs from placeholder services
SAMPLE_IMAGES = {
    "Hotel": [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945",  # Luxury hotel
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",  # Hotel bedroom
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",  # Hotel exterior
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7",  # Hotel lobby
    ],
    "Apartment": [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",  # Modern apartment
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",  # Apartment interior
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9",  # Living room
        "https://images.unsplash.com/photo-1502672260066-6bc35f0ab07e",  # Apartment view
    ],
    "Guest House": [
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791",  # Guest house
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d",  # Cozy room
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",  # Guest house exterior
        "https://images.unsplash.com/photo-1568495248636-6432b97bd949",  # Garden view
    ],
    "Homestay": [
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6",  # Cozy home
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",  # Homestay interior
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",  # Home bedroom
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",  # Home living area
    ],
}

# High-quality Malaysia-specific images
MALAYSIA_IMAGES = {
    "Langkawi": [
        "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5",  # Beach resort
        "https://images.unsplash.com/photo-1602002418082-a4443e081dd1",  # Tropical beach
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d",  # Resort pool
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7",  # Luxury resort
    ],
    "Alor Setar": [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",  # City hotel
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a",  # Urban stay
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",  # Modern hotel
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",  # Hotel building
    ],
    "Kulim": [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",  # Tech area hotel
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",  # Business hotel
        "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0",  # Modern suite
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",  # Hotel room
    ],
}

def add_images_to_stays():
    """Add sample images to all existing stays"""
    stays = Stay.objects.filter(is_internal=True)
    
    print(f"Found {stays.count()} internal stays")
    
    for stay in stays:
        # Get images based on type and district
        images = []
        
        # Add type-specific images
        if stay.type in SAMPLE_IMAGES:
            images.extend(SAMPLE_IMAGES[stay.type][:2])
        
        # Add district-specific images
        if stay.district in MALAYSIA_IMAGES:
            images.extend(MALAYSIA_IMAGES[stay.district][:2])
        
        # If no images yet, use default hotel images
        if not images:
            images = SAMPLE_IMAGES["Hotel"][:3]
        
        # Add query parameters for better image quality
        formatted_images = []
        for idx, img_url in enumerate(images):
            # Add Unsplash parameters for optimization
            quality_url = f"{img_url}?w=1200&h=800&fit=crop&q=80"
            formatted_images.append(quality_url)
        
        # Update the stay with images
        stay.images = formatted_images
        stay.save()
        
        print(f"✓ Added {len(formatted_images)} images to: {stay.name} ({stay.type} in {stay.district})")
    
    print(f"\n✅ Successfully added images to {stays.count()} stays!")

if __name__ == '__main__':
    add_images_to_stays()
