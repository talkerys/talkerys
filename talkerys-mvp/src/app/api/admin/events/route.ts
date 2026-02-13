import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireAdmin } from "../_guard";

const schema = z.object({
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  topic: z.string().min(1),
  levelHint: z.string().optional().nullable(),
  cafeId: z.string().min(1),
  capacity: z.number().int().min(4).max(300),
  tablesCount: z.number().int().min(1).max(50),
  tableCapacity: z.number().int().min(4).max(12),
});

export async function POST(req: Request) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);

  const event = await prisma.event.create({
    data: {
      startsAt,
      endsAt,
      topic: parsed.data.topic,
      levelHint: parsed.data.levelHint || null,
      cafeId: parsed.data.cafeId,
      capacity: parsed.data.capacity,
      tables: {
        create: Array.from({ length: parsed.data.tablesCount }).map((_, i) => ({
          number: i + 1,
          capacity: parsed.data.tableCapacity
        }))
      }
    }
  });

  return NextResponse.json({ ok: true, eventId: event.id });
}
