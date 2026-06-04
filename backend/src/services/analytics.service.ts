import prisma from '../lib/prisma';
import type { AnalyticsQuery } from '../schemas/analytics.schema';
import type { Prisma } from '@prisma/client';

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return values.length % 2 !== 0
    ? values[mid]
    : (values[mid - 1] + values[mid]) / 2;
}

function getSalaryBand(salaryUSD: number): string {
  if (salaryUSD <= 25000) return '0-25k';
  if (salaryUSD <= 50000) return '25k-50k';
  if (salaryUSD <= 75000) return '50k-75k';
  if (salaryUSD <= 100000) return '75k-100k';
  if (salaryUSD <= 150000) return '100k-150k';
  return '150k+';
}

export async function getAnalyticsDashboard(query: AnalyticsQuery) {
  const { departmentId, countryId, status } = query;

  const where: Prisma.EmployeeWhereInput = {};
  if (status) where.status = status;
  if (departmentId) where.department_id = departmentId;
  if (countryId) where.country_id = countryId;

  const employees = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      status: true,
      department: { select: { id: true, name: true } },
      designation: { select: { id: true, name: true } },
      country: { select: { id: true, name: true, usd_multiplier: true } },
      salary_records: {
        where: { is_active: true },
        select: { total_ctc: true },
        take: 1,
      },
    },
  });

  // Aggregation state
  let totalEmployees = 0;
  let activeEmployees = 0;
  let inactiveEmployees = 0;
  let totalPayrollUSD = 0;
  const allSalariesUSD: number[] = [];

  const deptMap = new Map<string, any>();
  const desigMap = new Map<string, any>();
  const countryMap = new Map<string, any>();
  const bandsMap = new Map<string, number>([
    ['0-25k', 0],
    ['25k-50k', 0],
    ['50k-75k', 0],
    ['75k-100k', 0],
    ['100k-150k', 0],
    ['150k+', 0],
  ]);

  for (const emp of employees) {
    totalEmployees++;
    if (emp.status === 'ACTIVE') activeEmployees++;
    else inactiveEmployees++;

    const activeSalary = emp.salary_records[0];
    if (!activeSalary) continue;

    const usdTotal = activeSalary.total_ctc * emp.country.usd_multiplier;
    totalPayrollUSD += usdTotal;
    allSalariesUSD.push(usdTotal);

    // Department Distribution
    if (!deptMap.has(emp.department.name)) {
      deptMap.set(emp.department.name, {
        departmentName: emp.department.name,
        headcount: 0,
        totalPayrollUSD: 0,
        minSalaryUSD: Infinity,
        maxSalaryUSD: 0,
      });
    }
    const dept = deptMap.get(emp.department.name);
    dept.headcount++;
    dept.totalPayrollUSD += usdTotal;
    if (usdTotal < dept.minSalaryUSD) dept.minSalaryUSD = usdTotal;
    if (usdTotal > dept.maxSalaryUSD) dept.maxSalaryUSD = usdTotal;

    // Designation Distribution
    if (!desigMap.has(emp.designation.name)) {
      desigMap.set(emp.designation.name, {
        designationName: emp.designation.name,
        headcount: 0,
        totalPayrollUSD: 0,
        minSalaryUSD: Infinity,
        maxSalaryUSD: 0,
      });
    }
    const desig = desigMap.get(emp.designation.name);
    desig.headcount++;
    desig.totalPayrollUSD += usdTotal;
    if (usdTotal < desig.minSalaryUSD) desig.minSalaryUSD = usdTotal;
    if (usdTotal > desig.maxSalaryUSD) desig.maxSalaryUSD = usdTotal;

    // Country Distribution
    if (!countryMap.has(emp.country.name)) {
      countryMap.set(emp.country.name, {
        countryName: emp.country.name,
        headcount: 0,
        totalPayrollUSD: 0,
      });
    }
    const ctry = countryMap.get(emp.country.name);
    ctry.headcount++;
    ctry.totalPayrollUSD += usdTotal;

    // Salary Bands
    const band = getSalaryBand(usdTotal);
    bandsMap.set(band, (bandsMap.get(band) || 0) + 1);
  }

  // Format aggregations
  const averageSalaryUSD = totalEmployees > 0 ? totalPayrollUSD / totalEmployees : 0;
  const medianSalaryUSD = calculateMedian(allSalariesUSD);

  const departmentDistribution = Array.from(deptMap.values()).map((d) => ({
    departmentName: d.departmentName,
    headcount: d.headcount,
    averageSalaryUSD: Math.round(d.totalPayrollUSD / d.headcount),
    minSalaryUSD: d.minSalaryUSD === Infinity ? 0 : Math.round(d.minSalaryUSD),
    maxSalaryUSD: Math.round(d.maxSalaryUSD),
    totalPayrollUSD: Math.round(d.totalPayrollUSD),
  }));

  const designationDistribution = Array.from(desigMap.values()).map((d) => ({
    designationName: d.designationName,
    headcount: d.headcount,
    averageSalaryUSD: Math.round(d.totalPayrollUSD / d.headcount),
    minSalaryUSD: d.minSalaryUSD === Infinity ? 0 : Math.round(d.minSalaryUSD),
    maxSalaryUSD: Math.round(d.maxSalaryUSD),
  }));

  const countryDistribution = Array.from(countryMap.values()).map((c) => ({
    countryName: c.countryName,
    headcount: c.headcount,
    averageSalaryUSD: Math.round(c.totalPayrollUSD / c.headcount),
    totalPayrollUSD: Math.round(c.totalPayrollUSD),
  }));

  const salaryBands = Array.from(bandsMap.entries()).map(([range, employeeCount]) => ({
    range,
    employeeCount,
  }));

  // Fetch recent revisions (limit 5 globally)
  const recentRecords = await prisma.salaryRecord.findMany({
    where: {
      employee: where,
    },
    orderBy: { created_at: 'desc' },
    take: 5,
    select: {
      effective_date: true,
      total_ctc: true,
      reason: true,
      employee: {
        select: {
          employee_code: true,
          first_name: true,
          last_name: true,
          country: { select: { usd_multiplier: true } },
        },
      },
    },
  });

  const recentRevisions = recentRecords.map((r) => ({
    employeeCode: r.employee.employee_code,
    name: `${r.employee.first_name} ${r.employee.last_name}`,
    effectiveDate: r.effective_date,
    totalCtcUSD: Math.round(r.total_ctc * r.employee.country.usd_multiplier),
    reason: r.reason,
  }));

  return {
    summary: {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalPayrollUSD: Math.round(totalPayrollUSD),
      averageSalaryUSD: Math.round(averageSalaryUSD),
      medianSalaryUSD: Math.round(medianSalaryUSD),
    },
    departmentDistribution,
    designationDistribution,
    countryDistribution,
    salaryBands,
    recentRevisions,
  };
}

