import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/auth/server'
import { formLimiter } from '@/lib/rate-limit/limiter'
import { createReservationSchema, formatZodErrors } from '@/lib/validation/schemas'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    // 1. Rate limiting (10 peticiones / minuto)
    const limited = formLimiter.check(req)
    if (limited) return limited

    try {
        const body = await req.json()

        // 2. Validación de inputs con Zod
        const parsed = createReservationSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodErrors(parsed.error) },
                { status: 400 }
            )
        }

        // 3. Obtener cliente Supabase del servidor (con cookies si hay sesión, aunque no es requerida)
        const supabase = await createServerSupabase()

        // 4. Inserción en base de datos
        // Importante: Al usar el cliente normal de servidor (no admin), 
        // se respetan las políticas RLS. Si quieres que cualquiera inserte, 
        // puedes usar el admin_client (getSupabaseAdmin) o asegurar que RLS permite anon insert.
        // Asumiendo que el RLS permite inserts anónimos:
        const { error } = await supabase
            .from('reservations')
            .insert([{
                customer_name: parsed.data.customer_name,
                customer_phone: parsed.data.customer_phone,
                reservation_date: parsed.data.reservation_date,
                reservation_time: parsed.data.reservation_time,
                guests: parsed.data.guests_count,
                notes: parsed.data.notes,
                source: 'website',
                status: 'pending'
            }])

        if (error) {
            console.error('Reservation insert error (Server):', error.message)
            return NextResponse.json(
                { error: 'No se pudo enviar la reserva. Por favor, inténtalo de nuevo.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, message: 'Reserva enviada.' })
    } catch (error) {
        console.error('API /reservar error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor.' },
            { status: 500 }
        )
    }
}
