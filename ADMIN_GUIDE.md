# Admin Panel Guide - Tourism Analytics Dashboard

## Accessing the Admin Panel

1. Navigate to: `http://localhost:8000/admin/`
2. Login with your admin credentials
3. Click on **"Places"** under the **Analytics** section

## Adding/Editing Places

### Basic Information Section
- **Name**: The place name (e.g., "Aman Central Mall")
- **Description**: Brief description of the place
- **Category**: Select from dropdown (Shopping, Historical, etc.)
- **Image URL**: Link to the place's main image

### Location Details Section
- **City**: City name (e.g., "Alor Setar")
- **State**: State/Province (e.g., "Kedah")
- **Country**: Country (e.g., "Malaysia")
- **Latitude/Longitude**: GPS coordinates (optional)
- **Address**: Full street address

### Pricing Information Section
- **Is Free**: Check if entry is free
- **Price**: Entry fee amount (if not free)
- **Currency**: Select currency (MYR, USD, etc.)

### External Links & Resources Section
Add helpful links for visitors:
- **Wikipedia URL**: Full Wikipedia link (e.g., `https://en.wikipedia.org/wiki/Aman_Central`)
- **Official Website**: Place's official website
- **TripAdvisor URL**: TripAdvisor page link
- **Google Maps URL**: Google Maps link

### Contact Information Section
- **Contact Phone**: Phone number with country code (e.g., `+604-730 8888`)
- **Contact Email**: Email address for inquiries

### Visitor Information Section
- **Opening Hours**: Operating hours (e.g., `Mon-Sun: 10:00 AM - 10:00 PM`)
- **Best Time to Visit**: Recommendations (e.g., `Weekday afternoons for less crowd`)

### Facilities & Amenities Section
Enter amenities as **JSON format**:

```json
{
  "parking": true,
  "wifi": true,
  "wheelchair_accessible": true,
  "restaurant": true,
  "restroom": true
}
```

**Available amenities:**
- `parking` - Parking available
- `wifi` - Free WiFi
- `wheelchair_accessible` - Wheelchair accessible
- `restaurant` - Has restaurant/food court
- `restroom` - Public restrooms available

**Example for partial amenities:**
```json
{
  "parking": true,
  "wifi": false,
  "wheelchair_accessible": true,
  "restaurant": true,
  "restroom": true
}
```

## List View Indicators

In the places list, you'll see checkmark (✓) or X (✗) indicators for:
- **Wikipedia**: Has Wikipedia link
- **Website**: Has official website
- **Contact Info**: Has phone or email
- **Amenities**: Has amenities configured

## Tips for Best Results

1. **Complete All Sections**: Fill out as much information as possible for a better user experience
2. **Verify URLs**: Test all external links before saving
3. **Use Consistent Formatting**: 
   - Phone numbers: `+country-code-number` (e.g., `+604-730 8888`)
   - Hours: Use 12-hour format with AM/PM
4. **JSON Validation**: Ensure amenities JSON is properly formatted with quotes and commas
5. **Images**: Use high-quality image URLs (recommended: 1200x800px)

## Quick Examples

### Complete Place Entry - Shopping Mall
```
Name: Aman Central Mall
Category: Shopping
City: Alor Setar
State: Kedah
Country: Malaysia
Description: Major shopping complex with retail stores, restaurants, and entertainment
Image URL: https://example.com/aman-central.jpg
Wikipedia URL: https://en.wikipedia.org/wiki/Aman_Central
Official Website: https://www.amancentral.com.my
Contact Phone: +604-730 8888
Contact Email: info@amancentral.com.my
Address: Jalan Tunku Ibrahim, 05200 Alor Setar, Kedah, Malaysia
Opening Hours: Daily: 10:00 AM - 10:00 PM
Best Time to Visit: Weekday afternoons for less crowd, weekends for events
Is Free: ✓ (checked)
Amenities: {"parking": true, "wifi": true, "wheelchair_accessible": true, "restaurant": true, "restroom": true}
```

### Complete Place Entry - Historical Site
```
Name: Zahir Mosque
Category: Historical
City: Alor Setar
State: Kedah
Country: Malaysia
Description: Beautiful state mosque built in 1912, one of the grandest and oldest mosques in Malaysia
Wikipedia URL: https://en.wikipedia.org/wiki/Zahir_Mosque
Contact Phone: +604-733 8110
Opening Hours: Daily: 8:00 AM - 6:00 PM (Non-prayer times for tourists)
Best Time to Visit: Early morning or late afternoon for best lighting
Is Free: ✓ (checked)
Amenities: {"parking": true, "wifi": false, "wheelchair_accessible": true, "restroom": true}
```

## Troubleshooting

**Issue**: Amenities not showing on frontend
- **Solution**: Ensure JSON is valid (use a JSON validator)
- **Check**: Curly braces `{}`, quotes around keys and values, commas between items

**Issue**: External links not working
- **Solution**: Include full URL with `https://` or `http://`

**Issue**: Place not appearing in analytics
- **Solution**: Ensure the place has associated social posts for engagement metrics

## Support

For technical issues or questions, contact the development team.
