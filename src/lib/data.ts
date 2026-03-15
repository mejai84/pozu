
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
    options?: any;
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
        ingredients: ["Pan americano", "Huevo", "Tomate", "Bacon", "Queso cheddar", "Carne 100% ternera asturiana", "Salsa especial Pozu", "Lechuga"],
        image: "/images/burgers/pozu.png",
        badge: "Best Seller"
    },
    {
        id: "gourmet",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Gourmet",
        price: 12.00,
        ingredients: ["Cebolla caramelizada ó Mermelada de tomate ó de Pimientos", "Queso de cabra", "Tomate", "Bacon", "Carne 100% ternera asturiana", "Lechuga"],
        image: "/images/burgers/gourmet.png"
    },
    {
        id: "selecta",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Selecta",
        price: 12.00,
        ingredients: ["Cebolla a la plancha", "Tomate", "Salsa barbacoa ahumada", "Bacon", "Queso cheddar", "Carne 100% ternera asturiana", "Lechuga"],
        image: "/images/burgers/selecta.png"
    },
    {
        id: "oikos",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Oikos",
        price: 12.00,
        ingredients: ["Jalapeños", "Cebolla Roja", "Tomate", "Queso Edam", "Carne 100% ternera asturiana", "Salsa de Yogur", "Lechuga"],
        image: "/images/burgers/oikos.png"
    },
    {
        id: "cielito",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Cielito Lindo",
        price: 12.00,
        ingredients: ["Cebolla Roja", "Jalapeños", "Aguacate", "Tomate", "Bacon", "Queso", "Carne 100% Ternera Asturiana", "Lechuga"],
        image: "/images/burgers/cielito.png"
    },
    {
        id: "everest",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Everest",
        price: 12.00,
        ingredients: ["Pan americano", "Pimientos Asados", "Mermelada Bacon ó Mayo Bacon", "Bacon", "Queso Cheddar", "Cebolla Roja", "Carne 100% Ternera Asturiana", "Lechuga"]
    },
    {
        id: "escorpion",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Escorpión",
        price: 12.00,
        ingredients: ["Pimientos asados", "Salsa picante", "Jamón serrano", "Tomate", "Queso cheddar", "Carne 100% ternera asturiana", "Lechuga"]
    },
    {
        id: "crispy_cheddar",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Crispy Cheddar",
        price: 12.50,
        ingredients: ["Pan americano", "Carne 100% ternera asturiana", "Queso", "Bacon", "Queso Cheddar líquido", "Bacon Crujiente", "Opcional: Jalapeños"]
    },
    {
        id: "kentucky_burger",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Kentucky",
        price: 13.00,
        ingredients: ["Pan americano", "Tomate", "Bacon", "Queso Cheddar", "Pollo Crujiente", "Salsa Especial Kentucky", "Lechuga"]
    },
    {
        id: "hamburguesa_simple",
        category_id: "0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e",
        name: "Hamburguesa Simple",
        price: 7.00,
        ingredients: ["Pan americano", "Carne", "2 ingredientes a elegir"]
    },

    // Sandwiches
    {
        id: "sand_pozu",
        category_id: "9dac7b28-9e2c-428c-b7c5-6559485fc644",
        name: "Sandwich Pozu",
        price: 8.00,
        ingredients: ["Huevo", "Lechuga", "Tomate", "Salsa americana de mostaza suave", "Bacon", "Jamón York", "Queso"]
    },
    {
        id: "sand_york",
        category_id: "9dac7b28-9e2c-428c-b7c5-6559485fc644",
        name: "Sandwich de Jamón York y Queso",
        price: 3.50,
        ingredients: ["Jamón York", "Queso"]
    },

    // Patatas
    {
        id: "pat_4_salsas",
        category_id: "bae3f11e-df43-44b7-82ed-7c2a77098c82",
        name: "Cuatro salsas",
        price: 8.50,
        ingredients: ["Miel y mostaza", "Ketchup", "Brava", "Alioli"]
    },
    {
        id: "pat_cesta",
        category_id: "bae3f11e-df43-44b7-82ed-7c2a77098c82",
        name: "Cesta de Patatas",
        price: 5.00,
        ingredients: ["1 salsa a escoger", "Miel y mostaza", "Ketchup", "Brava", "Alioli"]
    },
    {
        id: "pat_rancheras",
        category_id: "bae3f11e-df43-44b7-82ed-7c2a77098c82",
        name: "Patatas Rancheras",
        price: 9.00,
        ingredients: ["Cazuela de patatas con bacon y quesos al horno"]
    },
    {
        id: "pat_pozu",
        category_id: "bae3f11e-df43-44b7-82ed-7c2a77098c82",
        name: "Patatas Pozu",
        price: 9.00,
        ingredients: ["Patatas al horno con salsa ranchera", "Quesos", "Bacon crujiente", "Jalapeños"]
    },

    // Para Picar
    {
        id: "pic_nachos",
        category_id: "433580a0-f34c-4e36-975c-a2b9f1bbb6b2",
        name: "Nachos",
        price: 9.50,
        ingredients: ["Chips de trigo con pico de gallo", "Bacon", "Quesos", "Jalapeños"]
    },
    {
        id: "pic_nachos_pozu",
        category_id: "433580a0-f34c-4e36-975c-a2b9f1bbb6b2",
        name: "Nachos Pozu",
        price: 12.00,
        ingredients: ["Carne", "Queso Crema"]
    },
    {
        id: "pic_crujientes_pollo",
        category_id: "433580a0-f34c-4e36-975c-a2b9f1bbb6b2",
        name: "Crujientes de pollo",
        price: 7.50,
        ingredients: ["Piezas de pollo crujiente"]
    },
    {
        id: "pic_tequenos",
        category_id: "433580a0-f34c-4e36-975c-a2b9f1bbb6b2",
        name: "Tequeños",
        price: 8.00,
        ingredients: ["6 unids", "Salsa"]
    },
    {
        id: "pic_jalapenos",
        category_id: "433580a0-f34c-4e36-975c-a2b9f1bbb6b2",
        name: "Jalapeños (7 unids)",
        price: 7.50,
        ingredients: ["7 unids"]
    },
    {
        id: "pic_kentucky",
        category_id: "433580a0-f34c-4e36-975c-a2b9f1bbb6b2",
        name: "Pollo estilo Kentucky",
        price: 8.00,
        ingredients: ["Salsa"]
    },
];
