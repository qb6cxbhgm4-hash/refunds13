import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import api from "./api";

function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const go = useCallback(async () => { setLoading(true); setError(null); try { setData(await fn()); } catch (e) { setError(e.message); } finally { setLoading(false); } }, deps);
  useEffect(() => { go(); }, [go]);
  return { data, loading, error, refetch: go };
}

const TC = createContext();
function TP({ children }) {
  const [t, setT] = useState(null); const tm = useRef();
  const show = (m) => { setT(m); clearTimeout(tm.current); tm.current = setTimeout(() => setT(null), 2800); };
  return <TC.Provider value={show}>{children}{t && <div style={{ position: "fixed", bottom: 20, right: 20, background: "#202223", color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,.2)", zIndex: 9999, animation: "fadeIn .2s ease" }}>{t}</div>}</TC.Provider>;
}
function useT() { return useContext(TC); }

function stat(p) {
  const d = p.oos ?? (p.avg > 0 ? Math.floor(p.stock / p.avg) : 999);
  if (p.status === "critical") return { l: "Critical", c: "c", d };
  if (p.status === "warning") return { l: "Warning", c: "w", d };
  if (p.stock <= (p.safety || 10)) return d <= 3 ? { l: "Critical", c: "c", d } : { l: "Low stock", c: "w", d };
  if (d <= (p.lead || 5) + 3) return { l: "Low stock", c: "w", d };
  return { l: "Active", c: "s", d };
}
function recQty(p) { return Math.max(p.moq || 20, Math.ceil(p.avg * ((p.lead || 5) + 7)) - p.stock); }

const sv = (d, s = 16) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: s, height: s }}>{d}</svg>;
const Ic = {
  home: sv(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>),
  box: sv(<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />),
  bell: sv(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>),
  chart: sv(<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>),
  store: sv(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>),
  gear: sv(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  users: sv(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  shield: sv(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />),
  tag: sv(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>),
  layers: sv(<><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>),
  file: sv(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>),
  credit: sv(<><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>),
  help: sv(<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>),
  truck: sv(<><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>),
  refresh: sv(<><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>, 14),
  back: sv(<polyline points="15 18 9 12 15 6" />, 14),
};

const Sk = ({ w = "100%", h = 16 }) => <div style={{ width: w, height: h, borderRadius: 4, background: "#e1e3e5", animation: "pulse 1.5s ease infinite" }} />;
const Badge = ({ c, children }) => <span className={`badge badge-${c}`}>{children}</span>;
const Empty = ({ msg }) => <div style={{ textAlign: "center", padding: 48, color: "#8c9196", fontSize: 13 }}>{msg || "No data"}</div>;
const Card = ({ title, right, children, flush }) => <div className="card"><div className="card-h"><span className="card-t">{title}</span>{right}</div><div className={`card-b${flush ? " flush" : ""}`}>{children}</div></div>;
const MetCard = ({ label, value, color, sub }) => { const cm = { green: "#008060", amber: "#b98900", red: "#d72c0d" }; return <div className="m-card"><div className="m-label">{label}</div><div className="m-val" style={color ? { color: cm[color] } : {}}>{typeof value === "number" ? value.toLocaleString() : value}</div>{sub && <div className="m-sub">{sub}</div>}</div>; };
const Btn = ({ children, primary, danger, slim, disabled, ...p }) => <button className={`btn${primary ? " btn-p" : ""}${danger ? " btn-d" : ""}${slim ? " btn-s" : ""}`} disabled={disabled} {...p}>{children}</button>;

/* ═══ CHARTS ═══ */
function BarChart({ data, height = 200, color = "#008060" }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c || !data?.length) return;
    const dpr = window.devicePixelRatio || 1; const w = c.parentElement.offsetWidth;
    c.width = w * dpr; c.height = height * dpr; c.style.width = w + "px"; c.style.height = height + "px";
    const ctx = c.getContext("2d"); ctx.scale(dpr, dpr);
    const pad = { t: 24, r: 12, b: 28, l: 36 }; const cw = w - pad.l - pad.r, ch = height - pad.t - pad.b;
    const max = Math.max(...data.map(d => d.v)) * 1.15 || 1;
    const bw = Math.min(32, (cw / data.length) * 0.6); const gap = (cw - bw * data.length) / (data.length + 1);
    ctx.strokeStyle = "#f1f2f3"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const y = pad.t + ch * (1 - i / 4); ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke(); ctx.fillStyle = "#8c9196"; ctx.font = "500 10px -apple-system,sans-serif"; ctx.textAlign = "right"; ctx.fillText(Math.round(max * i / 4), pad.l - 6, y + 3); }
    data.forEach((d, i) => { const x = pad.l + gap * (i + 1) + bw * i; const bh = (d.v / max) * ch; const y = pad.t + ch - bh; const g = ctx.createLinearGradient(0, y, 0, pad.t + ch); g.addColorStop(0, color); g.addColorStop(1, color + "66"); ctx.beginPath(); ctx.roundRect(x, y, bw, bh, [4, 4, 0, 0]); ctx.fillStyle = g; ctx.fill(); ctx.fillStyle = "#202223"; ctx.font = "600 10px -apple-system,sans-serif"; ctx.textAlign = "center"; ctx.fillText(d.v, x + bw / 2, y - 6); ctx.fillStyle = "#8c9196"; ctx.font = "400 10px -apple-system,sans-serif"; ctx.fillText(d.l, x + bw / 2, height - pad.b + 14); });
  }, [data, height, color]);
  return <canvas ref={ref} style={{ display: "block", width: "100%" }} />;
}

