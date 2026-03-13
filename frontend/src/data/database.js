export const DB = {
  threats: [],
  nextId: 1
}

export function addThreat(threat){

  DB.threats.push({
    id: DB.nextId++,
    ...threat,
    ts: Date.now()
  })

}

export function getThreats(){

  return DB.threats

}