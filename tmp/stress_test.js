const axios = require('axios');

const WEBHOOK_URL = 'https://n8npozu.pozu2.com/webhook/chat-web';

async function sendRequest(id) {
    const data = {
        source: 'stress_test_bot',
        session_id: `stress_session_${id % 2}`, // Test 2 concurrent sessions
        user_name: `StressBot_${id}`,
        text: `Hola! Dime qué hamburguesas tienes disponibles? Esta es la petición de estrés #${id}`
    };
    
    console.log(`[Request ${id}] Sending...`);
    const start = Date.now();
    try {
        const response = await axios.post(WEBHOOK_URL, data, { timeout: 30000 });
        const end = Date.now();
        console.log(`[Request ${id}] Success! (${end - start}ms) - Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
        const end = Date.now();
        console.error(`[Request ${id}] FAILED! (${end - start}ms) - Error: ${error.message}`);
    }
}

async function runStressTest() {
    console.log('--- STARTING STRESS TEST ---');
    const requests = [];
    for (let i = 1; i <= 5; i++) {
        requests.push(sendRequest(i));
    }
    await Promise.all(requests);
    console.log('--- STRESS TEST FINISHED ---');
}

runStressTest();
