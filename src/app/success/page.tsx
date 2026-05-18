"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _tfa: Array<Record<string, unknown>>;
  }
}

interface OrderData {
  id: string;
  product_id: string | null;
  product_name: string;
  amount: number;
  currency: string;
  country: string;
  shipping_name: string | null;
  shipping_price: number | null;
  shipping_days_min: number | null;
  shipping_days_max: number | null;
  locale: string;
}

const successTranslations: Record<string, Record<string, string>> = {
  en: {
    orderConfirmed: "Order Confirmed!",
    thankYou: "Thank you for your purchase.",
    emailOnWay: "A confirmation email is on its way.",
    orderId: "Order ID",
    product: "Product",
    subtotal: "Subtotal",
    shipping: "Shipping",
    freeShipping: "Free shipping",
    total: "Total",
    customer: "Customer",
    email: "Email",
    address: "Shipping address",
    deliveryTime: "Delivery time",
    businessDays: "business days",
    questions: "Questions? Reply to the confirmation email or contact support.",
    loading: "Loading order details...",
  },
  es: {
    orderConfirmed: "¡Pedido Confirmado!",
    thankYou: "Gracias por tu compra.",
    emailOnWay: "Un correo de confirmación está en camino.",
    orderId: "ID del Pedido",
    product: "Producto",
    subtotal: "Subtotal",
    shipping: "Envío",
    freeShipping: "Envío gratis",
    total: "Total",
    customer: "Cliente",
    email: "Correo",
    address: "Dirección de envío",
    deliveryTime: "Tiempo de entrega",
    businessDays: "días hábiles",
    questions: "¿Dudas? Responde al correo de confirmación o contacta soporte.",
    loading: "Cargando detalles del pedido...",
  },
  pt: {
    orderConfirmed: "Pedido Confirmado!",
    thankYou: "Obrigado pela sua compra.",
    emailOnWay: "Um e-mail de confirmação está a caminho.",
    orderId: "ID do Pedido",
    product: "Produto",
    subtotal: "Subtotal",
    shipping: "Frete",
    freeShipping: "Frete grátis",
    total: "Total",
    customer: "Cliente",
    email: "E-mail",
    address: "Endereço de entrega",
    deliveryTime: "Prazo de entrega",
    businessDays: "dias úteis",
    questions: "Dúvidas? Responda ao e-mail de confirmação ou contate o suporte.",
    loading: "Carregando detalhes do pedido...",
  },
  fr: {
    orderConfirmed: "Commande Confirmée !",
    thankYou: "Merci pour votre achat.",
    emailOnWay: "Un e-mail de confirmation est en route.",
    orderId: "N° de Commande",
    product: "Produit",
    subtotal: "Sous-total",
    shipping: "Livraison",
    freeShipping: "Livraison gratuite",
    total: "Total",
    customer: "Client",
    email: "E-mail",
    address: "Adresse de livraison",
    deliveryTime: "Délai de livraison",
    businessDays: "jours ouvrables",
    questions: "Des questions ? Répondez à l'e-mail de confirmation ou contactez le support.",
    loading: "Chargement des détails de la commande...",
  },
  de: {
    orderConfirmed: "Bestellung Bestätigt!",
    thankYou: "Vielen Dank für Ihren Einkauf.",
    emailOnWay: "Eine Bestätigungs-E-mail ist unterwegs.",
    orderId: "Bestellnummer",
    product: "Produkt",
    subtotal: "Zwischensumme",
    shipping: "Versand",
    freeShipping: "Kostenloser Versand",
    total: "Gesamt",
    customer: "Kunde",
    email: "E-Mail",
    address: "Lieferadresse",
    deliveryTime: "Lieferzeit",
    businessDays: "Werktage",
    questions: "Fragen? Antworten Sie auf die Bestätigungs-E-Mail oder kontaktieren Sie den Support.",
    loading: "Bestelldetails werden geladen...",
  },
  it: {
    orderConfirmed: "Ordine Confermato!",
    thankYou: "Grazie per il tuo acquisto.",
    emailOnWay: "Un'e-mail di conferma è in arrivo.",
    orderId: "N° Ordine",
    product: "Prodotto",
    subtotal: "Subtotale",
    shipping: "Spedizione",
    freeShipping: "Spedizione gratuita",
    total: "Totale",
    customer: "Cliente",
    email: "E-mail",
    address: "Indirizzo di spedizione",
    deliveryTime: "Tempi di consegna",
    businessDays: "giorni lavorativi",
    questions: "Domande? Rispondi all'e-mail di conferma o contatta il supporto.",
    loading: "Caricamento dettagli ordine...",
  },
};

