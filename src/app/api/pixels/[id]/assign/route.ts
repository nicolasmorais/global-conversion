import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// GET - listar produtos vinculados a este pixel
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

    const assignments = await prisma.productPixel.findMany({
      where: { pixel_id: id },
      include: {
        product: {
          select: { id: true, name: true, slug: true, locale: true, currency: true },
        },
      },
    });

    return NextResponse.json({ products: assignments.map((a) => a.product) });
  } catch (error) {
    console.error("[Pixel Assign GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao listar produtos do pixel" },
      { status: 500 }
    );
  }
}

// POST - vincular pixel a produtos { product_ids: string[] }
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
    const body = await request.json();

    if (!Array.isArray(body.product_ids)) {
      return NextResponse.json(
        { error: "product_ids deve ser um array" },
        { status: 400 }
      );
    }

    // Verificar se o pixel existe
    const pixel = await prisma.pixel.findUnique({ where: { id } });
    if (!pixel) {
      return NextResponse.json({ error: "Pixel não encontrado" }, { status: 404 });
    }

    // Validar que os produtos existem
    if (body.product_ids.length > 0) {
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: body.product_ids } },
        select: { id: true },
      });
      const existingIds = new Set(existingProducts.map((p) => p.id));
      const invalidIds = body.product_ids.filter((pid: string) => !existingIds.has(pid));
      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: `Produtos não encontrados: ${invalidIds.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Remover vinculações antigas e criar novas
    await prisma.productPixel.deleteMany({ where: { pixel_id: id } });

    if (body.product_ids.length > 0) {
      await prisma.productPixel.createMany({
        data: body.product_ids.map((product_id: string) => ({
          pixel_id: id,
          product_id,
        })),
        skipDuplicates: true,
      });
    }

    // Retornar produtos atualizados
    const assignments = await prisma.productPixel.findMany({
      where: { pixel_id: id },
      include: {
        product: {
          select: { id: true, name: true, slug: true, locale: true, currency: true },
        },
      },
    });

    return NextResponse.json({ products: assignments.map((a) => a.product) });
  } catch (error) {
    console.error("[Pixel Assign POST] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao vincular produtos" },
      { status: 500 }
    );
  }
}
