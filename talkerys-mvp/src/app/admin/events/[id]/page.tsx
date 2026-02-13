import { prisma } from "@/server/db";
import AssignForm from "./assign-form";

export default async function AdminEventDetail({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      cafe: true,
      tables: true,
      registrations: { include: { user: { include: { profile: true } }, table: true }, orderBy: { createdAt: "asc" } }
    }
  });
  if (!event) return <main><p>No encontrado.</p></main>;

  return (
    <main>
      <h1>Gestionar evento</h1>
      <p><b>{event.topic}</b> — {new Date(event.startsAt).toLocaleString("es-PE")} — {event.cafe.name}</p>

      <h2>Asignación de mesas</h2>
      <AssignForm eventId={event.id} tables={event.tables} />

      <h2>Inscritos</h2>
      <ul style={{ display: "grid", gap: 10, padding: 0, listStyle: "none" }}>
        {event.registrations.map((r) => (
          <li key={r.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <b>{r.user.fullName}</b> — {r.user.email}<br/>
            Nivel: {r.user.profile?.level ?? "-"} | Intereses: {r.user.profile?.interests ?? "-"}<br/>
            Estado: <b>{r.status}</b> | Mesa: <b>{r.table?.number ?? "-"}</b>
          </li>
        ))}
      </ul>
    </main>
  );
}
