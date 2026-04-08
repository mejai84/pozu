-- =============================================
-- POZU 2.0 — SISTEMA DE RESERVAS
-- Ejecutar en Supabase → SQL Editor
-- =============================================

-- 1. MESAS DEL LOCAL
-- =============================================
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,              -- "Mesa 1", "Mesa Terraza 2", etc.
  capacity INTEGER NOT NULL,       -- personas máx en esa mesa
  location TEXT,                   -- "interior", "terraza", "barra"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ejemplo: insertar tus mesas (ajusta según tu local)
INSERT INTO tables (name, capacity, location) VALUES
  ('Mesa 1', 2, 'interior'),
  ('Mesa 2', 2, 'interior'),
  ('Mesa 3', 4, 'interior'),
  ('Mesa 4', 4, 'interior'),
  ('Mesa 5', 6, 'interior'),
  ('Mesa 6', 4, 'terraza'),
  ('Mesa 7', 4, 'terraza'),
  ('Mesa 8', 2, 'terraza');


-- 2. HORARIOS DEL NEGOCIO
-- =============================================
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL,        -- 0=Domingo, 1=Lunes ... 6=Sábado
  day_name TEXT NOT NULL,              -- para referencia legible
  open_time TIME NOT NULL,             -- hora apertura turno
  close_time TIME NOT NULL,            -- hora cierre turno (última reserva)
  slot_duration_minutes INTEGER DEFAULT 90,  -- duración media reserva
  is_active BOOLEAN DEFAULT true
);

-- Ejemplo: Martes a Domingo, turno comida y cena
-- (Lunes cerrado → no se inserta)
INSERT INTO time_slots (day_of_week, day_name, open_time, close_time, slot_duration_minutes) VALUES
  -- MARTES
  (2, 'Martes',    '13:00', '15:30', 90),
  (2, 'Martes',    '20:00', '22:30', 90),
  -- MIÉRCOLES
  (3, 'Miércoles', '13:00', '15:30', 90),
  (3, 'Miércoles', '20:00', '22:30', 90),
  -- JUEVES
  (4, 'Jueves',    '13:00', '15:30', 90),
  (4, 'Jueves',    '20:00', '22:30', 90),
  -- VIERNES
  (5, 'Viernes',   '13:00', '15:30', 90),
  (5, 'Viernes',   '20:00', '23:00', 90),
  -- SÁBADO
  (6, 'Sábado',    '13:00', '15:30', 90),
  (6, 'Sábado',    '20:00', '23:00', 90),
  -- DOMINGO
  (0, 'Domingo',   '13:00', '15:30', 90);


-- 3. RESERVAS (Eliminar e insertar tabla en caso de ya existir para actualizar schema)
-- =============================================
DROP TABLE IF EXISTS reservations CASCADE;

CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  reservation_date DATE NOT NULL,       -- fecha de la reserva
  reservation_time TIME NOT NULL,       -- hora de la reserva
  guests INTEGER NOT NULL,              -- número de personas
  table_id UUID REFERENCES tables(id),  -- mesa asignada automáticamente
  status TEXT DEFAULT 'confirmed'       -- confirmed / cancelled / no_show
    CHECK (status IN ('confirmed', 'cancelled', 'no_show')),
  notes TEXT,                           -- peticiones especiales del cliente
  source TEXT,                          -- whatsapp / telegram / website_chat / vapi
  session_id TEXT,                      -- para vincular con la conversación
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 4. ÍNDICES para búsquedas rápidas por fecha
-- =============================================
CREATE INDEX IF NOT EXISTS idx_reservations_date 
  ON reservations(reservation_date);

CREATE INDEX IF NOT EXISTS idx_reservations_date_time 
  ON reservations(reservation_date, reservation_time);

CREATE INDEX IF NOT EXISTS idx_reservations_status 
  ON reservations(status);


-- 5. VISTA ÚTIL: reservas del día con nombre de mesa
-- =============================================
CREATE OR REPLACE VIEW reservations_today AS
SELECT 
  r.id,
  r.customer_name,
  r.phone,
  r.reservation_date,
  r.reservation_time,
  r.guests,
  t.name AS table_name,
  t.location AS table_location,
  r.status,
  r.notes,
  r.source,
  r.created_at
FROM reservations r
LEFT JOIN tables t ON r.table_id = t.id
WHERE r.reservation_date = CURRENT_DATE
  AND r.status = 'confirmed'
ORDER BY r.reservation_time;
