import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Forzar que Next.js no intente pre-renderizar esta ruta
export const dynamic = 'force-dynamic'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any,
    })
  : null

/**
 * IMPORTANTE: No importamos createClient arriba. 
 * Lo inicializamos dinámicamente dentro de la función para evitar
 * que el build de Next.js falle por falta de variables de entorno.
 */
async function getSupabaseAdmin() {
  const { createClient } = await import('@supabase/supabase-js')
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn('⚠️ Supabase Admin no dispuesto en build step')
    // Placeholder que satisface al compilador pero no se ejecutará en runtime real
    return createClient(
      'https://placeholder-pozu.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.fake_admin_key_for_build'
    )
  }

  return createClient(url, key)
}

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  const supabaseAdmin = await getSupabaseAdmin()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (
    event.type === 'payment_intent.succeeded' ||
    event.type === 'checkout.session.completed'
  ) {
    try {
      let orderId: string | undefined

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        // Intentar obtener order_id por metadata (seteado por n8n en v9+)
        orderId = session.metadata?.order_id
        // Fallback: client_reference_id (si n8n lo setea)
        if (!orderId) orderId = session.client_reference_id ?? undefined
      } else {
        const pi = event.data.object as Stripe.PaymentIntent
        orderId = pi.metadata?.order_id
      }

      if (orderId) {
        // Actualizar el pedido a confirmed + paid
        const { data: updatedOrder, error } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .select('id, total, customer_name, customer_phone, items, source, guest_info')
          .single()

        if (error) {
          console.error('Error actualizando pedido:', error)
        } else if (updatedOrder) {
          console.log(`✅ Pedido ${orderId} confirmado tras pago Stripe`)

          // Enviar mensaje de tracking al cliente si tenemos webhook de n8n configurado
          const n8nTrackingWebhook = process.env.N8N_TRACKING_WEBHOOK_URL
          if (n8nTrackingWebhook) {
            try {
              await fetch(n8nTrackingWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'payment_confirmed',
                  order_id: orderId,
                  total: updatedOrder.total,
                  customer_name: updatedOrder.customer_name || updatedOrder.guest_info?.full_name,
                  customer_phone: updatedOrder.customer_phone || updatedOrder.guest_info?.phone,
                  source: updatedOrder.source,
                  tracking_url: `https://pozu2.com/pedidos/tracking?id=${orderId}`,
                })
              })
            } catch (notifyErr) {
              console.warn('No se pudo notificar a n8n:', notifyErr)
            }
          }
        }
      } else {
        // No tenemos order_id: loguear para diagnóstico pero no crashear
        console.warn('⚠️ Stripe webhook sin order_id en metadata. Event:', event.type)
        console.warn('Tip: asegúrate de que n8n setea metadata.order_id al crear la sesión de Stripe')
      }
    } catch (err) {
      console.error('Error processing webhook:', err)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

export async function GET() {
  return NextResponse.json({
    status: 'Stripe Webhook OK',
    configured: !!process.env.STRIPE_SECRET_KEY,
  })
}
