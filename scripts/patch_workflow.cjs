/**
 * Pozu Workflow Patcher - Aplica todos los fixes al JSON del workflow
 * Uso: node patch_workflow.cjs "ruta/al/input.json" "ruta/al/output.json"
 */

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || 'C:\\Users\\Cesar\\Downloads\\Pozu_FIXED_v6 (1).json';
const outputPath = process.argv[3] || 'C:\\Users\\Cesar\\Downloads\\Pozu_FIXED_v7_PATCHED.json';

console.log(`\n📂 Leyendo: ${inputPath}`);
const raw = fs.readFileSync(inputPath, 'utf8');
const wf = JSON.parse(raw);

let fixCount = 0;

// ══════════════════════════════════════════════
// FIX 1: Verificar Método Pago
// - Quitar \n trailing de expressions
// - Añadir fallbackOutput: "extra"
// - caseSensitive: false
// ══════════════════════════════════════════════
const nodoVerificarPago = wf.nodes.find(n => n.id === '06195734-677b-419a-a816-55abceb1d633');
if (nodoVerificarPago) {
  nodoVerificarPago.parameters.rules.values.forEach(rule => {
    rule.conditions.conditions.forEach(cond => {
      // Quitar \n trailing FUERA de {{ }}
      if (cond.leftValue) cond.leftValue = cond.leftValue.replace(/\}\}\n$/, '}}').trimEnd();
      // Hacer case insensitive
      if (rule.conditions.options) rule.conditions.options.caseSensitive = false;
    });
  });
  // Añadir fallbackOutput
  nodoVerificarPago.parameters.options = { ...nodoVerificarPago.parameters.options, fallbackOutput: 'extra' };
  console.log('✅ FIX 1: Verificar Método Pago — fallbackOutput añadido, \\n trailing eliminado');
  fixCount++;
} else {
  console.warn('⚠️  FIX 1: No se encontró nodo "Verificar Método Pago" por ID');
}

// ══════════════════════════════════════════════
// FIX 2: Preparar para Supabase
// - Cambiar onError a continueRegularOutput
// ══════════════════════════════════════════════
const nodoPreparar = wf.nodes.find(n => n.id === '81bd8d4c-3fe8-4236-b439-b4be25369539');
if (nodoPreparar) {
  nodoPreparar.onError = 'continueRegularOutput';
  console.log('✅ FIX 2: Preparar para Supabase — onError → continueRegularOutput');
  fixCount++;
} else {
  console.warn('⚠️  FIX 2: No se encontró nodo "Preparar para Supabase" por ID');
}

// ══════════════════════════════════════════════
// FIX 3: Eliminar nodo "Responder Chat Web Pedido"
// - Duplica respuesta web y saltea Stripe
// ══════════════════════════════════════════════
const idxResponderWebPedido = wf.nodes.findIndex(n => n.id === 'respond-web-order-001');
if (idxResponderWebPedido !== -1) {
  wf.nodes.splice(idxResponderWebPedido, 1);
  console.log('✅ FIX 3: Nodo "Responder Chat Web Pedido" eliminado');
  fixCount++;
} else {
  console.warn('⚠️  FIX 3: No se encontró nodo "Responder Chat Web Pedido"');
}

// ══════════════════════════════════════════════
// FIX 4: Reconectar flujo para resolver race condition de Stripe
// ══════════════════════════════════════════════

// 4a: Insertar Pedido en Supabase → SOLO conecta a ¿Es Tarjeta?
if (wf.connections['Insertar Pedido en Supabase']) {
  wf.connections['Insertar Pedido en Supabase'].main = [[
    { node: '¿Es Tarjeta?', type: 'main', index: 0 }
  ]];
  console.log('✅ FIX 4a: Insertar Pedido en Supabase → solo ¿Es Tarjeta?');
  fixCount++;
} else {
  console.warn('⚠️  FIX 4a: No se encontró connection "Insertar Pedido en Supabase"');
}

// 4b: ¿Es Tarjeta? output 1 (NO) → Identificar Canal Respuesta + Parsear Items
if (wf.connections['¿Es Tarjeta?']) {
  wf.connections['¿Es Tarjeta?'].main = [
    // Output 0 (SI tarjeta) → Generar Link Pago (Stripe)
    [{ node: 'Generar Link Pago (Stripe)', type: 'main', index: 0 }],
    // Output 1 (NO tarjeta/efectivo) → Responder directamente
    [
      { node: 'Identificar Canal Respuesta', type: 'main', index: 0 },
      { node: 'Parsear Items Pedido', type: 'main', index: 0 }
    ]
  ];
  console.log('✅ FIX 4b: ¿Es Tarjeta? output NO → Identificar Canal Respuesta + Parsear Items');
  fixCount++;
} else {
  console.warn('⚠️  FIX 4b: No se encontró connection "¿Es Tarjeta?"');
}

