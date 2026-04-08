async function testVapi() {
  console.log('🚀 INICIANDO VERIFICACIÓN DE VAPI PARA POZU 2.0\n');
  const url = 'https://n8npozu.pozu2.com/webhook/vapi-transcription';
  const questions = [
    "Quiero una Pozu Presidencial",
    "quiero una hamburguesa pozu para llevar"
  ];

  for (const q of questions) {
    console.log(`🎤 Diciendo: "${q}"`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: q,
          source: 'vapi',
          call_id: `test_vapi_${Date.now()}`
        })
      });
      
      const text = await res.text();
      console.log(`📡 Status: ${res.status}`);
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

testVapi();
