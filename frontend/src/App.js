import React from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import VendorsPage from "./pages/VendorsPage";
import KedahTransport from "./pages/KedahTransport"; // ✅ exact filename
import StaysPage from "./pages/StaysPage";
import EventsPage from "./pages/EventsPage";         // ✅ exact filename

export default function App() {
  return (
    <div>
      <nav className="top-nav">
        <NavLink to="/" end className="nav-item">Home</NavLink>
        <NavLink to="/dashboard" className="nav-item">Dashboard</NavLink>
        <NavLink to="/vendors" className="nav-item">Vendors</NavLink>
        <NavLink to="/transport" className="nav-item">Transport</NavLink>
        <NavLink to="/stays" className="nav-item">Stays</NavLink>
        <NavLink to="/event" className="nav-item">Event</NavLink>
      </nav>

      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/transport" element={<KedahTransport />} /> {/* ✅ */}
          <Route path="/stays" element={<StaysPage />} />
          <Route path="/event" element={<EventsPage />} />          {/* ✅ */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Home</h2>
      <p>Welcome. Use the nav above to open a page.</p>
      <p><Link to="/dashboard">Go to Dashboard →</Link></p>
    </div>
  );
}

function NotFound() {
  return <h2 style={{ color: "crimson" }}>404 — Page not found</h2>;
}
