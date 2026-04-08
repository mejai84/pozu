const url = 'https://n8npozu.pozu2.com/webhook/chat-web';
const questions = [
  "Quiero una Pozu Presidencial",
  "¿Es para recoger o para envío?",
  "Envíamela a la calle Falsa 123 en Pola de Laviana"
];

async function stressTest() {
  console.log("Iniciando Test de Estrés con tiempos de OpenAI (5s entre preguntas)...");
  
  for (let i = 0; i < questions.length; i++) {
    console.log(`\n--- Pregunta ${i+1}: ${questions[i]} ---`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: questions[i],
          chat_id: "stress_session_999",
          source: "website_chat"
        })
      });
      
      const result = await response.text();
      console.log(`STATUS: ${response.status}`);
      console.log(`IA RESPONDRE: ${result}`);
    } catch (error) {
      console.error("ERROR:", error.message);
    }
    
    // Esperar 5 segundos entre preguntas
    if (i < questions.length - 1) {
      console.log("Esperando 5 segundos para que OpenAI procese...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

stressTest();
