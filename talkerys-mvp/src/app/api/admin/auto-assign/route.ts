import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireAdmin } from "../_guard";

const schema = z.object({ eventId: z.string().min(1) });

export async function POST(req: Request) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const event = await prisma.event.findUnique({
    where: { id: parsed.data.eventId },
    include: { tables: true }
  });
  if (!event) return NextResponse.json({ error: "Evento no existe" }, { status: 404 });

  const regs = await prisma.registration.findMany({
    where: { eventId: event.id, status: "PENDING_ASSIGNMENT" },
    orderBy: { createdAt: "asc" }
  });

  const tables = [...event.tables].sort((a, b) => a.number - b.number);

  // Count current occupancy per table
  const counts = new Map<string, number>();
  for (const t of tables) counts.set(t.id, 0);

  const current = await prisma.registration.findMany({
    where: { eventId: event.id, tableId: { not: null }, status: "CONFIRMED" },
    select: { tableId: true }
  });
  for (const r of current) {
    if (r.tableId) counts.set(r.tableId, (counts.get(r.tableId) || 0) + 1);
  }

  for (const r of regs) {
    const target = tables.find(t => (counts.get(t.id) || 0) < t.capacity);
    if (!target) break;
    await prisma.registration.update({
      where: { id: r.id },
      data: { tableId: target.id, status: "CONFIRMED" }
    });
    counts.set(target.id, (counts.get(target.id) || 0) + 1);
  }

  return NextResponse.json({ ok: true });
}
