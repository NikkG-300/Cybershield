export default function DonutChart({ data }) {

return (

<div>

<h4>Threat Categories</h4>

<ul>

{Object.entries(data).map(([key,value])=>(
<li key={key}>
{key}: {value}
</li>
))}

</ul>

</div>

)

}