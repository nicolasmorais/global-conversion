import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("admin_token")?.value;

  const isAdminPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  const isAdminApi = pathname.startsWith("/api/orders");

  if (isAdminPage || isAdminApi) {
    if (!verifyToken(token)) {
      if (isAdminApi) {
        return NextResponse.json(
          { error: "Não autorizado" },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/orders/:path*"],
};
