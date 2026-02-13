import { prisma } from "@/server/db";
import CafeForm from "./cafe-form";

export default async function AdminCafes() {
  const cafes = await prisma.cafe.findMany({ orderBy: { name: "asc" } });
  return (
    <main>
      <h1>Cafeterías</h1>
      <CafeForm />
      <hr />
      <ul>
        {cafes.map((c) => (
          <li key={c.id}>
            <b>{c.name}</b> — {c.address}
          </li>
        ))}
      </ul>
    </main>
  );
}
