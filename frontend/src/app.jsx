import { useState } from "react"

import Dashboard from "./pages/dashboard"
import EmailDetection from "./pages/emaildetection"
import NetworkDetection from "./pages/networkdetection"
import GPSDetection from "./pages/gpsdetection"

import IOC from "./pages/iochunt"
import URLScan from "./pages/urlscan"
import Vault from "./pages/vault"
import Simulate from "./pages/simulate"

import "./App.css"

function App() {

const [tab,setTab] = useState("dashboard")

return (

<div className="app">

<header className="header">

<h1>CYBERSHIELD AI</h1>

<nav className="nav">

<button onClick={()=>setTab("dashboard")}>Dashboard</button>
<button onClick={()=>setTab("email")}>AI Analyzer</button>
<button onClick={()=>setTab("network")}>Network</button>
<button onClick={()=>setTab("ioc")}>IOC Hunt</button>
<button onClick={()=>setTab("url")}>URL Scan</button>
<button onClick={()=>setTab("gps")}>GPS Spoof</button>
<button onClick={()=>setTab("vault")}>Vault</button>
<button onClick={()=>setTab("simulate")}>Simulate</button>

</nav>

</header>

<main className="main">

{tab==="dashboard" && <Dashboard/>}
{tab==="email" && <EmailDetection/>}
{tab==="network" && <NetworkDetection/>}
{tab==="ioc" && <IOC/>}
{tab==="url" && <URLScan/>}
{tab==="gps" && <GPSDetection/>}
{tab==="vault" && <Vault/>}
{tab==="simulate" && <Simulate/>}

</main>

</div>

)

}

export default App