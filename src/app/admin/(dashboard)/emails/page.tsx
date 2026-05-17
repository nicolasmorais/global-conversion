"use client";

import { useState, useEffect } from "react";

interface EmailTemplate {
  id: string;
  type: string;
  locale: string;
  subject: string;
  html: string;
  updated_at: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  approved: { label: "Compra Aprovada", color: "#16a34a", bg: "rgba(22,163,74,0.06)", icon: "\u2713" },
  declined: { label: "Compra Recusada", color: "#dc2626", bg: "rgba(220,38,38,0.06)", icon: "\u2715" },
};

const LOCALE_LABELS: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "us" },
  es: { label: "Espa\u00f1ol", flag: "es" },
};

const VARIABLES = [
  { key: "{{customer_name}}", desc: "Nome do cliente" },
  { key: "{{product_name}}", desc: "Nome do produto" },
  { key: "{{amount}}", desc: "Valor formatado (ex: $49.99)" },
  { key: "{{currency}}", desc: "Moeda (ex: USD)" },
  { key: "{{order_id}}", desc: "ID do pedido (8 chars)" },
  { key: "{{tracking_code}}", desc: "C\u00f3digo de rastreio" },
];

export default function EmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null); // "type_locale"
  const [form, setForm] = useState({ type: "", locale: "", subject: "", html: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/email-templates");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      setError("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  }

  function getTemplate(type: string, locale: string) {
    return templates.find((t) => t.type === type && t.locale === locale);
  }

  function openEdit(type: string, locale: string) {
    const template = getTemplate(type, locale);
    if (template) {
      setForm({ type, locale, subject: template.subject, html: template.html });
    } else {
      setForm({ type, locale, subject: "", html: "" });
    }
    setEditingKey(`${type}_${locale}`);
    setError("");
    setSuccess("");
    setShowPreview(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao salvar");
        return;
      }

      setSuccess("Template salvo com sucesso!");
      setEditingKey(null);
      fetchTemplates();
    } catch {
      setError("Erro ao salvar template");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest(type: string, locale: string) {
    if (!testEmail) {
      setError("Informe um email para teste");
      return;
    }
    setSendingTest(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail, type, locale }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Email de teste (${locale.toUpperCase()}) enviado para ${testEmail}`);
      } else {
        setError(data.error || "Erro ao enviar teste");
      }
    } catch {
      setError("Erro ao enviar email de teste");
    } finally {
      setSendingTest(false);
    }
  }

  function openPreview(html: string) {
    const preview = html
      .replace(/\{\{customer_name\}\}/g, "Jo\u00e3o da Silva")
      .replace(/\{\{product_name\}\}/g, "Produto Premium")
      .replace(/\{\{amount\}\}/g, "$49.99")
      .replace(/\{\{currency\}\}/g, "USD")
      .replace(/\{\{order_id\}\}/g, "ABC12345")
      .replace(/\{\{tracking_code\}\}/g, "BR123456789");
    setPreviewHtml(preview);
    setShowPreview(true);
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
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
          Emails
        </h1>
        <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.15rem 0 0 0", letterSpacing: "0.02em" }}>
          Templates de email por idioma
        </p>
      </div>

      {error && (
        <div style={{ ...cardStyle, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.04)" }}>
          <p style={{ fontSize: "0.75rem", color: "#dc2626", margin: 0 }}>{error}</p>
        </div>
      )}

      {success && (
        <div style={{ ...cardStyle, border: "1px solid rgba(22,163,74,0.2)", background: "rgba(22,163,74,0.04)" }}>
          <p style={{ fontSize: "0.75rem", color: "#16a34a", margin: 0 }}>{success}</p>
        </div>
      )}

      {/* Test Email */}
      <div style={{ ...cardStyle, display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Email para teste</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="seu@email.com"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          />
        </div>
      </div>

      {/* Templates by Type */}
      {loading ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Carregando...</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {Object.entries(TYPE_LABELS).map(([type, meta]) => (
            <div key={type} style={{ ...cardStyle, animation: "fadeUp 0.3s ease forwards" }}>
              {/* Type Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: meta.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    color: meta.color,
                    fontWeight: 700,
                  }}
                >
                  {meta.icon}
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", color: "#111111", margin: 0, fontWeight: 600 }}>{meta.label}</p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280", margin: "0.1rem 0 0 0" }}>
                    Template enviado ao cliente quando o pagamento é {type === "approved" ? "aprovado" : "recusado"}
                  </p>
                </div>
              </div>

              {/* Locale Tabs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {Object.entries(LOCALE_LABELS).map(([locale, localeMeta]) => {
                  const template = getTemplate(type, locale);
                  const editKey = `${type}_${locale}`;
                  const isEditing = editingKey === editKey;

                  return (
                    <div
                      key={locale}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      {/* Locale Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.75rem 1rem",
                          background: "#f9fafb",
                          borderBottom: isEditing ? "1px solid #e5e7eb" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <img
                            src={`https://flagcdn.com/w20/${localeMeta.flag}.png`}
                            alt={locale}
                            style={{ width: "18px", height: "13px", borderRadius: "2px" }}
                          />
                          <span style={{ fontSize: "0.75rem", color: "#111111", fontWeight: 500 }}>
                            {localeMeta.label}
                          </span>
                          {template && (
                            <span style={{ fontSize: "0.6rem", color: "#6b7280" }}>
                              — {template.subject.substring(0, 40)}...
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          <button
                            onClick={() => handleSendTest(type, locale)}
                            disabled={sendingTest}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "4px",
                              padding: "0.25rem 0.5rem",
                              cursor: "pointer",
                              fontSize: "0.6rem",
                              fontFamily: "'Space Grotesk', sans-serif",
                              color: "#9ca3af",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#16a34a";
                              e.currentTarget.style.color = "#16a34a";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e5e7eb";
                              e.currentTarget.style.color = "#9ca3af";
                            }}
                          >
                            Teste
                          </button>
                          {template && (
                            <button
                              onClick={() => openPreview(template.html)}
                              style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "4px",
                                padding: "0.25rem 0.5rem",
                                cursor: "pointer",
                                fontSize: "0.6rem",
                                fontFamily: "'Space Grotesk', sans-serif",
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
                              Preview
                            </button>
                          )}
                          <button
                            onClick={() => isEditing ? setEditingKey(null) : openEdit(type, locale)}
                            style={{
                              background: isEditing ? "#f3f4f6" : "#ffffff",
                              border: `1px solid ${isEditing ? "#111111" : "#e5e7eb"}`,
                              borderRadius: "4px",
                              padding: "0.25rem 0.5rem",
                              cursor: "pointer",
                              fontSize: "0.6rem",
                              fontFamily: "'Space Grotesk', sans-serif",
                              color: isEditing ? "#111111" : "#9ca3af",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isEditing) {
                                e.currentTarget.style.borderColor = "#111111";
                                e.currentTarget.style.color = "#111111";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isEditing) {
                                e.currentTarget.style.borderColor = "#e5e7eb";
                                e.currentTarget.style.color = "#9ca3af";
                              }
                            }}
                          >
                            {isEditing ? "Fechar" : "Editar"}
                          </button>
                        </div>
                      </div>

                      {/* Edit Form */}
                      {isEditing && (
                        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
                          <div>
                            <label style={labelStyle}>Assunto do Email</label>
                            <input
                              required
                              value={form.subject}
                              onChange={(e) => setForm({ ...form, subject: e.target.value })}
                              style={inputStyle}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                            />
                          </div>

                          {/* Variables Reference */}
                          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "0.6rem" }}>
                            <p style={{ ...labelStyle, marginBottom: "0.3rem" }}>Variáveis disponíveis</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                              {VARIABLES.map((v) => (
                                <button
                                  key={v.key}
                                  type="button"
                                  onClick={() => {
                                    const textarea = document.querySelector(`textarea[data-key="${editKey}"]`) as HTMLTextAreaElement;
                                    if (textarea) {
                                      const start = textarea.selectionStart;
                                      const end = textarea.selectionEnd;
                                      const newValue = form.html.substring(0, start) + v.key + form.html.substring(end);
                                      setForm({ ...form, html: newValue });
                                    }
                                  }}
                                  title={v.desc}
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "3px",
                                    padding: "0.15rem 0.3rem",
                                    fontSize: "0.55rem",
                                    color: "#111111",
                                    cursor: "pointer",
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    transition: "all 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
                                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                                >
                                  {v.key}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label style={labelStyle}>HTML do Email</label>
                            <textarea
                              required
                              data-key={editKey}
                              value={form.html}
                              onChange={(e) => setForm({ ...form, html: e.target.value })}
                              rows={12}
                              style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "monospace", fontSize: "0.65rem", lineHeight: 1.5 }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                            />
                          </div>

                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => openPreview(form.html)}
                              style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                padding: "0.4rem 0.85rem",
                                cursor: "pointer",
                                fontSize: "0.65rem",
                                fontFamily: "'Space Grotesk', sans-serif",
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
                              Preview
                            </button>
                            <button
                              type="submit"
                              disabled={saving}
                              style={{
                                background: "#111111",
                                border: "1px solid #111111",
                                borderRadius: "6px",
                                padding: "0.4rem 1rem",
                                cursor: saving ? "not-allowed" : "pointer",
                                fontSize: "0.65rem",
                                fontFamily: "'Space Grotesk', sans-serif",
                                color: "#ffffff",
                                letterSpacing: "0.02em",
                                opacity: saving ? 0.7 : 1,
                                transition: "all 0.15s ease",
                              }}
                            >
                              {saving ? "Salvando..." : "Salvar"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.25rem",
                borderBottom: "1px solid #e5e7eb",
                position: "sticky",
                top: 0,
                background: "#ffffff",
                zIndex: 1,
              }}
            >
              <p style={{ fontSize: "0.85rem", color: "#111111", margin: 0, fontWeight: 500 }}>Preview do Email</p>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "1.2rem",
                  padding: "0.25rem",
                }}
              >
                \u2715
              </button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}
