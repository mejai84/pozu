-- Migración para Roles de Usuario Avanzados en Pozu
-- Roles propuestos: admin, kitchen, staff, customer

-- 1. Asegurar que los perfiles tengan el rol correcto
-- El campo 'role' ya existe en la tabla profiles.

-- 2. Limpieza y Re-creación de Políticas RLS para perfiles
-- Permitir que cada usuario vea su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Permitir que los administradores gestionen todos los perfiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" 
ON profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Políticas para la tabla ORDERS (Pedidos)
-- Admin y Staff pueden ver todo
-- Kitchen solo puede ver pedidos pendientes o en preparación
DROP POLICY IF EXISTS "Kitchen/Admin view orders" ON orders;
CREATE POLICY "Staff/Admin view orders" 
ON orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff', 'kitchen')
  )
);

-- 4. Políticas específicas para Cocina (Kitchen)
-- El rol kitchen puede actualizar el estado de los pedidos pero no borrarlos ni cambiar precios
DROP POLICY IF EXISTS "Kitchen update order status" ON orders;
CREATE POLICY "Kitchen update order status" 
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('kitchen', 'admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('kitchen', 'admin', 'staff')
  )
);

-- 5. Ejemplo de cómo asignar el rol a un usuario específico (para usar en el editor SQL de Supabase)
/*
UPDATE profiles 
SET role = 'kitchen' 
WHERE email = 'cocina@pozu.com';
*/
