Endpoint-Aware Hybrid Mode (Frontend ↔ Backend)
✅ Main idea

Do not invent endpoints. Reuse what already exists in the repo. Only if nothing is found, probe the backend (schema/OPTIONS) to confirm a candidate. Keep demo data; add live fetch; API wins on merge; fallback to demo on error.

1) Endpoint discovery order (Copilot must follow)

Reuse existing API layer

Look for a central client: src/lib/api.ts, src/api/client.ts, src/services/*, or an Axios instance (e.g., apiClient, http, axios.create({...})).

Prefer calling existing helpers like getVendors, listEvents, fetchStays instead of writing new fetch().

Reuse existing fetch calls/constants

Search the codebase for "/api/" or VITE_API_BASE.

If a page already fetches something similar, import and reuse that exact endpoint/utility.

Read backend router/urls

Inspect backend/**/urls.py, backend/**/routers.py, backend/**/views.py.

For DefaultRouter.register("vendors", VendorViewSet, basename="vendor") → base path is /api/vendors/.

Respect any app_name, prefix, or include() nesting.

Query the schema (non-destructive)

If available, read OpenAPI/DRF schema:

/api/schema/ or /api/schema/?format=openapi or /schema/

Build paths from the schema’s paths keys.

Verify with OPTIONS (no data mutation)

If still uncertain, send an OPTIONS request to a candidate path to confirm it exists and supports GET.

Only then proceed to use it.

If none of the above work, stop and leave a // TODO: endpoint unresolved comment rather than inventing a path.

2) Shared helpers (add once)

Create frontend/src/lib/hybrid.ts and make Copilot use these:

export const API_BASE = (import.meta as any).env.VITE_API_BASE || "/api";

export function buildUrlWithParams(base: string, params: Record<string, any>) {

3) Endpoints (add incrementally)

// Rankings - Top Points of Interest (POIs)
Resource: GET /api/rankings/top-pois
Parameters:
  - city (string, optional): Filter POIs by city
  - q (string, optional): Search query for POI names/descriptions
  - category (string, optional): Filter by POI category
Demo Data: src/data/destinations.demo.json
Cache Key: item => `${item.name}|${item.city}`
Example Usage:
```typescript
import { fetchTopPOIs } from '../lib/api';

// Fetch with parameters
const pois = await fetchTopPOIs({ 
  city: 'Kuala Lumpur',
  category: 'attractions',
  q: 'museum'
});
```
  const u = new URL(base, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || v === "all") return;
    u.searchParams.set(k, String(v));
  });
  return u.pathname + "?" + u.searchParams.toString();
}

export function arrayOrResults<T>(data: any): T[] {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export function dedupePreferApi<T>(apiList: T[], demoList: T[], makeKey: (t: T) => string) {
  const seen = new Set(apiList.map(makeKey));
  const onlyDemo = demoList.filter((d) => !seen.has(makeKey(d)));
  return [...apiList, ...onlyDemo];
}

// ---------- Endpoint discovery utilities ----------
async function tryOptions(url: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const r = await fetch(url, { method: "OPTIONS", signal });
    return r.ok;
  } catch {
    return false;
  }
}

// Read schema (optional, if your backend exposes it)
export async function getSchemaPaths(signal?: AbortSignal): Promise<string[]> {
  for (const path of ["/api/schema/?format=openapi", "/api/schema/", "/schema/"]) {
    try {
      const r = await fetch(path, { signal });
      if (!r.ok) continue;
      const json = await r.json();
      // OpenAPI 3.x shape
      if (json?.paths && typeof json.paths === "object") {
        return Object.keys(json.paths);
      }
    } catch {}
  }
  return [];
}

/**
 * Resolve an endpoint for a known resource name WITHOUT guessing.
 * 1) Prefer imported API functions/constants you already have.
 * 2) Else, consult OpenAPI schema.
 * 3) Else, probe common patterns via OPTIONS and only accept if confirmed.
 */
