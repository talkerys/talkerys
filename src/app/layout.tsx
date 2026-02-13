export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <a href="/" style={{ fontWeight: 800, textDecoration: "none" }}>Talkerys</a>
            <nav style={{ display: "flex", gap: 12 }}>
              <a href="/events">Reuniones</a>
              <a href="/pricing">Planes</a>
              <a href="/login">Login</a>
              <a href="/dashboard">Mi panel</a>
            </nav>
          </header>
          <hr style={{ margin: "16px 0" }} />
          {children}
          <hr style={{ margin: "24px 0" }} />
          <footer style={{ fontSize: 12, opacity: 0.7 }}>
            Talkerys — Club de conversación en Miraflores (Lima).
          </footer>
        </div>
      </body>
    </html>
  );
}
