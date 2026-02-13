import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6),
  level: z.string().min(1),
  goals: z.string().min(1),
  interests: z.string().min(1),
  pace: z.string().min(1),
  shareWithTable: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { fullName, email, phone, password, level, goals, interests, pace, shareWithTable } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email ya registrado" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      passwordHash,
      profile: {
        create: { level, goals, interests, pace, shareWithTable }
      },
      credits: { create: { credits: 0 } }
    }
  });

  return NextResponse.json({ ok: true });
}
