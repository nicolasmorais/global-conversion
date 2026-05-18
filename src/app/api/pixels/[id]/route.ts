import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const allowedFields = ["name", "pixel_id", "platform", "active"];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) sanitized[key] = body[key];
    }

    if (sanitized.pixel_id !== undefined) {
      sanitized.pixel_id = String(sanitized.pixel_id);
    }

    const pixel = await prisma.pixel.update({
      where: { id },
      data: sanitized,
    });

    return NextResponse.json({ pixel });
  } catch (error: unknown) {
    if ((error as Record<string, string>)?.code === "P2025") {
      return NextResponse.json({ error: "Pixel não encontrado" }, { status: 404 });
    }
    console.error("[Pixels PATCH] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pixel" },
      { status: 500 }
    );
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

    await prisma.pixel.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as Record<string, string>)?.code === "P2025") {
      return NextResponse.json({ error: "Pixel não encontrado" }, { status: 404 });
    }
    console.error("[Pixels DELETE] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao deletar pixel" },
      { status: 500 }
    );
  }
}
