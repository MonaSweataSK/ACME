import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import prisma from '../../../src/lib/prisma';

describe('Employees API Integration Tests', () => {
  let countryId: string, deptId: string, desigId: string, empId: string;

  beforeEach(async () => {
    const c = await prisma.country.create({ data: { name: 'USA', currency_code: 'USD', usd_multiplier: 1.0 } });
    const d = await prisma.department.create({ data: { name: 'Engineering' } });
    const ds = await prisma.designation.create({ data: { name: 'Engineer', department_id: d.id } });
    
    countryId = c.id;
    deptId = d.id;
    desigId = ds.id;
    
    // Seed one employee to test pagination / fetch
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

  it('should validate and create a new employee', async () => {
    const payload = {
      firstName: 'Integration',
      lastName: 'Test',
      email: 'integration@acme.com',
      departmentId: deptId,
      designationId: desigId,
      countryId: countryId,
      joinDate: new Date().toISOString(),
      initialSalary: {
        baseSalary: 100000,
        bonus: 10000,
        allowances: 5000,
        effectiveDate: new Date().toISOString(),
        reason: 'New Hire'
      }
    };

    const response = await request(app)
      .post('/api/employees')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.employeeCode).toContain('EMP-');
  });

  it('should return 400 Bad Request on Zod schema validation failure', async () => {
    const badPayload = {
      firstName: 'Integration',
      // Missing lastName, email, etc.
    };

    const response = await request(app)
      .post('/api/employees')
      .send(badPayload);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should fetch employees with pagination limits', async () => {
    const response = await request(app)
      .get('/api/employees?page=1&limit=10')
      .send();

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
    });
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
