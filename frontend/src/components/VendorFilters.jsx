// src/components/VendorFilters.jsx
import React, { useMemo, useRef, useState } from "react";

export default function VendorFilters({ onFilter, vendors = [] }) {
  const [place, setPlace] = useState("");
  const [food,  setFood]  = useState("");

  // popup state
  const [openPlace, setOpenPlace] = useState(false);
  const [openFood,  setOpenFood]  = useState(false);
  const [hiPlace,   setHiPlace]   = useState(-1);
  const [hiFood,    setHiFood]    = useState(-1);

  // refs
  const containerRef = useRef(null);
  const foodRef      = useRef(null);

  // aggregate (places & cuisines)
  const { topPlaces, topOverallCuisines, cuisinesByCityLC } = useMemo(() => {
    const placeFreq = new Map();
    const cuisineAll = new Map();
    const byCity = new Map(); // city lc -> Map(cuisine->count)

    vendors.forEach(v => {
      const city = (v.city || "").trim();
      if (city) placeFreq.set(city, (placeFreq.get(city) || 0) + 1);

      (v.cuisines || []).forEach(c => {
        const cz = (c || "").trim();
        if (!cz) return;
        cuisineAll.set(cz, (cuisineAll.get(cz) || 0) + 1);
        if (city) {
          const key = city.toLowerCase();
          if (!byCity.has(key)) byCity.set(key, new Map());
          const m = byCity.get(key);
          m.set(cz, (m.get(cz) || 0) + 1);
        }
      });
    });

    const toSorted = (m) => [...m.entries()].sort((a,b)=>b[1]-a[1]).map(([k])=>k);
    return {
      topPlaces: toSorted(placeFreq),
      topOverallCuisines: toSorted(cuisineAll),
      cuisinesByCityLC: byCity,
    };
  }, [vendors]);

  // place suggestions (show on focus)
  const placeSuggestions = useMemo(() => {
    const q = place.trim().toLowerCase();
    if (!q) return topPlaces.slice(0, 8);
    return topPlaces.filter(p => p.toLowerCase().includes(q)).slice(0, 8);
  }, [place, topPlaces]);

  // food suggestions (place-aware, show on focus)
  const foodSuggestions = useMemo(() => {
    const q = food.trim().toLowerCase();
    const p = place.trim().toLowerCase();

    let base = topOverallCuisines;
    if (p) {
      const merged = new Map();
      const matches = [...cuisinesByCityLC.keys()].filter(c => c.includes(p));
      if (matches.length) {
        matches.forEach(c => {
          cuisinesByCityLC.get(c).forEach((cnt, k) => merged.set(k, (merged.get(k) || 0) + cnt));
        });
        base = [...merged.entries()].sort((a,b)=>b[1]-a[1]).map(([k])=>k);
      }
    }
    if (!q) return base.slice(0, 8);
    return base.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [food, place, topOverallCuisines, cuisinesByCityLC]);

  // actions
  function handleSearch(e) {
    e?.preventDefault();
    onFilter({ place, food });
    setOpenPlace(false);
    setOpenFood(false);
  }
  function pickPlace(s) {
    setPlace(s);
    setOpenPlace(false);
    onFilter({ place: s, food });                // run search immediately
    requestAnimationFrame(() => foodRef.current?.focus()); // focus food next
  }
  function pickFood(s) {
    setFood(s);
    setOpenFood(false);
    onFilter({ place, food: s });                // run search immediately
  }

  // input handlers + keyboard
  function onPlaceChange(e){ setPlace(e.target.value); setOpenPlace(true); setHiPlace(-1); }
  function onFoodChange(e){ setFood(e.target.value); if (place.trim()) setOpenFood(true); setHiFood(-1); }

  function onPlaceKeyDown(e){
    if (!openPlace || placeSuggestions.length === 0) return;
    if (e.key === "ArrowDown"){ e.preventDefault(); setHiPlace(h => (h + 1) % placeSuggestions.length); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); setHiPlace(h => (h <= 0 ? placeSuggestions.length - 1 : h - 1)); }
    else if (e.key === "Enter"){
      if (hiPlace >= 0){ e.preventDefault(); pickPlace(placeSuggestions[hiPlace]); }
      else handleSearch(e);
    } else if (e.key === "Escape"){ setOpenPlace(false); }
  }
  function onFoodKeyDown(e){
    if (!openFood || foodSuggestions.length === 0) return;
    if (e.key === "ArrowDown"){ e.preventDefault(); setHiFood(h => (h + 1) % foodSuggestions.length); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); setHiFood(h => (h <= 0 ? foodSuggestions.length - 1 : h - 1)); }
    else if (e.key === "Enter"){
      if (hiFood >= 0){ e.preventDefault(); pickFood(foodSuggestions[hiFood]); }
      else handleSearch(e);
    } else if (e.key === "Escape"){ setOpenFood(false); }
  }

  // only close popups when focus leaves the whole container
  function handleBlur(e){
    const next = e.relatedTarget;
    if (next && containerRef.current?.contains(next)) return;
    setOpenPlace(false);
    setOpenFood(false);
  }

  return (
    <form onSubmit={handleSearch} style={wrap}>
      <div
        ref={containerRef}
        onBlur={handleBlur}
        tabIndex={-1} // enables relatedTarget on blur for the wrapper
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <h3 style={title}>Find Restaurants</h3>

        {/* PLACE */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Enter place (required)"
            value={place}
            onChange={onPlaceChange}
            onKeyDown={onPlaceKeyDown}
            onFocus={() => setOpenPlace(true)}
            style={input}
            required
            aria-autocomplete="list"
            aria-expanded={openPlace}
          />
          {openPlace && placeSuggestions.length > 0 && (
            <ul style={popup}>
              {placeSuggestions.map((s, i) => (
                <li
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); pickPlace(s); }}
                  onMouseEnter={() => setHiPlace(i)}
                  style={i === hiPlace ? itemActive : item}
                >
                  📍 {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* FOOD (disabled until place) */}
        <div style={{ position: "relative" }}>
          <input
            ref={foodRef}
            type="text"
            placeholder={place.trim() ? "Search food (optional)" : "Enter a place first"}
            value={food}
            onChange={onFoodChange}
            onKeyDown={onFoodKeyDown}
            onFocus={() => place.trim() && setOpenFood(true)}
            style={{ ...input, background: place.trim() ? "#fff" : "#f9fafb" }}
            aria-autocomplete="list"
            aria-expanded={openFood}
            disabled={!place.trim()}
          />
          {openFood && place.trim() && foodSuggestions.length > 0 && (
            <ul style={popup}>
              {foodSuggestions.map((s, i) => (
                <li
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); pickFood(s); }}
                  onMouseEnter={() => setHiFood(i)}
                  style={i === hiFood ? itemActive : item}
                >
                  🍽️ {s}
                  <span style={hint}>{place?.trim() ? ` • in ${place}` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" style={button}>Search</button>
      </div>
    </form>
  );
}

/* styles */
const wrap  = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 };
const title = { margin: "0 0 6px 0", fontWeight: 600 };
const input = { padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14 };
const button= { marginTop: 4, padding: "8px 10px", borderRadius: 8, border: "none", background: "#111827", color: "#fff", fontWeight: 500, cursor: "pointer" };

const popup = { position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", boxShadow: "0 8px 20px rgba(0,0,0,0.06)", zIndex: 20, maxHeight: 220, overflowY: "auto" };
const item  = { padding: "8px 10px", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 };
const itemActive = { ...item, background: "#F3F4F6" };
const hint  = { fontSize: 12, color: "#6b7280", marginLeft: 6 };
