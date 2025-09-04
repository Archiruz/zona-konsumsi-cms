import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample departments
  const itDepartment = await prisma.department.upsert({
    where: { name: 'Information Technology' },
    update: {},
    create: {
      name: 'Information Technology',
      description: 'Responsible for managing and maintaining IT infrastructure',
    },
  });

  const hrDepartment = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: {
      name: 'Human Resources',
      description: 'Manages employee relations and organizational development',
    },
  });

  const financeDepartment = await prisma.department.upsert({
    where: { name: 'Finance' },
    update: {},
    create: {
      name: 'Finance',
      description: 'Handles financial planning and accounting operations',
    },
  });

  console.log('✅ Departments created');

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
      nip: '100000001',
      position: 'System Administrator',
      departmentId: itDepartment.id,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample employee users
  const employeePassword = await bcrypt.hash('employee123', 10);
  const employee1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: employeePassword,
      name: 'John Doe',
      role: 'EMPLOYEE',
      nip: '200000001',
      position: 'Software Developer',
      departmentId: itDepartment.id,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      password: employeePassword,
      name: 'Jane Smith',
      role: 'EMPLOYEE',
      nip: '300000001',
      position: 'HR Specialist',
      departmentId: hrDepartment.id,
    },
  });

  const employee3 = await prisma.user.upsert({
    where: { email: 'mike.wilson@example.com' },
    update: {},
    create: {
      email: 'mike.wilson@example.com',
      password: employeePassword,
      name: 'Mike Wilson',
      role: 'EMPLOYEE',
      nip: '400000001',
      position: 'Financial Analyst',
      departmentId: financeDepartment.id,
    },
  });

  // Create user without department (to demonstrate optional fields)
  const employee4 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@example.com' },
    update: {},
    create: {
      email: 'sarah.johnson@example.com',
      password: employeePassword,
      name: 'Sarah Johnson',
      role: 'EMPLOYEE',
      // No NIP, position, or department to show optional fields
    },
  });

  console.log('✅ Users created');

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
  console.log('Employees (all use password: employee123):');
  console.log('  - john.doe@example.com (IT Department)');
  console.log('  - jane.smith@example.com (HR Department)');
  console.log('  - mike.wilson@example.com (Finance Department)');
  console.log('  - sarah.johnson@example.com (No Department)');
  console.log('\n🏢 Sample Departments:');
  console.log('  - Information Technology');
  console.log('  - Human Resources');
  console.log('  - Finance');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
