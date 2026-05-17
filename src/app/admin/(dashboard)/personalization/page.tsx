"use client";

import { useState, useEffect } from "react";

export default function PersonalizationPage() {
  const [buttonColor, setButtonColor] = useState("#111111");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/checkout-settings");
        const data = await res.json();
        if (data.button_color) setButtonColor(data.button_color);
        if (data.logo_url) setLogoUrl(data.logo_url);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/checkout-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ button_color: buttonColor, logo_url: logoUrl }),
      });
      if (res.ok) setSaved(true);
    } catch {} finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "1.5rem",
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "0.65rem 0.85rem",
    fontSize: "0.8rem",
    color: "#111111",
    outline: "none",
    width: "100%",
    transition: "border-color 0.15s ease",
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                ...cardStyle,
                opacity: 1 - i * 0.2,
                animation: "fadeUp 0.5s ease forwards",
              }}
            >
              <div
                style={{
                  height: "14px",
                  width: "30%",
                  borderRadius: "4px",
                  background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  marginBottom: "1rem",
                }}
              />
              <div
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            </div>
          ))}
        </div>
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
        .card-anim {
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
        }
        .card-anim:nth-child(1) { animation-delay: 0s; }
        .card-anim:nth-child(2) { animation-delay: 0.08s; }
        .save-btn {
          transition: all 0.15s ease;
        }
        .save-btn:hover {
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #000000 !important;
        }
        input:focus {
          border-color: #111111 !important;
          box-shadow: 0 0 0 3px rgba(17,17,17,0.06);
        }
        input[type="color"] {
          cursor: pointer;
        }
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 2px;
        }
        input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 6px;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#111111",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Personalizacao
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
            Aparência do checkout
          </p>
        </div>
      </div>

      {/* Button Color Card */}
      <div className="card-anim" style={cardStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="2.5" />
              <path d="M17.08 8.36a2.49 2.49 0 01-.69 3.46l-8.97 6.17a2.49 2.49 0 01-3.46-.69 2.49 2.49 0 01.69-3.46l8.97-6.17a2.49 2.49 0 013.46.69z" />
              <circle cx="6" cy="18" r="2" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111111", margin: "0 0 0.15rem 0" }}>
              Cor do Botao
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
              Cor principal do botao de finalizar compra no checkout
            </p>
          </div>
        </div>

        <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <input
              type="color"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                padding: "3px",
              }}
            />
            <input
              type="text"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              style={{ ...inputStyle, width: "110px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem", letterSpacing: "0.02em" }}
              placeholder="#111111"
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Preview</span>
            <button
              style={{
                backgroundColor: buttonColor,
                color: "#ffffff",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                padding: "0.6rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                cursor: "default",
              }}
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>

      {/* Logo Card */}
      <div className="card-anim" style={cardStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111111", margin: "0 0 0.15rem 0" }}>
              Logo
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
              URL da logo exibida no checkout. Deixe vazio para usar o texto &quot;STORE&quot;
            </p>
          </div>
        </div>

        <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              style={inputStyle}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Preview</span>
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "80px",
                minHeight: "32px",
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ height: "20px", objectFit: "contain" }} />
              ) : (
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#111111" }}>STORE</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="save-btn"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: "#111111",
            border: "1px solid #111111",
            borderRadius: "8px",
            padding: "0.6rem 1.25rem",
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#ffffff",
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving && (
            <div
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#ffffff",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
          )}
          {saving ? "Salvando..." : "Salvar Alteracoes"}
        </button>

        {saved && (
          <span
            style={{
              fontSize: "0.8rem",
              color: "#16a34a",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Salvo com sucesso
          </span>
        )}
      </div>
    </div>
  );
}