// 4c: Generar Link Pago (Stripe)
//     output 0 (éxito) → Actualizar Payment Link en Supabase
//     output 1 (error de Stripe) → Identificar Canal Respuesta (fallback sin link)
if (wf.connections['Generar Link Pago (Stripe)']) {
  wf.connections['Generar Link Pago (Stripe)'].main = [
    // Output 0 éxito → actualizar BD
    [{ node: 'Actualizar Payment Link en Supabase', type: 'main', index: 0 }],
    // Output 1 error → responder igualmente (sin link)
    [
      { node: 'Identificar Canal Respuesta', type: 'main', index: 0 },
      { node: 'Parsear Items Pedido', type: 'main', index: 0 }
    ]
  ];
  console.log('✅ FIX 4c: Generar Link Pago (Stripe) — error output conectado al canal respuesta');
  fixCount++;
} else {
  console.warn('⚠️  FIX 4c: No se encontró connection "Generar Link Pago (Stripe)"');
}

// 4d: Actualizar Payment Link en Supabase → Identificar Canal Respuesta + Parsear Items
if (wf.connections['Actualizar Payment Link en Supabase']) {
  wf.connections['Actualizar Payment Link en Supabase'].main = [[
    { node: 'Identificar Canal Respuesta', type: 'main', index: 0 },
    { node: 'Parsear Items Pedido', type: 'main', index: 0 }
  ]];
  console.log('✅ FIX 4d: Actualizar Payment Link en Supabase → Identificar Canal Respuesta + Parsear Items');
  fixCount++;
} else {
  console.warn('⚠️  FIX 4d: No se encontró connection "Actualizar Payment Link en Supabase"');
}

// 4e: Añadir conexión del fallback de "Verificar Método Pago" → Preparar para Supabase
if (wf.connections['Verificar Método Pago']) {
  const conn = wf.connections['Verificar Método Pago'].main;
  // output 0 = Efectivo → Preparar para Supabase (ya existe)
  // output 1 = Tarjeta → Preparar Pago Tarjeta (ya existe)
  // output 2 = fallback → Preparar para Supabase (nuevo)
  if (!conn[2]) {
    conn[2] = [{ node: 'Preparar para Supabase', type: 'main', index: 0 }];
    console.log('✅ FIX 4e: Verificar Método Pago fallback output → Preparar para Supabase');
    fixCount++;
  } else {
    console.log('ℹ️  FIX 4e: Verificar Método Pago ya tiene output 2, no se modifica');
  }
} else {
  console.warn('⚠️  FIX 4e: No se encontró connection "Verificar Método Pago"');
}

// ══════════════════════════════════════════════
// Eliminar referencia a "Responder Chat Web Pedido" de connections
// ══════════════════════════════════════════════
if (wf.connections['Responder Chat Web Pedido']) {
  delete wf.connections['Responder Chat Web Pedido'];
  console.log('✅ Eliminada connection de Responder Chat Web Pedido');
}

// ══════════════════════════════════════════════
// FIX 5: Stripe success_url → /pago-exitoso con order_id
// - Antes: success_url = "https://pozu2.com/pago-exitoso" (sin params → 404)
// - Ahora: success_url incluye order_id para que la página muestre el pedido
// - cancel_url → vuelve al inicio (no al chat)
// ══════════════════════════════════════════════
const nodoStripe = wf.nodes.find(n => n.name === 'Generar Link Pago (Stripe)');
if (nodoStripe) {
  const params = nodoStripe.parameters.bodyParameters?.parameters;
  if (params) {
    // Actualizar success_url para incluir el order_id
    const successUrlParam = params.find(p => p.name === 'success_url');
    if (successUrlParam) {
      successUrlParam.value = "=https://pozu2.com/pago-exitoso?order_id={{ $('Insertar Pedido en Supabase').item.json.id }}";
      console.log('✅ FIX 5a: Stripe success_url → /pago-exitoso?order_id={id}');
      fixCount++;
    }
    // cancel_url → volver al inicio
    const cancelUrlParam = params.find(p => p.name === 'cancel_url');
    if (cancelUrlParam) {
      cancelUrlParam.value = 'https://pozu2.com';
      console.log('✅ FIX 5b: Stripe cancel_url → https://pozu2.com');
      fixCount++;
    }
  }
} else {
  console.warn('⚠️  FIX 5: No se encontró nodo "Generar Link Pago (Stripe)"');
}

