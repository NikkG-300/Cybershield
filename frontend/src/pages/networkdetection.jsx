import {useState} from "react"
import { analyzeNetwork } from "../api/api"

export default function NetworkDetection(){

const [log,setLog]=useState("")
const [result,setResult]=useState(null)

function analyze(){

setResult(analyzeNetwork(log))

}

return(

<div style={{padding:20}}>

<h2>Network Threat Detection</h2>

<textarea
rows="12"
cols="60"
value={log}
onChange={(e)=>setLog(e.target.value)}
/>

<br/><br/>

<button onClick={analyze}>Analyze Logs</button>

{result && result.map((r,i)=>(
<div key={i}>

<h3>{r.type}</h3>
<p>{r.desc}</p>

</div>
))}

</div>

)

}