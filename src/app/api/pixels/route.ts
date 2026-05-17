import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const pixels = await prisma.pixel.findMany({
      orderBy: { created_at: "desc" },
      include: {
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json({ pixels });
  } catch (error) {
    console.error("[Pixels GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao listar pixels" },
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

    if (!body.name || !body.pixel_id) {
      return NextResponse.json(
        { error: "name e pixel_id são obrigatórios" },
        { status: 400 }
      );
    }

    const pixel = await prisma.pixel.create({
      data: {
        name: body.name,
        pixel_id: String(body.pixel_id),
        platform: body.platform || "taboola",
        active: body.active ?? true,
      },
    });

    return NextResponse.json({ pixel }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um pixel com esse ID" },
        { status: 409 }
      );
    }
    console.error("[Pixels POST] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao criar pixel" },
      { status: 500 }
    );
  }
}
