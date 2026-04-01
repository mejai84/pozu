import fs from 'fs'

const workingPath = 'c:/Users/Cesar/Downloads/Pozu 2.0 - Multichannel Sales AI (v3.0 Dynamic).json'
const outputPath = 'd:/Jaime/Antigravity/Pozu/workflow_POZU_FULL_FIXED.json'

console.log('📂 Cargando archivo Working (base)...')
const workflow = JSON.parse(fs.readFileSync(workingPath, 'utf8'))

let fixCount = 0

// ─────────────────────────────────────────────
// FIX 1: Double == bug: =={{ → ={{
// ─────────────────────────────────────────────
workflow.nodes = workflow.nodes.map(node => {
  const nodeStr = JSON.stringify(node)
  if (nodeStr.includes('=={{')) {
    const fixed = JSON.parse(nodeStr.replaceAll('=={{', '={{'))
    console.log(`✅ Fix1 (==): "${node.name}"`)
    fixCount++
    return fixed
  }
  return node
})

// ─────────────────────────────────────────────
// FIX 2: Supabase keyName starting with = (invalid)
// ─────────────────────────────────────────────
workflow.nodes = workflow.nodes.map(node => {
  if (node.type === 'n8n-nodes-base.supabase') {
    const conditions = node.parameters?.filters?.conditions || []
    let changed = false
    const fixed = conditions.map(c => {
      if (c.keyName && c.keyName.startsWith('=')) {
        console.log(`✅ Fix2 (Supabase keyName): "${node.name}" keyName: ${c.keyName} → ${c.keyName.slice(1)}`)
        fixCount++
        changed = true
        return { ...c, keyName: c.keyName.slice(1) }
      }
      return c
    })
    if (changed) node.parameters.filters.conditions = fixed
  }
  return node
})

// ─────────────────────────────────────────────
// FIX 3: respondToWebhook with ={ instead of static JSON or ={{
// ─────────────────────────────────────────────
workflow.nodes = workflow.nodes.map(node => {
  if (node.type === 'n8n-nodes-base.respondToWebhook') {
    let body = node.parameters?.responseBody || ''
    if (body.startsWith('={ ') && !body.startsWith('={{ ')) {
      if (!body.includes('$')) {
        // Static: just remove the = prefix
        node.parameters.responseBody = body.slice(1)
      } else {
        // Dynamic: wrap as proper n8n expression
        node.parameters.responseBody = '={{' + body.slice(2).replace(/ \}$/, '}}')
      }
      console.log(`✅ Fix3 (respondWith body): "${node.name}"`)
      fixCount++
    }
  }
  return node
})

