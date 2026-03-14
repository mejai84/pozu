
-- ================================================================
-- ☢️ SANEAMIENTO NUCLEAR DE RLS - POZU 2.0
-- ================================================================
-- Este script soluciona definitivamente el error "{}" (Recursión Infinita)
-- en Clientes, Reportes, Pedidos y Reservas.

-- 1. LIMPIEZA TOTAL ATÓMICA
DROP FUNCTION IF EXISTS public.get_mi_rol() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_pozu_role() CASCADE;

-- 2. FUNCIÓN LLAVE MAESTRA (plpgsql + SECURITY DEFINER para romper el bucle)
CREATE OR REPLACE FUNCTION public.get_pozu_role()
RETURNS text AS $$
DECLARE
  r text;
BEGIN
  -- Esta consulta ignora el RLS y devuelve el rol directamente
  SELECT role INTO r FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(r, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RESET DE SEGURIDAD (Pozu Only)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 4. ELIMINACIÓN DE POLÍTICAS RESIDUALES
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'orders', 'order_items', 'reservations', 'settings', 'products'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 5. RE-ACTIVACIÓN Y POLÍTICAS LIMPIAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- PERFILES: Admin ve todo, Usuario ve su perfil
CREATE POLICY "pozu_profiles_admin" ON public.profiles FOR ALL USING (public.get_pozu_role() = 'admin');
CREATE POLICY "pozu_profiles_self" ON public.profiles FOR SELECT USING (id = auth.uid());

-- PEDIDOS: Todo el equipo ve y edita
CREATE POLICY "pozu_orders_team" ON public.orders FOR ALL 
USING (public.get_pozu_role() IN ('admin', 'manager', 'staff', 'kitchen', 'cashier', 'delivery', 'waiter'));

-- ITEMS DE PEDIDOS: Todo el equipo ve (Vital para Reportes)
CREATE POLICY "pozu_items_team" ON public.order_items FOR SELECT 
USING (public.get_pozu_role() IN ('admin', 'manager', 'staff', 'kitchen', 'cashier', 'delivery', 'waiter'));

-- RESERVAS: Gestión para equipo de sala
CREATE POLICY "pozu_res_team" ON public.reservations FOR ALL 
USING (public.get_pozu_role() IN ('admin', 'manager', 'cashier', 'waiter', 'staff'));

-- CONFIGURACIÓN (settings): Admin gestiona, público lee
CREATE POLICY "pozu_settings_admin" ON public.settings FOR ALL USING (public.get_pozu_role() IN ('admin', 'manager'));
CREATE POLICY "pozu_settings_read" ON public.settings FOR SELECT USING (true);

-- PRODUCTOS: Lectura pública
CREATE POLICY "pozu_products_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "pozu_products_admin" ON public.products FOR ALL USING (public.get_pozu_role() IN ('admin', 'manager'));

-- 6. PERMISOS
GRANT EXECUTE ON FUNCTION public.get_pozu_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pozu_role TO anon;
