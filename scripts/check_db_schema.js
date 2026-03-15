const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log(`Checking products table at ${supabaseUrl}...`);
    const testColumns = ['id', 'name', 'deleted_at', 'stock_quantity', 'is_available', 'category_id', 'category'];
    for (const col of testColumns) {
        try {
            const { error: colError } = await supabase.from('products').select(col).limit(1);
            if (colError) {
                console.log(`Column '${col}': MISSING or ERROR (${colError.message})`);
            } else {
                console.log(`Column '${col}': EXISTS`);
            }
        } catch (e) {
            console.log(`Column '${col}': FAILED to query (${e.message})`);
        }
    }
}

checkSchema();
