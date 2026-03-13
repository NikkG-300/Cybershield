import { useState, useEffect } from "react";

const INITIAL_THREATS = [
  { id: 1, type: "Phishing",    severity: "CRITICAL", source: "Lagos, Nigeria",       lat: 6.5,   lng: 3.4,    desc: "Credential harvesting via fake banking portal",              ts: Date.now() - 3600000 * 5  },
  { id: 2, type: "DDoS",        severity: "HIGH",     source: "Moscow, Russia",        lat: 55.75, lng: 37.6,   desc: "SYN flood targeting port 443 — 1.2M req/s",                  ts: Date.now() - 3600000 * 3  },
  { id: 3, type: "Brute Force", severity: "MEDIUM",   source: "Shanghai, China",       lat: 31.2,  lng: 121.5,  desc: "SSH brute force — 4,200 attempts in 10 min",                 ts: Date.now() - 3600000 * 2  },
  { id: 4, type: "GPS Spoof",   severity: "HIGH",     source: "Tehran, Iran",          lat: 35.7,  lng: 51.4,   desc: "Impossible travel detected — 2,400 km/h jump",               ts: Date.now() - 3600000      },
  { id: 5, type: "Port Scan",   severity: "LOW",      source: "Bucharest, Romania",    lat: 44.4,  lng: 26.1,   desc: "Sequential port scan 1–65535",                               ts: Date.now() - 1800000      },
  { id: 6, type: "Phishing",    severity: "CRITICAL", source: "Pyongyang, DPRK",       lat: 39.0,  lng: 125.7,  desc: "Spear phishing targeting C-suite executives",                ts: Date.now() - 900000       },
  { id: 7, type: "Malware",     severity: "CRITICAL", source: "Minsk, Belarus",        lat: 53.9,  lng: 27.6,   desc: "Ransomware dropper via phishing attachment",                 ts: Date.now() - 600000       },
  { id: 8, type: "DDoS",        severity: "CRITICAL", source: "São Paulo, Brazil",     lat: -23.5, lng: -46.6,  desc: "UDP amplification attack — 2.3 Tbps peak",                   ts: Date.now() - 300000       },
  { id: 9, type: "Brute Force", severity: "HIGH",     source: "Hanoi, Vietnam",        lat: 21.0,  lng: 105.8,  desc: "Credential stuffing — 15,000 attempts/min on admin portal",  ts: Date.now() - 180000       },
  { id: 10, type: "Port Scan",  severity: "MEDIUM",   source: "Karachi, Pakistan",     lat: 24.9,  lng: 67.0,   desc: "Stealth SYN scan across /16 subnet",                         ts: Date.now() - 60000        },
];

const SEV_STYLE = {
  CRITICAL: { color: "#ff4444", bg: "#3a0000", border: "#ff2222" },
  HIGH:     { color: "#ff8c00", bg: "#3a1800", border: "#ff6b35" },
  MEDIUM:   { color: "#ffd93d", bg: "#2a2a00", border: "#ccaa00" },
  LOW:      { color: "#6bcb77", bg: "#002a00", border: "#44aa55" },
};
const TYPE_COLOR = { Phishing: "#ff2d2d", DDoS: "#ff6b35", "Brute Force": "#ffd93d", "Port Scan": "#c084fc", "GPS Spoof": "#00d4ff", Malware: "#ff4dff" };

function Badge({ severity }) {
  const s = SEV_STYLE[severity] || SEV_STYLE.LOW;
  return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 3, padding: "1px 6px", fontFamily: "Courier New, monospace", whiteSpace: "nowrap" }}>{severity}</span>;
}

