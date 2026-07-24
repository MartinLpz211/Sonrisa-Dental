const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Inserta los roles base si no existen todavía.
 * Usamos upsert para que este script se pueda correr varias veces
 * sin duplicar datos (idempotente).
 */
async function main() {
  const roles = ['ADMIN', 'PACIENTE'];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Rol asegurado: ${name}`);
  }
}

main()
  .catch((err) => {
    console.error('Error en el seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
