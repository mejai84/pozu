
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    console.log('Fetching settings...')
    const { data, error } = await supabase.from('settings').select('*')
    if (error) {
        console.error('Error fetching settings:', error.message)
    } else {
        console.log('Success! Settings found:', data.length)
        data.forEach(s => console.log(`- Key: ${s.key}`))
    }
}

test()
