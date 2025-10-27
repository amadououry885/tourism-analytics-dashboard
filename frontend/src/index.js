// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import App from "./App";                    // dashboard page
import Landing from "./Landing";            // landing page
import Header from "./components/Header";   // header shown on all pages

// ✅ use the dedicated Vendors page file (live API)
import VendorsPage from "./pages/VendorsPage";

import EventsPage from "./pages/EventsPage";         // Events page
import KedahTransport from "./pages/KedahTransport"; // Transport Hub
import StaysPage from "./pages/StaysPage";           // Stays directory

import "./App.css";

import "leaflet/dist/leaflet.css";


// ---- Simple placeholder pages ----
function About()   { return <div className="App"><h2>About Us</h2><p>Coming soon…</p></div>; }
function Contact() { return <div className="App"><h2>Contact</h2><p>Coming soon…</p></div>; }
function Legal()   { return <div className="App"><h2>Privacy Policy and Terms of Use</h2><p>Coming soon…</p></div>; }

// Shared layout: shows Header on every page
function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<App />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/kedah" element={<KedahTransport />} />
          <Route path="/stays" element={<StaysPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Legal />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
