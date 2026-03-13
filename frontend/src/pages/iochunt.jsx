export default function IOCHunt(){

return(

<div className="panel">

<h2>IOC Threat Intelligence Hunter</h2>

<div className="grid">

<div className="card">

<textarea
placeholder="Paste hashes, IPs, domains, CVE IDs..."
></textarea>

<button>HUNT IOCs</button>

</div>

<div className="card">

<h3>Threat Intelligence Results</h3>

<p>No results yet</p>

</div>

</div>

</div>

)

}