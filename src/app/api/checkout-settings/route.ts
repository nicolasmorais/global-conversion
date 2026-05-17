import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const settings = await prisma.checkoutSetting.findFirst();
    return NextResponse.json({
      button_color: settings?.button_color ?? "#111111",
      logo_url: settings?.logo_url ?? null,
    });
  } catch (error) {
    console.error("[CheckoutSettings GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { button_color, logo_url } = body;

    const existing = await prisma.checkoutSetting.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.checkoutSetting.update({
        where: { id: existing.id },
        data: {
          ...(button_color !== undefined && { button_color }),
          ...(logo_url !== undefined && { logo_url: logo_url || null }),
        },
      });
    } else {
      settings = await prisma.checkoutSetting.create({
        data: {
          button_color: button_color ?? "#111111",
          logo_url: logo_url || null,
        },
      });
    }

    return NextResponse.json({
      button_color: settings.button_color,
      logo_url: settings.logo_url,
    });
  } catch (error) {
    console.error("[CheckoutSettings PUT] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}
