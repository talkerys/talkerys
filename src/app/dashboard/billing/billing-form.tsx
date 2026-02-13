"use client";

import { useState } from "react";

export default function BillingForm() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/payments", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Error");
    setMsg("Comprobante subido. Queda pendiente de verificación.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
      <label>
        Plan
        <select name="plan" defaultValue="4" style={{ width: "100%" }}>
          <option value="1">1 reunión — S/30</option>
          <option value="2">2 reuniones — S/50</option>
          <option value="4">4 reuniones al mes — S/100</option>
        </select>
      </label>

      <label>
        Método
        <select name="method" defaultValue="YAPE" style={{ width: "100%" }}>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
        </select>
      </label>

      <label>
        Captura/Foto del comprobante
        <input name="receipt" type="file" accept="image/*" required />
      </label>

      <button type="submit">Enviar comprobante</button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
    </form>
  );
}
