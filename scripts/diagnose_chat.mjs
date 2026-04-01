import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL || 'https://n8npozu.pozu2.com/webhook/chat-web'

const supabase = createClient(supabaseUrl, supabaseKey)

const testSessionId = 'diag_' + Date.now()

async function diagnose() {
  console.log('\n====================================')
  console.log('🔍 DIAGNÓSTICO CHAT POZU AI')
  console.log('====================================\n')

  // 1. Verificar tabla chat_messages
  console.log('1️⃣  Comprobando tabla chat_messages...')
  const { data: chatMsgs, error: chatErr } = await supabase
    .from('chat_messages')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(5)

  if (chatErr) {
    console.error('❌ Error accediendo a chat_messages:', chatErr.message)
  } else {
    console.log(`✅ chat_messages accesible. Últimos ${chatMsgs.length} mensajes:`)
    chatMsgs.forEach((m, i) => {
      console.log(`   [${i+1}] ${m.sender.padEnd(10)} | session: ${m.session_id?.substring(0,20)}... | "${m.message?.substring(0,50)}"`)
    })
  }

  // 2. Verificar tabla n8n_chat_histories
  console.log('\n2️⃣  Comprobando tabla n8n_chat_histories...')
  const { data: n8nHist, error: n8nErr } = await supabase
    .from('n8n_chat_histories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (n8nErr) {
    console.error('❌ Error accediendo a n8n_chat_histories:', n8nErr.message)
  } else {
    console.log(`✅ n8n_chat_histories accesible. Últimas ${n8nHist.length} entradas.`)
    n8nHist.forEach((h, i) => {
      const msg = typeof h.message === 'object' ? h.message : JSON.parse(h.message || '{}')
      console.log(`   [${i+1}] ${msg.role?.padEnd(10)} | session: ${h.session_id?.substring(0,20)}... | "${String(msg.content).substring(0,50)}"`)
    })
  }

  // 3. Insertar mensaje de prueba en chat_messages
  console.log('\n3️⃣  Insertando mensaje de prueba en chat_messages...')
  const { data: insertedMsg, error: insertErr } = await supabase
    .from('chat_messages')
    .insert({
      session_id: testSessionId,
      sender: 'user',
      message: 'Hola, diagnóstico automático de Pozu AI'
    })
    .select()
    .single()

  if (insertErr) {
    console.error('❌ Error al insertar en chat_messages:', insertErr.message)
  } else {
    console.log(`✅ Mensaje insertado correctamente. ID: ${insertedMsg.id}`)
  }

  // 4. Enviar al webhook n8n
  console.log(`\n4️⃣  Enviando payload al webhook n8n: ${n8nWebhookUrl}`)
  
  const payload = {
    source: 'website_chat',
    session_id: testSessionId,
    user_name: 'DIAGNÓSTICO',
    text: 'Hola, diagnóstico automático de Pozu AI',
    message: { text: 'Hola, diagnóstico automático de Pozu AI' },
    message_id: insertedMsg?.id,
    timestamp: new Date().toISOString()
  }

  console.log('   Payload enviado:', JSON.stringify(payload, null, 2))

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const res = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const status = res.status
    const contentType = res.headers.get('content-type') || ''
    let body = null

    if (contentType.includes('application/json')) {
      try { body = await res.json() } catch (e) { body = 'JSON inválido' }
    } else {
      body = await res.text()
    }
    
    if (res.ok) {
      console.log(`✅ Webhook respondió con status: ${status}`)
      console.log('   Cuerpo de respuesta n8n:', JSON.stringify(body, null, 2))

      if (body && (body.message || body.text || body.success)) {
        console.log('\n🎉 n8n RESPONDIÓ CON CONTENIDO - El flujo está operativo.')
        console.log('   Mensaje de respuesta IA:', body.message || body.text)
      } else {
        console.log('\n⚠️  n8n respondió OK pero SIN CONTENIDO de respuesta.')
        console.log('   Esto significa que el webhook procesó el mensaje pero no devolvió')
        console.log('   un campo "message" o "text" en la respuesta JSON.')
        console.log('   La IA probablemente responda vía Realtime (insert en chat_messages).')
      }
    } else {
      console.log(`❌ Webhook respondió con error HTTP ${status}`)
      console.log('   Body:', body)
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('❌ TIMEOUT: El webhook tardó más de 15 segundos en responder.')
      console.log('   Esto puede significar que n8n está procesando pero el nodo')
      console.log('   "Respond to Webhook" no está conectado correctamente.')
    } else {
      console.error('❌ Error de red:', err.message)
    }
  }

  // 5. Verificar si n8n insertó respuesta en chat_messages
  console.log('\n5️⃣  Esperando 3s y verificando si n8n insertó respuesta del assistant...')
  await new Promise(r => setTimeout(r, 3000))

  const { data: response, error: responseErr } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', testSessionId)
    .eq('sender', 'assistant')

  if (responseErr) {
    console.error('❌ Error verificando respuesta:', responseErr.message)
  } else if (response && response.length > 0) {
    console.log('✅ ¡n8n INSERTÓ RESPUESTA EN chat_messages via Supabase!')
    console.log(`   Respuesta: "${response[0].message?.substring(0,200)}"`)
  } else {
    console.log('⚠️  No se encontró respuesta del assistant en chat_messages para esta sesión.')
    console.log('   El flujo n8n no está insertando la respuesta en la BD.')
  }

  // Limpieza
  await supabase.from('chat_messages').delete().eq('session_id', testSessionId)
  console.log('\n🧹 Mensajes de prueba eliminados.')
  console.log('\n====================================')
  console.log('FIN DEL DIAGNÓSTICO')
  console.log('====================================\n')
}

diagnose()
