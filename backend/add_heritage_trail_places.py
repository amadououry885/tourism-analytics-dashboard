#!/usr/bin/env python3
"""
Add Heritage Trail of Alor Setar places to the database.
All places from the official Alor Setar Tourism Council brochure.
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from analytics.models import Place
from django.contrib.auth import get_user_model

User = get_user_model()

# Get admin user for created_by
admin_user = User.objects.filter(role='admin').first()
if not admin_user:
    admin_user = User.objects.first()

print(f"Using user: {admin_user.email if admin_user else 'None'}")

# Heritage Trail Places with real coordinates
HERITAGE_TRAIL_PLACES = [
    # ===== HISTORICAL / ICONIC TRACES OF ALOR SETAR =====
    {
        "name": "Dataran Tunku",
        "description": "Tunku Square, located in front of the Tunku Building, was launched on August 26, 1983 by Tun Dr Mahathir Mohamad. Tunku Square took part in the 2003 Alor Setar City declaration event and Independence Day celebrations. It is a significant landmark commemorating Malaysia's first Prime Minister.",
        "category": "Historical",
        "city": "Alor Setar",
        "latitude": 6.1214,
        "longitude": 100.3685,
        "is_free": True,
    },
    {
        "name": "Bulatan Maal Hijrah",
        "description": "The Maal Hijrah Roundabout is located on Sultan Badlishah Road. There was a large clock to help people check the time in this area. It serves as an important landmark and meeting point in Alor Setar.",
        "category": "Historical",
        "city": "Alor Setar",
        "latitude": 6.1198,
        "longitude": 100.3672,
        "is_free": True,
    },
    {
        "name": "Stesen Bas Baru (Kopitiam)",
        "description": "This place was known as the new bus station. Currently, this new bus station has been converted into a Kopitiam, a place to enjoy local cuisine. The transformation preserves the historical building while giving it new life as a culinary destination.",
        "category": "Historical",
        "city": "Alor Setar",
        "latitude": 6.1182,
        "longitude": 100.3658,
        "is_free": True,
    },
    {
        "name": "Bulatan Teluk Wan Jah",
        "description": "This roundabout used to have a waterfall structure on 5 Rukun Negara. In 2022, this place became an iconic attraction for statue straw of 'Jelapang Padi' and statue 'Selamat Datang Bandaraya Alor Setar'. A must-visit landmark when entering the city.",
        "category": "Historical",
        "city": "Alor Setar",
        "latitude": 6.1089,
        "longitude": 100.3701,
        "is_free": True,
    },
    {
        "name": "Taman Jublee",
        "description": "Jubilee Park or Royal Park is a public destination for recreational activities. This green space offers a peaceful retreat in the heart of Alor Setar, perfect for families and nature lovers.",
        "category": "Historical",
        "city": "Alor Setar",
        "latitude": 6.1156,
        "longitude": 100.3612,
        "is_free": True,
    },
    {
        "name": "Istana Kuning",
        "description": "The Yellow Palace, located in Kampung Baharu Alor Setar, was built in 1904. This place called the Yellow Palace because the building has been painted yellow. It represents the royal heritage of Kedah.",
        "category": "Historical",
        "city": "Alor Setar",
        "latitude": 6.1245,
        "longitude": 100.3712,
        "is_free": False,
        "price": 5.0,
    },
    {
        "name": "Istana Sepachandera",
        "description": "This building is an old palace located on Kampung Baru Road, Alor Setar. It was built by the late Sultan Abdul Hamid Halim Shah specifically for his first wife, Che Sepachendra. A beautiful example of royal Malay architecture.",
        "category": "Historical",
        "city": "Alor Setar",
        "latitude": 6.1238,
        "longitude": 100.3698,
        "is_free": False,
        "price": 5.0,
    },
    
    # ===== ROYAL TRACES OF ALOR SETAR =====
    {
        "name": "Medan Bandar",
        "description": "The original name of the town square was known as 'Padang Court' due to its proximity to the old courthouse building (now known as Kedah State Art Gallery). This historic square has witnessed many important events in Kedah's history.",
        "category": "Royal Heritage",
        "city": "Alor Setar",
        "latitude": 6.1205,
        "longitude": 100.3678,
        "is_free": True,
    },
    {
        "name": "Alor Setar 250 Tahun Monument",
        "description": "Alor Setar is the oldest city in Malaysia. This monument was built to commemorate the 250th anniversary of the city of Alor Setar. It stands as a proud symbol of the city's rich history.",
        "category": "Royal Heritage",
        "city": "Alor Setar",
        "latitude": 6.1195,
        "longitude": 100.3665,
        "is_free": True,
    },
    {
        "name": "Pintu Gerbang Kota Tengah",
        "description": "The gate of this building was located in front of the Kota Tengah Palace. In 1973, the state building was constructed in this area, leading to the reconstruction of the gate. An important piece of Kedah's royal history.",
        "category": "Royal Heritage",
        "city": "Alor Setar",
        "latitude": 6.1228,
        "longitude": 100.3692,
        "is_free": True,
    },
    {
        "name": "Big Clock Tower",
        "description": "The clock tower was built in 1912. Once upon a time, this clock would chime when prayer time had arrived. It remains one of Alor Setar's most recognizable landmarks.",
        "category": "Royal Heritage",
        "city": "Alor Setar",
        "latitude": 6.1201,
        "longitude": 100.3671,
        "is_free": True,
    },
    
    # ===== NOSTALGIC TRACES OF ALOR SETAR =====
    {
        "name": "Starwalk",
        "description": "Starwalk was started and built in 2001 with the concept of a commercial space and a teflon roof. Starwalk was expanded and redeveloped into a landscape boulevard for event use, pathways, and parking.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1178,
        "longitude": 100.3645,
        "is_free": True,
    },
    {
        "name": "Bazar Wanita / Lorong Sempit",
        "description": "In the 1970s, this narrow lane served as a connection between Tunku Ibrahim Road and the Langgar bus station. This lane also became an alternative pedestrian route for boarding buses.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1185,
        "longitude": 100.3652,
        "is_free": True,
    },
    {
        "name": "Arked Empire / Lorong Timur",
        "description": "The 'Empire' cinema screened Bollywood films and was a popular attraction in Alor Setar since it was built in 1938. The building was later converted into a restaurant and a clothing store.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1192,
        "longitude": 100.3668,
        "is_free": True,
    },
    {
        "name": "Pekan Rabu",
        "description": "Pekan Rabu is one of the earliest Malay business centers, located around Tanjung Chali. This weekly market was founded by YTM Tunku Yaakob and operated only on Wednesdays. Today it's a famous shopping destination for local products.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1168,
        "longitude": 100.3635,
        "is_free": True,
    },
    {
        "name": "Ministry of Tourism, Arts and Culture Malaysia (MOTAC)",
        "description": "On May 15, 2013, Mo Tour was rebranded as the Ministry of Tourism and Culture Malaysia (MOTAC) and renamed the Ministry of Tourism, Arts and culture. The structure of the MOTAC building is characterized by Roman architecture.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1175,
        "longitude": 100.3662,
        "is_free": True,
    },
    {
        "name": "Federal Police Building",
        "description": "The Kedah Police Force was established in 1870. In the 1900s, many officers and members of the Kedah police force consisted of British officers and member of the Sikh community. This building is characterized by Greek architecture.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1188,
        "longitude": 100.3675,
        "is_free": True,
    },
    {
        "name": "Pejabat Pos Lama (Old Post Office)",
        "description": "In 1995, this building was completed after the old building was demolished and known as the Alor Setar post office. Characterized by Roman architecture with Tuscan-style columns from Italy, this old post office looks unique.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1196,
        "longitude": 100.3682,
        "is_free": True,
    },
    {
        "name": "Masjid Nagore (Nagore Mosque)",
        "description": "This mosque was built by Muslim Indians in 1881. The age of this mosque is older than the Zahir Mosque which was built in 1912. The architecture of this mosque shows the influence of Muslim India.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1172,
        "longitude": 100.3658,
        "is_free": True,
    },
    {
        "name": "Pekan Buah (Fruit Market)",
        "description": "This market initially began when several small fruit traders started gathering and selling their produce by the roadside. The market continued to grow over time and is now a popular spot for fresh local fruits.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1162,
        "longitude": 100.3648,
        "is_free": True,
    },
    {
        "name": "Dataran Sungai Raja",
        "description": "Sungai Raja Square was located near the Kedah State Art Gallery. This place is one of the new areas that can be used as a recreational spot for families.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1208,
        "longitude": 100.3688,
        "is_free": True,
    },
    {
        "name": "Wan Mat Saman Building",
        "description": "This building was built between 1939 to 1941 in the British era. The Wan Muhammad Saman building was named after the services that he's contributed to Kedah.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1202,
        "longitude": 100.3695,
        "is_free": True,
    },
    {
        "name": "Majlis Bandaraya Alor Setar (MBAS)",
        "description": "The main office of Alor Setar City Council is believed to have existed since 1932 and it was built for Kedah Volunteer Force (K.V.F). This structure was built based on a colonial architectural style that is similar to Wan Mat Saman Building.",
        "category": "Nostalgic",
        "city": "Alor Setar",
        "latitude": 6.1198,
        "longitude": 100.3702,
        "is_free": True,
    },
    
    # ===== TRACES OF ALOR SETAR BEGIN HERE =====
    {
        "name": "Di Sini Bermulanya Alor Setar",
        "description": "Alor Setar was explored by the late Sultan Muhammad Jiwa Zainal Abidin Muadzam Shah, the 19th Sultan of Kedah (1710-1778) on Saturday, December 31, 1735. The name of Setar was taken from the presence of a flowing stream and also a setar tree. From that, Alor Setar has become the center of state administration.",
        "category": "Heritage Origin",
        "city": "Alor Setar",
        "latitude": 6.1215,
        "longitude": 100.3678,
        "is_free": True,
    },
    {
        "name": "Pekan Cina (Chinatown)",
        "description": "Traditional shops that carry out wholesale activities along Jalan Pekan Melayu and Jalan Pekan Cina are among the earliest buildings constructed in the city of Alor Setar. A vibrant area showcasing the multicultural heritage of the city.",
        "category": "Heritage Origin",
        "city": "Alor Setar",
        "latitude": 6.1182,
        "longitude": 100.3665,
        "is_free": True,
    },
    {
        "name": "China Town Jetty",
        "description": "The jetty that crosses the Anak Bukit River was built by the local community to facilitate the movement of residents between Kampung Seberang Nyonya and the city center.",
        "category": "Heritage Origin",
        "city": "Alor Setar",
        "latitude": 6.1175,
        "longitude": 100.3658,
        "is_free": True,
    },
    {
        "name": "Lighthouse Cape Cali",
        "description": "The goods brought by ships or boats to Pengkalan Kapal are to be sold at the Tanjung Chali market. This lighthouse served as a guide for vessels approaching the trading port.",
        "category": "Heritage Origin",
        "city": "Alor Setar",
        "latitude": 6.1158,
        "longitude": 100.3628,
        "is_free": True,
    },
    {
        "name": "Jambatan Persiaran Sultan Abdul Hamid",
        "description": "The bridge known as 'Matsuroi Bashi' was built by the Japanese because it collapsed on the day of celebrating the victory at Alor Setar in 1945. This bridge connects Pekan Melayu and Seberang Perak in Alor Setar.",
        "category": "Heritage Origin",
        "city": "Alor Setar",
        "latitude": 6.1168,
        "longitude": 100.3642,
        "is_free": True,
    },
    {
        "name": "Rumah Kelahiran Tun Mahathir",
        "description": "On December 20, 1925, YAB Dato' Seri Dr. Mahathir Mohamad was born in this house. He lived in this house until he got married and moved to his own house in Titi Gajah. A significant historical site honoring Malaysia's longest-serving Prime Minister.",
        "category": "Heritage Origin",
        "city": "Alor Setar",
        "latitude": 6.1225,
        "longitude": 100.3715,
        "is_free": False,
        "price": 2.0,
    },
    {
        "name": "Wan Mat Saman Canal",
        "description": "'Sungai Korok Wan Mat Saman,' spanning 36 kilometers, was the longest canal in Alor Setar. The canal starts from the Kedah River to the foothills of Gunung Jerai. An engineering marvel of its time.",
        "category": "Heritage Origin",
        "city": "Alor Setar",
        "latitude": 6.1135,
        "longitude": 100.3598,
        "is_free": True,
    },
    {
        "name": "Medan Seni",
        "description": "Medan Seni Alor Setar was created based on heritage and art tourism elements. There are also mural paintings that attract the tourist. A creative hub celebrating local art and culture.",
        "category": "Heritage Origin",
        "city": "Alor Setar",
        "latitude": 6.1195,
        "longitude": 100.3672,
        "is_free": True,
    },
]

def add_places():
    """Add all heritage trail places to database."""
    added = 0
    skipped = 0
    
    for place_data in HERITAGE_TRAIL_PLACES:
        name = place_data["name"]
        
        # Check if place already exists (case-insensitive)
        exists = Place.objects.filter(name__iexact=name).exists()
        
        if exists:
            print(f"⏭️  SKIPPED (exists): {name}")
            skipped += 1
            continue
        
        # Create the place
        place = Place.objects.create(
            name=place_data["name"],
            description=place_data["description"],
            category=place_data["category"],
            city=place_data["city"],
            latitude=place_data["latitude"],
            longitude=place_data["longitude"],
            is_free=place_data.get("is_free", True),
            price=place_data.get("price", 0),
            created_by=admin_user,
        )
        
        print(f"✅ ADDED: {name} ({place_data['category']}) - [{place_data['latitude']}, {place_data['longitude']}]")
        added += 1
    
    print(f"\n{'='*50}")
    print(f"✅ Added: {added} places")
    print(f"⏭️  Skipped: {skipped} places")
    print(f"📊 Total Heritage Trail places: {len(HERITAGE_TRAIL_PLACES)}")
    
    # Show total Alor Setar places now
    total = Place.objects.filter(city__icontains='alor').count()
    print(f"\n🏛️  Total Alor Setar places in database: {total}")

if __name__ == "__main__":
    print("=" * 50)
    print("ADDING HERITAGE TRAIL OF ALOR SETAR PLACES")
    print("=" * 50)
    add_places()
