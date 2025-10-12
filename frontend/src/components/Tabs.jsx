import React from "react";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: active === t.key ? "2px solid #2563eb" : "1px solid #e5e7eb",
              background: active === t.key ? "#eff6ff" : "#fff",
              fontWeight: active === t.key ? 600 : 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
