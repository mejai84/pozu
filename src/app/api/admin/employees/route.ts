import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/server'
import {
    createEmployeeSchema,
    updateEmployeeSchema,
    deleteEmployeeSchema,
    formatZodErrors,
} from '@/lib/validation/schemas'

/**
 * Helper: Creates a Supabase admin client (service role).
 * Only used server-side in this API route.
 */
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// ============================================================
// POST — Crear empleado (solo admin)
// ============================================================
export const POST = withAuth(['admin'], async (req, _auth) => {
    try {
        const body = await req.json()

        // Validate input
        const parsed = createEmployeeSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodErrors(parsed.error) },
                { status: 400 }
            )
        }

        const { email, password, fullName, phone, role } = parsed.data
        const supabaseAdmin = getSupabaseAdmin()

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
            console.error('Error creating auth user:', authError.message)
            return NextResponse.json(
                { error: 'No se pudo crear el usuario. Verifica que el email no esté duplicado.' },
                { status: 400 }
            )
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
            console.error('Error creating profile:', profileError.message)
            // Si falla el perfil, idealmente habría que borrar el usuario en auth, pero por simplicidad saltamos el rollback.
            return NextResponse.json(
                { error: 'Usuario creado pero hubo un error guardando el perfil.' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: 'Empleado creado con éxito', user: { id: userId, email } },
            { status: 200 }
        )

    } catch (error) {
        console.error('Employee POST error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor.' },
            { status: 500 }
        )
    }
})

// ============================================================
// DELETE — Eliminar empleado (solo admin)
// ============================================================
export const DELETE = withAuth(['admin'], async (req, _auth) => {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        // Validate input
        const parsed = deleteEmployeeSchema.safeParse({ id })
        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodErrors(parsed.error) },
                { status: 400 }
            )
        }

        const supabaseAdmin = getSupabaseAdmin()

        // 1. Borrar de Auth (esto borra automáticamente si hay triggers, pero mejor asegurar)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(parsed.data.id)
        if (authError) {
            console.error('Error deleting auth user:', authError.message)
            return NextResponse.json(
                { error: 'No se pudo eliminar el empleado.' },
                { status: 500 }
            )
        }

        // 2. Borrar de Profiles (si no lo hizo el trigger)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', parsed.data.id)
        
        if (profileError) console.error('Error borrando perfil:', profileError.message)

        return NextResponse.json(
            { message: 'Empleado eliminado con éxito' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Employee DELETE error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor.' },
            { status: 500 }
        )
    }
})

// ============================================================
// PUT — Actualizar empleado (solo admin)
// ============================================================
export const PUT = withAuth(['admin'], async (req, _auth) => {
    try {
        const body = await req.json()

        // Validate input
        const parsed = updateEmployeeSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodErrors(parsed.error) },
                { status: 400 }
            )
        }

        const { id, email, password, fullName, phone, role } = parsed.data
        const supabaseAdmin = getSupabaseAdmin()

        // 1. Actualizar datos en Auth si hay cambios significativos o password
        const updateData: Record<string, unknown> = {}
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
            if (authError) {
                console.error('Error updating auth user:', authError.message)
                return NextResponse.json(
                    { error: 'No se pudo actualizar el empleado.' },
                    { status: 500 }
                )
            }
        }

        // 2. Actualizar tabla Profiles
        const profileUpdate: Record<string, unknown> = {}
        if (fullName) profileUpdate.full_name = fullName
        if (email) profileUpdate.email = email
        if (phone !== undefined) profileUpdate.phone = phone
        if (role) profileUpdate.role = role

        if (Object.keys(profileUpdate).length > 0) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update(profileUpdate)
                .eq('id', id)
            
            if (profileError) {
                console.error('Error updating profile:', profileError.message)
                return NextResponse.json(
                    { error: 'No se pudo actualizar el perfil del empleado.' },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json(
            { message: 'Empleado actualizado con éxito' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Employee PUT error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor.' },
            { status: 500 }
        )
    }
})
