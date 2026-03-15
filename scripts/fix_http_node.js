const fs = require('fs');
const path = 'd:/Jaime/Antigravity/Pozu/n8n_Pozu_2.0_Workflow.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

const rpcNodeIndex = data.nodes.findIndex(n => n.name === 'Verificar Riesgo Cliente');

if (rpcNodeIndex !== -1) {
  data.nodes[rpcNodeIndex] = {
    "parameters": {
      "method": "POST",
      "url": "https://vvlowhdimjjmsrpovurw.supabase.co/rest/v1/rpc/get_customer_risk_profile",
      "authentication": "predefinedCredentialType",
      "nodeCredentialType": "supabaseApi",
      "sendBody": true,
      "contentType": "raw",
      "rawContentType": "application/json",
      "body": "{\n  \"p_phone\": \"{{ $('Extraer Datos Estructurados').item.json.output.telefono_cliente }}\"\n}",
      "options": {}
    },
    "id": data.nodes[rpcNodeIndex].id || "d808d7e1-3c45-4382-9f30-a98201ab00b7",
    "name": "Verificar Riesgo Cliente",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.4,
    "position": [1840, 760],
    "credentials": {
      "supabaseApi": {
        "id": "1",
        "name": "Supabase API"
      }
    }
  };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  console.log('JSON updated successfully!');
} else {
  console.log('Node not found!');
}