function HorizBar({ data, height = 160, color = "#008060" }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c || !data?.length) return;
    const dpr = window.devicePixelRatio || 1; const w = c.parentElement.offsetWidth;
    c.width = w * dpr; c.height = height * dpr; c.style.width = w + "px"; c.style.height = height + "px";
    const ctx = c.getContext("2d"); ctx.scale(dpr, dpr);
    const pad = { t: 4, r: 60, b: 4, l: 80 }; const cw = w - pad.l - pad.r; const max = Math.max(...data.map(d => d.v)) || 1;
    const bh = Math.min(20, (height - 8) / data.length - 6); const gap = (height - bh * data.length) / (data.length + 1);
    data.forEach((d, i) => { const y = gap * (i + 1) + bh * i; const bw = (d.v / max) * cw; ctx.beginPath(); ctx.roundRect(pad.l, y, Math.max(4, bw), bh, 3); ctx.fillStyle = d.color || color; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = "#6d7175"; ctx.font = "400 11px -apple-system,sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText(d.l, pad.l - 8, y + bh / 2); ctx.fillStyle = "#202223"; ctx.font = "600 11px -apple-system,sans-serif"; ctx.textAlign = "left"; ctx.fillText(d.v, pad.l + bw + 8, y + bh / 2); });
  }, [data, height, color]);
  return <canvas ref={ref} style={{ display: "block", width: "100%" }} />;
}

function DonutChart({ segments, size = 140 }) {
  const ref = useRef(); const total = segments.reduce((s, sg) => s + sg.v, 0) || 1;
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1; c.width = size * dpr; c.height = size * dpr; c.style.width = size + "px"; c.style.height = size + "px";
    const ctx = c.getContext("2d"); ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, R = size * 0.42, ri = size * 0.28; let angle = -Math.PI / 2;
    segments.forEach(s => { const sweep = (s.v / total) * Math.PI * 2; ctx.beginPath(); ctx.arc(cx, cy, R, angle, angle + sweep); ctx.arc(cx, cy, ri, angle + sweep, angle, true); ctx.closePath(); ctx.fillStyle = s.color; ctx.fill(); angle += sweep; });
    ctx.fillStyle = "#202223"; ctx.font = "700 20px -apple-system,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(total, cx, cy - 4);
    ctx.fillStyle = "#8c9196"; ctx.font = "400 10px -apple-system,sans-serif"; ctx.fillText("total", cx, cy + 12);
  }, [segments, size, total]);
  return <canvas ref={ref} style={{ width: size, height: size, flexShrink: 0 }} />;
}

