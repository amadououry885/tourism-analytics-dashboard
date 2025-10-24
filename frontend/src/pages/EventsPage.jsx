// src/pages/EventsPage.jsx
import React, { useMemo, useRef, useState } from "react";

/** ---- Mock events (replace with API later) ---- */
const MOCK_EVENTS = [
  {
    id: 1,
    title: "Langkawi International Maritime & Aerospace (LIMA)",
    date: "2025-05-23",
    district: "Langkawi",
    category: "Aerospace",
    location: "Mahsuri International Exhibition Centre, Langkawi",
    image: "https://images.unsplash.com/photo-1562620669-51c7d3b4d2e0?q=80&w=1280&auto=format&fit=crop",
    blurb: "One of Asia’s premier maritime and aerospace showcases.",
  },
  {
    id: 2,
    title: "Kedah Paddy Festival",
    date: "2025-08-10",
    district: "Alor Setar",
    category: "Culture",
    location: "Paddy Museum, Alor Setar",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1280&auto=format&fit=crop",
    blurb: "Celebrate harvest season with cultural performances and food stalls.",
  },
  {
    id: 3,
    title: "Langkawi International Regatta",
    date: "2025-11-18",
    district: "Langkawi",
    category: "Sports",
    location: "Royal Langkawi Yacht Club",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1280&auto=format&fit=crop",
    blurb: "Annual sailing competition with global participants.",
  },
  {
    id: 4,
    title: "Titi Gajah Cultural Night",
    date: "2025-06-21",
    district: "Alor Setar",
    category: "Culture",
    location: "Titi Gajah, Alor Setar",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1280&auto=format&fit=crop",
    blurb: "Local performances, crafts and street food.",
  },
  {
    id: 5,
    title: "Kulim Food & Craft Fair",
    date: "2025-09-05",
    district: "Kulim",
    category: "Food",
    location: "Kulim Town Square",
    image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1280&auto=format&fit=crop",
    blurb: "Vendors from across Kedah featuring regional dishes and crafts.",
  },
];

const districts = ["All districts", "Alor Setar", "Langkawi", "Kulim"];
const categories = ["All categories", "Culture", "Food", "Sports", "Aerospace"];

