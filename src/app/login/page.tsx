export const dynamic = "force-dynamic";
export default function LoginPage() {
  return (
    <main className="card">
      <h1>Login</h1>
      <form action="/api/auth/login" method="post" className="row" style={{ marginTop: 12 }}>
        <input name="email" placeholder="email" type="email" required />
        <input name="password" placeholder="password" type="password" required />
        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}