export async function resolveEndpoint(resource: string, signal?: AbortSignal): Promise<string | null> {
  // 1) If the module has an exported constant (developer can wire this up):
  //    e.g., export const ENDPOINT_VENDORS = `${API_BASE}/vendors/`;
  //    Copilot: search for "ENDPOINT_" + resource.toUpperCase()
  // (This is a convention hook; if not present, continue.)

  // 2) Check schema for a matching path
  const paths = await getSchemaPaths(signal);
  const candid = paths.find(p =>
    p.includes(resource) && (p.endsWith("/") || p.match(/\/?$/))
  );
  if (candid) return candid;

  // 3) Probe a few safe candidates with OPTIONS (non-destructive)
  const candidates = [
    `${API_BASE}/${resource}/`,
    `${API_BASE}/${resource}`,
    `${API_BASE}/rankings/${resource}/`,
    `${API_BASE}/analytics/${resource}/`,
  ];
  for (const c of candidates) {
    if (await tryOptions(c, signal)) return c;
  }
  return null;
}


Copilot: import and reuse existing getVendors/listEvents if found. Only call resolveEndpoint(resource) when no existing API helper is present.

3) Per-page header (what Copilot must read & obey)

At the top of each page you wire, add this block and fill placeholders:

// HYBRID MODE (STRICT ENDPOINT POLICY):
// 1) Reuse existing API helpers/constants if present in the repo.
// 2) Else resolve endpoint via schema/OPTIONS using resolveEndpoint(resource).
// 3) Never invent endpoints. If unresolved, leave a TODO and keep demo only.
// Page-specific info:
//  - Resource key: "vendors" | "events" | "stays" | "social-posts" | "transport/routes" | "rankings/top-pois" | "analytics/summary" | "analytics/timeseries"
//  - Params from filters: { ...fill for this page... }
//  - Demo source: import demoList from "@/data/<page>.demo.json"
//  - Unique key function: item => "<unique|key>"
//  - Merge rule: API wins; fallback to demo on error.

4) Data effect pattern (Copilot should generate this)
import { useEffect, useState } from "react";
import { API_BASE, buildUrlWithParams, arrayOrResults, dedupePreferApi, resolveEndpoint } from "@/lib/hybrid";
import demoList from "@/data/REPLACE_ME.demo.json";

type Item = any; // keep your actual type

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // your existing filters...
  // const [city, setCity] = useState("all"); etc.

  const makeKey = (x: Item) => "REPLACE|UNIQUE|KEY";

  function filterDemo(list: Item[]) {
    // apply SAME filters as params (city/q/date etc.)
    return list;
  }

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      try {
        // 1) Prefer existing API helper if present (Copilot: search & reuse).
        //    e.g., import { listEvents } from "@/api/events"; const apiList = await listEvents(params, ctrl.signal);

        // 2) Else resolve endpoint safely:
        const ep = await resolveEndpoint("REPLACE_RESOURCE", ctrl.signal);
        if (!ep) {
          console.warn("Endpoint unresolved for resource: REPLACE_RESOURCE. Using demo only.");
          setItems(filterDemo(demoList as Item[]));
          setNotice("Using demo data (endpoint unresolved).");
          return;
        }

        const url = buildUrlWithParams(ep.startsWith("/api") ? ep : `${API_BASE}/${ep.replace(/^\/+/, "")}`, {
          /* page filters here */
        });

        const r = await fetch(url, { signal: ctrl.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        const apiList = arrayOrResults<Item>(json);

        const merged = dedupePreferApi(apiList, filterDemo(demoList as Item[]), makeKey);
        setItems(merged);
        setNotice(null);
      } catch (e: any) {
        setItems(filterDemo(demoList as Item[]));
        setNotice("Using demo data (API unavailable).");
        console.warn("API error:", e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [/* filters here */]);

  // render your existing UI with `items`
  return (
    <>
      {notice && <div className="text-amber-300/80 text-sm mb-2">{notice}</div>}
      {/* keep existing components; just feed them `items` */}
    </>
  );
}

5) Copilot prompts to use inside files

“Reuse existing API client or helpers if present; otherwise resolve endpoint via resolveEndpoint("<resource>"). Never guess.”

“Wire hybrid fetch+merge: API overrides demo; fallback to demo if endpoint unresolved or fetch fails.”

“Apply the same filters to demo and API; accept array or {results}. Use AbortController.”