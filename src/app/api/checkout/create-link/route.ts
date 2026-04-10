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

        const success_url = `${process.env.NEXT_PUBLIC_APP_URL || "https://pozu2.com"}/pago-exitoso?order_id=${order_id}`;
        const cancel_url = `${process.env.NEXT_PUBLIC_APP_URL || "https://pozu2.com"}`;

        // 2. Generate Link based on Active Gateway
        if (activeGateway === "stripe") {
            const secretKey = gatewayConfig.secret_key;
            if (!secretKey) return NextResponse.json({ error: "Stripe Secret Key not found" }, { status: 500 });

            // Initialize stripe dynamically (using require inside to avoid issues if not used)
            const Stripe = require("stripe");
            const stripeClient = new Stripe(secretKey, { apiVersion: "2023-10-16" });

            const session = await stripeClient.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "eur",
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
                success_url,
                cancel_url,
                metadata: {
                    order_id,
                },
            });

            return NextResponse.json({ url: session.url });
        } 
        else if (activeGateway === "mercadopago") {
            const accessToken = gatewayConfig.mercadopago_access_token;
            if (!accessToken) return NextResponse.json({ error: "MercadoPago Access Token not found" }, { status: 500 });

            // Create Preference using REST API
            const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: [
                        {
                            title: "Pedido en Pozu",
                            description: summary || "Tu pedido delicioso",
                            quantity: 1,
                            currency_id: "EUR",
                            unit_price: Number(amount),
                        }
                    ],
                    external_reference: order_id,
                    back_urls: {
                        success: success_url,
                        failure: cancel_url,
                        pending: cancel_url,
                    },
                    auto_return: "approved",
                    notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://pozu2.com"}/api/webhooks/mercadopago`,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "MercadoPago Error");

            return NextResponse.json({ url: data.init_point });
        }
        else if (activeGateway === "paypal") {
            const clientId = gatewayConfig.paypal_client_id;
            const secret = gatewayConfig.paypal_secret;
            if (!clientId || !secret) return NextResponse.json({ error: "PayPal credentials not found" }, { status: 500 });

            // 1. Get Access Token
            const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
            const tokenResponse = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
            });

            const tokenData = await tokenResponse.json();
            if (!tokenResponse.ok) throw new Error("PayPal Auth Error");

            // 2. Create Order
            const orderResponse = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            reference_id: order_id,
                            amount: {
                                currency_code: "EUR",
                                value: String(amount),
                            },
                        }
                    ],
                    application_context: {
                        return_url: success_url,
                        cancel_url: cancel_url,
                    }
                }),
            });

            const orderData = await orderResponse.json();
            if (!orderResponse.ok) throw new Error("PayPal Order Error");

            const approveLink = orderData.links.find((l: any) => l.rel === "approve");
            return NextResponse.json({ url: approveLink.href });
        }

        return NextResponse.json({ error: `Unknown gateway: ${activeGateway}` }, { status: 400 });

    } catch (error: any) {
        console.error("Error creating payment link:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
