
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vvlowhdimjjmsrpovurw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bG93aGRpbWpqbXNycG92dXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1MDE4NiwiZXhwIjoyMDg0MjI2MTg2fQ.Ocqu2MGvDiPKFFb7XW24ane9ms2y10NIeZbf5j2ndkk';

const supabase = createClient(supabaseUrl, supabaseKey);

const H_CAT = "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e";
const S_CAT = "9dac7b28-9e2c-428c-b7c5-6559485fc644";
const P_CAT = "bae3f11e-df43-44b7-82ed-7c2a77098c82";
const K_CAT = "433580a0-f34c-4e36-975c-a2b9f1bbb6b2";

const targetProducts = [
    // HAMBURGUESAS
    { name: "Pozu", category_id: H_CAT, price: 12.00, ingredients: ["Huevo", "Tomate", "Bacon", "Queso cheddar", "Carne 100% ternera asturiana", "Salsa especial Pozu", "Lechuga"] },
    { name: "Gourmet", category_id: H_CAT, price: 12.00, ingredients: ["Cebolla caramelizada ó Mermelada de tomate ó de Pimientos", "Queso de cabra", "Tomate", "Bacon", "Carne 100% ternera asturiana", "Lechuga"] },
    { name: "Selecta", category_id: H_CAT, price: 12.00, ingredients: ["Cebolla a la plancha", "Tomate", "Salsa barbacoa ahumada", "Bacon", "Queso cheddar", "Carne 100% ternera asturiana", "Lechuga"] },
    { name: "Oikos", category_id: H_CAT, price: 12.00, ingredients: ["Jalapeños", "Cebolla Roja", "Tomate", "Queso Edam", "Carne 100% ternera asturiana", "Salsa de Yogur", "Lechuga"] },
    { name: "Cielito Lindo", category_id: H_CAT, price: 12.00, ingredients: ["Cebolla Roja", "Jalapeños", "Aguacate", "Tomate", "Bacon", "Queso", "Carne 100% Ternera Asturiana", "Lechuga"] },
    { name: "Everest", category_id: H_CAT, price: 12.00, ingredients: ["Pimientos Asados", "Mermelada Bacon ó Mayo Bacon", "Bacon", "Queso Cheddar", "Cebolla Roja", "Carne 100% Ternera Asturiana", "Lechuga"] },
    { name: "Escorpión", category_id: H_CAT, price: 12.00, ingredients: ["Pimientos asados", "Salsa picante", "Jamón serrano", "Tomate", "Queso cheddar", "Carne 100% ternera asturiana", "Lechuga"] },
    { name: "Crispy Cheddar", category_id: H_CAT, price: 12.50, ingredients: ["Pan americano", "Carne 100% ternera asturiana", "Queso", "Bacon", "Queso Cheddar líquido", "Bacon Crujiente", "Opcional: Jalapeños"] },
    { name: "Kentucky", category_id: H_CAT, price: 13.00, ingredients: ["Pan americano", "Tomate", "Bacon", "Queso Cheddar", "Pollo Crujiente", "Salsa Especial Kentucky", "Lechuga"] },
    { name: "Hamburguesa Simple", category_id: H_CAT, price: 7.00, ingredients: ["Pan americano", "Carne", "2 ingredientes a elegir"] },

    // SANDWICHES
    { name: "Sandwich Pozu", category_id: S_CAT, price: 8.00, ingredients: ["Huevo", "Lechuga", "Tomate", "Salsa americana de mostaza suave", "Bacon", "Jamón York", "Queso"] },
    { name: "Sandwich de Jamón York y Queso", category_id: S_CAT, price: 3.50, ingredients: ["Jamón York", "Queso"] },

    // PATATAS
    { name: "Cuatro salsas", category_id: P_CAT, price: 8.50, ingredients: ["Miel y mostaza", "Ketchup", "Brava", "Alioli"] },
    { name: "Cesta de Patatas", category_id: P_CAT, price: 5.00, ingredients: ["1 salsa a escoger", "Miel y mostaza", "Ketchup", "Brava", "Alioli"] },
    { name: "Patatas Rancheras", category_id: P_CAT, price: 9.00, ingredients: ["Cazuela de patatas con bacon y quesos al horno"] },
    { name: "Patatas Pozu", category_id: P_CAT, price: 9.00, ingredients: ["Patatas al horno con salsa ranchera", "Quesos", "Bacon crujiente", "Jalapeños"] },

    // PARA PICAR
    { name: "Nachos", category_id: K_CAT, price: 9.50, ingredients: ["Chips de trigo con pico de gallo", "Bacon", "Quesos", "Jalapeños"] },
    { name: "Nachos Pozu", category_id: K_CAT, price: 12.00, ingredients: ["Carne", "Queso Crema"] },
    { name: "Crujientes de pollo", category_id: K_CAT, price: 7.50, ingredients: ["Piezas de pollo crujiente"] },
    { name: "Tequeños", category_id: K_CAT, price: 8.00, ingredients: ["6 unids", "Salsa"] },
    { name: "Jalapeños (7 unids)", category_id: K_CAT, price: 7.50, ingredients: ["7 unids"] },
    { name: "Pollo estilo Kentucky", category_id: K_CAT, price: 8.00, ingredients: ["Salsa"] },
];

async function syncMenu() {
    console.log("Iniciando sincronización de carta...");
    
    for (const item of targetProducts) {
        // Buscamos por nombre (insensible a mayúsculas si es posible, o exacto)
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('name', item.name)
            .single();

        const payload = {
            ...item,
            is_available: true,
            options: {
                sauce_note: "Todas las salsas son de elaboración propia",
                observation: item.category_id === H_CAT ? "Cualquier hamburguesa puede ser de pollo crujiente + 2€" : null
            }
        };

        if (existing) {
            console.log(`Actualizando: ${item.name}`);
            await supabase.from('products').update(payload).eq('id', existing.id);
        } else {
            console.log(`Insertando: ${item.name}`);
            await supabase.from('products').insert([payload]);
        }
    }
    
    console.log("Sincronización completada.");
}

syncMenu();
