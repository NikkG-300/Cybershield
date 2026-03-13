import { useState, useEffect, useRef } from "react";

function isolationForestDetect(log) {
  const lines = log.split("\n").filter(Boolean);
  const ipCounts = {}, portScans = {}, failedLogins = {};
  lines.forEach((line) => {
    const ip = (line.match(/(\d+\.\d+\.\d+\.\d+)/) || [])[1];
    const port = (line.match(/port[:\s]+(\d+)/i) || [])[1];
    const fail = /fail|denied|invalid|401|403/i.test(line);
    if (ip) {
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      if (port) { if (!portScans[ip]) portScans[ip] = new Set(); portScans[ip].add(port); }
      if (fail) failedLogins[ip] = (failedLogins[ip] || 0) + 1;
    }
  });
  const results = [];
  Object.entries(ipCounts).forEach(([ip, count]) => {
    if (count > 50) results.push({ type: "DDoS", ip, count, severity: count > 200 ? "CRITICAL" : "HIGH", desc: `DDoS from ${ip}: ${count} requests`, color: "#ff6b35" });
    if (failedLogins[ip] > 5) results.push({ type: "Brute Force", ip, count: failedLogins[ip], severity: failedLogins[ip] > 20 ? "CRITICAL" : "HIGH", desc: `Brute force from ${ip}: ${failedLogins[ip]} failed auths`, color: "#ff2d2d" });
    if (portScans[ip] && portScans[ip].size > 10) results.push({ type: "Port Scan", ip, count: portScans[ip].size, severity: "MEDIUM", desc: `Port scan from ${ip}: ${portScans[ip].size} ports`, color: "#ffd93d" });
  });
  return results.length ? results : [{ type: "Normal", severity: "NONE", desc: "No anomalies detected", color: "#6bcb77", ip: "—", count: 0 }];
}

const SAMPLE_LOG = `2024-01-15 10:23:01 192.168.1.100 port: 22 FAILED login
2024-01-15 10:23:02 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:03 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:04 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:05 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:06 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:07 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:08 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:09 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:10 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:11 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:12 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:13 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:14 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:15 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:16 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:17 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:18 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:19 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:20 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:21 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:22 192.168.1.100 port: 22 FAILED login invalid
2024-01-15 10:23:23 192.168.1.100 port: 22 FAILED login invalid
10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200
10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200
10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200
10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200
10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200
10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200
10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200
10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200 10.0.0.55 GET /api 200
172.16.0.8 port:80 172.16.0.8 port:443 172.16.0.8 port:22 172.16.0.8 port:21 172.16.0.8 port:8080
172.16.0.8 port:3306 172.16.0.8 port:5432 172.16.0.8 port:6379 172.16.0.8 port:27017 172.16.0.8 port:9200
172.16.0.8 port:1433 172.16.0.8 port:3389`;

function Badge({ severity }) {
  const map = {
    CRITICAL: { bg: "#3a0000", color: "#ff4444", border: "#ff2222" },
    HIGH:     { bg: "#3a1800", color: "#ff8c00", border: "#ff6b35" },
    MEDIUM:   { bg: "#2a2a00", color: "#ffd93d", border: "#ccaa00" },
    LOW:      { bg: "#002a00", color: "#6bcb77", border: "#44aa55" },
    NONE:     { bg: "#0a1a2a", color: "#6688aa", border: "#334455" },
  };
  const s = map[severity] || map.NONE;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 3, padding: "2px 7px", fontFamily: "Courier New, monospace" }}>
      {severity}
    </span>
  );
}

function AnomalyCard({ r, idx }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), idx * 130);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <div style={{ background: "#07101e", border: `1px solid ${r.color}33`, borderRadius: 10, padding: "14px 16px", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.35s ease, transform 0.35s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: r.color, fontWeight: 700, fontSize: 13, fontFamily: "Courier New, monospace" }}>{r.type}</span>
        <Badge severity={r.severity} />
      </div>
      <p style={{ color: "#8899bb", fontSize: 11, margin: "0 0 8px", lineHeight: 1.55 }}>{r.desc}</p>
      <div style={{ display: "flex", gap: 16, fontSize: 10, fontFamily: "monospace", color: "#445566" }}>
        <span>Source: <span style={{ color: r.color, fontWeight: 600 }}>{r.ip}</span></span>
        <span>Count: <span style={{ color: "#6688aa" }}>{r.count}</span></span>
      </div>
    </div>
  );
}

