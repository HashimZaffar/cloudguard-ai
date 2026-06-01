const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

const SALT_ROUNDS = 10;

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@cloudguard.local',
    password: 'AdminPass123',
  },
  {
    name: 'Demo User',
    email: 'demo@cloudguard.local',
    password: 'DemoPass123',
  },
];

async function seed() {
  console.log('Seeding started');

  const demoEmails = demoUsers.map((user) => user.email);

  // Only remove known demo users. This keeps other local users safe.
  await prisma.user.deleteMany({
    where: {
      email: {
        in: demoEmails,
      },
    },
  });

  for (const demoUser of demoUsers) {
    const passwordHash = await bcrypt.hash(demoUser.password, SALT_ROUNDS);

    await prisma.user.upsert({
      where: {
        email: demoUser.email,
      },
      update: {
        name: demoUser.name,
        passwordHash,
      },
      create: {
        name: demoUser.name,
        email: demoUser.email,
        passwordHash,
      },
    });
  }

  console.log('Demo users created or updated');
  console.log('Seeding completed');
}

seed()
  .catch((error) => {
    console.error('Seeding failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
