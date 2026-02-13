import { prisma } from "@/server/db";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    include: { cafe: true },
    orderBy: { startsAt: "asc" },
    take: 20
  });

  return (
    <main>
      <h1>Próximas reuniones</h1>
      {events.length === 0 ? (
        <p>No hay eventos publicados todavía.</p>
      ) : (
        <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
          {events.map((e) => (
            <li key={e.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
              <b>{e.topic}</b>
              <div style={{ opacity: 0.8 }}>
                {new Date(e.startsAt).toLocaleString("es-PE")} — {e.cafe.name}
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>{e.cafe.address}</div>
              <a href={`/dashboard/events/${e.id}`}>Reservar / ver detalle</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
