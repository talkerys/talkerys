import { prisma } from "@/server/db";

export default async function AdminEvents() {
  const events = await prisma.event.findMany({ include: { cafe: true }, orderBy: { startsAt: "desc" }, take: 50 });
  const cafes = await prisma.cafe.findMany({ orderBy: { name: "asc" } });

  return (
    <main>
      <h1>Eventos</h1>
      <p><a href="/admin/events/new">Crear evento</a></p>

      <ul style={{ display: "grid", gap: 10, padding: 0, listStyle: "none" }}>
        {events.map((e) => (
          <li key={e.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <b>{e.topic}</b> — {new Date(e.startsAt).toLocaleString("es-PE")} — {e.cafe.name}
            <div><a href={`/admin/events/${e.id}`}>Gestionar</a></div>
          </li>
        ))}
      </ul>
    </main>
  );
}
