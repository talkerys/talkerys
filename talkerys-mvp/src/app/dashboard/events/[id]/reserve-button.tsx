"use client";
import { useState } from "react";

export default function ReserveButton({ eventId, canReserve }: { eventId: string; canReserve: boolean }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function reserve() {
    setMsg(null); setErr(null);
    if (!canReserve) return setErr("No tienes créditos. Ve a pagar primero.");
    const res = await fetch("/api/registrations", {
      method: "POST",
      body: JSON.stringify({ eventId }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Error");
    setMsg("Reserva creada. Estado: Pendiente de asignación.");
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button onClick={reserve} disabled={!canReserve}>Reservar usando 1 crédito</button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
    </div>
  );
}
