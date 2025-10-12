import React, { useState } from "react";
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

export default function ReportExport({ dateFrom, dateTo }) {
  const [busy, setBusy] = useState(false);
  const [fmt, setFmt] = useState("csv");

  async function handleExport() {
    setBusy(true);
    try {
      const url = `${API_BASE}/reports?date_from=${dateFrom}&date_to=${dateTo}&format=${fmt}`;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = `report_${dateFrom}_${dateTo}.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      alert("Export failed: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="card-title">Export Report</div>
      <select value={fmt} onChange={(e) => setFmt(e.target.value)}>
        <option value="csv">CSV</option>
        <option value="pdf">PDF</option>
      </select>
      <button onClick={handleExport} disabled={busy}>{busy ? "Exporting…" : "Download"}</button>
    </div>
  );
}
