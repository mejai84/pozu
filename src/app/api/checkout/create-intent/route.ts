import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

async function getSupabaseAdmin() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = await getSupabaseAdmin();
    if (!supabaseAdmin) throw new Error('Supabase admin not configured');

    // Fetch stripe settings directly from DB!
    const { data: stripeData } = await supabaseAdmin.from('settings').select('value').eq('key', 'stripe_keys').single();
    const secretKey = stripeData?.value?.secret_key || process.env.STRIPE_SECRET_KEY;
    const publicKey = stripeData?.value?.public_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe is not configured. Configura las claves en el Admin -> Configuración.' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const { amount } = await req.json();

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
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Error inesperado' },
      { status: 500 }
    );
  }
}

export async function GET() {
    return NextResponse.json({ status: "Stripe API intent ok" });
}
