import { useState } from "react";

function scanURL(url) {
  const u = url.toLowerCase().trim();
  const checks = {
    hasIP: /https?:\/\/\d+\.\d+\.\d+\.\d+/.test(u),
    hasSuspiciousTLD: /\.(xyz|tk|ru|cn|onion|cc|info|biz)($|\/)/.test(u),
    hasRedirect: /redirect|goto|url=|link=/.test(u),
    hasEncodedChars: /%[0-9a-f]{2}/.test(u),
    longURL: u.length > 80,
    hasLoginKeyword: /login|signin|verify|confirm|account|secure|bank|paypal|update|password/.test(u),
    hasFakeHTTPS: /http:\/\/(secure|bank|paypal|verify)/.test(u),
    hasUrgency: /urgent|suspend|expire|limited/.test(u),
    hasSubdomainSpoof: /paypal\..*\.com|google\..*\.com|microsoft\..*\.com/.test(u),
  };
  let score = 0;
  if (checks.hasIP) score += 35;
  if (checks.hasSuspiciousTLD) score += 25;
  if (checks.hasLoginKeyword) score += 20;
  if (checks.hasFakeHTTPS) score += 20;
  if (checks.hasRedirect) score += 15;
  if (checks.hasSubdomainSpoof) score += 30;
  if (checks.hasEncodedChars) score += 10;
  if (checks.longURL) score += 8;
  if (checks.hasUrgency) score += 12;

  const risk = score >= 60 ? "MALICIOUS" : score >= 30 ? "SUSPICIOUS" : "CLEAN";
  const severity = score >= 60 ? "CRITICAL" : score >= 30 ? "HIGH" : "LOW";

  const findings = [];
  if (checks.hasIP) findings.push({ label: "IP-based URL", detail: "Uses raw IP instead of domain — common in phishing", risk: "HIGH" });
  if (checks.hasSuspiciousTLD) findings.push({ label: "Suspicious TLD", detail: "Domain uses high-risk top-level domain", risk: "MEDIUM" });
  if (checks.hasLoginKeyword) findings.push({ label: "Login/Credential Keywords", detail: "URL contains terms associated with credential theft", risk: "MEDIUM" });
  if (checks.hasFakeHTTPS) findings.push({ label: "HTTP on Secure Domain", detail: "Unencrypted connection to a security-sensitive page", risk: "HIGH" });
  if (checks.hasSubdomainSpoof) findings.push({ label: "Domain Spoofing", detail: "Mimics a trusted brand via subdomain", risk: "CRITICAL" });
  if (checks.hasRedirect) findings.push({ label: "Open Redirect", detail: "URL contains redirect parameters", risk: "MEDIUM" });
  if (checks.hasEncodedChars) findings.push({ label: "URL Encoding", detail: "Encoded characters may obfuscate malicious intent", risk: "LOW" });
  if (checks.longURL) findings.push({ label: "Abnormally Long URL", detail: `URL length: ${u.length} chars — may hide destination`, risk: "LOW" });

  try {
    const parsed = new URL(url.startsWith("http") ? url : "http://" + url);
    return { risk, severity, score: Math.min(score, 100), findings, checks, domain: parsed.hostname, path: parsed.pathname, protocol: parsed.protocol };
  } catch {
    return { risk, severity, score: Math.min(score, 100), findings, checks, domain: url, path: "/", protocol: "unknown:" };
  }
}

const RISK_STYLE = {
  MALICIOUS:  { color: "#ff4444", bg: "#3a0000", border: "#ff2222" },
  SUSPICIOUS: { color: "#ff8c00", bg: "#3a1800", border: "#ff6b35" },
  CLEAN:      { color: "#6bcb77", bg: "#002a00", border: "#44aa55" },
};
const SEV_STYLE = {
  CRITICAL: { color: "#ff4444", bg: "#3a0000", border: "#ff2222" },
  HIGH:     { color: "#ff8c00", bg: "#3a1800", border: "#ff6b35" },
  MEDIUM:   { color: "#ffd93d", bg: "#2a2a00", border: "#ccaa00" },
  LOW:      { color: "#6bcb77", bg: "#002a00", border: "#44aa55" },
};

function RiskBadge({ label, style }) {
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: style.color, background: style.bg, border: `1px solid ${style.border}`, borderRadius: 3, padding: "2px 7px", fontFamily: "Courier New, monospace" }}>{label}</span>;
}

const SAMPLES = [
  "http://192.168.1.1/banklogin?confirm=true",
  "https://secure-paypal-verify.xyz/account",
  "https://google.com",
  "http://secure-bank-verify.xyz/account-restore?urgent=1"
];

