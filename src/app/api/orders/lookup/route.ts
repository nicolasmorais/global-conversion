import { NextRequest, NextResponse } from "next/server";
import { getOrderByPaymentIntent } from "@/services/order.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pi = searchParams.get("pi");

    if (!pi) {
      return NextResponse.json(
        { error: "Payment intent ID required" },
        { status: 400 }
      );
    }

    const order = await getOrderByPaymentIntent(pi);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Return only non-sensitive public-facing order data
    // No PII (name, email, address, phone) exposed
    return NextResponse.json({
      order: {
        id: order.id,
        product_id: order.product_id,
        product_name: order.product_name,
        amount: order.amount,
        currency: order.currency,
        country: order.country,
        shipping_name: order.shipping_name,
        shipping_price: order.shipping_price,
        shipping_days_min: order.shipping_days_min,
        shipping_days_max: order.shipping_days_max,
        locale: order.locale,
      },
    });
  } catch (error) {
    console.error("[OrderLookup] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
