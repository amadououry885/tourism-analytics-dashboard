// src/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-hero">
        <h1 className="landing-title">Tourism Analytics Dashboard</h1>
        <p className="landing-sub">
          Welcome! Explore insights, vendors, and Kedah highlights.
        </p>
      </header>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-row">
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/legal">Privacy Policy and Terms of Use</Link>
          <span className="spacer" />
          <div className="socials">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">Twitter</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">Facebook</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

