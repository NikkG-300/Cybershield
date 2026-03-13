import { useState } from "react";

const MAX_SPEED = 900;

function haversine(p1, p2) {
  const R = 6371;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lon - p1.lon) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function detectGPS(points) {
  const anomalies = [];
  for (let i = 1; i < points.length; i++) {
    const dist = haversine(points[i - 1], points[i]);
    const timeDiff = (points[i].ts - points[i - 1].ts) / 3600000;
    const speed = timeDiff > 0 ? dist / timeDiff : Infinity;
    if (speed > MAX_SPEED) {
      anomalies.push({ idx: i, speed: Math.round(speed), dist: Math.round(dist), timeDiff: Math.round(timeDiff * 60), severity: speed > 5000 ? "CRITICAL" : "HIGH", from: `${points[i-1].lat.toFixed(2)}°, ${points[i-1].lon.toFixed(2)}°`, to: `${points[i].lat.toFixed(2)}°, ${points[i].lon.toFixed(2)}°` });
    }
  }
  return anomalies;
}

const PRESET_SCENARIOS = [
  {
    label: "NYC → Moscow Jump",
    desc: "Impossible intercontinental teleport",
    points: [
      { lat: 40.7128, lon: -74.0060, ts: Date.now() - 3600000, label: "New York, USA" },
      { lat: 40.7580, lon: -73.9855, ts: Date.now() - 2700000, label: "Manhattan, USA" },
      { lat: 55.7558, lon: 37.6176, ts: Date.now() - 1800000, label: "Moscow, Russia" },
      { lat: 55.8000, lon: 37.7000, ts: Date.now() - 900000,  label: "Moscow Suburbs" },
    ]
  },
  {
    label: "Normal Commute",
    desc: "Legitimate local travel pattern",
    points: [
      { lat: 51.5074, lon: -0.1278, ts: Date.now() - 3600000, label: "London Central" },
      { lat: 51.5155, lon: -0.1418, ts: Date.now() - 3000000, label: "Paddington" },
      { lat: 51.5227, lon: -0.1547, ts: Date.now() - 2400000, label: "Notting Hill" },
      { lat: 51.5074, lon: -0.1676, ts: Date.now() - 1800000, label: "Holland Park" },
    ]
  },
  {
    label: "Multi-Hop Spoof",
    desc: "Multiple impossible location jumps",
    points: [
      { lat: 35.6762, lon: 139.6503, ts: Date.now() - 7200000, label: "Tokyo, Japan" },
      { lat: -33.8688, lon: 151.2093, ts: Date.now() - 5400000, label: "Sydney, Australia" },
      { lat: 51.5074, lon: -0.1278, ts: Date.now() - 3600000, label: "London, UK" },
      { lat: 40.7128, lon: -74.0060, ts: Date.now() - 1800000, label: "New York, USA" },
    ]
  }
];

const SEV_STYLE = {
  CRITICAL: { color: "#ff4444", bg: "#3a0000", border: "#ff2222" },
  HIGH:     { color: "#ff8c00", bg: "#3a1800", border: "#ff6b35" },
  MEDIUM:   { color: "#ffd93d", bg: "#2a2a00", border: "#ccaa00" },
  NONE:     { color: "#6bcb77", bg: "#002a00", border: "#44aa55" },
};

function Badge({ severity }) {
  const s = SEV_STYLE[severity] || SEV_STYLE.NONE;
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 3, padding: "2px 7px", fontFamily: "Courier New, monospace" }}>{severity}</span>;
}

