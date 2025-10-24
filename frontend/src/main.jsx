// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import App from "./App";
import Landing from "./Landing";
import Header from "./components/Header";

import EventsPage from "./pages/EventsPage";
import KedahTransport from "./pages/KedahTransport";
import StaysPage from "./pages/StaysPage";

import VendorMap from "./components/VendorMap";
import VendorFilters from "./components/VendorFilters";
import "./App.css";

// Simple vendors demo page (same as before)
function VendorsPage() {
  const [vendors] = React.useState([
    { id: 1, name: "Warung Kampung", city: "Alor Setar", cuisines: ["Nasi Lemak", "Mee Goreng"], lat: 6.120, lon: 100.370 },
    { id: 2, name: "Kedah Kopitiam", city: "Alor Setar", cuisines: ["Roti Canai", "Nasi Lemak"], lat: 6.118, lon: 100.365 },
    { id: 3, name: "Langkawi Seafood", city: "Langkawi", cuisines: ["Grilled Fish", "Seafood Curry"], lat: 6.350, lon: 99.800 },
  ]);
  const [filtered, setFiltered] = React.useState([]);

  function handleFilter({ place, food }) {
    const p = place.trim().toLowerCase();
    const f = food.trim().toLowerCase();
    const results = vendors.filter(v =>
      v.city.toLowerCase().includes(p) &&
      (f === "" || v.cuisines.some(c => c.toLowerCase().includes(f)))
    );
    setFiltered(results);
  }

  return (
    <div className="App" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <VendorFilters onFilter={handleFilter} vendors={vendors} />
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff", flex: 1, overflowY: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Vendors</h2>
          {filtered.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No results yet — search above.</p>
          ) : (
            filtered.map(v => (
              <div key={v.id} style={{ borderBottom: "1px solid #f3f4f6", padding: "8px 0" }}>
                <strong>{v.name}</strong>
                <p style={{ margin: "4px 0", color: "#4b5563" }}>{v.city}</p>
                <p style={{ fontSize: 13, color: "#6b7280" }}>{v.cuisines.join(", ")}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <VendorMap />
    </div>
  );
}

// Shared layout with header
function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<App />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/kedah" element={<KedahTransport />} />   {/* ✅ Transport Hub */}
          <Route path="/stays" element={<StaysPage />} />        {/* ✅ Stays directory */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<div className="App"><h2>About Us</h2><p>Coming soon…</p></div>} />
          <Route path="/contact" element={<div className="App"><h2>Contact</h2><p>Coming soon…</p></div>} />
          <Route path="/legal" element={<div className="App"><h2>Privacy Policy and Terms of Use</h2><p>Coming soon…</p></div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
