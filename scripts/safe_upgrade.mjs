import fs from 'fs'

const workingPath = 'c:/Users/Cesar/Downloads/Pozu 2.0 - Multichannel Sales AI (v3.0 Dynamic).json'
const outPath = 'd:/Jaime/Antigravity/Pozu/workflow_POZU_FULL_FIXED.json'

const workflow = JSON.parse(fs.readFileSync(workingPath, 'utf8'))

// 1. UPDATE SYSTEM MESSAGE (Dynamic Context + Original Rules)
const agent = workflow.nodes.find(n => n.name === 'Extraer Datos Estructurados') || {}
if (agent.parameters) {
  agent.parameters.options.systemMessage = `=ERES EL ASISTENTE DE VENTAS EXPERTO DE POZU 2.0.
Tu misión es gestionar pedidos de forma precisa, rápida y sin errores.

⚠️ REGLAS SAGRADAS (ZERO HALLUCINATION)
1. PROHIBICIÓN ABSOLUTA DE INVENTAR
   - No inventes Platos, Ingredientes, Precios o Procesos.
   - Si la info no está en el catálogo oficial → NO EXISTE. Usa verificar_producto.

2. CONSULTA OBLIGATORIA AL CATÁLOGO (verificar_producto)
   - CUÁNDO USARLA: Si el cliente pide "menú", "carta", o menciona un producto.
   - CÓMO USARLA: Si pide la carta completa usa el parámetro "todo". Si pide productos, búscalo.
   - MÁXIMO 1 LLAMADA LÓGICA: Valida todos los productos de una vez.

3. RESPUESTA CUANDO ALGO NO EXISTE
   - Si la herramienta indica que no hay resultados, responde EXACTAMENTE:
     "Lo siento, no veo ese plato en mi carta. ¿Te refieres a [sugerir producto similar que sí exista]?"
   - NUNCA digas "no tenemos" sin ofrecer una alternativa del catálogo.

4. PROTOCOLO DE CONVERSACIÓN (VENTA ACTIVA)
   - Mientras el cliente pide: Sé natural, cercano, breve y eficiente.
   - Confirma lo que añade.
   - Sugiere complementos SOLO si existen en el catálogo (ej. patatas, salsas).
   - IMPORTANTE: No uses formato JSON en esta fase. Habla en texto plano.

5. DATOS DEL NEGOCIO (TIEMPO REAL)
   - Pagos con tarjeta: {{ $('Consultar Feature Flags').item.json.value.online_payments_enabled ? 'SÍ ✅' : 'Solo efectivo ❌' }}
   - Pagos en efectivo: {{ $('Consultar Feature Flags').item.json.value.cash_payments_enabled ? 'SÍ ✅' : 'No disponible ❌' }}
   - Envío a domicilio: {{ $('Consultar Delivery Settings').item.json.value.delivery_fee }}€
   - IVA aplicado: {{ $('Consultar Delivery Settings').item.json.value.tax_percentage || 10 }}%

6. CIERRE DE VENTA (ESTRICTO Y BLOQUEANTE)
   ⚠️ SOLO puedes cerrar la venta si tienes TODOS estos datos confirmados:
   1. Nombre del cliente
   2. Teléfono (9 dígitos)
   3. Confirmación explícita de que ha terminado el pedido ("eso es todo", "nada más")
   4. Método de pago (efectivo o tarjeta). Si no lo da, tienes que preguntarlo.

7. RESPUESTA FINAL (FORMATO JSON OBLIGATORIO)
   Solo cuando se cumplan las 4 condiciones de cierre, tu ÚNICA y última respuesta debe ser exclusivamente este JSON (sin texto adicional):
   {
     "nombre_cliente": "Nombre",
     "telefono_cliente": "Número",
     "detalle_pedido": "Lista exacta de platos y extras",
     "metodo_pago": "efectivo" o "tarjeta",
     "subtotal": 0.00,
     "tax_amount": 0.00,
     "total_final": 0.00
   }
   
🧠 REGLA DE ORO FINAL: Si dudas, consulta la herramienta o pregunta al cliente. ¡Nunca inventes!
`
  console.log('✅ Updated Agent Prompt (with dynamic flags and original strict rules).')
}

