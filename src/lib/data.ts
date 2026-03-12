
export type Category = {
    id: string;
    name: string;
    slug: string;
};

export type Product = {
    id: string;
    category_id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    ingredients?: string[];
    badge?: string;
    allergens?: string[];
};

export const categories: Category[] = [
    { id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e", name: "Hamburguesas", slug: "hamburguesas" },
    { id: "9dac7b28-9e2c-428c-b7c5-6559485fc644", name: "Sandwiches", slug: "sandwiches" },
    { id: "bae3f11e-df43-44b7-82ed-7c2a77098c82", name: "Patatas", slug: "patatas" },
    { id: "433580a0-f34c-4e36-975c-a2b9f1bbb6b2", name: "Para Picar", slug: "para-picar" },
    { id: "1f1f7fa7-c92f-4f7e-a0a3-81dd97f246d8", name: "Bebidas", slug: "bebidas" },
];

export const products: Product[] = [
    // Hamburguesas
    {
        id: "pozu",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Pozu",
        price: 12.00,
        ingredients: ['Pan americano', 'Huevo', 'Tomate', 'Bacon', 'Queso cheddar', 'Carne 100% ternera asturiana', 'Salsa especial Pozu', 'Lechuga'],
        image: "/images/burgers/pozu.png",
        badge: "Best Seller",
        allergens: ['gluten', 'huevos', 'lácteos', 'mostaza']
    },
    {
        id: "gourmet",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Gourmet",
        price: 12.00,
        ingredients: ['Cebolla caramelizada', 'Queso de cabra', 'Tomate', 'Bacon', 'Carne 100% ternera asturiana', 'Lechuga'],
        image: "/images/burgers/gourmet.png",
        badge: "Chef's Choice",
        allergens: ['lácteos', 'sulfitos']
    },
    {
        id: "selecta",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Selecta",
        price: 12.00,
        ingredients: ['Cebolla a la plancha', 'Tomate', 'Salsa barbacoa ahumada', 'Bacon', 'Queso cheddar', 'Carne 100% ternera asturiana', 'Lechuga'],
        image: "/images/burgers/selecta.png",
        allergens: ['mostaza', 'soja', 'lácteos']
    },
    {
        id: "oikos",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Oikos",
        price: 12.00,
        ingredients: ['Jalapeños', 'Cebolla Roja', 'Tomate', 'Queso Edam', 'Carne 100% ternera asturiana', 'Salsa de Yogur', 'Lechuga'],
        image: "/images/burgers/oikos.png",
        badge: "Vegetal Friendly"
    },
    {
        id: "cielito",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Cielito Lindo",
        price: 12.00,
        ingredients: ['Cebolla Roja', 'Jalapeños', 'Aguacate', 'Tomate', 'Bacon', 'Queso', 'Carne 100% Ternera Asturiana', 'Lechuga'],
        image: "/images/burgers/cielito.png"
    },
    {
        id: "everest",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Everest",
        price: 12.00,
        ingredients: ['Pan americano', 'Pimientos Asados', 'Mermelada Bacon & Mayo Bacon', 'Bacon', 'Queso Cheddar', 'Cebolla Roja', 'Carne 100% Ternera Asturiana', 'Lechuga'],
    },
    // Sandwiches
    {
        id: "sand_pozu",
        category_id: "9dac7b28-9e2c-428c-b7c5-6559485fc644",
        name: "Sandwich Pozu",
        price: 8.00,
        ingredients: ['Huevo', 'Lechuga', 'Tomate', 'Salsa americana de mostaza suave', 'Bacon', 'Jamón York', 'Queso'],
    },
    {
        id: "sand_york",
        category_id: "9dac7b28-9e2c-428c-b7c5-6559485fc644",
        name: "Sandwich York y Queso",
        price: 3.50,
        ingredients: ['Jamón York', 'Queso'],
    },
    // Patatas
    {
        id: "pat_pozu",
        category_id: "bae3f11e-df43-44b7-82ed-7c2a77098c82",
        name: "Patatas Pozu",
        price: 9.00,
        description: "Patatas al horno con salsa ranchera, quesos, bacon crujiente y jalapeños",
    },
    {
        id: "pat_4salsas",
        category_id: "bae3f11e-df43-44b7-82ed-7c2a77098c82",
        name: "Cuatro Salsas",
        price: 8.50,
        description: "Miel y mostaza, Ketchup, Brava, Alioli",
    },
    // Para Picar
    {
        id: "pic_nachos_pozu",
        category_id: "433580a0-f34c-4e36-975c-a2b9f1bbb6b2",
        name: "Nachos Pozu",
        price: 12.00,
        description: "Con Carne y Queso Crema",
    },
    {
        id: "pic_tequenos",
        category_id: "433580a0-f34c-4e36-975c-a2b9f1bbb6b2",
        name: "Tequeños",
        price: 8.00,
        description: "6 unidades + Salsa",
    },
];
