const fetch = globalThis.fetch;

async function testWebMenu() {
  console.log('🚀 INICIANDO VERIFICACIÓN DE MENÚ (POZU 2.0)\n');
  const url = 'https://n8npozu.pozu2.com/webhook/chat-web';
  const questions = [
    "dame la carta",
    "quiero pedir"
  ];

  for (const q of questions) {
    console.log(`🎤 Diciendo: "${q}"`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: q,
          chat_id: `test_web_${Date.now()}`,
          source: 'website_chat'
        })
      });
      
      const text = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
        console.log(`🤖 Respuesta: ${parsed.message || parsed.text || JSON.stringify(parsed)}`);
      } catch {
        console.log(`🤖 Respuesta: ${text}`);
      }
    } catch (e) {
      console.error(`❌ Error de conexión: ${e.message}`);
    }
    console.log('--------------------------------------------------\n');
    await new Promise(r => setTimeout(r, 4000));
  }
}

testWebMenu();
