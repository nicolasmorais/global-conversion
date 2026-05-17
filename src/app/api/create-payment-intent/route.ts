import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProductById } from "@/services/product.service";
import { getShippingByCountry } from "@/services/shipping.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { product_id, currency, country } = body;

    if (!product_id || !currency) {
      return NextResponse.json(
        { error: "product_id e currency são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar preço real do produto no banco
    const product = await getProductById(product_id);
    if (!product || !product.active) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const curr = product.currency;
    const price = product.price;

    // Buscar frete real do banco
    let shippingCost = 0;
    if (country) {
      const shipping = await getShippingByCountry(country) || await getShippingByCountry("GLOBAL");
      if (shipping) shippingCost = shipping.price;
    }

    const amount = price + shippingCost;

    if (amount <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // Criar PaymentIntent no Stripe (sem criar pedido — o pedido é criado no /api/submit-checkout)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: curr,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
    });
  } catch (error) {
    console.error("[PaymentIntent] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento" },
      { status: 500 }
    );
  }
}
