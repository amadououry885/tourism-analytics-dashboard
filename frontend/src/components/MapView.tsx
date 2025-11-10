import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Users, TrendingUp } from 'lucide-react';

interface MapViewProps {
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

export function MapView({ selectedCity }: MapViewProps) {
  // Center of Kedah for the map
  const kedahCenter = { lat: 6.1184, lng: 100.3685 };
  
  // Create markers parameter for Google Maps
  const markers = cities
    .filter(city => selectedCity === 'all' || selectedCity === city.id)
    .map(city => `markers=color:${encodeURIComponent(city.color.replace('#', '0x'))}%7Clabel:${city.name.charAt(0)}%7C${city.lat},${city.lng}`)
    .join('&');

  const mapUrl = `https://www.google.com/maps/embed/v1/view?key=YOUR_GOOGLE_MAPS_API_KEY&center=${kedahCenter.lat},${kedahCenter.lng}&zoom=9&maptype=roadmap`;

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Kedah Map Overview</CardTitle>
        <CardDescription className="text-gray-900">Regional visitor distribution</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Google Maps Embed */}
        <div className="relative w-full h-[400px] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1015565.4743935394!2d99.80959905!3d6.1184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304b614c6b7c8c85%3A0x3039d80b2b75c60!2sKedah%2C%20Malaysia!5e0!3m2!1sen!2s!4v1699999999999!5m2!1sen!2s`}
            className="rounded-lg"
          />
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
}
