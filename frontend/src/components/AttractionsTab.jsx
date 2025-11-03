import React, { useEffect, useState } from "react";
const API_BASE = process.env.REACT_APP_API_BASE || "/api";

export default function AttractionsTab({ dateFrom, dateTo }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const p = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    fetch(`${API_BASE}/tabs/attractions?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (!active) return setDetail(null);
    const p = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    fetch(`${API_BASE}/tabs/attractions/${active.id}?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .catch(() => setDetail(null));
  }, [active, dateFrom, dateTo]);

  return (
    <div className="card" style={{ textAlign: "left" }}>
      <div className="card-title">Attractions</div>
      {!items.length ? (
        <div style={{ color: "#6b7280", fontSize: 12 }}>No data</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <div>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {items.map((it) => (
                <li key={it.id} style={{ margin: "6px 0", cursor: "pointer" }} onClick={() => setActive(it)}>
                  <strong>{it.name}</strong>{" "}
                  <span style={{ color: "#6b7280" }}>— {it.count}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            {!detail ? (
              <div style={{ color: "#6b7280", fontSize: 12 }}>Select an attraction to view details.</div>
            ) : (
              <div>
                <h4 style={{ margin: 0 }}>{detail.name}</h4>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{detail.category}</div>
                <div>Total mentions: <strong>{detail.total}</strong></div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600 }}>Sentiments</div>
                  <div style={{ fontSize: 12, color: "#374151" }}>
                    😊 Positive: {detail.sentiments.positive} · 😐 Neutral: {detail.sentiments.neutral} · 🙁 Negative: {detail.sentiments.negative}
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600 }}>Recent posts</div>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {(detail.samples || []).map((s) => (
                      <li key={s.id} style={{ margin: "4px 0" }}>
                        <span style={{ color: "#6b7280", fontSize: 12 }}>{s.date} — </span>
                        {s.content}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
