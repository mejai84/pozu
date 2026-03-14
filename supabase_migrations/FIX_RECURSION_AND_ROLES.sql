
-- ================================================================
-- FIX: RECURSIÓN INFINITA Y CONFIGURACIÓN MAESTRA DE ROLES
-- ================================================================

-- 1. CREAR FUNCIONES DE SEGURIDAD (Security Definer para evitar recursión)
-- Estas funciones se ejecutan con privilegios de sistema, rompiendo el bucle de RLS

CREATE OR REPLACE FUNCTION public.check_user_role(required_roles text[])
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. LIMPIEZA TOTAL DE POLÍTICAS CONFLICTIVAS
DROP POLICY IF EXISTS "Team view orders" ON public.orders;
DROP POLICY IF EXISTS "Team update orders" ON public.orders;
DROP POLICY IF EXISTS "Staff/Admin manage products" ON public.products;
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Staff/Admin manage categories" ON public.categories;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 3. NUEVAS POLÍTICAs USANDO LA FUNCIÓN DE SEGURIDAD

-- PERFILES (profiles)
CREATE POLICY "Profiles self read" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL 
USING (public.check_user_role(ARRAY['admin']));

-- PRODUCTOS (products)
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Staff/Admin manage products" ON public.products FOR ALL 
USING (public.check_user_role(ARRAY['admin', 'manager', 'staff']));

-- CATEGORÍAS (categories)
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Staff/Admin manage categories" ON public.categories FOR ALL 
USING (public.check_user_role(ARRAY['admin', 'manager', 'staff']));

-- PEDIDOS (orders)
CREATE POLICY "Team access orders" ON public.orders FOR SELECT 
USING (public.check_user_role(ARRAY['admin', 'manager', 'staff', 'kitchen', 'cashier', 'delivery', 'waiter']));

CREATE POLICY "Team update orders" ON public.orders FOR UPDATE 
USING (public.check_user_role(ARRAY['admin', 'manager', 'staff', 'kitchen', 'cashier', 'delivery', 'waiter']))
WITH CHECK (true);

-- 4. OTORGAR PERMISOS A LAS FUNCIONES
GRANT EXECUTE ON FUNCTION public.check_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_role TO anon;
