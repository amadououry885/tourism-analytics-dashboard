// frontend/src/components/HiddenGemCard.jsx
import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

// Format growth as “∞” for Infinity, otherwise “x.xx×”
function formatGrowth(g) {
  if (!isFinite(g)) return "∞";
  // clamp to 2 decimals, but show whole numbers cleanly
  const v = Math.round(g * 100) / 100;
  return `${v}×`;
}

export default function HiddenGemCard({ dateFrom, dateTo, limit = 3 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    params.set("limit", String(limit));

    setLoading(true);
    setError("");
    fetch(`${API_BASE}/trends/hidden-gem?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setItems(d.items || []))
      .catch((err) => {
        console.error("HiddenGem error:", err);
        setError("Failed to load hidden gems.");
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, limit]);

  return (
    <div className="card" style={{ minHeight: 400 }}>
      <div className="card-title">Hidden Gem of the Week</div>

      {loading && (
        <div style={{ textAlign: "center", color: "#6b7280", padding: "12px" }}>
          Finding hidden gems…
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", color: "crimson", padding: "12px" }}>
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div style={{ textAlign: "center", color: "#6b7280", padding: "12px" }}>
          No hidden gems detected in this period.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((it, i) => (
            <div
              key={`${it.poi_id}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: "#f3f4f6",
                    color: "#374151",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Baseline: {it.baseline} → Current: {it.current}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1.1,
                    color: "#065f46",
                  }}
                  title={`Growth: ${it.growth}`}
                >
                  {formatGrowth(it.growth)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    marginTop: 2,
                  }}
                >
                  week-over-week
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
