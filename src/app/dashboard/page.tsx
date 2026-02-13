export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";

export default function Dashboard() {
  const token = cookies().get("token")?.value;
  let who = "No autenticado";
  if (token) {
    try { who = verifyJwt(token).email; } catch { who = "Token inválido"; }
  }
  return (
    <main className="card">
      <h1>Dashboard</h1>
      <p className="small">Usuario: <b>{who}</b></p>
      <div className="row" style={{ marginTop: 12 }}>
        <form action="/api/auth/logout" method="post">
          <button type="submit">Logout</button>
        </form>
        <a href="/"><button type="button">Inicio</button></a>
      </div>
    </main>
  );
}
