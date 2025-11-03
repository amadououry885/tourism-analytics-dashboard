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


// ---------------------- Analytics API ----------------------
function q(obj) {
  const p = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") p.set(k, v);
  });
  return p.toString();
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let msg;
    try { msg = await res.text(); } catch { msg = `HTTP ${res.status}`; }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}

export function lastNDaysRange(n = 30) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (n - 1));
  const iso = (d) => d.toISOString().slice(0, 10);
  return { from: iso(start), to: iso(end) };
}

export async function fetchSummary({ from, to, place }) {
  const qs = q({ from, to, place });
  return getJSON(`/api/analytics/summary?${qs}`);
}

export async function fetchTimeseries({ from, to, place }) {
  const qs = q({ from, to, place });
  return getJSON(`/api/analytics/timeseries?${qs}`);
}

export async function fetchHeatmap({ from, to, place }) {
  const qs = q({ from, to, place });
  return getJSON(`/api/analytics/heatmap?${qs}`);
}
