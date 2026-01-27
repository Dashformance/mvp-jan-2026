import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- FIXING VITOR XP ---');
  const vitor = await prisma.user.findFirst({
    where: { name: { contains: 'Vitor', mode: 'insensitive' } }
  });

  if (vitor) {
    console.log('Found Vitor:', vitor.name, vitor.id);
    await prisma.user.update({
      where: { id: vitor.id },
      data: {
        xp: 80,
        level: 1
      }
    });
    console.log('Updated Vitor to 80 XP (Level 1 due to low interactions)');
  } else {
    console.log('Vitor not found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
