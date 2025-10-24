// src/components/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const styles = `
.topnav{position:sticky;top:0;z-index:40;background:#fff;border-bottom:1px solid #e5e7eb}
.topnav-inner{display:flex;align-items:center;justify-content:space-between;padding:10px 16px}
.brand{font-weight:700;text-decoration:none;color:#111827}
.topnav-links{display:flex;gap:14px}
.navlink{padding:6px 10px;border-radius:8px;text-decoration:none;color:#374151;border:1px solid transparent}
.navlink:hover{background:#f9fafb;border-color:#e5e7eb}
.navlink.active{background:#111827;color:#fff;border-color:#111827}
`;

export default function Header() {
  return (
    <header className="topnav">
      <style>{styles}</style>
      <div className="topnav-inner">
        <nav className="topnav-links">
          <NavLink to="/" end className={({isActive}) => isActive ? "navlink active" : "navlink"}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "navlink active" : "navlink"}>
            Dashboard
          </NavLink>
          <NavLink to="/vendors" className={({isActive}) => isActive ? "navlink active" : "navlink"}>
            Vendors
          </NavLink>
          <NavLink to="/kedah" className={({isActive}) => isActive ? "navlink active" : "navlink"}>
            Transport
          </NavLink>
          <NavLink to="/stays" className={({isActive}) => isActive ? "navlink active" : "navlink"}>
            Stays
          </NavLink>
          <NavLink to="/events" className={({isActive}) => isActive ? "navlink active" : "navlink"}>
            Event
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
