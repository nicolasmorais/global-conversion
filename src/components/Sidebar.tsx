"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path ? 'active' : '';

  return (
    <aside className="sidebar">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style jsx>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .sidebar {
          font-family: 'Space Grotesk', sans-serif;
          width: 260px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 50;
          overflow: hidden;
        }

        /* ── BRAND ── */
        .sidebar-brand {
          padding: 1.5rem 1.5rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          opacity: 0;
          animation: fadeRight 0.5s ease 0.1s forwards;
        }


        /* ── SECTIONS ── */
        .sidebar-section {
          padding: 1.25rem 1.5rem 0.5rem;
          position: relative;
          z-index: 1;
        }

        .section-label {
          font-size: 0.55rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 0.75rem;
          padding-left: 0.1rem;
          opacity: 0;
          animation: fadeRight 0.4s ease 0.25s forwards;
        }

        .section-divider {
          width: 20px;
          height: 1px;
          background: #111111;
          margin-bottom: 0.75rem;
          opacity: 0;
          animation: scaleXAnim 0.4s ease 0.3s forwards;
          transform-origin: left;
        }

        /* ── NAV ITEMS ── */
        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-item {
          opacity: 0;
          animation: fadeRight 0.4s ease forwards;
        }

        .nav-item:nth-child(1) { animation-delay: 0.2s; }
        .nav-item:nth-child(2) { animation-delay: 0.27s; }
        .nav-item:nth-child(3) { animation-delay: 0.34s; }
        .nav-item:nth-child(4) { animation-delay: 0.41s; }
        .nav-item:nth-child(5) { animation-delay: 0.48s; }
        .nav-item:nth-child(6) { animation-delay: 0.55s; }
        .nav-item:nth-child(7) { animation-delay: 0.62s; }
        .nav-item:nth-child(8) { animation-delay: 0.69s; }
        .nav-item:nth-child(9) { animation-delay: 0.76s; }

        :global(.nav-link) {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          text-decoration: none;
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          border-radius: 8px;
          transition: all 0.15s ease;
          position: relative;
        }

        :global(.nav-link:hover) {
          background: #f9fafb;
          color: #111111;
        }

        :global(.nav-link.active) {
          background: #f3f4f6;
          color: #111111;
          font-weight: 600;
        }

        :global(.nav-link.active::before) {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2.5px;
          height: 18px;
          background: #111111;
          border-radius: 0 2px 2px 0;
        }

        .nav-icon {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          opacity: 0.5;
        }

        :global(.nav-link.active) .nav-icon,
        :global(.nav-link:hover) .nav-icon {
          opacity: 1;
        }

        .nav-icon :global(svg) {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          stroke-width: 1.5;
          fill: none;
        }

        .badge {
          margin-left: auto;
          font-size: 0.6rem;
          letter-spacing: 0.04em;
          padding: 0.15rem 0.5rem;
          border-radius: 3px;
          background: #f3f4f6;
          color: #6b7280;
          font-weight: 500;
        }

        .logout-section {
          margin-top: auto;
          padding: 0 1.5rem 1.5rem;
          position: relative;
          z-index: 1;
        }

        :global(.logout-btn) {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          width: 100%;
          text-decoration: none;
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          border-radius: 8px;
          transition: all 0.15s ease;
          border: none;
          background: none;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
        }

        :global(.logout-btn:hover) {
          background: #fef2f2;
          color: #dc2626;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeRight {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes scaleXAnim {
          from { opacity: 0; transform: scaleX(0); }
          to   { opacity: 1; transform: scaleX(1); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .sidebar { width: 64px; }
          .section-label,
          .section-divider,
          :global(.nav-link span),
          .badge { display: none; }
          .sidebar-brand { padding: 1.25rem 0.75rem; }
          .sidebar-brand img { width: 36px !important; height: 36px !important; }
          .sidebar-section { padding: 1rem 0.75rem 0.5rem; }
          :global(.nav-link) { justify-content: center; padding: 0.65rem; }
          :global(.nav-link.active::before) { left: 0; }
          .logout-section { padding: 0 0.75rem 1.5rem; }
          :global(.logout-btn) { justify-content: center; padding: 0.65rem; }
          :global(.logout-btn span:last-child) { display: none; }
        }
      `}</style>

      {/* Brand */}
      <div className="sidebar-brand">
        <Image
          src="/imagens/logo.png"
          alt="Logo"
          width={140}
          height={140}
          className="object-contain"
        />
      </div>

      {/* Menu Principal */}
      <div className="sidebar-section">
        <div className="section-divider"></div>
        <p className="section-label">Menu Principal</p>
        <ul className="nav-list">
          <li className="nav-item">
            <Link href="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </span>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/orders" className={`nav-link ${isActive('/admin/orders')}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
              </span>
              <span>Pedidos</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/products" className={`nav-link ${isActive('/admin/products')}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>
              </span>
              <span>Produtos</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/shipping" className={`nav-link ${isActive('/admin/shipping')}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </span>
              <span>Fretes</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/emails" className={`nav-link ${isActive('/admin/emails')}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
              </span>
              <span>Emails</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/analytics" className={`nav-link ${isActive('/admin/analytics')}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M12 3v9l4 2"/></svg>
              </span>
              <span>Analytics</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/customers" className={`nav-link ${isActive('/admin/customers')}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </span>
              <span>Clientes</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/settings" className={`nav-link ${isActive('/admin/settings')}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              </span>
              <span>Configurações</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/personalization" className={`nav-link ${isActive('/admin/personalization')}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </span>
              <span>Personalização</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Logout */}
      <div className="logout-section">
        <button
          onClick={() => {
            document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.href = "/admin/login";
          }}
          className="logout-btn"
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </span>
          <span>Sair do Sistema</span>
        </button>
      </div>

    </aside>
  );
}
