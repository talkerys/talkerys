"use client";
import { useState } from "react";

export default function AssignForm({ eventId, tables }: { eventId: string; tables: any[] }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function autoAssign() {
    setMsg(null); setErr(null);
    const res = await fetch("/api/admin/auto-assign", {
      method: "POST",
      body: JSON.stringify({ eventId }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Error");
    setMsg("Auto-asignación ejecutada. Recarga la página.");
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button onClick={autoAssign}>Auto-asignar (básico)</button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
      <p style={{ fontSize: 12, opacity: 0.75 }}>
        Auto-asignación MVP: llena mesas por orden de inscripción, respetando capacidad.
        (Puedes mejorarla luego por nivel/intereses).
      </p>
    </div>
  );
}
