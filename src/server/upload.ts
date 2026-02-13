import fs from "node:fs";
import path from "node:path";

export function ensureUploadDir() {
  const dir = process.env.UPLOAD_DIR || "/app/uploads";
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function saveFileFromFormData(file: File, subdir: string) {
  const uploadDir = ensureUploadDir();
  const safeSubdir = subdir.replace(/[^a-zA-Z0-9_-]/g, "");
  const dir = path.join(uploadDir, safeSubdir);
  fs.mkdirSync(dir, { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const full = path.join(dir, filename);
  fs.writeFileSync(full, buf);

  // Served via next route /api/files?path=...
  const publicUrl = `/api/files?path=${encodeURIComponent(path.join(safeSubdir, filename))}`;
  return { fullPath: full, publicUrl };
}
