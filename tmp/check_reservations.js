
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking reservations...");
    const { data, error, count } = await supabase
        .from('reservations')
        .select('*', { count: 'exact' });
    
    if (error) {
        console.error("Error fetching reservations:", error.message);
    } else {
        console.log("Reservations found:", data?.length);
        console.log("Total count:", count);
    }
}

check();