// ══════════════════════════════════════════════
// FIX 6: Mensaje de Telegram/Canal — quitar tracking link del mensaje inicial
// ══════════════════════════════════════════════
const nodoRespTelegram = wf.nodes.find(n => n.name === 'Responder a Telegram');
if (nodoRespTelegram && nodoRespTelegram.parameters?.text) {
  nodoRespTelegram.parameters.text = `={{ 
  "✅ ¡Oído cocina, " + ($('Preparar para Supabase').item.json.customer_name || 'Fiera') + "! Tu pedido está marchando. 🍔🍟\\n\\n" + 
  "📦 *Resumen de tu pedido:*\\n" + ($('Preparar para Supabase').item.json.items?.detalle || 'Pedido registrado') + "\\n\\n" + 
  "📍 *Entrega:* " + ($('Preparar para Supabase').item.json.delivery_address || 'Recogida en local') + "\\n" + 
  "💳 Pago: " + ($('Preparar para Supabase').item.json.items?.metodo_pago || 'Pendiente') + "\\n" + 
  ($('Generar Link Pago').isExecuted && $('Generar Link Pago').item?.json?.url ? "\\n👉 *PAGA AQUÍ:* " + $('Generar Link Pago').item.json.url + "\\n\\n⚠️ Te enviaremos el link de seguimiento una vez confirmado el pago." : "\\n🔗 Sigue tu pedido: https://pozu2.com/pedidos/tracking?id=" + $('Insertar Pedido en Supabase').item.json.id) + "\\n\\n" + 
  "🧾 *Total:* " + ($('Preparar para Supabase').item.json.total || 0) + "€ (IVA incl.)"
}}`;
  console.log('✅ FIX 6: Mensaje Telegram actualizado para apuntar a Generar Link Pago genérico');
  fixCount++;
}

// ══════════════════════════════════════════════
// FIX 7 (CRÍTICO v10): Reemplazo de Stripe estático por Petición Backend Multigateway
// Reemplazamos el viejo "Generar Link Pago (Stripe)" por un HTTP Node "Generar Link Pago"
// ══════════════════════════════════════════════
if (nodoStripe) {
  nodoStripe.name = 'Generar Link Pago';
  nodoStripe.type = 'n8n-nodes-base.httpRequest';
  nodoStripe.typeVersion = 4.1;
  nodoStripe.parameters = {
    method: 'POST',
    url: 'https://pozu2.com/api/checkout/create-link',
    sendBody: true,
    specifyBody: 'json',
    jsonBody: `={
  "order_id": "{{ $('Insertar Pedido en Supabase').item.json.id }}",
  "amount": {{ $('Preparar para Supabase').item.json.total }},
  "summary": "{{ $('Preparar para Supabase').item.json.items.detalle }}"
}`,
    options: {}
  };
  // Eliminar credenciales de stripe viejas
  if (nodoStripe.credentials) {
    delete nodoStripe.credentials;
  }
  console.log('✅ FIX 7: Nodo Stripe reemplazado por llamado HTTP Multigateway a tu backend');
  fixCount++;
}

// ══════════════════════════════════════════════
// Actualizar connections para reflejar el nuevo nombre 'Generar Link Pago'
// ══════════════════════════════════════════════
if (wf.connections['¿Es Tarjeta?']) {
  wf.connections['¿Es Tarjeta?'].main[0] = [{ node: 'Generar Link Pago', type: 'main', index: 0 }];
}
if (wf.connections['Generar Link Pago (Stripe)']) {
  wf.connections['Generar Link Pago'] = wf.connections['Generar Link Pago (Stripe)'];
  delete wf.connections['Generar Link Pago (Stripe)'];
}

// Cambiar referencias en "Actualizar Payment Link en Supabase"
const nodoActLink = wf.nodes.find(n => n.name === 'Actualizar Payment Link en Supabase');
if (nodoActLink && nodoActLink.parameters?.assignments?.assignments) {
    const asgs = nodoActLink.parameters.assignments.assignments;
    // actualizar para sacar la url del nodo nuevo
    const urlAsg = asgs.find(a => a.id === 'payment_link');
    if (urlAsg) {
      urlAsg.value = "={{ $('Generar Link Pago').item.json.url }}";
    }
}

// ══════════════════════════════════════════════
// Actualizar nombre y versionId
// ══════════════════════════════════════════════
wf.name = 'Pozu_FIXED_v10';
wf.versionId = 'patched-v10-' + Date.now();

// ══════════════════════════════════════════════
// Guardar archivo
// ══════════════════════════════════════════════
const finalOutputPath = outputPath.replace('v7_PATCHED', 'v10').replace('v8', 'v10').replace('v9', 'v10');
fs.writeFileSync(finalOutputPath, JSON.stringify(wf, null, 2), 'utf8');
console.log(`\n✅ ${fixCount} fixes aplicados exitosamente`);
console.log(`📁 Archivo guardado en: ${finalOutputPath}`);
console.log('\n📋 SIGUIENTES PASOS:');
console.log('  1. Importa Pozu_FIXED_v10.json en n8n');
console.log('  2. Ya NO hace falta configurar Stripe en n8n. Usa tus propias API keys de tu panel de admin.');

