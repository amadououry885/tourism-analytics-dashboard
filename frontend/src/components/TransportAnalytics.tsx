import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Car, Train, Plane, Ship, Bike, Bus, ArrowRight, Clock, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import axios from 'axios';

// Types and Interfaces
type RouteOption = {
  id: number;
  provider: string;
  transport_mode: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  currency: string;
  duration?: string;
  source?: string;
  line_name?: string;
  num_stops?: number;
  from_stop?: string;
  to_stop?: string;
};

type TransportAnalyticsProps = {
  selectedCity?: string;
};

// Kedah places
const kedahPlaces = [
  'Langkawi', 'Alor Setar', 'Sungai Petani', 'Kulim', 'Jitra', 
  'Kuala Kedah', 'Pendang', 'Baling', 'Padang Serai', 'Kuah'
];

// Outside Kedah places
const outsidePlaces = [
  'Kuala Lumpur', 'Penang', 'Ipoh', 'Johor Bahru', 'Singapore',
  'Butterworth', 'Georgetown', 'Hat Yai', 'Bangkok'
];

const allPlaces = [...kedahPlaces, ...outsidePlaces].sort();

const routeTypeLabels = {
  'intra_kedah': { label: 'Intra-Kedah', color: 'bg-blue-500', description: 'Travel within Kedah' },
  'coming_to_kedah': { label: 'Coming to Kedah', color: 'bg-green-500', description: 'From outside to Kedah' },
  'leaving_kedah': { label: 'Leaving Kedah', color: 'bg-orange-500', description: 'From Kedah to outside' },
};

const getTransportIcon = (mode: string): LucideIcon => {
  const lowerMode = mode.toLowerCase();
  if (lowerMode.includes('flight') || lowerMode.includes('plane')) return Plane;
  if (lowerMode.includes('train')) return Train;
  if (lowerMode.includes('bus')) return Bus;
  if (lowerMode.includes('ferry') || lowerMode.includes('boat')) return Ship;
  if (lowerMode.includes('bike') || lowerMode.includes('motorcycle')) return Bike;
  return Car; // default for taxi, car, grab
};

const getTransportColor = (mode: string): string => {
  const lowerMode = mode.toLowerCase();
  if (lowerMode.includes('flight') || lowerMode.includes('plane')) return '#3b82f6';
  if (lowerMode.includes('train')) return '#ec4899';
  if (lowerMode.includes('bus')) return '#f59e0b';
  if (lowerMode.includes('ferry') || lowerMode.includes('boat')) return '#8b5cf6';
  if (lowerMode.includes('bike') || lowerMode.includes('motorcycle')) return '#06b6d4';
  return '#10b981'; // default for taxi, car, grab
};

export const TransportAnalytics: React.FC<TransportAnalyticsProps> = ({ selectedCity }) => {
  // Route search states
  const [fromPlace, setFromPlace] = useState('');
  const [toPlace, setToPlace] = useState('');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchResults, setSearchResults] = useState<RouteOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [detectedRouteType, setDetectedRouteType] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  // Detect route type based on selected places
  React.useEffect(() => {
    if (fromPlace && toPlace) {
      const fromInKedah = kedahPlaces.includes(fromPlace);
      const toInKedah = kedahPlaces.includes(toPlace);

      if (fromInKedah && toInKedah) {
        setDetectedRouteType('intra_kedah');
      } else if (!fromInKedah && toInKedah) {
        setDetectedRouteType('coming_to_kedah');
      } else if (fromInKedah && !toInKedah) {
        setDetectedRouteType('leaving_kedah');
      } else {
        setDetectedRouteType('');
      }
    }
  }, [fromPlace, toPlace]);

  const handleSearch = async () => {
    if (!fromPlace || !toPlace) {
      alert('Please select both origin and destination');
      return;
    }

    if (fromPlace === toPlace) {
      alert('Origin and destination cannot be the same');
      return;
    }

    try {
      setSearching(true);
      setShowResults(true);
      
      // Search our database
      const response = await axios.get('/transport/search/', {
        params: {
          from: fromPlace,
          to: toPlace,
          date: travelDate,
        }
      });

      setSearchResults(response.data || []);
    } catch (err) {
      console.error('Error searching routes:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Route Search Section */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Route Planner & Search
          </CardTitle>
          <CardDescription>Find the best transport options for your journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <select
                value={fromPlace}
                onChange={(e) => setFromPlace(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select origin</option>
                {allPlaces.map(place => (
                  <option key={place} value={place}>
                    {place} {kedahPlaces.includes(place) ? '(Kedah)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Arrow */}
            <div className="flex items-end justify-center pb-2">
              <ArrowRight className="w-6 h-6 text-primary" />
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <select
                value={toPlace}
                onChange={(e) => setToPlace(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select destination</option>
                {allPlaces.map(place => (
                  <option key={place} value={place}>
                    {place} {kedahPlaces.includes(place) ? '(Kedah)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Travel Date</label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={searching || !fromPlace || !toPlace}
                className="w-full"
              >
                {searching ? 'Searching...' : 'Search Routes'}
              </Button>
            </div>
          </div>

          {/* Route Type Badge */}
          {detectedRouteType && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Route Type:</span>
              <Badge className={`${routeTypeLabels[detectedRouteType as keyof typeof routeTypeLabels].color} text-white`}>
                {routeTypeLabels[detectedRouteType as keyof typeof routeTypeLabels].label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {routeTypeLabels[detectedRouteType as keyof typeof routeTypeLabels].description}
              </span>
            </div>
          )}

          {/* Search Results */}
          {showResults && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold">
                {searchResults.length > 0 
                  ? `Available Options (${fromPlace} → ${toPlace})`
                  : 'No routes found in database'
                }
              </h3>
              
              {searchResults.length === 0 && !searching && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    No scheduled transport in our database for this route. 
                  </p>
                  
                  {/* Google Maps Link */}
                  <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">View on Google Maps</h4>
                        <p className="text-sm text-gray-600">Get real-time transit directions</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromPlace)}&destination=${encodeURIComponent(toPlace)}&travelmode=transit`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Open Google Maps Transit Directions
                    </Button>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      💡 Shows flights, buses, trains, and ferries with real-time schedules
                    </p>
                  </div>
                </div>
              )}

              {searchResults.map((option, index) => {
                const Icon = getTransportIcon(option.transport_mode);
                const color = getTransportColor(option.transport_mode);
                
                return (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-3 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${color}30` }}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium capitalize">{option.transport_mode}</h4>
                            <p className="text-sm text-muted-foreground">{option.provider}</p>
                            {option.source === 'google_maps' && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Real-time via Google Maps
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            {option.price ? (
                              <>
                                <p className="text-lg font-semibold">
                                  {option.currency || 'MYR'} {option.price}
                                </p>
                                <p className="text-xs text-muted-foreground">per person</p>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">Price varies</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{option.departure_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span>{option.arrival_time || 'N/A'}</span>
                          </div>
                          {option.duration && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{option.duration}</Badge>
                            </div>
                          )}
                        </div>
                        
                        {/* Google Maps specific details */}
                        {option.source === 'google_maps' && (
                          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground space-y-1">
                            {option.line_name && (
                              <p>Line: <span className="font-medium">{option.line_name}</span></p>
                            )}
                            {option.num_stops > 0 && (
                              <p>{option.num_stops} stops</p>
                            )}
                            {option.from_stop && option.to_stop && (
                              <p className="truncate">
                                {option.from_stop} → {option.to_stop}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransportAnalytics;
