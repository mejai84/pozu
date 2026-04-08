// Test de comportamiento del bot por TODOS los canales
// Canal 1: Web Chat (webhook/chat-web)
// Canal 2: Vapi (webhook/vapi-transcription) 
// Canal 3: WhatsApp/Evolution (webhook/evolution-whatsapp)

const TESTS = [
  { question: "Quiero una Pozu Presidencial", expected: "rechazar plato inventado" },
  { question: "dame la carta", expected: "mostrar menú real" },
  { question: "quien es el presidente de españa", expected: "rechazar tema fuera de Pozu" },
  { question: "quiero una hamburguesa pozu para llevar", expected: "preguntar recoger o envío" },
];

async function testChannel(name, url, buildPayload) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`CANAL: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`${'='.repeat(60)}`);

  for (const test of TESTS) {
    console.log(`\n📝 Pregunta: "${test.question}"`);
    console.log(`🎯 Esperado: ${test.expected}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(test.question))
      });

      const status = res.status;
      const text = await res.text();
      console.log(`📡 Status: ${status}`);

      try {
        const json = JSON.parse(text);
        const msg = json.message || json.text || json.output || text;
        console.log(`🤖 Respuesta: ${typeof msg === 'string' ? msg.substring(0, 200) : JSON.stringify(msg).substring(0, 200)}`);
      } catch {
        console.log(`🤖 Respuesta (raw): ${text.substring(0, 200)}`);
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }

    // Pausa de 4 segundos entre preguntas
    await new Promise(r => setTimeout(r, 4000));
  }
}

async function runAllTests() {
  console.log('🚀 INICIO TEST DE COMPORTAMIENTO MULTICANAL POZU 2.0');
  console.log(`⏰ ${new Date().toLocaleString()}\n`);

  // Test Chat Web
  await testChannel(
    'WEB CHAT',
    'https://n8npozu.pozu2.com/webhook/chat-web',
    (q) => ({ text: q, chat_id: `test_web_${Date.now()}`, source: 'website_chat' })
  );

  // Test Vapi
  await testChannel(
    'VAPI (Voz)',
    'https://n8npozu.pozu2.com/webhook/vapi-transcription',
    (q) => ({ transcript: q, source: 'vapi', call_id: `test_vapi_${Date.now()}` })
  );

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('✅ TESTS COMPLETADOS');
  console.log(`${'='.repeat(60)}`);
}

runAllTests();
