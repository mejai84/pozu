import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// This file provides an endpoint for external systems (like n8n) 
// to quickly request a payment link based on the active gateway
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { order_id, amount, summary } = body;

        if (!order_id || !amount) {
            return NextResponse.json({ error: "Missing order_id or amount" }, { status: 400 });
        }

        // 1. Fetch dynamic keys and active gateway
        const { data: settingsData } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "stripe_keys")
            .single();

        if (!settingsData || !settingsData.value) {
            return NextResponse.json({ error: "No payment gateway configured in settings" }, { status: 500 });
        }

        const gatewayConfig = settingsData.value;
        const activeGateway = gatewayConfig.active_gateway || "stripe";

        // 2. Generate Link based on Active Gateway
        if (activeGateway === "stripe") {
            const secretKey = gatewayConfig.secret_key;
            if (!secretKey) return NextResponse.json({ error: "Stripe Secret Key not found" }, { status: 500 });

            // Initialize stripe dynamically
            const Stripe = require("stripe");
            const stripeClient = new Stripe(secretKey, { apiVersion: "2023-10-16" });

            const session = await stripeClient.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "eur", // Change accordingly
                            product_data: {
                                name: "Pedido en Pozu",
                                description: summary || "Tu pedido delicioso",
                            },
                            unit_amount: Math.round(Number(amount) * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://pozu2.com"}/pago-exitoso?order_id=${order_id}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://pozu2.com"}`,
                metadata: {
                    order_id,
                },
            });

            return NextResponse.json({ url: session.url });
        } 
        else if (activeGateway === "mercadopago") {
            // Scaffold for MercadoPago
            const accessToken = gatewayConfig.mercadopago_access_token;
            if (!accessToken) return NextResponse.json({ error: "MercadoPago Access Token not found" }, { status: 500 });

            // TODO: Implement MP Checkout Pro preference logic here using the accessToken
            // Returns the init_point
            return NextResponse.json({ 
                error: "MercadoPago integration pending. Contact developer.",
                url: "https://mercadopago.com/checkout/pending" 
            });
        }
        else if (activeGateway === "paypal") {
            // Scaffold for PayPal
            const clientId = gatewayConfig.paypal_client_id;
            const secret = gatewayConfig.paypal_secret;
            if (!clientId || !secret) return NextResponse.json({ error: "PayPal credentials not found" }, { status: 500 });

            // TODO: Implement PayPal Orders v2 logic here
            return NextResponse.json({ 
                error: "PayPal integration pending. Contact developer." ,
                url: "https://paypal.com/checkout/pending"
            });
        }

        return NextResponse.json({ error: `Unknown gateway: ${activeGateway}` }, { status: 400 });

    } catch (error: any) {
        console.error("Error creating payment link:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
