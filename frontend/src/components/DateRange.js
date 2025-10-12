// src/components/DateRange.js
import React from "react";

export default function DateRange({ value, onChange }) {
  const { from, to } = value;

  const setPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    onChange({
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    });
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0 16px" }}>
      <strong>Date range:</strong>
      <button onClick={() => setPreset(7)}>Last 7</button>
      <button onClick={() => setPreset(30)}>Last 30</button>
      <button onClick={() => setPreset(90)}>Last 90</button>

      <span style={{ marginLeft: 12 }}>
        from{" "}
        <input
          type="date"
          value={from}
          onChange={(e) => onChange({ from: e.target.value, to })}
        />{" "}
        to{" "}
        <input
          type="date"
          value={to}
          onChange={(e) => onChange({ from, to: e.target.value })}
        />
      </span>
    </div>
  );
}
