// Corregir webhook de Evolution API v2 - estructura correcta
const BASE_URL = 'https://evolutionapi.pozu2.com';
const API_KEY = 'xCQ8IPqJ37B5YRqso8tWnneQ2Jx7FmeTMIb9xaJv/b9Xq8ee9yVU1F8KKCTKdT0Gj4X9lf3tQCGTvRLmoGs9hg==';
const INSTANCE = 'pozubot';
const CORRECT_WEBHOOK = 'https://n8npozu.pozu2.com/webhook/evolution-whatsapp';

async function fixWebhook() {
  console.log('=== CORRIGIENDO WEBHOOK EVOLUTION API v2 ===\n');

  // Estructura correcta para Evolution API v2
  const payload = {
    webhook: {
      url: CORRECT_WEBHOOK,
      enabled: true,
      webhookByEvents: false,
      webhookBase64: false,
      events: [
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'CONNECTION_UPDATE'
      ]
    }
  };

  console.log('Payload enviado:', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(`${BASE_URL}/webhook/set/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    console.log('\nRespuesta:', JSON.stringify(result, null, 2));

    // Verificar
    await new Promise(r => setTimeout(r, 1000));
    const verifyRes = await fetch(`${BASE_URL}/webhook/find/${INSTANCE}`, {
      headers: { 'apikey': API_KEY }
    });
    const verified = await verifyRes.json();
    console.log('\n=== VERIFICACIÓN FINAL ===');
    console.log('URL activa:', verified.url);
    console.log('Habilitado:', verified.enabled);
    console.log('Eventos:', JSON.stringify(verified.events));
    
    if (verified.url === CORRECT_WEBHOOK) {
      console.log('\n✅ WEBHOOK CORREGIDO EXITOSAMENTE - WhatsApp ahora conecta a producción');
    } else {
      console.log('\n❌ Fallo. URL actual:', verified.url);
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
}

fixWebhook();
