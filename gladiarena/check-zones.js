const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const zones = await prisma.zone.findMany({
    select: {
      id: true,
      name: true,
      baseDamageType: true,
      hasCorruption: true,
      trapDensity: true,
      healAvailability: true,
      environmentalHazard: true
    }
  });
  console.log(JSON.stringify(zones, null, 2));
  await prisma.$disconnect();
}

check();
