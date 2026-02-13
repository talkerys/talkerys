"use client";
import { useState } from "react";

export default function UploadMaterialForm() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/materials", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Error");
    setMsg("Material subido.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
      <input name="title" placeholder="Título" required />
      <label>
        Alcance
        <select name="scope" defaultValue="GENERAL" style={{ width: "100%" }}>
          <option value="GENERAL">General</option>
          <option value="USER">Usuario (por ID)</option>
        </select>
      </label>
      <input name="userId" placeholder="UserId (solo si scope=USER)" />
      <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,image/*" required />
      <button type="submit">Subir</button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
    </form>
  );
}
