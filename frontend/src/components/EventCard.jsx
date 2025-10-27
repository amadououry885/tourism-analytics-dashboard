// src/components/EventCard.jsx
import React from "react";

function fmt(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString();
}

export default function EventCard({ ev }) {
  return (
    <div style={{ borderBottom: "1px solid #f3f4f6", padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <strong style={{ fontSize: 15 }}>{ev.title}</strong>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {ev.city || "—"}
        </span>
      </div>

      {ev.location_name && (
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
          📍 {ev.location_name}
        </div>
      )}

      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
        🗓 {fmt(ev.start_date)}{ev.end_date ? ` → ${fmt(ev.end_date)}` : ""}
      </div>

      {Array.isArray(ev.tags) && ev.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          {ev.tags.slice(0, 6).map((t) => (
            <span
              key={t}
              style={{
                padding: "2px 8px",
                border: "1px solid #e5e7eb",
                borderRadius: 999,
                fontSize: 12,
                background: "#fff",
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {ev.description && (
        <p style={{ marginTop: 8, fontSize: 13, color: "#374151" }}>
          {ev.description}
        </p>
      )}
    </div>
  );
}
