
-- EJECUTAR ESTO EN EL SQL EDITOR DE SUPABASE PARA CREAR EL USUARIO ADMINISTRADOR

DO $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
  user_email TEXT := 'jajl840316@gmail.com';
  user_password TEXT := '@Mejai840316*'; -- Tu contraseña maestra
  user_full_name TEXT := 'Jaime Alberto Jaramillo Lopez';
BEGIN
  -- 1. Insertar en auth.users si no existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000',
      user_email, crypt(user_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', user_full_name, 'username', 'mejai84'),
      now(), now(), 'authenticated', '', '', '', ''
    );

    -- 2. Asegurar que el perfil sea admin
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (new_user_id, user_email, user_full_name, 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Usuario admin creado: %', user_email;
  ELSE
    -- Si ya existe, promover a admin
    UPDATE public.profiles SET role = 'admin' WHERE email = user_email;
    RAISE NOTICE 'Rol admin actualizado para: %', user_email;
  END IF;
END $$;
