import { prisma } from "@/server/db";
import NewEventForm from "./new-event-form";

export default async function NewEvent() {
  const cafes = await prisma.cafe.findMany({ orderBy: { name: "asc" } });
  return (
    <main>
      <h1>Crear evento</h1>
      <NewEventForm cafes={cafes} />
    </main>
  );
}
