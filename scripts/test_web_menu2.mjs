const fetch = globalThis.fetch;

async function testWebMenu() {
  const url = 'https://n8npozu.pozu2.com/webhook/chat-web';
  const q = "Por favor, dime EXACTAMENTE cuántos productos diferentes aparecen listados de tu carta, y dime el primero y el último de la lista. No los leas resumidos. Dime cuántos ves.";

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
}

testWebMenu();
