import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/Jaime/Antigravity/Pozu/.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

async function test() {
  try {
    console.log("Testing Stripe with key:", process.env.STRIPE_SECRET_KEY?.substring(0, 10) + "...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'eur',
    });
    console.log("Success! Client Secret:", paymentIntent.client_secret);
  } catch (error) {
    console.error("Stripe test failed:", error.message);
  }
}

test();
