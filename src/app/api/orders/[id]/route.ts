import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { updateTrackingCode, getOrderById } from "@/services/order.service";

export async function GET(
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
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[Order GET] Erro:", error);
    return NextResponse.json({ error: "Erro ao buscar pedido" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!verifyToken(token)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { tracking_code } = await request.json();

    if (!tracking_code || typeof tracking_code !== "string") {
      return NextResponse.json(
        { error: "Código de rastreamento inválido" },
        { status: 400 }
      );
    }

    const order = await updateTrackingCode(id, tracking_code.trim());
    return NextResponse.json(order);
  } catch (error) {
    console.error("[Orders] Erro ao atualizar tracking:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar rastreamento" },
      { status: 500 }
    );
  }
}
