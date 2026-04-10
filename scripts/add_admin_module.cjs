/**
 * Pozu Admin Module - Añade control de admin por chat al workflow
 * Soporta: Telegram, WhatsApp y Web Chat
 * Uso: node add_admin_module.cjs "ruta/v11.json" "ruta/v12.json"
 * 
 * Comandos admin disponibles:
 *   /admin PIN abrir|cerrar|mantenimiento on/off
 *   /admin PIN envio 3.50 | minimo 15 | delivery on/off
 *   /admin PIN efectivo|tarjeta|reservas on/off
 *   /admin PIN carta | precio "nombre" 12.50 | agotado/disponible "nombre"
 *   /admin PIN pedidos|pendientes|resumen
 *   /admin PIN confirmar|cancelar|entregar ID
 *   /admin PIN stats | top5 | ingresos
 */

const fs = require('fs');

const inputPath  = process.argv[2] || 'C:\\Users\\Cesar\\Downloads\\Pozu_FIXED_v11.json';
const outputPath = process.argv[3] || 'C:\\Users\\Cesar\\Downloads\\Pozu_FIXED_v12.json';

console.log(`\n📂 Leyendo: ${inputPath}`);
const raw = fs.readFileSync(inputPath, 'utf8');
const wf = JSON.parse(raw);

// ═══════════════════════════════════════════════════════════
// HELPER: get position of an existing node for relative placement
// ═══════════════════════════════════════════════════════════
const nodePos = (name) => {
  const n = wf.nodes.find(x => x.name === name);
  return n ? n.position : [1552, 7456];
};

