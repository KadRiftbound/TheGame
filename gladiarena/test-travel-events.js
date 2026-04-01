const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTravelEvents() {
  // First create a test user and character
  try {
    const result = await fetch('http://localhost:3000/api/travel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromZone: 'city', toZone: 'zone_volcan' })
    });
    const data = await result.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
  await prisma.$disconnect();
}

testTravelEvents();
