"use client";

import { useState } from "react";

export default function RegisterForm() {
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setOk(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: form.get("fullName"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
        level: form.get("level"),
        goals: form.get("goals"),
        interests: form.get("interests"),
        pace: form.get("pace"),
        shareWithTable: form.get("shareWithTable") === "on",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Error");
    setOk("Cuenta creada. Ya puedes iniciar sesión.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
      <input name="fullName" placeholder="Nombre y apellido" required />
      <input name="email" placeholder="Email" type="email" required />
      <input name="phone" placeholder="WhatsApp (opcional)" />
      <input name="password" placeholder="Password" type="password" minLength={6} required />

      <hr />

      <input name="level" placeholder="Nivel (A1–C2 / Básico / Intermedio...)" required />
      <input name="goals" placeholder="Objetivo (ej. fluidez, pronunciación...)" required />
      <input name="interests" placeholder="Intereses (separados por coma)" required />
      <select name="pace" defaultValue="tranquila">
        <option value="tranquila">Mesa tranquila</option>
        <option value="intensa">Mesa intensa</option>
      </select>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="checkbox" name="shareWithTable" defaultChecked /> Compartir mi perfil breve con mi mesa
      </label>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {ok && <p style={{ color: "green" }}>{ok}</p>}

      <button type="submit">Crear cuenta</button>
      <p style={{ fontSize: 12, opacity: 0.75 }}>
        Al registrarte aceptas que tu perfil breve (si marcas la opción) sea visible solo para personas de tu mesa.
      </p>
    </form>
  );
}
