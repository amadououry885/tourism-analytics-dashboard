import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import TransportSearch from "../components/TransportSearch";
import TransportResults from "../components/TransportResults";
import TransportMap from "../components/TransportMap";

import staysData from "../data/stays.kedah.json";
import StayCard from "../components/StayCard";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

// Helpers
function normalizeDistrict(place) {
  if (!place) return "";
  if (place === "Kuala Kedah Jetty") return "Alor Setar";
  return place;
}

function classifyRoute(fromInKedah, toInKedah) {
  if (fromInKedah && toInKedah) return "intra_kedah";
  if (!fromInKedah && toInKedah) return "coming_to_kedah";
  if (fromInKedah && !toInKedah) return "leaving_kedah";
  return "unknown";
}

export default function KedahTransport() {
  const [query, setQuery] = useState({ from: "", to: "" });

  // Places fetched from API
  const [places, setPlaces] = useState([]); // [{id,name,lat,lon,is_in_kedah}]
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [errPlaces, setErrPlaces] = useState(null);

  // Route result (merged for UI)
  const [routeResult, setRouteResult] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [errRoute, setErrRoute] = useState(null);

  // Fetch all places (we follow DRF pagination if present)
  useEffect(() => {
    let alive = true;
    async function loadPlaces() {
      try {
        setLoadingPlaces(true);
        setErrPlaces(null);

        const collected = [];
        let url = `${API_BASE}/transport/places/?limit=200`;
        while (url) {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const items = json.results || [];
          collected.push(...items);
          url = json.next;
        }

        if (alive) setPlaces(collected);
      } catch (e) {
        if (alive) setErrPlaces(e.message || "Failed to load places");
      } finally {
        if (alive) setLoadingPlaces(false);
      }
    }
    loadPlaces();
    return () => { alive = false; };
  }, []);

  // Build autosuggest list and Kedah set
  const placeNames = useMemo(() => places.map(p => p.name).sort(), [places]);
  const KEDAH_SET = useMemo(() => new Set(places.filter(p => p.is_in_kedah).map(p => p.name)), [places]);

  const fromInKedah = useMemo(() => KEDAH_SET.has(query.from), [KEDAH_SET, query.from]);
  const toInKedah   = useMemo(() => KEDAH_SET.has(query.to), [KEDAH_SET, query.to]);

  // Fetch route when both from/to selected
  useEffect(() => {
    let alive = true;
    async function loadRoutes() {
      const from = (query.from || "").trim();
      const to   = (query.to || "").trim();
      if (!from || !to) {
        if (alive) {
          setRouteResult(null);
          setErrRoute(null);
        }
        return;
      }

      try {
        setLoadingRoute(true);
        setErrRoute(null);

        const params = new URLSearchParams({ origin: from, destination: to });
        const res = await fetch(`${API_BASE}/transport/routes/?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const routes = json.results || [];

        // Merge multiple routes (if any) into one UI object
        let options = [];
        let polyline = null;
        for (const r of routes) {
          if (Array.isArray(r.options)) options = options.concat(r.options);
          if (!polyline && r.polyline && Array.isArray(r.polyline) && r.polyline.length >= 2) {
            polyline = r.polyline;
          }
        }

        const type = classifyRoute(fromInKedah, toInKedah);

        const merged = {
          from,
          to,
          type,          // "intra_kedah" | "coming_to_kedah" | "leaving_kedah" | "unknown"
          options,       // array of {mode, durationMin, priceMin, priceMax, provider}
          polyline,      // [[lat, lon], ...] or null
        };

        if (alive) setRouteResult(merged);
      } catch (e) {
        if (alive) {
          setErrRoute(e.message || "Failed to load routes");
          setRouteResult(null);
        }
      } finally {
        if (alive) setLoadingRoute(false);
      }
    }

    loadRoutes();
    return () => { alive = false; };
  }, [query.from, query.to, fromInKedah, toInKedah]);

  // stays near destination
  const staysNear = useMemo(() => {
    const dst = normalizeDistrict(query.to);
    if (!dst || (!KEDAH_SET.has(dst) && dst !== "Alor Setar")) return [];
    return staysData.stays
      .filter((s) => s.district === dst)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [query.to, KEDAH_SET]);

  return (
    <div className="App" style={{ padding: "1rem 1.25rem" }}>
      <h2 style={{ marginBottom: 8 }}>Kedah Transport Hub</h2>

      {errPlaces && (
        <div className="card" style={{ padding: 12, color: "#b91c1c", marginBottom: 12 }}>
          Failed to load places: {errPlaces}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 420px",
          gap: "16px",
        }}
      >
        {/* Left side */}
        <div>
          <TransportSearch
            places={placeNames}                // autosuggest source (strings)
            value={query}
            onChange={setQuery}
            insideKedahList={[...KEDAH_SET]}   // for the type pill
          />

          <div style={{ marginTop: 16 }}>
            {loadingRoute ? (
              <div className="card" style={{ padding: 12, color: "#64748b" }}>Loading routes…</div>
            ) : errRoute ? (
              <div className="card" style={{ padding: 12, color: "#b91c1c" }}>Failed to load routes: {errRoute}</div>
            ) : (
              <TransportResults result={routeResult} />
            )}
          </div>

          {/* Stays near the destination */}
          {staysNear.length > 0 && (
            <section className="card" style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
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
                    🛏️ {staysNear.length} stays
                  </span>
                  <strong>Stays near {normalizeDistrict(query.to)}</strong>
                </div>

                <Link
                  className="btn-mini"
                  to={`/stays?district=${encodeURIComponent(
                    normalizeDistrict(query.to)
                  )}`}
                >
                  View all
                </Link>
              </div>

              <div style={{ marginTop: 8 }}>
                {staysNear.map((s) => (
                  <StayCard key={s.id} stay={s} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right side map */}
        <div>
          <TransportMap result={routeResult} />
        </div>
      </div>
    </div>
  );
}