export default function URLScan() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  function scan() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = scanURL(url);
      setResult(r);
      setHistory(prev => [{ url, ...r, id: Date.now() }, ...prev].slice(0, 8));
      setLoading(false);
    }, 600);
  }

  function handleKey(e) { if (e.key === "Enter") scan(); }

  return (
    <div style={{ background: "#030811", minHeight: "100vh", color: "#ccd6f6", fontFamily: "Courier New, monospace" }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #1a2a44", padding: 14, gap: 10 }}>

          <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "9px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>URL Scanner — Heuristic Analysis</span>
              {loading && <span style={{ marginLeft: "auto", fontSize: 10, color: "#00d4ff", animation: "blink 1s infinite" }}>● SCANNING</span>}
            </div>
            <div style={{ padding: 13 }}>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Enter URL to scan... (e.g. https://example.com)"
                spellCheck={false}
                style={{ width: "100%", background: "#030811", border: "1px solid #1a2a44", borderRadius: 6, padding: "10px 12px", color: "#7daacc", fontFamily: "Courier New, monospace", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {loading && (
            <div style={{ height: 3, background: "#0a1628", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "70%", background: "linear-gradient(90deg,#0066cc,#00d4ff)", transition: "width 0.6s ease", borderRadius: 2 }} />
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={scan} disabled={loading || !url.trim()} style={{ flex: 1, padding: "11px 0", background: loading ? "#0a1628" : "linear-gradient(135deg,#003566,#0066cc)", border: `1px solid ${loading ? "#1a2a44" : "#0077ee"}`, borderRadius: 8, color: loading ? "#445566" : "#fff", fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase" }}>
              {loading ? "SCANNING..." : "SCAN URL"}
            </button>
            <button onClick={() => { setUrl(SAMPLES[Math.floor(Math.random() * SAMPLES.length)]); setResult(null); }} style={{ flex: 1, padding: "11px 0", background: "transparent", border: "1px solid #1a2a44", borderRadius: 8, color: "#6688aa", fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase" }}>
              LOAD SAMPLE
            </button>
          </div>

          {/* Scan history */}
          {history.length > 0 && (
            <div style={{ background: "#05080f", border: "1px solid #1a2a44", borderRadius: 10, overflow: "hidden", flex: 1 }}>
              <div style={{ padding: "8px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", fontSize: 10, color: "#4a7099", letterSpacing: "0.1em" }}>SCAN HISTORY</div>
              <div style={{ overflowY: "auto", maxHeight: 280 }}>
                {history.map(h => (
                  <div key={h.id} onClick={() => { setUrl(h.url); setResult(scanURL(h.url)); }} style={{ padding: "8px 13px", borderBottom: "1px solid #0a1628", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: RISK_STYLE[h.risk]?.color || "#6688aa", flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: "#6688aa", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.url}</span>
                    <RiskBadge label={h.risk} style={RISK_STYLE[h.risk] || RISK_STYLE.CLEAN} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", background: "#060b16", border: "1px solid #1a2a44", borderRadius: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7099" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ color: "#4a8fbb", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Scan Results</span>
          </div>

          {!result && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "#334455", textAlign: "center", padding: "30px 20px" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1a2a44" strokeWidth="1"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <p style={{ fontSize: 11, lineHeight: 1.65 }}>Enter a URL above and click<br/><strong style={{ color: "#4a7099" }}>SCAN URL</strong> to analyze</p>
            </div>
          )}

          {result && (
            <>
              {/* Risk verdict */}
              <div style={{ background: "#07101e", border: `1px solid ${RISK_STYLE[result.risk].border}44`, borderRadius: 10, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ color: RISK_STYLE[result.risk].color, fontWeight: 700, fontSize: 15 }}>{result.risk}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "#445566" }}>Risk Score:</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: RISK_STYLE[result.risk].color }}>{result.score}</span>
                    <span style={{ fontSize: 10, color: "#334455" }}>/100</span>
                  </div>
                </div>
                {/* Score bar */}
                <div style={{ height: 6, background: "#0a1628", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${result.score}%`, background: RISK_STYLE[result.risk].color, borderRadius: 3, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 10, color: "#445566" }}>
                  <span>Domain: <span style={{ color: "#7799bb" }}>{result.domain}</span></span>
                  <span>Protocol: <span style={{ color: result.protocol === "https:" ? "#6bcb77" : "#ff8c00" }}>{result.protocol}</span></span>
                  <span>Path: <span style={{ color: "#4a7099" }}>{result.path}</span></span>
                </div>
              </div>

              {/* Findings */}
              {result.findings.length > 0 && (
                <div style={{ background: "#07101e", border: "1px solid #1a2a44", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "8px 13px", borderBottom: "1px solid #1a2a44", background: "#060b16", fontSize: 10, color: "#4a7099", letterSpacing: "0.1em" }}>THREAT INDICATORS ({result.findings.length})</div>
                  {result.findings.map((f, i) => (
                    <div key={i} style={{ padding: "10px 13px", borderBottom: i < result.findings.length - 1 ? "1px solid #0a1628" : "none", display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <RiskBadge label={f.risk} style={SEV_STYLE[f.risk] || SEV_STYLE.LOW} />
                      <div>
                        <div style={{ fontSize: 11, color: "#aabbcc", fontWeight: 700, marginBottom: 2 }}>{f.label}</div>
                        <div style={{ fontSize: 10, color: "#556677" }}>{f.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.findings.length === 0 && (
                <div style={{ background: "#05120a", border: "1px solid #1a4422", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ color: "#6bcb77", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>✓ NO THREATS DETECTED</div>
                  <div style={{ fontSize: 10, color: "#334455" }}>URL appears clean based on heuristic analysis</div>
                </div>
              )}

              <div style={{ padding: "11px 13px", background: "#050d1c", border: "1px solid #1a2a44", borderRadius: 8, fontSize: 10, color: "#334455", lineHeight: 1.85 }}>
                <div>Engine: <span style={{ color: "#4a7099" }}>Heuristic URL Analyzer v2.1</span></div>
                <div>Checks run: <span style={{ color: "#6688aa" }}>{Object.keys(result.checks).length}</span></div>
                <div>Indicators found: <span style={{ color: result.findings.length ? "#ff8c00" : "#6bcb77" }}>{result.findings.length}</span></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}