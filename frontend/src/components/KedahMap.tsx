import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// This is a crucial fix for the default marker icon path issue with bundlers like Vite.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface KedahMapProps {
  selectedCity: string;
}

const cityCoordinates: { [key: string]: { lat: number; lng: number; visitors: number } } = {
  'Alor Setar': { lat: 6.1248, lng: 100.3678, visitors: 425000 },
  'Jitra': { lat: 6.2632, lng: 100.4226, visitors: 198000 },
  'Kulim': { lat: 5.3649, lng: 100.5615, visitors: 145000 },
  'Langkawi': { lat: 6.3500, lng: 99.8000, visitors: 312000 },
  'Sungai Petani': { lat: 5.6467, lng: 100.4876, visitors: 287000 }
};

// This component dynamically changes the map's view when the city changes.
function MapViewController({ city }: { city: string }) {
  const map = useMap();
  useEffect(() => {
    if (city && city !== 'all' && cityCoordinates[city]) {
      const { lat, lng } = cityCoordinates[city];
      map.setView([lat, lng], 12, { animate: true });
    } else {
      // Default view for "All Cities"
      map.setView([6.0, 100.5], 9, { animate: true });
    }
  }, [city, map]);

  return null;
}

export const KedahMap: React.FC<KedahMapProps> = ({ selectedCity }) => {
  const markers = selectedCity === 'all'
    ? Object.entries(cityCoordinates).map(([name, data]) => ({ name, ...data }))
    : cityCoordinates[selectedCity]
      ? [{ name: selectedCity, ...cityCoordinates[selectedCity] }]
      : [];

  return (
    <Card className="bg-white border-gray-200 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-gray-900">Kedah Map Overview</CardTitle>
        <CardDescription className="text-gray-900">
          {selectedCity === 'all' ? 'Regional visitor distribution' : `Location of ${selectedCity}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* This div with a fixed height is essential for the map to render. */}
        <div className="h-[450px] w-full rounded-lg overflow-hidden border border-gray-200">
          <MapContainer center={[6.0, 100.5]} zoom={9} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapViewController city={selectedCity} />
            {markers.map(marker => (
              <Marker key={marker.name} position={[marker.lat, marker.lng]}>
                <Popup>
                  <div className="font-bold">{marker.name}</div>
                  <div>{marker.visitors.toLocaleString()} visitors</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};
