import fs from 'fs';

const INPUT = 'c:\\Users\\Cesar\\Downloads\\Pozu_2.0_FIXED_RISK.json';
const OUTPUT = 'c:\\Users\\Cesar\\Downloads\\Pozu_PRODUCTION_READY.json';

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// 1. Add Parsear JSON node
const parseNode = {
  "parameters": {
    "jsCode": "let out = $input.first().json.output;\ntry {\n  if (typeof out === 'string') {\n    const match = out.match(/\\{[\\s\\S]*\\}/);\n    if (match) $input.first().json.output = JSON.parse(match[0]);\n  }\n} catch(e) {}\nreturn $input.all();"
  },
  "id": "parse-json-node-fixed",
  "name": "Parsear JSON",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [
    -67900,
    -3100
  ]
};
data.nodes.push(parseNode);

// 2. Fix connections
// Extraer Datos Estructurados -> Parsear JSON
data.connections['Extraer Datos Estructurados'] = {
  "main": [
    [
      {
        "node": "Parsear JSON",
        "type": "main",
        "index": 0
      }
    ]
  ]
};

// Parsear JSON -> If
data.connections['Parsear JSON'] = {
  "main": [
    [
      {
        "node": "If",
        "type": "main",
        "index": 0
      }
    ]
  ]
};

data.nodes.forEach(n => {
  // 3. Fix If node
  if (n.name === 'If') {
    n.parameters.conditions.conditions[0].leftValue = "={{ typeof $json.output === 'string' ? $json.output : JSON.stringify($json.output) }}";
  }
  
  // 4. Fix Verificar Método Pago
  if (n.name === 'Verificar Método Pago') {
    n.parameters.rules.values.forEach(rule => {
      rule.conditions.conditions.forEach(cond => {
        if (cond.leftValue.includes('.text')) {
          cond.leftValue = cond.leftValue.replace('.text', '.output');
        }
      });
    });
  }

  // 5. Fix Preparar Chat
  if (n.name === 'Preparar Chat') {
    n.parameters.assignments.assignments.forEach(a => {
      if (a.name === 'mensaje_incompleto') {
        a.value = "={{ typeof $json.output === 'string' ? $json.output.replace(/\\*/g, \"-\") : JSON.stringify($json.output) }}";
      }
    });
  }
});

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ Generado Pozu_PRODUCTION_READY.json');
