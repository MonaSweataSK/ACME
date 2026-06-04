import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';
import type { GetEmployeesQuery } from '../schemas/employee.schema';
import type { Prisma } from '@prisma/client';

export async function getEmployees(query: GetEmployeesQuery) {
  const { page, limit, search, departmentId, designationId, countryId, status, sortBy, sortOrder } =
    query;

  const skip = (page - 1) * limit;

  // Build dynamic where clause
  const where: Prisma.EmployeeWhereInput = {};

  if (status) {
    where.status = status;
  }
  if (departmentId) {
    where.department_id = departmentId;
  }
  if (designationId) {
    where.designation_id = designationId;
  }
  if (countryId) {
    where.country_id = countryId;
  }

  // Multi-vector search: partial match on name/email, exact match on employee_code
  if (search) {
    where.OR = [
      { first_name: { contains: search } },
      { last_name: { contains: search } },
      { email: { contains: search } },
      { employee_code: { equals: search } },
    ];
  }

  // Build orderBy
  let orderBy: Prisma.EmployeeOrderByWithRelationInput = {};
  if (sortBy === 'firstName') {
    orderBy = { first_name: sortOrder };
  } else if (sortBy === 'joinDate') {
    orderBy = { join_date: sortOrder };
  } else if (sortBy === 'totalCtc') {
    // Sort by the active salary record's total_ctc
    orderBy = {
      salary_records: {
        _count: sortOrder,
      },
    };
  }

  const [employees, total] = await prisma.$transaction([
    prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        employee_code: true,
        first_name: true,
        last_name: true,
        email: true,
        status: true,
        join_date: true,
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true } },
        country: { select: { id: true, name: true, currency_code: true } },
        salary_records: {
          where: { is_active: true },
          select: { total_ctc: true, currency_code: true },
          take: 1,
        },
      },
    }),
    prisma.employee.count({ where }),
  ]);

  const data = employees.map((emp) => ({
    id: emp.id,
    employeeCode: emp.employee_code,
    firstName: emp.first_name,
    lastName: emp.last_name,
    email: emp.email,
    status: emp.status,
    joinDate: emp.join_date,
    department: emp.department.name,
    designation: emp.designation.name,
    country: emp.country.name,
    currentSalary: emp.salary_records[0]
      ? {
          totalCtc: emp.salary_records[0].total_ctc,
          currencyCode: emp.salary_records[0].currency_code,
        }
      : null,
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      employee_code: true,
      first_name: true,
      last_name: true,
      email: true,
      status: true,
      join_date: true,
      created_at: true,
      updated_at: true,
      department: { select: { id: true, name: true } },
      designation: { select: { id: true, name: true } },
      country: { select: { id: true, name: true, currency_code: true } },
      salary_records: {
        orderBy: { effective_date: 'desc' },
        select: {
          id: true,
          effective_date: true,
          base_salary: true,
          bonus: true,
          allowances: true,
          total_ctc: true,
          currency_code: true,
          reason: true,
          is_active: true,
          created_at: true,
        },
      },
    },
  });

  if (!employee) {
    throw new NotFoundError('Employee');
  }

  return {
    id: employee.id,
    employeeCode: employee.employee_code,
    firstName: employee.first_name,
    lastName: employee.last_name,
    email: employee.email,
    status: employee.status,
    joinDate: employee.join_date,
    createdAt: employee.created_at,
    updatedAt: employee.updated_at,
    department: employee.department,
    designation: employee.designation,
    country: employee.country,
    salaryHistory: employee.salary_records.map((s) => ({
      id: s.id,
      effectiveDate: s.effective_date,
      baseSalary: s.base_salary,
      bonus: s.bonus,
      allowances: s.allowances,
      totalCtc: s.total_ctc,
      currencyCode: s.currency_code,
      reason: s.reason,
      isActive: s.is_active,
      createdAt: s.created_at,
    })),
  };
}
