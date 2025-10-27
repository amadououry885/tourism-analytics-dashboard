// src/pages/VendorsPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import VendorMap from "../components/VendorMap";
import VendorFilters from "../components/VendorFilters";

async function fetchAllVendors(base = "/api/vendors/", city = "") {
  const vendors = [];
  let url = base;
  if (city && city.trim()) {
    const q = new URLSearchParams({ city: city.trim() });
    url = `${base}?${q.toString()}`;
  }
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const data = await res.json();
    vendors.push(...(data.results || []));
    url = data.next; // follow DRF pagination if present
  }
  return vendors;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [filterInput, setFilterInput] = useState({ place: "", food: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = await fetchAllVendors("/api/vendors/");
        if (alive) setVendors(all);
      } catch (e) {
        if (alive) setErr(e.message || String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleFilter = useCallback(async ({ place, food }) => {
    setFilterInput({ place, food });
    try {
      setLoading(true);
      setErr(null);
      const city = place || "";
      const fromApi = await fetchAllVendors("/api/vendors/", city);
      setVendors(fromApi);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const f = (filterInput.food || "").trim().toLowerCase();
    if (!f) return vendors;
    return vendors.filter(v =>
      Array.isArray(v.cuisines) &&
      v.cuisines.some(c => String(c).toLowerCase().includes(f))
    );
  }, [vendors, filterInput.food]);

  return (
    <div className="App" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <VendorFilters onFilter={handleFilter} vendors={vendors} />
        <div style={listBox}>
          <h2 style={{ marginTop: 0 }}>Vendors</h2>
          {loading && <p style={{ color: "#6b7280" }}>Loading vendors…</p>}
          {err && <p style={{ color: "#b91c1c" }}>Error: {err}</p>}
          {!loading && !err && filtered.length === 0 && (
            <p style={{ color: "#6b7280" }}>No vendors found. Try a different city or cuisine.</p>
          )}
          {!loading && !err && filtered.length > 0 && (
            filtered.map(v => (
              <div key={v.id} style={card}>
                <strong>{v.name}</strong>
                <p style={{ margin: "4px 0", color: "#4b5563" }}>{v.city}</p>
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  🍽️ {(v.cuisines || []).join(", ") || "No cuisines listed"}
                </p>
                {v.lat != null && v.lon != null && (
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>
                    📍 {v.lat.toFixed(4)}, {v.lon.toFixed(4)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* pass filtered vendors to the map */}
      <VendorMap vendors={filtered} />
    </div>
  );
}

const listBox = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
  flex: 1,
  overflowY: "auto",
};
const card = { borderBottom: "1px solid #f3f4f6", padding: "8px 0" };
