
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugData() {
    console.log('--- CATEGORIES ---')
    const { data: categories } = await supabase.from('categories').select('id, name')
    console.table(categories)

    console.log('\n--- PRODUCTS (first 10) ---')
    const { data: products } = await supabase.from('products').select('id, name, category_id, image_url').limit(10)
    console.table(products)

    if (categories && products) {
        const catIds = new Set(categories.map(c => c.id))
        const invalidProducts = products.filter(p => p.category_id && !catIds.has(p.category_id))
        if (invalidProducts.length > 0) {
            console.log('\n--- INVALID PRODUCTS (Category ID not in Categories table) ---')
            console.table(invalidProducts)
        } else {
            console.log('\nAll checked products have valid category IDs.')
        }
    }
}

debugData()
