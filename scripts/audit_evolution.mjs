// Auditoría de Evolution API via REST
// La API key de Evolution Manager está en el flujo de n8n: xCQ8IPqJ37B5YRqso8tWnneQ2Jx7FmeTMIb9xaJv/b9Xq8ee9yVU1F8KKCTKdT0Gj4X9lf3tQCGTvRLmoGs9hg==

const BASE_URL = 'https://evolutionapi.pozu2.com';
const API_KEY = 'xCQ8IPqJ37B5YRqso8tWnneQ2Jx7FmeTMIb9xaJv/b9Xq8ee9yVU1F8KKCTKdT0Gj4X9lf3tQCGTvRLmoGs9hg==';
const N8N_WEBHOOK = 'https://n8npozu.pozu2.com/webhook/evolution-whatsapp';

async function auditEvolution() {
  console.log('=== AUDITORÍA EVOLUTION API ===\n');

  // 1. Listar todas las instancias
  try {
    const res = await fetch(`${BASE_URL}/instance/fetchInstances`, {
      headers: { 'apikey': API_KEY }
    });
    const instances = await res.json();
    console.log('Instancias encontradas:');
    console.log(JSON.stringify(instances, null, 2));

    // 2. Para cada instancia, verificar webhook
    if (Array.isArray(instances)) {
      for (const inst of instances) {
        const name = inst.instance?.instanceName || inst.name;
        console.log(`\n--- Instancia: ${name} ---`);
        console.log(`Estado: ${inst.instance?.state || inst.state || 'desconocido'}`);

        // Obtener webhook
        try {
          const wRes = await fetch(`${BASE_URL}/webhook/find/${name}`, {
            headers: { 'apikey': API_KEY }
          });
          const webhook = await wRes.json();
          console.log('Webhook actual:', JSON.stringify(webhook, null, 2));
          
          if (webhook?.url === N8N_WEBHOOK) {
            console.log('✅ Webhook configurado correctamente');
          } else {
            console.log(`❌ Webhook INCORRECTO o FALTANTE. Debería ser: ${N8N_WEBHOOK}`);
          }
        } catch(e) {
          console.log('Error obteniendo webhook:', e.message);
        }
      }
    }
  } catch(e) {
    console.error('Error conectando a Evolution API:', e.message);
  }
}

auditEvolution();
