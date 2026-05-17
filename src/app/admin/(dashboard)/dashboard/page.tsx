"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DateSelector, { DateRange, filterByDateRange } from "@/components/DateSelector";

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
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: "Pago", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  pending: { label: "Pendente", color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
  failed: { label: "Falhou", color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${d.toLocaleDateString("pt-BR", { month: "short" })}`;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [rates, setRates] = useState<{ USD_BRL: number; EUR_BRL: number }>({ USD_BRL: 5.0, EUR_BRL: 5.5 });
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: "2020-01-01",
    end: "2099-12-31",
    label: "Todo período",
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders?limit=1000");
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        if (!res.ok) throw new Error("Erro ao buscar pedidos");
        const data = await res.json();
        setOrders(data.orders);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    async function fetchRates() {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        if (res.ok) {
          const data = await res.json();
          setRates({
            USD_BRL: data.rates.BRL || 5.0,
            EUR_BRL: (data.rates.BRL || 5.0) / (data.rates.EUR || 0.92),
          });
        }
      } catch {
        // Use fallback rates
      }
    }

    fetchOrders();
    fetchRates();
  }, []);

  const filteredOrders = useMemo(() => filterByDateRange(orders, dateRange), [orders, dateRange]);

  const stats = useMemo(() => {
    const paid = filteredOrders.filter((o) => o.status === "paid");
    const pending = filteredOrders.filter((o) => o.status === "pending");
    const failed = filteredOrders.filter((o) => o.status === "failed");

    // Revenue by currency
    const eurOrders = paid.filter((o) => o.currency.toLowerCase() === "eur");
    const usdOrders = paid.filter((o) => o.currency.toLowerCase() === "usd");
    const totalEUR = eurOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalUSD = usdOrders.reduce((sum, o) => sum + o.amount, 0);

    return { paid, pending, failed, totalEUR, totalUSD, eurOrders, usdOrders };
  }, [filteredOrders]);

  const statusData = useMemo(() => {
    return [
      { name: "Pago", value: stats.paid.length, color: "#16a34a" },
      { name: "Pendente", value: stats.pending.length, color: "#6b7280" },
      { name: "Falhou", value: stats.failed.length, color: "#dc2626" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const chartData = useMemo(() => {
    if (filteredOrders.length === 0) return [];
    const now = new Date();
    const days: Record<string, { date: string; receita: number; pedidos: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days[key] = { date: formatShortDate(d.toISOString()), receita: 0, pedidos: 0 };
    }
    filteredOrders.forEach((o) => {
      const key = new Date(o.created_at).toISOString().split("T")[0];
      if (days[key]) {
        days[key].pedidos += 1;
        if (o.status === "paid") days[key].receita += o.amount / 100;
      }
    });
    return Object.values(days);
  }, [filteredOrders]);

  const recentOrders = useMemo(() => filteredOrders.slice(0, 10), [filteredOrders]);

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "1.1rem 1.25rem",
    transition: "border-color 0.15s ease",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.6rem",
    fontWeight: 400,
    color: "#9ca3af",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "1.25rem",
    fontWeight: 400,
    color: "#111111",
    lineHeight: 1.2,
  };

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.75rem",
              fontWeight: 600,
              color: "#111111",
              letterSpacing: "0.04em",
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.15rem 0 0 0", letterSpacing: "0.02em" }}>
            Visao geral do sistema
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "0.45rem 0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.7rem",
            color: "#9ca3af",
            letterSpacing: "0.02em",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#111111";
            e.currentTarget.style.color = "#111111";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#9ca3af";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          Atualizar
        </button>
      </div>

      {/* Date Selector */}
      <DateSelector value={dateRange} onChange={setDateRange} />

      {/* Metric Cards */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                ...cardStyle,
                opacity: 1 - i * 0.15,
                animation: "fadeUp 0.5s ease forwards",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: "12px",
                      width: "40%",
                      borderRadius: "4px",
                      background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                      marginBottom: "0.4rem",
                    }}
                  />
                  <div
                    style={{
                      height: "20px",
                      width: "60%",
                      borderRadius: "4px",
                      background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "0.85rem", color: "#dc2626" }}>{error}</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.75rem",
            animation: "fadeUp 0.5s ease forwards",
          }}
        >
          {/* EUR Sales Card */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>€</span>
              </div>
              <div>
                <p style={labelStyle}>Vendas EUR</p>
                <p style={valueStyle}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "EUR" }).format(stats.totalEUR / 100)}
                </p>
              </div>
            </div>
          </div>

          {/* USD Sales Card */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>$</span>
              </div>
              <div>
                <p style={labelStyle}>Vendas USD</p>
                <p style={valueStyle}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(stats.totalUSD / 100)}
                </p>
              </div>
            </div>
          </div>

          {/* Total BRL Card (converted) */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(22,163,74,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#16a34a" }}>R$</span>
              </div>
              <div>
                <p style={labelStyle}>Total em BRL</p>
                <p style={{ ...valueStyle, color: "#16a34a" }}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    (stats.totalEUR / 100) * rates.EUR_BRL + (stats.totalUSD / 100) * rates.USD_BRL
                  )}
                </p>
                <p style={{ fontSize: "0.55rem", color: "#9ca3af", margin: "0.15rem 0 0 0", letterSpacing: "0.02em" }}>
                  €1 = R${rates.EUR_BRL.toFixed(2)} · $1 = R${rates.USD_BRL.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Paid Orders Card */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(22,163,74,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={labelStyle}>Pagos</p>
                <p style={valueStyle}>{stats.paid.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Chart */}
      {!loading && chartData.length > 0 && (
        <div
          style={{ ...cardStyle, padding: "1.25rem", animation: "fadeUp 0.5s ease 0.1s forwards", opacity: 0 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111111",
                  letterSpacing: "0.04em",
                  margin: 0,
                }}
              >
                Receita e Pedidos
              </h2>
              <p style={{ fontSize: "0.65rem", color: "#6b7280", margin: "0.1rem 0 0 0", letterSpacing: "0.02em" }}>
                Ultimos 30 dias
              </p>
            </div>
          </div>
          {mounted ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#111111" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#111111" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#6b7280", fontFamily: "'Space Grotesk', sans-serif" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6b7280", fontFamily: "'Space Grotesk', sans-serif" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `R$${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="#111111"
                  strokeWidth={2}
                  fill="url(#gradientReceita)"
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "280px",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          )}
        </div>
      )}

      {/* Bottom Row: Status Breakdown + Recent Orders */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: "1.5rem",
            animation: "fadeUp 0.5s ease 0.2s forwards",
            opacity: 0,
          }}
        >
          {/* Status Breakdown */}
          <div style={cardStyle}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#111111",
                letterSpacing: "0.04em",
                margin: "0 0 1rem 0",
              }}
            >
              Status dos Pedidos
            </h2>
            {statusData.length > 0 && mounted ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div style={{ position: "relative", width: "160px", height: "160px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1200}
                        animationEasing="ease-out"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ ...valueStyle, fontSize: "1.5rem", margin: 0 }}>{orders.length}</p>
                    <p style={{ ...labelStyle, fontSize: "0.55rem", margin: 0 }}>Total</p>
                  </div>
                </div>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {statusData.map((s) => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.75rem", color: "#111111", flex: 1 }}>{s.name}</span>
                      <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{s.value}</span>
                      <span style={{ fontSize: "0.6rem", color: "#111111", fontWeight: 500, minWidth: "36px", textAlign: "right" }}>
                        {((s.value / orders.length) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "#6b7280", fontSize: "0.75rem" }}>
                Nenhum pedido encontrado
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.25rem 0.85rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111111",
                  letterSpacing: "0.04em",
                  margin: 0,
                }}
              >
                Pedidos Recentes
              </h2>
              <Link
                href="/admin/orders"
                style={{
                  fontSize: "0.7rem",
                  color: "#111111",
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  fontWeight: 500,
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Ver todos
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["ID", "Cliente", "Valor", "Status", "Data"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.6rem 1.25rem",
                          textAlign: "left",
                          fontSize: "0.6rem",
                          fontWeight: 400,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <tr
                        key={order.id}
                        style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.15s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "0.65rem 1.25rem", fontSize: "0.75rem", color: "#111111", fontWeight: 500 }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td style={{ padding: "0.65rem 1.25rem", fontSize: "0.75rem", color: "#111111" }}>
                          {order.customer_name}
                        </td>
                        <td style={{ padding: "0.65rem 1.25rem", fontSize: "0.75rem", color: "#111111" }}>
                          {formatPrice(order.amount, order.currency)}
                        </td>
                        <td style={{ padding: "0.65rem 1.25rem" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              padding: "0.2rem 0.55rem",
                              borderRadius: "20px",
                              background: sc.bg,
                              fontSize: "0.65rem",
                              color: sc.color,
                            }}
                          >
                            <span
                              style={{
                                width: "5px",
                                height: "5px",
                                borderRadius: "50%",
                                background: sc.color,
                              }}
                            />
                            {sc.label}
                          </span>
                        </td>
                        <td style={{ padding: "0.65rem 1.25rem", fontSize: "0.7rem", color: "#6b7280" }}>
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "#6b7280", fontSize: "0.75rem" }}>
                Nenhum pedido encontrado
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive style for bottom grid */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1.5fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "0.65rem 0.85rem",
        fontFamily: "'Space Grotesk', sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ fontSize: "0.65rem", color: "#6b7280", margin: "0 0 0.3rem 0", letterSpacing: "0.02em" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: "0.8rem", color: "#111111", margin: 0 }}>
          {p.dataKey === "receita"
            ? `R$ ${p.value.toFixed(2)}`
            : `${p.value} pedido${p.value !== 1 ? "s" : ""}`}
        </p>
      ))}
    </div>
  );
}
