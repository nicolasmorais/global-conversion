"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  stripe_payment_intent: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  country: string;
  address: string;
  product_name: string;
  product_id: string | null;
  locale: string;
  amount: number;
  currency: string;
  tracking_code: string | null;
  shipping_name: string | null;
  shipping_price: number | null;
  shipping_days_min: number | null;
  shipping_days_max: number | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  utm_placement: string | null;
  utm_id: string | null;
  utm_creative_name: string | null;
  email_confirmation: string | null;
  email_tracking: string | null;
  email_delivery: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    slug: string;
    name: string;
    image_url: string | null;
  } | null;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: "#dcfce7", text: "#166534", label: "Aprovado" },
  pending: { bg: "#fef3c7", text: "#92400e", label: "Pendente" },
  failed: { bg: "#fee2e2", text: "#991b1b", label: "Recusado" },
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

function formatShippingPrice(price: number, currency: string): string {
  if (price === 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(price / 100);
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (!res.ok) {
          router.push("/admin/orders");
          return;
        }
        const data = await res.json();
        setOrder(data.order);
      } catch (error) {
        console.error("Erro ao buscar pedido:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id, router]);

  async function handleSendTracking() {
    if (!trackingInput.trim() || !order) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/send-tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_code: trackingInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult({ success: true, message: "Email de rastreio enviado com sucesso!" });
        setOrder({ ...order, tracking_code: trackingInput.trim() });
        setTrackingInput("");
      } else {
        setSendResult({ success: false, message: data.error || "Erro ao enviar" });
      }
    } catch {
      setSendResult({ success: false, message: "Erro de conexão" });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2.5rem", textAlign: "center", color: "#9ca3af" }}>
        Carregando pedido...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "2.5rem", textAlign: "center", color: "#999" }}>
        Pedido não encontrado
      </div>
    );
  }

  const status = statusColors[order.status] || statusColors.pending;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: order.currency.toUpperCase(),
  }).format(order.amount / 100);

  const hasUtm = order.utm_source || order.utm_medium || order.utm_campaign;

  return (
    <div style={{ padding: "2.5rem", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <Link
            href="/admin/orders"
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar para Pedidos
          </Link>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#111111",
            letterSpacing: "0.03em",
          }}>
            Pedido #{order.id.slice(0, 12)}
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>
            {new Date(order.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <span style={{
          padding: "0.35rem 0.85rem",
          borderRadius: 20,
          fontSize: "0.7rem",
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          background: status.bg,
          color: status.text,
        }}>
          {status.label}
        </span>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Cliente */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Cliente</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Nome" value={order.customer_name} />
            <Field label="Email" value={order.customer_email} />
            <Field label="Telefone" value={order.customer_phone} />
            <Field label="País" value={`${countryNames[order.country] || order.country} (${order.country})`} />
            <Field label="Endereço" value={order.address} />
          </div>
        </div>

        {/* Pagamento */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Pagamento</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Valor" value={formattedAmount} highlight />
            <Field label="Moeda" value={order.currency.toUpperCase()} />
            <Field label="Status" value={status.label} />
            <Field label="Payment Intent" value={order.stripe_payment_intent} mono small />
            <Field label="Idioma" value={order.locale.toUpperCase()} />
          </div>
        </div>

        {/* Produto */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Produto</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Produto" value={order.product_name} />
            {order.product_id && <Field label="ID do Produto" value={order.product_id} mono small />}
            {order.product?.image_url && (
              <div>
                <p style={fieldLabel}>Imagem</p>
                <img
                  src={order.product.image_url}
                  alt={order.product_name}
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", marginTop: 4 }}
                />
              </div>
            )}
            {order.tracking_code && <Field label="Rastreio" value={order.tracking_code} mono />}
          </div>
        </div>

        {/* Frete */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Frete</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Método" value={order.shipping_name || "—"} />
            <Field
              label="Valor do Frete"
              value={order.shipping_price != null ? formatShippingPrice(order.shipping_price, order.currency) : "—"}
              highlight={order.shipping_price != null && order.shipping_price > 0}
            />
            <Field
              label="Prazo de Entrega"
              value={
                order.shipping_days_min != null && order.shipping_days_max != null
                  ? `${order.shipping_days_min} - ${order.shipping_days_max} dias úteis`
                  : "—"
              }
            />
          </div>
        </div>

        {/* Rastreamento */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Sistema</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="ID do Pedido" value={order.id} mono small />
            <Field label="Criado em" value={new Date(order.created_at).toLocaleString("pt-BR")} />
            <Field label="Atualizado em" value={new Date(order.updated_at).toLocaleString("pt-BR")} />
            {order.tracking_code && <Field label="Código de Rastreio" value={order.tracking_code} mono />}
          </div>
        </div>
      </div>

      {/* Rastreio */}
      <div style={{ ...cardStyle, marginTop: "1.25rem" }}>
        <h2 style={cardTitle}>Rastreio</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {order.tracking_code && (
            <div style={{ marginBottom: 8 }}>
              <p style={fieldLabel}>Link de Rastreio Atual</p>
              <a
                href={order.tracking_code}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.8rem",
                  color: "#2563eb",
                  textDecoration: "none",
                  wordBreak: "break-all",
                }}
              >
                {order.tracking_code}
              </a>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <p style={fieldLabel}>{order.tracking_code ? "Atualizar Link de Rastreio" : "Link de Rastreio"}</p>
              <input
                type="url"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="https://exemplo.com/rastreio/ABC123"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.8rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  outline: "none",
                  color: "#111111",
                  background: "#ffffff",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#111111"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
              />
            </div>
            <button
              onClick={handleSendTracking}
              disabled={sending || trackingInput.trim().length < 3}
              style={{
                padding: "0.65rem 1.25rem",
                fontSize: "0.75rem",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.03em",
                background: sending || trackingInput.trim().length < 3 ? "#d1d5db" : "#111111",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                cursor: sending || trackingInput.trim().length < 3 ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {sending ? "Enviando..." : "Enviar Rastreio"}
            </button>
          </div>
          {sendResult && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: 6,
              fontSize: "0.75rem",
              background: sendResult.success ? "#dcfce7" : "#fee2e2",
              color: sendResult.success ? "#166534" : "#991b1b",
              border: `1px solid ${sendResult.success ? "#bbf7d0" : "#fecaca"}`,
            }}>
              {sendResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Status de Emails */}
      <div style={{ ...cardStyle, marginTop: "1.25rem" }}>
        <h2 style={cardTitle}>Emails Enviados</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <EmailStatus
            label="Confirmação"
            sent={order.email_confirmation}
          />
          <EmailStatus
            label="Rastreio"
            sent={order.email_tracking}
          />
          <EmailStatus
            label="Entrega"
            sent={order.email_delivery}
          />
        </div>
      </div>

      {/* UTM */}
      {hasUtm && (
        <div style={{ ...cardStyle, marginTop: "1.25rem" }}>
          <h2 style={cardTitle}>UTM / Tracking</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {order.utm_source && <Field label="Source" value={order.utm_source} />}
            {order.utm_medium && <Field label="Medium" value={order.utm_medium} />}
            {order.utm_campaign && <Field label="Campaign" value={order.utm_campaign} />}
            {order.utm_content && <Field label="Content" value={order.utm_content} />}
            {order.utm_term && <Field label="Term" value={order.utm_term} />}
            {order.utm_placement && <Field label="Placement" value={order.utm_placement} />}
            {order.utm_id && <Field label="Campaign ID" value={order.utm_id} />}
            {order.utm_creative_name && <Field label="Creative" value={order.utm_creative_name} />}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono, small, highlight }: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p style={fieldLabel}>{label}</p>
      <p style={{
        fontSize: small ? "0.7rem" : "0.8rem",
        color: highlight ? "#111111" : "#374151",
        fontWeight: highlight ? 700 : 500,
        fontFamily: mono ? "'Space Grotesk', monospace" : "'Space Grotesk', sans-serif",
        wordBreak: "break-all",
        lineHeight: 1.5,
      }}>
        {value}
      </p>
    </div>
  );
}

function EmailStatus({ label, sent }: { label: string; sent: string | null }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0.75rem 1rem",
      borderRadius: 8,
      background: sent ? "#f0fdf4" : "#f9fafb",
      border: `1px solid ${sent ? "#bbf7d0" : "#e5e7eb"}`,
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: sent ? "#22c55e" : "#d1d5db",
        flexShrink: 0,
      }} />
      <div>
        <p style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: "#111111",
          letterSpacing: "0.03em",
          marginBottom: 2,
        }}>
          {label}
        </p>
        <p style={{
          fontSize: "0.65rem",
          color: sent ? "#166534" : "#9ca3af",
        }}>
          {sent
            ? new Date(sent).toLocaleString("pt-BR")
            : "Não enviado"}
        </p>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "1.5rem",
};

const cardTitle: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#111111",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "1rem",
  paddingBottom: "0.75rem",
  borderBottom: "1px solid #f3f4f6",
};

const fieldLabel: React.CSSProperties = {
  fontSize: "0.6rem",
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 2,
};
