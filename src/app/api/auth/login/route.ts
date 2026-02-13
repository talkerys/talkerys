import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth";

const Schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const form = await req.formData();
  const parsed = Schema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });

  const token = signJwt({ userId: user.id, email: user.email });
  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return res;
}
