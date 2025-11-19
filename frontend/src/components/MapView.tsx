import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Users, TrendingUp } from 'lucide-react';

type MarkerItem = { id?: string | number; position: [number, number]; title?: string };

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerItem[];
  timeRange?: string;
  selectedCity: string;
}

const cities = [
  { id: 'langkawi', name: 'Langkawi', visitors: 425000, trend: '+15.2%', color: '#3b82f6', lat: 6.3500, lng: 99.8000 },
  { id: 'alor-setar', name: 'Alor Setar', visitors: 198000, trend: '+8.7%', color: '#10b981', lat: 6.1248, lng: 100.3678 },
  { id: 'sungai-petani', name: 'Sungai Petani', visitors: 145000, trend: '+12.3%', color: '#f59e0b', lat: 5.6472, lng: 100.4878 },
  { id: 'kulim', name: 'Kulim', visitors: 78000, trend: '+5.1%', color: '#8b5cf6', lat: 5.3659, lng: 100.5617 },
  { id: 'jitra', name: 'Jitra', visitors: 52000, trend: '+9.8%', color: '#ec4899', lat: 6.2683, lng: 100.4225 },
];

function SetViewOnChange({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();
  React.useEffect(() => {
    if (!center) return;
    // smooth animate to new center/zoom
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

const MapView: React.FC<MapViewProps> = ({ selectedCity, center = [6.1200, 100.3667], zoom = 8 }) => {
  // Create markers parameter for Google Maps
  const markers = cities
    .filter(city => selectedCity === 'all' || selectedCity === city.id)
    .map(city => ({ position: [city.lat, city.lng], title: city.name }))
    .slice(0, 5); // Limit to 5 markers for performance

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Kedah Map Overview</CardTitle>
        <CardDescription className="text-gray-900">Regional visitor distribution</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Google Maps Embed */}
        <div className="relative w-full h-[400px] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          <MapContainer 
            center={center} 
            zoom={zoom} 
            scrollWheelZoom={false} 
            style={{ height: '100%', width: '100%' }}
            key={`map-${center[0]}-${center[1]}`}
          >
            {center && <SetViewOnChange center={center} zoom={zoom} />}
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((m, index) => (
              <Marker key={`marker-${index}-${m.position[0]}-${m.position[1]}`} position={m.position}>
                <Popup>{m.title}</Popup>
              </Marker>
            ))}
          </MapContainer>
          {/* Overlay with location info */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <MapPin className="w-3 h-3" />
              <span>Kedah, Malaysia - Tourism Hotspots</span>
            </div>
          </div>
        </div>

        {/* City Stats */}
        <div className="mt-4 space-y-2">
          {cities
            .filter(city => selectedCity === 'all' || selectedCity === city.id)
            .map((city) => (
              <div key={city.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: city.color }}
                  />
                  <span className="text-gray-900 text-sm font-medium">{city.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 text-sm">{city.visitors.toLocaleString()}</span>
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
                    {city.trend}
                  </Badge>
                </div>
              </div>
            ))}
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4 text-xs text-gray-900">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>Tourist Hotspots</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              <span>Visitor Count</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              <span>Growth Rate</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapView;
