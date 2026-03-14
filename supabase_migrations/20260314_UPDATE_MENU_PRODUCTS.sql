
-- ================================================================
-- 🍔 ACTUALIZACIÓN COMPLETA DE LA CARTA - POZU 2.0 (SIN ON CONFLICT)
-- ================================================================

-- 1. PRODUCTOS "PARA PICAR"
INSERT INTO public.products (category_id, name, description, price, ingredients, is_available)
SELECT '433580a0-f34c-4e36-975c-a2b9f1bbb6b2', 'Nachos', 'Chips de trigo con pico de gallo, bacon, quesos y jalapeños', 9.50, ARRAY['Chips de trigo', 'Pico de gallo', 'Bacon', 'Quesos', 'Jalapeños'], true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Nachos');

INSERT INTO public.products (category_id, name, description, price, ingredients, is_available)
SELECT '433580a0-f34c-4e36-975c-a2b9f1bbb6b2', 'Crujientes de pollo', 'Piezas de pollo crujiente empanadas', 7.50, ARRAY['Pollo empanado'], true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Crujientes de pollo');

INSERT INTO public.products (category_id, name, description, price, ingredients, is_available)
SELECT '433580a0-f34c-4e36-975c-a2b9f1bbb6b2', 'Jalapeños (7 unids)', 'Jalapeños rellenos (7 unidades)', 7.50, ARRAY['7 unidades de Jalapeños'], true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Jalapeños (7 unids)');

INSERT INTO public.products (category_id, name, description, price, ingredients, is_available)
SELECT '433580a0-f34c-4e36-975c-a2b9f1bbb6b2', 'Pollo estilo Kentucky', 'Pollo estilo Kentucky con salsa incluida', 8.00, ARRAY['Pollo estilo Kentucky', 'Salsa'], true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Pollo estilo Kentucky');

-- 2. NUEVAS HAMBURGUESAS Y PERSONALIZACIÓN
INSERT INTO public.products (category_id, name, description, price, ingredients, is_available)
SELECT '0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e', 'Hamburguesa Simple', 'Carne más dos ingredientes a elegir. Pan americano.', 7.00, ARRAY['Pan americano', 'Carne', '2 ingredientes a elegir'], true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Hamburguesa Simple');

INSERT INTO public.products (category_id, name, description, price, ingredients, is_available)
SELECT '0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e', 'Crispy Cheddar', 'Pan americano, Carne 100% ternera asturiana, Queso, Bacon, Queso Cheddar líquido, Bacon Crujiente. Opcional: Jalapeños.', 12.50, ARRAY['Pan americano', 'Carne 100% ternera asturiana', 'Queso', 'Bacon', 'Queso Cheddar líquido', 'Bacon Crujiente'], true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Crispy Cheddar');

INSERT INTO public.products (category_id, name, description, price, ingredients, is_available)
SELECT '0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e', 'Kentucky', 'Pan americano, Tomate, Bacon, Queso Cheddar, Pollo Crujiente, Salsa Especial Kentucky, Lechuga.', 13.00, ARRAY['Pan americano', 'Tomate', 'Bacon', 'Queso Cheddar', 'Pollo Crujiente', 'Salsa Especial Kentucky', 'Lechuga'], true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Kentucky');

-- ACTUALIZAR NOTAS DE "POLLO CRUJIENTE" Y "SALSAS PROPIAS" EN TODAS LAS HAMBURGUESAS
UPDATE public.products 
SET options = COALESCE(options, '{}'::jsonb) || '{"observation": "Cualquier hamburguesa puede ser de pollo crujiente + 2€", "sauce_note": "Todas las salsas son de elaboración propia"}'::jsonb
WHERE category_id = '0bc02f87-623d-4b2a-9ee2-1f7a6e5fde1e';

-- 3. SANDWICHES FALTANTES
INSERT INTO public.products (category_id, name, description, price, ingredients, is_available)
SELECT '9dac7b28-9e2c-428c-b7c5-6559485fc644', 'Sandwich de Jamón York y Queso', 'Sandwich clásico de jamón y queso', 3.50, ARRAY['Pan de molde', 'Jamón York', 'Queso'], true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Sandwich de Jamón York y Queso');

-- 4. PATATAS Y EXTRAS
INSERT INTO public.products (category_id, name, description, price, ingredients, is_available, options)
SELECT 'bae3f11e-df43-44b7-82ed-7c2a77098c82', 'Cesta de Patatas', 'Cesta de patatas con una salsa a escoger (Miel y mostaza, Ketchup, Brava, Alioli)', 5.00, ARRAY['Patatas fritas', '1 salsa a elegir'], true, '{"extra_sauce_price": 0.50}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cesta de Patatas');

INSERT INTO public.products (category_id, name, description, price, ingredients, is_available, options)
SELECT 'bae3f11e-df43-44b7-82ed-7c2a77098c82', 'Patatas Rancheras', 'Cazuela de patatas con bacon y quesos al horno', 9.00, ARRAY['Patatas', 'Bacon', 'Quesos al horno'], true, '{"extra_sauce_price": 0.50}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Patatas Rancheras');

-- ACTUALIZAR NOTA DE SALSAS EN "PARA PICAR"
UPDATE public.products 
SET options = COALESCE(options, '{}'::jsonb) || '{"sauce_note": "Todas las salsas son de elaboración propia"}'::jsonb
WHERE category_id = '433580a0-f34c-4e36-975c-a2b9f1bbb6b2';
