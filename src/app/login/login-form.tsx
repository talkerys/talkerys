"use client";

import { useState } from "react";

export default function LoginForm() {
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Error");
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
      <input name="email" placeholder="Email" type="email" required />
      <input name="password" placeholder="Password" type="password" required />
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <button type="submit">Entrar</button>
      <a href="/register">Crear cuenta</a>
    </form>
  );
}
