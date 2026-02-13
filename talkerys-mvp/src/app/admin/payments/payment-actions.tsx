"use client";
import { useState } from "react";

export default function PaymentActions({ paymentId }: { paymentId: string }) {
  const [msg, setMsg] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setMsg(null);
    const res = await fetch("/api/admin/payments", {
      method: "POST",
      body: JSON.stringify({ paymentId, action }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(data?.error || "Error");
    setMsg("OK. Recarga para ver cambios.");
  }

  return (
    <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={() => act("approve")}>Aprobar</button>
      <button onClick={() => act("reject")}>Rechazar</button>
      {msg && <span style={{ fontSize: 12, opacity: 0.8 }}>{msg}</span>}
    </div>
  );
}
