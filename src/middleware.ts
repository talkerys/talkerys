import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/server/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /app pages
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    const token = req.cookies.get("talkerys_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const payload = verifyJwt(token);
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));

    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
