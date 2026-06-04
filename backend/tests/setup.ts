import path from 'path';

const testDbPath = path.join(__dirname, '../prisma/test.db');
process.env.DATABASE_URL = `file:${testDbPath}`;

import { afterAll, afterEach } from 'vitest';
import prisma from '../src/lib/prisma';
import fs from 'fs';

afterEach(async () => {
  // Wipe database tables between individual tests
  await prisma.salaryRecord.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.department.deleteMany();
  await prisma.country.deleteMany();
});

afterAll(async () => {
  // Disconnect client
  await prisma.$disconnect();
});