const TYPES = ["All", "Phishing", "DDoS", "Brute Force", "Port Scan", "GPS Spoof", "Malware"];
const SEVS  = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function Vault() {
  const [threats, setThreats] = useState([...INITIAL_THREATS].sort((a, b) => b.ts - a.ts));
  const [filterType, setFilterType] = useState("All");
  const [filterSev, setFilterSev] = useState("All");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("ts");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = threats
    .filter(t => filterType === "All" || t.type === filterType)
    .filter(t => filterSev === "All" || t.severity === filterSev)
    .filter(t => !search || t.source.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()) || t.type.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let v = 0;
      if (sortCol === "ts") v = a.ts - b.ts;
      else if (sortCol === "severity") v = Object.keys(SEV_STYLE).indexOf(a.severity) - Object.keys(SEV_STYLE).indexOf(b.severity);
      else if (sortCol === "type") v = a.type.localeCompare(b.type);
      return sortAsc ? v : -v;
    });

  function toggleSort(col) {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(false); }
  }

  const stats = {
    total: threats.length,
    critical: threats.filter(t => t.severity === "CRITICAL").length,
    types: [...new Set(threats.map(t => t.type))].length,
    sources: [...new Set(threats.map(t => t.source))].length,
  };

  const TH = ({ col, label }) => (
    <th onClick={() => toggleSort(col)} style={{ textAlign: "left", padding: "9px 12px", color: sortCol === col ? "#4a9fdd" : "#4a7099", borderBottom: "1px solid #1a2a44", letterSpacing: "0.1em", fontSize: 9, textTransform: "uppercase", whiteSpace: "nowrap", cursor: "pointer", userSelect: "none", fontFamily: "Courier New, monospace" }}>
      {label} {sortCol === col ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div style={{ background: "#030811", minHeight: "100vh", color: "#ccd6f6", fontFamily: "Courier New, monospace", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      <style>{`::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-thumb{background:#1a2a44;border-radius:2px}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", background: "#060b16", border: "1px solid #1a2a44", borderRadius: 8 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/></svg>
        <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Threat Intelligence Vault — SQLite Database</span>
        <span style={{ marginLeft: "auto", fontSize: 9, color: "#334455" }}>Table: threat_intelligence · Indexed by: timestamp, type, severity</span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "TOTAL RECORDS", value: stats.total, color: "#4a9fdd" },
          { label: "CRITICAL",      value: stats.critical, color: "#ff4444" },
          { label: "THREAT TYPES",  value: stats.types,    color: "#ffd93d" },
          { label: "SOURCES",       value: stats.sources,  color: "#6bcb77" },
        ].map(s => (
          <div key={s.label} style={{ background: "#06101e", border: "1px solid #1a2a44", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#334455", letterSpacing: "0.15em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 8, padding: "10px 13px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search threats..." style={{ background: "#030811", border: "1px solid #1a2a44", borderRadius: 5, padding: "5px 10px", color: "#7daacc", fontFamily: "Courier New, monospace", fontSize: 10, outline: "none", width: 160 }} />
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "#334455" }}>TYPE:</span>
          {TYPES.map(t => <button key={t} onClick={() => setFilterType(t)} style={{ padding: "3px 8px", background: filterType === t ? "#0a1e3a" : "transparent", border: `1px solid ${filterType === t ? "#2a5080" : "#1a2a44"}`, borderRadius: 3, color: filterType === t ? "#4a9fdd" : "#445566", fontSize: 9, cursor: "pointer", fontFamily: "Courier New, monospace" }}>{t}</button>)}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "#334455" }}>SEV:</span>
          {SEVS.map(s => <button key={s} onClick={() => setFilterSev(s)} style={{ padding: "3px 8px", background: filterSev === s ? "#0a1e3a" : "transparent", border: `1px solid ${filterSev === s ? "#2a5080" : "#1a2a44"}`, borderRadius: 3, color: filterSev === s ? "#4a9fdd" : "#445566", fontSize: 9, cursor: "pointer", fontFamily: "Courier New, monospace" }}>{s}</button>)}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 9, color: "#445566" }}>{filtered.length} / {threats.length} records</span>
      </div>

      {/* Table */}
      <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 10, overflow: "hidden", flex: 1 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#060b16" }}>
                <TH col="id" label="ID" />
                <TH col="type" label="Type" />
                <TH col="severity" label="Severity" />
                <TH col="ts" label="Timestamp" />
                <th style={{ textAlign: "left", padding: "9px 12px", color: "#4a7099", borderBottom: "1px solid #1a2a44", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Courier New, monospace" }}>Source Location</th>
                <th style={{ textAlign: "left", padding: "9px 12px", color: "#4a7099", borderBottom: "1px solid #1a2a44", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Courier New, monospace" }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} onClick={() => setSelected(selected?.id === t.id ? null : t)} style={{ background: selected?.id === t.id ? "#0a1628" : i % 2 === 0 ? "transparent" : "#040b18", cursor: "pointer", transition: "background 0.15s" }}>
                  <td style={{ padding: "9px 12px", color: "#445566", fontSize: 10, whiteSpace: "nowrap" }}>#{String(t.id).padStart(4, "0")}</td>
                  <td style={{ padding: "9px 12px", fontSize: 10, whiteSpace: "nowrap" }}><span style={{ color: TYPE_COLOR[t.type] || "#7799bb" }}>{t.type}</span></td>
                  <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}><Badge severity={t.severity} /></td>
                  <td style={{ padding: "9px 12px", color: "#445566", fontSize: 9, whiteSpace: "nowrap" }}>{new Date(t.ts).toLocaleString()}</td>
                  <td style={{ padding: "9px 12px", color: "#6688aa", fontSize: 10, whiteSpace: "nowrap" }}>{t.source}</td>
                  <td style={{ padding: "9px 12px", color: "#8899aa", fontSize: 10, maxWidth: 300 }}>{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div style={{ borderTop: "1px solid #1a2a44", padding: "14px 16px", background: "#070f1e" }}>
            <div style={{ fontSize: 10, color: "#4a7099", letterSpacing: "0.12em", marginBottom: 8 }}>RECORD DETAIL — #{String(selected.id).padStart(4, "0")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                ["Type", selected.type], ["Severity", selected.severity], ["Source", selected.source],
                ["Latitude", selected.lat + "°"], ["Longitude", selected.lng + "°"], ["Timestamp", new Date(selected.ts).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k}><span style={{ fontSize: 9, color: "#334455" }}>{k}: </span><span style={{ fontSize: 10, color: "#7799bb" }}>{v}</span></div>
              ))}
              <div style={{ gridColumn: "1/-1" }}><span style={{ fontSize: 9, color: "#334455" }}>Description: </span><span style={{ fontSize: 10, color: "#aabbcc" }}>{selected.desc}</span></div>
            </div>
          </div>
        )}

        <div style={{ padding: "8px 13px", borderTop: "1px solid #1a2a44", fontSize: 9, color: "#334455", display: "flex", gap: 16 }}>
          <span>Storage: <span style={{ color: "#4a7099" }}>SQLite</span></span>
          <span>Records: <span style={{ color: "#6688aa" }}>{threats.length}</span></span>
          <span>Filtered: <span style={{ color: "#6688aa" }}>{filtered.length}</span></span>
          <span style={{ marginLeft: "auto" }}>Click a row to expand details</span>
        </div>
      </div>
    </div>
  );
}