import { getThreats } from "../data/database"

export default function Dashboard(){

const threats = getThreats()

return(

<div style={{padding:20}}>

<h2>Cyber Threat Dashboard</h2>

<p>Total threats: {threats.length}</p>

</div>

)

}