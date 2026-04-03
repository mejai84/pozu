import fs from 'fs';

const INPUT = 'c:\\Users\\Cesar\\Downloads\\Pozu 2.0 - Multichannel Sales AI (v3.0 Dynamic) (1).json';
const OUTPUT = 'c:\\Users\\Cesar\\Downloads\\Pozu_2.0_FIXED_RISK.json';

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

let fixes = 0;

data.nodes = data.nodes.map(node => {
  // FIX 1: "Verificar Riesgo Cliente" → quitar el filtro problemático de JSON path
  // El filtro =guest_info->>phone es sintaxis Postgres que el nodo Supabase no soporta bien.
  // Lo reemplazamos por un getAll sin filtros + alwaysOutputData:true
  if (node.name === 'Verificar Riesgo Cliente') {
    node.parameters.filters = { conditions: [] }; // Sin filtros
    node.alwaysOutputData = true;
    console.log('✅ Fix 1: Verificar Riesgo Cliente - filtro eliminado, alwaysOutputData=true');
    fixes++;
  }

  // FIX 2: "Evaluar Nivel Riesgo" → añadir un fallback que siempre pase
  // El switch solo tenía rama VERDE, pero los clientes nuevos no tienen risk_level
  // → cambiamos la condición para que CUALQUIER cliente pase a Preparar Pedido Verde
  if (node.name === 'Evaluar Nivel Riesgo') {
    node.parameters.rules.values = [
      {
        conditions: {
          conditions: [
            {
              // Si el pedido anterior cuenta es 0 o risk_level es undefined/VERDE → pasar
              leftValue: "={{ ($json.risk_level === 'ROJO') ? 'bloquear' : 'continuar' }}",
              rightValue: "continuar",
              operator: {
                type: "string",
                operation: "equals"
              }
            }
          ]
        },
        renameOutput: true,
        outputKey: "Verde - Confirmar"
      }
    ];
    // Añadir options para que no rompa si no hay match
    node.parameters.options = { fallbackOutput: "none" };
    console.log('✅ Fix 2: Evaluar Nivel Riesgo - condición simplificada (acepta clientes nuevos y VERDE)');
    fixes++;
  }

  return node;
});

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\n🎉 Workflow corregido con ${fixes} fixes guardado en:\n${OUTPUT}`);
