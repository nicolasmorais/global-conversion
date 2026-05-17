import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - listar pixels ativos vinculados a um produto (público, sem auth)
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId é obrigatório" },
        { status: 400 }
      );
    }

    const assignments = await prisma.productPixel.findMany({
      where: {
        product_id: productId,
        pixel: { active: true },
      },
      include: {
        pixel: {
          select: { id: true, pixel_id: true, platform: true, name: true },
        },
      },
    });

    const pixels = assignments.map((a) => a.pixel);

    return NextResponse.json({ pixels });
  } catch (error) {
    console.error("[Pixels Active GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pixels ativos" },
      { status: 500 }
    );
  }
}
