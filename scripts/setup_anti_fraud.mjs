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

async function setupTrustSystem() {
  console.log('🛡️ Configurando el Sistema de Confianza y Anti-Fraude...');
  
  const sql = `
    -- 1. Ampliar perfiles para incluir métricas de confianza
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS orders_completed INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS orders_cancelled INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_phone TEXT;

    -- 2. Crear una vista para reputación por teléfono (incluye Guests)
    -- Esto nos permite chequear a alguien aunque no esté registrado, solo por su móvil.
    CREATE OR REPLACE VIEW public.customer_reputation AS
    SELECT 
      COALESCE(p.last_phone, (o.guest_info->>'phone')) as phone,
      COUNT(o.id) filter (where o.status = 'delivered') as completed_count,
      COUNT(o.id) filter (where o.status = 'cancelled') as cancelled_count,
      CASE 
        WHEN COUNT(o.id) filter (where o.status = 'cancelled') > 1 THEN 'ROJO'
        WHEN COUNT(o.id) filter (where o.status = 'delivered') > 2 THEN 'VERDE'
        ELSE 'AMARILLO'
      END as risk_level
    FROM public.orders o
    LEFT JOIN public.profiles p ON o.user_id = p.id
    GROUP BY 1;

    -- 3. Función para que n8n consulte el riesgo de un pedido al instante
    CREATE OR REPLACE FUNCTION public.check_order_risk(p_phone TEXT)
    RETURNS TABLE (
      risk_level TEXT,
      completed_orders INT,
      cancelled_orders INT,
      suggestion TEXT
    ) LANGUAGE plpgsql AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        r.risk_level,
        r.completed_count::INT,
        r.cancelled_count::INT,
        CASE 
          WHEN r.risk_level = 'ROJO' THEN 'BLOQUEAR EFECTIVO - SOLO TARJETA'
          WHEN r.risk_level = 'VERDE' THEN 'CONFIANZA TOTAL - PASAR A COCINA'
          ELSE 'REQUERIR CONFIRMACIÓN SMS/WHATSAPP'
        END
      FROM public.customer_reputation r
      WHERE r.phone = p_phone
      UNION ALL
      -- Si el teléfono es totalmente nuevo
      SELECT 
        'AMARILLO' as risk_level,
        0 as completed_orders,
        0 as cancelled_orders,
        'NUEVO CLIENTE - VERIFICAR'
      WHERE NOT EXISTS (SELECT 1 FROM public.customer_reputation WHERE phone = p_phone)
      LIMIT 1;
    END;
    $$;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.warn('⚠️ Error al ejecutar SQL automáticamente.');
    console.log('Ejecuta esto en el SQL Editor de Supabase:\n');
    console.log(sql);
  } else {
    console.log('✅ Infraestructura de Confianza creada con éxito.');
  }
}

setupTrustSystem();
