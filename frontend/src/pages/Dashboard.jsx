// src/pages/Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import "../App.css";

import MapHeat from "../components/MapHeat";
import WordCloud from "../components/WordCloud";
import HiddenGemCard from "../components/HiddenGemCard";

import Tabs from "../components/Tabs";
import AttractionsTab from "../components/AttractionsTab";
import VendorsTab from "../components/VendorsTab";
import ReportExport from "../components/ReportExport";
import DateRange from "../components/DateRange";
import LocationMap from "../components/LocationMap";
// Removed: import POISearch from "../components/POISearch";
import POISearchAutosuggest from "../components/POISearchAutosuggest";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

// small fetch helper: cancel in-flight + de-dupe
function useFetchWithCancel(urlBuilder, deps) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastKeyRef = useRef("");

  useEffect(() => {
    const built = urlBuilder && urlBuilder();
    const { url, key } = built || {};
    if (!url || key === "skip") return;
    if (key === lastKeyRef.current) return;
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

// build ?k=v querystring
function qs(obj) {
  const p = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") p.set(k, v);
  });
  return p.toString();
}

export default function Dashboard() {
  // KPIs + series
  const [visitors, setVisitors] = useState(0);
  const [topAttraction, setTopAttraction] = useState({ name: "—", count: 0 });
  const [series, setSeries] = useState([]);

  // Engagement totals
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [shares, setShares] = useState(0);

  // Rankings
  const [topList, setTopList] = useState([]);
  const [leastList, setLeastList] = useState([]);

  // Filters
  const [activePoi, setActivePoi] = useState(null);
  const [activeTab, setActiveTab] = useState("attractions");
  const [range, setRange] = useState({ from: "", to: "" });

  // filter analytics by PLACE NAME (optional)
  const placeName = activePoi?.name || "";

  const validRange =
    range?.from && range?.to &&
    typeof range.from === "string" && typeof range.to === "string" &&
    range.to >= range.from;

  // --------- CALL THE **ANALYTICS** ENDPOINTS (your live data) ---------

  // 1) Time series: /api/analytics/timeseries -> [{ d, mentions, likes, comments, shares }, ...]
  const timeseriesReq = useFetchWithCancel(
    () => {
      if (!validRange) return { url: "", key: "skip" };
      const url = `${API_BASE}/analytics/timeseries?${qs({
        date_from: range.from,
        date_to: range.to,
        place: placeName || undefined,
      })}`;
      const key = `ts:${range.from}->${range.to}|${placeName}`;
      return { url, key };
    },
    [range?.from, range?.to, placeName, API_BASE]
  );

  useEffect(() => {
    const rows = Array.isArray(timeseriesReq.data) ? timeseriesReq.data : [];
    const sorted = rows
      .slice()
      .sort((a, b) => String(a.d || a.date).localeCompare(String(b.d || b.date)))
      .map((r) => ({
        dateLabel: (r.d || r.date || "").slice(0, 10),
        count: r.mentions ?? r.count ?? 0,
      }));
    setSeries(sorted);
  }, [timeseriesReq.data]);

  // 2) Summary: /api/analytics/summary -> totals + top_attraction
  const summaryReq = useFetchWithCancel(
    () => {
      if (!validRange) return { url: "", key: "skip" };
      const url = `${API_BASE}/analytics/summary?${qs({
        date_from: range.from,
        date_to: range.to,
        place: placeName || undefined,
      })}`;
      const key = `summary:${range.from}->${range.to}|${placeName}`;
      return { url, key };
    },
    [range?.from, range?.to, placeName, API_BASE]
  );

  useEffect(() => {
    const s = summaryReq.data;
    if (!s) return;

    // visitors = total mentions
    setVisitors(Number(s?.totals?.mentions || 0));

    // engagement totals
    setLikes(Number(s?.totals?.likes || 0));
    setComments(Number(s?.totals?.comments || 0));
    setShares(Number(s?.totals?.shares || 0));

    // top attraction
    const top = s?.top_attraction || {};
    setTopAttraction({
      name: top?.place__name || top?.name || "—",
      count: top?.mentions ?? 0,
    });
  }, [summaryReq.data]);

  // 3) Heatmap list for rankings: /api/analytics/heatmap
  const heatReq = useFetchWithCancel(
    () => {
      if (!validRange) return { url: "", key: "skip" };
      const url = `${API_BASE}/analytics/heatmap?${qs({
        date_from: range.from,
        date_to: range.to,
        place: placeName || undefined,
      })}`;
      const key = `heat:${range.from}->${range.to}|${placeName}`;
      return { url, key };
    },
    [range?.from, range?.to, placeName, API_BASE]
  );

  useEffect(() => {
    const rows = Array.isArray(heatReq.data) ? heatReq.data : [];
    const sortedDesc = rows.slice().sort((a, b) => (b.mentions || 0) - (a.mentions || 0));
    const sortedAsc  = rows.slice().sort((a, b) => (a.mentions || 0) - (b.mentions || 0));

    setTopList(sortedDesc.slice(0, 5).map(r => ({
      poi_id: r.place_id, name: r.name, count: r.mentions || 0,
    })));

    setLeastList(sortedAsc.slice(0, 5).map(r => ({
      poi_id: r.place_id, name: r.name, count: r.mentions || 0,
    })));
  }, [heatReq.data]);

  // Removed legacy quick-search handler (now handled by POISearchAutosuggest)
  // async function handleSearch(query) { ... }

  // loading/error aggregation
  const loading = timeseriesReq.loading || summaryReq.loading || heatReq.loading;
  const err = timeseriesReq.err || summaryReq.err || heatReq.err;

  // --------- RENDER ---------
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
      {/* Header + filters */}
      <div className="header">
        <h1>Tourism Analytics Dashboard</h1>
        <DateRange value={range} onChange={setRange} />

        <POISearchAutosuggest
          onSelect={(poi) => {
            // normalize to { id, name } as used throughout
            setActivePoi({ id: poi.id, name: poi.name });
          }}
          placeholder="Search POIs…"
        />
        <button onClick={() => setActivePoi(null)} style={{ marginLeft: 8 }}>
          Clear
        </button>
      </div>

      <LocationMap
        dateFrom={range.from}
        dateTo={range.to}
        poiName={activePoi?.name || null}
        fallbackName={topAttraction?.name || null}
      />

      {activePoi && <div className="center-subtle">Active POI filter: {activePoi.name}</div>}

      {/* KPIs */}
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

      {/* Main grid */}
      <div className="grid-rows">
        {/* Row 1: chart + hidden gem */}
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

        {/* Row 2: map + word cloud */}
        <div className="row2">
          <section className="card map-card">
            {/* MapHeat should already fetch /api/analytics/heatmap */}
            <MapHeat dateFrom={range.from} dateTo={range.to} />
          </section>

          <section className="card word-card">
            <div className="card-title">Sentiment & Trends</div>
            <WordCloud dateFrom={range.from} dateTo={range.to} />
          </section>
        </div>

        {/* Row 3: rankings + tabs/report */}
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
