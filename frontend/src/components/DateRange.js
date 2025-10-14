import React, { useEffect, useMemo, useState } from "react";

const OPTIONS = [
  { label: "Last 7 days",    key: "7d" },
  { label: "Last 30 days",   key: "30d" },
  { label: "Last 90 days",   key: "90d" },
  { label: "Last 3 months",  key: "3m" },
  { label: "Last 6 months",  key: "6m" },
  { label: "Last 12 months", key: "12m" },
  { label: "Year to date",   key: "ytd" },
  { label: "Custom…",        key: "custom" },
];

const toISO = (d) => new Date(d).toISOString().slice(0, 10);
const todayISO = () => toISO(new Date());
const daysAgoISO = (n) => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (n - 1));
  return toISO(start);
};
const monthsAgoISO = (n) => {
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - n);
  return toISO(start);
};
const ytdStartISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
};

export default function DateRange({ value, onChange }) {
  const [preset, setPreset] = useState(() => localStorage.getItem("dr:preset") || "30d");
  const [customFrom, setCustomFrom] = useState(value?.from || daysAgoISO(30));
  const [customTo, setCustomTo] = useState(value?.to || todayISO());

  useEffect(() => {
    localStorage.setItem("dr:preset", preset);
  }, [preset]);

  const computed = useMemo(() => {
    switch (preset) {
      case "7d":   return { from: daysAgoISO(7),   to: todayISO() };
      case "30d":  return { from: daysAgoISO(30),  to: todayISO() };
      case "90d":  return { from: daysAgoISO(90),  to: todayISO() };
      case "3m":   return { from: monthsAgoISO(3), to: todayISO() };
      case "6m":   return { from: monthsAgoISO(6), to: todayISO() };
      case "12m":  return { from: monthsAgoISO(12), to: todayISO() };
      case "ytd":  return { from: ytdStartISO(),   to: todayISO() };
      case "custom":
      default:     return { from: customFrom, to: customTo };
    }
  }, [preset, customFrom, customTo]);

  useEffect(() => {
    if (!onChange) return;
    if (!value || value.from !== computed.from || value.to !== computed.to) {
      if (computed.to && computed.from && computed.to < computed.from) return;
      onChange(computed);
    }
  }, [computed.from, computed.to, onChange]);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0 16px" }}>
      <strong>Date range:</strong>

      <select
        value={preset}
        onChange={(e) => setPreset(e.target.value)}
        style={{ padding: "6px 10px" }}
      >
        {OPTIONS.map(o => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>

      {preset === "custom" && (
        <span style={{ marginLeft: 12 }}>
          from{" "}
          <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />{" "}
          to{" "}
          <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
        </span>
      )}
    </div>
  );
}

