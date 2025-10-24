// src/components/StayMap.jsx
import React from "react";

/**
 * Simple, dependency-free SVG map stub for Kedah stays.
 * - Colored markers by type (Hotel/Apartment/Guest House/Homestay)
 * - Lightweight projection tuned for Kedah + Langkawi
 * - Legend + count
 * - Graceful handling of missing coords or empty lists
 */
export default function StayMap({ stays = [] }) {
  // Filter to entries with coords
  const withCoords = stays.filter(
    (s) => Array.isArray(s.coords) && s.coords.length === 2 && isFinite(s.coords[0]) && isFinite(s.coords[1])
  );

  return (
    <div className="card" style={{ height: 420, padding: 8, display: "grid", gridTemplateRows: "auto 1fr" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
        <div style={{ color: "#64748b", fontSize: 14 }}>
          Stays Map (stub) • {withCoords.length}/{stays.length}
        </div>
        <Legend />
      </div>

      <svg
        viewBox="0 0 400 320"
        width="100%"
        height="100%"
        style={{ background: "#f1f5f9", borderRadius: 8, border: "1px solid #e5e7eb" }}
      >
        {/* Light land-ish backdrop stroke (just a visual flourish) */}
        <path
          d="M30,40 C80,20 120,60 180,90 C240,120 290,140 340,180 C360,200 370,230 360,260
             C330,280 280,290 230,285 C180,280 150,270 110,250 C80,230 50,210 40,180 C30,150 20,80 30,40"
          fill="#e5eef7"
          stroke="#cbd5e1"
          strokeWidth="1"
          opacity="0.45"
        />

        {withCoords.length === 0 ? (
          <EmptyHint />
        ) : (
          withCoords.slice(0, 80).map((s) => {
            const [x, y] = projectKedah(s.coords);
            const { color, shape } = typeStyle(s.type);
            return (
              <g key={s.id} transform={`translate(${x},${y})`} style={{ cursor: "default" }}>
                {/* halo */}
                <circle r="6.5" fill="white" opacity="0.7" />
                {/* marker */}
                {shape}
                {/* outline */}
                <circle r="6.5" fill="none" stroke="#334155" strokeWidth="0.4" opacity="0.35" />
                <title>
                  {s.name} — {s.district}
                  {s.landmark ? ` • ${s.distanceKm} km to ${s.landmark}` : ""}
                  {`\nRM ${s.priceNight} • ⭐ ${s.rating}`}
                </title>
              </g>
            );

            // Helper to create shape per type
            function typeStyle(type = "") {
              const t = type.toLowerCase();
              // colors
              const palette = {
                hotel: "#2563eb", // blue
                apartment: "#16a34a", // green
                "guest house": "#f59e0b", // amber
                homestay: "#ef4444", // red
                default: "#6b7280", // gray
              };
              const color =
                t.includes("hotel")
                  ? palette.hotel
                  : t.includes("apartment")
                  ? palette.apartment
                  : t.includes("guest")
                  ? palette["guest house"]
                  : t.includes("home")
                  ? palette.homestay
                  : palette.default;

              // shapes
              const shape =
                t.includes("hotel") ? (
                  // square
                  <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill={color} />
                ) : t.includes("apartment") ? (
                  // triangle
                  <path d="M0,-5 L5,4 L-5,4 Z" fill={color} />
                ) : t.includes("guest") ? (
                  // circle
                  <circle r="4.5" fill={color} />
                ) : t.includes("home") ? (
                  // diamond
                  <path d="M0,-5 L5,0 L0,5 L-5,0 Z" fill={color} />
                ) : (
                  // default small circle
                  <circle r="4" fill={color} />
                );

              return { color, shape };
            }
          })
        )}
      </svg>
    </div>
  );
}

/** Simple legend */
function Legend() {
  const items = [
    { label: "Hotel", color: "#2563eb", shape: "■" },
    { label: "Apartment", color: "#16a34a", shape: "▲" },
    { label: "Guest House", color: "#f59e0b", shape: "●" },
    { label: "Homestay", color: "#ef4444", shape: "◆" },
  ];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((it) => (
        <span
          key={it.label}
          style={{
            fontSize: 12,
            color: "#334155",
            border: "1px solid #e5e7eb",
            background: "#fff",
            padding: "2px 6px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: it.color, fontWeight: 700 }}>{it.shape}</span>
          {it.label}
        </span>
      ))}
    </div>
  );
}

/** Message when no stays (or no coords) */
function EmptyHint() {
  return (
    <text x="200" y="160" textAnchor="middle" fill="#64748b" fontSize="13">
      No stays with coordinates to plot yet.
    </text>
  );
}

/**
 * Lightweight projection centered on Kedah + Langkawi.
 * Bounds roughly:
 *   lat: 5.2 — 6.7
 *   lon: 99.4 — 100.8
 * We add padding so markers don't touch edges.
 */
function projectKedah([lat, lon]) {
  // SVG drawing box
  const W = 400;
  const H = 320;

  // geographic bounds (tuned for Kedah vicinity)
  const LAT_MIN = 5.2;
  const LAT_MAX = 6.7;
  const LON_MIN = 99.4;
  const LON_MAX = 100.8;

  // padding inside SVG
  const PAD_X = 24;
  const PAD_Y = 20;

  // clamp coords to bounds to avoid NaNs
  const clampedLat = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
  const clampedLon = Math.max(LON_MIN, Math.min(LON_MAX, lon));

  // normalize to 0..1
  const nx = (clampedLon - LON_MIN) / (LON_MAX - LON_MIN);
  const ny = (LAT_MAX - clampedLat) / (LAT_MAX - LAT_MIN); // invert Y (north up)

  // scale to SVG with padding
  const x = PAD_X + nx * (W - PAD_X * 2);
  const y = PAD_Y + ny * (H - PAD_Y * 2);

  return [x, y];
}
