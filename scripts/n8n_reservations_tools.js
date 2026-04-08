// =============================================
// POZU 2.0 — TOOLS DE RESERVAS PARA n8n
// =============================================
// Instrucciones:
// En el agente "Extraer Datos Estructurados":
//   1. Añade un nodo Code Tool → pega el código de TOOL 1
//      Name: consultar_disponibilidad
//      Description: "Úsala para verificar si hay mesas disponibles en una fecha y hora concretas. También devuelve horas alternativas si no hay disponibilidad."
//
//   2. Añade otro nodo Code Tool → pega el código de TOOL 2
//      Name: crear_reserva
//      Description: "Úsala SOLO cuando el cliente haya confirmado todos los datos de la reserva (fecha, hora, personas, nombre, teléfono). Crea la reserva y asigna mesa automáticamente."
//
// IMPORTANTE: Ambos nodos Code Tool deben conectarse al input del agente
//             igual que ya está conectado "verificar_producto"
// =============================================


// =============================================
// TOOL 1: consultar_disponibilidad
// =============================================

const input = $fromAI('input', 'Fecha (dd/mm/yyyy), hora (HH:MM) y número de personas separados por coma. Ej: 12/04/2026,20:00,4', 'string');

// --- Parsear input ---
const parts = input.split(',').map(s => s.trim());
const rawDate = parts[0];   // dd/mm/yyyy
const rawTime = parts[1];   // HH:MM
const guests  = parseInt(parts[2]) || 2;

if (!rawDate || !rawTime) {
  return "Necesito la fecha y la hora para verificar disponibilidad. Formato: dd/mm/yyyy, HH:MM, número de personas.";
}

// Convertir dd/mm/yyyy → yyyy-mm-dd
const [day, month, year] = rawDate.split('/');
const isoDate = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
const dateObj = new Date(`${isoDate}T${rawTime}:00`);
const dayOfWeek = dateObj.getDay(); // 0=domingo

// --- Obtener horarios del local ---
let timeSlots = [];
try {
  timeSlots = $('Consultar Horarios').all().map(s => s.json);
} catch(e) {
  // Si no tienes nodo "Consultar Horarios", los horarios están hardcodeados abajo como fallback
  timeSlots = [];
}

// Verificar si el día tiene horario activo
const slotsDelDia = timeSlots.filter(s => s.day_of_week === dayOfWeek && s.is_active !== false);

if (slotsDelDia.length === 0) {
  return `Lo siento, el local está cerrado ese día. Los días disponibles son: martes a domingo.`;
}

// Verificar si la hora está dentro de algún turno
const [hh, mm] = rawTime.split(':').map(Number);
const horaEnMinutos = hh * 60 + mm;

const turnoValido = slotsDelDia.find(s => {
  const [oh, om] = s.open_time.split(':').map(Number);
  const [ch, cm] = s.close_time.split(':').map(Number);
  return horaEnMinutos >= oh * 60 + om && horaEnMinutos <= ch * 60 + cm;
});

if (!turnoValido) {
  const horariosTexto = slotsDelDia.map(s => `${s.open_time} - ${s.close_time}`).join(' y ');
  return `Esa hora no está disponible. El horario para ese día es: ${horariosTexto}.`;
}

// --- Obtener mesas con capacidad suficiente ---
let mesas = [];
try {
  mesas = $('Consultar Mesas').all().map(m => m.json).filter(m => m.is_active !== false && m.capacity >= guests);
} catch(e) {
  mesas = [];
}

if (mesas.length === 0) {
  return `Lo siento, no tenemos mesas disponibles para ${guests} personas. ¿Quieres intentar con menos comensales?`;
}

// --- Consultar reservas existentes en esa franja ---
let reservasExistentes = [];
try {
  reservasExistentes = $('Consultar Reservas Fecha').all().map(r => r.json).filter(r => 
    r.reservation_date === isoDate && 
    r.status === 'confirmed'
  );
} catch(e) {
  reservasExistentes = [];
}

// Calcular fin de la reserva solicitada
const duracion = turnoValido.slot_duration_minutes || 90;
const inicioMin = horaEnMinutos;
const finMin = inicioMin + duracion;

// Mesas ya ocupadas en esa franja
const mesasOcupadas = reservasExistentes
  .filter(r => {
    const [rh, rm] = r.reservation_time.split(':').map(Number);
    const rInicio = rh * 60 + rm;
    const rFin = rInicio + duracion;
    return rInicio < finMin && rFin > inicioMin;
  })
  .map(r => r.table_id);