const countryNames: Record<string, string> = {
  BR: "Brasil", US: "Estados Unidos", PT: "Portugal", ES: "Espanha",
  FR: "França", DE: "Alemanha", IT: "Itália", GB: "Reino Unido",
  CA: "Canadá", AU: "Austrália", JP: "Japão", MX: "México",
  AR: "Argentina", CO: "Colômbia", CL: "Chile", PE: "Peru",
  IE: "Irlanda", NL: "Holanda", BE: "Bélgica", CH: "Suíça",
  AT: "Áustria", SE: "Suécia", NO: "Noruega", DK: "Dinamarca",
  FI: "Finlândia", GLOBAL: "Global",
};

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent") || searchParams.get("pi");
  const amount = parseInt(searchParams.get("amount") || "0");
  const currency = searchParams.get("currency") || "usd";
  const locale = searchParams.get("lang") || "en";
  const productName = searchParams.get("product") || "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const t = successTranslations[locale] || successTranslations.en;

  useEffect(() => {
    // Meta Pixel
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Purchase", {
        content_type: "product",
        payment_intent: paymentIntent,
      });
    }

    // Fetch order details and fire Taboola pixels from database
    if (paymentIntent) {
      fetch(`/api/orders/lookup?pi=${paymentIntent}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) {
            setOrder(data.order);

            // Fetch active pixels for this product from database
            if (data.order.product_id) {
              fetch(`/api/pixels/active?productId=${data.order.product_id}`)
                .then((res) => res.json())
                .then((pixelData) => {
                  if (!pixelData.pixels) return;
                  const orderAmount = data.order.amount || amount;
                  const orderCurrency = (data.order.currency || currency).toUpperCase();
                  pixelData.pixels.forEach((pixel: { pixel_id: string; platform: string }) => {
                    if (pixel.platform !== "taboola") return;
                    // Load script if not already loaded
                    const scriptId = `taboola-pixel-${pixel.pixel_id}`;
                    if (!document.getElementById(scriptId)) {
                      window._tfa = window._tfa || [];
                      window._tfa.push({ notify: "event", name: "page_view", id: Number(pixel.pixel_id) });
                      const script = document.createElement("script");
                      script.id = scriptId;
                      script.async = true;
                      script.src = `//cdn.taboola.com/libtrc/unip/${pixel.pixel_id}/tfa.js`;
                      document.head.appendChild(script);
                    }
                    // Fire Purchase event
                    window._tfa = window._tfa || [];
                    window._tfa.push({
                      notify: "event",
                      name: "Purchase",
                      id: Number(pixel.pixel_id),
                      revenue: orderAmount / 100,
                      currency: orderCurrency,
                      orderid: data.order.id,
                    });
                  });
                })
                .catch(() => {});
            }
          }
        })
        .catch((err) => console.error("Failed to fetch order:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [paymentIntent, amount, currency]);

  const displayAmount = order?.amount || amount;
  const displayCurrency = order?.currency || currency;
  const displayProduct = order?.product_name || productName;
  const shippingPrice = order?.shipping_price ?? 0;
  const subtotal = displayAmount - shippingPrice;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f2f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{
          background: "#fff",
          border: "1px solid #e2e5ea",
          borderRadius: 14,
          padding: "40px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          {/* Success Icon */}
          <div style={{
            width: 72,
            height: 72,
            background: "#dcfce7",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#18181b",
            letterSpacing: -0.5,
            marginBottom: 8,
            textAlign: "center",
          }}>
            {t.orderConfirmed}
          </h1>
          <p style={{
            fontSize: 15,
            color: "#666",
            lineHeight: 1.6,
            textAlign: "center",
            marginBottom: 32,
          }}>
            {t.thankYou}<br />{t.emailOnWay}
          </p>

          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 24,
                height: 24,
                border: "2px solid #18181b",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }} />
              <p style={{ fontSize: 13, color: "#888", marginTop: 12 }}>{t.loading}</p>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div style={{
                background: "#f7f8fa",
                borderRadius: 10,
                padding: 20,
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 16 }}>
                  {t.product}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: "#444" }}>{displayProduct}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#18181b" }}>
                    {formatPrice(subtotal, displayCurrency)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: "#444" }}>
                    {t.shipping}
                    {order?.shipping_name && ` (${order.shipping_name})`}
                  </span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: shippingPrice === 0 ? "#16a34a" : "#18181b",
                  }}>
                    {shippingPrice === 0 ? t.freeShipping : formatPrice(shippingPrice, displayCurrency)}
                  </span>
                </div>

                <div style={{
                  borderTop: "1px solid #e2e5ea",
                  paddingTop: 12,
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#18181b" }}>{t.total}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#18181b" }}>
                    {formatPrice(displayAmount, displayCurrency)}
                  </span>
                </div>
              </div>

              {/* Delivery Time */}
              {order?.shipping_days_min != null && order?.shipping_days_max != null && (
                <div style={{
                  background: "#f7f8fa",
                  borderRadius: 10,
                  padding: 20,
                  marginBottom: 16,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 4 }}>
                    {t.deliveryTime}
                  </p>
                  <p style={{ fontSize: 14, color: "#18181b" }}>
                    {order.shipping_days_min} - {order.shipping_days_max} {t.businessDays}
                  </p>
                </div>
              )}

              {/* Order ID */}
              {paymentIntent && (
                <div style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: "1px solid #e2e5ea",
                  textAlign: "center",
                }}>
                  <p style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#aaa",
                    marginBottom: 4,
                  }}>
                    {t.orderId}
                  </p>
                  <p style={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: "#888",
                    wordBreak: "break-all",
                  }}>
                    {paymentIntent}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <p style={{ marginTop: 32, fontSize: 12, color: "#aaa", textAlign: "center" }}>
          {t.questions}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{
          minHeight: "100vh",
          background: "#f0f2f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            width: 32,
            height: 32,
            border: "2px solid #18181b",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
