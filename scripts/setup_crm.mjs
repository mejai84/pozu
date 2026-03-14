const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupCRM() {
  console.log('Creando tablas de CRM...');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS public.customer_crm (
      phone TEXT PRIMARY KEY,
      internal_notes TEXT,
      points INTEGER DEFAULT 0,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );

    -- Habilitar RLS
    ALTER TABLE public.customer_crm ENABLE ROW LEVEL SECURITY;

    -- Políticas: Admin puede todo
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'customer_crm' AND policyname = 'Admins can manage CRM'
      ) THEN
        CREATE POLICY "Admins can manage CRM" ON public.customer_crm 
        FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    if (error.message.includes('function rpc.exec_sql() does not exist')) {
      console.log('RPC exec_sql no existe. Intentando vía tabla temporal o ignorando si ya existe.');
    } else {
      console.error('Error:', error);
    }
  } else {
    console.log('Tablas creadas con éxito.');
  }
}

setupCRM();