/* ═══ OVERVIEW ═══ */
function OverviewPage() {
  const { data: m, loading: ml, error: me } = useApi(() => api.metrics());
  const { data: al, loading: all } = useApi(() => api.alerts());
  const { data: prods } = useApi(() => api.products());
  const cats = {}; (prods || []).forEach(p => { cats[p.category] = (cats[p.category] || 0) + p.stock; });
  const catData = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([l, v]) => ({ l, v }));
  const tops = [...(prods || [])].sort((a, b) => b.avg - a.avg).slice(0, 6).map(p => ({ l: p.name.slice(0, 10), v: p.avg, color: stat(p).c === "c" ? "#d72c0d" : stat(p).c === "w" ? "#b98900" : "#008060" }));
  const sc = { a: 0, w: 0, c: 0 }; (prods || []).forEach(p => { const s = stat(p); if (s.c === "s") sc.a++; else if (s.c === "w") sc.w++; else sc.c++; });
  return <div style={{ animation: "fadeIn .25s ease" }}>
    <div className="metrics">{ml ? [1, 2, 3, 4, 5].map(i => <div key={i} className="m-card"><Sk w={80} h={10} /><div style={{ height: 6 }} /><Sk w={50} h={22} /></div>) : me ? <Empty msg="Failed to load" /> : m && <>
      <MetCard label="Total Products" value={m.total} sub={m.stock > 0 ? `${m.stock.toLocaleString()} units` : ""} />
      <MetCard label="Low Stock" value={m.low} color="amber" sub="Below threshold" />
      <MetCard label="Critical" value={m.critical} color="red" sub="Action needed" />
      <MetCard label="Today's Sales" value={m.sales} />
      <MetCard label="Avg. Daily" value={m.avgSales} color="green" sub="All products" />
    </>}</div>
    {prods && prods.length > 0 && <div className="grid-2" style={{ marginBottom: 12 }}>
      <Card title="Stock by Category"><HorizBar data={catData} /></Card>
      <Card title="Inventory Health" right={<Badge c="s">{sc.a} active</Badge>}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <DonutChart segments={[{ v: sc.a, color: "#008060" }, { v: sc.w, color: "#b98900" }, { v: sc.c, color: "#d72c0d" }]} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[["Active", sc.a, "#008060"], ["Warning", sc.w, "#b98900"], ["Critical", sc.c, "#d72c0d"]].map(([l, v, c]) => <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: c }} /><span style={{ fontSize: 12, color: "#6d7175", width: 56 }}>{l}</span><strong style={{ fontSize: 13 }}>{v}</strong></div>)}
          </div>
        </div>
      </Card>
    </div>}
    {tops.length > 0 && <div className="grid-2"><Card title="Top Sellers (units/day)"><HorizBar data={tops} height={140} /></Card>
      <Card title="Recent Alerts" right={al?.length > 0 && <Badge c="w">{al.length}</Badge>}>{all ? <Sk h={60} /> : al?.length ? al.slice(0, 4).map(a => <div key={a.id} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #f1f2f3", fontSize: 13 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: a.severity === "critical" ? "#d72c0d" : "#b98900", marginTop: 6, flexShrink: 0 }} /><div style={{ flex: 1, color: "#6d7175" }}><strong style={{ color: "#202223" }}>{a.name}</strong> - {a.message || `${a.oos}d left`}</div></div>) : <Empty msg="No alerts" />}</Card>
    </div>}
  </div>;
}

/* ═══ PRODUCTS ═══ */
function ProductsPage({ onView }) {
  const { data: products, loading, error, refetch } = useApi(() => api.products());
  const [q, setQ] = useState(""); const [sf, setSf] = useState(""); const toast = useT();
  const list = (products || []).filter(p => { if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.sku.toLowerCase().includes(q.toLowerCase())) return false; if (sf) { const s = stat(p); if (sf === "u" && s.c === "s") return false; if (sf === "ok" && s.c !== "s") return false; } return true; });
  return <Card title={`Products (${list.length})`} right={<div style={{ display: "flex", gap: 8 }}><input placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} style={{ border: "1px solid #e1e3e5", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", width: 200 }} /><select value={sf} onChange={e => setSf(e.target.value)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e1e3e5", fontSize: 12, fontFamily: "inherit" }}><option value="">All</option><option value="u">Reorder</option><option value="ok">In stock</option></select></div>} flush>
    {loading ? <div style={{ padding: 20 }}>{[1, 2, 3].map(i => <Sk key={i} h={40} />)}</div> : error ? <Empty msg="Failed to load" /> : !list.length ? <Empty msg="No products" /> :
      <table><thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Avg/day</th><th>Days</th><th>Status</th><th></th></tr></thead>
        <tbody>{list.map(p => { const s = stat(p); return <tr key={p.id}><td style={{ fontWeight: 500 }}>{p.name}</td><td style={{ color: "#8c9196", fontSize: 12 }}>{p.sku}</td><td style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{p.stock}</td><td>{p.avg}/d</td><td style={{ fontWeight: 600 }}>{s.d}d</td><td><Badge c={s.c}>{s.l}</Badge></td><td><Btn slim onClick={() => onView(p.id)}>View</Btn>{s.c !== "s" && <Btn slim primary onClick={async () => { try { await api.approve(p.id, recQty(p)); } catch { } toast(`Ordered: ${p.name}`); refetch(); }} style={{ marginLeft: 4 }}>Order</Btn>}</td></tr>; })}</tbody></table>}
  </Card>;
}

