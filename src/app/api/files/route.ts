import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams.get("path");
  if (!p) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const uploadDir = process.env.UPLOAD_DIR || "/app/uploads";
  const full = path.join(uploadDir, p);

  // Prevent traversal
  const normalized = path.normalize(full);
  if (!normalized.startsWith(path.normalize(uploadDir))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  if (!fs.existsSync(normalized)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = fs.readFileSync(normalized);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `inline; filename="${path.basename(normalized)}"`
    }
  });
}
