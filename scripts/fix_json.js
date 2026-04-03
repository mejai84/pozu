const fs = require('fs');
const file = 'c:\\\\Users\\\\Cesar\\\\Downloads\\\\Pozu 2.0 - Multichannel Sales AI (v3.0 Dynamic) (1).json';
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

data.nodes.forEach(n => {
  if (n.name === 'If') {
    n.parameters.conditions.conditions[0].leftValue = `={{ typeof $json.output === 'object' ? JSON.stringify($json.output) : $json.output }}`;
  }
  if (n.name === 'Preparar Chat') {
    const a = n.parameters.assignments.assignments.find(x => x.name === 'mensaje_incompleto');
    if (a) {
      a.value = `={{ typeof $json.output === 'string' ? $json.output.replace(/\\*/g, '-') : JSON.stringify($json.output) }}`;
    }
  }
});

fs.writeFileSync('c:\\\\Users\\\\Cesar\\\\Downloads\\\\Pozu_2.0_Fixed_Agent.json', JSON.stringify(data, null, 2));
console.log('File written successfully.');
