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

async function improveOrdersTable() {
  console.log('🚀 Mejorando la tabla orders para guardar info de Stripe...');
  
  const sql = `
    -- Añadir columnas para auditoría de pagos
    ALTER TABLE public.orders 
    ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT,
    ADD COLUMN IF NOT EXISTS card_brand TEXT,
    ADD COLUMN IF NOT EXISTS card_last4 TEXT,
    ADD COLUMN IF NOT EXISTS stripe_receipt_url TEXT,
    ADD COLUMN IF NOT EXISTS payment_metadata JSONB DEFAULT '{}'::jsonb;

    -- Actualizar comentarios de las columnas
    COMMENT ON COLUMN public.orders.stripe_payment_id IS 'ID del PaymentIntent de Stripe';
    COMMENT ON COLUMN public.orders.stripe_charge_id IS 'ID del Cargo (Charge) real de Stripe';
    COMMENT ON COLUMN public.orders.card_brand IS 'Marca de la tarjeta (Visa, Mastercard, etc)';
    COMMENT ON COLUMN public.orders.card_last4 IS 'Últimos 4 dígitos de la tarjeta';
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.warn('⚠️ No se pudo ejecutar automáticamente.');
    console.log('Por favor, ejecuta esto en el SQL Editor de Supabase:\n');
    console.log(sql);
  } else {
    console.log('✅ Tabla orders mejorada con éxito.');
  }
}

improveOrdersTable();
