"use client";

import { useState, useEffect } from "react";

interface Shipping {
  id: string;
  country: string;
  price: number;
  days_min: number;
  days_max: number;
  active: boolean;
  created_at: string;
}

const COUNTRIES = [
  { code: "GLOBAL", name: "Global (todos os paises)", flag: "un" },
  { code: "BR", name: "Brasil", flag: "br" },
  { code: "US", name: "Estados Unidos", flag: "us" },
  { code: "PT", name: "Portugal", flag: "pt" },
  { code: "GB", name: "Reino Unido", flag: "gb" },
  { code: "DE", name: "Alemanha", flag: "de" },
  { code: "FR", name: "França", flag: "fr" },
  { code: "ES", name: "Espanha", flag: "es" },
  { code: "IT", name: "Itália", flag: "it" },
  { code: "JP", name: "Japão", flag: "jp" },
  { code: "KR", name: "Coreia do Sul", flag: "kr" },
  { code: "AU", name: "Austrália", flag: "au" },
  { code: "CA", name: "Canadá", flag: "ca" },
  { code: "MX", name: "México", flag: "mx" },
  { code: "AR", name: "Argentina", flag: "ar" },
  { code: "CO", name: "Colômbia", flag: "co" },
  { code: "CL", name: "Chile", flag: "cl" },
  { code: "PE", name: "Peru", flag: "pe" },
  { code: "NL", name: "Países Baixos", flag: "nl" },
  { code: "SE", name: "Suécia", flag: "se" },
  { code: "CH", name: "Suíça", flag: "ch" },
  { code: "AE", name: "Emirados Árabes", flag: "ae" },
  { code: "SG", name: "Singapura", flag: "sg" },
  { code: "IN", name: "Índia", flag: "in" },
  { code: "CN", name: "China", flag: "cn" },
  { code: "IE", name: "Irlanda", flag: "ie" },
];

function getCountryName(code: string) {
  return COUNTRIES.find((c) => c.code === code)?.name || code;
}

function getCountryFlag(code: string) {
  return COUNTRIES.find((c) => c.code === code)?.flag || code.toLowerCase();
}

export default function ShippingPage() {
  const [shippings, setShippings] = useState<Shipping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ country: "BR", price: "", days_min: "", days_max: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShippings();
  }, []);

  async function fetchShippings() {
    try {
      const res = await fetch("/api/shipping?admin=true");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setShippings(data.shippings || []);
    } catch {
      setError("Erro ao carregar fretes");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setForm({ country: "BR", price: "", days_min: "", days_max: "" });
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function openEdit(shipping: Shipping) {
    setForm({
      country: shipping.country,
      price: String(shipping.price),
      days_min: String(shipping.days_min),
      days_max: String(shipping.days_max),
    });
    setEditingId(shipping.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = {
        country: form.country,
        price: Number(form.price),
        days_min: Number(form.days_min),
        days_max: Number(form.days_max),
      };

      const url = editingId ? `/api/shipping/${editingId}` : "/api/shipping";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar");
        return;
      }

      setShowForm(false);
      setEditingId(null);
      fetchShippings();
    } catch {
      setError("Erro ao salvar frete");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar este frete?")) return;
    try {
      const res = await fetch(`/api/shipping/${id}`, { method: "DELETE" });
      if (res.ok) fetchShippings();
    } catch {
      setError("Erro ao deletar frete");
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "1.1rem 1.25rem",
    transition: "border-color 0.15s ease",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.55rem 0.75rem",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#111111",
    background: "#f9fafb",
    outline: "none",
    transition: "border-color 0.15s ease",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.6rem",
    fontWeight: 400,
    color: "#9ca3af",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "0.3rem",
    display: "block",
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
            Fretes
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.15rem 0 0 0", letterSpacing: "0.02em" }}>
            {shippings.length} frete{shippings.length !== 1 ? "s" : ""} cadastrado{shippings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "0.45rem 0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.7rem",
            color: "#111111",
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.02em",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.borderColor = "#111111";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo Frete
        </button>
      </div>

      {error && (
        <div style={{ ...cardStyle, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.04)" }}>
          <p style={{ fontSize: "0.75rem", color: "#dc2626", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ ...cardStyle, animation: "fadeUp 0.3s ease forwards" }}>
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
            {editingId ? "Editar Frete" : "Novo Frete"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>País</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  style={{ ...inputStyle, appearance: "none" as const, cursor: "pointer" }}
                  disabled={!!editingId}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Preço (centavos)</label>
                <input
                  required
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="999"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label style={labelStyle}>Prazo mínimo (dias)</label>
                <input
                  required
                  type="number"
                  value={form.days_min}
                  onChange={(e) => setForm({ ...form, days_min: e.target.value })}
                  placeholder="5"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label style={labelStyle}>Prazo máximo (dias)</label>
                <input
                  required
                  type="number"
                  value={form.days_max}
                  onChange={(e) => setForm({ ...form, days_max: e.target.value })}
                  placeholder="10"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "#9ca3af",
                  letterSpacing: "0.02em",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#dc2626";
                  e.currentTarget.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.color = "#9ca3af";
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#111111",
                  border: "1px solid #111111",
                  borderRadius: "6px",
                  padding: "0.5rem 1.25rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "0.7rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "#ffffff",
                  letterSpacing: "0.02em",
                  opacity: saving ? 0.7 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar Frete"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shipping List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                ...cardStyle,
                opacity: 1 - i * 0.15,
              }}
            >
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ height: "14px", width: "30%", borderRadius: "4px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginBottom: "0.4rem" }} />
                  <div style={{ height: "12px", width: "50%", borderRadius: "4px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : shippings.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#111111", margin: "0 0 0.25rem 0" }}>Nenhum frete cadastrado</p>
          <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: 0 }}>Clique em &ldquo;Novo Frete&rdquo; para começar</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {shippings.map((shipping) => (
            <div
              key={shipping.id}
              style={{ ...cardStyle, animation: "fadeUp 0.3s ease forwards" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {/* Flag */}
                <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <img
                    src={`https://flagcdn.com/w40/${getCountryFlag(shipping.country)}.png`}
                    alt={shipping.country}
                    style={{ width: "28px", height: "20px", borderRadius: "2px", objectFit: "cover" }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                    <p style={{ fontSize: "0.85rem", color: "#111111", margin: 0, fontWeight: 500 }}>
                      {getCountryName(shipping.country)}
                    </p>
                    <span style={{ fontSize: "0.55rem", color: "#111111", background: "#f3f4f6", padding: "0.1rem 0.4rem", borderRadius: "10px", letterSpacing: "0.04em" }}>
                      {shipping.country}
                    </span>
                    <span style={{ fontSize: "0.55rem", color: shipping.active ? "#16a34a" : "#dc2626", background: shipping.active ? "rgba(22,163,74,0.06)" : "rgba(220,38,38,0.06)", padding: "0.1rem 0.4rem", borderRadius: "10px" }}>
                      {shipping.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.7rem", color: "#9ca3af" }}>
                    <span>Preço: <strong style={{ color: "#111111" }}>{(shipping.price / 100).toFixed(2)}</strong> centavos</span>
                    <span>Prazo: <strong style={{ color: "#111111" }}>{shipping.days_min}-{shipping.days_max} dias</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(shipping)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "0.35rem 0.5rem",
                      cursor: "pointer",
                      color: "#9ca3af",
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
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(shipping.id)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "0.35rem 0.5rem",
                      cursor: "pointer",
                      color: "#9ca3af",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#dc2626";
                      e.currentTarget.style.color = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.color = "#9ca3af";
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
