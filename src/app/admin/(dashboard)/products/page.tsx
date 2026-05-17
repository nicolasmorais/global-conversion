"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  slug: string;
  name?: string;
  description?: string | null;
  locale?: string;
  currency?: string;
  price?: number;
  stripe_price_id?: string | null;
  image_url?: string | null;
  active: boolean;
  created_at: string;
  // Legacy fields for old products
  translations?: { locale: string; name: string; description: string | null }[];
}

const localeOptions = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
];

const currencyOptions = [
  { code: "usd", label: "USD ($)", symbol: "$" },
  { code: "eur", label: "EUR (€)", symbol: "€" },
  { code: "brl", label: "BRL (R$)", symbol: "R$" },
];

interface FormData {
  slug: string;
  name: string;
  description: string;
  locale: string;
  currency: string;
  price: string;
  image_url: string;
}

const emptyForm: FormData = {
  slug: "",
  name: "",
  description: "",
  locale: "en",
  currency: "usd",
  price: "",
  image_url: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setError("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function openEdit(product: Product) {
    setForm({
      slug: product.slug,
      name: product.name || product.slug,
      description: product.description || "",
      locale: product.locale || "en",
      currency: product.currency || "usd",
      price: String(product.price || 0),
      image_url: product.image_url || "",
    });
    setEditingId(product.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = {
        slug: form.slug,
        name: form.name,
        description: form.description || undefined,
        locale: form.locale,
        currency: form.currency,
        price: Number(form.price),
        image_url: form.image_url || null,
      };

      const url = editingId ? `/api/products/${editingId}` : "/api/products";
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
      setForm(emptyForm);
      setEditingId(null);
      fetchProducts();
    } catch {
      setError("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
    } catch {
      setError("Erro ao deletar produto");
    }
  }

  function copyCheckoutLink(product: Product) {
    const locale = product.locale || "en";
    const currency = product.currency || "usd";
    const url = `${window.location.origin}/checkout?id=${product.id}&lang=${locale}&currency=${currency}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(product.id);
    setTimeout(() => setCopiedLink(null), 2000);
  }

  function formatPrice(cents: number, currency: string) {
    const sym = currencyOptions.find((c) => c.code === currency)?.symbol || "$";
    return `${sym}${(cents / 100).toFixed(2)}`;
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
            Produtos
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.15rem 0 0 0", letterSpacing: "0.02em" }}>
            {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}
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
          Novo Produto
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
            {editingId ? "Editar Produto" : "Novo Produto"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Nome */}
            <div>
              <label style={labelStyle}>Nome do Produto</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Kit Premium"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            {/* Slug + Idioma + Moeda */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Slug (URL)</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="kit-premium"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label style={labelStyle}>Idioma</label>
                <select
                  value={form.locale}
                  onChange={(e) => setForm({ ...form, locale: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                >
                  {localeOptions.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.label} ({loc.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Moeda</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                >
                  {currencyOptions.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preço + Imagem */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Preço (centavos)</label>
                <input
                  required
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="4999"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label style={labelStyle}>URL da Imagem (opcional)</label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label style={labelStyle}>Descrição (opcional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrição do produto..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical" as const }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            {/* Actions */}
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
                  color: "#ffffff",
                  letterSpacing: "0.02em",
                  opacity: saving ? 0.7 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar Produto"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
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
                    width: "60px",
                    height: "60px",
                    borderRadius: "8px",
                    background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ height: "14px", width: "40%", borderRadius: "4px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginBottom: "0.4rem" }} />
                  <div style={{ height: "12px", width: "60%", borderRadius: "4px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
            </svg>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#111111", margin: "0 0 0.25rem 0" }}>Nenhum produto cadastrado</p>
          <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: 0 }}>Clique em &quot;Novo Produto&quot; para comecar</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {products.map((rawProduct) => {
            // Fallbacks para produtos antigos sem os novos campos
            const legacyName = rawProduct.translations?.[0]?.name;
            const product = {
              ...rawProduct,
              name: rawProduct.name || legacyName || rawProduct.slug,
              locale: rawProduct.locale || "en",
              currency: rawProduct.currency || "usd",
              price: rawProduct.price || 0,
            };
            return (
            <div
              key={product.id}
              style={{ ...cardStyle, animation: "fadeUp 0.3s ease forwards" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                {/* Image */}
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e5e7eb" }}
                  />
                ) : (
                  <div style={{ width: "64px", height: "64px", borderRadius: "8px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                    <p style={{ fontSize: "0.85rem", color: "#111111", margin: 0, fontWeight: 500 }}>
                      {product.name}
                    </p>
                    <span style={{ fontSize: "0.55rem", color: "#111111", background: "#f3f4f6", padding: "0.1rem 0.4rem", borderRadius: "10px", letterSpacing: "0.04em" }}>
                      {product.slug}
                    </span>
                  </div>
                  {product.description && (
                    <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: "0 0 0.3rem 0" }}>
                      {product.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.7rem", color: "#9ca3af", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 500, color: "#111111" }}>
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {/* Locale badge */}
                    <span
                      style={{
                        fontSize: "0.55rem",
                        fontWeight: 600,
                        color: "#ffffff",
                        background: "#111111",
                        padding: "0.1rem 0.35rem",
                        borderRadius: "3px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {product.locale.toUpperCase()}
                    </span>
                    {/* Currency badge */}
                    <span
                      style={{
                        fontSize: "0.55rem",
                        fontWeight: 600,
                        color: "#6b7280",
                        background: "#f3f4f6",
                        padding: "0.1rem 0.35rem",
                        borderRadius: "3px",
                        letterSpacing: "0.04em",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      {product.currency.toUpperCase()}
                    </span>
                    <span style={{ color: product.active ? "#16a34a" : "#dc2626" }}>
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                  <button
                    onClick={() => copyCheckoutLink(product)}
                    title="Copiar link de checkout"
                    style={{
                      background: copiedLink === product.id ? "rgba(22,163,74,0.06)" : "#ffffff",
                      border: `1px solid ${copiedLink === product.id ? "rgba(22,163,74,0.2)" : "#e5e7eb"}`,
                      borderRadius: "6px",
                      padding: "0.35rem 0.5rem",
                      cursor: "pointer",
                      color: copiedLink === product.id ? "#16a34a" : "#9ca3af",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (copiedLink !== product.id) {
                        e.currentTarget.style.borderColor = "#111111";
                        e.currentTarget.style.color = "#111111";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copiedLink !== product.id) {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.color = "#9ca3af";
                      }
                    }}
                  >
                    {copiedLink === product.id ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(product)}
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
                    onClick={() => handleDelete(product.id)}
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

              {/* Checkout Link */}
              <div
                style={{
                  marginTop: "0.75rem",
                  padding: "0.5rem 0.75rem",
                  background: "#f3f4f6",
                  borderRadius: "6px",
                  fontSize: "0.6rem",
                  color: "#6b7280",
                }}
              >
                <span>
                  Checkout:{" "}
                  <code style={{ color: "#111111", fontSize: "0.6rem" }}>
                    /checkout?id={product.id}&lang={product.locale}&currency={product.currency}
                  </code>
                </span>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
