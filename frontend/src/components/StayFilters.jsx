import React, { useEffect, useMemo, useState } from "react";

const TYPES = ["Hotel", "Apartment", "Guest House", "Homestay"];
const AMENITIES = ["WiFi", "Parking", "Breakfast", "Pool", "Kitchen", "Family", "Beach Access", "Aircon"];

/**
 * Props:
 * - stays: array of stay objects
 * - onChange(nextFilters): callback whenever filters change
 * - value (optional): controlled filters object { district, type, minPrice, maxPrice, minRating, amenities, q }
 */
export default function StayFilters({ stays, onChange, value }) {
  const districts = useMemo(
    () => Array.from(new Set(stays.map((s) => s.district))).sort(),
    [stays]
  );

  // Internal state (used when not controlled)
  const [state, setState] = useState({
    district: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    amenities: [],
    q: "",
  });

  // Derive the "current" filters (controlled if value provided, else internal state)
  const filters = value ?? state;

  // Keep internal state in sync if parent provides a controlled value later (or changes it)
  useEffect(() => {
    if (value) {
      setState(value);
    }
  }, [value]);

  function emit(next) {
    // Update internal state only when uncontrolled
    if (!value) setState(next);
    onChange?.(next);
  }

  function update(key, val) {
    emit({ ...filters, [key]: val });
  }

  function toggleAmenity(a) {
    const has = filters.amenities.includes(a);
    const amenities = has
      ? filters.amenities.filter((x) => x !== a)
      : [...filters.amenities, a];
    emit({ ...filters, amenities });
  }

  function resetAll() {
    const blank = {
      district: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      amenities: [],
      q: "",
    };
    emit(blank);
  }

  return (
    <div className="card" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", color: "#6b7280", letterSpacing: ".04em" }}>
          Filters
        </div>
        <button type="button" className="btn-mini" onClick={resetAll} title="Reset filters">
          Reset
        </button>
      </div>

      <input
        placeholder="Search name or landmark…"
        value={filters.q}
        onChange={(e) => update("q", e.target.value)}
        className="transport-input"
        aria-label="Search stays"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <select
          className="transport-input"
          value={filters.district}
          onChange={(e) => update("district", e.target.value)}
          aria-label="District"
        >
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          className="transport-input"
          value={filters.type}
          onChange={(e) => update("type", e.target.value)}
          aria-label="Type"
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <input
          className="transport-input"
          placeholder="RM min"
          value={filters.minPrice}
          onChange={(e) => update("minPrice", e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          aria-label="Minimum price"
        />
        <input
          className="transport-input"
          placeholder="RM max"
          value={filters.maxPrice}
          onChange={(e) => update("maxPrice", e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          aria-label="Maximum price"
        />
        <select
          className="transport-input"
          value={filters.minRating}
          onChange={(e) => update("minRating", e.target.value)}
          aria-label="Minimum rating"
        >
          <option value="">Any rating</option>
          <option value="7">≥ 7</option>
          <option value="8">≥ 8</option>
          <option value="9">≥ 9</option>
        </select>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {AMENITIES.map((a) => {
          const active = filters.amenities.includes(a);
          return (
            <button
              type="button"
              key={a}
              onClick={() => toggleAmenity(a)}
              className="btn-mini"
              style={{
                background: active ? "#eef2ff" : "#f8fafc",
                borderColor: active ? "#c7d2fe" : "#e5e7eb",
              }}
              aria-pressed={active}
            >
              {a}
            </button>
          );
        })}
      </div>
    </div>
  );
}
