import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load environment variables correctly
const envContent = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')))

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY
const n8nWebhookUrl = env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL

const testSessionId = 'final_test_' + Date.now()

async function sendChat(text) {
  process.stdout.write(`💬 USER: "${text}" ... `);
  const payload = {
    source: 'website_chat',
    session_id: testSessionId,
    user_name: 'TESTER_POZU',
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

    const rawText = await res.text();
    let body = null;
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      console.log(`⚠️  Response received but not valid JSON. RAW BODY: "${rawText.substring(0, 500)}"`);
      return;
    }
    
    const aiResponse = body.message || body.text || JSON.stringify(body);
    console.log(`✅ OK\n🤖 AI: "${aiResponse}"`);
    return body
  } catch (err) {
    console.log(`❌ ERROR: ${err.message}`);
  }
}

async function runLiveAudit() {
  console.log('\n====================================')
  console.log('🍔 INICIANDO AUDITORÍA EN VIVO POZU AI 🍔')
  console.log('====================================\n')

  // 1. Saludo y Menú (Prueba de Herramienta Global)
  await sendChat('Hola crack, ¿qué tenéis en la carta?')
  await new Promise(r => setTimeout(r, 3000))

  // 2. Picnic/Picoteo (Prueba de Categorización)
  await sendChat('¿Y de picoteo?')
  await new Promise(r => setTimeout(r, 3000))

  // 3. Alérgenos Específicos (Prueba de Metadata DB)
  await sendChat('¿Alguna burger que no tenga lactosa?')
  await new Promise(r => setTimeout(r, 3000))

  // 4. Lógica de Modificadores (+2€ Pollo)
  await sendChat('Me pones una Pozu de pollo crujiente y unas patatas.')
  await new Promise(r => setTimeout(r, 3000))

  // 5. Salsa Brava (Prueba de Memoria de Contexto)
  await sendChat('Con salsa brava para las patatas.')
  await new Promise(r => setTimeout(r, 3000))

  // 6. Pagos (Prueba de Feature Flags)
  await sendChat('¿Puedo pagar con tarjeta?')
  await new Promise(r => setTimeout(r, 3000))

  // 7. Cierre Formal (Prueba de Extracción de Datos y JSON)
  await sendChat('Vale, eso es todo. Soy Cesar, mi tlf es 600000001 y c/ Uría 12.')
  
  console.log('\n====================================')
  console.log('🏁 FIN DE AUDITORÍA')
  console.log('====================================\n')
}

runLiveAudit()
