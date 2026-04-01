import fs from 'fs'

const filePath = 'd:/Jaime/Antigravity/Pozu/workflow_POZU_FULL_FIXED.json'
let workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'))
let fixCount = 0

workflow.nodes = workflow.nodes.map(node => {
  const nodeStr = JSON.stringify(node)

  // Fix 1: Double == prefix in expressions (=={{ → ={{ )
  if (nodeStr.includes('=={{')) {
    const fixed = JSON.parse(nodeStr.replaceAll('=={{', '={{'))
    console.log(`✅ Fix 1 (Double ==): "${node.name}"`)
    fixCount++
    return fixed
  }

  // Fix 2: respondToWebhook with ={ instead of valid JSON literal or ={{
  if (node.type === 'n8n-nodes-base.respondToWebhook') {
    const body = node.parameters?.responseBody || ''
    
    // Pattern: starts with "={ without being an expression
    if (body.startsWith('={ ') && !body.startsWith('={{ ')) {
      // Convert "={ "key": value }" to proper static JSON string (no expression needed for static values)
      // Remove the broken =  prefix and leave as plain JSON
      node.parameters.responseBody = body.replace(/^=\{ /, '{{ ').replace(/ \}$/, ' }}')

      // If the body doesn't contain $json or expressions, make it a static string
      if (!body.includes('$')) {
        // Static: just strip the = prefix
        node.parameters.responseBody = body.slice(1) // Remove leading '='
        console.log(`✅ Fix 2 (Static respondToWebhook body): "${node.name}"`)
        fixCount++
      } else {
        // Dynamic: needs proper =={{ }}
        node.parameters.responseBody = '={{' + body.slice(2) + '}}'
        console.log(`✅ Fix 2 (Dynamic respondToWebhook body): "${node.name}"`)
        fixCount++
      }
    }
  }

  return node
})

// Fix 3: keyName should NOT start with = in Supabase filter keyName field
// n8n Supabase node uses keyName as a static column name, not an expression
workflow.nodes = workflow.nodes.map(node => {
  if (node.type === 'n8n-nodes-base.supabase') {
    const conditions = node.parameters?.filters?.conditions || []
    let changed = false
    const fixed = conditions.map(c => {
      if (c.keyName && c.keyName.startsWith('=')) {
        console.log(`✅ Fix 3 (Supabase keyName with = prefix): "${node.name}" → keyName: "${c.keyName}"`)
        fixCount++
        changed = true
        return { ...c, keyName: c.keyName.slice(1) } // Remove leading =
      }
      return c
    })
    if (changed) {
      node.parameters.filters.conditions = fixed
    }
  }
  return node
})

fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2), 'utf8')
console.log(`\n🎉 DONE. Total fixes applied: ${fixCount}`)
