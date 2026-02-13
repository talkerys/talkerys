export default function Home() {
  return (
    <main>
      <h1>Talkerys</h1>
      <p>Reuniones presenciales de conversación en cafeterías de Miraflores (Lima). Mesas de 4 a 8 personas.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/events">Ver próximas reuniones</a>
        <a href="/register">Registrarme</a>
        <a href="/pricing">Ver planes</a>
      </div>

      <h2 style={{ marginTop: 20 }}>Cómo funciona</h2>
      <ol>
        <li>Te registras y completas tu perfil breve.</li>
        <li>Compras un plan (Yape/Plin) y subes tu comprobante.</li>
        <li>Reservas un cupo y te asignamos una mesa.</li>
        <li>Descargas el material semanal y asistes.</li>
      </ol>
    </main>
  );
}
