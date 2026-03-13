export function detectGPS(points){

  const anomalies=[]

  const MAX_SPEED = 900

  function distance(p1,p2){

    const R=6371

    const dLat=(p2.lat-p1.lat)*Math.PI/180
    const dLon=(p2.lon-p1.lon)*Math.PI/180

    const a=Math.sin(dLat/2)**2+
    Math.cos(p1.lat*Math.PI/180)*
    Math.cos(p2.lat*Math.PI/180)*
    Math.sin(dLon/2)**2

    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
  }

  for(let i=1;i<points.length;i++){

    const dist=distance(points[i-1],points[i])
    const time=(points[i].ts-points[i-1].ts)/3600000

    const speed=dist/time

    if(speed>MAX_SPEED){

      anomalies.push({index:i,speed})

    }

  }

  return anomalies
}