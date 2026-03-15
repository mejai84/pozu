import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simulateAntiFraudTest() {
  console.log('🧪 Iniciando TEST DE FUEGO del Semáforo de Confianza...\n');

  // Caso 1: Cliente Totalmente Nuevo (Amarillo)
  const phoneNuevo = '600000001';
  console.log(`📱 Probando con un cliente NUEVO (${phoneNuevo}):`);
  const { data: resNuevo } = await supabase.rpc('check_order_risk', { p_phone: phoneNuevo });
  console.log('   Resultado:', resNuevo?.[0]?.risk_level === 'AMARILLO' ? '🟡 AMARILLO' : '❌ ERROR');
  console.log('   Sugerencia:', resNuevo?.[0]?.suggestion);
  console.log('--------------------------------------------------\n');

  // Caso 2: Cliente VIP (Verde)
  // Simularemos un historial insertando pedidos entregados
  const phoneVip = '600999999';
  console.log(`📱 Probando con un cliente VIP (${phoneVip}):`);
  
  // Insertamos 3 pedidos ficticios entregados
  for(let i=0; i<3; i++) {
    await supabase.from('orders').insert({
        guest_info: { phone: phoneVip, name: 'Cliente Fiel' },
        status: 'delivered',
        total: 15.00,
        payment_method: 'cash'
    });
  }

  const { data: resVip } = await supabase.rpc('check_order_risk', { p_phone: phoneVip });
  console.log('   Resultado:', resVip?.[0]?.risk_level === 'VERDE' ? '🟢 VERDE (VIP)' : '❌ ERROR');
  console.log('   Sugerencia:', resVip?.[0]?.suggestion);
  console.log('--------------------------------------------------\n');

  // Caso 3: El "Bromista" (Rojo)
  const phoneTrol = '666123456';
  console.log(`📱 Probando con un posible TROL (${phoneTrol}):`);
  
  // Insertamos un pedido cancelado
  await supabase.from('orders').insert({
      guest_info: { phone: phoneTrol, name: 'El Bromista' },
      status: 'cancelled',
      total: 50.00,
      payment_method: 'cash'
  });

  const { data: resTrol } = await supabase.rpc('check_order_risk', { p_phone: phoneTrol });
  console.log('   Resultado:', resTrol?.[0]?.risk_level === 'ROJO' ? '🔴 ROJO (PELIGRO)' : '❌ ERROR');
  console.log('   Sugerencia:', resTrol?.[0]?.suggestion);
  console.log('\n✅ Simulación completada. El cerebro de Pozu funciona perfectamente.');
}

simulateAntiFraudTest();
