"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Error al crear cuenta");
      return;
    }

    setOk(true);
    window.location.href = "/events";
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Crear cuenta</h1>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 10 }}>
            <input name="email" placeholder="email" type="email" required />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              name="password"
              placeholder="password (mín. 6)"
              type="password"
              required
              minLength={6}
            />
          </div>

          <button type="submit">Crear</button>

          {error && <p className="error">{error}</p>}
          {ok && <p className="success">Cuenta creada ✅</p>}
        </form>

        <p className="small">
          ¿Ya tienes cuenta? <Link href="/login">Login</Link>
        </p>
        <p className="small">
          <Link href="/">Volver</Link>
        </p>
      </div>
    </div>
  );
}
