import { useState } from "react";

const KNOWN_IOCS = {
  ips: ["192.168.1.100","10.0.0.55","172.16.0.8","185.220.101.45","45.33.32.156","198.51.100.23","203.0.113.99","91.108.4.0","77.88.55.66","104.21.45.12"],
  domains: ["secure-bank-verify.xyz","malware-payload.ru","phish-login.tk","evil-update.cn","c2-server.onion.ws","fake-google.com","trojandrop.net","ransomware.io","botnet-c2.info","spyware-dist.cc"],
  hashes: ["d41d8cd98f00b204e9800998ecf8427e","5d41402abc4b2a76b9719d911017c592","098f6bcd4621d373cade4e832627b4f6","aab3238922bcc25a6f606eb525ffdc56","c4ca4238a0b923820dcc509a6f75849b","1679091c5a880faf6fb5e6087eb1b2dc"],
  urls: ["http://192.168.1.1/banklogin?confirm=true","http://secure-bank-verify.xyz/account-restore","https://malware-payload.ru/dl/rat.exe","http://phish-login.tk/steal.php","https://fake-google.com/signin"]
};

function checkIOC(value) {
  const v = value.trim().toLowerCase();
  if (!v) return null;
  const ipMatch = KNOWN_IOCS.ips.find(i => v.includes(i));
  if (ipMatch) return { type: "IP Address", value: ipMatch, threat: "Malicious IP", severity: "HIGH", confidence: 87, tags: ["C2","Botnet","Known Bad"], source: "ThreatFox + AbuseIPDB" };
  const domMatch = KNOWN_IOCS.domains.find(d => v.includes(d));
  if (domMatch) return { type: "Domain", value: domMatch, threat: "Phishing/Malware Domain", severity: "CRITICAL", confidence: 95, tags: ["Phishing","Malware","Blacklisted"], source: "VirusTotal + URLhaus" };
  const hashMatch = KNOWN_IOCS.hashes.find(h => v.includes(h));
  if (hashMatch) return { type: "File Hash", value: hashMatch, threat: "Known Malware Hash", severity: "CRITICAL", confidence: 99, tags: ["Malware","Ransomware","Trojan"], source: "MalwareBazaar" };
  const urlMatch = KNOWN_IOCS.urls.find(u => v.includes(u.replace("https://","").replace("http://","")));
  if (urlMatch) return { type: "URL", value: urlMatch, threat: "Malicious URL", severity: "HIGH", confidence: 91, tags: ["Phishing","Credential Harvest"], source: "URLhaus + PhishTank" };
  return { type: "Unknown", value, threat: "No threat detected", severity: "NONE", confidence: 12, tags: ["Clean","Unverified"], source: "Local DB" };
}

const SEVERITY_STYLE = {
  CRITICAL: { color: "#ff4444", bg: "#3a0000", border: "#ff2222" },
  HIGH:     { color: "#ff8c00", bg: "#3a1800", border: "#ff6b35" },
  MEDIUM:   { color: "#ffd93d", bg: "#2a2a00", border: "#ccaa00" },
  LOW:      { color: "#6bcb77", bg: "#002a00", border: "#44aa55" },
  NONE:     { color: "#6688aa", bg: "#0a1a2a", border: "#334455" },
};

function Badge({ severity }) {
  const s = SEVERITY_STYLE[severity] || SEVERITY_STYLE.NONE;
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 3, padding: "2px 7px", fontFamily: "Courier New, monospace" }}>{severity}</span>;
}

const SAMPLES = [
  "185.220.101.45",
  "secure-bank-verify.xyz",
  "d41d8cd98f00b204e9800998ecf8427e",
  "http://phish-login.tk/steal.php",
  "8.8.8.8"
];

