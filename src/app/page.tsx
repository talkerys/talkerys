export default function Home() {
  return (
    <main className="card">
      <h1>Talkerys (clean starter)</h1>
      <p className="small">Starter para Railway + Next.js + Prisma (sin errores de build).</p>
      <div className="row" style={{ marginTop: 12 }}>
        <a href="/login"><button>Login</button></a>
        <a href="/dashboard"><button>Dashboard</button></a>
      </div>
      <p className="small" style={{ marginTop: 16 }}>
        Configura <code>DATABASE_URL</code> y <code>JWT_SECRET</code> (ver <code>.env.example</code>).
      </p>
    </main>
  );
}
