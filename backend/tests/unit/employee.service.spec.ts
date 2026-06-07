import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/lib/prisma';
import { createEmployee, getEmployees, getEmployeeById } from '../../src/services/employee.service';

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

// ---------------------------------------------------------------------------
// TDD: avatarUrl feature
// These tests define the contract that drove the avatarUrl implementation.
// ---------------------------------------------------------------------------
describe('Employee Service — avatarUrl field', () => {
  let countryId: string, deptId: string, desigId: string;

  beforeEach(async () => {
    const c = await prisma.country.create({ data: { name: 'USA', currency_code: 'USD', usd_multiplier: 1.0 } });
    const d = await prisma.department.create({ data: { name: 'Engineering' } });
    const ds = await prisma.designation.create({ data: { name: 'Engineer', department_id: d.id } });
    countryId = c.id;
    deptId = d.id;
    desigId = ds.id;
  });

  const makeEmployee = async (opts: { avatarUrl?: string | null; email?: string } = {}) => {
    const { avatarUrl = null, email = 'test@acme.com' } = opts;
    const d = await prisma.department.findFirst({ where: { id: deptId } });
    const ds2 = await prisma.designation.findFirst({ where: { id: desigId } });
    const c = await prisma.country.findFirst({ where: { id: countryId } });

    const emp = await prisma.employee.create({
      data: {
        employee_code: `EMP-${Date.now()}`,
        first_name: 'Alice',
        last_name: 'Smith',
        email,
        department_id: d!.id,
        designation_id: ds2!.id,
        country_id: c!.id,
        join_date: new Date(),
        avatar_url: avatarUrl,
      },
    });

    await prisma.salaryRecord.create({
      data: {
        employee_id: emp.id,
        base_salary: 80000,
        total_ctc: 80000,
        currency_code: 'USD',
        effective_date: new Date(),
        reason: 'Initial',
        is_active: true,
      },
    });

    return emp;
  };

  it('[getEmployees] should include avatarUrl in the list response', async () => {
    await makeEmployee({ avatarUrl: 'https://avatars.githubusercontent.com/u/12345' });

    const result = await getEmployees({ page: 1, limit: 10, sortBy: 'firstName', sortOrder: 'asc' });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toHaveProperty('avatarUrl');
    expect(result.data[0].avatarUrl).toBe('https://avatars.githubusercontent.com/u/12345');
  });

  it('[getEmployees] should return avatarUrl as null when not set', async () => {
    await makeEmployee({ avatarUrl: null });

    const result = await getEmployees({ page: 1, limit: 10, sortBy: 'firstName', sortOrder: 'asc' });

    expect(result.data[0]).toHaveProperty('avatarUrl');
    expect(result.data[0].avatarUrl).toBeNull();
  });

  it('[getEmployeeById] should include avatarUrl in the detail response', async () => {
    const emp = await makeEmployee({ avatarUrl: 'https://avatars.githubusercontent.com/u/99999' });

    const result = await getEmployeeById(emp.id);

    expect(result).toHaveProperty('avatarUrl');
    expect(result.avatarUrl).toBe('https://avatars.githubusercontent.com/u/99999');
  });

  it('[getEmployeeById] should return avatarUrl as null when employee has no avatar', async () => {
    const emp = await makeEmployee({ avatarUrl: null });

    const result = await getEmployeeById(emp.id);

    expect(result).toHaveProperty('avatarUrl');
    expect(result.avatarUrl).toBeNull();
  });

  it('[getEmployees] avatarUrl should be a string key on every item in the response', async () => {
    await makeEmployee({ avatarUrl: 'https://avatars.githubusercontent.com/u/11111', email: 'a@acme.com' });
    await makeEmployee({ avatarUrl: null, email: 'b@acme.com' });

    const result = await getEmployees({ page: 1, limit: 10, sortBy: 'firstName', sortOrder: 'asc' });

    expect(result.data).toHaveLength(2);
    for (const emp of result.data) {
      // avatarUrl must always be a key — never undefined
      expect('avatarUrl' in emp).toBe(true);
    }
  });
});
