export default function TimelineChart({ data }) {

return (

<div>

<h4>Threat Timeline</h4>

<ul>

{data.map((item,i)=>(
<li key={i}>
{item.label} : {item.count}
</li>
))}

</ul>

</div>

)

}