import { useState } from "react";

const SIMULATIONS = [
  {
    type: "phishing",
    label: "Phishing Campaign",
    color: "#ff2d2d",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    desc: "Simulates a spear phishing attack targeting user credentials via OAuth2 lookalike pages with randomized sender spoofing.",
    endpoint: "POST /create_attack_simulation { type: 'phishing' }",
    model: "Random Forest Classifier — phishing score threshold: 40",
    stats: { requests: "1,200", duration: "~2.3s", confidence: "97%" },
    tags: ["Credential Theft", "Social Engineering", "Email Vector"],
    source: "Pyongyang, DPRK · 39.0°N 125.7°E",
  },
  {
    type: "ddos",
    label: "DDoS Flood",
    color: "#ff6b35",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    desc: "Simulates a volumetric UDP amplification attack at 2.3 Tbps peak bandwidth targeting primary server on port 443.",
    endpoint: "POST /create_attack_simulation { type: 'ddos' }",
    model: "Isolation Forest — request rate anomaly detection",
    stats: { requests: "2.3M", duration: "~1.8s", confidence: "94%" },
    tags: ["Volumetric", "UDP Flood", "Port 443"],
    source: "Moscow, Russia · 55.75°N 37.6°E",
  },
  {
    type: "bruteforce",
    label: "Brute Force",
    color: "#ffd93d",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    desc: "Simulates credential stuffing attack with 15,000 login attempts per minute using leaked password databases.",
    endpoint: "POST /create_attack_simulation { type: 'bruteforce' }",
    model: "Isolation Forest — failed login pattern threshold: 5",
    stats: { requests: "15K/min", duration: "~1.2s", confidence: "89%" },
    tags: ["Credential Stuffing", "SSH", "Auth Bypass"],
    source: "Shanghai, China · 31.2°N 121.5°E",
  },
  {
    type: "ransomware",
    label: "Ransomware Drop",
    color: "#c084fc",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    desc: "Simulates ransomware deployment via phishing attachment, encrypting mock files and triggering ransom note generation.",
    endpoint: "POST /create_attack_simulation { type: 'ransomware' }",
    model: "Signature + Behavioral Analysis — entropy detection",
    stats: { requests: "450", duration: "~3.1s", confidence: "99%" },
    tags: ["File Encryption", "Ransom Note", "Lateral Movement"],
    source: "Minsk, Belarus · 53.9°N 27.6°E",
  },
  {
    type: "portscan",
    label: "Port Scan",
    color: "#00d4ff",
    icon: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
    desc: "Simulates a full TCP SYN stealth scan across target subnet ports 1–65535 to enumerate open services.",
    endpoint: "POST /create_attack_simulation { type: 'portscan' }",
    model: "Isolation Forest — sequential port access anomaly",
    stats: { requests: "65,535", duration: "~0.9s", confidence: "78%" },
    tags: ["Reconnaissance", "TCP SYN", "Stealth Scan"],
    source: "Bucharest, Romania · 44.4°N 26.1°E",
  },
  {
    type: "gpsspoof",
    label: "GPS Spoof",
    color: "#6bcb77",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    desc: "Simulates GPS coordinate spoofing with impossible 2,400 km/h travel jump triggering Haversine distance anomaly alert.",
    endpoint: "POST /create_attack_simulation { type: 'gpsspoof' }",
    model: "Haversine Distance Formula — max speed: 900 km/h",
    stats: { requests: "4", duration: "~0.7s", confidence: "100%" },
    tags: ["Location Spoof", "Impossible Travel", "Device Compromise"],
    source: "Tehran, Iran · 35.7°N 51.4°E",
  },
];

const API_ENDPOINTS = [
  { method: "POST", path: "/create_attack_simulation", desc: "Trigger mock attack simulation" },
  { method: "POST", path: "/detect_email_threat", desc: "Random Forest phishing classifier" },
  { method: "POST", path: "/detect_network_threat", desc: "Isolation Forest anomaly detection" },
  { method: "POST", path: "/detect_gps_spoof", desc: "Haversine GPS spoofing detection" },
  { method: "GET",  path: "/get_dashboard_data", desc: "Aggregated stats, risk score, timeline" },
  { method: "GET",  path: "/get_threats", desc: "Retrieve threat intelligence vault" },
  { method: "POST", path: "/scan_url", desc: "Heuristic URL malicious analysis" },
  { method: "POST", path: "/hunt_ioc", desc: "IOC lookup against threat feeds" },
];

