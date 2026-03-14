
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    console.log("Checking policies for products table...");
    const { data, error } = await supabase.rpc('get_policies', { table_name: 'products' });
    
    // If RPC doesn't exist, we can try querying pg_catalog
    if (error) {
        console.log("RPC get_policies failed, using direct query...");
        const { data: policies, error: pgError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'products');
        
        if (pgError) {
            // Last resort: query raw SQL
            const { data: rawData, error: rawError } = await supabase.rpc('inspect_table_policies', { p_table_name: 'products' });
            if (rawError) {
                console.error("Could not fetch policies via RPC or direct query. Trying raw SQL via orders (hack)...");
                // Sometimes we can't query pg_catalog directly depending on permissions.
            } else {
                console.log(JSON.stringify(rawData, null, 2));
            }
        } else {
            console.log(JSON.stringify(policies, null, 2));
        }
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

// Actually, let's just try to run a SELECT with the ANON key to see if it fails.
async function testAnonAccess() {
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log("Testing SELECT with ANON key...");
    const { data, error } = await anonClient.from('products').select('id').limit(1);
    if (error) {
        console.error("ANON SELECT failed:", error.message);
    } else {
        console.log("ANON SELECT success, found:", data.length);
    }
}

async function run() {
    await testAnonAccess();
}

run();