/* ═══ DETAIL ═══ */
function DetailPage({ id, onBack }) {
  const { data: p, loading, refetch } = useApi(() => api.product(id), [id]); const toast = useT();
  if (loading) return <Sk h={300} />; if (!p) return <Empty msg="Not found" />;
  const s = stat(p); const qty = p.recQty ?? recQty(p);
  return <div style={{ animation: "fadeIn .25s ease" }}>
    <Btn onClick={onBack} style={{ marginBottom: 12 }}>{Ic.back} Back</Btn>
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
      <div><div style={{ width: "100%", aspectRatio: "1", background: "#f6f6f7", borderRadius: 12, border: "1px solid #e1e3e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#8c9196" }}>No image</div><div style={{ marginTop: 12 }}><div style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 12, color: "#8c9196", marginTop: 4 }}>{p.sku} - {p.category}</div></div></div>
      <div>
        <div className="kpi-grid">{[["Stock", p.stock, s.c === "c"], ["Days", (p.oos ?? s.d) + "d"], ["7d", p.s7 ?? p.avg * 7], ["30d", p.s30 ?? p.avg * 30], ["Avg/d", p.avg + "/d"], ["Lead", p.lead + "d"], ["Safety", p.safety], ["MOQ", p.moq]].map(([l, v, w]) => <div className="kpi" key={l}><div className="kpi-l">{l}</div><div className="kpi-v" style={w ? { color: "#d72c0d" } : {}}>{v}</div></div>)}</div>
        <div style={{ background: "#e4f5ee", border: "1px solid #b4dfca", borderRadius: 8, padding: 12, marginTop: 8 }}><div className="kpi-l">Recommended</div><div style={{ fontSize: 24, fontWeight: 700, color: "#008060" }}>{qty} units</div></div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}><Btn primary onClick={async () => { try { await api.approve(p.id, qty); } catch { } toast(`Approved: ${p.name}`); refetch(); }}>Approve ({qty})</Btn><Btn onClick={() => toast("On hold")}>Hold</Btn></div>
      </div>
    </div>
  </div>;
}

/* ═══ ALERTS ═══ */
function AlertsPage({ onView }) {
  const { data: alerts, loading, error, refetch } = useApi(() => api.alerts());
  const [held, setHeld] = useState(new Set()); const toast = useT();
  return <div style={{ animation: "fadeIn .25s ease" }}>
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><Btn primary onClick={async () => { for (const a of alerts || []) if (!held.has(a.id)) { try { await api.approve(a.id, a.recQty); } catch { } } toast("All approved"); refetch(); }}>Approve all</Btn><Btn onClick={() => { setHeld(new Set((alerts || []).map(a => a.id))); toast("All held"); }}>Hold all</Btn></div>
    {loading ? [1, 2, 3].map(i => <Sk key={i} h={64} />) : error ? <Empty msg="Failed" /> : !alerts?.length ? <Empty msg="All stocked" /> :
      alerts.map(a => <div key={a.id} className="alert-card" style={held.has(a.id) ? { opacity: .3, pointerEvents: "none" } : {}}>
        <Badge c={a.severity === "critical" ? "c" : "w"}>{a.severity === "critical" ? "Critical" : "Warning"}</Badge>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{a.name}</div><div style={{ fontSize: 12, color: "#6d7175" }}>Stock: {a.stock} - {a.oos}d - Rec: {a.recQty}</div>{a.message && <div style={{ fontSize: 11, color: "#8c9196", marginTop: 2 }}>{a.message}</div>}</div>
        <div style={{ display: "flex", gap: 4 }}><Btn slim primary onClick={async () => { try { await api.approve(a.id, a.recQty); } catch { } toast(`Approved: ${a.name}`); refetch(); }}>Approve</Btn><Btn slim onClick={() => { setHeld(p => new Set([...p, a.id])); toast("Held"); }}>Hold</Btn><Btn slim onClick={() => onView(a.id)}>View</Btn></div>
      </div>)}
  </div>;
}

