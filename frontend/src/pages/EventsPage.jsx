// src/pages/EventsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

export default function EventsPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(search);

  // URL-driven filters
  const [city, setCity] = useState(qs.get("city") || "");
  const [q, setQ] = useState(qs.get("q") || "");
  const [tag, setTag] = useState(qs.get("tag") || "");
  const [upcoming, setUpcoming] = useState(qs.get("upcoming") === "1");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // keep URL in sync
  useEffect(() => {
    const p = new URLSearchParams();
    if (city) p.set("city", city);
    if (q) p.set("q", q);
    if (tag) p.set("tag", tag);
    if (upcoming) p.set("upcoming", "1");
    navigate({ search: p.toString() }, { replace: true });
  }, [city, q, tag, upcoming, navigate]);

  // fetch from backend
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const params = new URLSearchParams();
        if (city) params.set("city", city);
        if (q) params.set("q", q);
        if (tag) params.set("tag", tag);
        if (upcoming) params.set("upcoming", "1");
        params.set("limit", "200");

        const res = await fetch(`${API_BASE}/events/?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const results = Array.isArray(json) ? json : (json.results || []);
        if (!abort) setItems(results);
      } catch (e) {
        if (!abort) setErr(e.message || "Failed to load");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [city, q, tag, upcoming]);

  // city list from data
  const cities = useMemo(() => {
    const s = new Set(items.map(e => e.city).filter(Boolean));
    return Array.from(s).sort();
  }, [items]);

  return (
    <div className="App" style={{ padding: "1rem 1.25rem" }}>
      <h2 style={{ marginBottom: 8 }}>Events</h2>

      {/* Filters */}
      <div className="card" style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8 }}>
          <input
            className="transport-input"
            placeholder="Search title/desc/location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search"
          />
          <input
            className="transport-input"
            placeholder="Tag (e.g. music)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            aria-label="Tag"
          />
          <select
            className="transport-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="City"
          >
            <option value="">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={upcoming}
              onChange={(e) => setUpcoming(e.target.checked)}
            />
            Upcoming
          </label>
        </div>
      </div>

      {/* List */}
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 999,
                padding: "2px 8px",
                fontSize: 12,
                marginRight: 8,
              }}
            >
              {items.length} result{items.length !== 1 ? "s" : ""}
            </span>
            <strong>Directory</strong>
          </div>
        </div>

        {loading && <p style={{ color: "#64748b", marginTop: 10 }}>Loading…</p>}
        {err && <p style={{ color: "#b91c1c", marginTop: 10 }}>Error: {err}</p>}

        {!loading && !err && (
          <div style={{ marginTop: 8 }}>
            {items.length === 0 ? (
              <p style={{ color: "#64748b" }}>No events match your filters.</p>
            ) : (
              items.map((ev) => <EventCard key={ev.id} ev={ev} />)
            )}
          </div>
        )}
      </section>
    </div>
  );
}
