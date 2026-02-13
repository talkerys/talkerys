"use client";

import { useState } from "react";

export default function ProfileForm({ initial }: { initial: any }) {
  const [msg, setMsg] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/profile", {
      method: "POST",
      body: JSON.stringify({
        level: form.get("level"),
        goals: form.get("goals"),
        interests: form.get("interests"),
        pace: form.get("pace"),
        shareWithTable: form.get("shareWithTable") === "on",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(data?.error || "Error");
    setMsg("Guardado.");
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
      <input name="level" defaultValue={initial?.level || ""} placeholder="Nivel" required />
      <input name="goals" defaultValue={initial?.goals || ""} placeholder="Objetivo" required />
      <input name="interests" defaultValue={initial?.interests || ""} placeholder="Intereses (coma)" required />
      <select name="pace" defaultValue={initial?.pace || "tranquila"}>
        <option value="tranquila">Mesa tranquila</option>
        <option value="intensa">Mesa intensa</option>
      </select>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="checkbox" name="shareWithTable" defaultChecked={initial?.shareWithTable ?? True} /> Compartir mi perfil breve con mi mesa
      </label>
      <button type="submit">Guardar</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
