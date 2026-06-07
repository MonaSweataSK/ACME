import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // 1. Clean slate
  console.log('🧹 Wiping existing database records...');
  // Delete in reverse dependency order
  await prisma.salaryRecord.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.designation.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.country.deleteMany({});

  // 2. Master Data Seeding
  console.log('🌍 Seeding Master Data (Countries, Departments, Designations)...');
  
  // Countries
  const countries = await Promise.all([
    prisma.country.create({ data: { name: 'USA', currency_code: 'USD', usd_multiplier: 1.0 } }),
    prisma.country.create({ data: { name: 'India', currency_code: 'INR', usd_multiplier: 0.012 } }),
    prisma.country.create({ data: { name: 'UK', currency_code: 'GBP', usd_multiplier: 1.27 } }),
    prisma.country.create({ data: { name: 'Germany', currency_code: 'EUR', usd_multiplier: 1.08 } }),
  ]);

  // Departments & Designations
  const departmentsData = [
    { name: 'Engineering', roles: ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'QA Engineer'] },
    { name: 'Product', roles: ['Product Manager', 'Senior Product Manager', 'Technical Product Manager', 'Product Analyst', 'Director of Product'] },
    { name: 'Design', roles: ['UX Designer', 'UI Designer', 'Senior Product Designer', 'UX Researcher', 'Design Manager'] },
    { name: 'Sales', roles: ['Sales Development Representative', 'Account Executive', 'Enterprise Account Executive', 'Sales Manager', 'VP of Sales'] },
    { name: 'Marketing', roles: ['Content Marketer', 'Digital Marketing Specialist', 'SEO Specialist', 'Marketing Manager', 'CMO'] },
    { name: 'Finance', roles: ['Financial Analyst', 'Senior Financial Analyst', 'Accountant', 'Finance Manager', 'CFO'] },
    { name: 'HR', roles: ['HR Coordinator', 'Technical Recruiter', 'HR Business Partner', 'Compensation Analyst', 'HR Director'] },
    { name: 'Operations', roles: ['Operations Associate', 'Operations Manager', 'Logistics Coordinator', 'Supply Chain Analyst', 'COO'] },
    { name: 'Customer Success', roles: ['Customer Success Manager', 'Senior CSM', 'Customer Support Specialist', 'Implementation Specialist', 'VP of Customer Success'] },
    { name: 'Data', roles: ['Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'Data Engineer', 'Analytics Manager'] },
  ];

  const departments = [];
  const designations = [];

  for (const dept of departmentsData) {
    const createdDept = await prisma.department.create({
      data: { name: dept.name }
    });
    departments.push(createdDept);

    for (const role of dept.roles) {
      const createdRole = await prisma.designation.create({
        data: { name: role, department_id: createdDept.id }
      });
      designations.push(createdRole);
    }
  }

  // 3. Generate 10,000 Employees
  console.log('👥 Generating 10,000 Employee Profiles (this may take a few seconds)...');

  const TOTAL_EMPLOYEES = 10000;
  const CHUNK_SIZE = 500;

  const employees = [];
  const salaryRecords = [];

  for (let i = 1; i <= TOTAL_EMPLOYEES; i++) {
    const empId = crypto.randomUUID();
    const country = faker.helpers.arrayElement(countries);
    const department = faker.helpers.arrayElement(departments);
    const departmentDesignations = designations.filter(d => d.department_id === department.id);
    const designation = faker.helpers.arrayElement(departmentDesignations);
    
    // Status (97% active)
    const status = Math.random() > 0.03 ? 'ACTIVE' : 'INACTIVE';
    
    const joinDate = faker.date.past({ years: 5 });

    employees.push({
      id: empId,
      employee_code: `EMP-${String(i).padStart(5, '0')}`,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email({ provider: 'acme.com' }) + `-${i}`, // guarantee unique
      department_id: department.id,
      designation_id: designation.id,
      country_id: country.id,
      join_date: joinDate,
      status,
      avatar_url: faker.image.avatar(),
      created_at: joinDate,
      updated_at: new Date(),
    });

    // Generate Salaries
    // Base salary localized
    const baseSalaryLocal = Math.floor(faker.number.int({ min: 30000, max: 150000 }) / country.usd_multiplier);
    const bonusLocal = Math.floor(baseSalaryLocal * 0.1);
    const allowancesLocal = Math.floor(baseSalaryLocal * 0.05);
    const totalCtcLocal = baseSalaryLocal + bonusLocal + allowancesLocal;

    // Has historical data? (~25% of employees)
    const hasHistory = Math.random() < 0.25;

    if (hasHistory) {
      // Create older record
      const oldBase = Math.floor(baseSalaryLocal * 0.8);
      const oldCtc = Math.floor(oldBase * 1.15);
      
      salaryRecords.push({
        id: crypto.randomUUID(),
        employee_id: empId,
        effective_date: joinDate,
        base_salary: oldBase,
        bonus: Math.floor(oldBase * 0.1),
        allowances: Math.floor(oldBase * 0.05),
        total_ctc: oldCtc,
        currency_code: country.currency_code,
        reason: 'Initial Offer',
        is_active: false,
        created_at: joinDate,
      });

      // Current record
      salaryRecords.push({
        id: crypto.randomUUID(),
        employee_id: empId,
        effective_date: faker.date.recent({ days: 365 }),
        base_salary: baseSalaryLocal,
        bonus: bonusLocal,
        allowances: allowancesLocal,
        total_ctc: totalCtcLocal,
        currency_code: country.currency_code,
        reason: 'Annual Increment',
        is_active: true,
        created_at: new Date(),
      });
    } else {
      // Just current record
      salaryRecords.push({
        id: crypto.randomUUID(),
        employee_id: empId,
        effective_date: joinDate,
        base_salary: baseSalaryLocal,
        bonus: bonusLocal,
        allowances: allowancesLocal,
        total_ctc: totalCtcLocal,
        currency_code: country.currency_code,
        reason: 'Initial Offer',
        is_active: true,
        created_at: joinDate,
      });
    }
  }

  // 4. Chunked Insertion
  console.log(`🚀 Inserting ${employees.length} employees and ${salaryRecords.length} salary records in chunks of ${CHUNK_SIZE}...`);

  for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
    const empChunk = employees.slice(i, i + CHUNK_SIZE);
    await prisma.employee.createMany({ data: empChunk });
  }
  
  for (let i = 0; i < salaryRecords.length; i += CHUNK_SIZE) {
    const salChunk = salaryRecords.slice(i, i + CHUNK_SIZE);
    await prisma.salaryRecord.createMany({ data: salChunk });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
