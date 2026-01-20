import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REMINDER_CONFIGS = [
  { name: 'Expired', offsetDays: 0 },
  { name: 'Expiring in 1 day', offsetDays: 1 },
  { name: 'Expiring in 7 days', offsetDays: 7 },
  { name: 'Expiring in 30 days', offsetDays: 30 },
];

async function seedReminderConfigs() {
  for (const config of REMINDER_CONFIGS) {
    await prisma.reminderConfig.upsert({
      where: { offsetDays: config.offsetDays },
      update: {
        name: config.name,
        enabled: true, // re-enable if someone disabled it
      },
      create: {
        name: config.name,
        offsetDays: config.offsetDays,
      },
    });
  }
}

async function main() {
  await seedReminderConfigs();
}

main()
  .then(() => {
    console.log('Reminder configs seeded');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
