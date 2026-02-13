import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in env");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: "Talkerys Admin",
      role: "ADMIN",
      profile: {
        create: {
          level: "C2",
          goals: "Administrar el sistema",
          interests: "admin",
          pace: "intensa",
          shareWithTable: false
        }
      },
      credits: { create: { credits: 0 } }
    }
  });

  console.log("Admin created:", email);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
