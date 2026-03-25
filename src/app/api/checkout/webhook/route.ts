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
      let paymentIntentId: string | undefined

      if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object as Stripe.PaymentIntent
        orderId = pi.metadata?.order_id
        paymentIntentId = pi.id
      } else {
        const session = event.data.object as Stripe.Checkout.Session
        orderId = session.metadata?.order_id
        paymentIntentId = session.payment_intent as string
      }

      if (orderId) {
        const { error } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        if (error) console.error('Error actualizando pedido:', error)
      } else {
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_link', paymentIntentId)
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
