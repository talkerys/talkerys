"use client";

import { useMemo, useState } from "react";

type EventRow = { id: string; title: string; startsAt: string | Date };

function toIsoLocal(dt: Date) {
  // yyyy-MM-ddTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}`;
}

export default function EventsClient({ initialEvents }: { initialEvents: EventRow[] }) {
  const [events, setEvents] = useState<EventRow[]>(
    initialEvents.map((e) => ({ ...e, startsAt: new Date(e.startsAt) }))
  );
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState(toIsoLocal(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
  }, [events]);

  async function create() {
    setError(null);
    setBusy(true);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startsAt }),
    });

    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo crear");
      return;
    }

    setTitle("");
    setEvents((prev) => [{ ...data.event, startsAt: new Date(data.event.startsAt) }, ...prev]);
  }

  async function remove(id: string) {
    setError(null);
    setBusy(true);

    const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo borrar");
      return;
    }

    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <>
      <div className="row" style={{ marginBottom: 10 }}>
        <div style={{ flex: 2, minWidth: 220 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
          />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <input
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            type="datetime-local"
          />
        </div>
        <button onClick={create} disabled={busy || !title.trim()}>
          Crear
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <h3 style={{ marginBottom: 8 }}>Mis eventos</h3>
      {sorted.length === 0 ? (
        <p className="small">Aún no hay eventos.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td className="small">
                  {new Date(e.startsAt).toLocaleString()}
                </td>
                <td style={{ width: 110 }}>
                  <button onClick={() => remove(e.id)} disabled={busy}>
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
