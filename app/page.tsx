import Link from "next/link";
import { readSession } from "@/lib/auth";

export default async function Home() {
  const session = await readSession();

  return (
    <div className="container">
      <div className="nav">
        <strong>Talkerys</strong>
        <div className="links">
          {session ? (
            <>
              <span className="small">Hola, {session.email}</span>
              <Link href="/events">Eventos</Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit">Salir</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h1 style={{ marginTop: 0 }}>Sistema listo para Railway</h1>
        <p className="small">
          Incluye: registro, login, sesión por cookie (JWT), página protegida y
          CRUD básico de eventos en Postgres usando Prisma.
        </p>
        <hr />
        <div className="row">
          <Link href={session ? "/events" : "/login"}>
            <button>{session ? "Ir a eventos" : "Entrar"}</button>
          </Link>
          <a
            className="small"
            href="https://railway.app"
            target="_blank"
            rel="noreferrer"
          >
            Deploy en Railway
          </a>
        </div>
      </div>
    </div>
  );
}
