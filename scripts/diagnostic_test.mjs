async function testPozu() {
  const url = 'https://n8npozu.pozu2.com/webhook/chat-web';
  const data = {
    text: "Quiero una Pozu Presidencial",
    chat_id: "test_stress_002",
    source: "website_chat"
  };

  try {
    console.log("Enviando petición a:", url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.text();
    console.log("STATUS:", response.status);
    console.log("RESPONSE:", result);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

testPozu();
