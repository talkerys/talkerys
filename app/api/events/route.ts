import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";

const CreateBody = z.object({
  title: z.string().min(1).max(140),
  startsAt: z.string().min(1), // datetime-local string
});

export async function GET() {
  const session = await readSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await prisma.event.findMany({
    where: { userId: session.userId },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true, startsAt: true },
  });

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = await readSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const json = await req.json();
    const { title, startsAt } = CreateBody.parse(json);

    const event = await prisma.event.create({
      data: {
        title,
        startsAt: new Date(startsAt),
        userId: session.userId,
      },
      select: { id: true, title: true, startsAt: true },
    });

    return NextResponse.json({ ok: true, event });
  } catch (err: any) {
    const msg =
      err?.issues?.[0]?.message || err?.message || "Error creando evento.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = await readSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.event.findFirst({
    where: { id, userId: session.userId },
    select: { id: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
