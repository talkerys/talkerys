import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireAdmin } from "../_guard";

const schema = z.object({
  paymentId: z.string().min(1),
  action: z.enum(["approve", "reject"])
});

const PLAN_TO_CREDITS: Record<string, number> = { "1": 1, "2": 2, "4": 4 };

export async function POST(req: Request) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id: parsed.data.paymentId } });
  if (!payment) return NextResponse.json({ error: "Pago no existe" }, { status: 404 });

  if (parsed.data.action === "reject") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "REJECTED" } });
    return NextResponse.json({ ok: true });
  }

  // approve
  if (payment.status === "APPROVED") return NextResponse.json({ ok: true });

  const add = PLAN_TO_CREDITS[payment.plan] || 0;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: "APPROVED" } });
    await tx.creditBalance.upsert({
      where: { userId: payment.userId },
      update: { credits: { increment: add } },
      create: { userId: payment.userId, credits: add }
    });
  });

  return NextResponse.json({ ok: true });
}
