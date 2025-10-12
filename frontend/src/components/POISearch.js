// src/components/POISearch.js
import React, { useState } from "react";

export default function POISearch({ onSelect, onQuery }) {
  const [q, setQ] = useState("");

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0 16px" }}>
      <input
        placeholder="Search POIs…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ padding: "8px 10px", width: 240 }}
      />
      <button onClick={() => onQuery(q)}>Search</button>
      <button onClick={() => { setQ(""); onSelect(null); }}>Clear</button>
    </div>
  );
}
