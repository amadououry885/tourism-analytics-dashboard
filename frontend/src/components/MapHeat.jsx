// src/components/MapHeat.jsx
import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

// Kedah & Langkawi approximate bounding box
const minLat = 5.5, maxLat = 6.7;
const minLon = 99.4, maxLon = 100.9;

// Project latitude/longitude into SVG coords
function project(lat, lon, width, height) {
  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * height;
  return { x, y };
}

export default function MapHeat({ dateFrom, dateTo, category, sentiment }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (category) params.set("category", category);
    if (sentiment) params.set("sentiment", sentiment);

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/analytics/heatmap?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        // /analytics/heatmap returns an array; /map/heat returned {items:[]}
        const arr = Array.isArray(d) ? d : (d.items || []);
        const normalized = arr
          .map((it) => ({
            name: it.name ?? "",
            lat: Number(it.lat ?? it.latitude),
            lon: Number(it.lon ?? it.longitude),
            count: Number(it.mentions ?? it.count ?? 0),
          }))
          .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
        setItems(normalized);
      })
      .catch((err) => {
        console.error("MapHeat error:", err);
        setError("Failed to load map data.");
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, category, sentiment]);

  // Use numeric drawing space, then scale via viewBox
  const width = 1000;   // drawing width in SVG units
  const height = 220;   // drawing height in SVG units

  const maxCount = useMemo(
    () => (items.length ? Math.max(...items.map((it) => it.count)) : 1),
    [items]
  );

  return (
    <div className="card map-panel">
      <div className="card-title">Heat Map of Mentions</div>

      {loading && (
        <div style={{ textAlign: "center", color: "#6b7280", padding: 12 }}>
          Loading map…
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", color: "crimson", padding: 12 }}>
          {error}
        </div>
      )}

      {!loading && !error && !items.length && (
        <div style={{ textAlign: "center", color: "#6b7280", padding: 12 }}>
          No data for selected range.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{
              width: "100%",
              height: height,
              background: "#f6f8fa",
              borderRadius: 12,
            }}
          >
            {items.map((it, idx) => {
              const { x, y } = project(it.lat, it.lon, width, height);
              const r = 6 + 22 * (it.count / maxCount);
              return (
                <g key={`${it.name}-${idx}`}>
                  <circle cx={x} cy={y} r={r} fill="#ef4444" opacity="0.25" />
                  <circle cx={x} cy={y} r={Math.max(3, r * 0.35)} fill="#ef4444" />
                  <title>{`${it.name} — ${it.count} mentions`}</title>
                </g>
              );
            })}
          </svg>
          <div className="legend" style={{ marginTop: 6, textAlign: "center" }}>
            <small>
              Circle size ∝ mentions · Filters: {category || "All categories"} · {sentiment || "All sentiments"}
            </small>
          </div>
        </>
      )}
    </div>
  );
}
