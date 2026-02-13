import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireAdmin } from "../_guard";
import { saveFileFromFormData } from "@/server/upload";

export async function POST(req: Request) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const form = await req.formData();
  const title = String(form.get("title") || "");
  const scope = String(form.get("scope") || "GENERAL");
  const userId = String(form.get("userId") || "");
  const file = form.get("file");

  if (!title) return NextResponse.json({ error: "Falta título" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta archivo" }, { status: 400 });
  if (!["GENERAL", "USER"].includes(scope)) return NextResponse.json({ error: "Scope inválido (MVP)" }, { status: 400 });
  if (scope === "USER" && !userId) return NextResponse.json({ error: "Falta userId" }, { status: 400 });

  const saved = await saveFileFromFormData(file, `materials/${scope.toLowerCase()}`);

  await prisma.material.create({
    data: {
      title,
      fileUrl: saved.publicUrl,
      scope: scope as any,
      userId: scope === "USER" ? userId : null
    }
  });

  return NextResponse.json({ ok: true });
}
