"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import OrdersTable from "@/components/OrdersTable";
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

type StatusFilter = "all" | "paid" | "pending" | "failed";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ total: number; alreadyExists: number; synced: number; errors: number } | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: "2020-01-01",
    end: "2099-12-31",
    label: "Todo período",
  }));
  const router = useRouter();

  async function fetchOrders(pageNum: number = 1) {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?page=${pageNum}&limit=50`);

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setPage(data.page);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSyncR2() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/orders/sync-r2", { method: "POST" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setSyncResult(data);
    } catch (error) {
      console.error("Erro ao sincronizar R2:", error);
    } finally {
      setSyncing(false);
    }
  }

  async function handleUpdateTracking(orderId: string, trackingCode: string) {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracking_code: trackingCode }),
    });

    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }

    if (response.ok) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, tracking_code: trackingCode } : o
        )
      );
    }
  }

  const filteredOrders = useMemo(() => {
    let result = filterByDateRange(orders, dateRange);

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.product_name.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          (o.tracking_code && o.tracking_code.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, statusFilter, search, dateRange]);

  const paidOrders = orders.filter((o) => o.status === "paid");
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const failedOrders = orders.filter((o) => o.status === "failed");

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0) / 100;

  const stats = [
    {
      label: "Receita Total",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      accent: "#111111",
      bg: "#f3f4f6",
    },
    {
      label: "Pagos",
      value: paidOrders.length.toString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      accent: "#166534",
      bg: "#dcfce7",
    },
    {
      label: "Pendentes",
      value: pendingOrders.length.toString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      accent: "#92400e",
      bg: "#fef3c7",
    },
    {
      label: "Falharam",
      value: failedOrders.length.toString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      accent: "#991b1b",
      bg: "#fee2e2",
    },
  ];

  const statusTabs: { key: StatusFilter; label: string; dot?: string }[] = [
    { key: "all", label: `Todos (${orders.length})` },
    { key: "paid", label: `Pagos (${paidOrders.length})`, dot: "#22c55e" },
    { key: "pending", label: `Pendentes (${pendingOrders.length})`, dot: "#f59e0b" },
    { key: "failed", label: `Falharam (${failedOrders.length})`, dot: "#ef4444" },
  ];

  return (
    <div style={{
      fontFamily: "'Space Grotesk', sans-serif",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "1.75rem",
            fontWeight: 600,
            color: "#111111",
            letterSpacing: "0.04em",
          }}>
            Pedidos
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4, letterSpacing: "0.02em" }}>
            {total} pedido{total !== 1 ? "s" : ""} no total
            {search && ` · ${filteredOrders.length} resultado${filteredOrders.length !== 1 ? "s" : ""} na busca`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => fetchOrders(page)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.55rem 1rem",
              fontSize: "0.7rem",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "0.03em",
              background: "#ffffff",
              color: "#9ca3af",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.color = "#111111"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#9ca3af"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Atualizar
          </button>
          <button
            onClick={handleSyncR2}
            disabled={syncing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.55rem 1rem",
              fontSize: "0.7rem",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "0.03em",
              background: "#ffffff",
              color: syncing ? "#d1d5db" : "#9ca3af",
              border: `1px solid ${syncing ? "#e5e7eb" : "#e5e7eb"}`,
              borderRadius: 6,
              cursor: syncing ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { if (!syncing) { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.color = "#111111"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = syncing ? "#d1d5db" : "#9ca3af"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: syncing ? "spin 1s linear infinite" : "none" }}
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {syncing ? "Sincronizando..." : "Sincronizar R2"}
          </button>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div style={{
          background: syncResult.errors > 0 ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${syncResult.errors > 0 ? "#fecaca" : "#bbf7d0"}`,
          borderRadius: 8,
          padding: "0.85rem 1rem",
          fontSize: "0.75rem",
          color: syncResult.errors > 0 ? "#991b1b" : "#166534",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {syncResult.errors > 0 ? (
              <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>
            ) : (
              <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
            )}
          </svg>
          <span>
            {syncResult.synced > 0 && `${syncResult.synced} pedido(s) enviado(s) para o R2. `}
            {syncResult.alreadyExists > 0 && `${syncResult.alreadyExists} já estavam no R2. `}
            {syncResult.errors > 0 && `${syncResult.errors} erro(s). `}
            {syncResult.synced === 0 && syncResult.errors === 0 && "Todos os pedidos já estão no R2!"}
          </span>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "0.75rem",
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "1.1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            transition: "border-color 0.15s ease",
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = stat.accent}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: stat.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: "1.15rem", fontWeight: 400, color: "#111111", letterSpacing: "0.02em" }}>
                {stat.value}
              </p>
              <p style={{ fontSize: "0.6rem", color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Date Selector */}
      <DateSelector value={dateRange} onChange={setDateRange} />

      {/* Search + Filters */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, email, produto, ID ou rastreio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem 0.6rem 2.25rem",
              fontSize: "0.75rem",
              fontFamily: "'Space Grotesk', sans-serif",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              color: "#111111",
              outline: "none",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "#111111"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* Status Tabs */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0.4rem 0.85rem",
                fontSize: "0.65rem",
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.03em",
                background: statusFilter === tab.key ? "#f3f4f6" : "transparent",
                color: statusFilter === tab.key ? "#111111" : "#6b7280",
                border: `1px solid ${statusFilter === tab.key ? "#e5e7eb" : "transparent"}`,
                borderRadius: 5,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (statusFilter !== tab.key) {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.color = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (statusFilter !== tab.key) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              {tab.dot && (
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: tab.dot,
                  display: "inline-block",
                  flexShrink: 0,
                }} />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "2rem 1.25rem" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                display: "flex",
                gap: "1rem",
                padding: "0.85rem 0",
                borderBottom: "1px solid #f3f4f6",
                opacity: 1 - i * 0.15,
              }}>
                {[60, 140, 100, 80, 70, 120, 90, 70].map((w, j) => (
                  <div key={j} style={{
                    width: w,
                    height: 12,
                    borderRadius: 3,
                    background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }} />
                ))}
              </div>
            ))}
            <style jsx>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <OrdersTable orders={filteredOrders} onUpdateTracking={handleUpdateTracking} />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}>
          <button
            onClick={() => fetchOrders(page - 1)}
            disabled={page <= 1}
            style={{
              padding: "0.5rem 0.85rem",
              fontSize: "0.7rem",
              fontFamily: "'Space Grotesk', sans-serif",
              background: "#ffffff",
              color: page <= 1 ? "#d1d5db" : "#9ca3af",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              cursor: page <= 1 ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            ← Anterior
          </button>

          <div style={{ display: "flex", gap: 2, margin: "0 0.5rem" }}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchOrders(pageNum)}
                  style={{
                    width: 34,
                    height: 34,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: page === pageNum ? "#f3f4f6" : "transparent",
                    color: page === pageNum ? "#111111" : "#6b7280",
                    border: `1px solid ${page === pageNum ? "#e5e7eb" : "transparent"}`,
                    borderRadius: 5,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (page !== pageNum) {
                      e.currentTarget.style.background = "#f9fafb";
                      e.currentTarget.style.color = "#9ca3af";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== pageNum) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#6b7280";
                    }
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => fetchOrders(page + 1)}
            disabled={page >= totalPages}
            style={{
              padding: "0.5rem 0.85rem",
              fontSize: "0.7rem",
              fontFamily: "'Space Grotesk', sans-serif",
              background: "#ffffff",
              color: page >= totalPages ? "#d1d5db" : "#9ca3af",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
