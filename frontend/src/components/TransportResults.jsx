import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function minutesToText(m) {
  if (m == null) return "-";
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h && min) return `${h}h ${min}m`;
  if (h) return `${h}h`;
  return `${min}m`;
}

const TYPE_META = {
  intra_kedah: { label: "Intra-Kedah", color: "#86efac" },
  coming_to_kedah: { label: "Coming to Kedah", color: "#93c5fd" },
  leaving_kedah: { label: "Leaving Kedah", color: "#fca5a5" },
  unknown: { label: "Route", color: "#e2e8f0" },
};

export default function TransportResults({ result }) {
  const [sortBy, setSortBy] = useState("recommended");

  const sorted = useMemo(() => {
    if (!result || !result.options) return [];
    const arr = [...result.options];
    if (sortBy === "fastest") arr.sort((a, b) => (a.durationMin ?? 1e9) - (b.durationMin ?? 1e9));
    else if (sortBy === "cheapest") arr.sort((a, b) => (a.priceMin ?? 1e9) - (b.priceMin ?? 1e9));
    return arr;
  }, [result, sortBy]);

  if (!result) {
    return <p style={{ color: "#64748b", marginTop: 12 }}>Enter <b>From</b> and <b>To</b> to see transport options.</p>;
  }

  const meta = TYPE_META[result.type] || TYPE_META.unknown;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <span
            style={{
              background: meta.color,
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 12,
              color: "#0f172a",
              marginRight: 8,
            }}
          >
            {meta.label}
          </span>
          <strong>{result.from || "—"} → {result.to || "—"}</strong>
          <span style={{ color: "#64748b", marginLeft: 8 }}>
            {sorted.length} option{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSortBy("recommended")} className="btn-mini">Recommended</button>
          <button onClick={() => setSortBy("fastest")} className="btn-mini">Fastest</button>
          <button onClick={() => setSortBy("cheapest")} className="btn-mini">Cheapest</button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ padding: 16 }}>
          <p style={{ color: "#64748b" }}>
            No direct data for this route yet. Try another pair, or pick a different mode.
          </p>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb" }}>Mode</th>
              <th style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb" }}>Route</th>
              <th style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb" }}>Duration</th>
              <th style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb" }}>Price</th>
              <th style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb" }}>Provider</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((opt, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 12px" }}>
                  {opt.mode === "Train" && "🚆 "}
                  {opt.mode === "Bus" && "🚌 "}
                  {opt.mode === "Flight" && "✈️ "}
                  {opt.mode === "Ferry" && "⛴️ "}
                  {opt.mode === "Car" && "🚗 "}
                  {opt.mode}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {result.from} → {result.to}
                </td>
                <td style={{ padding: "10px 12px" }}>{minutesToText(opt.durationMin)}</td>
                <td style={{ padding: "10px 12px" }}>
                  {opt.priceMin != null ? `RM ${opt.priceMin}` : "—"}
                  {opt.priceMax != null ? `–${opt.priceMax}` : ""}
                </td>
                <td style={{ padding: "10px 12px" }}>{opt.provider || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ "Go to Stays" button */}
      {result.to && (
        <div style={{ padding: "12px", textAlign: "right" }}>
          <Link
            to={`/stays?district=${encodeURIComponent(result.to)}`}
            className="btn-mini"
            style={{
              background: "#111827",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 8,
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            🛏️ View stays in {result.to}
          </Link>
        </div>
      )}
    </div>
  );
}