// 2. UPDATE TOOL CODE (Organized Menu + Improved Search)
const tool = workflow.nodes.find(n => n.name === 'Herramienta Verificar Productos') || {}
if (tool.parameters) {
  tool.parameters.jsCode = `const query = $fromAI('input', 'Producto o consulta (ej: menu, carta, burguers, alérgenos)', 'string').toLowerCase();

let productos = [];
try {
  productos = $('Consultar Catálogo Productos').all();
} catch (e) {
  return "Error de lectura del catálogo. Por favor, pide al usuario que espere.";
}

// LÓGICA DE MENÚ ORGANIZADO (POR CATEGORÍAS)
if (['menú','menu','carta','todo','toda','comer','hamburguesas','burguer','picoteo'].some(kw => query.includes(kw))) {
  const cats = {
    '🍔 HAMBURGUESAS GOURMET': ['Pozu', 'Crispy Cheddar', 'Selecta', 'Oikos', 'Cielito Lindo', 'Everest', 'Escorpión', 'Kentucky', 'Hamburguesa Simple', 'Gourmet'],
    '🥪 SANDWICHES': ['Sandwich Pozu', 'Sandwich de Jamón York y Queso'],
    '🍟 PARA COMPARTIR / PICOTEO': ['Nachos', 'Nachos Pozu', 'Cuatro salsas', 'Cesta de Patatas', 'Patatas Rancheras', 'Patatas Pozu', 'Crujientes de pollo', 'Tequeños', 'Jalapeños (7 unids)', 'Pollo estilo Kentucky']
  };

  let menuTxt = "🍔 *CARTA POZU 2.0* 🍔\\n\\n";
  for (const [title, names] of Object.entries(cats)) {
    menuTxt += \`* \${title} *\\n\`;
    const filtered = productos.filter(p => names.includes(p.json.name));
    filtered.forEach(p => {
      menuTxt += \`- \${p.json.name} (\${p.json.price}€)\\n\`;
    });
    menuTxt += "\\n";
  }
  return menuTxt + "→ ¿Qué te apetece probar? (Sugerencia: La Pozu 👑 o la Selecta ✨).";
}

// LÓGICA DE BÚSQUEDA ESPECÍFICA
const encontrados = productos.filter(item => 
  item.json.name?.toLowerCase().includes(query) || 
  query.includes(item.json.name?.toLowerCase()) ||
  item.json.description?.toLowerCase().includes(query)
);

if (encontrados.length === 0) {
  return \`No encuentro '\${query}' en mi carta. -> Ofrece ver el menú completo.\`;
}

return encontrados.map(p => {
  let item = p.json;
  let extra = '';
  if (item.name.toLowerCase().includes('hamburguesa')) extra = 'OPCIÓN: Pollo Crujiente (+2€). ';
  if (item.name.toLowerCase().includes('cesta')) extra = 'RECUERDA: Preguntar qué salsa quiere (brava, alioli, etc.). ';
  return \`NOMBRE: \${item.name} | PRECIO: \${item.price}€ | ALÉRGENOS: \${item.allergens||'Ninguno'} | INFO: \${item.description || ''} | \${extra}\`;
}).join('\\n\\n');
`
  console.log('✅ Updated Tool (Organized Menu Category logic).')
}

// 3. FIX: Syntax error from working version (Verificar Riesgo Cliente)
const riesgo = workflow.nodes.find(n => n.name === 'Verificar Riesgo Cliente')
if (riesgo && riesgo.parameters?.filters?.conditions?.[0]) {
  const cond = riesgo.parameters.filters.conditions[0]
  if (cond.keyValue && String(cond.keyValue).startsWith('==')) {
    cond.keyValue = String(cond.keyValue).substring(1) // Fix =={{ -> ={{
    console.log('✅ Fixed Syntax Error in Verificar Riesgo Cliente.')
  }
}

fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2))
console.log('✅ Done. Saved to workflow_POZU_FULL_FIXED.json')
