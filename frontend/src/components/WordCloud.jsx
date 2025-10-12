// frontend/src/components/WordCloud.jsx
import React, { useEffect, useMemo, useState } from "react";


const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";


export default function WordCloud({ dateFrom, dateTo, sentiment }) {
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);


useEffect(() => {
const params = new URLSearchParams();
if (dateFrom) params.set("date_from", dateFrom);
if (dateTo) params.set("date_to", dateTo);
if (sentiment) params.set("sentiment", sentiment);
params.set("limit", 80);
setLoading(true);
fetch(`${API_BASE}/trends/wordcloud?${params.toString()}`)
.then(r => r.json())
.then(d => setItems(d.items || []))
.catch(() => setItems([]))
.finally(() => setLoading(false));
}, [dateFrom, dateTo, sentiment]);


const max = useMemo(() => items.reduce((m, t) => Math.max(m, t.count), 0) || 1, [items]);


if (loading) return <div className="card">Building word cloud…</div>;
if (!items.length) return <div className="card">No keywords for this range.</div>;


return (
<div className="card">
<div className="card-title">Trending Keywords</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 10, lineHeight: 1.2 }}>
{items.map(({ term, count }) => {
const size = 12 + Math.round((count / max) * 28); // 12–40px
const weight = count / max > 0.66 ? 800 : count / max > 0.33 ? 600 : 500;
return (
<span key={term} style={{ fontSize: size, fontWeight: weight }}>{term}</span>
);
})}
</div>
</div>
);
}