// src/pages/VendorsPage.jsx
import React, { useMemo, useState, useCallback } from "react";
import VendorMap from "../components/VendorMap";
import VendorFilters from "../components/VendorFilters";

async function fetchAllVendors(base = "/api/vendors/", city = "") {
  // Guard: backend expects a city/place; avoid 400s
  if (!city || !city.trim()) {
    return { vendors: [], hint: "Choose a place/city then Search." };
  }

  const vendors = [];
  let url = `${base}?${new URLSearchParams({ city: city.trim() }).toString()}`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) {
      // surface backend error text to the UI
      let msg;
      try { msg = await res.text(); } catch { msg = `HTTP ${res.status}`; }
      throw new Error(msg || `HTTP ${res.status}`);
    }
    const data = await res.json();
    vendors.push(...(data.results || []));
    url = data.next; // follow DRF pagination if present
  }

  return { vendors };
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [info, setInfo] = useState("Choose a place/city and click Search.");
  const [filterInput, setFilterInput] = useState({ place: "", food: "" });

  // Only fetch when user searches with a place/city
  const handleFilter = useCallback(async ({ place, food }) => {
    setFilterInput({ place, food });
    setErr(null);
    setInfo(null);

    // Require a place/city to avoid 400s
    const city = (place || "").trim();
    if (!city) {
      setVendors([]);
      setInfo("Choose a place/city then Search.");
      return;
    }

    try {
      setLoading(true);
      const { vendors: fromApi, hint } = await fetchAllVendors("/api/vendors/", city);
      setVendors(fromApi);
      if (hint) setInfo(hint);
      if (!fromApi.length) setInfo(`No vendors found in “${city}”. Try another place or cuisine.`);
    } catch (e) {
      setErr(e.message || String(e));
      setVendors([]);
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
          {info && !loading && !err && <p style={{ color: "#6b7280" }}>{info}</p>}
          {err && <p style={{ color: "#b91c1c" }}>Error: {err}</p>}
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
                    📍 {Number(v.lat).toFixed(4)}, {Number(v.lon).toFixed(4)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

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
