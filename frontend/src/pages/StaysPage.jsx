import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import staysData from "../data/stays.kedah.json";
import StayFilters from "../components/StayFilters";
import StayCard from "../components/StayCard";
import StayMap from "../components/StayMap";

export default function StaysPage() {
  const all = staysData.stays;

  // read ?district= from URL
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const initialDistrict = params.get("district") || "";

  const [filters, setFilters] = useState({
    district: initialDistrict,
    type: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    amenities: [],
    q: "",
  });

  // If the URL query changes (e.g., navigating from Transport Hub with a new district),
  // update the filter to match.
  useEffect(() => {
    const d = new URLSearchParams(search).get("district") || "";
    setFilters((f) => (f.district === d ? f : { ...f, district: d }));
  }, [search]);

  const filtered = useMemo(() => {
    const q = (filters.q || "").toLowerCase();
    return all.filter((s) => {
      if (filters.district && s.district !== filters.district) return false;
      if (filters.type && s.type !== filters.type) return false;
      if (filters.minPrice && s.priceNight < Number(filters.minPrice)) return false;
      if (filters.maxPrice && s.priceNight > Number(filters.maxPrice)) return false;
      if (filters.minRating && s.rating < Number(filters.minRating)) return false;
      if (filters.amenities?.length && !filters.amenities.every((a) => s.amenities.includes(a))) return false;
      if (q && !(s.name.toLowerCase().includes(q) || (s.landmark || "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [all, filters]);

  const subtitle =
    filters.district ? `— ${filters.district}` : "";

  return (
    <div className="App" style={{ padding: "1rem 1.25rem" }}>
      <h2 style={{ marginBottom: 8 }}>
        Stays in Kedah <span style={{ color: "#64748b", fontSize: 14 }}>{subtitle}</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 420px", gap: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <StayFilters stays={all} onChange={setFilters} />

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
                  {filtered.length} results
                </span>
                <strong>Directory</strong>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              {filtered.length === 0 ? (
                <p style={{ color: "#64748b" }}>
                  No stays match your filters. Try widening your search.
                </p>
              ) : (
                filtered.map((s) => <StayCard key={s.id} stay={s} />)
              )}
            </div>
          </section>
        </div>

        <div>
          <StayMap stays={filtered.slice(0, 50)} />
        </div>
      </div>
    </div>
  );
}
