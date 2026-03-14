
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking products...");
    const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' });
    
    if (error) {
        console.error("Error fetching products:", error);
    } else {
        console.log("Products found:", data?.length);
        console.log("Total count:", count);
        if (data && data.length > 0) {
            console.log("Example product:", JSON.stringify(data[0], null, 2));
        }
    }

    console.log("\nChecking categories...");
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');
    
    if (catError) {
        console.error("Error fetching categories:", catError);
    } else {
        console.log("Categories found:", categories?.length);
        if (categories && categories.length > 0) {
            console.log("Example category:", JSON.stringify(categories[0], null, 2));
        }
    }
}

check();
