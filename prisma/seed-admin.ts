import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definido.");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.usuario.upsert({
    where: {
      email: "admin@mk.com",
    },
    update: {
      password: passwordHash,
      rol: "ADMIN",
      activo: true,
    },
    create: {
      nombre: "Administrador",
      email: "admin@mk.com",
      password: passwordHash,
      rol: "ADMIN",
      activo: true,
    },
  });

  console.log("Usuario ADMIN creado:");
  console.log("Email: admin@mk.com");
  console.log("Password: admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });