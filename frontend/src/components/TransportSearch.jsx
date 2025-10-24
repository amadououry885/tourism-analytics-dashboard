import React, { useEffect, useMemo, useRef, useState } from "react";

function useAutosuggest(all, exclude) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const list = useMemo(() => {
    const filtered = all
      .filter((p) => !exclude || p !== exclude)
      .filter((p) => p.toLowerCase().includes(q.trim().toLowerCase()));
    return filtered.slice(0, 8);
  }, [all, exclude, q]);

  useEffect(() => {
    if (!open) setIdx(0);
  }, [open]);

  return { open, setOpen, q, setQ, list, idx, setIdx };
}

export default function TransportSearch({ places, value, onChange, insideKedahList }) {
  const from = value.from || "";
  const to = value.to || "";
  const fromRef = useRef(null);
  const toRef = useRef(null);

  const fromSug = useAutosuggest(places, null);
  const toSug = useAutosuggest(places, from);

  // Show suggestions immediately on focus
  const openOnFocus = (s) => () => s.setOpen(true);

  const handleKey = (s, setField) => (e) => {
    if (!s.open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      s.setIdx((i) => Math.min(i + 1, s.list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      s.setIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = s.list[s.idx];
      if (pick) {
        setField(pick);
        s.setOpen(false);
      }
    } else if (e.key === "Escape") {
      s.setOpen(false);
    }
  };

  const setFrom = (v) => onChange({ from: v, to });
  const setTo = (v) => onChange({ from, to: v });

  const pill = (label, color) => (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        background: color,
        color: "#111827",
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );

  const isKedah = (p) => insideKedahList.includes(p);

  let typeHint = null;
  if (from && to) {
    const fromIn = isKedah(from);
    const toIn = isKedah(to);
    if (fromIn && toIn) typeHint = pill("Intra-Kedah", "#86efac");
    else if (!fromIn && toIn) typeHint = pill("Coming to Kedah", "#93c5fd");
    else if (fromIn && !toIn) typeHint = pill("Leaving Kedah", "#fca5a5");
  }

  return (
    <div
      style={{
        padding: "12px",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 24, // 💥 more horizontal spacing between From and To
          flexWrap: "wrap",
        }}
      >
        {/* From */}
        <div style={{ flex: 1, position: "relative", minWidth: "250px" }}>
          <label style={{ fontSize: 12, color: "#64748b" }}>From</label>
          <input
            ref={fromRef}
            value={fromSug.q || from}
            onChange={(e) => {
              fromSug.setQ(e.target.value);
              setFrom(e.target.value);
            }}
            onFocus={openOnFocus(fromSug)}
            onBlur={() => setTimeout(() => fromSug.setOpen(false), 100)}
            onKeyDown={handleKey(fromSug, setFrom)}
            placeholder="Start typing a place..."
            aria-autocomplete="list"
            aria-expanded={fromSug.open}
            className="transport-input"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              outline: "none",
              marginTop: 4,
            }}
          />
          {fromSug.open && fromSug.list.length > 0 && (
            <ul
              className="transport-suggest"
              style={{ top: "calc(100% + 6px)" }}
              role="listbox"
            >
              {fromSug.list.map((p, i) => (
                <li
                  key={p}
                  role="option"
                  aria-selected={i === fromSug.idx}
                  onMouseDown={() => {
                    setFrom(p);
                    fromSug.setOpen(false);
                  }}
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* To */}
        <div style={{ flex: 1, position: "relative", minWidth: "250px" }}>
          <label style={{ fontSize: 12, color: "#64748b" }}>To</label>
          <input
            ref={toRef}
            value={toSug.q || to}
            onChange={(e) => {
              toSug.setQ(e.target.value);
              setTo(e.target.value);
            }}
            onFocus={openOnFocus(toSug)}
            onBlur={() => setTimeout(() => toSug.setOpen(false), 100)}
            onKeyDown={handleKey(toSug, setTo)}
            placeholder={`Where to?${from ? "" : " (choose From first if you like)"}`}
            aria-autocomplete="list"
            aria-expanded={toSug.open}
            className="transport-input"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              outline: "none",
              marginTop: 4,
            }}
          />
          {toSug.open && toSug.list.length > 0 && (
            <ul
              className="transport-suggest"
              style={{ top: "calc(100% + 6px)" }}
              role="listbox"
            >
              {toSug.list.map((p, i) => (
                <li
                  key={p}
                  role="option"
                  aria-selected={i === toSug.idx}
                  onMouseDown={() => {
                    setTo(p);
                    toSug.setOpen(false);
                  }}
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Route type pill */}
        {typeHint && (
          <div style={{ marginTop: "28px", marginLeft: "8px", flexShrink: 0 }}>
            {typeHint}
          </div>
        )}
      </div>
    </div>
  );
}
