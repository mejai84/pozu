import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const getInferredAllergens = (product) => {
    const ingredients = product.ingredients || [];
    const inferred = new Set();
    const allText = (product.name + " " + ingredients.join(" ") + " " + (product.description || "")).toLowerCase();

    // 14 Alérgenos
    if (allText.includes('pan') || allText.includes('brioche') || allText.includes('trigo') || allText.includes('cebada') || allText.includes('centeno') || allText.includes('avena') || allText.includes('malta')) inferred.add('Gluten');
    if (allText.includes('leche') || allText.includes('queso') || allText.includes('cheddar') || allText.includes('edam') || allText.includes('yogur') || allText.includes('brie') || allText.includes('nata') || allText.includes('mantequilla') || allText.includes('lácteo')) inferred.add('Lácteos');
    if (allText.includes('huevo') || allText.includes('mayonesa') || allText.includes('mayo')) inferred.add('Huevos');
    if (allText.includes('pescado') || allText.includes('atún') || allText.includes('salmón')) inferred.add('Pescado');
    if (allText.includes('cacahuete') || allText.includes('maní')) inferred.add('Cacahuetes');
    if (allText.includes('soja')) inferred.add('Soja');
    if (allText.includes('mostaza')) inferred.add('Mostaza');
    if (allText.includes('sésamo')) inferred.add('Sésamo');
    if (allText.includes('crustáceo') || allText.includes('langostino') || allText.includes('gamba') || allText.includes('kril')) inferred.add('Crustáceos');
    if (allText.includes('molusco') || allText.includes('calamar') || allText.includes('pulpo') || allText.includes('mejillón')) inferred.add('Moluscos');
    if (allText.includes('apio')) inferred.add('Apio');
    if (allText.includes('altramuz') || allText.includes('altramuces')) inferred.add('Altramuces');
    if (allText.includes('nuez') || allText.includes('almendra') || allText.includes('avellana') || allText.includes('pistacho') || allText.includes('anacardo') || allText.includes('frutos secos')) inferred.add('Frutos de cáscara');
    if (allText.includes('sulfito') || allText.includes('vino')) inferred.add('Sulfitos');

    return Array.from(inferred);
}

async function main() {
    console.log("Fetching products from Supabase...");
    const { data: products, error } = await supabase.from('products').select('*');
    
    if (error) {
        console.error("Error fetching products:", error);
        return;
    }

    console.log(`Found ${products.length} products. Analyzing ingredients...`);

    let count = 0;
    for (const product of products) {
        const allergensArray = getInferredAllergens(product);
        const allergensString = allergensArray.join(', ');
        
        if (allergensString !== product.allergens) {
            const { error: updateError } = await supabase
                .from('products')
                .update({ allergens: allergensString })
                .eq('id', product.id);
            
            if (updateError) {
                console.error(`Failed to update product ${product.name}:`, updateError.message);
            } else {
                console.log(`- Updated [${product.name}] with: ${allergensString || 'None'}`);
                count++;
            }
        }
    }

    console.log(`Successfully updated ${count} products.`);
}

main();
