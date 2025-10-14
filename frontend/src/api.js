// src/api.js
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

/**
 * Fetch JSON with optional AbortSignal.
 * Accepts either a full URL ("http://...") or a relative API path ("/metrics/visitors?...").
 */
export async function getJSON(pathOrUrl, { signal } = {}) {
  const isFull = /^https?:\/\//i.test(pathOrUrl);
  const url = isFull
    ? pathOrUrl
    : `${API_BASE}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;

  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// Convenience helpers (now accept an optional { signal } as last arg)
export const api = {
  pois: (o) =>
    getJSON(`/pois/`, o),

  visitors: (from, to, poiId, o) =>
    getJSON(
      `/metrics/visitors?date_from=${from}&date_to=${to}${
        poiId ? `&poi_id=${poiId}` : ""
      }`,
      o
    ),

  topAttractions: (from, to, limit = 1, o) =>
    getJSON(
      `/metrics/top-attractions?date_from=${from}&date_to=${to}&limit=${limit}`,
      o
    ),

  timeseries: (from, to, poiId, o) =>
    getJSON(
      `/timeseries/mentions?date_from=${from}&date_to=${to}${
        poiId ? `&poi_id=${poiId}` : ""
      }`,
      o
    ),

  rankingsTop: (from, to, limit = 5, o) =>
    getJSON(
      `/rankings/top-pois?date_from=${from}&date_to=${to}&limit=${limit}`,
      o
    ),

  rankingsLeast: (from, to, limit = 5, o) =>
    getJSON(
      `/rankings/least-pois?date_from=${from}&date_to=${to}&limit=${limit}`,
      o
    ),

  searchPOIs: (q, limit = 10, o) =>
    getJSON(`/search/pois?q=${encodeURIComponent(q)}&limit=${limit}`, o),
};

export default api;
