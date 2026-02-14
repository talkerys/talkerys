import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "talkerys_token";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  // In middleware, avoid throwing: just treat as unauthenticated
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function isAuthed(req: NextRequest) {
  const secret = getSecret();
  if (!secret) return false;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect pages
  if (pathname.startsWith("/events")) {
    const ok = await isAuthed(req);
    if (!ok) return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect API
  if (pathname.startsWith("/api/events")) {
    const ok = await isAuthed(req);
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/events/:path*", "/api/events/:path*"],
};
