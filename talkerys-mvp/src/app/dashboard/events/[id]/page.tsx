import { prisma } from "@/server/db";
import { getSession } from "@/server/session";
import ReserveButton from "./reserve-button";

export default async function EventDetail({ params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return null;

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { cafe: true, tables: true }
  });

  const credits = await prisma.creditBalance.findUnique({ where: { userId: session.sub } });
  const myReg = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: session.sub, eventId: params.id } },
    include: { table: true }
  });

  if (!event) return <main><p>Evento no encontrado.</p></main>;

  return (
    <main>
      <h1>{event.topic}</h1>
      <p><b>Fecha:</b> {new Date(event.startsAt).toLocaleString("es-PE")}</p>
      <p><b>Lugar:</b> {event.cafe.name} — {event.cafe.address}</p>
      {event.levelHint && <p><b>Nivel sugerido:</b> {event.levelHint}</p>}

      <p>Créditos disponibles: <b>{credits?.credits ?? 0}</b></p>

      {myReg ? (
        <>
          <p>Ya tienes reserva. Estado: <b>{myReg.status}</b>. Mesa: <b>{myReg.table?.number ?? "-"}</b></p>
        </>
      ) : (
        <ReserveButton eventId={event.id} canReserve={(credits?.credits ?? 0) > 0} />
      )}

      <hr />
      <p style={{ fontSize: 13, opacity: 0.8 }}>
        Nota: la asignación de mesa puede quedar “Pendiente” hasta que el admin te ubique en una mesa.
      </p>
    </main>
  );
}
