
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function fix() {
    console.log('Ensuring feature_flags exists in settings table...')
    
    // 1. Check if it exists
    const { data, error: fetchError } = await supabase
        .from('settings')
        .select('key')
        .eq('key', 'feature_flags')
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'no rows'
        console.error('Error checking feature_flags:', fetchError.message)
        return
    }

    if (data) {
        console.log('feature_flags already exists.')
    } else {
        console.log('Inserting feature_flags...')
        const { error: insertError } = await supabase
            .from('settings')
            .insert({ 
                key: 'feature_flags', 
                value: { enable_combos: true } 
            })
        
        if (insertError) {
            console.error('Error inserting feature_flags:', insertError.message)
        } else {
            console.log('Success! feature_flags inserted.')
        }
    }

    // 2. Ensure other settings exist
    const requiredKeys = [
        { key: 'business_info', value: { business_name: 'Pozu 2.0', phone: '', email: '', address: '', is_open: true } },
        { key: 'business_hours', value: { 
            monday: { open: '12:00', close: '23:00', closed: false },
            tuesday: { open: '12:00', close: '23:00', closed: false },
            wednesday: { open: '12:00', close: '23:00', closed: false },
            thursday: { open: '12:00', close: '23:00', closed: false },
            friday: { open: '12:00', close: '23:00', closed: false },
            saturday: { open: '12:00', close: '23:00', closed: false },
            sunday: { open: '12:00', close: '23:00', closed: true }
        } },
        { key: 'delivery_settings', value: { delivery_fee: 2.5, min_order_amount: 10 } }
    ]

    for (const item of requiredKeys) {
        const { data: exists } = await supabase.from('settings').select('key').eq('key', item.key).single()
        if (!exists) {
            console.log(`Inserting ${item.key}...`)
            await supabase.from('settings').insert(item)
        }
    }
}

fix()
