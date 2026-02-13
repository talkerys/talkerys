import { getSession } from "@/server/session";
import { prisma } from "@/server/db";

export default async function MyEventsPage() {
  const session = getSession();
  if (!session) return null;

  const regs = await prisma.registration.findMany({
    where: { userId: session.sub },
    include: { event: { include: { cafe: true } }, table: true },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <main>
      <h1>Mis reuniones</h1>
      {regs.length === 0 ? <p>Aún no tienes reservas.</p> : (
        <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
          {regs.map((r) => (
            <li key={r.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
              <b>{r.event.topic}</b>
              <div style={{ opacity: 0.8 }}>{new Date(r.event.startsAt).toLocaleString("es-PE")} — {r.event.cafe.name}</div>
              <div>Estado: <b>{r.status}</b></div>
              <div>Mesa: <b>{r.table?.number ?? "-"}</b></div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
