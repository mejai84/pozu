
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = 'jajl840316@gmail.com';
    console.log(`Checking profile for ${email}...`);
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
    
    if (error) {
        console.error("Profile not found or error:", error.message);
        // Try listing all profiles to see what's there
        const { data: all } = await supabase.from('profiles').select('email, role').limit(5);
        console.log("Existing profiles sample:", all);
    } else {
        console.log("Current Profile:", JSON.stringify(profile, null, 2));
    }
}

checkUser();
