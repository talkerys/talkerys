import { getSession } from "@/server/session";
import { prisma } from "@/server/db";

export default async function MaterialsPage() {
  const session = getSession();
  if (!session) return null;

  const mats = await prisma.material.findMany({
    where: {
      OR: [
        { scope: "GENERAL" },
        { scope: "USER", userId: session.sub }
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <main>
      <h1>Mis materiales</h1>
      {mats.length === 0 ? <p>Aún no hay materiales.</p> : (
        <ul style={{ display: "grid", gap: 10, padding: 0, listStyle: "none" }}>
          {mats.map((m) => (
            <li key={m.id}>
              <a href={m.fileUrl} target="_blank">{m.title}</a> <span style={{ fontSize: 12, opacity: 0.7 }}>({m.scope})</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
