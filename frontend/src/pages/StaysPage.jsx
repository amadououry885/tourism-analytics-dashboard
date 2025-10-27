// src/pages/StaysPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StayFilters from "../components/StayFilters";
import StayCard from "../components/StayCard";
import StayMap from "../components/StayMap";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

export default function StaysPage() {
  // read ?district= from URL so Transport → Stays prefilters
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const initialDistrict = params.get("district") || "";

  const [filters, setFilters] = useState({
    district: initialDistrict,  // maps to ?district=
    type: "",                   // ?type=
    minPrice: "",               // ?min_price=
    maxPrice: "",               // ?max_price=
    minRating: "",              // ?min_rating=
    amenities: [],              // ?amenities=WiFi,Pool
    q: "",                      // ?q=
  });

  // backend data
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Keep filters in sync if URL changes externally (e.g., from Transport page)
  useEffect(() => {
    const d = new URLSearchParams(search).get("district") || "";
    setFilters((f) => (f.district === d ? f : { ...f, district: d }));
  }, [search]);

  // Build backend query from filters
  const buildQuery = (f) => {
    const p = new URLSearchParams();
    if (f.district) p.set("district", f.district);
    if (f.type) p.set("type", f.type);
    if (f.minPrice) p.set("min_price", f.minPrice);
    if (f.maxPrice) p.set("max_price", f.maxPrice);
    if (f.minRating) p.set("min_rating", f.minRating);
    if (f.amenities?.length) p.set("amenities", f.amenities.join(","));
    if (f.q) p.set("q", f.q);
    p.set("limit", "100"); // reasonable cap
    return p.toString();
  };

  // Keep URL query in sync (only district is user-facing for now)
  useEffect(() => {
    const currentDistrict = new URLSearchParams(search).get("district") || "";
    if ((filters.district || "") !== currentDistrict) {
      const next = new URLSearchParams(search);
      if (filters.district) next.set("district", filters.district);
      else next.delete("district");
      navigate({ search: `?${next.toString()}` }, { replace: true });
    }
  }, [filters.district, navigate, search]);

  // Fetch from backend when filters change (debounced)
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setErr(null);
        const qs = buildQuery(filters);
        const res = await fetch(`${API_BASE}/stays/?${qs}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // DRF pagination shape: { results: [...] } OR plain list
        const items = Array.isArray(json) ? json : (json.results || []);
        if (alive) setStays(items);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load stays");
      } finally {
        if (alive) setLoading(false);
      }
    }, 250); // small debounce for nicer UX

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [filters]);

  const subtitle = filters.district ? `— ${filters.district}` : "";

  return (
    <div className="App" style={{ padding: "1rem 1.25rem" }}>
      <h2 style={{ marginBottom: 8 }}>
        Stays in Kedah <span style={{ color: "#64748b", fontSize: 14 }}>{subtitle}</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 420px", gap: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Pass current data so the filter can build the districts list */}
          <StayFilters stays={stays} value={filters} onChange={setFilters} />

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
                  {loading ? "Loading…" : `${stays.length} results`}
                </span>
                <strong>Directory</strong>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              {err && (
                <p style={{ color: "#b91c1c" }}>Error: {err}</p>
              )}
              {!err && loading && (
                <p style={{ color: "#64748b" }}>Loading stays…</p>
              )}
              {!err && !loading && stays.length === 0 && (
                <p style={{ color: "#64748b" }}>
                  No stays match your filters. Try widening your search.
                </p>
              )}
              {!err && !loading && stays.length > 0 && stays.map((s) => (
                <StayCard key={s.id} stay={s} />
              ))}
            </div>
          </section>
        </div>

        <div>
          <StayMap stays={stays.slice(0, 50)} />
        </div>
      </div>
    </div>
  );
}
