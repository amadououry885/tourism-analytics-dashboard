import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

// Kedah / Langkawi bbox (same as MapHeat)
const minLat = 5.5, maxLat = 6.7;
const minLon = 99.4, maxLon = 100.9;

// project lat/lon -> [x,y] inside a given width/height box
function project(lat, lon, width, height) {
  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * height;
  return [x, y];
}

export default function VendorMap({ dateFrom, dateTo }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1); // simple zoom
  const [error, setError] = useState(null);
  const boxRef = useRef(null);

  // Compute a safe size for the SVG
  const { width, height } = useBoxSize(boxRef, { minW: 300, minH: 300, ratio: 1 });

  // scale for bubble radius (based on mentions)
  const radius = useMemo(() => {
    const counts = data.map(d => d.mentions || 0);
    const max = Math.max(10, ...counts);
    // scale: 4..24 px
    return (v) => 4 + (20 * (v || 0)) / max;
  }, [data]);

  useEffect(() => {
    let abort = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Build query — default last 30 days if not provided
        const params = new URLSearchParams();
        if (dateFrom) params.set("date_from", dateFrom);
        if (dateTo)   params.set("date_to", dateTo);
        params.set("limit", "200"); // cap

        const url = `${API_BASE}/tabs/vendors?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Expected shape: { items: [...] } OR [...] — handle both
        const items = Array.isArray(json) ? json : (json.items || []);
        // Keep only vendors with coords
        const withCoords = items.filter(v => Number.isFinite(v.lat) && Number.isFinite(v.lon));

        if (!abort) setData(withCoords);
      } catch (e) {
        if (!abort) setError(e.message || "Failed to load");
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => { abort = true; };
  }, [dateFrom, dateTo]);

  return (
    <div ref={boxRef} style={panelStyle}>
      <div style={panelHeader}>
        <div style={{ fontWeight: 600 }}>Map</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setZoom(z => Math.min(2.5, +(z + 0.2).toFixed(1)))} style={btnStyle}>+</button>
          <button onClick={() => setZoom(z => Math.max(1, +(z - 0.2).toFixed(1)))} style={btnStyle}>−</button>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fafafa" }}>
        {loading && <div style={overlay}>Loading…</div>}
        {error && <div style={overlayErr}>Error: {error}</div>}

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid slice"
          style={{ display: "block", borderRadius: 10 }}
        >
          {/* background grid */}
          <rect x="0" y="0" width={width} height={height} fill="#f3f4f6" />
          <g transform={`translate(${width/2} ${height/2}) scale(${zoom}) translate(${-width/2} ${-height/2})`}>
            {/* circles for each vendor */}
            {data.map(v => {
              const [x, y] = project(v.lat, v.lon, width, height);
              return (
                <g key={v.id || `${v.lat},${v.lon}`} transform={`translate(${x},${y})`} cursor="pointer">
                  <title>{`${v.name || "Vendor"}\n${v.mentions || 0} mentions`}</title>
                  <circle r={radius(v.mentions)} fill="rgba(31, 41, 55, 0.25)" stroke="#111827" strokeWidth="0.5" />
                </g>
              );
            })}
          </g>
        </svg>

        {/* legend */}
        <div style={legendStyle}>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Mentions</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LegendDot size={8} label="Low" />
            <LegendDot size={14} label="Med" />
            <LegendDot size={20} label="High" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ size, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={size/2} fill="rgba(31,41,55,0.25)" stroke="#111827" strokeWidth="0.5" />
      </svg>
      <span style={{ fontSize: 12, color: "#374151" }}>{label}</span>
    </div>
  );
}

function useBoxSize(ref, { minW = 320, minH = 320, ratio = 1 } = {}) {
  const [size, setSize] = useState({ width: 400, height: 400 });

  useEffect(() => {
    function handle() {
      const el = ref.current;
      if (!el) return;
      const w = Math.max(minW, el.clientWidth);
      const h = Math.max(minH, Math.round(w / ratio));
      setSize({ width: w, height: h });
    }
    handle();
    const obs = new ResizeObserver(handle);
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, minW, minH, ratio]);

  return size;
}

// styles
const panelStyle = {
  display: "flex",
  flexDirection: "column",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 10,
  background: "#fff",
  height: "100%",
  minHeight: 360,
};

const panelHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "4px 6px 10px",
};

const btnStyle = {
  background: "#111827",
  color: "#fff",
  border: "1px solid #111827",
  borderRadius: 8,
  padding: "2px 8px",
  fontSize: 14,
  cursor: "pointer",
};

const overlay = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  color: "#374151",
  zIndex: 1,
};

const overlayErr = { ...overlay, color: "#b91c1c" };

const legendStyle = {
  position: "absolute",
  right: 10,
  bottom: 10,
  background: "rgba(255,255,255,0.9)",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "6px 8px",
};
