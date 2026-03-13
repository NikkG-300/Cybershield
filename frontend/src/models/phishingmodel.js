export function detectPhishing(email){

  const keywords = [
    "urgent","verify","account","password",
    "click","login","bank","confirm"
  ]

  const urls = email.match(/https?:\/\/[^\s]+/g) || []

  let score = 0

  if(urls.length>0) score+=20

  keywords.forEach(k=>{
    if(email.toLowerCase().includes(k)) score+=5
  })

  if(urls.some(u=>/\d+\.\d+\.\d+\.\d+/.test(u))) score+=30

  const isPhishing = score>40

  return {

    isPhishing,
    confidence: Math.min(score,99),
    severity: score>70?"Critical":score>40?"High":"Low"

  }

}