import { prisma } from "@/lib/prisma";

const DEFAULT_TEMPLATES: Record<string, Record<string, { subject: string; html: string }>> = {
  approved: {
    en: {
      subject: "Order Confirmed! #{{order_id}}",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:40px;margin-bottom:40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">Order Confirmed!</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Thank you for your purchase</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1a1816;font-size:15px;line-height:1.6;margin:0 0 24px;">Hello <strong>{{customer_name}}</strong>, your order has been successfully processed!</p>
      <div style="background:#f9fafb;border:1px solid #e8e4de;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;">Order</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;">#{{order_id}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #e8e4de;">Product</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #e8e4de;">{{product_name}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #e8e4de;">Total</td><td style="padding:8px 0;color:#16a34a;font-size:15px;font-weight:700;text-align:right;border-top:1px solid #e8e4de;">{{amount}}</td></tr>
        </table>
      </div>
      <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#92400e;font-size:13px;margin:0;font-weight:600;">Shipping Information</p>
        <p style="color:#92400e;font-size:13px;margin:8px 0 0;">Your order will be shipped within 48 hours. Delivery time: 5-10 business days.</p>
      </div>
      <p style="color:#6b6560;font-size:13px;line-height:1.6;margin:0;">If you have any questions, reply to this email or contact our support.</p>
    </div>
    <div style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e8e4de;">
      <p style="color:#9a9590;font-size:12px;margin:0;text-align:center;">© 2025 STORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    },
    es: {
      subject: "¡Pedido Confirmado! #{{order_id}}",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:40px;margin-bottom:40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">¡Pedido Confirmado!</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Gracias por tu compra</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1a1816;font-size:15px;line-height:1.6;margin:0 0 24px;">Hola <strong>{{customer_name}}</strong>, ¡tu pedido ha sido procesado exitosamente!</p>
      <div style="background:#f9fafb;border:1px solid #e8e4de;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;">Pedido</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;">#{{order_id}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #e8e4de;">Producto</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #e8e4de;">{{product_name}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #e8e4de;">Total</td><td style="padding:8px 0;color:#16a34a;font-size:15px;font-weight:700;text-align:right;border-top:1px solid #e8e4de;">{{amount}}</td></tr>
        </table>
      </div>
      <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#92400e;font-size:13px;margin:0;font-weight:600;">Información de Envío</p>
        <p style="color:#92400e;font-size:13px;margin:8px 0 0;">Tu pedido será enviado en un plazo de 48 horas. Tiempo de entrega: 5-10 días hábiles.</p>
      </div>
      <p style="color:#6b6560;font-size:13px;line-height:1.6;margin:0;">Si tienes alguna pregunta, responde a este correo o contacta a nuestro soporte.</p>
    </div>
    <div style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e8e4de;">
      <p style="color:#9a9590;font-size:12px;margin:0;text-align:center;">© 2025 STORE. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`,
    },
  },
  declined: {
    en: {
      subject: "Payment Not Processed - Order #{{order_id}}",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:40px;margin-bottom:40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">Payment Not Processed</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">There was a problem with your payment</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1a1816;font-size:15px;line-height:1.6;margin:0 0 24px;">Hello <strong>{{customer_name}}</strong>, unfortunately your payment could not be processed.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;">Order</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;">#{{order_id}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #fecaca;">Product</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #fecaca;">{{product_name}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #fecaca;">Total</td><td style="padding:8px 0;color:#dc2626;font-size:15px;font-weight:700;text-align:right;border-top:1px solid #fecaca;">{{amount}}</td></tr>
        </table>
      </div>
      <div style="background:#f9fafb;border:1px solid #e8e4de;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#1a1816;font-size:13px;margin:0 0 8px;font-weight:600;">Possible causes:</p>
        <ul style="color:#6b6560;font-size:13px;margin:0;padding-left:20px;">
          <li style="margin-bottom:4px;">Insufficient card limit</li>
          <li style="margin-bottom:4px;">Incorrect card details</li>
          <li style="margin-bottom:4px;">Blocked or expired card</li>
          <li>Transaction declined by issuing bank</li>
        </ul>
      </div>
      <p style="color:#6b6560;font-size:13px;line-height:1.6;margin:0;">You can try again with another payment method. If the problem persists, contact us.</p>
    </div>
    <div style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e8e4de;">
      <p style="color:#9a9590;font-size:12px;margin:0;text-align:center;">© 2025 STORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    },
    es: {
      subject: "Pago No Procesado - Pedido #{{order_id}}",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:40px;margin-bottom:40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">Pago No Procesado</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Hubo un problema con tu pago</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1a1816;font-size:15px;line-height:1.6;margin:0 0 24px;">Hola <strong>{{customer_name}}</strong>, lamentablemente tu pago no pudo ser procesado.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;">Pedido</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;">#{{order_id}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #fecaca;">Producto</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #fecaca;">{{product_name}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #fecaca;">Total</td><td style="padding:8px 0;color:#dc2626;font-size:15px;font-weight:700;text-align:right;border-top:1px solid #fecaca;">{{amount}}</td></tr>
        </table>
      </div>
      <div style="background:#f9fafb;border:1px solid #e8e4de;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#1a1816;font-size:13px;margin:0 0 8px;font-weight:600;">Posibles causas:</p>
        <ul style="color:#6b6560;font-size:13px;margin:0;padding-left:20px;">
          <li style="margin-bottom:4px;">Límite de tarjeta insuficiente</li>
          <li style="margin-bottom:4px;">Datos de tarjeta incorrectos</li>
          <li style="margin-bottom:4px;">Tarjeta bloqueada o vencida</li>
          <li>Transacción rechazada por el banco emisor</li>
        </ul>
      </div>
      <p style="color:#6b6560;font-size:13px;line-height:1.6;margin:0;">Puedes intentar nuevamente con otro método de pago. Si el problema persiste, contáctanos.</p>
    </div>
    <div style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e8e4de;">
      <p style="color:#9a9590;font-size:12px;margin:0;text-align:center;">© 2025 STORE. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`,
    },
  },
  tracking: {
    en: {
      subject: "Your Order Has Been Shipped! #{{order_id}}",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:40px;margin-bottom:40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(13deg,#2563eb,#3b82f6);padding:32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">Your Order Has Been Shipped!</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Track your package in real time</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1a1816;font-size:15px;line-height:1.6;margin:0 0 24px;">Hello <strong>{{customer_name}}</strong>, great news! Your order has been shipped and is on its way to you.</p>
      <div style="background:#f9fafb;border:1px solid #e8e4de;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;">Order</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;">#{{order_id}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #e8e4de;">Product</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #e8e4de;">{{product_name}}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="{{tracking_link}}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.02em;">Track My Order</a>
      </div>
      <p style="color:#6b6560;font-size:13px;line-height:1.6;margin:0;">If you have any questions, reply to this email or contact our support.</p>
    </div>
    <div style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e8e4de;">
      <p style="color:#9a9590;font-size:12px;margin:0;text-align:center;">© 2025 STORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    },
    es: {
      subject: "¡Tu Pedido Ha Sido Enviado! #{{order_id}}",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:40px;margin-bottom:40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#2563eb,#3b82f6);padding:32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">¡Tu Pedido Ha Sido Enviado!</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Rastrea tu paquete en tiempo real</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1a1816;font-size:15px;line-height:1.6;margin:0 0 24px;">Hola <strong>{{customer_name}}</strong>, ¡buenas noticias! Tu pedido ha sido enviado y está en camino.</p>
      <div style="background:#f9fafb;border:1px solid #e8e4de;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;">Pedido</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;">#{{order_id}}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6560;font-size:13px;border-top:1px solid #e8e4de;">Producto</td><td style="padding:8px 0;color:#1a1816;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #e8e4de;">{{product_name}}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="{{tracking_link}}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.02em;">Rastrear Mi Pedido</a>
      </div>
      <p style="color:#6b6560;font-size:13px;line-height:1.6;margin:0;">Si tienes alguna pregunta, responde a este correo o contacta a nuestro soporte.</p>
    </div>
    <div style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e8e4de;">
      <p style="color:#9a9590;font-size:12px;margin:0;text-align:center;">© 2025 STORE. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`,
    },
  },
};

export async function getTemplate(type: string, locale: string = "en") {
  let template = await prisma.emailTemplate.findUnique({
    where: { type_locale: { type, locale } },
  });

  if (!template) {
    const defaults = DEFAULT_TEMPLATES[type]?.[locale] || DEFAULT_TEMPLATES[type]?.["en"];
    if (!defaults) return null;

    template = await prisma.emailTemplate.create({
      data: { type, locale, subject: defaults.subject, html: defaults.html },
    });
  }

  return template;
}

export async function listTemplates() {
  const templates = await prisma.emailTemplate.findMany({
    orderBy: [{ type: "asc" }, { locale: "asc" }],
  });

  // Create defaults if missing
  for (const [type, locales] of Object.entries(DEFAULT_TEMPLATES)) {
    for (const [locale, defaults] of Object.entries(locales)) {
      if (!templates.find((t) => t.type === type && t.locale === locale)) {
        const created = await prisma.emailTemplate.create({
          data: { type, locale, subject: defaults.subject, html: defaults.html },
        });
        templates.push(created);
      }
    }
  }

  return templates;
}

export async function upsertTemplate(type: string, locale: string, data: { subject: string; html: string }) {
  return prisma.emailTemplate.upsert({
    where: { type_locale: { type, locale } },
    create: { type, locale, ...data },
    update: data,
  });
}

export async function resetTemplatesToDefaults(locale?: string) {
  const firstType = Object.keys(DEFAULT_TEMPLATES)[0];
  const locales = locale ? [locale] : Object.keys(DEFAULT_TEMPLATES[firstType] || {});
  const results: { type: string; locale: string; action: string }[] = [];

  for (const [type, localeMap] of Object.entries(DEFAULT_TEMPLATES)) {
    for (const loc of locales) {
      const defaults = localeMap[loc];
      if (!defaults) continue;

      const existing = await prisma.emailTemplate.findUnique({
        where: { type_locale: { type, locale: loc } },
      });

      if (existing) {
        await prisma.emailTemplate.update({
          where: { type_locale: { type, locale: loc } },
          data: { subject: defaults.subject, html: defaults.html },
        });
        results.push({ type, locale: loc, action: "updated" });
      } else {
        await prisma.emailTemplate.create({
          data: { type, locale: loc, subject: defaults.subject, html: defaults.html },
        });
        results.push({ type, locale: loc, action: "created" });
      }
    }
  }

  return results;
}
