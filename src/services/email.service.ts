import { Resend } from "resend";
import { getTemplate } from "./email-template.service";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || "onboarding@resend.dev";

interface OrderData {
  id: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  amount: number;
  currency: string;
  locale?: string;
  tracking_code?: string | null;
}

function formatPrice(amount: number, currency: string, locale: string = "en") {
  const localeCode = locale === "es" ? "es-ES" : "en-US";
  return new Intl.NumberFormat(localeCode, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTemplate(html: string, order: OrderData): string {
  const locale = order.locale || "en";
  return html
    .replace(/\{\{customer_name\}\}/g, escapeHtml(order.customer_name))
    .replace(/\{\{product_name\}\}/g, escapeHtml(order.product_name))
    .replace(/\{\{amount\}\}/g, formatPrice(order.amount, order.currency, locale))
    .replace(/\{\{currency\}\}/g, order.currency.toUpperCase())
    .replace(/\{\{order_id\}\}/g, order.id.slice(0, 8).toUpperCase())
    .replace(/\{\{tracking_code\}\}/g, escapeHtml(order.tracking_code || "—"))
    .replace(/\{\{tracking_link\}\}/g, escapeHtml(order.tracking_code || "#"));
}

export async function sendOrderApprovedEmail(order: OrderData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[Email] RESEND_API_KEY não configurada");
      return false;
    }

    const locale = order.locale || "en";
    const template = await getTemplate("approved", locale);
    if (!template) {
      console.error("[Email] Template 'approved' não encontrado");
      return false;
    }

    const subject = renderTemplate(template.subject, order);
    const html = renderTemplate(template.html, order);

    await resend.emails.send({
      from: FROM,
      to: order.customer_email,
      subject,
      html,
    });

    console.log(`[Email] Email de aprovação (${locale}) enviado para ${order.customer_email}`);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar email de aprovação:", error);
    return false;
  }
}

export async function sendOrderDeclinedEmail(order: OrderData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[Email] RESEND_API_KEY não configurada");
      return false;
    }

    const locale = order.locale || "en";
    const template = await getTemplate("declined", locale);
    if (!template) {
      console.error("[Email] Template 'declined' não encontrado");
      return false;
    }

    const subject = renderTemplate(template.subject, order);
    const html = renderTemplate(template.html, order);

    await resend.emails.send({
      from: FROM,
      to: order.customer_email,
      subject,
      html,
    });

    console.log(`[Email] Email de recusa (${locale}) enviado para ${order.customer_email}`);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar email de recusa:", error);
    return false;
  }
}

export async function sendTestEmail(to: string, type: string, locale: string = "en"): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[Email] RESEND_API_KEY não configurada");
      return false;
    }

    const template = await getTemplate(type, locale);
    if (!template) return false;

    const mockOrder: OrderData = {
      id: "test12345678",
      customer_name: locale === "es" ? "Juan Pérez" : "John Doe",
      customer_email: to,
      product_name: locale === "es" ? "Producto Premium" : "Premium Product",
      amount: 4999,
      currency: "usd",
      locale,
    };

    const subject = renderTemplate(template.subject, mockOrder);
    const html = renderTemplate(template.html, mockOrder);

    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    console.log(`[Email] Email de teste (${locale}) enviado para ${to}`);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar email de teste:", error);
    return false;
  }
}

export async function sendTrackingEmail(order: OrderData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[Email] RESEND_API_KEY não configurada");
      return false;
    }

    const locale = order.locale || "en";
    const template = await getTemplate("tracking", locale);

    if (!template) {
      console.error("[Email] Template de rastreio não encontrado para locale:", locale);
      return false;
    }

    const subject = renderTemplate(template.subject, order);
    const html = renderTemplate(template.html, order);

    await resend.emails.send({
      from: FROM,
      to: order.customer_email,
      subject,
      html,
    });

    console.log(`[Email] Email de rastreio (${locale}) enviado para ${order.customer_email}`);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar email de rastreio:", error);
    return false;
  }
}
