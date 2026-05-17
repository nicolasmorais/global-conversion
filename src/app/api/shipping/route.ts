import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createShipping, listShippings, listActiveShippings } from "@/services/shipping.service";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin");

    if (admin) {
      const cookieStore = await cookies();
      const token = cookieStore.get("admin_token")?.value;
      if (!verifyToken(token)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      const shippings = await listShippings();
      return NextResponse.json({ shippings });
    }

    const shippings = await listActiveShippings();
    return NextResponse.json({ shippings });
  } catch (error) {
    console.error("[Shipping GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao listar fretes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.country || !body.price || !body.days_min || !body.days_max) {
      return NextResponse.json(
        { error: "country, price, days_min e days_max são obrigatórios" },
        { status: 400 }
      );
    }

    const shipping = await createShipping({
      country: body.country,
      price: Math.round(body.price),
      days_min: Math.round(body.days_min),
      days_max: Math.round(body.days_max),
    });

    return NextResponse.json({ shipping }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe frete para este país" },
        { status: 409 }
      );
    }
    console.error("[Shipping POST] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao criar frete" },
      { status: 500 }
    );
  }
}
