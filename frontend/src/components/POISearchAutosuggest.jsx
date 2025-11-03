import React, { useEffect, useRef, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";
const DEBOUNCE_MS = 250;

export default function POISearchAutosuggest({ onSelect, placeholder = "Search POIs…" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(-1); // keyboard highlight
  const boxRef = useRef(null);
  const timerRef = useRef(null);

  // fetch suggestions (debounced)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("limit", "20");
      setLoading(true);
      fetch(`${API_BASE}/search/pois?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => setItems(d.items || []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [q]);

  // close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(it) {
    setOpen(false);
    setQ(it.name);
    onSelect?.(it);      // send full POI to parent
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && index >= 0 && index < items.length) {
        e.preventDefault();
        choose(items[index]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} style={{ position: "relative", display: "inline-block", width: 280 }}>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setIndex(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{ width: "100%", padding: "8px 10px" }}
      />
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            marginTop: 4,
            boxShadow: "0 8px 20px rgba(0,0,0,.06)",
            zIndex: 20,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div style={{ padding: 10, color: "#6b7280", fontSize: 13 }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 10, color: "#6b7280", fontSize: 13 }}>No results</div>
          ) : (
            items.map((it, i) => (
              <div
                key={it.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(it)}
                onMouseEnter={() => setIndex(i)}
                style={{
                  padding: "8px 10px",
                  cursor: "pointer",
                  background: index === i ? "#f3f4f6" : "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontWeight: 600 }}>{it.name}</span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{it.category || ""}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
