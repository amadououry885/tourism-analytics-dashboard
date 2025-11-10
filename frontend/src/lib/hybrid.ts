interface HybridOptions extends RequestInit {
  demoData?: any;
  retries?: number;
}

/**
 * Builds a URL with query parameters
 * @param path - The base path
 * @param params - Object containing query parameters
 * @returns The complete URL with query parameters
 */
export function buildUrlWithParams(path: string, params: Record<string, string>): string {
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

/**
 * Fetches data from an API with fallback to demo data
 * @param url - The URL to fetch from
 * @param options - Fetch options including demo data fallback
 * @returns The API response data or demo data
 */
export async function fetchHybrid(url: string, options: HybridOptions = {}): Promise<any> {
  const { demoData, retries = 3, ...fetchOptions } = options;
  
  let lastError: Error | null = null;
  let attempts = 0;

  while (attempts < retries) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      lastError = err as Error;
      attempts++;

      if (attempts === retries && demoData) {
        console.warn(`API request failed after ${retries} attempts, using demo data:`, lastError);
        return demoData;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
    }
  }

  throw lastError;
}