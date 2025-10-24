import React from "react";

// Very small SVG stub map. Later you can swap with Leaflet or Google Maps.
export default function TransportMap({ result }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#fff",
        padding: 8,
        height: 420,
      }}
    >
      <div style={{ padding: "4px 8px", color: "#64748b", fontSize: 14 }}>
        Mini Map (stub)
      </div>
      <svg viewBox="0 0 400 360" width="100%" height="100%" style={{ background: "#f1f5f9", borderRadius: 8 }}>
        {/* coast outline placeholder */}
        <path
          d="M60,30 C80,50 90,120 120,160 C160,210 200,230 260,260 C300,280 340,310 360,330"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        {/* markers & line if we have a polyline */}
        {result && result.polyline && result.polyline.length >= 2 ? (
          <Polyline poly={result.polyline} type={result.type} />
        ) : (
          <text x="20" y="340" fontSize="12" fill="#64748b">
            Select From & To to preview route.
          </text>
        )}
      </svg>
    </div>
  );
}

// very rough projection for Malaysia -> canvas (only for demo)
function project([lat, lon]) {
  // Kedah ~ lat 5–7, lon 99–101; KL ~ 3.1,101.7
  const x = (lon - 99) * 200; // scale longitudes
  const y = (7 - lat) * 220;  // invert lat for screen coords
  return [40 + x, 40 + y];
}

function Polyline({ poly, type }) {
  const color =
    type === "intra_kedah" ? "#16a34a" : type === "coming_to_kedah" ? "#2563eb" : "#dc2626";
  const pts = poly.map(project);
  const d = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const [sx, sy] = pts[0];
  const [ex, ey] = pts[pts.length - 1];

  return (
    <>
      <path d={d} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx={sx} cy={sy} r="5" fill="#111827" />
      <circle cx={ex} cy={ey} r="5" fill={color} />
    </>
  );
}