function MiniMap({ points, anomalies }) {
  const W = 460, H = 220, PAD = 20;
  if (!points.length) return null;

  const lats = points.map(p => p.lat), lons = points.map(p => p.lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const rangeH = maxLat - minLat || 1, rangeW = maxLon - minLon || 1;

  function proj(lat, lon) {
    return {
      x: PAD + ((lon - minLon) / rangeW) * (W - PAD * 2),
      y: PAD + ((maxLat - lat) / rangeH) * (H - PAD * 2),
    };
  }

  const projected = points.map((p, i) => ({ ...proj(p.lat, p.lon), ...p, i }));
  const anomalyIdxs = new Set(anomalies.map(a => a.idx));

  return (
    <div style={{ background: "#050a14", border: "1px solid #1a2a44", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "8px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", fontSize: 10, color: "#4a7099", letterSpacing: "0.1em" }}>TRAJECTORY MAP</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: "#050a14" }}>
        {/* Grid */}
        {[...Array(5)].map((_, i) => (
          <line key={`h${i}`} x1={PAD} y1={PAD + i * (H - PAD * 2) / 4} x2={W - PAD} y2={PAD + i * (H - PAD * 2) / 4} stroke="#0d1533" strokeWidth="1" />
        ))}
        {[...Array(7)].map((_, i) => (
          <line key={`v${i}`} x1={PAD + i * (W - PAD * 2) / 6} y1={PAD} x2={PAD + i * (W - PAD * 2) / 6} y2={H - PAD} stroke="#0d1533" strokeWidth="1" />
        ))}

        {/* Path lines */}
        {projected.slice(1).map((p, i) => {
          const prev = projected[i];
          const isAnom = anomalyIdxs.has(i + 1);
          return <line key={i} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y} stroke={isAnom ? "#ff4444" : "#00d4ff"} strokeWidth={isAnom ? 1.5 : 1} strokeDasharray={isAnom ? "4,3" : "none"} strokeOpacity="0.7" />;
        })}

        {/* Points */}
        {projected.map((p, i) => {
          const isAnom = anomalyIdxs.has(i);
          return (
            <g key={i}>
              {isAnom && <circle cx={p.x} cy={p.y} r="12" fill="#ff444418" stroke="#ff4444" strokeWidth="0.5" />}
              <circle cx={p.x} cy={p.y} r="5" fill={isAnom ? "#ff4444" : "#00d4ff"} />
              <circle cx={p.x} cy={p.y} r="2" fill="white" />
              <text x={p.x + 8} y={p.y - 6} fontSize="8" fill={isAnom ? "#ff4444" : "#6688aa"} fontFamily="monospace">{p.label || `P${i + 1}`}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function GPSDetection() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  function analyze(scenario) {
    setLoading(true);
    setSelected(scenario.label);
    setResult(null);
    setTimeout(() => {
      const anomalies = detectGPS(scenario.points);
      setResult({ anomalies, points: scenario.points, label: scenario.label });
      setLoading(false);
    }, 700);
  }

  const spoofDetected = result && result.anomalies.length > 0;

  return (
    <div style={{ background: "#030811", minHeight: "100vh", color: "#ccd6f6", fontFamily: "Courier New, monospace" }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {result && (
        <div style={{ padding: "7px 16px", background: "#050d1c", borderBottom: "1px solid #1a2a44", display: "flex", gap: 20, alignItems: "center", fontSize: 10, letterSpacing: "0.1em" }}>
          <span style={{ color: "#334455" }}>GPS SPOOF DETECTION · HAVERSINE ALGORITHM</span>
          {spoofDetected
            ? <span style={{ color: "#ff2d2d" }}>⚠ SPOOFING DETECTED: {result.anomalies.length} JUMP{result.anomalies.length > 1 ? "S" : ""}</span>
            : <span style={{ color: "#6bcb77" }}>✓ TRAJECTORY NORMAL</span>}
          <span style={{ color: "#445566", marginLeft: "auto" }}>{result.points.length} WAYPOINTS ANALYZED</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: result ? "calc(100vh - 33px)" : "100vh" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #1a2a44", padding: 14, gap: 10 }}>
          <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "9px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
              <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>GPS Spoof Detection — Haversine</span>
              {loading && <span style={{ marginLeft: "auto", fontSize: 10, color: "#00d4ff", animation: "blink 1s infinite" }}>● ANALYZING</span>}
            </div>
            <div style={{ padding: "10px 13px", fontSize: 10, color: "#445566", borderBottom: "1px solid #0d1a2e" }}>
              Max legitimate speed threshold: <span style={{ color: "#ffd93d" }}>{MAX_SPEED} km/h</span> · Algorithm: Haversine Distance Formula
            </div>
          </div>

          {/* Scenario cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {PRESET_SCENARIOS.map(s => (
              <div key={s.label} onClick={() => analyze(s)} style={{ background: selected === s.label ? "#07101e" : "#05080f", border: `1px solid ${selected === s.label ? "#2a5080" : "#1a2a44"}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ color: selected === s.label ? "#4a9fdd" : "#8899bb", fontWeight: 700, fontSize: 12 }}>{s.label}</span>
                  <span style={{ fontSize: 9, color: "#334455", background: "#0a1628", padding: "2px 6px", borderRadius: 3, border: "1px solid #1a2a44" }}>{s.points.length} WAYPOINTS</span>
                </div>
                <div style={{ fontSize: 10, color: "#445566", marginBottom: 8 }}>{s.desc}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {s.points.map((p, i) => (
                    <span key={i} style={{ fontSize: 9, padding: "2px 6px", background: "#0a1628", border: "1px solid #1a2a44", borderRadius: 3, color: "#4a7099" }}>{p.label || `Point ${i+1}`}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => result && analyze(PRESET_SCENARIOS.find(s => s.label === selected) || PRESET_SCENARIOS[0])} disabled={loading || !selected} style={{ padding: "11px 0", background: loading ? "#0a1628" : "linear-gradient(135deg,#003566,#0066cc)", border: `1px solid ${loading ? "#1a2a44" : "#0077ee"}`, borderRadius: 8, color: loading ? "#445566" : "#fff", fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase" }}>
            {loading ? "ANALYZING..." : "RE-ANALYZE"}
          </button>
        </div>

        {/* RIGHT */}
        <div style={{ padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", background: "#060b16", border: "1px solid #1a2a44", borderRadius: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Detection Results</span>
          </div>

          {!result && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "#334455", textAlign: "center", padding: "30px 20px" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1a2a44" strokeWidth="1"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              <p style={{ fontSize: 11, lineHeight: 1.65 }}>Select a scenario on the left<br/>to run GPS spoofing detection</p>
            </div>
          )}

          {result && (
            <>
              {/* Verdict banner */}
              <div style={{ background: spoofDetected ? "#1a0505" : "#051208", border: `1px solid ${spoofDetected ? "#5a1515" : "#155a30"}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: spoofDetected ? "#ff4444" : "#6bcb77", marginBottom: 4 }}>
                  {spoofDetected ? "⚠ GPS SPOOFING DETECTED" : "✓ TRAJECTORY LEGITIMATE"}
                </div>
                <div style={{ fontSize: 10, color: "#556677" }}>
                  {spoofDetected
                    ? `${result.anomalies.length} impossible movement jump(s) exceed ${MAX_SPEED} km/h threshold`
                    : `All ${result.points.length} waypoints show physically plausible movement`}
                </div>
              </div>

              {/* Map */}
              <MiniMap points={result.points} anomalies={result.anomalies} />

              {/* Anomaly details */}
              {result.anomalies.map((a, i) => (
                <div key={i} style={{ background: "#07101e", border: "1px solid #ff444433", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#ff8844", fontWeight: 700, fontSize: 12 }}>Impossible Jump at Point {a.idx}</span>
                    <Badge severity={a.severity} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10, color: "#445566", marginBottom: 8 }}>
                    <span>Speed: <span style={{ color: "#ff6644", fontWeight: 700 }}>{a.speed.toLocaleString()} km/h</span></span>
                    <span>Distance: <span style={{ color: "#ffaa44" }}>{a.dist.toLocaleString()} km</span></span>
                    <span>From: <span style={{ color: "#7799bb" }}>{a.from}</span></span>
                    <span>To: <span style={{ color: "#7799bb" }}>{a.to}</span></span>
                  </div>
                  <div style={{ fontSize: 9, color: "#553322", background: "#0a0808", padding: "6px 8px", borderRadius: 4 }}>
                    {Math.round(a.speed / MAX_SPEED)}× over threshold — physically impossible without GPS manipulation
                  </div>
                </div>
              ))}

              {/* Waypoint table */}
              <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "8px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", fontSize: 10, color: "#4a7099", letterSpacing: "0.1em" }}>WAYPOINT LOG</div>
                {result.points.map((p, i) => {
                  const isAnom = result.anomalies.some(a => a.idx === i);
                  return (
                    <div key={i} style={{ padding: "8px 13px", borderBottom: i < result.points.length - 1 ? "1px solid #0a1628" : "none", display: "flex", alignItems: "center", gap: 10, background: isAnom ? "#140505" : "transparent" }}>
                      <span style={{ color: isAnom ? "#ff4444" : "#4a7099", fontSize: 10 }}>{isAnom ? "⚡" : "•"}</span>
                      <span style={{ fontSize: 10, color: "#6688aa", minWidth: 60 }}>Point {i + 1}</span>
                      <span style={{ fontSize: 10, color: "#aabbcc", flex: 1 }}>{p.label || `${p.lat.toFixed(3)}°, ${p.lon.toFixed(3)}°`}</span>
                      <span style={{ fontSize: 9, color: "#334455" }}>{p.lat.toFixed(4)}°, {p.lon.toFixed(4)}°</span>
                      {isAnom && <span style={{ fontSize: 9, color: "#ff4444", fontWeight: 700 }}>ANOMALOUS</span>}
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: "11px 13px", background: "#050d1c", border: "1px solid #1a2a44", borderRadius: 8, fontSize: 10, color: "#334455", lineHeight: 1.85 }}>
                <div>Algorithm: <span style={{ color: "#4a7099" }}>Haversine Distance Formula</span></div>
                <div>Max speed threshold: <span style={{ color: "#6688aa" }}>{MAX_SPEED} km/h</span></div>
                <div>Anomalies detected: <span style={{ color: spoofDetected ? "#ff8c00" : "#6bcb77" }}>{result.anomalies.length}</span></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}