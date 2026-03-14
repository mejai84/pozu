-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  table_number INTEGER,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policies for reservations
DROP POLICY IF EXISTS "Public can create reservations" ON reservations;
CREATE POLICY "Public can create reservations" ON reservations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
CREATE POLICY "Admins can view all reservations" ON reservations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'staff')
  )
);

DROP POLICY IF EXISTS "Admins can update reservations" ON reservations;
CREATE POLICY "Admins can update reservations" ON reservations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'staff')
  )
);

DROP POLICY IF EXISTS "Admins can delete reservations" ON reservations;
CREATE POLICY "Admins can delete reservations" ON reservations FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'staff')
  )
);