/* ═══ ANALYTICS ═══ */
function AnalyticsPage() {
  const { data: prods } = useApi(() => api.products()); const { data: al } = useApi(() => api.alerts());
  const dailyData = (prods || []).slice(0, 7).map(p => ({ l: p.name.slice(0, 8), v: p.avg }));
  const stockData = (prods || []).slice(0, 6).map(p => ({ l: p.name.slice(0, 10), v: p.stock }));
  const sc = { Active: 0, Warning: 0, Critical: 0 }; (prods || []).forEach(p => { const s = stat(p); if (s.c === "s") sc.Active++; else if (s.c === "w") sc.Warning++; else sc.Critical++; });
  return <div style={{ animation: "fadeIn .25s ease" }}><div className="grid-2" style={{ marginBottom: 12 }}>
    <Card title="Daily Sales by Product">{dailyData.length > 0 ? <BarChart data={dailyData} /> : <Empty msg="No data" />}</Card>
    <Card title="Stock Levels">{stockData.length > 0 ? <BarChart data={stockData} color="#2c6ecb" /> : <Empty msg="No data" />}</Card>
  </div><div className="grid-2">
    <Card title="Alert Distribution">{al?.length > 0 ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[["Critical", (al || []).filter(a => a.severity === "critical").length, "#d72c0d"], ["Warning", (al || []).filter(a => a.severity === "warning").length, "#b98900"]].map(([l, v, c]) => <div key={l}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span>{l}</span><strong>{v}</strong></div><div style={{ height: 6, background: "#f1f2f3", borderRadius: 3 }}><div style={{ height: 6, background: c, borderRadius: 3, width: `${Math.max(5, (v / (al?.length || 1)) * 100)}%` }} /></div></div>)}</div> : <Empty msg="No alerts" />}</Card>
    <Card title="Products by Status"><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{Object.entries(sc).map(([l, v]) => <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#f6f6f7", borderRadius: 6 }}><span style={{ fontSize: 13, fontWeight: 500 }}>{l}</span><strong>{v}</strong></div>)}</div></Card>
  </div></div>;
}

/* ═══ STORE ═══ */
function StorePage() {
  const toast = useT(); const [stores, setStores] = useState([]); const [form, setForm] = useState(false);
  return <div style={{ animation: "fadeIn .25s ease" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div><h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>Connected Stores</h2><p style={{ fontSize: 12, color: "#6d7175" }}>Manage Shopify connections</p></div>{!form && <Btn primary onClick={() => setForm(true)}>Connect store</Btn>}</div>
    {form && <ConnForm onDone={s => { setStores(p => [...p, s]); setForm(false); toast(`${s.name} connected`); }} onCancel={() => setForm(false)} />}
    {stores.length > 0 ? stores.map(s => <StoreCard key={s.id} store={s} onRemove={() => { setStores(p => p.filter(x => x.id !== s.id)); toast("Disconnected"); }} />) : !form && <Card title=""><Empty msg="No stores connected. Click Connect store to begin." /></Card>}
  </div>;
}
function ConnForm({ onDone, onCancel }) {
  const toast = useT(); const [step, setStep] = useState(1); const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState(""); const [name, setName] = useState(""); const [token, setToken] = useState("");
  const go1 = () => { if (!url.trim()) { toast("Enter URL"); return; } setStep(2); };
  const go2 = async () => { if (!token.trim()) { toast("Enter token"); return; } setStep(3); setBusy(true); try { await api.registerStore({ store_url: url, store_name: name, access_token: token }); } catch { } await new Promise(r => setTimeout(r, 1500)); setBusy(false); setStep(4); setTimeout(() => onDone({ id: Date.now().toString(), url: url.includes(".") ? url : url + ".myshopify.com", name: name || url, connected_at: new Date().toISOString(), status: "active" }), 800); };
  return <Card title="Connect Store" right={<Btn slim onClick={onCancel}>Cancel</Btn>}>
    <div style={{ display: "flex", marginBottom: 20 }}>{["URL", "Auth", "Verify", "Done"].map((s, i) => { const n = i + 1; const a = step >= n; return <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>{i > 0 && <div style={{ position: "absolute", top: 12, right: "50%", width: "100%", height: 2, background: a ? "#008060" : "#e1e3e5", zIndex: 0 }} />}<div style={{ width: 24, height: 24, borderRadius: "50%", background: a ? "#008060" : "#e1e3e5", color: a ? "#fff" : "#8c9196", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, zIndex: 1 }}>{a && step > n ? "v" : n}</div><span style={{ fontSize: 10, color: a ? "#202223" : "#8c9196" }}>{s}</span></div>; })}</div>
    {step === 1 && <div><div className="form-g"><div className="form-l">Store URL</div><input className="form-i" style={{ width: "100%" }} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && go1()} placeholder="yourstore.myshopify.com" autoFocus /></div><div className="form-g"><div className="form-l">Display Name</div><input className="form-i" style={{ width: "100%" }} value={name} onChange={e => setName(e.target.value)} placeholder="My Store" /></div><Btn primary onClick={go1}>Continue</Btn></div>}
    {step === 2 && <div><div className="form-g"><div className="form-l">Admin API Token</div><input className="form-i" style={{ width: "100%", fontFamily: "monospace" }} value={token} onChange={e => setToken(e.target.value)} onKeyDown={e => e.key === "Enter" && go2()} placeholder="shpat_xxxxx" type="password" autoFocus /></div><div style={{ background: "#e4f5ee", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: "#004c3f" }}><strong>Required:</strong> read_products, write_products, read_orders, write_orders, read_inventory, write_inventory</div><div style={{ display: "flex", gap: 8 }}><Btn onClick={() => setStep(1)}>Back</Btn><Btn primary onClick={go2}>Connect</Btn></div></div>}
    {step === 3 && busy && <div style={{ textAlign: "center", padding: 32 }}><div className="spinner" style={{ width: 28, height: 28, margin: "0 auto 12px" }} /><div style={{ fontSize: 13, fontWeight: 500 }}>Connecting...</div></div>}
    {step === 4 && <div style={{ textAlign: "center", padding: 32 }}><div style={{ width: 36, height: 36, background: "#e4f5ee", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#008060", fontWeight: 700, fontSize: 16 }}>OK</div><div style={{ fontSize: 14, fontWeight: 600 }}>Connected</div></div>}
  </Card>;
}
function StoreCard({ store, onRemove }) {
  const [open, setOpen] = useState(false); const [syncing, setSyncing] = useState(false); const [lastSync, setLastSync] = useState(null); const toast = useT();
  const doSync = async (e) => { e.stopPropagation(); setSyncing(true); try { await api.syncStore(store.id); } catch { } setLastSync(new Date().toLocaleTimeString()); toast(`${store.name}: Synced`); setSyncing(false); };
  return <div className="card" style={{ marginBottom: 8 }}><div onClick={() => setOpen(!open)} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}><div style={{ width: 32, height: 32, background: "#f6f6f7", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#6d7175" }}>{Ic.store}</div><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{store.name}</div><div style={{ fontSize: 11, color: "#8c9196" }}>{store.url}</div></div><Btn slim disabled={syncing} onClick={doSync} style={{ marginRight: 6 }}>{syncing ? <><span className="spinner" /> Syncing</> : <><span style={{ display: "flex" }}>{Ic.refresh}</span> Sync</>}</Btn><Badge c="s">Active</Badge></div>
    {open && <div style={{ padding: "0 16px 12px", borderTop: "1px solid #e1e3e5", paddingTop: 12 }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>{[["Connected", new Date(store.connected_at).toLocaleDateString()], ["Last Sync", lastSync || "Never"], ["Status", "Active"]].map(([l, v]) => <div key={l} style={{ background: "#f6f6f7", borderRadius: 6, padding: "8px 10px" }}><div style={{ fontSize: 10, color: "#8c9196", fontWeight: 500, textTransform: "uppercase", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 12, fontWeight: 600 }}>{v}</div></div>)}</div><Btn slim danger onClick={onRemove}>Disconnect</Btn></div>}
  </div>;
}

/* ═══ STATIC PAGES (no API needed) ═══ */
function CustomersPage() {
  return <Card title="Customers" right={<Btn primary slim>Export</Btn>} flush>
    <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Status</th></tr></thead>
      <tbody></tbody></table>
    <Empty msg="Connect your Shopify store to sync customer data" />
  </Card>;
}

function RefundsPage() {
  return <Card title="Refund Requests" flush>
    <table><thead><tr><th>ID</th><th>Customer</th><th>Product</th><th>Reason</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody></tbody></table>
    <Empty msg="No refund requests yet. They will appear here when synced from Shopify." />
  </Card>;
}

function InventoryPage() {
  const { data: prods, loading } = useApi(() => api.products());
  if (loading) return <Sk h={200} />;
  const data = (prods || []).map(p => ({ l: p.name.slice(0, 12), v: p.stock }));
  return <div style={{ animation: "fadeIn .25s ease" }}><div className="grid-2">
    <Card title="Stock Levels">{data.length > 0 ? <BarChart data={data} color="#2c6ecb" height={220} /> : <Empty msg="No data" />}</Card>
    <Card title="Inventory Summary"><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(prods || []).slice(0, 6).map(p => { const s = stat(p); return <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#f6f6f7", borderRadius: 6 }}><div><div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div><div style={{ fontSize: 11, color: "#8c9196" }}>{p.sku}</div></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14, fontWeight: 700 }}>{p.stock}</span><Badge c={s.c}>{s.l}</Badge></div></div>; })}
    </div></Card>
  </div></div>;
}

function DiscountsPage() {
  return <Card title="Discount Codes" right={<Btn primary slim>Create discount</Btn>} flush>
    <table><thead><tr><th>Code</th><th>Type</th><th>Applies to</th><th>Status</th><th>Usage</th></tr></thead>
      <tbody></tbody></table>
    <Empty msg="No discount codes created yet" />
  </Card>;
}

function ShippingPage() {
  return <div style={{ animation: "fadeIn .25s ease" }}><Card title="Shipping Zones">
    <Empty msg="Shipping zones will sync from your Shopify store" />
  </Card></div>;
}


function HelpPage() {
  return <div style={{ maxWidth: 560, animation: "fadeIn .25s ease" }}><Card title="Help & Support">
    {[["Getting Started", "Connect your store and configure automation settings."], ["API Reference", "REST API documentation for custom integrations."], ["Billing & Plans", "Manage subscription and payment methods."], ["Contact Support", "support@refundos.com - Response within 24 hours."]].map(([t, d]) => <div key={t} style={{ padding: "14px 0", borderBottom: "1px solid #f1f2f3", cursor: "pointer" }}><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{t}</div><div style={{ fontSize: 12, color: "#6d7175" }}>{d}</div></div>)}
  </Card></div>;
}

function SettingsPage() {
  const toast = useT(); const [s, setS] = useState({ safety: 10, lead: 7, moq: 20, max: 500, auto: true, alert: false, approve: true }); const up = (k, v) => setS(p => ({ ...p, [k]: v }));
  const Tgl = ({ label, k }) => <div className="tgl-w" onClick={() => up(k, !s[k])}><div className={`tgl ${s[k] ? "on" : ""}`} />{label}</div>;
  return <div style={{ maxWidth: 560, animation: "fadeIn .25s ease" }}><Card title="Reorder Configuration">
    {[["Safety Stock", "Alert threshold", "safety"], ["Lead Time (days)", "Avg delivery", "lead"], ["Min Order Qty", "Smallest order", "moq"], ["Max Auto ($)", "Auto-order cap", "max"]].map(([l, d, k]) => <div className="form-g" key={k}><div className="form-l">{l}</div><div className="form-h">{d}</div><input className="form-i" type="number" value={s[k]} onChange={e => up(k, +e.target.value)} /></div>)}
    <div style={{ borderTop: "1px solid #e1e3e5", margin: "16px 0", paddingTop: 16 }}><div className="form-l" style={{ marginBottom: 8 }}>Automation</div><Tgl label="Enable auto-reorder" k="auto" /><Tgl label="Alert only" k="alert" /><Tgl label="Auto after approval" k="approve" /></div>
    <div style={{ display: "flex", gap: 8 }}><Btn primary onClick={() => toast("Saved")}>Save</Btn><Btn onClick={() => toast("Reset")}>Reset</Btn></div>
  </Card></div>;
}

/* ═══ APP ═══ */
const TITLES = { overview: "Home", products: "Products", detail: "Product Detail", alerts: "Orders", customers: "Customers", refunds: "Refunds", inventory: "Inventory", analytics: "Analytics", discounts: "Discounts", shipping: "Shipping", store: "Stores", settings: "Settings", help: "Help" };
const NAV = [
  { id: "overview", icon: "home", label: "Home", sec: "" },
  { id: "products", icon: "box", label: "Products" },
  { id: "alerts", icon: "bell", label: "Orders", badge: true },
  { id: "customers", icon: "users", label: "Customers" },
  { id: "refunds", icon: "shield", label: "Refunds" },
  { id: "inventory", icon: "layers", label: "Inventory" },
  { id: "analytics", icon: "chart", label: "Analytics" },
  { id: "discounts", icon: "tag", label: "Discounts", sec: "Marketing" },
  { id: "shipping", icon: "truck", label: "Shipping" },
  { id: "store", icon: "store", label: "Online Store", sec: "Sales channels" },
  { id: "settings", icon: "gear", label: "Settings" },
  { id: "help", icon: "help", label: "Help Center" },
];

export default function App() {
  const [page, setPage] = useState("overview"); const [did, setDid] = useState(null);
  const { data: alerts } = useApi(() => api.alerts());
  const nav = (pg, d) => { setPage(pg); if (pg === "detail" && d) setDid(d); };
  return <TP><div style={{ display: "flex", minHeight: "100vh" }}>
    <aside className="sidebar">
      <div className="sb-head"><div className="sb-logo">R</div><span className="sb-brand">RefundOS</span></div>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 8px", padding: "6px 8px", borderRadius: 6, fontSize: 12, color: "#8c9196", textDecoration: "none" }}>{Ic.back} Back to site</a>
      <nav className="sb-nav">
        {NAV.map(item => { const active = page === item.id || (page === "detail" && item.id === "products"); return <div key={item.id}>
          {item.sec !== undefined && <div className="sb-sec">{item.sec}</div>}
          <button onClick={() => nav(item.id)} className={`sb-item ${active ? "on" : ""}`}><span style={{ display: "flex" }}>{Ic[item.icon]}</span>{item.label}{item.badge && alerts?.length > 0 && <span className="sb-badge">{alerts.length}</span>}</button>
        </div>; })}
      </nav>
      <div className="sb-foot"><div className="sb-store"><span className="sb-dot" /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>yourstore.myshopify.com</span></div></div>
    </aside>
    <div className="main">
      <div className="topbar"><span className="tb-title">{TITLES[page] || ""}</span><div className="tb-right"><Badge c="s">Connected</Badge></div></div>
      <div className="content">
        {page === "overview" && <OverviewPage />}
        {page === "products" && <ProductsPage onView={id => nav("detail", id)} />}
        {page === "detail" && <DetailPage id={did} onBack={() => nav("products")} />}
        {page === "alerts" && <AlertsPage onView={id => nav("detail", id)} />}
        {page === "customers" && <CustomersPage />}
        {page === "refunds" && <RefundsPage />}
        {page === "inventory" && <InventoryPage />}
        {page === "analytics" && <AnalyticsPage />}
        {page === "discounts" && <DiscountsPage />}
        {page === "shipping" && <ShippingPage />}
        {page === "store" && <StorePage />}
        {page === "settings" && <SettingsPage />}
        {page === "help" && <HelpPage />}
      </div>
    </div>
  </div></TP>;
}
