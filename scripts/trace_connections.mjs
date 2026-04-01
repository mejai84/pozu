import fs from 'fs'

const filePath = 'd:/Jaime/Antigravity/Pozu/workflow_POZU_FULL_FIXED.json'
const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'))

const nodesById = {}
const nodesByName = {}
workflow.nodes.forEach(n => {
  nodesById[n.id] = n
  nodesByName[n.name] = n
})

function traceFrom(nodeName, padding = '') {
  let conns = workflow.connections[nodeName]
  if (!conns) return
  
  Object.keys(conns).forEach(connType => {
    conns[connType].forEach(outputs => {
      outputs.forEach(output => {
        let branch = output.index || 0
        console.log(`${padding}-> [${connType} branch ${branch}] ${output.node}`)
        traceFrom(output.node, padding + '  ')
      })
    })
  })
}

console.log('--- TRACING Chat Web Webhook ---')
traceFrom('Chat Web Webhook')
