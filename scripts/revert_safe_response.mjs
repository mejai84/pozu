import fs from 'fs'

const filePath = 'd:/Jaime/Antigravity/Pozu/workflow_POZU_FULL_FIXED.json'
const w = JSON.parse(fs.readFileSync(filePath, 'utf8'))

w.nodes = w.nodes.map(n => {
  // Revert to simple, safe n8n expression syntax
  if (n.name === 'Responder Datos Incompletos Web') {
    n.parameters.responseBody = '={{ { "success": true, "message": $json.mensaje_incompleto || "¿En qué puedo ayudarte?" } }}'
    console.log('✅ Responder Datos Incompletos Web - reverted to safe expression')
  }
  // Log Responder a Chat Web
  if (n.name === 'Responder a Chat Web') {
    console.log('Responder a Chat Web responseBody:', n.parameters.responseBody)
  }
  return n
})

fs.writeFileSync(filePath, JSON.stringify(w, null, 2))
console.log('✅ Saved.')
