// src/components/POISearch.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";
const DEBOUNCE_MS = 200;

// Prefer the new backend route; fallback to the old one if needed.
const ENDPOINT_PRIMARY = `${API_BASE}/places/suggest`;
const ENDPOINT_FALLBACK = `${API_BASE}/search/pois`;

export default function POISearch({ onSelect, onQuery }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const boxRef = useRef(null);
  const tRef = useRef(null);

  // close when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const fetchSuggestions = useMemo(
    () => async (query) => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("limit", "20");
      setLoading(true);
      setErr("");
      try {
        // 1) Try primary route
        let res = await fetch(`${ENDPOINT_PRIMARY}?${params.toString()}`);
        // 2) If 404/Not found (older backend), try fallback route
        if (res.status === 404) {
          res = await fetch(`${ENDPOINT_FALLBACK}?${params.toString()}`);
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // both endpoints return { items: [...] }
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e) {
        setErr(e.message || "Failed to load");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // open dropdown as soon as user types
  useEffect(() => {
    if (!open && q) setOpen(true);
  }, [q, open]);

  // debounce typing
  useEffect(() => {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => {
      fetchSuggestions(q);
    }, DEBOUNCE_MS);
    return () => clearTimeout(tRef.current);
  }, [q, fetchSuggestions]);

  function handleFocus() {
    setOpen(true);
    // fetch initial list if empty
    if (!q) fetchSuggestions("");
  }

  function choose(it) {
    setQ(it.name || "");
    setOpen(false);
    onSelect?.(it);
    onQuery?.(it.name || "");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      onQuery?.(q);
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} style={{ position: "relative", display: "inline-block" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          placeholder="Search POIs…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          style={{ padding: "8px 10px", width: 260 }}
        />
        <button onClick={() => onQuery && onQuery(q)}>Search</button>
        <button
          onClick={() => {
            setQ("");
            setItems([]);
            setOpen(false);
            onSelect?.(null);
          }}
        >
          Clear
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            width: 360,
            maxHeight: 260,
            overflow: "auto",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,.08)",
            zIndex: 50,
          }}
        >
          {loading && (
            <div style={{ padding: 10, color: "#6b7280", fontSize: 13 }}>
              Searching…
            </div>
          )}
          {err && (
            <div style={{ padding: 10, color: "crimson", fontSize: 13 }}>
              {err}
            </div>
          )}
          {!loading && !err && items.length === 0 && (
            <div style={{ padding: 10, color: "#6b7280", fontSize: 13 }}>
              No matches
            </div>
          )}
          {!loading &&
            !err &&
            items.map((it) => (
              <div
                key={it.id}
                onClick={() => choose(it)}
                style={{
                  padding: "8px 10px",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                }}
                onMouseDown={(e) => e.preventDefault()} // keep focus
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {(it.category || "—") +
                      (it.latitude != null && it.longitude != null
                        ? ` · ${it.latitude}, ${it.longitude}`
                        : "")}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
