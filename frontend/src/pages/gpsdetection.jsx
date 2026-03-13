import { analyzeGPS } from "../api/api"

export default function GPSDetection(){

function run(){

const points=[

{lat:40,lon:-74,ts:Date.now()-3600000},
{lat:55,lon:37,ts:Date.now()-1800000}

]

console.log(analyzeGPS(points))

}

return(

<div style={{padding:20}}>

<h2>GPS Spoof Detection</h2>

<button onClick={run}>
Run Detection
</button>

</div>

)

}