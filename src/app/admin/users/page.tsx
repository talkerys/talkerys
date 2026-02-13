import { prisma } from "@/server/db";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    include: { profile: true, credits: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <main>
      <h1>Usuarios</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Nombre</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Email</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Rol</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Créditos</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ padding: 6 }}>{u.fullName}</td>
              <td style={{ padding: 6 }}>{u.email}</td>
              <td style={{ padding: 6 }}>{u.role}</td>
              <td style={{ padding: 6 }}>{u.credits?.credits ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
