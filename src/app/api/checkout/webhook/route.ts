import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any,
    })
  : null

// Supabase con service role para actualizar sin RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (webhookSecret && sig) {
      // Modo producción: verificar firma de Stripe
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      // Modo dev sin firma (local testing)
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Manejar eventos relevantes
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

        if (error) {
          console.error('Error actualizando pedido:', error)
        } else {
          console.log(`✅ Pedido ${orderId} marcado como pagado (${paymentIntentId})`)
        }
      } else {
        // Buscar por payment_intent_id si no hay order_id en metadata
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
    webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
  })
}
