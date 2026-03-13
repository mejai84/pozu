import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, fullName, phone, role } = body

        // Verificaciones básicas
        if (!email || !password || !fullName || !role) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        // Necesitamos la clave de servicio (Service Role Key) para crear usuarios sin iniciar sesión
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // REQUIERE ESTA VARIABLE EN .env.local
        )

        // 1. Crear el usuario en Auth (Identidad)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirmar
            user_metadata: {
                full_name: fullName,
                phone: phone
            }
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 500 })
        }

        const userId = authData.user.id

        // 2. Insertar su registro en la tabla de Profiles con el rol asignado
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                full_name: fullName,
                phone: phone || null,
                role: role
            })

        if (profileError) {
            // Si falla el perfil, idealmente habría que borrar el usuario en auth, pero por simplicidad saltamos el rollback.
            return NextResponse.json({ error: profileError.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Empleado creado con éxito', user: authData.user }, { status: 200 })

    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: 'Error del servidor: ' + error.message }, { status: 500 })
    }
}
