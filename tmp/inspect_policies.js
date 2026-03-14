
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Inspecting policies on reservations...");
    const { data, error } = await supabase.rpc('inspect_policies', { table_name: 'reservations' });
    
    // If the above RPC doesn't exist, try a generic query for common policy tables
    if (error) {
        console.log("Directly querying pg_policies...");
        const { data: policies, error: pgError } = await supabase
            .from('pg_policies')
            .select('*');
        
        if (pgError) {
            console.error("Could not fetch policies:", pgError.message);
        } else {
            console.log("All policies in DB:");
            policies.forEach(p => {
                if (['reservations', 'products', 'profiles', 'orders', 'order_items'].includes(p.tablename)) {
                    console.log(`Table: ${p.tablename}, Name: ${p.policyname}, Definition: ${p.definition}, Qual: ${p.qual}`);
                }
            });
        }
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

inspect();
