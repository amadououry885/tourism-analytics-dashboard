// src/App.js
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./App.css";

// Use the Django server directly.
// You can override this by setting REACT_APP_API_BASE in the container/env.
const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function App() {
  const [pois, setPois] = useState([]);
  const [postsRaw, setPostsRaw] = useState([]);
  const [postsClean, setPostsClean] = useState([]);
  const [sentiments, setSentiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [poisR, rawR, cleanR, sentiR] = await Promise.all([
          getJSON(`${API_BASE}/pois/`),
          getJSON(`${API_BASE}/posts-raw/`),
          getJSON(`${API_BASE}/posts-clean/`),
          // example filter; tweak to your needs or build a small UI
          getJSON(
            `${API_BASE}/sentiments/?topic=Sky%20Bridge&date_from=2025-10-01&date_to=2025-10-07`
          ),
        ]);

        setPois(poisR);
        setPostsRaw(rawR);
        setPostsClean(cleanR);

        setSentiments(
          sentiR
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((d) => ({ ...d, dateLabel: d.date }))
        );
      } catch (e) {
        setErr(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="App"><h2>Loading…</h2></div>;
  if (err) return <div className="App"><h2 style={{color:"crimson"}}>Error: {err}</h2></div>;

  return (
    <div className="App" style={{ padding: 24, color: "white" }}>
      <h1>Tourism Analytics Dashboard</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Sentiment trend (example: “Sky Bridge”)</h2>
        <div style={{ height: 320, background: "#1f2937", padding: 12, borderRadius: 8 }}>
          {sentiments.length === 0 ? (
 <div style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>
  Debug — sentiments: {sentiments.length} rows
</div>

) : (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={sentiments}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="dateLabel" tick={{ fill: "#cbd5e1" }} stroke="#475569" />
      <YAxis allowDecimals={false} tick={{ fill: "#cbd5e1" }} stroke="#475569" />
      <Tooltip
        contentStyle={{ background: "#111827", border: "1px solid #334155", color: "#e5e7eb" }}
        labelStyle={{ color: "#e5e7eb" }}
        itemStyle={{ color: "#e5e7eb" }}
      />
      <Legend wrapperStyle={{ color: "#93c5fd" }} />
      <Line
        type="monotone"
        dataKey="count"
        name="Mentions"
        stroke="#60a5fa"
        strokeWidth={3}
        dot={{ r: 3, strokeWidth: 1, stroke: "#60a5fa", fill: "#60a5fa" }}
        activeDot={{ r: 5 }}
      />
    </LineChart>
  </ResponsiveContainer>
)}

        </div>
      </section>

      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div>
          <h3>POIs</h3>
          <ul>
            {pois.map((p) => (
              <li key={p.id}>{p.name} — {p.category}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Raw Posts</h3>
          <ul>
            {postsRaw.map((p) => (
              <li key={p.id}>{p.platform}: {p.content}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Clean Posts</h3>
          <ul>
            {postsClean.map((p) => (
              <li key={p.id}>{p.clean_content} ({p.sentiment})</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
