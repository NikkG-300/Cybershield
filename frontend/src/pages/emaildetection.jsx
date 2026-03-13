import {useState} from "react"
import { analyzeEmail } from "../api/api"

export default function EmailDetection(){

const [text,setText]=useState("")
const [result,setResult]=useState(null)

function analyze(){

const r=analyzeEmail(text)

setResult(r)

}

return(

<div style={{padding:20}}>

<h2>Email Phishing Detection</h2>

<textarea
rows="10"
cols="60"
value={text}
onChange={(e)=>setText(e.target.value)}
/>

<br/><br/>

<button onClick={analyze}>Analyze Email</button>

{result && (

<div>

<h3>{result.isPhishing?"PHISHING":"SAFE"}</h3>
<p>Confidence: {result.confidence}</p>

</div>

)}

</div>

)

}