import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
import fs from 'fs'
const envContent = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')))

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY
const n8nWebhookUrl = env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL

const supabase = createClient(supabaseUrl, supabaseKey)

const testSessionId = 'test_' + Date.now()

async function sendChat(text) {
  process.stdout.write(`💬 USER: "${text}" ... `);
  const payload = {
    source: 'website_chat',
    session_id: testSessionId,
    user_name: 'TESTER',
    text: text,
    message: { text: text },
    timestamp: new Date().toISOString()
  }

  try {
    const res = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      console.log(`❌ HTTP Error: ${res.status}`);
      return;
    }

    const body = await res.json().catch(() => null);
    if (!body) {
      console.log(`⚠️  Response received but not valid JSON.`);
      return;
    }
    
    const aiResponse = body.message || body.text || JSON.stringify(body);
    console.log(`✅ OK\n🤖 AI: "${aiResponse}"`);
    return body
  } catch (err) {
    console.log(`❌ ERROR: ${err.message}`);
  }
}

async function runTests() {
  console.log('\n🚀 INICIANDO BATERÍA DE PRUEBAS DE CHAT POZU 2.0\n')

  // Prueba 1: Menú
  await sendChat('Hola, ¿qué tenéis en la carta?')
  
  await new Promise(r => setTimeout(r, 2000))

  // Prueba 2: Alérgenos
  await sendChat('¿Qué lleva la Pozu? ¿Tiene gluten?')

  await new Promise(r => setTimeout(r, 2000))

  // Prueba 3: Pagos
  await sendChat('¿Aceptáis tarjeta de crédito?')

  await new Promise(r => setTimeout(r, 2000))

  // Prueba 4: Pedido Incompleto (Salsa)
  await sendChat('Ponme una Pozu y una cesta de patatas.')

  console.log('\n--- FIN DE PRUEBAS ---\n')
}

runTests()
