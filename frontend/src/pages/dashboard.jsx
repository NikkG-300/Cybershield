import WorldMap from "../components/worldmap"
import RiskGauge from "../components/riskgauge"
import DonutChart from "../components/donutchart"
import TimelineChart from "../components/timelinechart"

export default function Dashboard() {

const sampleThreats = [

{type:"Phishing", severity:"Critical", lat:6.5, lng:3.4},
{type:"DDoS", severity:"High", lat:55.75, lng:37.6},
{type:"Brute Force", severity:"Medium", lat:31.2, lng:121.5},
{type:"GPS Spoof", severity:"High", lat:35.7, lng:51.4},

]

const categoryData = {

Application:4,
Malware:4,
"Social Eng":2,
Network:2,
"Supply Chain":2,
Physical:1

}

const timelineData = [

{label:"1h",count:2},
{label:"2h",count:3},
{label:"3h",count:5},
{label:"4h",count:4},
{label:"5h",count:6},
{label:"6h",count:3},
{label:"7h",count:2},
{label:"8h",count:1},

]

return(

<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>

{/* Stats Row */}

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px"}}>

<div className="card">
<h2>15</h2>
<p>Total Threats</p>
</div>

<div className="card">
<h2>8</h2>
<p>Critical</p>
</div>

<div className="card">
<h2>11</h2>
<p>Attack Types</p>
</div>

<div className="card">
<h2>100</h2>
<p>Risk Score</p>
</div>

</div>

{/* Map + Risk */}

<div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"16px"}}>

<div className="card">
<h3>Global Attack Map</h3>
<WorldMap threats={sampleThreats}/>
</div>

<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

<div className="card">
<h3>Cyber Risk Score</h3>
<RiskGauge score={100}/>
</div>

<div className="card">
<h3>By Category</h3>
<DonutChart data={categoryData}/>
</div>

</div>

</div>

{/* Timeline */}

<div className="card">

<h3>Threat Timeline</h3>

<TimelineChart data={timelineData}/>

</div>

</div>

)

}