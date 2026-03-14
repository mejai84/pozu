
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function test() {
    const { error } = await supabase.from('reservations').select('id').limit(1)
    if (error) {
        console.log('Reservations table error:', error.message)
    } else {
        console.log('Reservations table exists and is accessible.')
    }
}

test()
