import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TransportSearch from "../components/TransportSearch";
import TransportResults from "../components/TransportResults";
import TransportMap from "../components/TransportMap";
import routesData from "../data/transport.routes.json";
import staysData from "../data/stays.kedah.json";
import StayCard from "../components/StayCard";

const KEDAH_PLACES = new Set([
  "Alor Setar",
  "Langkawi",
  "Kulim",
  "Sungai Petani",
  "Kuala Kedah Jetty",
  "Gurun",
  "Jitra",
]);

// normalize place name for stay lookup
function normalizeDistrict(place) {
  if (!place) return "";
  if (place === "Kuala Kedah Jetty") return "Alor Setar";
  return place;
}

function classifyRoute(from, to) {
  const inFrom = KEDAH_PLACES.has(from);
  const inTo = KEDAH_PLACES.has(to);
  if (inFrom && inTo) return "intra_kedah";
  if (!inFrom && inTo) return "coming_to_kedah";
  if (inFrom && !inTo) return "leaving_kedah";
  return "unknown";
}

function lookupRoute(from, to) {
  if (!from || !to) return null;
  const ci = (s) => s.trim().toLowerCase();
  const found =
    routesData.routes.find(
      (r) => ci(r.from) === ci(from) && ci(r.to) === ci(to)
    ) || null;

  if (found) return found;

  const reverse = routesData.routes.find(
    (r) => ci(r.from) === ci(to) && ci(r.to) === ci(from)
  );
  if (reverse) {
    return {
      ...reverse,
      from,
      to,
      type: classifyRoute(from, to),
      polyline: Array.isArray(reverse.polyline)
        ? [...reverse.polyline].slice().reverse()
        : undefined,
    };
  }

  return {
    from,
    to,
    type: classifyRoute(from, to),
    options: [],
    polyline: undefined,
  };
}

export default function KedahTransport() {
  const [query, setQuery] = useState({ from: "", to: "" });

  const result = useMemo(() => {
    if (!query.from || !query.to) return null;
    return lookupRoute(query.from, query.to);
  }, [query.from, query.to]);

  // stays near destination
  const staysNear = useMemo(() => {
    const dst = normalizeDistrict(query.to);
    if (!dst || (!KEDAH_PLACES.has(dst) && dst !== "Alor Setar")) return [];
    return staysData.stays
      .filter((s) => s.district === dst)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [query.to]);

  return (
    <div className="App" style={{ padding: "1rem 1.25rem" }}>
      <h2 style={{ marginBottom: 8 }}>Kedah Transport Hub</h2>

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
            places={routesData.places}
            value={query}
            onChange={setQuery}
            insideKedahList={[...KEDAH_PLACES]}
          />

          <div style={{ marginTop: 16 }}>
            <TransportResults result={result} />
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
          <TransportMap result={result} />
        </div>
      </div>
    </div>
  );
}
