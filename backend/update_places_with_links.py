#!/usr/bin/env python
"""
Update existing places with Wikipedia links, websites, contact info, and amenities.
Run with: python update_places_with_links.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from analytics.models import Place

# Sample data for Kedah tourism places
places_data = {
    "Alor Setar Tower (Menara Alor Setar)": {
        "wikipedia_url": "https://en.wikipedia.org/wiki/Alor_Setar_Tower",
        "official_website": "https://www.kedah.gov.my/",
        "tripadvisor_url": "https://www.tripadvisor.com/Attraction_Review-g298283-d2371503-Reviews-Alor_Setar_Tower-Alor_Setar_Kedah.html",
        "contact_phone": "+604-733 1957",
        "contact_email": "info@menaraas.gov.my",
        "address": "Jalan Tunku Yaakob, Bandar Alor Setar, 05000 Alor Setar, Kedah",
        "opening_hours": "Monday - Thursday: 9:30 AM - 10:00 PM\nFriday: 9:30 AM - 12:00 PM, 3:00 PM - 10:00 PM\nSaturday - Sunday: 9:30 AM - 10:00 PM",
        "best_time_to_visit": "Evening for sunset views, weekdays less crowded",
        "amenities": {
            "parking": True,
            "wifi": True,
            "wheelchair_accessible": True,
            "restaurant": True,
            "restroom": True
        }
    },
    "Balai Besar (Grand Audience Hall)": {
        "wikipedia_url": "https://en.wikipedia.org/wiki/Balai_Besar,_Alor_Setar",
        "official_website": "https://www.kedah.gov.my/",
        "contact_phone": "+604-731 1234",
        "address": "Jalan Raja, Bandar Alor Setar, 05000 Alor Setar, Kedah",
        "opening_hours": "Daily: 9:00 AM - 5:00 PM\nClosed on public holidays",
        "best_time_to_visit": "Early morning or late afternoon for cooler weather",
        "amenities": {
            "parking": True,
            "wheelchair_accessible": False,
            "restroom": True
        }
    },
    "Zahir Mosque (Masjid Zahir)": {
        "wikipedia_url": "https://en.wikipedia.org/wiki/Zahir_Mosque",
        "tripadvisor_url": "https://www.tripadvisor.com/Attraction_Review-g298283-d2371502-Reviews-Zahir_Mosque-Alor_Setar_Kedah.html",
        "contact_phone": "+604-733 4242",
        "address": "Jalan Kota, Bandar Alor Setar, 05000 Alor Setar, Kedah",
        "opening_hours": "Daily: 9:00 AM - 12:00 PM, 2:30 PM - 4:00 PM, 5:30 PM - 6:30 PM\n(Closed during prayer times)",
        "best_time_to_visit": "Morning hours, avoid Friday noon prayer",
        "amenities": {
            "parking": True,
            "wheelchair_accessible": True,
            "restroom": True
        }
    },
    "Kedah State Art Gallery (Balai Seni Negeri)": {
        "official_website": "https://www.kedah.gov.my/",
        "contact_phone": "+604-731 1234",
        "address": "Jalan Raja, Bandar Alor Setar, 05000 Alor Setar, Kedah",
        "opening_hours": "Tuesday - Sunday: 10:00 AM - 6:00 PM\nClosed on Mondays",
        "best_time_to_visit": "Weekday mornings for quiet viewing",
        "amenities": {
            "parking": True,
            "wifi": True,
            "wheelchair_accessible": True,
            "restroom": True
        }
    },
    "Langkawi": {
        "wikipedia_url": "https://en.wikipedia.org/wiki/Langkawi",
        "official_website": "https://www.langkawi-info.com/",
        "tripadvisor_url": "https://www.tripadvisor.com/Tourism-g306997-Langkawi_Kedah-Vacations.html",
        "contact_phone": "+604-966 7789",
        "contact_email": "tourism@langkawi.gov.my",
        "address": "Langkawi Island, Kedah, Malaysia",
        "opening_hours": "Island attractions vary - most open 9:00 AM - 6:00 PM",
        "best_time_to_visit": "November to March (dry season)",
        "amenities": {
            "parking": True,
            "wifi": True,
            "wheelchair_accessible": True,
            "restaurant": True,
            "restroom": True
        }
    },
    "Sungai Petani": {
        "wikipedia_url": "https://en.wikipedia.org/wiki/Sungai_Petani",
        "official_website": "https://www.mpspk.gov.my/",
        "contact_phone": "+604-421 3000",
        "contact_email": "aduan@mpspk.gov.my",
        "address": "Sungai Petani, Kedah, Malaysia",
        "opening_hours": "City center open 24/7, shops 9:00 AM - 10:00 PM",
        "best_time_to_visit": "Year-round, avoid monsoon season (September-November)",
        "amenities": {
            "parking": True,
            "wifi": True,
            "wheelchair_accessible": True,
            "restaurant": True,
            "restroom": True
        }
    },
    "Jitra": {
        "wikipedia_url": "https://en.wikipedia.org/wiki/Jitra",
        "contact_phone": "+604-917 1234",
        "address": "Jitra, Kedah, Malaysia",
        "opening_hours": "Town center open daily, market 6:00 AM - 6:00 PM",
        "best_time_to_visit": "Early morning for local market experience",
        "amenities": {
            "parking": True,
            "restaurant": True,
            "restroom": True
        }
    },
    "Tanjung Chali Waterfront": {
        "official_website": "https://www.kedah.gov.my/",
        "contact_phone": "+604-731 1234",
        "address": "Tanjung Chali, Alor Setar, Kedah",
        "opening_hours": "Daily: 6:00 AM - 11:00 PM",
        "best_time_to_visit": "Evening for sunset views and cooler weather",
        "amenities": {
            "parking": True,
            "wifi": False,
            "wheelchair_accessible": True,
            "restaurant": True,
            "restroom": True
        }
    },
    "Pedu Lake": {
        "wikipedia_url": "https://en.wikipedia.org/wiki/Pedu_Lake",
        "tripadvisor_url": "https://www.tripadvisor.com/Attraction_Review-g298283-d8524421-Reviews-Pedu_Lake-Alor_Setar_Kedah.html",
        "contact_phone": "+604-975 6000",
        "address": "Mukim Pedu, Sik, Kedah",
        "opening_hours": "Daily: 8:00 AM - 6:00 PM",
        "best_time_to_visit": "December to February for cooler weather",
        "amenities": {
            "parking": True,
            "restaurant": True,
            "restroom": True
        }
    },
    "Eagle Square (Dataran Lang)": {
        "wikipedia_url": "https://en.wikipedia.org/wiki/Langkawi#Eagle_Square",
        "tripadvisor_url": "https://www.tripadvisor.com/Attraction_Review-g306997-d2633636-Reviews-Eagle_Square-Langkawi_Kedah.html",
        "address": "Jalan Persiaran Putra, Kuah, Langkawi, Kedah",
        "opening_hours": "Daily: Open 24 hours",
        "best_time_to_visit": "Early morning or sunset for best photos",
        "amenities": {
            "parking": True,
            "wheelchair_accessible": True,
            "restroom": True
        }
    }
}

def update_places():
    """Update places with new information"""
    updated_count = 0
    
    for place_name, data in places_data.items():
        try:
            place = Place.objects.get(name=place_name)
            
            # Update fields
            if 'wikipedia_url' in data:
                place.wikipedia_url = data['wikipedia_url']
            if 'official_website' in data:
                place.official_website = data['official_website']
            if 'tripadvisor_url' in data:
                place.tripadvisor_url = data['tripadvisor_url']
            if 'contact_phone' in data:
                place.contact_phone = data['contact_phone']
            if 'contact_email' in data:
                place.contact_email = data['contact_email']
            if 'address' in data:
                place.address = data['address']
            if 'opening_hours' in data:
                place.opening_hours = data['opening_hours']
            if 'best_time_to_visit' in data:
                place.best_time_to_visit = data['best_time_to_visit']
            if 'amenities' in data:
                place.amenities = data['amenities']
            
            # Generate Google Maps URL if coordinates exist
            if place.latitude and place.longitude:
                place.google_maps_url = f"https://www.google.com/maps?q={place.latitude},{place.longitude}"
            
            place.save()
            updated_count += 1
            print(f"✅ Updated: {place_name}")
            
        except Place.DoesNotExist:
            print(f"❌ Place not found: {place_name}")
        except Exception as e:
            print(f"❌ Error updating {place_name}: {str(e)}")
    
    print(f"\n✨ Updated {updated_count} places successfully!")

if __name__ == '__main__':
    print("🚀 Starting to update places with external links and info...")
    update_places()
    print("✅ Done!")
