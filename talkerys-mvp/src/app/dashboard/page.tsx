import { getSession } from "@/server/session";
import { prisma } from "@/server/db";

export default async function Dashboard() {
  const session = getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { profile: true, credits: true }
  });

  return (
    <main>
      <h1>Mi panel</h1>
      <p><b>{user?.fullName}</b> — {user?.email}</p>
      <p>Créditos disponibles: <b>{user?.credits?.credits ?? 0}</b></p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/dashboard/profile">Mi perfil</a>
        <a href="/dashboard/billing">Pagar (Yape/Plin)</a>
        <a href="/dashboard/my-events">Mis reuniones</a>
        <a href="/dashboard/materials">Mis materiales</a>
        <a href="/api/auth/logout">Salir</a>
      </div>

      {session.role === "ADMIN" && (
        <>
          <hr />
          <a href="/admin">Ir a Admin</a>
        </>
      )}
    </main>
  );
}
