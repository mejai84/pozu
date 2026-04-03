import fs from 'fs'

const filePath = 'd:/Jaime/Antigravity/Pozu/workflow_POZU_FULL_FIXED.json'
const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'))

let fixes = 0

// ─────────────────────────────────────────────────────────────────────────
// FIX 1: "Preparar Chat" node
// Currently sets mensaje_incompleto = $json.output (the AI text reply)
// But "Responder Datos Incompletos Web" reads $json.mensaje_incompleto
// frontend expects: { success: true, message: "..." }
// We need to make sure mensaje_incompleto IS the AI reply and success=true
// ─────────────────────────────────────────────────────────────────────────
workflow.nodes = workflow.nodes.map(node => {
  if (node.name === 'Preparar Chat') {
    node.parameters.assignments.assignments = [
      {
        id: 'chat-1',
        name: 'mensaje_incompleto',
        value: "={{ $json.output }}",
        type: 'string'
      },
      {
        id: 'chat-2',
        name: 'canal_origen',
        value: "={{ $('🛡️ Blindar Metadata').item.json.canal_origen }}",
        type: 'string'
      },
      {
        id: 'chat-3',
        name: 'chat_id',
        value: "={{ $('🛡️ Blindar Metadata').item.json.chat_id }}",
        type: 'string'
      },
      {
        id: 'chat-4',
        name: 'nombre_usuario',
        value: "={{ $('🛡️ Blindar Metadata').item.json.nombre_usuario }}",
        type: 'string'
      },
      {
        id: 'chat-5',
        name: 'success',
        value: true,
        type: 'boolean'
      }
    ]
    node.parameters.includeOtherFields = false
    console.log('✅ Fix 1: Preparar Chat - limpiado y con success=true')
    fixes++
  }
  return node
})

// ─────────────────────────────────────────────────────────────────────────
// FIX 2: "Responder Datos Incompletos Web" 
// Must return { success: true, message: "..." } 
// (even for chat responses - success:false confuses the frontend)
// ─────────────────────────────────────────────────────────────────────────
workflow.nodes = workflow.nodes.map(node => {
  if (node.name === 'Responder Datos Incompletos Web') {
    node.parameters.responseBody = `={{
  JSON.stringify({
    "success": $json.success !== undefined ? $json.success : true,
    "message": $json.mensaje_incompleto || "¿En qué puedo ayudarte?"
  })
}}`
    console.log('✅ Fix 2: Responder Datos Incompletos Web - responde success:true con mensaje del AI')
    fixes++
  }
  return node
})

// ─────────────────────────────────────────────────────────────────────────
// FIX 3: "Limpiar Texto" - check what it produces
// If the text field is empty (empty message, emojis, etc.), 
// the agent gets '' and may not respond
// Add a fallback text so the agent always gets something to reply to
// ─────────────────────────────────────────────────────────────────────────
workflow.nodes = workflow.nodes.map(node => {
  if (node.name === 'Limpiar Texto') {
    // Find the 'text' assignment and improve fallback
    const assignments = node.parameters?.assignments?.assignments || []
    const textAssign = assignments.find(a => a.name === 'text')
    if (textAssign) {
      // Add fallback for empty/emoji-only messages
      const innerExpression = original.replace(/^=\{\{/, '').replace(/\}\}$/, '').trim();
      textAssign.value = `={{ (${innerExpression} || '').trim() || 'Hola, ¿qué tenéis?' }}`
    }
  }
  return node
})

// ─────────────────────────────────────────────────────────────────────────
// FIX 4: "Limpiar Texto" text expression - let's see what it currently is
// We'll log it for verification
// ─────────────────────────────────────────────────────────────────────────
const limpiarNode = workflow.nodes.find(n => n.name === 'Limpiar Texto')
console.log('\n📋 Limpiar Texto assignments:')
limpiarNode?.parameters?.assignments?.assignments?.forEach(a => {
  console.log(`   ${a.name}: ${String(a.value).substring(0, 120)}`)
})

// ─────────────────────────────────────────────────────────────────────────
// FIX 5: "Preparar Mensaje Datos Incompletos"
// This is the node that preps the message for the "incomplete data" path
// It currently hardcodes "Fiera, no me ha quedado claro qué quieres pedir"
// For chat path (If false branch), the message IS the AI reply, not this hardcoded text
// So we leave this node alone (it already gets overridden by Preparar Chat)
// ─────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────
// VERIFY: Check the If node condition to ensure it correctly routes
// True = it's an order (has detalle_pedido in output)  
// False = it's conversational (AI replied with text, no order JSON)
// ─────────────────────────────────────────────────────────────────────────
const ifNode = workflow.nodes.find(n => n.name === 'If')
console.log('\n📋 If node condition:')
console.log('   leftValue:', ifNode?.parameters?.conditions?.conditions?.[0]?.leftValue)
console.log('   rightValue:', ifNode?.parameters?.conditions?.conditions?.[0]?.rightValue)
console.log('   operation:', ifNode?.parameters?.conditions?.conditions?.[0]?.operator?.operation)

// Save
fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2), 'utf8')
console.log(`\n🎉 DONE - ${fixes} fixes applied. Archivo guardado.`)
