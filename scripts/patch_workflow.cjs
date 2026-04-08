const fs = require('fs');

const wfPath = 'c:/Users/Cesar/Downloads/Pozu_FIXED_EXPRESSIONS.json';
const outPath = 'd:/Jaime/Antigravity/Pozu/workflow_POZU_WITH_RESERVATIONS.json';

let wf;
try {
  wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
} catch(e) {
  console.log('Error reading JSON:', e.message);
  process.exit(1);
}

// 1. Update Agent prompt
const agentNode = wf.nodes.find(n => n.name === 'Extraer Datos Estructurados');
if (agentNode) {
  const newPrompt = fs.readFileSync('d:/Jaime/Antigravity/Pozu/scripts/n8n_reservations_prompt.txt', 'utf8');
  agentNode.parameters.options.systemMessage += '\n\n' + newPrompt;
}

// 2. Add Code Tools
const tool1Str = fs.readFileSync('d:/Jaime/Antigravity/Pozu/scripts/n8n_reservations_tools.js', 'utf8');
const tool1Code = tool1Str.split('// TOOL 2:')[0].split('// TOOL 1: consultar_disponibilidad')[1];
const tool2Code = tool1Str.split('// TOOL 2: crear_reserva')[1];

const t1 = {
  parameters: {
    description: 'Úsala para verificar si hay mesas disponibles en una fecha y hora concretas. También devuelve horas alternativas si no hay disponibilidad.',
    jsCode: tool1Code.trim()
  },
  type: '@n8n/n8n-nodes-langchain.toolCode',
  typeVersion: 1.3,
  position: [-352, -1600],
  id: 'tool-disp-' + Date.now(),
  name: 'consultar_disponibilidad'
};

const t2 = {
  parameters: {
    description: 'Úsala SOLO cuando el cliente haya confirmado todos los datos de la reserva (fecha, hora, personas, nombre, teléfono). Crea la reserva y asigna mesa automáticamente.',
    jsCode: tool2Code.trim()
  },
  type: '@n8n/n8n-nodes-langchain.toolCode',
  typeVersion: 1.3,
  position: [-352, -1400],
  id: 'tool-res-' + Date.now(),
  name: 'crear_reserva'
};

wf.nodes.push(t1, t2);

// 3. Connect tools to Agent
if (!wf.connections[t1.name]) wf.connections[t1.name] = { ai_tool: [[{ node: 'Extraer Datos Estructurados', type: 'ai_tool', index: 0 }]] };
if (!wf.connections[t2.name]) wf.connections[t2.name] = { ai_tool: [[{ node: 'Extraer Datos Estructurados', type: 'ai_tool', index: 0 }]] };

// 4. Add Supabase query nodes BEFORE agent
// Currently: Consultar Catálogo Productos -> Extraer Datos Estructurados
const getTableStr = (table, name, y) => ({
  parameters: { operation: 'getAll', tableId: table, returnAll: true },
  id: 'sup-' + table + '-' + Date.now(),
  name: name,
  type: 'n8n-nodes-base.supabase',
  typeVersion: 1,
  position: [-976, y],
  credentials: { supabaseApi: { id: 'FuNmSwNtO9Gdhqsd', name: 'Supabase account' } }
});

const nHorarios = getTableStr('time_slots', 'Consultar Horarios', -1800);
const nMesas = getTableStr('tables', 'Consultar Mesas', -1600);
const nReservas = getTableStr('reservations', 'Consultar Reservas Fecha', -1400);

wf.nodes.push(nHorarios, nMesas, nReservas);

// Rewire: Productos -> Horarios -> Mesas -> Reservas -> Agent
wf.connections['Consultar Catálogo Productos'] = { main: [[{ node: 'Consultar Horarios', type: 'main', index: 0 }]] };
wf.connections[nHorarios.name] = { main: [[{ node: 'Consultar Mesas', type: 'main', index: 0 }]] };
wf.connections[nMesas.name] = { main: [[{ node: 'Consultar Reservas Fecha', type: 'main', index: 0 }]] };
wf.connections[nReservas.name] = { main: [[{ node: 'Extraer Datos Estructurados', type: 'main', index: 0 }]] };

