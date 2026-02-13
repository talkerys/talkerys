export default function AdminHome() {
  return (
    <main>
      <h1>Admin</h1>
      <ul>
        <li><a href="/admin/users">Usuarios</a></li>
        <li><a href="/admin/cafes">Cafeterías</a></li>
        <li><a href="/admin/events">Eventos</a></li>
        <li><a href="/admin/payments">Pagos</a></li>
        <li><a href="/admin/materials">Materiales</a></li>
      </ul>
    </main>
  );
}
