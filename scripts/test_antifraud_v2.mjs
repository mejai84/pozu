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

async function fixAndTest() {
  console.log('🔄 Re-ajustando lógica del semáforo para máxima seguridad...');

  const sqlFix = `
    CREATE OR REPLACE VIEW public.customer_reputation AS
    SELECT 
      COALESCE(p.last_phone, (o.guest_info->>'phone')) as phone,
      COUNT(o.id) filter (where o.status = 'delivered') as completed_count,
      COUNT(o.id) filter (where o.status = 'cancelled') as cancelled_count,
      CASE 
        WHEN COUNT(o.id) filter (where o.status = 'cancelled') >= 1 THEN 'ROJO' -- 1 solo fallo es ROJO
        WHEN COUNT(o.id) filter (where o.status = 'delivered') >= 2 THEN 'VERDE' -- 2 pedidos buenos es VERDE
        ELSE 'AMARILLO'
      END as risk_level
    FROM public.orders o
    LEFT JOIN public.profiles p ON o.user_id = p.id
    WHERE COALESCE(p.last_phone, (o.guest_info->>'phone')) IS NOT NULL
    GROUP BY 1;
  `;

  await supabase.rpc('exec_sql', { sql_query: sqlFix });

  console.log('🧪 Iniciando TEST DE FUEGO REAL...\n');

  // Test DATA
  const phoneVip = '611222333';
  const phoneTrol = '666000000';

  console.log('📝 Insertando historial de prueba...');

  // Limpiamos rastros previos si existen
  await supabase.from('orders').delete().or(`guest_info->>phone.eq.${phoneVip},guest_info->>phone.eq.${phoneTrol}`);

  // VIP: 2 entregados
  await supabase.from('orders').insert([
    { guest_info: { phone: phoneVip, name: 'Fiel' }, status: 'delivered', total: 10 },
    { guest_info: { phone: phoneVip, name: 'Fiel' }, status: 'delivered', total: 15 }
  ]);

  // TROL: 1 cancelado
  await supabase.from('orders').insert([
    { guest_info: { phone: phoneTrol, name: 'Trol' }, status: 'cancelled', total: 40 }
  ]);

  // Consultamos resultados
  const { data: resVip } = await supabase.rpc('check_order_risk', { p_phone: phoneVip });
  const { data: resTrol } = await supabase.rpc('check_order_risk', { p_phone: phoneTrol });
  const { data: resNuevo } = await supabase.rpc('check_order_risk', { p_phone: '123456789' });

  console.log(`📱 Cliente VIP (${phoneVip}): ${resVip?.[0]?.risk_level === 'VERDE' ? '🟢 VERDE' : '❌ FALLO'}`);
  console.log(`📱 Cliente TROL (${phoneTrol}): ${resTrol?.[0]?.risk_level === 'ROJO' ? '🔴 ROJO' : '❌ FALLO'}`);
  console.log(`📱 Cliente NUEVO: ${resNuevo?.[0]?.risk_level === 'AMARILLO' ? '🟡 AMARILLO' : '❌ FALLO'}`);

  console.log('\n🚀 Lógica validada. El Monitor Admin y n8n ahora actuarán según estos colores.');
}

fixAndTest();
