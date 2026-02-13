import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/session";
import { prisma } from "@/server/db";

const schema = z.object({ eventId: z.string().min(1) });

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const credits = await prisma.creditBalance.findUnique({ where: { userId: session.sub } });
  if (!credits || credits.credits <= 0) return NextResponse.json({ error: "Sin créditos" }, { status: 400 });

  // create registration + decrement credit in a transaction
  try {
    await prisma.$transaction(async (tx) => {
      await tx.registration.create({
        data: { userId: session.sub, eventId: parsed.data.eventId }
      });
      await tx.creditBalance.update({
        where: { userId: session.sub },
        data: { credits: { decrement: 1 } }
      });
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Ya tienes reserva o el evento es inválido" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
