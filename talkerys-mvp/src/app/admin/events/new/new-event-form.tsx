"use client";
import { useState } from "react";

export default function NewEventForm({ cafes }: { cafes: any[] }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/events", {
      method: "POST",
      body: JSON.stringify({
        startsAt: form.get("startsAt"),
        endsAt: form.get("endsAt"),
        topic: form.get("topic"),
        levelHint: form.get("levelHint"),
        cafeId: form.get("cafeId"),
        capacity: Number(form.get("capacity") || 24),
        tablesCount: Number(form.get("tablesCount") || 3),
        tableCapacity: Number(form.get("tableCapacity") || 8)
      }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Error");
    setMsg("Evento creado.");
    window.location.href = "/admin/events";
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
      <input name="topic" placeholder="Tema" required />
      <input name="levelHint" placeholder="Nivel sugerido (opcional)" />
      <label>
        Inicio (YYYY-MM-DDTHH:mm)
        <input name="startsAt" placeholder="2026-02-15T19:00" required />
      </label>
      <label>
        Fin (YYYY-MM-DDTHH:mm)
        <input name="endsAt" placeholder="2026-02-15T20:30" required />
      </label>
      <label>
        Cafetería
        <select name="cafeId" style={{ width: "100%" }} required>
          {cafes.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label>
        Capacidad total
        <input name="capacity" type="number" defaultValue={24} />
      </label>
      <label>
        Número de mesas
        <input name="tablesCount" type="number" defaultValue={3} />
      </label>
      <label>
        Capacidad por mesa
        <input name="tableCapacity" type="number" defaultValue={8} />
      </label>

      <button type="submit">Crear</button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
    </form>
  );
}
