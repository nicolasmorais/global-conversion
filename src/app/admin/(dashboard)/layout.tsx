import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!verifyToken(token)) {
    redirect("/admin/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Space Grotesk', sans-serif", overflowX: "hidden" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .admin-layout-content {
          margin-left: 260px;
          min-height: 100vh;
        }
        @media (max-width: 768px) {
          .admin-layout-content {
            margin-left: 64px;
          }
        }
      `}</style>
      <Sidebar />
      <div className="admin-layout-content">
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
