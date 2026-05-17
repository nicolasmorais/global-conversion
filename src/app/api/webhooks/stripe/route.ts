import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createOrderFromWebhook, markEmailConfirmation } from "@/services/order.service";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import { sendOrderApprovedEmail, sendOrderDeclinedEmail } from "@/services/email.service";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Sem assinatura" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Webhook] Erro de verificação:", err);
    return NextResponse.json(
      { error: "Assinatura inválida" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Pagamento aprovado: ${paymentIntent.id}`);

        const { metadata } = paymentIntent;
        const order = await createOrderFromWebhook({
          stripe_payment_intent: paymentIntent.id,
          customer_name: metadata.customer_name || "N/A",
          customer_email: metadata.customer_email || "",
          customer_phone: metadata.customer_phone || "",
          country: metadata.country || "",
          address: metadata.address || "",
          product_name: metadata.product_name || "Produto",
          product_id: metadata.product_id || undefined,
          locale: metadata.locale || "en",
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: "paid",
          shipping_name: metadata.shipping_name || undefined,
          shipping_price: metadata.shipping_price ? parseInt(metadata.shipping_price) : undefined,
          shipping_days_min: metadata.shipping_days_min ? parseInt(metadata.shipping_days_min) : undefined,
          shipping_days_max: metadata.shipping_days_max ? parseInt(metadata.shipping_days_max) : undefined,
          utm_source: metadata.utm_source || undefined,
          utm_medium: metadata.utm_medium || undefined,
          utm_campaign: metadata.utm_campaign || undefined,
          utm_content: metadata.utm_content || undefined,
          utm_term: metadata.utm_term || undefined,
          utm_placement: metadata.utm_placement || undefined,
          utm_id: metadata.utm_id || undefined,
          utm_creative_name: metadata.utm_creative_name || undefined,
        });

        // Enviar evento Purchase para Meta CAPI
        const userAgent = request.headers.get("user-agent") || undefined;
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
          request.headers.get("x-real-ip") ||
          undefined;

        sendPurchaseEvent({
          email: order.customer_email,
          phone: order.customer_phone,
          name: order.customer_name,
          value: order.amount / 100,
          currency: order.currency,
          orderId: order.id,
          country: order.country,
          userAgent,
          ip,
        }).catch(console.error);

        // Enviar email de compra aprovada
        sendOrderApprovedEmail(order).then((sent) => {
          if (sent) markEmailConfirmation(order.id).catch(console.error);
        }).catch(console.error);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Pagamento falhou: ${paymentIntent.id}`);

        const { metadata } = paymentIntent;
        const failedOrder = await createOrderFromWebhook({
          stripe_payment_intent: paymentIntent.id,
          customer_name: metadata.customer_name || "N/A",
          customer_email: metadata.customer_email || "",
          customer_phone: metadata.customer_phone || "",
          country: metadata.country || "",
          address: metadata.address || "",
          product_name: metadata.product_name || "Produto",
          product_id: metadata.product_id || undefined,
          locale: metadata.locale || "en",
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: "failed",
          shipping_name: metadata.shipping_name || undefined,
          shipping_price: metadata.shipping_price ? parseInt(metadata.shipping_price) : undefined,
          shipping_days_min: metadata.shipping_days_min ? parseInt(metadata.shipping_days_min) : undefined,
          shipping_days_max: metadata.shipping_days_max ? parseInt(metadata.shipping_days_max) : undefined,
          utm_source: metadata.utm_source || undefined,
          utm_medium: metadata.utm_medium || undefined,
          utm_campaign: metadata.utm_campaign || undefined,
          utm_content: metadata.utm_content || undefined,
          utm_term: metadata.utm_term || undefined,
          utm_placement: metadata.utm_placement || undefined,
          utm_id: metadata.utm_id || undefined,
          utm_creative_name: metadata.utm_creative_name || undefined,
        });

        // Enviar email de compra recusada
        sendOrderDeclinedEmail(failedOrder).catch(console.error);
        break;
      }

      default:
        console.log(`[Webhook] Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Erro ao processar:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}
