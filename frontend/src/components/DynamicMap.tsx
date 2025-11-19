import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface DynamicMapProps {
  selectedCity: string;
}

// Define coordinates for cities and a default for "All Cities"
const cityData: { [key: string]: { query: string } } = {
  'Alor Setar': { query: 'Alor+Setar,Kedah,Malaysia' },
  'Jitra': { query: 'Jitra,Kedah,Malaysia' },
  'Kulim': { query: 'Kulim,Kedah,Malaysia' },
  'Langkawi': { query: 'Langkawi,Kedah,Malaysia' },
  'Sungai Petani': { query: 'Sungai+Petani,Kedah,Malaysia' },
  'all': { query: 'Kedah,Malaysia' } // Default view for "All Cities"
};

export const DynamicMap: React.FC<DynamicMapProps> = ({ selectedCity }) => {
  // Determine the correct query for the map URL
  const mapInfo = cityData[selectedCity] || cityData['all'];
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${mapInfo.query}`;

  return (
    <Card className="bg-white border-gray-200 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-gray-900">Kedah Map Overview</CardTitle>
        <CardDescription className="text-gray-900">
          {selectedCity === 'all' ? 'Regional visitor distribution' : `Location of ${selectedCity}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full rounded-lg overflow-hidden border border-gray-200">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
          ></iframe>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Note: This is a Google Maps embed. An API key is required for production use.
        </div>
      </CardContent>
    </Card>
  );
};