// Mesas libres
const mesasLibres = mesas.filter(m => !mesasOcupadas.includes(m.id));

if (mesasLibres.length === 0) {
  // Generar horas alternativas disponibles en el mismo turno
  const alternativas = [];
  const slotMinutos = 30;
  const openMin = turnoValido.open_time.split(':').map(Number).reduce((h,m,i) => i===0 ? h*60+m : h+m, 0);
  // Simplificado:
  const [oh2, om2] = turnoValido.open_time.split(':').map(Number);
  const [ch2, cm2] = turnoValido.close_time.split(':').map(Number);
  const openTotalMin = oh2 * 60 + om2;
  const closeTotalMin = ch2 * 60 + cm2;

  for (let t = openTotalMin; t <= closeTotalMin - duracion; t += slotMinutos) {
    if (t === inicioMin) continue;
    const hAlt = Math.floor(t / 60).toString().padStart(2, '0');
    const mAlt = (t % 60).toString().padStart(2, '0');
    const horaAlt = `${hAlt}:${mAlt}`;
    
    const ocupadasAlt = reservasExistentes.filter(r => {
      const [rh, rm] = r.reservation_time.split(':').map(Number);
      const rInicio = rh * 60 + rm;
      const rFin = rInicio + duracion;
      return rInicio < t + duracion && rFin > t;
    }).map(r => r.table_id);
    
    const libresAlt = mesas.filter(m => !ocupadasAlt.includes(m.id));
    if (libresAlt.length > 0) alternativas.push(horaAlt);
    if (alternativas.length >= 3) break;
  }

  if (alternativas.length > 0) {
    return `Lo siento, a las ${rawTime} no hay mesas disponibles para ${guests} personas el ${rawDate}. ¿Te viene bien alguna de estas horas alternativas? ${alternativas.join(', ')}`;
  }
  return `Lo siento, no hay disponibilidad para ${guests} personas el ${rawDate}. ¿Quieres probar otra fecha?`;
}

return `DISPONIBLE | fecha:${isoDate} | hora:${rawTime} | personas:${guests} | mesas_libres:${mesasLibres.length} | primera_mesa_id:${mesasLibres[0].id} | primera_mesa_nombre:${mesasLibres[0].name}`;


// =============================================
// TOOL 2: crear_reserva
// =============================================

const input2 = $fromAI('input', 'JSON con los datos de la reserva: fecha (yyyy-mm-dd), hora (HH:MM), personas, nombre, telefono, table_id, notas (opcional)', 'string');

let datos;
try {
  datos = JSON.parse(input2);
} catch(e) {
  // Intentar extraer del texto si no viene como JSON puro
  return "Error al procesar los datos. Asegúrate de tener: fecha, hora, personas, nombre y teléfono confirmados por el cliente.";
}

const {
  fecha,
  hora,
  personas,
  nombre,
  telefono,
  table_id,
  notas = ''
} = datos;

if (!fecha || !hora || !personas || !nombre || !telefono) {
  const faltantes = [];
  if (!nombre) faltantes.push('nombre');
  if (!telefono) faltantes.push('teléfono');
  if (!fecha) faltantes.push('fecha');
  if (!hora) faltantes.push('hora');
  if (!personas) faltantes.push('número de personas');
  return `Faltan datos para crear la reserva: ${faltantes.join(', ')}. Por favor recógelos del cliente.`;
}

// Obtener canal de origen
let canal = 'website_chat';
try {
  canal = $('🛡️ Blindar Metadata').item.json.canal_origen || 'website_chat';
} catch(e) {}

let session = '';
try {
  session = $('🛡️ Blindar Metadata').item.json.chat_id || '';
} catch(e) {}

// Preparar objeto reserva
const reserva = {
  customer_name: nombre,
  phone: telefono,
  reservation_date: fecha,
  reservation_time: hora,
  guests: parseInt(personas),
  table_id: table_id || null,
  status: 'confirmed',
  notes: notas,
  source: canal,
  session_id: session
};

// Insertar en Supabase vía HTTP (usa tu URL y anon key de Supabase)
// NOTA: Reemplaza SUPABASE_URL y SUPABASE_ANON_KEY con tus valores reales
// O mejor aún: conéctalo a un nodo Supabase externo y usa $('Insertar Reserva').item.json

return `RESERVA_LISTA | ${JSON.stringify(reserva)}`;

// INSTRUCCIÓN IMPORTANTE:
// Después de esta tool, añade un nodo Supabase "Insertar en reservations"
// que recoja el output y haga el INSERT real.
// El agente devolverá el JSON con los datos y tú lo procesas en el siguiente nodo.
