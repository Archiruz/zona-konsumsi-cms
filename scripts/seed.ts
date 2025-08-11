import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample employee user
  const employeePassword = await bcrypt.hash('employee123', 10);
  const employee = await prisma.user.upsert({
    where: { email: 'employee@example.com' },
    update: {},
    create: {
      email: 'employee@example.com',
      password: employeePassword,
      name: 'John Employee',
      role: 'EMPLOYEE',
    },
  });

  console.log('✅ Employee user created:', employee.email);

  // Create sample consumption types
  const weeklyType = await prisma.consumptionType.upsert({
    where: { name: 'Weekly Snacks' },
    update: {},
    create: {
      name: 'Weekly Snacks',
      description: 'Snacks and beverages available weekly',
      limit: 5,
      period: 'WEEKLY',
    },
  });

  const monthlyType = await prisma.consumptionType.upsert({
    where: { name: 'Monthly Supplies' },
    update: {},
    create: {
      name: 'Monthly Supplies',
      description: 'Office supplies available monthly',
      limit: 10,
      period: 'MONTHLY',
    },
  });

  console.log('✅ Consumption types created');

  // Create sample consumption items
  const coffeeItem = await prisma.consumptionItem.create({
    data: {
      name: 'Coffee Beans',
      description: 'Premium coffee beans for office coffee machine',
      purchaseDate: new Date(),
      consumptionTypeId: weeklyType.id,
    },
  });

  const snackItem = await prisma.consumptionItem.create({
    data: {
      name: 'Office Snacks',
      description: 'Assorted snacks and cookies',
      purchaseDate: new Date(),
      consumptionTypeId: weeklyType.id,
    },
  });

  const penItem = await prisma.consumptionItem.create({
    data: {
      name: 'Office Pens',
      description: 'Blue ballpoint pens',
      purchaseDate: new Date(),
      consumptionTypeId: monthlyType.id,
    },
  });

  console.log('✅ Consumption items created');

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Employee: employee@example.com / employee123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
