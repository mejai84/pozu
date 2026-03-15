
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vvlowhdimjjmsrpovurw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bG93aGRpbWpqbXNycG92dXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1MDE4NiwiZXhwIjoyMDg0MjI2MTg2fQ.Ocqu2MGvDiPKFFb7XW24ane9ms2y10NIeZbf5j2ndkk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpData() {
    const { data: categories } = await supabase.from('categories').select('*');
    const { data: products } = await supabase.from('products').select('*');
    
    console.log('--- CATEGORIES ---');
    console.log(JSON.stringify(categories, null, 2));
    console.log('--- PRODUCTS ---');
    console.log(JSON.stringify(products, null, 2));
}

dumpData();
