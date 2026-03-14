
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing connection to:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey ? 'Present (starts with ' + supabaseAnonKey.substring(0, 5) + ')' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing in env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    console.log('Fetching products...')
    const { data, error } = await supabase.from('products').select('*').limit(1)
    if (error) {
        console.error('Error fetching products:', error.message, error.details || '')
    } else {
        console.log('Success! Products found:', data)
    }
}

test()
