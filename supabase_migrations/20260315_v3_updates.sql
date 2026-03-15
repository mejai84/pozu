-- Migración: Pozu 2.0 v3.0 - Actualizaciones de Base de Datos para n8n v3.0 Dynamico
-- Fecha: 2026-03-15

-- 1. Añadir columnas de desglose financiero a la tabla orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
        ALTER TABLE public.orders ADD COLUMN subtotal NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tax_amount') THEN
        ALTER TABLE public.orders ADD COLUMN tax_amount NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_fee') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_fee NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 2. Crear tabla de error_logs para n8n
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_name TEXT,
    error_message TEXT,
    workflow_id TEXT,
    item_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS si es necesario (asumiendo que n8n usa service_role o key admin, pero por seguridad)
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Servicio puede insertar logs" ON public.error_logs;
CREATE POLICY "Servicio puede insertar logs" ON public.error_logs FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Admin puede ver logs" ON public.error_logs;
CREATE POLICY "Admin puede ver logs" ON public.error_logs FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' IN (SELECT email FROM profiles WHERE role = 'admin'));

-- 3. Actualizar función de Riesgo del Cliente para devolver el semáforo (VERDE, AMARILLO, ROJO)
-- Esta versión sobreescribe la anterior de hoy para que n8n pueda leer 'risk_level' directamente
CREATE OR REPLACE FUNCTION public.get_customer_risk_profile(p_phone TEXT)
RETURNS JSON AS $$
DECLARE
    v_completados INT;
    v_incidencias INT;
    v_risk_level TEXT;
BEGIN
    -- 1. Contar pedidos completados exitosamente
    SELECT COUNT(*)
    INTO v_completados
    FROM public.orders
    -- Filtrar por teléfono en guest_info o en una columna específica si existe
    -- El flujo n8n v3.0 usa guest_info -> phone
    WHERE (guest_info->>'phone' = p_phone)
      AND status IN ('delivered', 'completed');

    -- 2. Contar incidencias (cancelados, fallidos o lista negra)
    SELECT COUNT(*)
    INTO v_incidencias
    FROM public.orders
    WHERE (guest_info->>'phone' = p_phone)
      AND (
          status IN ('cancelled', 'rejected', 'failed')
          OR 
          (incidents IS NOT NULL AND jsonb_array_length(incidents) > 0)
      );

    -- 3. Calcular Nivel de Riesgo
    IF v_completados >= 0 AND v_incidencias = 0 THEN
        v_risk_level := 'VERDE';
    ELSIF v_incidencias = 1 THEN
        v_risk_level := 'AMARILLO';
    ELSE
        v_risk_level := 'ROJO';
    END IF;

    -- 4. Retornar los datos consolidados en JSON compatible con n8n
    RETURN json_build_object(
        'telefono', p_phone,
        'risk_level', v_risk_level,
        'pedidos_completados', v_completados,
        'total_incidencias', v_incidencias
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar permisos
GRANT EXECUTE ON FUNCTION public.get_customer_risk_profile(TEXT) TO anon, authenticated, service_role;