function SimCard({ sim, onLaunch, loading, done }) {
  return (
    <div style={{ padding: 16, background: done ? "#050f08" : "#07101e", borderRadius: 10, border: `1px solid ${done ? "#1a4422" : sim.color + "22"}`, display: "flex", flexDirection: "column", gap: 10, transition: "all 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={done ? "#6bcb77" : sim.color} strokeWidth="1.5">
            <path d={sim.icon} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: done ? "#6bcb77" : sim.color }}>{sim.label}</span>
        </div>
        {done && <span style={{ fontSize: 9, color: "#6bcb77", background: "#002a00", border: "1px solid #44aa55", borderRadius: 3, padding: "1px 6px" }}>LAUNCHED</span>}
      </div>
      <p style={{ color: "#6688aa", fontSize: 10, lineHeight: 1.6, margin: 0 }}>{sim.desc}</p>
      <div style={{ fontFamily: "Courier New, monospace", fontSize: 9, color: "#334455", background: "#030811", padding: "7px 9px", borderRadius: 4, lineHeight: 1.7 }}>
        <span style={{ color: sim.color }}>{sim.endpoint.split(" ")[0]}</span> <span style={{ color: "#4a7099" }}>{sim.endpoint.split(" ").slice(1).join(" ")}</span><br />
        <span style={{ color: "#2a4060" }}>{sim.model}</span>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {sim.tags.map(t => <span key={t} style={{ fontSize: 8, padding: "2px 5px", background: "#0a1628", border: "1px solid #1a2a44", borderRadius: 3, color: "#4a7099" }}>{t}</span>)}
      </div>
      <div style={{ display: "flex", gap: 8, fontSize: 9, color: "#334455" }}>
        <span>Requests: <span style={{ color: "#6688aa" }}>{sim.stats.requests}</span></span>
        <span>Duration: <span style={{ color: "#6688aa" }}>{sim.stats.duration}</span></span>
        <span>Confidence: <span style={{ color: "#6688aa" }}>{sim.stats.confidence}</span></span>
      </div>
      <div style={{ fontSize: 9, color: "#2a3a4a" }}>📍 {sim.source}</div>
      <button
        onClick={() => onLaunch(sim.type)}
        disabled={loading !== null}
        style={{ padding: "9px 0", background: loading === sim.type ? "#0a1628" : done ? "rgba(107,203,119,0.1)" : `rgba(${sim.color === "#ff2d2d" ? "255,45,45" : sim.color === "#ff6b35" ? "255,107,53" : sim.color === "#ffd93d" ? "255,217,61" : sim.color === "#c084fc" ? "192,132,252" : sim.color === "#00d4ff" ? "0,212,255" : "107,203,119"},0.1)`, border: `1px solid ${loading !== null ? "#1a2a44" : done ? "#44aa55" : sim.color}`, borderRadius: 6, color: loading !== null ? "#445566" : done ? "#6bcb77" : sim.color, fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", cursor: loading !== null ? "not-allowed" : "pointer", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
      >
        {loading === sim.type ? (
          <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> SIMULATING...</>
        ) : done ? "✓ LAUNCHED" : (
          <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> LAUNCH</>
        )}
      </button>
    </div>
  );
}

export default function Simulate() {
  const [loading, setLoading] = useState(null);
  const [launched, setLaunched] = useState([]);
  const [log, setLog] = useState([]);

  function launch(type) {
    const sim = SIMULATIONS.find(s => s.type === type);
    setLoading(type);
    const startTs = new Date().toLocaleTimeString();
    setTimeout(() => {
      setLoading(null);
      setLaunched(prev => [...prev, type]);
      setLog(prev => [
        { id: Date.now(), ts: startTs, type: sim.label, severity: type === "phishing" || type === "ransomware" ? "CRITICAL" : type === "ddos" || type === "bruteforce" ? "HIGH" : "MEDIUM", msg: `Simulation complete — threat logged to vault · source: ${sim.source.split("·")[0].trim()}` },
        ...prev
      ].slice(0, 10));
    }, 900 + Math.random() * 600);
  }

  function launchAll() {
    SIMULATIONS.forEach((s, i) => setTimeout(() => launch(s.type), i * 400));
  }

  const SEV_C = { CRITICAL: "#ff4444", HIGH: "#ff8c00", MEDIUM: "#ffd93d", LOW: "#6bcb77" };

  return (
    <div style={{ background: "#030811", minHeight: "100vh", color: "#ccd6f6", fontFamily: "Courier New, monospace", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", background: "#060b16", border: "1px solid #1a2a44", borderRadius: 8 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Attack Simulation Control Panel</span>
        {loading && <span style={{ marginLeft: "auto", fontSize: 10, color: "#ff8c00", animation: "blink 1s infinite" }}>● SIMULATION RUNNING</span>}
        {!loading && (
          <button onClick={launchAll} disabled={loading !== null} style={{ marginLeft: "auto", padding: "4px 12px", background: "transparent", border: "1px solid #1a2a44", borderRadius: 5, color: "#6688aa", fontSize: 9, cursor: "pointer", fontFamily: "Courier New, monospace", letterSpacing: "0.08em" }}>
            LAUNCH ALL
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Sim cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SIMULATIONS.slice(0, 4).map(s => (
              <SimCard key={s.type} sim={s} onLaunch={launch} loading={loading} done={launched.includes(s.type)} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SIMULATIONS.slice(4).map(s => (
              <SimCard key={s.type} sim={s} onLaunch={launch} loading={loading} done={launched.includes(s.type)} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Activity log */}
          <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "8px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", fontSize: 10, color: "#4a7099", letterSpacing: "0.1em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>SIMULATION LOG</span>
              <span style={{ color: "#334455" }}>{log.length} events</span>
            </div>
            <div style={{ minHeight: 160, maxHeight: 260, overflowY: "auto" }}>
              {log.length === 0 && (
                <div style={{ padding: "30px 20px", textAlign: "center", color: "#334455", fontSize: 10 }}>No simulations run yet</div>
              )}
              {log.map(e => (
                <div key={e.id} style={{ padding: "8px 13px", borderBottom: "1px solid #0a1628", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 9, color: "#334455", whiteSpace: "nowrap", marginTop: 1 }}>{e.ts}</span>
                  <span style={{ fontSize: 9, color: SEV_C[e.severity] || "#6688aa", minWidth: 60, fontWeight: 700 }}>{e.severity}</span>
                  <span style={{ fontSize: 9, color: "#6688aa" }}>[{e.type}] {e.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API endpoints reference */}
          <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "8px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", fontSize: 10, color: "#4a7099", letterSpacing: "0.1em" }}>FLASK REST API ENDPOINTS</div>
            {API_ENDPOINTS.map(ep => (
              <div key={ep.path} style={{ padding: "8px 13px", borderBottom: "1px solid #080f1e", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: ep.method === "GET" ? "#6bcb77" : "#00d4ff", background: ep.method === "GET" ? "#082a12" : "#081a2a", padding: "1px 6px", borderRadius: 3, minWidth: 36, textAlign: "center" }}>{ep.method}</span>
                <span style={{ fontSize: 10, color: "#4a9fdd", fontFamily: "Courier New, monospace", flex: 1 }}>{ep.path}</span>
                <span style={{ fontSize: 9, color: "#334455" }}>{ep.desc}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "SIMULATIONS", value: launched.length, color: "#4a9fdd" },
              { label: "THREATS ADDED", value: launched.length, color: "#ff8c00" },
              { label: "APIs CALLED", value: launched.length * 2, color: "#6bcb77" },
            ].map(s => (
              <div key={s.label} style={{ background: "#06101e", border: "1px solid #1a2a44", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 8, color: "#334455", letterSpacing: "0.12em", marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}