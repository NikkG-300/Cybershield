export function detectNetwork(log){

  const lines = log.split("\n")

  const ipCount = {}

  lines.forEach(l=>{

    const ip = l.match(/(\d+\.\d+\.\d+\.\d+)/)

    if(ip){

      const address = ip[1]

      ipCount[address] = (ipCount[address] || 0) + 1

    }

  })

  const threats=[]

  Object.entries(ipCount).forEach(([ip,count])=>{

    if(count>50){

      threats.push({
        type:"DDoS",
        ip,
        severity:"High",
        desc:`DDoS suspected from ${ip}`
      })

    }

  })

  if(threats.length===0){

    threats.push({
      type:"Normal",
      severity:"None",
      desc:"Traffic Normal"
    })

  }

  return threats
}