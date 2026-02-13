"use client";
import { useState } from "react";

export default function CafeForm() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/cafes", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        address: form.get("address"),
        googleMapsUrl: form.get("googleMapsUrl"),
        notes: form.get("notes"),
      }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Error");
    setMsg("Cafetería creada. Recarga para ver.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
      <input name="name" placeholder="Nombre" required />
      <input name="address" placeholder="Dirección" required />
      <input name="googleMapsUrl" placeholder="Link Google Maps (opcional)" />
      <textarea name="notes" placeholder="Notas (ruido, consumo mínimo, etc.)" rows={3} />
      <button type="submit">Agregar</button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
    </form>
  );
}
