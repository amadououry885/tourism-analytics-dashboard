/**
 * Stay/Accommodation type definitions
 * Used across the application for type safety
 */

export interface Stay {
  id: number | string;  // number for internal, string for external (e.g., 'ext_booking_1')
  name: string;
  type: 'Hotel' | 'Apartment' | 'Guest House' | 'Homestay';
  district: string;
  rating?: number | null;
  priceNight: number | string;
  amenities: string[];
  lat?: number | null;
  lon?: number | null;
  images?: string[];
  landmark?: string;
  distanceKm?: number | null;
  is_active: boolean;
  
  // Hybrid search fields
  is_internal: boolean;  // true = our platform, false = affiliate
  
  // Contact info for internal stays (direct booking)
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  
  // External booking links
  booking_com_url?: string | null;
  agoda_url?: string | null;
  booking_provider?: 'booking.com' | 'agoda' | 'both' | 'direct';
  
  // Ownership
  owner?: number | null;
  owner_username?: string | null;
  
  // Social media metrics (from AI analytics)
  social_mentions?: number;
  social_engagement?: number;
  estimated_interest?: number;
  trending_percentage?: number;
  is_trending?: boolean;
  social_rating?: number | null;
}

export interface HybridSearchResponse {
  count: number;
  internal_count: number;
  external_count: number;
  results: Stay[];
}
