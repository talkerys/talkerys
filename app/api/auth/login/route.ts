import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = Body.parse(json);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Email o password incorrectos." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Email o password incorrectos." },
        { status: 401 }
      );
    }

    await createSessionCookie({ userId: user.id, email: user.email });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg =
      err?.issues?.[0]?.message || err?.message || "Error en login.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
