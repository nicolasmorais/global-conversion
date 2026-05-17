import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getShippingById, updateShipping, deleteShipping } from "@/services/shipping.service";
import { cookies } from "next/headers";

export async function PATCH(
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
    const body = await request.json();

    const existing = await getShippingById(id);
    if (!existing) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    // Whitelist de campos permitidos
    const allowedFields = ["price", "days_min", "days_max", "active"];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) sanitized[key] = body[key];
    }

    // Validações de negócio
    if (sanitized.days_min !== undefined && sanitized.days_max !== undefined) {
      if ((sanitized.days_min as number) > (sanitized.days_max as number)) {
        return NextResponse.json({ error: "days_min não pode ser maior que days_max" }, { status: 400 });
      }
    }
    if (sanitized.price !== undefined && (sanitized.price as number) < 0) {
      return NextResponse.json({ error: "price não pode ser negativo" }, { status: 400 });
    }

    const shipping = await updateShipping(id, sanitized as any);
    return NextResponse.json({ shipping });
  } catch (error) {
    console.error("[Shipping PATCH] Erro:", error);
    return NextResponse.json({ error: "Erro ao atualizar frete" }, { status: 500 });
  }
}

export async function DELETE(
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
    const existing = await getShippingById(id);
    if (!existing) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    await deleteShipping(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Shipping DELETE] Erro:", error);
    return NextResponse.json({ error: "Erro ao deletar frete" }, { status: 500 });
  }
}
