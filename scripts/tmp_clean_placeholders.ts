
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Note: Service key might be needed if RLS is strict, but let's try anon if it has permissions
const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanPlaceholders() {
    console.log('Cleaning placeholder image_urls in database...')
    
    // Select products with "placeholder" in image_url
    const { data: products, error: selectError } = await supabase
        .from('products')
        .select('id, name, image_url')
        .ilike('image_url', '%placeholder%')

    if (selectError) {
        console.error('Error selecting products:', selectError)
        return
    }

    if (!products || products.length === 0) {
        console.log('No products with placeholder images found.')
        return
    }

    console.log(`Found ${products.length} products to update.`)

    for (const prod of products) {
        console.log(`Updating ${prod.name}...`)
        const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: null })
            .eq('id', prod.id)
        
        if (updateError) {
            console.error(`Error updating product ${prod.id}:`, updateError)
        }
    }

    console.log('Done!')
}

cleanPlaceholders()
