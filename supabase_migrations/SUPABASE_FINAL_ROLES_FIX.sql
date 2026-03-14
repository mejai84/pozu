
-- ==========================================
-- REFUERZO DE POLÍTICAS RLS PARA TODOS LOS ROLES DE HAMBURGUESERÍA
-- ==========================================

-- 1. PRODUCTOS Y CATEGORÍAS: Todos los empleados autenticados pueden verlos
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Staff/Admin manage products" ON public.products 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'manager', 'staff')));

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Staff/Admin manage categories" ON public.categories 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'manager', 'staff')));

-- 2. PEDIDOS (ORDERS): Visibilidad según rol
DROP POLICY IF EXISTS "Staff/Admin view orders" ON public.orders;
CREATE POLICY "Team view orders" ON public.orders 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'manager', 'staff', 'kitchen', 'cashier', 'delivery', 'waiter')));

DROP POLICY IF EXISTS "Kitchen update order status" ON public.orders;
CREATE POLICY "Kitchen/Team update orders" ON public.orders 
FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'manager', 'staff', 'kitchen', 'cashier', 'delivery', 'waiter')))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'manager', 'staff', 'kitchen', 'cashier', 'delivery', 'waiter')));

-- 3. PERFILES: Permitir que los managers también vean el equipo
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admin/Manager view all profiles" ON public.profiles 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'manager')));

-- 4. RESERVAS: Todo el equipo de sala puede gestionarlas
DROP POLICY IF EXISTS "Admins can manage reservations" ON public.reservations;
CREATE POLICY "Staff manage reservations" ON public.reservations 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'manager', 'cashier', 'waiter', 'staff')));
