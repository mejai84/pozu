import fs from 'fs'

const filePath = 'd:/Jaime/Antigravity/Pozu/workflow_POZU_FULL_FIXED.json'
const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'))

let fixes = 0

// 1. Quitar asteriscos del código de la Herramienta Verificar Productos
const tool = workflow.nodes.find(n => n.name === 'Herramienta Verificar Productos')
if (tool && tool.parameters?.jsCode) {
  tool.parameters.jsCode = tool.parameters.jsCode.replace(/\* CARTA POZU 2\.0 \*/g, 'CARTA POZU 2.0')
  tool.parameters.jsCode = tool.parameters.jsCode.replace(/\* \$\{title\} \*/g, '👉 ${title}')
  console.log('✅ Herramienta Verificar Productos - Formato Asteriscos Eliminado')
  fixes++
}

// 2. Modificar el Prompt del Agente para PROHIBIR explícitamente el uso de Markdown (asteriscos)
const agent = workflow.nodes.find(n => n.name === 'Extraer Datos Estructurados')
if (agent && agent.parameters?.options?.systemMessage) {
  let prompt = agent.parameters.options.systemMessage
  if (!prompt.includes('NO USES MARKDOWN')) {
    prompt = prompt.replace(
      'IMPORTANTE: No uses formato JSON en esta fase. Habla en texto plano.',
      'IMPORTANTE: Habla en texto plano. NO USES MARKDOWN (prohibido usar asteriscos * para negritas o listas). Usa guiones (-) y emojis.'
    )
    agent.parameters.options.systemMessage = prompt
    console.log('✅ Prompt del Agente - Markdown Prohibido')
    fixes++
  }
}

// 3. (OPCIONAL pero SEGURO) Limpiar asteriscos directamente en el nodo "Limpiar Texto" o "Preparar Chat"
// Así aseguramos que Telegram NUNCA reciba un asterisco suelto problemático.
const prepChat = workflow.nodes.find(n => n.name === 'Preparar Chat')
if (prepChat && prepChat.parameters?.assignments?.assignments) {
  const msgIncompleto = prepChat.parameters.assignments.assignments.find(a => a.name === 'mensaje_incompleto')
  if (msgIncompleto && msgIncompleto.value === '={{ $json.output }}') {
    // Reemplazamos los asteriscos de Markdown por nada o por un bullet limpio
    msgIncompleto.value = '={{ $json.output.replace(/\\*\\*/g, "").replace(/\\*/g, "-") }}'
    console.log('✅ Preparar Chat - Sanitización de Asteriscos Añadida')
    fixes++
  }
}

fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2), 'utf8')
console.log(`\n🎉 DONE - ${fixes} fixes aplicados. Guardado en workflow_POZU_FULL_FIXED.json`)
