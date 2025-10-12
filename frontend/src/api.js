// src/api.js
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export const api = {
  pois: () => getJSON(`${API_BASE}/pois/`),
  visitors: (from, to, poiId) =>
    getJSON(`${API_BASE}/metrics/visitors?date_from=${from}&date_to=${to}${poiId ? `&poi_id=${poiId}` : ""}`),
  topAttractions: (from, to, limit = 1) =>
    getJSON(`${API_BASE}/metrics/top-attractions?date_from=${from}&date_to=${to}&limit=${limit}`),
  timeseries: (from, to, poiId) =>
    getJSON(`${API_BASE}/timeseries/mentions?date_from=${from}&date_to=${to}${poiId ? `&poi_id=${poiId}` : ""}`),
  rankingsTop: (from, to, limit = 5) =>
    getJSON(`${API_BASE}/rankings/top-pois?date_from=${from}&date_to=${to}&limit=${limit}`),
  rankingsLeast: (from, to, limit = 5) =>
    getJSON(`${API_BASE}/rankings/least-pois?date_from=${from}&date_to=${to}&limit=${limit}`),
  searchPOIs: (q, limit = 10) =>
    getJSON(`${API_BASE}/search/pois?q=${encodeURIComponent(q)}&limit=${limit}`),
};
