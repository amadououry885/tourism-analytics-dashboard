/**
 * Booking platform integration utilities
 * Generates deep links to Booking.com and Agoda for accommodation bookings
 */

interface SearchParams {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  propertyName?: string;
}

/**
 * Generate a Booking.com search URL with optional dates and guests
 * @param params Search parameters including location, dates, and guest count
 * @returns Deep link URL to Booking.com search results
 */
export function generateBookingComUrl(params: SearchParams): string {
  const baseUrl = 'https://www.booking.com/searchresults.html';
  const urlParams = new URLSearchParams();

  if (params.location) {
    urlParams.append('ss', params.location);
  }

  if (params.checkIn) {
    urlParams.append('checkin', formatDate(params.checkIn));
  }

  if (params.checkOut) {
    urlParams.append('checkout', formatDate(params.checkOut));
  }

  if (params.guests) {
    urlParams.append('group_adults', params.guests.toString());
  }

  // Default parameters for better UX
  urlParams.append('selected_currency', 'MYR');
  urlParams.append('lang', 'en-gb');

  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Generate an Agoda search URL with optional dates and guests
 * @param params Search parameters including location, dates, and guest count
 * @returns Deep link URL to Agoda search results
 */
export function generateAgodaUrl(params: SearchParams): string {
  const baseUrl = 'https://www.agoda.com/search';
  const urlParams = new URLSearchParams();

  if (params.location) {
    urlParams.append('city', params.location);
  }

  if (params.checkIn) {
    urlParams.append('checkIn', formatDate(params.checkIn));
  }

  if (params.checkOut) {
    urlParams.append('checkOut', formatDate(params.checkOut));
  }

  if (params.guests) {
    urlParams.append('adults', params.guests.toString());
  }

  // Default parameters
  urlParams.append('currency', 'MYR');
  urlParams.append('locale', 'en-us');

  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Format date to YYYY-MM-DD for booking platforms
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Open booking URL in new tab
 */
export function openBookingUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