// 5. Post-Agent changes: Detect RESERVA_LISTA branch.
// Currently agent -> If (name 'If')
const ifNode = wf.nodes.find(n => n.name === 'If');

const nIfReserva = {
  parameters: {
    conditions: {
      options: { caseSensitive:true, leftValue:'', typeValidation:'strict', version:3 },
      conditions: [{
        leftValue: '={{ $(\'Extraer Datos Estructurados\').first().json.output }}',
        rightValue: 'RESERVA_LISTA',
        operator: { type: 'string', operation: 'contains' }
      }],
      combinator: 'and'
    }
  },
  type: 'n8n-nodes-base.if',
  typeVersion: 2.3,
  position: [1808, -2600], // Adjust position above Preparar Chat
  id: 'if-reserva-' + Date.now(),
  name: 'Es Reserva?'
};

const nPrepReserva = {
  parameters: {
    assignments: {
      assignments: [
        {
          name: 'reserva_data',
          value: '={{ JSON.parse($(\'Extraer Datos Estructurados\').first().json.output.split(\"|\")[1].trim()) }}',
          type: 'object'
        }
      ]
    },
    options: {}
  },
  type: 'n8n-nodes-base.set',
  typeVersion: 3.4,
  position: [2100, -2800],
  id: 'prep-res-' + Date.now(),
  name: 'Preparar Objeto Reserva'
};

const nInsReserva = {
  parameters: {
    tableId: 'reservations',
    dataToSend: 'defineBelow',
    fieldsUi: {
      fieldValues: [
        { fieldId: 'customer_name', fieldValue: '={{ $json.reserva_data.customer_name }}' },
        { fieldId: 'phone', fieldValue: '={{ $json.reserva_data.phone }}' },
        { fieldId: 'reservation_date', fieldValue: '={{ $json.reserva_data.reservation_date }}' },
        { fieldId: 'reservation_time', fieldValue: '={{ $json.reserva_data.reservation_time }}' },
        { fieldId: 'guests', fieldValue: '={{ $json.reserva_data.guests }}' },
        { fieldId: 'table_id', fieldValue: '={{ $json.reserva_data.table_id }}' },
        { fieldId: 'notes', fieldValue: '={{ $json.reserva_data.notes }}' },
        { fieldId: 'source', fieldValue: '={{ $json.reserva_data.source }}' },
        { fieldId: 'session_id', fieldValue: '={{ $json.reserva_data.session_id }}' }
      ]
    }
  },
  type: 'n8n-nodes-base.supabase',
  typeVersion: 1,
  position: [2300, -2800],
  id: 'ins-res-' + Date.now(),
  name: 'Insertar en reservations',
  credentials: { supabaseApi: { id: 'FuNmSwNtO9Gdhqsd', name: 'Supabase account' } }
};

wf.nodes.push(nIfReserva, nPrepReserva, nInsReserva);

// Rewire If node False branch to Es Reserva?
if (wf.connections['If'] && wf.connections['If'].main && wf.connections['If'].main[1]) {
  wf.connections['If'].main[1] = [{ node: 'Es Reserva?', type: 'main', index: 0 }];
}

wf.connections[nIfReserva.name] = {
  main: [
    [{ node: 'Preparar Objeto Reserva', type: 'main', index: 0 }],
    [{ node: 'Preparar Chat', type: 'main', index: 0 }] // False goes to regular chat
  ]
};

wf.connections[nPrepReserva.name] = {
  main: [[{ node: 'Insertar en reservations', type: 'main', index: 0 }]]
};

// Insertar Reserva should probably respond somehow, but let the user wire the exact response formatting, or we can pipe it into Preparar Chat but intercept the text
wf.connections[nInsReserva.name] = {
  main: [[{ node: 'Preparar Chat', type: 'main', index: 0 }]] // Just going back to chat prep for now
};

fs.writeFileSync(outPath, JSON.stringify(wf, null, 2));
console.log('Saved modified workflow to ' + outPath);
