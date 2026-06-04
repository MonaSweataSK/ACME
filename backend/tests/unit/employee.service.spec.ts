import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/lib/prisma';
import { createEmployee } from '../../src/services/employee.service';

describe('Employee Service Unit Tests', () => {
  let countryId: string, deptId: string, desigId: string;

  beforeEach(async () => {
    const c = await prisma.country.create({ data: { name: 'USA', currency_code: 'USD', usd_multiplier: 1.0 } });
    const d = await prisma.department.create({ data: { name: 'Engineering' } });
    const ds = await prisma.designation.create({ data: { name: 'Engineer', department_id: d.id } });
    
    countryId = c.id;
    deptId = d.id;
    desigId = ds.id;
  });

  it('should generate sequential employee codes via transaction', async () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@acme.com',
      departmentId: deptId,
      designationId: desigId,
      countryId: countryId,
      joinDate: new Date(),
      initialSalary: {
        baseSalary: 100000,
        bonus: 10000,
        allowances: 5000,
        effectiveDate: new Date(),
        reason: 'New Hire'
      }
    };

    const emp1 = await createEmployee(data);
    expect(emp1.employeeCode).toBe('EMP-00001');

    data.email = 'jane@acme.com';
    const emp2 = await createEmployee(data);
    expect(emp2.employeeCode).toBe('EMP-00002');
  });

  it('should reject duplicate emails', async () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'duplicate@acme.com',
      departmentId: deptId,
      designationId: desigId,
      countryId: countryId,
      joinDate: new Date(),
      initialSalary: {
        baseSalary: 100000,
        bonus: 10000,
        allowances: 5000,
        effectiveDate: new Date(),
        reason: 'New Hire'
      }
    };

    await createEmployee(data);
    await expect(createEmployee(data)).rejects.toThrow('already exists');
  });
});
