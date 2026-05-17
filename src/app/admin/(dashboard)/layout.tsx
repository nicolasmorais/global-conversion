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
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Sidebar />
      <div className="ml-72 min-h-screen">
        <main className="p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
