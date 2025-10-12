// src/App.js
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import "./App.css";

import MapHeat from "./components/MapHeat";
import WordCloud from "./components/WordCloud";
import HiddenGemCard from "./components/HiddenGemCard";

import Tabs from "./components/Tabs";
import AttractionsTab from "./components/AttractionsTab";
import VendorsTab from "./components/VendorsTab";
import ReportExport from "./components/ReportExport";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export default function App() {
  // KPIs + series
  const [visitors, setVisitors] = useState(0);
  const [topAttraction, setTopAttraction] = useState({ name: "—", count: 0 });
  const [series, setSeries] = useState([]);

  // Rankings
  const [topList, setTopList] = useState([]);
  const [leastList, setLeastList] = useState([]);

  // Filters
  const [activePoi, setActivePoi] = useState(null);
  const [activeTab, setActiveTab] = useState("attractions");

  // UX
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ---- Date range (Last 7) ----
  const today = useMemo(() => new Date(), []);
  const start7 = useMemo(() => {
    const d = new Date();
    d.setDate(today.getDate() - 6);
    return d;
  }, [today]);
  const [range, setRange] = useState({
    from: start7.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  });

  // Refresh KPIs, series, rankings on range/poi
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const poiParam = activePoi ? `&poi_id=${activePoi.id}` : "";

        const [visitorsR, topR, tsR, topRank, leastRank] = await Promise.all([
          getJSON(`${API_BASE}/metrics/visitors?date_from=${range.from}&date_to=${range.to}${poiParam}`),
          getJSON(`${API_BASE}/metrics/top-attractions?date_from=${range.from}&date_to=${range.to}&limit=1`),
          getJSON(`${API_BASE}/timeseries/mentions?date_from=${range.from}&date_to=${range.to}${poiParam}`),
          getJSON(`${API_BASE}/rankings/top-pois?date_from=${range.from}&date_to=${range.to}&limit=5`),
          getJSON(`${API_BASE}/rankings/least-pois?date_from=${range.from}&date_to=${range.to}&limit=5`),
        ]);

        setVisitors(visitorsR?.total ?? 0);
        const first = topR?.items?.[0] || { name: "—", count: 0 };
        setTopAttraction({ name: first.name ?? "—", count: first.count ?? 0 });

        const sorted = (tsR.items || [])
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((d) => ({ ...d, dateLabel: d.date }));
        setSeries(sorted);

        setTopList(topRank?.items ?? []);
        setLeastList(leastRank?.items ?? []);
      } catch (e) {
        setErr(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [range, activePoi]);

  // Presets + search
  function setPreset(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setRange({
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    });
  }
  async function handleSearch(query) {
    const q = (query || "").trim();
    if (!q) return;
    try {
      const res = await getJSON(`${API_BASE}/search/pois?q=${encodeURIComponent(q)}&limit=1`);
      const first = res?.items?.[0];
      if (first) setActivePoi(first);
    } catch { /* ignore */ }
  }

  if (loading) return <div className="App"><h2>Loading…</h2></div>;
  if (err) return <div className="App"><h2 style={{color:"crimson"}}>Error: {err}</h2></div>;

  return (
    <div className="App">
      {/* Header + controls */}
      <div className="header">
        <h1>Tourism Analytics Dashboard</h1>

        <strong>Date range:</strong>
        <button onClick={() => setPreset(7)}>Last 7</button>
        <button onClick={() => setPreset(30)}>Last 30</button>
        <button onClick={() => setPreset(90)}>Last 90</button>

        <span>
          from{" "}
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ from: e.target.value, to: range.to })}
          />{" "}
          to{" "}
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ from: range.from, to: e.target.value })}
          />
        </span>

        <span>
          <input
            placeholder="Search POIs…"
            onKeyDown={(e) => e.key === "Enter" && handleSearch(e.currentTarget.value)}
            style={{ width: 220 }}
            type="text"
          />
          <button
            onClick={(e) => {
              const input = e.currentTarget.previousSibling;
              handleSearch(input?.value || "");
            }}
          >
            Search
          </button>
          <button onClick={() => setActivePoi(null)}>Clear</button>
        </span>
      </div>

      {activePoi && (
        <div className="center-subtle">Active POI filter: {activePoi.name}</div>
      )}

      {/* KPI tiles */}
      <div className="kpi-row">
        <div className="card kpi-card">
          <div className="kpi-title">Total Visitors</div>
          <div className="kpi-value">{visitors}</div>
          <div className="kpi-sub">in selected range</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-title">Top Attraction</div>
          <div className="kpi-value">{topAttraction.name}</div>
          <div className="kpi-sub">{topAttraction.count} mentions</div>
        </div>
      </div>

      {/* 3-row compact dashboard */}
      <div className="grid-rows">
        {/* Row 1: Chart + Hidden Gem */}
        <div className="row1">
          <section className="card chart-card">
            <div className="card-title">Visitor Mentions Over Time</div>
            {series.length === 0 ? (
              <div className="center-subtle">No data in range</div>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Mentions"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="card rank-card">
            <HiddenGemCard dateFrom={range.from} dateTo={range.to} />
          </section>
        </div>

        {/* Row 2: Map + Word Cloud */}
        <div className="row2">
          <section className="card map-card">
            <MapHeat dateFrom={range.from} dateTo={range.to} />
          </section>

          <section className="card word-card">
            <WordCloud dateFrom={range.from} dateTo={range.to} />
          </section>
        </div>

        {/* Row 3: Rankings + Tabs/Report */}
        <div className="row3">
          <section className="card rank-card" style={{ textAlign: "left" }}>
            <div className="card-title">Top 5 Most Visited</div>
            {(!topList || topList.length === 0) ? (
              <p className="center-subtle" style={{ textAlign: "left" }}>No data</p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {topList.map((it) => (
                  <li key={`${it.poi_id}-${it.name}`} style={{ margin: "4px 0" }}>
                    {it.name} <span style={{ color: "#6b7280" }}>— {it.count}</span>
                  </li>
                ))}
              </ol>
            )}

            <div className="card-title" style={{ marginTop: 10 }}>Top 5 Least Visited</div>
            {(!leastList || leastList.length === 0) ? (
              <p className="center-subtle" style={{ textAlign: "left" }}>No data</p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {leastList.map((it) => (
                  <li key={`${it.poi_id}-${it.name}`} style={{ margin: "4px 0" }}>
                    {it.name} <span style={{ color: "#6b7280" }}>— {it.count}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="card" style={{ display: "grid", gap: 10, gridTemplateRows: "auto 1fr auto" }}>
            <Tabs
              tabs={[
                { key: "attractions", label: "Attractions" },
                { key: "vendors", label: "Food Vendors" },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />
            <div style={{ overflow: "auto" }}>
              {activeTab === "attractions" ? (
                <AttractionsTab dateFrom={range.from} dateTo={range.to} />
              ) : (
                <VendorsTab dateFrom={range.from} dateTo={range.to} />
              )}
            </div>
            <ReportExport dateFrom={range.from} dateTo={range.to} />
          </section>
        </div>
      </div>
    </div>
  );
}