export async function getAnalyticsExport(query: AnalyticsQuery): Promise<string> {
  const { departmentId, countryId, status } = query;

  const where: Prisma.EmployeeWhereInput = {};
  if (status) where.status = status;
  if (departmentId) where.department_id = departmentId;
  if (countryId) where.country_id = countryId;

  const employees = await prisma.employee.findMany({
    where,
    select: {
      employee_code: true,
      first_name: true,
      last_name: true,
      status: true,
      department: { select: { name: true } },
      designation: { select: { name: true } },
      country: { select: { name: true } },
      salary_records: {
        where: { is_active: true },
        select: { base_salary: true, bonus: true, allowances: true, total_ctc: true },
        take: 1,
      },
    },
  });

  const escapeCSV = (value: string | number) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    'Employee Code',
    'Name',
    'Department',
    'Designation',
    'Country',
    'Status',
    'Base Salary',
    'Bonus',
    'Allowances',
    'Total CTC',
  ];

  const rows = employees.map((emp) => {
    const activeSalary = emp.salary_records[0];
    return [
      escapeCSV(emp.employee_code),
      escapeCSV(`${emp.first_name} ${emp.last_name}`),
      escapeCSV(emp.department.name),
      escapeCSV(emp.designation.name),
      escapeCSV(emp.country.name),
      escapeCSV(emp.status),
      escapeCSV(activeSalary?.base_salary || 0),
      escapeCSV(activeSalary?.bonus || 0),
      escapeCSV(activeSalary?.allowances || 0),
      escapeCSV(activeSalary?.total_ctc || 0),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
