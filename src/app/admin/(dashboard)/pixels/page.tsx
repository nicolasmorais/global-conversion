"use client";

import { useState, useEffect } from "react";

interface Pixel {
  id: string;
  name: string;
  pixel_id: string;
  platform: string;
  active: boolean;
  created_at: string;
  _count: { products: number };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  locale: string;
  currency: string;
}

export default function PixelsPage() {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPixel, setEditingPixel] = useState<Pixel | null>(null);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [assignedProducts, setAssignedProducts] = useState<string[]>([]);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPixelId, setFormPixelId] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [pixelsRes, productsRes] = await Promise.all([
        fetch("/api/pixels"),
        fetch("/api/products"),
      ]);
      if (pixelsRes.status === 401 || productsRes.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const pixelsData = await pixelsRes.json();
      const productsData = await productsRes.json();
      setPixels(pixelsData.pixels || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingPixel(null);
    setFormName("");
    setFormPixelId("");
    setFormActive(true);
    setShowModal(true);
  }

  function openEdit(pixel: Pixel) {
    setEditingPixel(pixel);
    setFormName(pixel.name);
    setFormPixelId(pixel.pixel_id);
    setFormActive(pixel.active);
    setShowModal(true);
  }

  async function handleSave() {
    if (!formName.trim() || !formPixelId.trim()) return;
    setSaving(true);
    try {
      const url = editingPixel ? `/api/pixels/${editingPixel.id}` : "/api/pixels";
      const method = editingPixel ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          pixel_id: formPixelId.trim(),
          active: formActive,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        loadData();
      }
    } catch (error) {
      console.error("Erro ao salvar pixel:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este pixel?")) return;
    try {
      await fetch(`/api/pixels/${id}`, { method: "DELETE" });
      loadData();
    } catch (error) {
      console.error("Erro ao deletar pixel:", error);
    }
  }

  async function openAssign(pixelId: string) {
    setShowAssign(pixelId);
    try {
      const res = await fetch(`/api/pixels/${pixelId}/assign`);
      const data = await res.json();
      setAssignedProducts(data.products?.map((p: Product) => p.id) || []);
    } catch {
      setAssignedProducts([]);
    }
  }

  async function handleAssign() {
    if (!showAssign) return;
    setSaving(true);
    try {
      await fetch(`/api/pixels/${showAssign}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_ids: assignedProducts }),
      });
      setShowAssign(null);
      loadData();
    } catch (error) {
      console.error("Erro ao vincular produtos:", error);
    } finally {
      setSaving(false);
    }
  }

  function toggleProduct(productId: string) {
    setAssignedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "1.25rem",
    transition: "border-color 0.15s ease",
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", padding: "2.5rem", textAlign: "center", color: "#9ca3af" }}>
        Carregando pixels...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .pixel-card {
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
        }
        .pixel-card:nth-child(1) { animation-delay: 0s; }
        .pixel-card:nth-child(2) { animation-delay: 0.08s; }
        .pixel-card:nth-child(3) { animation-delay: 0.16s; }
        .pixel-card:nth-child(4) { animation-delay: 0.24s; }
        .pixel-card:nth-child(5) { animation-delay: 0.32s; }
        .btn-hover {
          transition: all 0.15s ease;
        }
        .btn-hover:hover {
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #000000 !important;
        }
        .modal-overlay {
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          animation: fadeUp 0.3s ease;
        }
        input:focus, select:focus {
          border-color: #111111 !important;
          box-shadow: 0 0 0 3px rgba(17,17,17,0.06);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#111111",
            letterSpacing: "-0.02em",
            margin: 0,
          }}>
            Pixels
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
            Gerencie pixels de rastreamento por checkout
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-hover"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: "#111111",
            border: "1px solid #111111",
            borderRadius: "8px",
            padding: "0.6rem 1.25rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Pixel
        </button>
      </div>

      {/* Pixel List */}
      {pixels.length === 0 ? (
        <div style={{
          ...cardStyle,
          textAlign: "center",
          padding: "3rem",
          color: "#9ca3af",
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem" }}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <p style={{ fontSize: "0.9rem", fontWeight: 600, margin: "0 0 0.25rem 0" }}>Nenhum pixel cadastrado</p>
          <p style={{ fontSize: "0.8rem", margin: 0 }}>Clique em &quot;Novo Pixel&quot; para começar</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {pixels.map((pixel) => (
            <div key={pixel.id} className="pixel-card" style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: pixel.active ? "#f0fdf4" : "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={pixel.active ? "#16a34a" : "#9ca3af"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111111", margin: 0 }}>
                      {pixel.name}
                    </h3>
                    <span style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: 12,
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      background: pixel.active ? "#dcfce7" : "#f3f4f6",
                      color: pixel.active ? "#166534" : "#6b7280",
                    }}>
                      {pixel.active ? "Ativo" : "Inativo"}
                    </span>
                    <span style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: 12,
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      background: "#f3f4f6",
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}>
                      {pixel.platform}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.15rem 0 0 0", fontFamily: "'Space Grotesk', monospace" }}>
                    ID: {pixel.pixel_id}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", margin: "0.15rem 0 0 0" }}>
                    {pixel._count.products} checkout{pixel._count.products !== 1 ? "s" : ""} vinculado{pixel._count.products !== 1 ? "s" : ""}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button
                    onClick={() => openAssign(pixel.id)}
                    style={{
                      padding: "0.5rem 0.85rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: "#374151",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Checkouts
                  </button>
                  <button
                    onClick={() => openEdit(pixel)}
                    style={{
                      padding: "0.5rem 0.85rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: "#374151",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(pixel.id)}
                    style={{
                      padding: "0.5rem 0.85rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: "#991b1b",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="modal-content"
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <h2 style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#111111",
              margin: "0 0 1.25rem 0",
            }}>
              {editingPixel ? "Editar Pixel" : "Novo Pixel"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.35rem" }}>
                  Nome
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Taboola Loja Principal"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    fontSize: "0.8rem",
                    color: "#111111",
                    outline: "none",
                    fontFamily: "'Space Grotesk', sans-serif",
                    transition: "border-color 0.15s ease",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.35rem" }}>
                  Pixel ID
                </label>
                <input
                  type="text"
                  value={formPixelId}
                  onChange={(e) => setFormPixelId(e.target.value)}
                  placeholder="Ex: 1234567890"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    fontSize: "0.8rem",
                    color: "#111111",
                    outline: "none",
                    fontFamily: "'Space Grotesk', monospace",
                    transition: "border-color 0.15s ease",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setFormActive(!formActive)}
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: formActive ? "#16a34a" : "#d1d5db",
                    position: "relative",
                    transition: "background 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    position: "absolute",
                    top: "3px",
                    left: formActive ? "23px" : "3px",
                    transition: "left 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }} />
                </button>
                <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500 }}>
                  {formActive ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "0.6rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#374151",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim() || !formPixelId.trim()}
                className="btn-hover"
                style={{
                  padding: "0.6rem 1.25rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: saving || !formName.trim() || !formPixelId.trim() ? "#d1d5db" : "#111111",
                  border: "1px solid transparent",
                  borderRadius: 6,
                  cursor: saving || !formName.trim() || !formPixelId.trim() ? "not-allowed" : "pointer",
                  color: "#ffffff",
                  fontFamily: "'Space Grotesk', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {saving && (
                  <div style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#ffffff",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }} />
                )}
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Products Modal */}
      {showAssign && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAssign(null); }}
        >
          <div
            className="modal-content"
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <h2 style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#111111",
              margin: "0 0 0.25rem 0",
            }}>
              Vincular Checkouts
            </h2>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0 0 1rem 0" }}>
              Selecione os checkouts onde este pixel será ativado
            </p>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {products.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "center", padding: "2rem" }}>
                  Nenhum produto cadastrado
                </p>
              ) : (
                products.map((product) => {
                  const isSelected = assignedProducts.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        borderRadius: 8,
                        border: `1.5px solid ${isSelected ? "#111111" : "#e5e7eb"}`,
                        background: isSelected ? "#f9fafb" : "#ffffff",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: 4,
                        border: `2px solid ${isSelected ? "#111111" : "#d1d5db"}`,
                        background: isSelected ? "#111111" : "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease",
                      }}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111111", margin: 0 }}>
                          {product.name}
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: "0.1rem 0 0 0" }}>
                          {product.slug} &middot; {product.locale.toUpperCase()} &middot; {product.currency.toUpperCase()}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #f3f4f6" }}>
              <button
                onClick={() => setShowAssign(null)}
                style={{
                  padding: "0.6rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#374151",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAssign}
                disabled={saving}
                className="btn-hover"
                style={{
                  padding: "0.6rem 1.25rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: saving ? "#d1d5db" : "#111111",
                  border: "1px solid transparent",
                  borderRadius: 6,
                  cursor: saving ? "not-allowed" : "pointer",
                  color: "#ffffff",
                  fontFamily: "'Space Grotesk', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {saving && (
                  <div style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#ffffff",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }} />
                )}
                {saving ? "Salvando..." : "Salvar Vinculos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
