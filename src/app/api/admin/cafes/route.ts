import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireAdmin } from "../_guard";

const schema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  googleMapsUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  await prisma.cafe.create({ data: {
    name: parsed.data.name,
    address: parsed.data.address,
    googleMapsUrl: parsed.data.googleMapsUrl || null,
    notes: parsed.data.notes || null
  }});

  return NextResponse.json({ ok: true });
}