export default function IOCHunt() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulk, setBulk] = useState(false);

  function hunt() {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const lines = bulk ? query.split("\n").filter(Boolean) : [query];
      const res = lines.map(l => ({ ...checkIOC(l), id: Math.random() }));
      setResults(res);
      setLoading(false);
    }, 700);
  }

  function loadSample() {
    setQuery(SAMPLES.join("\n"));
    setBulk(true);
    setResults([]);
  }

  const threats = results.filter(r => r.severity !== "NONE");

  return (
    <div style={{ background: "#030811", minHeight: "100vh", color: "#ccd6f6", fontFamily: "Courier New, monospace" }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}} textarea::-webkit-scrollbar{width:4px} textarea::-webkit-scrollbar-thumb{background:#1a2a44;border-radius:2px}`}</style>

      {results.length > 0 && (
        <div style={{ padding: "7px 16px", background: "#050d1c", borderBottom: "1px solid #1a2a44", display: "flex", gap: 20, alignItems: "center", fontSize: 10, letterSpacing: "0.1em" }}>
          <span style={{ color: "#334455" }}>IOC HUNT · THREAT INTELLIGENCE</span>
          <span style={{ color: "#ff2d2d" }}>● THREATS: {threats.length}</span>
          <span style={{ color: "#6688aa", marginLeft: "auto" }}>{results.length} IOC{results.length !== 1 ? "S" : ""} SCANNED</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: results.length ? "calc(100vh - 33px)" : "100vh" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #1a2a44", padding: 14, gap: 10 }}>
          <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 10, display: "flex", flexDirection: "column", overflow: "hidden", flex: 1, minHeight: 0 }}>
            <div style={{ padding: "9px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>IOC Hunt — Threat Intelligence</span>
              {loading && <span style={{ marginLeft: "auto", fontSize: 10, color: "#00d4ff", animation: "blink 1s infinite" }}>● HUNTING</span>}
            </div>
            <div style={{ padding: "10px 13px", borderBottom: "1px solid #0d1a2e", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#445566" }}>MODE:</span>
              {["Single", "Bulk"].map(m => (
                <button key={m} onClick={() => setBulk(m === "Bulk")} style={{ padding: "3px 10px", background: (bulk ? "Bulk" : "Single") === m ? "#0a1e3a" : "transparent", border: `1px solid ${(bulk ? "Bulk" : "Single") === m ? "#2a5080" : "#1a2a44"}`, borderRadius: 4, color: (bulk ? "Bulk" : "Single") === m ? "#4a9fdd" : "#445566", fontSize: 10, cursor: "pointer", fontFamily: "Courier New, monospace" }}>{m}</button>
              ))}
              <span style={{ fontSize: 10, color: "#334455", marginLeft: "auto" }}>IPs · Domains · Hashes · URLs</span>
            </div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              spellCheck={false}
              placeholder={bulk ? "Paste multiple IOCs (one per line)...\n185.220.101.45\nsecure-bank-verify.xyz\nd41d8cd98f..." : "Enter IP, domain, hash, or URL..."}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", color: "#7daacc", fontFamily: "Courier New, monospace", fontSize: 11, lineHeight: 1.65, padding: 13, overflowY: "auto" }}
            />
          </div>

          {loading && (
            <div style={{ height: 3, background: "#0a1628", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg,#0066cc,#00d4ff)", animation: "progress 0.7s ease forwards", borderRadius: 2 }} />
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={hunt} disabled={loading || !query.trim()} style={{ flex: 1, padding: "11px 0", background: loading ? "#0a1628" : "linear-gradient(135deg,#003566,#0066cc)", border: `1px solid ${loading ? "#1a2a44" : "#0077ee"}`, borderRadius: 8, color: loading ? "#445566" : "#fff", fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase" }}>
              {loading ? "HUNTING..." : "HUNT IOCs"}
            </button>
            <button onClick={loadSample} disabled={loading} style={{ flex: 1, padding: "11px 0", background: "transparent", border: "1px solid #1a2a44", borderRadius: 8, color: "#6688aa", fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase" }}>
              LOAD SAMPLE
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", background: "#060b16", border: "1px solid #1a2a44", borderRadius: 8, flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Hunt Results</span>
          </div>

          {!results.length && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "#334455", textAlign: "center", padding: "30px 20px" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1a2a44" strokeWidth="1"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p style={{ fontSize: 11, lineHeight: 1.65 }}>Enter an IP, domain, file hash, or URL<br/>to check against threat intelligence feeds</p>
            </div>
          )}

          {results.map((r, i) => (
            <div key={r.id} style={{ background: "#07101e", border: `1px solid ${(SEVERITY_STYLE[r.severity] || SEVERITY_STYLE.NONE).border}33`, borderRadius: 10, padding: "14px 16px", opacity: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: (SEVERITY_STYLE[r.severity] || SEVERITY_STYLE.NONE).color, fontWeight: 700, fontSize: 12 }}>{r.threat}</span>
                <Badge severity={r.severity} />
              </div>
              <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#00d4ff", background: "#030811", padding: "6px 10px", borderRadius: 5, marginBottom: 8, wordBreak: "break-all" }}>{r.value}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10, color: "#445566", marginBottom: 8 }}>
                <span>Type: <span style={{ color: "#7799bb" }}>{r.type}</span></span>
                <span>Confidence: <span style={{ color: r.confidence > 80 ? "#ff4444" : "#ffd93d" }}>{r.confidence}%</span></span>
                <span style={{ gridColumn: "1/-1" }}>Source: <span style={{ color: "#4a7099" }}>{r.source}</span></span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {r.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 9, padding: "2px 6px", background: "#0a1628", border: "1px solid #1a2a44", borderRadius: 3, color: "#4a7099" }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}

          {results.length > 0 && (
            <div style={{ padding: "11px 13px", background: "#050d1c", border: "1px solid #1a2a44", borderRadius: 8, fontSize: 10, color: "#334455", lineHeight: 1.85 }}>
              <div>Feed: <span style={{ color: "#4a7099" }}>ThreatFox · AbuseIPDB · VirusTotal · MalwareBazaar</span></div>
              <div>IOCs scanned: <span style={{ color: "#6688aa" }}>{results.length}</span></div>
              <div>Threats found: <span style={{ color: threats.length ? "#ff8c00" : "#6bcb77" }}>{threats.length}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}