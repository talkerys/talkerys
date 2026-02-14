"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Credenciales inválidas");
      return;
    }

    window.location.href = "/events";
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Login</h1>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 10 }}>
            <input name="email" placeholder="email" type="email" required />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input name="password" placeholder="password" type="password" required />
          </div>

          <button type="submit">Entrar</button>
          {error && <p className="error">{error}</p>}
        </form>

        <p className="small">
          ¿No tienes cuenta? <Link href="/register">Crear cuenta</Link>
        </p>
        <p className="small">
          <Link href="/">Volver</Link>
        </p>
      </div>
    </div>
  );
}
