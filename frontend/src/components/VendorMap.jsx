// src/components/VendorMap.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const minLat = 5.5, maxLat = 6.7;
const minLon = 99.4, maxLon = 100.9;

function project(lat, lon, width, height) {
  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * height;
  return [x, y];
}

export default function VendorMap({ vendors = [] }) {
  const boxRef = useRef(null);
  const { width, height } = useBoxSize(boxRef, { minW: 300, minH: 300, ratio: 1 });
  const [zoom, setZoom] = useState(1);

  const radius = useMemo(() => {
    const counts = vendors.map(v => Array.isArray(v.cuisines) ? v.cuisines.length : 0);
    const max = Math.max(1, ...counts);
    return (v) => {
      const n = Array.isArray(v.cuisines) ? v.cuisines.length : 0;
      return 6 + (10 * n) / max; // 6..16
    };
  }, [vendors]);

  return (
    <div ref={boxRef} style={panelStyle}>
      <div style={panelHeader}>
        <div style={{ fontWeight: 600 }}>Vendor Map</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setZoom(z => Math.min(2.5, +(z + 0.2).toFixed(1)))} style={btnStyle}>+</button>
          <button onClick={() => setZoom(z => Math.max(1, +(z - 0.2).toFixed(1)))} style={btnStyle}>−</button>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fafafa" }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid slice"
          style={{ display: "block", borderRadius: 10 }}
        >
          <rect x="0" y="0" width={width} height={height} fill="#f3f4f6" />
          <g transform={`translate(${width/2} ${height/2}) scale(${zoom}) translate(${-width/2} ${-height/2})`}>
            {vendors.filter(v => Number.isFinite(v.lat) && Number.isFinite(v.lon)).map(v => {
              const [x, y] = project(v.lat, v.lon, width, height);
              return (
                <g key={v.id ?? `${v.lat},${v.lon}`} transform={`translate(${x},${y})`} cursor="pointer">
                  <title>{`${v.name} — ${v.city}\n${(v.cuisines || []).join(", ") || "—"}`}</title>
                  <circle r={radius(v)} fill="rgba(31,41,55,0.25)" stroke="#111827" strokeWidth="0.5" />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
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

const panelStyle = { display: "flex", flexDirection: "column", border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: "#fff", height: "100%", minHeight: 360 };
const panelHeader = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 10px" };
const btnStyle = { background: "#111827", color: "#fff", border: "1px solid #111827", borderRadius: 8, padding: "2px 8px", fontSize: 14, cursor: "pointer" };