export default function NetworkDetection() {
  const [log, setLog] = useState("");
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  function analyze() {
    if (!log.trim()) return;
    setAnalyzing(true); setResults(null); setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100; clearInterval(iv);
        setResults(isolationForestDetect(log));
        setAnalyzing(false);
      }
      setProgress(Math.min(p, 100));
    }, 80);
  }

  const critCount = results ? results.filter(r => r.severity === "CRITICAL").length : 0;
  const highCount = results ? results.filter(r => r.severity === "HIGH").length : 0;
  const lineCount = log.split("\n").filter(Boolean).length;

  return (
    <div style={{ background: "#030811", minHeight: "100vh", color: "#ccd6f6", fontFamily: "Courier New, monospace" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-track { background: #030811; }
        textarea::-webkit-scrollbar-thumb { background: #1a2a44; border-radius: 2px; }
      `}</style>

      {/* Stats bar */}
      {results && (
        <div style={{ padding: "7px 16px", background: "#050d1c", borderBottom: "1px solid #1a2a44", display: "flex", gap: 20, alignItems: "center", fontSize: 10, letterSpacing: "0.1em" }}>
          <span style={{ color: "#334455" }}>ANOMALY DETECTION · ISOLATION FOREST</span>
          <span style={{ color: "#ff2d2d" }}>● CRITICAL: {critCount}</span>
          <span style={{ color: "#ff8c00" }}>▲ HIGH: {highCount}</span>
          <span style={{ color: "#445566", marginLeft: "auto" }}>{results.length} THREAT{results.length !== 1 ? "S" : ""} IDENTIFIED</span>
        </div>
      )}

      {/* Split layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "calc(100vh - 33px)" }}>

        {/* LEFT — Log input */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #1a2a44", padding: 14, gap: 10 }}>

          <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 10, display: "flex", flexDirection: "column", overflow: "hidden", flex: 1, minHeight: 0 }}>
            {/* Panel header */}
            <div style={{ padding: "9px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2">
                <rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/>
                <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>
              </svg>
              <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Network Logs — Isolation Forest
              </span>
              {analyzing && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#00d4ff", animation: "blink 1s infinite" }}>● SCANNING</span>
              )}
            </div>
            <textarea
              ref={logRef}
              value={log}
              onChange={e => setLog(e.target.value)}
              spellCheck={false}
              placeholder="Paste network logs here..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", color: "#7daacc", fontFamily: "Courier New, monospace", fontSize: 11, lineHeight: 1.65, padding: 13, overflowY: "auto" }}
            />
          </div>

          {/* Progress bar */}
          {analyzing && (
            <div style={{ height: 3, background: "#0a1628", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#0066cc,#00d4ff)", transition: "width 0.1s ease", borderRadius: 2 }} />
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={analyze}
              disabled={analyzing || !log.trim()}
              style={{ flex: 1, padding: "11px 0", background: analyzing ? "#0a1628" : "linear-gradient(135deg,#003566,#0066cc)", border: `1px solid ${analyzing ? "#1a2a44" : "#0077ee"}`, borderRadius: 8, color: analyzing ? "#445566" : "#fff", fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", cursor: analyzing ? "not-allowed" : "pointer", textTransform: "uppercase" }}
            >
              {analyzing ? `SCANNING ${Math.round(progress)}%` : "ANALYZE LOGS"}
            </button>
            <button
              onClick={() => { setLog(SAMPLE_LOG); setResults(null); setProgress(0); }}
              disabled={analyzing}
              style={{ flex: 1, padding: "11px 0", background: "transparent", border: "1px solid #1a2a44", borderRadius: 8, color: "#6688aa", fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase" }}
            >
              LOAD SAMPLE
            </button>
          </div>
        </div>

        {/* RIGHT — Results */}
        <div style={{ padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Results header */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", background: "#060b16", border: "1px solid #1a2a44", borderRadius: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Anomaly Detection Results</span>
          </div>

          {/* Idle */}
          {!results && !analyzing && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "#334455", textAlign: "center", padding: "30px 20px" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1a2a44" strokeWidth="1">
                <rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/>
                <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>
              </svg>
              <p style={{ fontSize: 11, lineHeight: 1.65 }}>Paste network logs or load a sample,<br/>then click <strong style={{ color: "#4a7099" }}>ANALYZE LOGS</strong></p>
            </div>
          )}

          {/* Scanning spinner */}
          {analyzing && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
              <div style={{ position: "relative", width: 60, height: 60 }}>
                <svg viewBox="0 0 60 60" width="60" height="60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#1a2a44" strokeWidth="2"/>
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#00d4ff" strokeWidth="2"
                    strokeDasharray={`${(progress / 100) * 163} 163`} strokeLinecap="round" transform="rotate(-90 30 30)"/>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#00d4ff", fontWeight: 700 }}>
                  {Math.round(progress)}%
                </div>
              </div>
              <p style={{ color: "#445566", fontSize: 10, letterSpacing: "0.12em" }}>RUNNING ISOLATION FOREST...</p>
            </div>
          )}

          {/* Threat cards */}
          {results && results.map((r, i) => <AnomalyCard key={i} r={r} idx={i} />)}

          {/* Summary */}
          {results && (
            <div style={{ padding: "11px 13px", background: "#050d1c", border: "1px solid #1a2a44", borderRadius: 8, fontSize: 10, color: "#334455", lineHeight: 1.85 }}>
              <div>Model: <span style={{ color: "#4a7099" }}>Isolation Forest</span></div>
              <div>Events analyzed: <span style={{ color: "#6688aa" }}>{lineCount}</span></div>
              <div>Anomalies found: <span style={{ color: results[0].type === "Normal" ? "#6bcb77" : "#ff8c00" }}>{results[0].type === "Normal" ? 0 : results.length}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}