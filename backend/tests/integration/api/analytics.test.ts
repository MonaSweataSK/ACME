import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import prisma from '../../../src/lib/prisma';

describe('Analytics API Integration Tests', () => {
  beforeEach(async () => {
    const c = await prisma.country.create({ data: { name: 'USA', currency_code: 'USD', usd_multiplier: 1.0 } });
    const d = await prisma.department.create({ data: { name: 'Engineering' } });
    const ds = await prisma.designation.create({ data: { name: 'Engineer', department_id: d.id } });
    
    // Seed a couple employees for aggregation
    for(let i=0; i<2; i++) {
      const emp = await prisma.employee.create({
        data: {
          employee_code: `EMP-000${i}`,
          first_name: 'Test',
          last_name: `User${i}`,
          email: `test${i}@acme.com`,
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
    }
  });

  it('should return aggregated dashboard overview with correct mathematical aggregations', async () => {
    const response = await request(app)
      .get('/api/analytics')
      .send();

    expect(response.status).toBe(200);
    
    const body = response.body;
    expect(body).toHaveProperty('summary');
    expect(body.summary.totalEmployees).toBe(2);
    expect(body.summary.totalPayrollUSD).toBe(200000); // 100k * 2
    expect(body.summary.averageSalaryUSD).toBe(100000);

    expect(body).toHaveProperty('departmentDistribution');
    expect(body.departmentDistribution.length).toBe(1);
    expect(body.departmentDistribution[0].departmentName).toBe('Engineering');
    expect(body.departmentDistribution[0].headcount).toBe(2);

    expect(body).toHaveProperty('salaryBands');
  });

  it('should return valid CSV export format', async () => {
    const response = await request(app)
      .get('/api/analytics/export')
      .send();

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
    
    // CSV should contain Headers and 2 rows
    const lines = response.text.split('\n').filter(l => l.trim() !== '');
    expect(lines.length).toBe(3); 
    expect(lines[0]).toContain('Employee Code');
  });
});
