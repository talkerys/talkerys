import { getSession } from "@/server/session";
import { prisma } from "@/server/db";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const session = getSession();
  if (!session) return null;

  const profile = await prisma.profile.findUnique({ where: { userId: session.sub } });
  return (
    <main>
      <h1>Mi perfil</h1>
      <ProfileForm initial={profile} />
    </main>
  );
}