// ─────────────────────────────────────────────
// UPGRADE: Herramienta Verificar Productos
// Upgrade the tool with business context from feature_flags/delivery_settings
// while keeping the try/catch safety from the Working version
// ─────────────────────────────────────────────
workflow.nodes = workflow.nodes.map(node => {
  if (node.name === 'Herramienta Verificar Productos') {
    node.parameters.description = "Úsala para buscar un producto por nombre, ver la carta completa, consultar alérgenos, ingredientes o información del negocio (horarios, pagos, envío)."
    node.parameters.jsCode = `const query = $fromAI('input', 'Consulta del cliente (producto, menú, carta, alérgenos, horario, pago)', 'string').toLowerCase();

// Carga catálogo con protección
let productos = [];
try {
  productos = $('Consultar Catálogo Productos').all();
} catch (e) {
  return 'Error al acceder al catálogo. Por favor, inténtalo de nuevo.';
}

// Cargar configuración del negocio (con fallback seguro)
let delivery = {}, flags = {};
try { delivery = $('Consultar Delivery Settings').first()?.json?.value || {}; } catch(e) {}
try { flags = $('Consultar Feature Flags').first()?.json?.value || {}; } catch(e) {}

// INTENCIÓN 1: Ver menú/carta completa
if (['menú','menu','carta','todo','toda','completo','qué tenéis','que teneis','lista','productos','comer','bebidas','picoteo'].some(kw => query.includes(kw))) {
  const disponibles = productos.filter(p => p.json.is_available !== false && p.json.stock_quantity > 0);
  const lista = disponibles.map(p => \`- \${p.json.name}: \${p.json.price}€\`).join('\\n');
  return \`CARTA ACTUAL DE POZU 2.0:\\n\${lista}\\n\\n→ Recomienda la 'Pozu' o la 'Selecta'. No olvides ofrecer Pollo Crujiente en las hamburguesas (+2€).\`;
}

// INTENCIÓN 2: Consulta sobre el negocio (horarios, pagos, envío)
if (['horario','hora','cuando','abierto','cierra','abre','pago','tarjeta','efectivo','envío','envio','domicilio'].some(kw => query.includes(kw))) {
  const pagoTarjeta = flags.online_payments_enabled ? 'SÍ aceptamos tarjeta' : 'Solo efectivo por ahora';
  const pagoEfectivo = flags.cash_payments_enabled ? 'SÍ aceptamos efectivo' : 'No disponible';
  const gastoEnvio = delivery.delivery_fee ? \`\${delivery.delivery_fee}€\` : '2.50€';
  return \`INFO DEL NEGOCIO:
- Tarjeta: \${pagoTarjeta}
- Efectivo: \${pagoEfectivo}  
- Envío a domicilio: \${gastoEnvio}
- Horario general: Lun-Sáb 12:00-23:00 (Domingo cerrado)
→ Confirma las opciones de pago al cerrar el pedido.\`;
}

// INTENCIÓN 3: Búsqueda específica de producto o alérgenos
const encontrados = productos.filter(item =>
  item.json.name?.toLowerCase().includes(query) ||
  item.json.description?.toLowerCase().includes(query) ||
  query.includes(item.json.name?.toLowerCase())
);

if (encontrados.length === 0) {
  return \`No encuentro '\${query}' en la carta. INSTRUCCIÓN: Dile que no lo ves y ofrécele ver el menú completo.\`;
}

return encontrados.map(p => {
  const item = p.json;
  let extras = '';
  if (item.name.toLowerCase().includes('hamburguesa')) extras = 'OPCIÓN: Pollo Crujiente (+2€). ';
  if (item.name.toLowerCase().includes('cesta') || item.name.toLowerCase().includes('patata')) extras = 'RECUERDA: Preguntar qué salsa quiere (Alioli, Brava, Miel y Mostaza, Ketchup). ';
  return \`PRODUCTO: \${item.name} | PRECIO: \${item.price}€ | ALÉRGENOS: \${item.allergens || 'Sin especificar'} | INFO: \${item.description || ''} | \${extras}\`;
}).join('\\n\\n');
`
    console.log(`✅ Upgrade: "Herramienta Verificar Productos" (try/catch + contexto negocio)`)
    fixCount++
  }
  return node
})

