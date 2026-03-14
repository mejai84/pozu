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

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID de empleado requerido' }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Borrar de Auth (esto borra automáticamente si hay triggers, pero mejor asegurar)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (authError) throw authError

        // 2. Borrar de Profiles (si no lo hizo el trigger)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', id)
        
        if (profileError) console.error('Error borrando perfil:', profileError)

        return NextResponse.json({ message: 'Empleado eliminado con éxito' }, { status: 200 })

    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: 'Error al eliminar: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, email, password, fullName, phone, role } = body

        if (!id) {
            return NextResponse.json({ error: 'ID de empleado requerido' }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Actualizar datos en Auth si hay cambios significativos o password
        const updateData: any = {}
        if (email) updateData.email = email
        if (password) updateData.password = password
        if (fullName || phone) {
            updateData.user_metadata = {
                ...(fullName ? { full_name: fullName } : {}),
                ...(phone ? { phone: phone } : {})
            }
        }

        if (Object.keys(updateData).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
            if (authError) throw authError
        }

        // 2. Actualizar tabla Profiles
        const profileUpdate: any = {}
        if (fullName) profileUpdate.full_name = fullName
        if (email) profileUpdate.email = email
        if (phone !== undefined) profileUpdate.phone = phone
        if (role) profileUpdate.role = role

        if (Object.keys(profileUpdate).length > 0) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update(profileUpdate)
                .eq('id', id)
            
            if (profileError) throw profileError
        }

        return NextResponse.json({ message: 'Empleado actualizado con éxito' }, { status: 200 })

    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: 'Error al actualizar: ' + error.message }, { status: 500 })
    }
}
