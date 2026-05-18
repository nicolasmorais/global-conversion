"use client";

import { useState } from "react";
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
  amount: number;
  currency: string;
  tracking_code: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  utm_placement: string | null;
  utm_id: string | null;
  utm_creative_name: string | null;
  created_at: string;
  updated_at: string;
}

interface OrdersTableProps {
  orders: Order[];
  onUpdateTracking: (orderId: string, trackingCode: string) => Promise<void>;
}

export default function OrdersTable({ orders, onUpdateTracking }: OrdersTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    pending: {
      label: "Pendente",
      color: "#92400e",
      bg: "#fef3c7",
      dot: "#f59e0b",
    },
    paid: {
      label: "Pago",
      color: "#166534",
      bg: "#dcfce7",
      dot: "#22c55e",
    },
    failed: {
      label: "Falhou",
      color: "#991b1b",
      bg: "#fee2e2",
      dot: "#ef4444",
    },
  };

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  async function handleSaveTracking(orderId: string) {
    if (!trackingInput.trim()) return;
    setSaving(true);
    try {
      await onUpdateTracking(orderId, trackingInput.trim());
      setEditingId(null);
      setTrackingInput("");
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyCustomerInfo(order: Order) {
    const info = `Nome: ${order.customer_name}\nEmail: ${order.customer_email}\nTelefone: ${order.customer_phone}\nPaís: ${order.country}\nEndereço: ${order.address}`;
    copyToClipboard(info, `customer-${order.id}`);
  }

  if (orders.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "4rem 2rem",
        fontFamily: "'Manrope', monospace",
      }}>
        <div style={{
          width: 64,
          height: 64,
          margin: "0 auto 1.5rem",
          borderRadius: 16,
          background: "rgba(17,17,17,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", letterSpacing: "0.02em" }}>
          Nenhum pedido encontrado
        </p>
        <p style={{ color: "#9ca3af", fontSize: "0.7rem", marginTop: 8, letterSpacing: "0.02em" }}>
          Tente ajustar os filtros ou aguarde novos pedidos
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Manrope', monospace" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Pedido", "Cliente", "Produto", "Valor", "Status", "Rastreamento", "Data", "Ações"].map((h) => (
                <th key={h} style={{
                  textAlign: "left",
                  padding: "0.85rem 1rem",
                  fontSize: "0.6rem",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const isEditing = editingId === order.id;

              return (
                <tr
                  key={order.id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: "0.7rem",
                        color: "#111111",
                        fontWeight: 400,
                        letterSpacing: "0.04em",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
                    >
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "#111111", fontWeight: 500 }}>
                        {order.customer_name}
                      </p>
                      <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }}>
                        {order.customer_email}
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#374151" }}>
                      {order.product_name}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#111111", fontWeight: 500 }}>
                      {formatPrice(order.amount, order.currency)}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0.25rem 0.65rem",
                      borderRadius: 4,
                      fontSize: "0.65rem",
                      fontWeight: 400,
                      letterSpacing: "0.03em",
                      color: status.color,
                      background: status.bg,
                    }}>
                      <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: status.dot,
                      }} />
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }} onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          type="text"
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="Código de rastreio"
                          style={{
                            width: 140,
                            padding: "0.35rem 0.55rem",
                            fontSize: "0.7rem",
                            fontFamily: "'Space Grotesk', sans-serif",
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 4,
                            color: "#111111",
                            outline: "none",
                          }}
                          onFocus={(e) => e.target.style.borderColor = "#111111"}
                          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveTracking(order.id)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveTracking(order.id)}
                          disabled={saving}
                          style={{
                            padding: "0.35rem 0.65rem",
                            fontSize: "0.65rem",
                            fontFamily: "'Manrope', monospace",
                            background: "#111111",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 4,
                            cursor: saving ? "wait" : "pointer",
                            opacity: saving ? 0.6 : 1,
                            transition: "opacity 0.15s ease",
                          }}
                        >
                          {saving ? "..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setTrackingInput(""); }}
                          style={{
                            padding: "0.35rem 0.5rem",
                            fontSize: "0.65rem",
                            fontFamily: "'Manrope', monospace",
                            background: "transparent",
                            color: "#6b7280",
                            border: "1px solid #e5e7eb",
                            borderRadius: 4,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#dc2626"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          fontSize: "0.7rem",
                          color: order.tracking_code ? "#111111" : "#9ca3af",
                          letterSpacing: "0.02em",
                        }}>
                          {order.tracking_code || "—"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(order.id);
                            setTrackingInput(order.tracking_code || "");
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 2,
                            display: "flex",
                            alignItems: "center",
                            color: "#111111",
                            opacity: 0.6,
                            transition: "opacity 0.15s ease",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
                          title="Editar rastreamento"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>{formatDate(order.created_at)}</p>
                      <p style={{ fontSize: "0.6rem", color: "#9ca3af", marginTop: 2 }}>{formatTime(order.created_at)}</p>
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => copyCustomerInfo(order)}
                        style={{
                          padding: "0.35rem 0.65rem",
                          fontSize: "0.65rem",
                          fontFamily: "'Manrope', monospace",
                          background: copied === `customer-${order.id}` ? "rgba(22,163,74,0.08)" : "transparent",
                          color: copied === `customer-${order.id}` ? "#16a34a" : "#6b7280",
                          border: `1px solid ${copied === `customer-${order.id}` ? "rgba(22,163,74,0.2)" : "#e5e7eb"}`,
                          borderRadius: 4,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          if (copied !== `customer-${order.id}`) {
                            e.currentTarget.style.borderColor = "#111111";
                            e.currentTarget.style.color = "#111111";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (copied !== `customer-${order.id}`) {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.color = "#6b7280";
                          }
                        }}
                      >
                        {copied === `customer-${order.id}` ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
