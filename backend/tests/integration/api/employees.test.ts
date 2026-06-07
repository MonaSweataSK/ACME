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

// ---------------------------------------------------------------------------
// TDD: avatarUrl feature — API contract tests
// These tests define the HTTP-level contract for the avatarUrl field.
// ---------------------------------------------------------------------------
describe('Employees API — avatarUrl contract', () => {
  let empId: string;
  let empIdNoAvatar: string;

  beforeEach(async () => {
    const c = await prisma.country.create({ data: { name: 'USA', currency_code: 'USD', usd_multiplier: 1.0 } });
    const d = await prisma.department.create({ data: { name: 'Engineering' } });
    const ds = await prisma.designation.create({ data: { name: 'Engineer', department_id: d.id } });

    // Employee WITH avatar
    const empWithAvatar = await prisma.employee.create({
      data: {
        employee_code: 'EMP-00001',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@acme.com',
        department_id: d.id,
        designation_id: ds.id,
        country_id: c.id,
        join_date: new Date(),
        avatar_url: 'https://avatars.githubusercontent.com/u/55555',
      },
    });
    await prisma.salaryRecord.create({
      data: {
        employee_id: empWithAvatar.id,
        base_salary: 100000,
        total_ctc: 100000,
        currency_code: 'USD',
        effective_date: new Date(),
        reason: 'Initial',
        is_active: true,
      },
    });
    empId = empWithAvatar.id;

    // Employee WITHOUT avatar
    const empNoAvatar = await prisma.employee.create({
      data: {
        employee_code: 'EMP-00002',
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob@acme.com',
        department_id: d.id,
        designation_id: ds.id,
        country_id: c.id,
        join_date: new Date(),
        avatar_url: null,
      },
    });
    await prisma.salaryRecord.create({
      data: {
        employee_id: empNoAvatar.id,
        base_salary: 90000,
        total_ctc: 90000,
        currency_code: 'USD',
        effective_date: new Date(),
        reason: 'Initial',
        is_active: true,
      },
    });
    empIdNoAvatar = empNoAvatar.id;
  });

  it('GET /api/employees — each record should include an avatarUrl key', async () => {
    const response = await request(app).get('/api/employees?page=1&limit=10');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);

    for (const emp of response.body.data) {
      // avatarUrl must always be present — never undefined
      expect(emp).toHaveProperty('avatarUrl');
    }
  });

  it('GET /api/employees — returns the correct avatarUrl value when set', async () => {
    const response = await request(app).get('/api/employees?page=1&limit=10');

    expect(response.status).toBe(200);
    const jane = response.body.data.find((e: any) => e.email === 'jane@acme.com');
    expect(jane).toBeDefined();
    expect(jane.avatarUrl).toBe('https://avatars.githubusercontent.com/u/55555');
  });

  it('GET /api/employees — returns avatarUrl as null when employee has no avatar', async () => {
    const response = await request(app).get('/api/employees?page=1&limit=10');

    expect(response.status).toBe(200);
    const bob = response.body.data.find((e: any) => e.email === 'bob@acme.com');
    expect(bob).toBeDefined();
    expect(bob.avatarUrl).toBeNull();
  });

  it('GET /api/employees/:id — detail response should include avatarUrl', async () => {
    const response = await request(app).get(`/api/employees/${empId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('avatarUrl');
    expect(response.body.avatarUrl).toBe('https://avatars.githubusercontent.com/u/55555');
  });

  it('GET /api/employees/:id — detail response returns avatarUrl as null when not set', async () => {
    const response = await request(app).get(`/api/employees/${empIdNoAvatar}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('avatarUrl');
    expect(response.body.avatarUrl).toBeNull();
  });
});
