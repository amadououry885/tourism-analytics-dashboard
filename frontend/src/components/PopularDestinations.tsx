/* Cache bust: Fri Dec 13 2025 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  MessageCircle,
  Navigation,
  Share2,
  DollarSign,
  Globe,
  Phone,
  Clock
} from 'lucide-react';
import { MasterDetailLayout } from './MasterDetailLayout';
import { ListItem } from './ListItem';
import { DetailPanel } from './DetailPanel';

interface PopularDestinationsProps {
  timeRange?: string;
  selectedCity: string;
}

interface Destination {
  id?: number;
  name: string;
  description?: string | null;
  posts?: number;
  engagement?: number;
  rating?: number;
  category?: string;
  city?: string;
  is_free?: boolean;
  price?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;

  wikipedia_url?: string;
  official_website?: string;
  tripadvisor_url?: string;

  contact_phone?: string;
  contact_email?: string;
  address?: string;
  opening_hours?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
      {children}
    </div>
  );
}

export function PopularDestinations({ selectedCity }: PopularDestinationsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/analytics/places/popular/');
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setDestinations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [destinations, searchTerm]);

  useEffect(() => {
    if (filteredDestinations.length && !selectedDestination) {
      setSelectedDestination(filteredDestinations[0]);
    }
  }, [filteredDestinations, selectedDestination]);

  const handleGetDirections = () => {
    if (!selectedDestination) return;
    const query = selectedDestination.latitude && selectedDestination.longitude
      ? `${selectedDestination.latitude},${selectedDestination.longitude}`
      : selectedDestination.name;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
  };

  const handleShare = () => {
    if (!selectedDestination) return;
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied');
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading destinations…</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 border rounded-lg"
              placeholder="Search destinations…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 min-h-0">
        <MasterDetailLayout
          leftPanel={
            <div className="bg-white overflow-y-auto">
              {filteredDestinations.map((d, i) => (
                <ListItem
                  key={d.id || i}
                  title={d.name}
                  subtitle={`${d.city || 'Kedah'} • ${d.category || 'Attraction'}`}
                  metrics={[
                    { label: 'Posts', value: d.posts || 0, icon: <MessageCircle className="w-3 h-3" /> },
                    { label: 'Rating', value: `${d.rating?.toFixed(1) || 'N/A'} ★`, icon: <Star className="w-3 h-3" /> },
                  ]}
                  isSelected={selectedDestination?.id === d.id}
                  onClick={() => setSelectedDestination(d)}
                />
              ))}
            </div>
          }
          rightPanel={
            selectedDestination ? (
              <DetailPanel
                title={selectedDestination.name}
                subtitle={`${selectedDestination.city || 'Kedah'} • ${selectedDestination.category || 'Attraction'}`}
                image={selectedDestination.image_url}
                actions={
                  <div className="flex gap-3">
                    <button
                      onClick={handleGetDirections}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg"
                    >
                      <Navigation className="w-5 h-5" />
                      Get Directions
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-4 py-3 bg-gray-100 rounded-lg"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                }
              >
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Posts', value: selectedDestination.posts || 0, icon: <MessageCircle className="w-6 h-6" />, bg: 'blue' },
                    { label: 'Engagement', value: selectedDestination.engagement || 0, icon: <TrendingUp className="w-6 h-6" />, bg: 'purple' },
                    { label: 'Rating', value: selectedDestination.rating?.toFixed(1) || 'N/A', icon: <Star className="w-6 h-6" />, bg: 'yellow' },
                  ].map((m, i) => (
                    <div key={i} className={`p-4 text-center rounded-lg bg-${m.bg}-50 border`}>
                      {m.icon}
                      <div className="text-2xl font-bold">{m.value}</div>
                      <div className="text-xs font-medium">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Place Details */}
                <div className="space-y-5 mt-6">
                  <h3 className="text-lg font-semibold">Place Details</h3>

                  <DetailSection title="About">
                    <p className="text-sm text-gray-600">
                      {selectedDestination.description || 'Description not yet published.'}
                    </p>
                  </DetailSection>

                  <DetailSection title="Visiting Information">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="flex gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" /> Pricing
                        </span>
                        <span className="font-medium">
                          {selectedDestination.is_free
                            ? 'Free Entry'
                            : selectedDestination.price
                            ? `${selectedDestination.currency || 'RM'} ${selectedDestination.price}`
                            : 'Not publicly listed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex gap-2 text-gray-600">
                          <Clock className="w-4 h-4" /> Opening hours
                        </span>
                        <span className="font-medium">
                          {selectedDestination.opening_hours || 'Not publicly listed'}
                        </span>
                      </div>
                    </div>
                  </DetailSection>

                  <DetailSection title="Contact & Location">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="flex gap-2 text-gray-600">
                          <Phone className="w-4 h-4" /> Contact details
                        </span>
                        <span className="font-medium">
                          {selectedDestination.contact_phone ||
                            selectedDestination.contact_email ||
                            'Not provided'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" /> Address
                        </span>
                        <span className="font-medium">
                          {selectedDestination.address || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </DetailSection>

                  <DetailSection title="External Resources">
                    {(selectedDestination.official_website ||
                      selectedDestination.wikipedia_url ||
                      selectedDestination.tripadvisor_url) ? (
                      <div className="flex gap-3 text-sm">
                        {selectedDestination.official_website && (
                          <a href={selectedDestination.official_website} target="_blank" className="text-blue-600">
                            Website
                          </a>
                        )}
                        {selectedDestination.wikipedia_url && (
                          <a href={selectedDestination.wikipedia_url} target="_blank" className="text-blue-600">
                            Wikipedia
                          </a>
                        )}
                        {selectedDestination.tripadvisor_url && (
                          <a href={selectedDestination.tripadvisor_url} target="_blank" className="text-blue-600">
                            TripAdvisor
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">Not available</span>
                    )}
                  </DetailSection>
                </div>
              </DetailPanel>
            ) : null
          }
        />
      </div>
    </div>
  );
}
