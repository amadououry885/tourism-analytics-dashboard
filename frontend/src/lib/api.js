// Small helper so every widget builds the same querystring.
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

export function qs(params = {}) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  });
  return p.toString();
}

export async function getJSON(path, params = {}) {
  const url = `${API_BASE}${path}${Object.keys(params).length ? `?${qs(params)}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}
