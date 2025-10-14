// src/App.js
import React, { useEffect, useRef, useState } from "react";
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
import DateRange from "./components/DateRange"; // stable single dropdown

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

// ---- tiny helper hook: cancel old requests + avoid duplicate fetches for same inputs
function useFetchWithCancel(urlBuilder, deps) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastKeyRef = useRef("");

  useEffect(() => {
    const { url, key } = urlBuilder();
    if (!url || key === "skip") return;      // no-op
    if (key === lastKeyRef.current) return;  // prevent duplicate fetch for same params
    lastKeyRef.current = key;

    const ctrl = new AbortController();
    setLoading(true);
    setErr(null);

    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => setData(json))
      .catch((e) => {
        if (e.name !== "AbortError") setErr(e);
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, err, loading };
}

export default function App() {
  // KPIs + series
  const [visitors, setVisitors] = useState(0);
  const [topAttraction, setTopAttraction] = useState({ name: "—", count: 0 });
  const [series, setSeries] = useState([]);

  // NEW: engagement totals (likes, comments, shares)
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [shares, setShares] = useState(0);

  // Rankings
  const [topList, setTopList] = useState([]);
  const [leastList, setLeastList] = useState([]);

  // Filters
  const [activePoi, setActivePoi] = useState(null);
  const [activeTab, setActiveTab] = useState("attractions");

  // Date range (controlled by <DateRange/>)
  const [range, setRange] = useState({ from: "", to: "" });

  // Build a stable key fragment for POI (so changing/clearing it cancels in-flight)
  const poiKey = activePoi ? `&poi_id=${activePoi.id}` : "";
  const poiQuery = activePoi ? `&poi_id=${activePoi.id}` : "";

  // Guard against empty/invalid ranges
  const validRange =
    range?.from && range?.to && typeof range.from === "string" && typeof range.to === "string" && range.to >= range.from;

  // ---- Fetches (each isolated + cancelable)
  const mentionsReq = useFetchWithCancel(
    () => {
      if (!validRange) return { url: "", key: "skip" };
      const url = `${API_BASE}/timeseries/mentions?date_from=${range.from}&date_to=${range.to}${poiQuery}`;
      const key = `mentions:${range.from}->${range.to}${poiKey}`;
      return { url, key };
    },
    [range?.from, range?.to, poiKey, API_BASE]
  );

  const visitorsReq = useFetchWithCancel(
    () => {
      if (!validRange) return { url: "", key: "skip" };
      const url = `${API_BASE}/metrics/visitors?date_from=${range.from}&date_to=${range.to}${poiQuery}`;
      const key = `visitors:${range.from}->${range.to}${poiKey}`;
      return { url, key };
    },
    [range?.from, range?.to, poiKey, API_BASE]
  );

  const top1Req = useFetchWithCancel(
    () => {
      if (!validRange) return { url: "", key: "skip" };
      const url = `${API_BASE}/metrics/top-attractions?date_from=${range.from}&date_to=${range.to}&limit=1`;
      const key = `top1:${range.from}->${range.to}`;
      return { url, key };
    },
    [range?.from, range?.to, API_BASE]
  );

  const topRankReq = useFetchWithCancel(
    () => {
      if (!validRange) return { url: "", key: "skip" };
      const url = `${API_BASE}/rankings/top-pois?date_from=${range.from}&date_to=${range.to}&limit=5`;
      const key = `top5:${range.from}->${range.to}`;
      return { url, key };
    },
    [range?.from, range?.to, API_BASE]
  );

  const leastRankReq = useFetchWithCancel(
    () => {
      if (!validRange) return { url: "", key: "skip" };
      const url = `${API_BASE}/rankings/least-pois?date_from=${range.from}&date_to=${range.to}&limit=5`;
      const key = `least5:${range.from}->${range.to}`;
      return { url, key };
    },
    [range?.from, range?.to, API_BASE]
  );

  // NEW: engagement (likes, comments, shares)
  const engagementReq = useFetchWithCancel(
    () => {
      if (!validRange) return { url: "", key: "skip" };
      const url = `${API_BASE}/metrics/engagement?date_from=${range.from}&date_to=${range.to}${poiQuery}`;
      const key = `engagement:${range.from}->${range.to}${poiKey}`;
      return { url, key };
    },
    [range?.from, range?.to, poiKey, API_BASE]
  );

  // ---- Map responses to UI state (pure)
  useEffect(() => {
    // timeseries
    if (mentionsReq.data?.items) {
      const sorted = mentionsReq.data.items
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => ({ ...d, dateLabel: d.date }));
      setSeries(sorted);
    }
  }, [mentionsReq.data]);

  useEffect(() => {
    // visitors
    if (typeof visitorsReq.data?.total === "number") {
      setVisitors(visitorsReq.data.total);
    }
  }, [visitorsReq.data]);

  useEffect(() => {
    // top attraction
    const first = top1Req.data?.items?.[0] || { name: "—", count: 0 };
    setTopAttraction({ name: first.name ?? "—", count: first.count ?? 0 });
  }, [top1Req.data]);

  useEffect(() => {
    // rankings
    setTopList(topRankReq.data?.items ?? []);
  }, [topRankReq.data]);

  useEffect(() => {
    setLeastList(leastRankReq.data?.items ?? []);
  }, [leastRankReq.data]);

  useEffect(() => {
    // NEW: engagement totals
    if (engagementReq.data) {
      setLikes(engagementReq.data.likes ?? 0);
      setComments(engagementReq.data.comments ?? 0);
      setShares(engagementReq.data.shares ?? 0);
    }
  }, [engagementReq.data]);

  // Simple search
  async function handleSearch(query) {
    const q = (query || "").trim();
    if (!q) return;
    try {
      const url = `${API_BASE}/search/pois?q=${encodeURIComponent(q)}&limit=1`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const res = await r.json();
      const first = res?.items?.[0];
      if (first) setActivePoi(first);
    } catch {
      // ignore
    }
  }

  // Combined loading & error view
  const loading =
    mentionsReq.loading ||
    visitorsReq.loading ||
    top1Req.loading ||
    topRankReq.loading ||
    leastRankReq.loading ||
    engagementReq.loading; // NEW

  const err =
    mentionsReq.err ||
    visitorsReq.err ||
    top1Req.err ||
    topRankReq.err ||
    leastRankReq.err ||
    engagementReq.err; // NEW

  if (!validRange) {
    return (
      <div className="App">
        <div className="header">
          <h1>Tourism Analytics Dashboard</h1>
          <DateRange value={range} onChange={setRange} />
        </div>
        <div className="center-subtle">Pick a date range to begin…</div>
      </div>
    );
  }

  if (loading) return <div className="App"><h2>Loading…</h2></div>;
  if (err) return <div className="App"><h2 style={{ color: "crimson" }}>Error: {err.message || String(err)}</h2></div>;

  return (
    <div className="App">
      {/* Header + controls */}
      <div className="header">
        <h1>Tourism Analytics Dashboard</h1>

        <DateRange value={range} onChange={setRange} />

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
          <div className="kpi-value">{visitors.toLocaleString()}</div>
          <div className="kpi-sub">in selected range</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-title">Top Attraction</div>
          <div className="kpi-value">{topAttraction.name}</div>
          <div className="kpi-sub">{topAttraction.count} mentions</div>
        </div>

        {/* NEW: Likes / Comments / Shares */}
        <div className="card kpi-card">
          <div className="kpi-title">Likes</div>
          <div className="kpi-value">{likes.toLocaleString()}</div>
          <div className="kpi-sub">in selected range</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-title">Comments</div>
          <div className="kpi-value">{comments.toLocaleString()}</div>
          <div className="kpi-sub">in selected range</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-title">Shares</div>
          <div className="kpi-value">{shares.toLocaleString()}</div>
          <div className="kpi-sub">in selected range</div>
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
            <div className="card-title">Sentiment & Trends</div>
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
