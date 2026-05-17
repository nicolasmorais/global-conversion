import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProductById } from "@/services/product.service";
import { getShippingByCountry } from "@/services/shipping.service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { paymentIntentId, name, email, phone, address, country, product_id, locale } = body;

    // Validações
    if (!paymentIntentId || !name || !email || !phone || !address || !country) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (String(name).trim().length < 2) {
      return NextResponse.json({ error: "Nome muito curto" }, { status: 400 });
    }
    if (String(phone).replace(/\D/g, "").length < 6) {
      return NextResponse.json({ error: "Telefone inválido" }, { status: 400 });
    }

    // Buscar preço real do produto no banco
    let productName = body.product_name || "Produto";
    let amount = 0;
    let currency = "usd";
    let shippingName = "";
    let shippingPrice = 0;
    let shippingDaysMin = 0;
    let shippingDaysMax = 0;

    if (product_id) {
      const product = await getProductById(product_id);
      if (!product || !product.active) {
        return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
      }
      productName = product.name;
      currency = product.currency;
      amount = product.price;

      // Buscar frete real
      const shipping = await getShippingByCountry(country) || await getShippingByCountry("GLOBAL");
      if (shipping) {
        shippingName = "Envio Padrão";
        shippingPrice = shipping.price;
        shippingDaysMin = shipping.days_min;
        shippingDaysMax = shipping.days_max;
        amount += shipping.price;
      }
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // Atualizar PaymentIntent com metadata do cliente (pedido será criado no webhook)
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        customer_name: String(name).trim(),
        customer_email: String(email).trim().toLowerCase(),
        customer_phone: String(phone).trim(),
        country,
        address: String(address).trim(),
        product_name: productName,
        product_id: product_id || "",
        locale: locale || "en",
        amount: String(Math.round(amount)),
        currency,
        shipping_name: shippingName,
        shipping_price: String(shippingPrice),
        shipping_days_min: String(shippingDaysMin),
        shipping_days_max: String(shippingDaysMax),
        utm_source: body.utm_source || "",
        utm_medium: body.utm_medium || "",
        utm_campaign: body.utm_campaign || "",
        utm_content: body.utm_content || "",
        utm_term: body.utm_term || "",
        utm_placement: body.utm_placement || "",
        utm_id: body.utm_id || "",
        utm_creative_name: body.utm_creative_name || "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SubmitCheckout] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao processar checkout" },
      { status: 500 }
    );
  }
}
