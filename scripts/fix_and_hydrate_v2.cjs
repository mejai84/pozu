const fs = require('fs');

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  });
  return env;
}

const envConfig = parseEnv('d:/Jaime/Antigravity/Pozu/.env.local');
const inputPath = 'c:/Users/Cesar/Downloads/Pozu_FIXED_EXPRESSIONS (5).json';
const outputPath = 'c:/Users/Cesar/Downloads/Pozu_FIXED_AND_HYDRATED_V2.json';

try {
  let data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  // 1. Inyectar Claves de API
  const replacements = {
    'GROQ_API_KEY_PLACEHOLDER': envConfig.GROQ_API_KEY,
    'TELEGRAM_BOT_TOKEN_PLACEHOLDER': envConfig.TELEGRAM_BOT_TOKEN,
    'OPENAI_API_KEY_PLACEHOLDER': envConfig.OPENAI_API_KEY || envConfig.GROQ_API_KEY,
    '<__PLACEHOLDER_VALUE__Replace this placeholder with your actual Supabase Service Role Key from Panel Supabase → Settings → API → service_role__>': envConfig.SUPABASE_SERVICE_ROLE_KEY
  };

  let jsonStr = JSON.stringify(data);
  for (const [placeholder, value] of Object.entries(replacements)) {
    if (value) {
      jsonStr = jsonStr.split(placeholder).join(value);
    }
  }
  data = JSON.parse(jsonStr);

  // 2. Aplicar Mejoras de System Message (V2)
  const agentNode = data.nodes.find(n => n.name === 'Extraer Datos Estructurados');
  if (agentNode && agentNode.parameters && agentNode.parameters.options) {
    const newSysMsg = `={{ \`ERES EL ASISTENTE DE VENTAS EXPERTO DE POZU 2.0.

!!! MOSTRAR EL MENU (OBLIGATORIO):
- Si el cliente pide ver la carta, el menu o las opciones disponibles, MUESTRASELOS SIEMPRE usando la herramienta verificar_producto con la palabra "menu".

!!! REGLA DE PEDIDOS:
- SOLO puedes vender platos que existan en el catalogo oficial.
- Si el cliente usa un nombre PARCIAL o APODO (ej: "oikos", "la de queso", "la especial"), PRIMERO usa la herramienta verificar_producto para buscarlo. Si encuentras una coincidencia, CONFIRMALA con el cliente antes de anadirla al pedido.
- Solo rechaza si el producto NO EXISTE en el catalogo tras buscarlo.

!!! PROTOCOLO DE ENTREGA (OBLIGATORIO):
- ANTES de cerrar la venta, PREGUNTA: "¿Recogida en local o domicilio?".
- SI ES DOMICILIO: Pide la direccion COMPLETA.
- Necesitas OBLIGATORIAMENTE: Nombre, Teléfono, Tipo de Entrega, Dirección (si domicilio) y Método de Pago.

!!! SISTEMA DE RESERVAS DE MESAS:
\${ $('Consultar Feature Flags').item?.json?.value?.reservations_enabled === true ? 
\\\`- Si el cliente quiere RESERVAR una mesa (no pedir comida), usa consultar_disponibilidad con formato: dd/mm/yyyy,HH:MM,pax.
- Si hay disponibilidad, CONFIRMA los datos con el cliente.
- SOLO cuando el cliente confirme todos los datos, usa confirmar_reserva.
- Si no hay disponibilidad, ofrece alternativas del mismo turno.\\\` : 
\\\`- ACTUALMENTE NO ACEPTAMOS RESERVAS (Están deshabilitadas en el sistema). 
- Si el cliente quiere reservar, infórmale muy amablemente que en este momento no hay servicio de reservas y discúlpate.\\\` }

!!! CIERRE DE VENTA Y JSON (VITAL):
Solo cuando el cliente haya CONFIRMADO el pedido completo y no quiera nada mas, despidete amablemente y genera OBLIGATORIAMENTE este bloque EXACTO.
Procesando tu pedido... ⏳
{
  "detalle_pedido": "...",
  "Nombre": "...",
  "Telefono": "...",
  "Tipo de entrega": "...",
  "Metodo de pago": "...",
  "Direccion": "...",
  "total_final": 0.00
}

MODULO 3: USO DE HERRAMIENTAS
**verificar_producto(input)**
**consultar_disponibilidad(fecha, hora, personas)**
**confirmar_reserva(fecha, hora, personas, nombre, telefono, notas)**
**consultar_estado_pedido(order_id)**

MODULO 4: TONO Y ESTILO
- Tono: cercano, natural, con personalidad.
- Usa emojis con moderacion.
- Respuestas cortas y directas.

MODULO 5: LO QUE NUNCA DEBES HACER
- NUNCA generes el JSON del pedido antes de tener los 5 datos.
- NUNCA confirmes disponibilidad sin consultar_disponibilidad.\` }`;
    agentNode.parameters.options.systemMessage = newSysMsg;
  }

  // 3. Asegurar conexión de herramientas
  if (!data.connections['consultar_estado_pedido']) {
    data.connections['consultar_estado_pedido'] = {
      "ai_tool": [[{ "node": "Extraer Datos Estructurados", "type": "ai_tool", "index": 0 }]]
    };
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✅ Workflow FINAL (Patched + Hydrated) guardado en: ${outputPath}`);

} catch (error) {
  console.error("Error:", error.message);
}
