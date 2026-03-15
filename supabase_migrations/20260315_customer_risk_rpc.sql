-- Migración: Función de Evaluación de Riesgo del Cliente (Para uso desde n8n)
-- Fecha: 2026-03-15

-- Esta función (RPC) cuenta el historial de éxito y fracaso de un cliente basado
-- en su número de teléfono, para que el bot de IA sepa si exigirle
-- pago por tarjeta (Semáforo Amarillo/Rojo) o aceptar efectivo (Verde).

CREATE OR REPLACE FUNCTION public.get_customer_risk_profile(p_phone TEXT)
RETURNS JSON AS $$
DECLARE
    v_completados INT;
    v_incidencias INT;
BEGIN
    -- 1. Contar pedidos completados exitosamente
    SELECT COUNT(*)
    INTO v_completados
    FROM public.orders
    WHERE customer_phone = p_phone
      AND status IN ('delivered', 'completed');

    -- 2. Contar incidencias o problemas previos
    -- Se considera incidencia: un pedido cancelado, rechazado o marcado con incidencias logísticas.
    SELECT COUNT(*)
    INTO v_incidencias
    FROM public.orders
    WHERE customer_phone = p_phone
      AND (
          status IN ('cancelled', 'rejected', 'failed')
          OR 
          -- Verificamos si la columna incidents (JSONB) tiene elementos y no es nula
          (incidents IS NOT NULL AND jsonb_array_length(incidents) > 0)
      );

    -- 3. Retornar los datos consolidados en JSON
    RETURN json_build_object(
        'telefono', p_phone,
        'pedidos_completados', v_completados,
        'total_incidencias', v_incidencias
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos al rol anónimo y autenticado para ejecutar este RPC desde el flujo
GRANT EXECUTE ON FUNCTION public.get_customer_risk_profile(TEXT) TO anon, authenticated;