// ─────────────────────────────────────────────
// UPGRADE: Extraer Datos Estructurados
// Keep Working's strict system message BUT add dynamic feature_flags context
// ─────────────────────────────────────────────
workflow.nodes = workflow.nodes.map(node => {
  if (node.name === 'Extraer Datos Estructurados') {
    // Keep executeOnce: true (already in working)
    node.executeOnce = true
    node.parameters.options.systemMessage = `=ERES EL ASISTENTE DE VENTAS EXPERTO DE POZU 2.0.
Tu misión es gestionar pedidos de forma precisa, rápida y sin errores.

⚠️ REGLAS SAGRADAS (ZERO HALLUCINATION)
1. PROHIBICIÓN ABSOLUTA DE INVENTAR
   - No inventes Platos, Ingredientes, Precios o Procesos.
   - Si la información no está en el catálogo → NO EXISTE. Usa siempre verificar_producto.

2. CONSULTA OBLIGATORIA AL CATÁLOGO (verificar_producto)
   - CUÁNDO USARLA: Si el cliente pide "menú", "carta", o menciona cualquier producto o alérgeno.
   - Si pide la carta completa, usa el parámetro "menú". Si pregunta por un producto específico, búscalo por nombre.
   - MÁXIMO EFICIENCIA: Valida todos los productos del pedido en una sola llamada si puedes.

3. RESPUESTA CUANDO ALGO NO EXISTE
   - Si la herramienta indica que no hay resultados, responde EXACTAMENTE:
     "Lo siento, no veo ese plato en mi carta. ¿Te refieres a [sugerir producto similar]?"
   - NUNCA digas "no tenemos" sin ofrecer una alternativa real del catálogo.

4. ESTADO DEL NEGOCIO EN TIEMPO REAL
   - Pagos con tarjeta: {{ $('Consultar Feature Flags').item.json.value.online_payments_enabled ? 'ACTIVOS ✅' : 'NO DISPONIBLES ❌ (solo efectivo)' }}
   - Pagos en efectivo: {{ $('Consultar Feature Flags').item.json.value.cash_payments_enabled ? 'ACEPTADOS ✅' : 'BLOQUEADOS ❌' }}
   - Coste de envío: {{ $('Consultar Delivery Settings').item.json.value.delivery_fee }}€
   - IVA aplicado: {{ $('Consultar Delivery Settings').item.json.value.tax_percentage }}%
   - Mantenimiento: {{ $('Consultar Feature Flags').item.json.value.maintenance_mode ? '⚠️ ACTIVO - Pide disculpas y no tomes pedidos.' : 'Inactivo' }}

5. PROTOCOLO DE CONVERSACIÓN (VENTA ACTIVA)
   - Mientras el cliente pide: Sé natural, cercano, breve y eficiente.
   - Confirma cada producto que añade al pedido.
   - Sugiere complementos SOLO si existen en el catálogo (ej. patatas, salsas).
   - IMPORTANTE: No uses formato JSON en esta fase conversacional. Habla en texto plano.

6. REGLAS DE NEGOCIO OBLIGATORIAS
   - Hamburguesa detectada → Ofrecer Pollo Crujiente (+2€) antes de confirmar.
   - Patatas/Fritos detectados → Preguntar qué salsa quiere (Alioli, Brava, Miel y Mostaza, Ketchup).
   - Si es delivery → Pedir siempre teléfono de Asturias.

7. CIERRE DE VENTA (ESTRICTO Y BLOQUEANTE)
   ⚠️ SOLO puedes generar el JSON final si tienes TODOS estos datos confirmados:
   1. Nombre del cliente
   2. Teléfono (9 dígitos)
   3. Confirmación explícita de que ha terminado ("eso es todo", "nada más", "confirmo")
   4. Método de pago (efectivo o tarjeta)

8. RESPUESTA FINAL (FORMATO JSON OBLIGATORIO)
   Solo cuando se cumplan las 4 condiciones de cierre, tu ÚNICA respuesta debe ser EXCLUSIVAMENTE este JSON (sin texto adicional):
   {
     "nombre_cliente": "Nombre",
     "telefono_cliente": "Número",
     "direccion_asturias": "Dirección o 'Recogida en local'",
     "detalle_pedido": "Lista exacta de platos y extras",
     "metodo_pago": "Efectivo o Tarjeta",
     "subtotal": 0.00,
     "tax_amount": 0.00,
     "delivery_fee": 0.00,
     "total_final": 0.00
   }
   
🧠 REGLA DE ORO FINAL: Si dudas, consulta la herramienta o pregunta al cliente. ¡Nunca inventes!`
    node.parameters.options.maxIterations = 10
    console.log(`✅ Upgrade: "Extraer Datos Estructurados" (Reglas Sagradas + feature_flags dinámicos)`)
    fixCount++
  }
  return node
})

// ─────────────────────────────────────────────
// Save output
// ─────────────────────────────────────────────
fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2), 'utf8')

console.log(`\n🎉 MERGE COMPLETO`)
console.log(`📊 Total fixes/upgrades: ${fixCount}`)
console.log(`📁 Guardado en: ${outputPath}`)
console.log(`📊 Total nodos: ${workflow.nodes.length}`)
