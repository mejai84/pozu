import fs from 'fs';

const INPUT = 'c:\\Users\\Cesar\\Downloads\\Pozu 2.0 - Multichannel Sales AI (v3.0 Dynamic) (1).json';
const OUTPUT = 'c:\\Users\\Cesar\\Downloads\\Pozu_FIXED_EXPRESSIONS.json';

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// The mega parsing string to replace `$json.output` accesses
// Since the node is 2 steps away, we must target the node directly.
const parseExpr = "(typeof $('Extraer Datos Estructurados').first().json.output === 'string' ? JSON.parse($('Extraer Datos Estructurados').first().json.output.match(/\\{[\\s\\S]*\\}/)[0]) : $('Extraer Datos Estructurados').first().json.output)";

let changes = 0;

data.nodes.forEach(n => {
  
  // 1. If Node -> keep checking the string
  if (n.name === 'If') {
    n.parameters.conditions.conditions[0].leftValue = "={{ $('Extraer Datos Estructurados').first().json.output }}";
    changes++;
  }

  // 2. Verificar Riesgo Cliente -> it was using .item.json.output, but better to use inline parser 
  if (n.name === 'Verificar Riesgo Cliente') {
    n.parameters.filters = { conditions: [] };
    n.alwaysOutputData = true;
    changes++;
  }

  // 3. Evaluar Nivel Riesgo -> risk_level logic
  if (n.name === 'Evaluar Nivel Riesgo') {
    n.parameters.rules.values[0].conditions.conditions[0].leftValue = "={{ ($json.risk_level === 'ROJO') ? 'bloquear' : 'continuar' }}";
    n.parameters.rules.values[0].conditions.conditions[0].rightValue = "continuar";
    n.parameters.options = { fallbackOutput: "none" };
    changes++;
  }

  // 4. Verificar Método Pago -> replace .text with .output
  if (n.name === 'Verificar Método Pago') {
    n.parameters.rules.values.forEach(rule => {
      rule.conditions.conditions.forEach(c => {
         c.leftValue = "={{ $('Extraer Datos Estructurados').first().json.output }}";
      });
    });
    changes++;
  }

  // 5. Preparar Pago Tarjeta -> Needs parsed object
  if (n.name === 'Preparar Pago Tarjeta') {
    n.parameters.assignments.assignments.forEach(a => {
      if (a.value.includes('$json.output.')) {
        a.value = a.value.replace('$json.output.', `${parseExpr}.`);
      }
    });
    changes++;
  }

  // 6. Preparar para Supabase -> Needs parsed object
  if (n.name === 'Preparar para Supabase') {
    n.parameters.assignments.assignments.forEach(a => {
      if (a.value.includes('$json.output.')) {
        a.value = a.value.replace(/\$json\.output\./g, `${parseExpr}.`);
      }
      if (a.value.includes('$json.output?.')) {
        a.value = a.value.replace(/\$json\.output\?\./g, `${parseExpr}?.`);
      }
    });
    changes++;
  }

  // 7. Preparar Chat (Incomplete data branch) -> just output the string
  if (n.name === 'Preparar Chat') {
    n.parameters.assignments.assignments.forEach(a => {
      if (a.name === 'mensaje_incompleto') {
        a.value = "={{ $('Extraer Datos Estructurados').first().json.output.replace(/\\*/g, \"-\") }}";
      }
    });
    changes++;
  }

});

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
console.log(`✅ Creado Pozu_FIXED_EXPRESSIONS.json con ${changes} nodos modificados.`);
