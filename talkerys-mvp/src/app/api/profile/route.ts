import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/session";
import { prisma } from "@/server/db";

const schema = z.object({
  level: z.string().min(1),
  goals: z.string().min(1),
  interests: z.string().min(1),
  pace: z.string().min(1),
  shareWithTable: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  await prisma.profile.upsert({
    where: { userId: session.sub },
    update: parsed.data,
    create: { userId: session.sub, ...parsed.data }
  });

  return NextResponse.json({ ok: true });
}