export default function EventsPage() {
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("All districts");
  const [category, setCategory] = useState("All categories");
  const [month, setMonth] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  // --- Autosuggest state for the search box ---
  const [openSug, setOpenSug] = useState(false);
  const [hi, setHi] = useState(-1);
  const searchRef = useRef(null);
  const sugWrapRef = useRef(null);

  const todayISO = new Date().toISOString().slice(0, 10);

  // Filtered events for the grid
  const events = useMemo(() => {
    return MOCK_EVENTS
      .filter(e => (upcomingOnly ? e.date >= todayISO : true))
      .filter(e => (district === "All districts" ? true : e.district === district))
      .filter(e => (category === "All categories" ? true : e.category === category))
      .filter(e => (month ? e.date.slice(0, 7) === month : true))
      .filter(e => {
        const hay = (e.title + " " + e.location + " " + e.blurb + " " + e.category + " " + e.district).toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [q, district, category, month, upcomingOnly, todayISO]);

  // ---- Build suggestion list (districts, categories, event titles & places) ----
  const suggestions = useMemo(() => {
    // Base pools
    const topDistricts = [...new Set(MOCK_EVENTS.map(e => e.district))];
    const topCategories = [...new Set(MOCK_EVENTS.map(e => e.category))];
    const titles = MOCK_EVENTS.map(e => e.title);
    const places = [...new Set(MOCK_EVENTS.map(e => e.location))];

    const all = [
      ...topDistricts.map(d => ({ type: "district", label: d, value: d })),
      ...topCategories.map(c => ({ type: "category", label: c, value: c })),
      ...titles.map(t => ({ type: "title", label: t, value: t })),
      ...places.map(p => ({ type: "place", label: p, value: p })),
    ];

    const term = q.trim().toLowerCase();
    const pool = term ? all.filter(s => s.label.toLowerCase().includes(term)) : all;

    // De-dup by label and limit
    const seen = new Set();
    const out = [];
    for (const s of pool) {
      if (!seen.has(s.label)) {
        seen.add(s.label);
        out.push(s);
      }
      if (out.length >= 10) break;
    }
    return out;
  }, [q]);

  // --- Suggestion actions ---
  function pickSuggestion(s) {
    if (s.type === "district") {
      setDistrict(s.value);
      setOpenSug(false);
    } else if (s.type === "category") {
      setCategory(s.value);
      setOpenSug(false);
    } else {
      // title/place → write into search box
      setQ(s.value);
      setOpenSug(false);
    }
    // keep focus on search for quick chaining
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  function onSearchKeyDown(e) {
    if (!openSug || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHi(h => (h + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi(h => (h <= 0 ? suggestions.length - 1 : h - 1)); }
    else if (e.key === "Enter") {
      if (hi >= 0) { e.preventDefault(); pickSuggestion(suggestions[hi]); }
    } else if (e.key === "Escape") {
      setOpenSug(false);
    }
  }

  // close popup only when focus leaves the input + popup group
  function onBlurWrap(e) {
    const next = e.relatedTarget;
    if (next && sugWrapRef.current?.contains(next)) return;
    setOpenSug(false);
  }

  // KPI line
  const kpiNote = `${events.length} event${events.length !== 1 ? "s" : ""} found`;

  return (
    <div style={page}>
      <h1 style={{ margin: "8px 0 14px" }}>Upcoming Events</h1>

      {/* Filters row */}
      <div style={filters}>
        {/* Search with autosuggest */}
        <div style={{ position: "relative" }} ref={sugWrapRef} onBlur={onBlurWrap}>
          <input
            ref={searchRef}
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpenSug(true); setHi(-1); }}
            onFocus={() => setOpenSug(true)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search by name, place…"
            style={input}
            aria-autocomplete="list"
            aria-expanded={openSug}
          />
          {openSug && suggestions.length > 0 && (
            <ul style={popup}>
              {suggestions.map((s, i) => (
                <li
                  key={s.type + s.label}
                  tabIndex={-1}
                  onMouseDown={(e) => { e.preventDefault(); pickSuggestion(s); }}
                  onMouseEnter={() => setHi(i)}
                  style={i === hi ? itemActive : item}
                >
                  <span style={{ width: 22, display: "inline-block" }}>
                    {s.type === "district" ? "📍" : s.type === "category" ? "🏷️" : s.type === "place" ? "🗺️" : "🎫"}
                  </span>
                  <span>{s.label}</span>
                  <span style={chip}>
                    {s.type === "district" ? "District" :
                     s.type === "category" ? "Category" :
                     s.type === "place" ? "Place" : "Event"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <select value={district} onChange={(e) => setDistrict(e.target.value)} style={select}>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)} style={select}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={select} />

        <label style={checkWrap}>
          <input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} />
          <span>Upcoming only</span>
        </label>
      </div>

      {/* KPI line */}
      <div style={kpis}>
        <span><strong>{kpiNote}</strong></span>
        {month && <span>• Month: <strong>{month}</strong></span>}
        {district !== "All districts" && <span>• District: <strong>{district}</strong></span>}
        {category !== "All categories" && <span>• Category: <strong>{category}</strong></span>}
      </div>

      {/* Cards grid */}
      <div style={grid}>
        {events.map(e => <EventCard key={e.id} ev={e} />)}
        {events.length === 0 && (
          <div style={empty}>
            No events match these filters. Try clearing month or changing district.
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ ev }) {
  const d = new Date(ev.date);
  const nice = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const daysLeft = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <article style={card}>
      <div style={thumbWrap}>
        <img src={ev.image} alt={ev.title} style={thumb} />
        <span style={categoryBadge}>{ev.category}</span>
      </div>
      <div style={{ padding: 12 }}>
        <h3 style={{ margin: "0 0 4px" }}>{ev.title}</h3>
        <div style={meta}>
          <span>📍 {ev.location}</span>
          <span>🗓️ {nice}</span>
        </div>
        <p style={blurb}>{ev.blurb}</p>

        <div style={footerRow}>
          <span style={districtPill}>{ev.district}</span>
          <span style={countdown(daysLeft)}>{daysLeft >= 0 ? `${daysLeft}d to go` : "Ended"}</span>
        </div>
      </div>
    </article>
  );
}

/** ---- styles ---- */
const page = { maxWidth: 1180, margin: "0 auto", padding: "6px 12px 24px" };
const filters = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr 1fr 0.9fr auto",
  gap: 8,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  alignItems: "center",
};
const input = { padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" };
const select = { ...input };
const checkWrap = { display: "flex", alignItems: "center", gap: 6, color: "#374151", fontSize: 14 };

const popup = { position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", boxShadow: "0 8px 20px rgba(0,0,0,0.06)", zIndex: 20, maxHeight: 280, overflowY: "auto" };
const item  = { padding: "10px 10px", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 };
const itemActive = { ...item, background: "#F3F4F6" };
const chip = { marginLeft: "auto", fontSize: 12, background: "#F3F4F6", border: "1px solid #E5E7EB", padding: "2px 8px", borderRadius: 999, color: "#374151" };

const kpis = { margin: "10px 2px 6px", color: "#4b5563", display: "flex", gap: 12, alignItems: "center" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 };

const card = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" };
const thumbWrap = { position: "relative", height: 150, overflow: "hidden" };
const thumb = { width: "100%", height: "100%", objectFit: "cover" };
const categoryBadge = { position: "absolute", top: 8, left: 8, background: "rgba(17,24,39,0.8)", color: "#fff", fontSize: 12, padding: "4px 8px", borderRadius: 999 };
const meta = { display: "flex", flexDirection: "column", gap: 2, color: "#4b5563", fontSize: 14 };
const blurb = { color: "#6b7280", fontSize: 14, margin: "6px 0 10px" };
const footerRow = { display: "flex", alignItems: "center", justifyContent: "space-between" };
const districtPill = { fontSize: 12, padding: "4px 8px", borderRadius: 999, background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" };
const countdown = (days) => ({ fontSize: 12, padding: "4px 8px", borderRadius: 999, background: days >= 0 ? "#ECFDF5" : "#F3F4F6", color: days >= 0 ? "#065F46" : "#6B7280", border: `1px solid ${days >= 0 ? "#A7F3D0" : "#E5E7EB"}` });
const empty = { gridColumn: "1 / -1", padding: 24, textAlign: "center", color: "#6b7280", border: "1px dashed #e5e7eb", borderRadius: 12, background: "#fff" };
