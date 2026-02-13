import { NextResponse } from "next/server";
import { getSession } from "@/server/session";
import { prisma } from "@/server/db";
import { saveFileFromFormData } from "@/server/upload";

const AMOUNTS: Record<string, number> = { "1": 30, "2": 50, "4": 100 };

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const form = await req.formData();
  const plan = String(form.get("plan") || "");
  const method = String(form.get("method") || "");
  const receipt = form.get("receipt");

  if (!AMOUNTS[plan]) return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  if (!["YAPE", "PLIN"].includes(method)) return NextResponse.json({ error: "Método inválido" }, { status: 400 });
  if (!(receipt instanceof File)) return NextResponse.json({ error: "Falta comprobante" }, { status: 400 });

  const saved = await saveFileFromFormData(receipt, `receipts/${session.sub}`);

  await prisma.payment.create({
    data: {
      userId: session.sub,
      method: method as any,
      amount: AMOUNTS[plan],
      plan,
      receiptUrl: saved.publicUrl,
      status: "PENDING"
    }
  });

  return NextResponse.json({ ok: true });
}
