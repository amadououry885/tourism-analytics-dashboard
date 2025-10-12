// src/components/TopLists.js
import React from "react";

function List({ title, items }) {
  return (
    <div className="card" style={{ width: 360, textAlign: "left" }}>
      <h3>{title}</h3>
      {(!items || items.length === 0) ? (
        <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>No data</p>
      ) : (
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {items.map((it) => (
            <li key={`${it.poi_id}-${it.name}`} style={{ margin: "6px 0" }}>
              {it.name} <span style={{ color: "#6b7280" }}>— {it.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function TopLists({ top, least }) {
  return (
    <div className="cards-container" style={{ justifyContent: "flex-start" }}>
      <List title="Top 5 Most Visited" items={top} />
      <List title="Top 5 Least Visited" items={least} />
    </div>
  );
}

