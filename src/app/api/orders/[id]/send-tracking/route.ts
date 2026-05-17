import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getOrderById, updateTrackingCode, markEmailTracking } from "@/services/order.service";
import { sendTrackingEmail } from "@/services/email.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { tracking_code } = await request.json();

    if (!tracking_code || typeof tracking_code !== "string" || tracking_code.trim().length < 3) {
      return NextResponse.json(
        { error: "Link de rastreio inválido" },
        { status: 400 }
      );
    }

    // Buscar pedido
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Atualizar código de rastreio no banco
    await updateTrackingCode(id, tracking_code.trim());

    // Enviar email de rastreio
    const emailSent = await sendTrackingEmail({
      id: order.id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      product_name: order.product_name,
      amount: order.amount,
      currency: order.currency,
      locale: order.locale,
      tracking_code: tracking_code.trim(),
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Rastreio salvo, mas erro ao enviar email" },
        { status: 500 }
      );
    }

    // Marcar email de rastreio como enviado
    await markEmailTracking(id);

    return NextResponse.json({ success: true, message: "Rastreio salvo e email enviado" });
  } catch (error) {
    console.error("[SendTracking] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao processar rastreio" },
      { status: 500 }
    );
  }
}
