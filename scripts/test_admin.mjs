
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Admin connection to:', supabaseUrl)
console.log('Service Role Key:', serviceRoleKey ? 'Present (starts with ' + serviceRoleKey.substring(0, 5) + ')' : 'Missing')

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function test() {
    console.log('Testing auth.admin.listUsers()...')
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) {
        console.error('Error listing users:', error.message)
    } else {
        console.log('Success! Users found:', data?.users?.length || 0)
    }
}

test()
