import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET } from "@/lib/r2";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar todos os pedidos do banco
    const orders = await prisma.order.findMany({
      orderBy: { created_at: "desc" },
    });

    let synced = 0;
    let alreadyExists = 0;
    let errors = 0;
    const missing: string[] = [];

    for (const order of orders) {
      const key = `orders/${order.id}.json`;

      try {
        // Verificar se já existe no R2
        await r2.send(
          new HeadObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
          })
        );
        alreadyExists++;
      } catch (err: unknown) {
        if (
          err &&
          typeof err === "object" &&
          "name" in err &&
          (err as { name: string }).name === "NotFound"
        ) {
          // Não existe no R2, fazer upload
          try {
            await r2.send(
              new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
                Body: JSON.stringify(order, null, 2),
                ContentType: "application/json",
              })
            );
            synced++;
            missing.push(order.id);
          } catch (uploadErr) {
            console.error(`[SyncR2] Erro ao enviar pedido ${order.id}:`, uploadErr);
            errors++;
          }
        } else {
          console.error(`[SyncR2] Erro ao verificar pedido ${order.id}:`, err);
          errors++;
        }
      }
    }

    return NextResponse.json({
      total: orders.length,
      alreadyExists,
      synced,
      errors,
      missing,
    });
  } catch (error) {
    console.error("[SyncR2] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao sincronizar com R2" },
      { status: 500 }
    );
  }
}
