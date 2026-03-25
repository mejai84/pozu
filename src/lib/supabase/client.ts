import { createClient } from '@supabase/supabase-js'

// --- PARCHE DE BUILD PARA DOCKER/DOKPLOY ---
// Estas variables solo se usan si las reales no se inyectan en el build step.
// En ejecución (runtime), Dokploy inyectará las variables correctas.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-pozu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.extra_long_fake_key_for_build_purposes_only'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
