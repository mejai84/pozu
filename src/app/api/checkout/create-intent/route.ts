import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createPaymentIntentSchema, formatZodErrors } from '@/lib/validation/schemas';
import { paymentLimiter } from '@/lib/rate-limit/limiter';

export const dynamic = 'force-dynamic';

async function getSupabaseAdmin() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: Request) {
  // Rate limit: 5 payment attempts per minute per IP
  const limited = paymentLimiter.check(req);
  if (limited) return limited;

  try {
    const supabaseAdmin = await getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Servicio temporalmente no disponible.' },
        { status: 503 }
      );
    }

    // Fetch stripe settings directly from DB!
    const { data: stripeData } = await supabaseAdmin.from('settings').select('value').eq('key', 'stripe_keys').single();
    const secretKey = stripeData?.value?.secret_key || process.env.STRIPE_SECRET_KEY;
    const publicKey = stripeData?.value?.public_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: 'El sistema de pagos no está configurado.' },
        { status: 503 }
      );
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    // Validate input with Zod
    const body = await req.json();
    const parsed = createPaymentIntentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { amount } = parsed.data;

    // Crear un PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: publicKey, // Pasamos la clave al frontend para cargar el form!
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pago. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}

export async function GET() {
    return NextResponse.json({ status: "ok" });
}
