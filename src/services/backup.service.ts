import { r2, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Order } from "@/generated/prisma/client";

/**
 * Salva backup do pedido no Cloudflare R2
 * ID do pedido no R2 = mesmo ID do admin (order.id)
 */
export async function backupOrder(order: Order): Promise<void> {
  try {
    const key = `orders/${order.id}.json`;

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: JSON.stringify(order, null, 2),
        ContentType: "application/json",
      })
    );

    console.log(`[Backup] Pedido ${order.id} salvo no R2: ${key}`);
  } catch (error) {
    console.error("[Backup] Falha ao salvar backup do pedido no R2:", order.id, error);
  }
}
