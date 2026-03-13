export function detectPhishing(email){

const urls = email.match(/https?:\/\/[^\s]+/g) || []

const keywords = [
"urgent",
"verify",
"suspended",
"confirm",
"password",
"bank",
"account"
]

let keywordCount = 0

keywords.forEach(k=>{
if(email.toLowerCase().includes(k)) keywordCount++
})

const hasIpUrl = urls.some(u=>/\d+\.\d+\.\d+\.\d+/.test(u))

const score = urls.length*20 + keywordCount*10 + (hasIpUrl?30:0)

const isPhishing = score > 40

return{

isPhishing,
confidence: Math.min(score,99),
severity: score>70 ? "Critical":"High",

features:{
hasUrls: urls.length>0,
urlCount: urls.length,
hasIpUrl: hasIpUrl,
longUrls: urls.filter(u=>u.length>60).length,
suspiciousKeywords: keywordCount,
fakeUrgency: email.toLowerCase().includes("urgent"),
manySpecialChars: /[@#$%^&*]/.test(email),
allCaps: /[A-Z]{5,}/.test(email),
missingPersonalInfo: !email.includes("Dear")
},

urls: urls

}

}