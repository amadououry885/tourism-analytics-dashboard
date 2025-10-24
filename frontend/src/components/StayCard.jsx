import React from "react";

export default function StayCard({ stay }) {
  return (
    <div
      style={{
        borderBottom: "1px solid #f3f4f6",
        padding: "10px 0",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 8,
        alignItems: "center",
      }}
    >
      {/* Left info section */}
      <div>
        <strong style={{ fontSize: 15 }}>{stay.name}</strong>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
          {stay.type} • {stay.district}
        </div>

        {stay.landmark && (
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {stay.distanceKm} km to {stay.landmark}
          </div>
        )}

        {stay.amenities?.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 6,
              flexWrap: "wrap",
            }}
          >
            {stay.amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                style={{
                  padding: "2px 8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 999,
                  fontSize: 12,
                  background: "#fff",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right price & rating */}
      <div style={{ textAlign: "right", minWidth: 120 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          RM {stay.priceNight}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>/ night</div>
        <div
          style={{
            marginTop: 6,
            background: "#eef2ff",
            border: "1px solid #c7d2fe",
            borderRadius: 8,
            padding: "2px 8px",
            display: "inline-block",
            fontSize: 12,
          }}
        >
          ⭐ {stay.rating.toFixed(1)}
        </div>
      </div>
    </div>
  );
}
