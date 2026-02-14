import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = Body.parse(json);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ese email ya existe." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });

    await createSessionCookie({ userId: user.id, email: user.email });

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    const msg =
      err?.issues?.[0]?.message ||
      err?.message ||
      "Error al crear la cuenta.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
