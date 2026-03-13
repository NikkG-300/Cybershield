import { useState } from "react"
import { analyzeEmail } from "../api/api"

export default function EmailDetection(){

const [text,setText] = useState("")
const [result,setResult] = useState(null)

function analyze(){

if(!text){
alert("Please enter or load an email first")
return
}

const r = analyzeEmail(text)
setResult(r)

}

function loadSample(){

const sampleEmail = `Dear Customer,

Your account has been SUSPENDED due to suspicious activity.

URGENT: Verify your identity at http://192.168.1.1/banklogin?confirm=true

Click here to CONFIRM your password within 24 hours or lose access.

http://secure-bank-verify.xyz/account-restore?urgent=1

Best,
Security Team`

setText(sampleEmail)

}

return(

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>

{/* LEFT PANEL */}

<div className="card">

<h3>Email Input — Random Forest Classifier</h3>

<textarea
rows="15"
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="Paste suspicious email here..."
/>

<div style={{marginTop:"15px",display:"flex",gap:"10px"}}>

<button onClick={analyze}>
ANALYZE EMAIL
</button>

<button onClick={loadSample}>
LOAD SAMPLE
</button>

</div>

</div>

{/* RIGHT PANEL */}

<div className="card">

<h3>Analysis Result</h3>

{result && (

<div>

{/* RESULT CARD */}

<div style={{
background:"#4c1111",
padding:"20px",
borderRadius:"10px",
marginBottom:"20px"
}}>

<h2>
{result.isPhishing ? "PHISHING DETECTED" : "SAFE"}
</h2>

<p>Confidence: {result.confidence}%</p>

<p>Severity: {result.severity}</p>

<p>Model: Random Forest</p>

</div>

{/* FEATURES */}

{result.features && (

<div>

<h4>Extracted Features</h4>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"10px"
}}>

<div>Has URLs: {result.features.hasUrls ? "YES":"NO"}</div>

<div>URL Count: {result.features.urlCount}</div>

<div>Has IP URL: {result.features.hasIpUrl ? "YES":"NO"}</div>

<div>Long URLs: {result.features.longUrls}</div>

<div>Suspicious Keywords: {result.features.suspiciousKeywords}</div>

<div>Fake Urgency: {result.features.fakeUrgency ? "YES":"NO"}</div>

<div>Special Characters: {result.features.manySpecialChars ? "YES":"NO"}</div>

<div>All Caps: {result.features.allCaps ? "YES":"NO"}</div>

<div>Missing Personal Info: {result.features.missingPersonalInfo ? "YES":"NO"}</div>

</div>

</div>

)}

{/* EXTRACTED URLS */}

{result.urls && (

<div style={{marginTop:"20px"}}>

<h4>Extracted URLs</h4>

<ul>

{result.urls.map((u,i)=>(
<li key={i}>{u}</li>
))}

</ul>

</div>

)}

</div>

)}

</div>

</div>

)

}