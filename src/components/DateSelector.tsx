"use client";

import { useState } from "react";

export type DateRange = {
  start: string;
  end: string;
  label: string;
};

interface DateSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets: { label: string; getRange: () => DateRange }[] = [
  {
    label: "Hoje",
    getRange: () => {
      const today = new Date().toISOString().split("T")[0];
      return { start: today, end: today, label: "Hoje" };
    },
  },
  {
    label: "Ontem",
    getRange: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterday = d.toISOString().split("T")[0];
      return { start: yesterday, end: yesterday, label: "Ontem" };
    },
  },
  {
    label: "Últimos 7 dias",
    getRange: () => {
      const end = new Date().toISOString().split("T")[0];
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const start = d.toISOString().split("T")[0];
      return { start, end, label: "Últimos 7 dias" };
    },
  },
  {
    label: "Últimos 30 dias",
    getRange: () => {
      const end = new Date().toISOString().split("T")[0];
      const d = new Date();
      d.setDate(d.getDate() - 30);
      const start = d.toISOString().split("T")[0];
      return { start, end, label: "Últimos 30 dias" };
    },
  },
  {
    label: "Este mês",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const end = now.toISOString().split("T")[0];
      return { start, end, label: "Este mês" };
    },
  },
  {
    label: "Mês passado",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
      return { start, end, label: "Mês passado" };
    },
  },
  {
    label: "Todo período",
    getRange: () => ({
      start: "2020-01-01",
      end: "2099-12-31",
      label: "Todo período",
    }),
  },
];

export default function DateSelector({ value, onChange }: DateSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);

  const activePreset = presets.find((p) => {
    const range = p.getRange();
    return range.start === value.start && range.end === value.end;
  });

  return (
    <div className="date-selector">
      <style jsx>{`
        .date-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .date-desktop {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .date-mobile {
          display: none;
        }
        .date-select {
          padding: 0.35rem 0.75rem;
          font-size: 0.7rem;
          font-weight: 500;
          color: #111111;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.6rem center;
          padding-right: 1.8rem;
          font-family: 'Space Grotesk', sans-serif;
        }
        .custom-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 0.25rem;
        }
        @media (max-width: 640px) {
          .date-desktop { display: none; }
          .date-mobile { display: block; }
          .custom-inputs {
            margin-left: 0;
            margin-top: 0.5rem;
            flex-wrap: wrap;
          }
          .date-selector {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* Desktop: horizontal buttons */}
      <div className="date-desktop">
        {presets.map((preset) => {
          const range = preset.getRange();
          const isActive = range.start === value.start && range.end === value.end;
          return (
            <button
              key={preset.label}
              onClick={() => onChange(range)}
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.7rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#fff" : "#6b7280",
                background: isActive ? "#111111" : "transparent",
                border: `1px solid ${isActive ? "#111111" : "#e5e7eb"}`,
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "#111111";
                  e.currentTarget.style.color = "#111111";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          onClick={() => setShowCustom(!showCustom)}
          style={{
            padding: "0.35rem 0.75rem",
            fontSize: "0.7rem",
            fontWeight: showCustom ? 600 : 500,
            color: showCustom ? "#fff" : "#6b7280",
            background: showCustom ? "#111111" : "transparent",
            border: `1px solid ${showCustom ? "#111111" : "#e5e7eb"}`,
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          Personalizado
        </button>
      </div>

      {/* Mobile: dropdown select */}
      <div className="date-mobile">
        <select
          className="date-select"
          value={activePreset ? activePreset.label : "Personalizado"}
          onChange={(e) => {
            const preset = presets.find((p) => p.label === e.target.value);
            if (preset) {
              setShowCustom(false);
              onChange(preset.getRange());
            } else {
              setShowCustom(true);
            }
          }}
        >
          {presets.map((p) => (
            <option key={p.label} value={p.label}>{p.label}</option>
          ))}
          <option value="Personalizado">Personalizado</option>
        </select>
      </div>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="custom-inputs">
          <input
            type="date"
            value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value, label: "Personalizado" })}
            style={{
              padding: "0.3rem 0.5rem",
              fontSize: "0.7rem",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              outline: "none",
              color: "#111111",
            }}
          />
          <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>até</span>
          <input
            type="date"
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value, label: "Personalizado" })}
            style={{
              padding: "0.3rem 0.5rem",
              fontSize: "0.7rem",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              outline: "none",
              color: "#111111",
            }}
          />
        </div>
      )}

      {/* Current filter label (desktop only, when custom range not matching presets) */}
      {!activePreset && !showCustom && (
        <span className="date-desktop" style={{ fontSize: "0.65rem", color: "#9ca3af", marginLeft: "0.25rem" }}>
          {value.label}
        </span>
      )}
    </div>
  );
}

export function filterByDateRange<T extends { created_at: string }>(orders: T[], range: DateRange): T[] {
  const startDate = new Date(range.start + "T00:00:00");
  const endDate = new Date(range.end + "T23:59:59");

  return orders.filter((order) => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startDate && orderDate <= endDate;
  });
}
