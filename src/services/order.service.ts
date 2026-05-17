import { prisma } from "@/lib/prisma";
import { backupOrder } from "./backup.service";

interface CreateOrderInput {
  stripe_payment_intent: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  country: string;
  address: string;
  product_name: string;
  product_id?: string;
  locale?: string;
  amount: number;
  currency: string;
  shipping_name?: string;
  shipping_price?: number;
  shipping_days_min?: number;
  shipping_days_max?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_placement?: string;
  utm_id?: string;
  utm_creative_name?: string;
}

interface CreateOrderFromWebhookInput extends CreateOrderInput {
  status: "paid" | "failed";
}

/**
 * Cria um novo pedido e faz backup no KV
 */
export async function createOrder(data: CreateOrderInput) {
  const order = await prisma.order.create({
    data: {
      stripe_payment_intent: data.stripe_payment_intent,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      country: data.country,
      address: data.address,
      product_name: data.product_name,
      product_id: data.product_id,
      locale: data.locale || "en",
      amount: data.amount,
      currency: data.currency,
      status: "pending",
      shipping_name: data.shipping_name,
      shipping_price: data.shipping_price,
      shipping_days_min: data.shipping_days_min,
      shipping_days_max: data.shipping_days_max,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      utm_term: data.utm_term,
      utm_placement: data.utm_placement,
      utm_id: data.utm_id,
      utm_creative_name: data.utm_creative_name,
    },
  });

  // Backup assíncrono - não bloqueia a resposta
  backupOrder(order).catch(console.error);

  return order;
}

/**
 * Cria ou atualiza pedido a partir do webhook do Stripe (upsert evita duplicata)
 */
export async function createOrderFromWebhook(data: CreateOrderFromWebhookInput) {
  const order = await prisma.order.upsert({
    where: { stripe_payment_intent: data.stripe_payment_intent },
    update: {
      status: data.status,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      country: data.country,
      address: data.address,
      product_name: data.product_name,
      product_id: data.product_id,
      locale: data.locale || "en",
      amount: data.amount,
      currency: data.currency,
      shipping_name: data.shipping_name,
      shipping_price: data.shipping_price,
      shipping_days_min: data.shipping_days_min,
      shipping_days_max: data.shipping_days_max,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      utm_term: data.utm_term,
      utm_placement: data.utm_placement,
      utm_id: data.utm_id,
      utm_creative_name: data.utm_creative_name,
    },
    create: {
      stripe_payment_intent: data.stripe_payment_intent,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      country: data.country,
      address: data.address,
      product_name: data.product_name,
      product_id: data.product_id,
      locale: data.locale || "en",
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      shipping_name: data.shipping_name,
      shipping_price: data.shipping_price,
      shipping_days_min: data.shipping_days_min,
      shipping_days_max: data.shipping_days_max,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      utm_term: data.utm_term,
      utm_placement: data.utm_placement,
      utm_id: data.utm_id,
      utm_creative_name: data.utm_creative_name,
    },
  });

  // Backup assíncrono
  backupOrder(order).catch(console.error);

  return order;
}

/**
 * Atualiza o status de um pedido pelo payment_intent
 */
export async function updateOrderStatus(
  paymentIntentId: string,
  status: string
) {
  const order = await prisma.order.update({
    where: { stripe_payment_intent: paymentIntentId },
    data: { status },
  });

  // Backup assíncrono
  backupOrder(order).catch(console.error);

  return order;
}

/**
 * Atualiza o código de rastreamento de um pedido
 */
export async function updateTrackingCode(orderId: string, trackingCode: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { tracking_code: trackingCode },
  });

  // Backup assíncrono
  backupOrder(order).catch(console.error);

  return order;
}

/**
 * Lista pedidos com paginação
 */
export async function listOrders(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count(),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Busca pedido pelo payment_intent
 */
export async function getOrderByPaymentIntent(paymentIntentId: string) {
  return prisma.order.findUnique({
    where: { stripe_payment_intent: paymentIntentId },
  });
}

/**
 * Busca pedido pelo ID com produto
 */
export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { product: true },
  });
}

/**
 * Marca email de confirmação como enviado
 */
export async function markEmailConfirmation(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { email_confirmation: new Date() },
  });
}

/**
 * Marca email de rastreio como enviado
 */
export async function markEmailTracking(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { email_tracking: new Date() },
  });
}

/**
 * Marca email de entrega como enviado
 */
export async function markEmailDelivery(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { email_delivery: new Date() },
  });
}
