import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/lib/prisma';
import { addSalaryRevision } from '../../src/services/salary.service';

describe('Salary Service Unit Tests', () => {
  let empId: string;

  beforeEach(async () => {
    const c = await prisma.country.create({ data: { name: 'USA', currency_code: 'USD', usd_multiplier: 1.0 } });
    const d = await prisma.department.create({ data: { name: 'Engineering' } });
    const ds = await prisma.designation.create({ data: { name: 'Engineer', department_id: d.id } });
    
    const emp = await prisma.employee.create({
      data: {
        employee_code: 'EMP-00001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@acme.com',
        department_id: d.id,
        designation_id: ds.id,
        country_id: c.id,
        join_date: new Date(),
      }
    });

    await prisma.salaryRecord.create({
      data: {
        employee_id: emp.id,
        base_salary: 100000,
        total_ctc: 100000,
        currency_code: 'USD',
        effective_date: new Date(),
        reason: 'Initial',
        is_active: true
      }
    });

    empId = emp.id;
  });

  it('should automatically compute Total CTC correctly', async () => {
    const res = await addSalaryRevision(empId, {
      baseSalary: 120000,
      bonus: 20000,
      allowances: 10000,
      effectiveDate: new Date(),
      reason: 'Promotion'
    });

    expect(res.totalCtc).toBe(150000); // 120k + 20k + 10k
  });

  it('should enforce historical immutability by flagging previous record as inactive', async () => {
    await addSalaryRevision(empId, {
      baseSalary: 120000,
      bonus: 20000,
      allowances: 10000,
      effectiveDate: new Date(),
      reason: 'Promotion'
    });

    const records = await prisma.salaryRecord.findMany({
      where: { employee_id: empId },
      orderBy: { created_at: 'asc' }
    });

    expect(records.length).toBe(2);
    expect(records[0].is_active).toBe(false);
    expect(records[1].is_active).toBe(true);
  });
});
