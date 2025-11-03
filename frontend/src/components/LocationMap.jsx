// src/components/LocationMap.jsx
import React, { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// helper to call your heat endpoint (or you can pass coords directly later)
async function fetchTopLocation({ dateFrom, dateTo, poiName, fallbackName }) {
  const params = new URLSearchParams();
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  const res = await fetch(`/api/analytics/heatmap?${params.toString()}`);
  if (!res.ok) return null;
  const json = await res.json();
  const items = Array.isArray(json) ? json : (json.items || []);
  // If POI filter is set, try to match it by name; otherwise use most-mentioned
  let chosen =
    (poiName && items.find((i) => i.name?.toLowerCase() === poiName.toLowerCase())) ||
    (fallbackName && items.find((i) => i.name?.toLowerCase() === fallbackName.toLowerCase())) ||
    items[0];

  if (!chosen || !chosen.lat || !chosen.lon) return null;
  return {
    lat: Number(chosen.lat),
    lon: Number(chosen.lon),
    name: chosen.name || "Location",
    count: chosen.count || 0,
  };
}

export default function LocationMap({ dateFrom, dateTo, poiName, fallbackName }) {
  const [point, setPoint] = useState(null);
  const [error, setError] = useState(null);

  // trigger refetch when any of these change
  useEffect(() => {
    let alive = true;
    setError(null);

    fetchTopLocation({ dateFrom, dateTo, poiName, fallbackName })
      .then((p) => alive && setPoint(p))
      .catch((e) => alive && setError(e?.message || "Failed to load map"));

    return () => {
      alive = false;
    };
  }, [dateFrom, dateTo, poiName, fallbackName]);

  // Fixed right-side panel to occupy the empty grey area
  const WRAPPER_STYLE = useMemo(
    () => ({
      position: "fixed",
      top: 12,         // tighter to the top so it fills the visible gutter
      right: 8,
      bottom: 16,
      // Fill the grey gutter: viewport width minus your content max width (var(--maxw))
      // minus a tiny margin so it doesn't clip.
      width: "calc(100vw - var(--maxw) - 16px)",
      minWidth: 320,
      zIndex: 10,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      boxShadow: "0 1px 2px rgba(0,0,0,.04)",
      overflow: "hidden",
    }),
    []
  );

  // hide on small screens
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 1200;
  if (isNarrow) return null;

  return (
    <aside className="floating-map" style={WRAPPER_STYLE}>
      <div
        style={{
          padding: 10,
          borderBottom: "1px solid #e5e7eb",
          fontSize: 12,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: ".04em",
        }}
      >
        Map
      </div>

      <div style={{ height: "100%" }}>
        {!point ? (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              color: "#6b7280",
              fontSize: 13,
              padding: 12,
              textAlign: "center",
            }}
          >
            {error ? "Map unavailable" : "No location for this selection."}
          </div>
        ) : (
          <MapContainer
            center={[point.lat, point.lon]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[point.lat, point.lon]}>
              <Popup>
                <div style={{ fontWeight: 600 }}>{point.name}</div>
                Mentions: {point.count}
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </aside>
  );
}

