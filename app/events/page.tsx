import Link from "next/link";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";
import EventsClient from "@/app/_components/EventsClient";

export default async function EventsPage() {
  const session = await readSession();
  if (!session) {
    // middleware should redirect, but keep this as a safety net
    return (
      <div className="container">
        <div className="card">
          <p>Sin sesión.</p>
          <Link href="/login">Login</Link>
        </div>
      </div>
    );
  }

  const events = await prisma.event.findMany({
    where: { userId: session.userId },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true, startsAt: true },
  });

  return (
    <div className="container">
      <div className="nav">
        <strong>Eventos</strong>
        <div className="links">
          <span className="small">{session.email}</span>
          <Link href="/">Inicio</Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit">Salir</button>
          </form>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Crear evento</h2>
        <EventsClient initialEvents={events} />
      </div>
    </div>
  );
}