// ═══════════════════════════════════════════════════════════
// NODES DEL MÓDULO ADMIN
// ═══════════════════════════════════════════════════════════
const ADMIN_Y_BASE = 6400; // Posición Y para el subflow admin (encima del flujo normal)
const adminNodes = [

  // ── 1. Detect admin command ──────────────────────────────
  {
    id: 'admin-detect-001',
    name: 'Detectar Comando Admin',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: [1552, ADMIN_Y_BASE],
    parameters: {
      conditions: {
        options: { caseSensitive: false, leftValue: '', typeValidation: 'loose', version: 3 },
        conditions: [{
          id: 'adc-1',
          leftValue: '={{ ($json.text || "").trim().toLowerCase() }}',
          rightValue: '/admin ',
          operator: { type: 'string', operation: 'startsWith' }
        }],
        combinator: 'and'
      },
      options: {}
    }
  },

  // ── 2. Extract parts ─────────────────────────────────────
  {
    id: 'admin-extract-001',
    name: 'Extraer Comando Admin',
    type: 'n8n-nodes-base.set',
    typeVersion: 3.4,
    position: [1776, ADMIN_Y_BASE],
    parameters: {
      assignments: {
        assignments: [
          { id: 'ace-1', name: 'admin_raw', value: '={{ $json.text || "" }}', type: 'string' },
          {
            id: 'ace-2', name: 'admin_parts', type: 'object',
            value: `={{ (() => {
  const text = ($json.text || '').trim();
  const clean = text.replace(/^\\/admin\\s+/i, '').trim();
  const parts = clean.split(/\\s+/);
  return {
    pin:    parts[0] || '',
    accion: (parts[1] || '').toLowerCase(),
    param1: (parts[2] || '').toLowerCase(),
    param2: (parts[3] || '').toLowerCase(),
    resto:  parts.slice(2).join(' ')
  };
})() }}`
          },
          { id: 'ace-3', name: 'canal_admin',   value: "={{ $('🛡️ Blindar Metadata').item.json.canal_origen }}", type: 'string' },
          { id: 'ace-4', name: 'chat_id_admin',  value: "={{ $('🛡️ Blindar Metadata').item.json.chat_id }}",   type: 'string' }
        ]
      },
      options: {}
    }
  },

  // ── 3. Get admin config (PIN) from Supabase ──────────────
  {
    id: 'admin-get-pin-001',
    name: 'Obtener Config Admin',
    type: 'n8n-nodes-base.supabase',
    typeVersion: 1,
    position: [2000, ADMIN_Y_BASE],
    parameters: {
      operation: 'get',
      tableId: 'settings',
      filters: { conditions: [{ keyName: 'key', keyValue: 'admin_config' }] }
    },
    onError: 'continueRegularOutput',
    alwaysOutputData: true,
    credentials: { supabaseApi: { id: 'FuNmSwNtO9Gdhqsd', name: 'Supabase account' } }
  },

  // ── 4. Verify PIN ────────────────────────────────────────
  {
    id: 'admin-verify-pin-001',
    name: 'Verificar PIN Admin',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: [2224, ADMIN_Y_BASE],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 3 },
        conditions: [{
          id: 'avp-1',
          leftValue:  "={{ $('Extraer Comando Admin').item.json.admin_parts.pin }}",
          rightValue: "={{ $json.value?.pin || '0000' }}",
          operator: { type: 'string', operation: 'equals' }
        }],
        combinator: 'and'
      },
      options: {}
    }
  },

  // ── 4b. Wrong PIN ────────────────────────────────────────
  {
    id: 'admin-pin-error-001',
    name: 'Admin PIN Incorrecto',
    type: 'n8n-nodes-base.set',
    typeVersion: 3.4,
    position: [2448, ADMIN_Y_BASE + 160],
    parameters: {
      assignments: {
        assignments: [
          { id: 'api-1', name: 'mensaje_admin',  value: '🚫 PIN incorrecto. Acceso denegado.', type: 'string' },
          { id: 'api-2', name: 'canal_admin',    value: "={{ $('Extraer Comando Admin').item.json.canal_admin }}", type: 'string' },
          { id: 'api-3', name: 'chat_id_admin',  value: "={{ $('Extraer Comando Admin').item.json.chat_id_admin }}", type: 'string' }
        ]
      },
      options: {}
    }
  },

  // ── 5. Parse command category ────────────────────────────
  {
    id: 'admin-parse-001',
    name: 'Clasificar Acción Admin',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [2448, ADMIN_Y_BASE],
    parameters: {
      language: 'javaScript',
      jsCode: `
const parts  = $('Extraer Comando Admin').item.json.admin_parts;
const accion = (parts.accion || '').toLowerCase().trim();
const p1     = (parts.param1 || '').toLowerCase().trim();
const p2     = (parts.param2 || '').toLowerCase().trim();
const resto  = (parts.resto  || '');

const negocio  = ['abrir','cerrar','mantenimiento','horario','envio','minimo','delivery','fax'];
const pagos    = ['efectivo','tarjeta','reservas','pago'];
const productos= ['precio','agotado','disponible','carta','producto','menu'];
const pedidos  = ['pedidos','confirmar','cancelar','entregar','resumen','estado','pendientes','hoy'];
const stats    = ['stats','estadisticas','top5','ingresos'];

let categoria = 'desconocido';
if (negocio.some(c => accion === c))   categoria = 'negocio';
else if (pagos.some(c => accion === c))     categoria = 'pagos';
else if (productos.some(c => accion === c)) categoria = 'productos';
else if (pedidos.some(c => accion === c))   categoria = 'pedidos';
else if (stats.some(c => accion === c))     categoria = 'stats';

return [{ categoria, accion, param1: p1, param2: p2, resto,
  canal:   $('Extraer Comando Admin').item.json.canal_admin,
  chat_id: $('Extraer Comando Admin').item.json.chat_id_admin }];
`
    }
  },

  // ── 6. Route to category ────────────────────────────────
  {
    id: 'admin-router-001',
    name: 'Router Acción Admin',
    type: 'n8n-nodes-base.switch',
    typeVersion: 3.4,
    position: [2672, ADMIN_Y_BASE],
    parameters: {
      rules: {
        values: [
          { renameOutput: true, outputKey: 'Negocio',   conditions: { options: { caseSensitive: false, typeValidation: 'loose', version: 3 }, conditions: [{ id: 'r1', leftValue: '={{ $json.categoria }}', rightValue: 'negocio',   operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
          { renameOutput: true, outputKey: 'Pagos',     conditions: { options: { caseSensitive: false, typeValidation: 'loose', version: 3 }, conditions: [{ id: 'r2', leftValue: '={{ $json.categoria }}', rightValue: 'pagos',     operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
          { renameOutput: true, outputKey: 'Productos', conditions: { options: { caseSensitive: false, typeValidation: 'loose', version: 3 }, conditions: [{ id: 'r3', leftValue: '={{ $json.categoria }}', rightValue: 'productos', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
          { renameOutput: true, outputKey: 'Pedidos',   conditions: { options: { caseSensitive: false, typeValidation: 'loose', version: 3 }, conditions: [{ id: 'r4', leftValue: '={{ $json.categoria }}', rightValue: 'pedidos',   operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
          { renameOutput: true, outputKey: 'Stats',     conditions: { options: { caseSensitive: false, typeValidation: 'loose', version: 3 }, conditions: [{ id: 'r5', leftValue: '={{ $json.categoria }}', rightValue: 'stats',     operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } }
        ]
      },
      options: { fallbackOutput: 'extra' }
    }
  },

  // ── 7a. NEGOCIO handler ──────────────────────────────────
  {
    id: 'admin-negocio-001', name: 'Admin: Negocio',
    type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [2896, ADMIN_Y_BASE - 320],
    parameters: { language: 'javaScript', jsCode: `
const accion = $json.accion, p1 = $json.param1, p2 = $json.param2;
const url  = $('🛡️ Blindar Metadata').item.json.supabase_url;
const key  = $('🛡️ Blindar Metadata').item.json.supabase_key;
const hdrs = { 'Content-Type':'application/json','apikey':key,'Authorization':'Bearer '+key };

const patch = async (settingKey, partial) => {
  const g = await fetch(\`\${url}/rest/v1/settings?key=eq.\${settingKey}&select=value\`, { headers: hdrs });
  const cur = (await g.json())[0]?.value || {};
  const r = await fetch(\`\${url}/rest/v1/settings?key=eq.\${settingKey}\`, {
    method:'PATCH', headers:{...hdrs,'Prefer':'return=minimal'}, body:JSON.stringify({value:{...cur,...partial}})
  });
  return r.ok;
};

let mensaje = '';
if (accion === 'abrir')        { await patch('business_info',{is_open:true});  mensaje='✅ Restaurante ABIERTO'; }
else if (accion === 'cerrar')  { await patch('business_info',{is_open:false}); mensaje='🔴 Restaurante CERRADO'; }
else if (accion === 'mantenimiento') {
  const on = p1 !== 'off';
  await patch('feature_flags',{maintenance_mode:on});
  mensaje = on ? '🔧 Mantenimiento ACTIVADO' : '✅ Mantenimiento DESACTIVADO';
}
else if (accion === 'envio')   { const v=parseFloat(p1); if(isNaN(v)) return [{error:true,mensaje:'❌ /admin PIN envio 3.50'}]; await patch('delivery_settings',{delivery_fee:v});      mensaje=\`🚚 Envío → \${v}€\`; }
else if (accion === 'minimo')  { const v=parseFloat(p1); if(isNaN(v)) return [{error:true,mensaje:'❌ /admin PIN minimo 15'}];  await patch('delivery_settings',{min_order_amount:v}); mensaje=\`💰 Pedido mínimo → \${v}€\`; }
else if (accion === 'delivery'){ const on=p1!=='off'; await patch('feature_flags',{delivery_enabled:on}); mensaje = on?'🚚 Delivery ACTIVADO':'🚫 Delivery DESACTIVADO'; }
else return [{error:true,mensaje:\`❌ Acción desconocida: \${accion}\`}];
return [{error:false,mensaje, canal:$json.canal, chat_id:$json.chat_id}];
` }
  },

  // ── 7b. PAGOS handler ────────────────────────────────────
  {
    id: 'admin-pagos-001', name: 'Admin: Pagos',
    type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [2896, ADMIN_Y_BASE - 160],
    parameters: { language: 'javaScript', jsCode: `
const accion = $json.accion, p1 = $json.param1;
const url = $('🛡️ Blindar Metadata').item.json.supabase_url;
const key = $('🛡️ Blindar Metadata').item.json.supabase_key;
const hdrs = { 'Content-Type':'application/json','apikey':key,'Authorization':'Bearer '+key };

const g = await fetch(\`\${url}/rest/v1/settings?key=eq.feature_flags&select=value\`, { headers: hdrs });
const flags = (await g.json())[0]?.value || {};
const on = p1 !== 'off';
let update = {}, mensaje = '';

if      (accion === 'efectivo')  { update={cash_payments_enabled:on};    mensaje=on?'💵 Efectivo ACTIVADO':'🚫 Efectivo DESACTIVADO'; }
else if (accion === 'tarjeta')   { update={online_payments_enabled:on};  mensaje=on?'💳 Tarjeta ACTIVADA':'🚫 Tarjeta DESACTIVADA'; }
else if (accion === 'reservas')  { update={reservations_enabled:on};     mensaje=on?'📅 Reservas ACTIVADAS':'🚫 Reservas DESACTIVADAS'; }
else return [{error:true,mensaje:\`❌ Acción de pagos no reconocida: \${accion}\`}];

await fetch(\`\${url}/rest/v1/settings?key=eq.feature_flags\`, {
  method:'PATCH', headers:{...hdrs,'Prefer':'return=minimal'}, body:JSON.stringify({value:{...flags,...update}})
});
return [{error:false, mensaje, canal:$json.canal, chat_id:$json.chat_id}];
` }
  },

  // ── 7c. PRODUCTOS handler ────────────────────────────────
  {
    id: 'admin-productos-001', name: 'Admin: Productos',
    type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [2896, ADMIN_Y_BASE],
    parameters: { language: 'javaScript', jsCode: `
const accion = $json.accion, resto = $json.resto;
const url = $('🛡️ Blindar Metadata').item.json.supabase_url;
const key = $('🛡️ Blindar Metadata').item.json.supabase_key;
const hdrs = { 'Content-Type':'application/json','apikey':key,'Authorization':'Bearer '+key };

if (accion === 'carta' || accion === 'menu') {
  const r = await fetch(\`\${url}/rest/v1/products?is_available=eq.true&select=name,price&order=name\`,{headers:hdrs});
  const prods = await r.json();
  const lista = prods.map(p=>\`• \${p.name}: \${p.price}€\`).join('\\n');
  return [{error:false,mensaje:\`📋 *CARTA ACTUAL:*\\n\${lista}\`,canal:$json.canal,chat_id:$json.chat_id}];
}

// Extract "product name" and value from resto
const restoStr = resto || '';
const quotedMatch = restoStr.match(/[""](.+?)[""]/);
let productName = '', newValue = '';
if (quotedMatch) {
  productName = quotedMatch[1];
  newValue = restoStr.replace(quotedMatch[0],'').trim();
} else {
  const parts = restoStr.trim().split(/\\s+/);
  newValue = parts[parts.length-1];
  productName = parts.slice(0,parts.length-1).join(' ');
}
if (!productName) return [{error:true,mensaje:'❌ Usa comillas: /admin PIN precio "Hamburguesa" 12.50',canal:$json.canal,chat_id:$json.chat_id}];

const s = await fetch(\`\${url}/rest/v1/products?name=ilike.*\${encodeURIComponent(productName)}*&select=id,name,price\`,{headers:hdrs});
const found = await s.json();
if (!found.length) return [{error:true,mensaje:\`❌ Producto "\${productName}" no encontrado.\`,canal:$json.canal,chat_id:$json.chat_id}];
const prod = found[0];

let body={}, mensaje='';
if (accion==='precio')      { const p=parseFloat(newValue); if(isNaN(p)) return [{error:true,mensaje:'❌ Precio inválido',canal:$json.canal,chat_id:$json.chat_id}]; body={price:p}; mensaje=\`✅ "\${prod.name}" → \${p}€\`; }
else if (accion==='agotado')    { body={is_available:false}; mensaje=\`🔴 "\${prod.name}" AGOTADO\`; }
else if (accion==='disponible') { body={is_available:true};  mensaje=\`✅ "\${prod.name}" DISPONIBLE\`; }
else return [{error:true,mensaje:\`❌ Acción no soportada: \${accion}\`,canal:$json.canal,chat_id:$json.chat_id}];

const r = await fetch(\`\${url}/rest/v1/products?id=eq.\${prod.id}\`,{method:'PATCH',headers:{...hdrs,'Prefer':'return=minimal'},body:JSON.stringify(body)});
return r.ok ? [{error:false,mensaje,canal:$json.canal,chat_id:$json.chat_id}] : [{error:true,mensaje:'❌ Error al actualizar BD',canal:$json.canal,chat_id:$json.chat_id}];
` }
  },

  // ── 7d. PEDIDOS handler ──────────────────────────────────
  {
    id: 'admin-pedidos-001', name: 'Admin: Pedidos',
    type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [2896, ADMIN_Y_BASE + 160],
    parameters: { language: 'javaScript', jsCode: `
const accion = $json.accion, p1 = $json.param1;
const url = $('🛡️ Blindar Metadata').item.json.supabase_url;
const key = $('🛡️ Blindar Metadata').item.json.supabase_key;
const hdrs = { 'Content-Type':'application/json','apikey':key,'Authorization':'Bearer '+key };
const today = new Date().toISOString().split('T')[0];

if (accion === 'pedidos' || accion === 'hoy') {
  const r = await fetch(\`\${url}/rest/v1/orders?created_at=gte.\${today}T00:00:00&select=id,customer_name,total,status,items&order=created_at.desc&limit=10\`,{headers:hdrs});
  const orders = await r.json();
  if (!orders.length) return [{error:false,mensaje:'📭 Sin pedidos hoy todavía.',canal:$json.canal,chat_id:$json.chat_id}];
  const em = {confirmed:'✅',pending:'⏳',cancelled:'❌',delivered:'🚚'};
  const lista = orders.map(o=>\`\${em[o.status]||'❓'} \${o.id.slice(0,8)} | \${o.customer_name} | \${o.total}€\`).join('\\n');
  return [{error:false,mensaje:\`📦 *PEDIDOS HOY (\${orders.length}):*\\n\${lista}\`,canal:$json.canal,chat_id:$json.chat_id}];
}
if (accion === 'pendientes') {
  const r = await fetch(\`\${url}/rest/v1/orders?status=eq.pending&created_at=gte.\${today}T00:00:00&select=id,customer_name,total,created_at&order=created_at.asc\`,{headers:hdrs});
  const orders = await r.json();
  if (!orders.length) return [{error:false,mensaje:'✅ Sin pedidos pendientes.',canal:$json.canal,chat_id:$json.chat_id}];
  const lista = orders.map(o=>{const m=Math.floor((Date.now()-new Date(o.created_at).getTime())/60000);return \`⏳ \${o.id.slice(0,8)} | \${o.customer_name} | \${o.total}€ | \${m}min\`;}).join('\\n');
  return [{error:false,mensaje:\`⚠️ *PENDIENTES:*\\n\${lista}\`,canal:$json.canal,chat_id:$json.chat_id}];
}
if (accion === 'resumen') {
  const r = await fetch(\`\${url}/rest/v1/orders?created_at=gte.\${today}T00:00:00&select=total,status,payment_status\`,{headers:hdrs});
  const orders = await r.json();
  const total = orders.reduce((s,o)=>s+(o.total||0),0);
  return [{error:false,mensaje:\`📊 *RESUMEN HOY:*\\n📦 Total: \${orders.length}\\n✅ Confirmados: \${orders.filter(o=>o.status==='confirmed').length}\\n⏳ Pendientes: \${orders.filter(o=>o.status==='pending').length}\\n💰 Ingresos: \${total.toFixed(2)}€\`,canal:$json.canal,chat_id:$json.chat_id}];
}
if (['confirmar','cancelar','entregar'].includes(accion)) {
  if (!p1) return [{error:true,mensaje:\`❌ /admin PIN \${accion} ID_PEDIDO\`,canal:$json.canal,chat_id:$json.chat_id}];
  const map={confirmar:'confirmed',cancelar:'cancelled',entregar:'delivered'};
  const r = await fetch(\`\${url}/rest/v1/orders?id=like.\${p1}%25\`,{method:'PATCH',headers:{...hdrs,'Prefer':'return=representation'},body:JSON.stringify({status:map[accion]})});
  const upd = await r.json();
  if (!upd.length) return [{error:true,mensaje:\`❌ Pedido "\${p1}" no encontrado.\`,canal:$json.canal,chat_id:$json.chat_id}];
  const em2={confirmed:'✅',cancelled:'❌',delivered:'🚚'};
  return [{error:false,mensaje:\`\${em2[map[accion]]} Pedido \${upd[0].id.slice(0,8)} → \${map[accion].toUpperCase()}\`,canal:$json.canal,chat_id:$json.chat_id}];
}
return [{error:true,mensaje:\`❌ Acción no reconocida: \${accion}\`,canal:$json.canal,chat_id:$json.chat_id}];
` }
  },

  // ── 7e. STATS handler ────────────────────────────────────
  {
    id: 'admin-stats-001', name: 'Admin: Stats',
    type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [2896, ADMIN_Y_BASE + 320],
    parameters: { language: 'javaScript', jsCode: `
const accion = $json.accion;
const url = $('🛡️ Blindar Metadata').item.json.supabase_url;
const key = $('🛡️ Blindar Metadata').item.json.supabase_key;
const hdrs = { 'Content-Type':'application/json','apikey':key,'Authorization':'Bearer '+key };
const today   = new Date().toISOString().split('T')[0];
const weekAgo = new Date(Date.now()-7*864e5).toISOString().split('T')[0];
const monthAgo= new Date(Date.now()-30*864e5).toISOString().split('T')[0];

if (accion === 'stats' || accion === 'estadisticas') {
  const [d,w,m] = await Promise.all([
    fetch(\`\${url}/rest/v1/orders?created_at=gte.\${today}T00:00:00&select=total,status\`,{headers:hdrs}).then(r=>r.json()),
    fetch(\`\${url}/rest/v1/orders?created_at=gte.\${weekAgo}T00:00:00&select=total,status\`,{headers:hdrs}).then(r=>r.json()),
    fetch(\`\${url}/rest/v1/orders?created_at=gte.\${monthAgo}T00:00:00&select=total\`,{headers:hdrs}).then(r=>r.json())
  ]);
  const sum = arr=>arr.reduce((s,o)=>s+(o.total||0),0).toFixed(2);
  return [{error:false,mensaje:\`📊 *ESTADÍSTICAS POZU:*\\n📅 Hoy: \${d.length} pedidos | \${sum(d)}€\\n📆 Semana: \${w.length} | \${sum(w)}€\\n🗓 Mes: \${m.length} | \${sum(m)}€\\n✅ Confirmados hoy: \${d.filter(o=>o.status==='confirmed').length}\`,canal:$json.canal,chat_id:$json.chat_id}];
}
if (accion === 'top5') {
  const r = await fetch(\`\${url}/rest/v1/order_items?select=product_name,quantity&limit=500\`,{headers:hdrs});
  const items = await r.json();
  const counts={};
  items.forEach(i=>{counts[i.product_name]=(counts[i.product_name]||0)+(i.quantity||1);});
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,q],i)=>\`\${i+1}. \${n}: \${q}\`).join('\\n');
  return [{error:false,mensaje:\`🏆 *TOP 5 PRODUCTOS:*\\n\${top||'Sin datos'}\`,canal:$json.canal,chat_id:$json.chat_id}];
}
if (accion === 'ingresos') {
  const r = await fetch(\`\${url}/rest/v1/orders?created_at=gte.\${today}T00:00:00&payment_status=eq.paid&select=total\`,{headers:hdrs});
  const ords = await r.json();
  const total = ords.reduce((s,o)=>s+(o.total||0),0);
  return [{error:false,mensaje:\`💰 *INGRESOS COBRADOS HOY: \${total.toFixed(2)}€* (\${ords.length} pagos)\`,canal:$json.canal,chat_id:$json.chat_id}];
}
return [{error:true,mensaje:'❌ Usa: /admin PIN stats | top5 | ingresos',canal:$json.canal,chat_id:$json.chat_id}];
` }
  },

  // ── 7f. Unknown command ──────────────────────────────────
  {
    id: 'admin-unknown-001', name: 'Admin: Comando Desconocido',
    type: 'n8n-nodes-base.set', typeVersion: 3.4,
    position: [2896, ADMIN_Y_BASE + 480],
    parameters: {
      assignments: { assignments: [
        { id: 'au-1', name: 'error', value: true, type: 'boolean' },
        { id: 'au-2', name: 'canal',   value: "={{ $json.canal }}",   type: 'string' },
        { id: 'au-3', name: 'chat_id', value: "={{ $json.chat_id }}", type: 'string' },
        { id: 'au-4', name: 'mensaje_admin', type: 'string', value: `📋 *Comandos Admin disponibles:*

🏪 *NEGOCIO:*
\`/admin PIN abrir\` | \`cerrar\`
\`/admin PIN mantenimiento on/off\`
\`/admin PIN envio 3.50\` | \`minimo 15\`
\`/admin PIN delivery on/off\`

💳 *PAGOS:*
\`/admin PIN efectivo on/off\`
\`/admin PIN tarjeta on/off\`
\`/admin PIN reservas on/off\`

🍔 *PRODUCTOS:*
\`/admin PIN carta\`
\`/admin PIN precio "Nombre" 12.50\`
\`/admin PIN agotado "Nombre"\`
\`/admin PIN disponible "Nombre"\`

📦 *PEDIDOS:*
\`/admin PIN pedidos\` | \`pendientes\` | \`resumen\`
\`/admin PIN confirmar ID\` | \`cancelar ID\` | \`entregar ID\`

📊 *STATS:*
\`/admin PIN stats\` | \`top5\` | \`ingresos\`` }
      ] },
      options: {}
    }
  },

  // ── 8. Merge response ────────────────────────────────────
  {
    id: 'admin-resp-merge-001', name: 'Preparar Respuesta Admin',
    type: 'n8n-nodes-base.set', typeVersion: 3.4,
    position: [3120, ADMIN_Y_BASE],
    parameters: {
      assignments: { assignments: [
        { id: 'arm-1', name: 'mensaje_admin', value: '={{ $json.mensaje || $json.mensaje_admin || "✅ Acción ejecutada." }}', type: 'string' },
        { id: 'arm-2', name: 'canal_admin',   value: "={{ $json.canal || $('Extraer Comando Admin').item.json.canal_admin }}", type: 'string' },
        { id: 'arm-3', name: 'chat_id_admin', value: "={{ $json.chat_id || $('Extraer Comando Admin').item.json.chat_id_admin }}", type: 'string' }
      ] },
      options: {}
    }
  },

  // ── 9. Route response by channel ─────────────────────────
  {
    id: 'admin-canal-router-001', name: 'Canal Respuesta Admin',
    type: 'n8n-nodes-base.switch', typeVersion: 3.4,
    position: [3344, ADMIN_Y_BASE],
    parameters: {
      rules: {
        values: [
          { renameOutput: true, outputKey: 'Telegram',  conditions: { options: { caseSensitive: false, typeValidation: 'loose', version: 3 }, conditions: [{ id: 'cr1', leftValue: '={{ $json.canal_admin }}', rightValue: 'telegram',     operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
          { renameOutput: true, outputKey: 'WhatsApp',  conditions: { options: { caseSensitive: false, typeValidation: 'loose', version: 3 }, conditions: [{ id: 'cr2', leftValue: '={{ $json.canal_admin }}', rightValue: 'whatsapp',     operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
          { renameOutput: true, outputKey: 'Web',       conditions: { options: { caseSensitive: false, typeValidation: 'loose', version: 3 }, conditions: [{ id: 'cr3', leftValue: '={{ $json.canal_admin }}', rightValue: 'website_chat', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } }
        ]
      },
      options: { fallbackOutput: 'extra' }
    }
  },

  // ── 10. Send via Telegram ────────────────────────────────
  {
    id: 'admin-send-tg-001', name: 'Respuesta Admin Telegram',
    type: 'n8n-nodes-base.telegram', typeVersion: 1.2,
    position: [3568, ADMIN_Y_BASE - 96],
    parameters: {
      chatId: '={{ $json.chat_id_admin }}',
      text:   '={{ $json.mensaje_admin }}',
      additionalFields: { parse_mode: 'Markdown' }
    },
    credentials: { telegramApi: { id: 'i4IQkiXw6gQXU0VD', name: 'Telegram account' } }
  },

  // ── 11. Send via WhatsApp ────────────────────────────────
  {
    id: 'admin-send-wa-001', name: 'Respuesta Admin WhatsApp',
    type: 'n8n-nodes-base.httpRequest', typeVersion: 4.4,
    position: [3568, ADMIN_Y_BASE + 64],
    parameters: {
      method: 'POST',
      url: 'https://api.pozu2.com/message/sendText/pozu-instance',
      sendBody: true,
      bodyParameters: { parameters: [
        { name: 'number', value: '={{ $json.chat_id_admin }}' },
        { name: 'text',   value: '={{ $json.mensaje_admin }}' }
      ] },
      options: {}
    }
  },

  // ── 12. Send via Web ─────────────────────────────────────
  {
    id: 'admin-send-web-001', name: 'Respuesta Admin Web',
    type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.5,
    position: [3568, ADMIN_Y_BASE + 224],
    parameters: {
      respondWith: 'json',
      responseBody: '={{ { "success": true, "message": $json.mensaje_admin } }}',
      options: { responseCode: 200 }
    }
  }

]; // end adminNodes


// ═══════════════════════════════════════════════════════════
// INJECT NODES
// ═══════════════════════════════════════════════════════════
const existingIds = new Set(wf.nodes.map(n => n.id));
adminNodes.forEach(n => {
  if (!existingIds.has(n.id)) {
    wf.nodes.push(n);
  } else {
    console.log(`ℹ️  Nodo ya existe, omitido: ${n.name}`);
  }
});
console.log(`✅ ${adminNodes.length} nodos admin añadidos al workflow`);


// ═══════════════════════════════════════════════════════════
// INJECT CONNECTIONS
// ═══════════════════════════════════════════════════════════

// 1) Intercept: After "Limpiar Texto" → insert "Detectar Comando Admin"
//    Old: Limpiar Texto → Consultar Feature Flags
//    New: Limpiar Texto → Detectar Comando Admin
//         Detectar Comando Admin (TRUE=admin)  → Extraer Comando Admin
//         Detectar Comando Admin (FALSE=normal) → Consultar Feature Flags (original)

if (wf.connections['Limpiar Texto']) {
  // Save original destination
  const originalDest = wf.connections['Limpiar Texto'].main[0];
  // Redirect to detect node
  wf.connections['Limpiar Texto'].main = [[{ node: 'Detectar Comando Admin', type: 'main', index: 0 }]];
  // Detect → [TRUE] Extraer Comando Admin / [FALSE] original destination
  wf.connections['Detectar Comando Admin'] = {
    main: [
      [{ node: 'Extraer Comando Admin', type: 'main', index: 0 }], // output 0 = TRUE (is admin)
      originalDest                                                   // output 1 = FALSE (normal flow)
    ]
  };
  console.log('✅ Limpiar Texto interceptado → Detectar Comando Admin');
}

// 2) Admin chain
wf.connections['Extraer Comando Admin']     = { main: [[{ node: 'Obtener Config Admin',    type:'main', index:0 }]] };
wf.connections['Obtener Config Admin']      = { main: [[{ node: 'Verificar PIN Admin',      type:'main', index:0 }]] };
wf.connections['Verificar PIN Admin']       = { main: [
  [{ node: 'Clasificar Acción Admin', type:'main', index:0 }],  // TRUE - correct PIN
  [{ node: 'Admin PIN Incorrecto',    type:'main', index:0 }]   // FALSE - wrong PIN
] };
wf.connections['Admin PIN Incorrecto']      = { main: [[{ node: 'Preparar Respuesta Admin', type:'main', index:0 }]] };
wf.connections['Clasificar Acción Admin']   = { main: [[{ node: 'Router Acción Admin',      type:'main', index:0 }]] };

// Router outputs: 0=Negocio, 1=Pagos, 2=Productos, 3=Pedidos, 4=Stats, extra=Desconocido
wf.connections['Router Acción Admin'] = {
  main: [
    [{ node: 'Admin: Negocio',            type:'main', index:0 }],
    [{ node: 'Admin: Pagos',              type:'main', index:0 }],
    [{ node: 'Admin: Productos',          type:'main', index:0 }],
    [{ node: 'Admin: Pedidos',            type:'main', index:0 }],
    [{ node: 'Admin: Stats',              type:'main', index:0 }],
    [{ node: 'Admin: Comando Desconocido',type:'main', index:0 }]  // fallback extra
  ]
};

// All handlers → merge
['Admin: Negocio','Admin: Pagos','Admin: Productos','Admin: Pedidos','Admin: Stats','Admin: Comando Desconocido'].forEach(name => {
  wf.connections[name] = { main: [[{ node: 'Preparar Respuesta Admin', type:'main', index:0 }]] };
});

// Merge → channel router
wf.connections['Preparar Respuesta Admin'] = { main: [[{ node: 'Canal Respuesta Admin', type:'main', index:0 }]] };

// Channel router → send
wf.connections['Canal Respuesta Admin'] = {
  main: [
    [{ node: 'Respuesta Admin Telegram', type:'main', index:0 }],
    [{ node: 'Respuesta Admin WhatsApp', type:'main', index:0 }],
    [{ node: 'Respuesta Admin Web',      type:'main', index:0 }],
    []  // fallback
  ]
};

// Terminal nodes - no outgoing connections needed
['Respuesta Admin Telegram','Respuesta Admin WhatsApp','Respuesta Admin Web'].forEach(name => {
  if (!wf.connections[name]) wf.connections[name] = { main: [[]] };
});

console.log('✅ Conexiones del módulo admin añadidas');


// ═══════════════════════════════════════════════════════════
// UPDATE VERSION
// ═══════════════════════════════════════════════════════════
wf.name = 'Pozu_FIXED_v12';
wf.versionId = 'patched-v12-admin-' + Date.now();

// ═══════════════════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════════════════
fs.writeFileSync(outputPath, JSON.stringify(wf, null, 2), 'utf8');
console.log(`\n✅ Módulo Admin añadido exitosamente`);
console.log(`📁 Guardado en: ${outputPath}`);
console.log(`\n📋 CONFIGURACIÓN REQUERIDA EN SUPABASE:`);
console.log(`   Ejecuta en SQL Editor:`);
console.log(`   INSERT INTO settings (key, value)`);
console.log(`   VALUES ('admin_config', '{"pin":"1234","admin_phones":[]}')`);
console.log(`   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`);
console.log(`\n   Cambia "1234" por tu PIN secreto!`);
console.log(`\n📱 USO: /admin 1234 abrir`);
