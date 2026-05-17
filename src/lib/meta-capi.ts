/**
 * Meta Conversion API - Server-side tracking
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

function isConfigured(): boolean {
  return !!(PIXEL_ID && ACCESS_TOKEN);
}

interface PurchaseEventData {
  email: string;
  phone: string;
  name: string;
  value: number;
  currency: string;
  orderId: string;
  country: string;
  userAgent?: string;
  ip?: string;
}

function hashSHA256(value: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendPurchaseEvent(data: PurchaseEventData): Promise<boolean> {
  if (!isConfigured()) {
    console.warn("[Meta CAPI] Não configurado, pulando evento...");
    return false;
  }

  try {
    const eventTime = Math.floor(Date.now() / 1000);

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: eventTime,
          event_id: data.orderId,
          action_source: "website",
          user_data: {
            em: [hashSHA256(data.email)],
            ph: [hashSHA256(data.phone)],
            fn: [hashSHA256(data.name.split(" ")[0])],
            ln: [hashSHA256(data.name.split(" ").slice(1).join(" ") || data.name)],
            country: [hashSHA256(data.country.toLowerCase())],
            client_ip_address: data.ip,
            client_user_agent: data.userAgent,
          },
          custom_data: {
            value: data.value,
            currency: data.currency.toUpperCase(),
            order_id: data.orderId,
          },
        },
      ],
    };

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error("[Meta CAPI] Erro:", await response.text());
      return false;
    }

    console.log("[Meta CAPI] Evento Purchase enviado com sucesso");
    return true;
  } catch (error) {
    console.error("[Meta CAPI] Erro ao enviar evento:", error);
    return false;
  }
}
