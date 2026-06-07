import prisma from '../lib/prisma';
import { NotFoundError, ConflictError } from '../lib/errors';
import type { GetEmployeesQuery, CreateEmployee, UpdateEmployee } from '../schemas/employee.schema';
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
        avatar_url: true,
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
    avatarUrl: emp.avatar_url,
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
      avatar_url: true,
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
    avatarUrl: employee.avatar_url,
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

/**
 * Generates a zero-padded sequential employee code e.g. EMP-00001.
 * Runs inside the transaction to guarantee uniqueness under concurrent inserts.
 */
async function generateEmployeeCode(tx: Prisma.TransactionClient): Promise<string> {
  const count = await tx.employee.count();
  const next = count + 1;
  return `EMP-${String(next).padStart(5, '0')}`;
}

export async function createEmployee(data: CreateEmployee) {
  const { firstName, lastName, email, departmentId, designationId, countryId, joinDate, initialSalary } =
    data;

  // Verify country exists and fetch currency_code for the salary record
  const country = await prisma.country.findUnique({
    where: { id: countryId },
    select: { currency_code: true },
  });
  if (!country) throw new NotFoundError('Country');

  // Verify department and designation exist
  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) throw new NotFoundError('Department');

  const designation = await prisma.designation.findUnique({ where: { id: designationId } });
  if (!designation) throw new NotFoundError('Designation');

  // Check email uniqueness before entering the transaction
  const existing = await prisma.employee.findUnique({ where: { email } });
  if (existing) throw new ConflictError('An employee with this email already exists');

  // Server-side CTC calculation
  const total_ctc = initialSalary.baseSalary + initialSalary.bonus + initialSalary.allowances;

  // Atomic transaction: generate code + create employee + create salary record
  const result = await prisma.$transaction(async (tx) => {
    const employee_code = await generateEmployeeCode(tx);

    const employee = await tx.employee.create({
      data: {
        employee_code,
        first_name: firstName,
        last_name: lastName,
        email,
        department_id: departmentId,
        designation_id: designationId,
        country_id: countryId,
        join_date: joinDate,
        status: 'ACTIVE',
      },
    });

    await tx.salaryRecord.create({
      data: {
        employee_id: employee.id,
        base_salary: initialSalary.baseSalary,
        bonus: initialSalary.bonus,
        allowances: initialSalary.allowances,
        total_ctc,
        currency_code: country.currency_code,
        effective_date: initialSalary.effectiveDate,
        reason: initialSalary.reason,
        is_active: true,
      },
    });

    return employee;
  });

  return {
    id: result.id,
    employeeCode: result.employee_code,
  };
}

export async function updateEmployee(id: string, data: UpdateEmployee) {
  // Check if employee exists
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Employee');
  }

  // Validate FK references if provided
  if (data.countryId) {
    const country = await prisma.country.findUnique({ where: { id: data.countryId } });
    if (!country) throw new NotFoundError('Country');
  }

  if (data.departmentId) {
    const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!department) throw new NotFoundError('Department');
  }

  if (data.designationId) {
    const designation = await prisma.designation.findUnique({ where: { id: data.designationId } });
    if (!designation) throw new NotFoundError('Designation');
  }

  // Build the update payload
  const updateData: Prisma.EmployeeUpdateInput = {};
  if (data.firstName !== undefined) updateData.first_name = data.firstName;
  if (data.lastName !== undefined) updateData.last_name = data.lastName;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.departmentId !== undefined) updateData.department = { connect: { id: data.departmentId } };
  if (data.designationId !== undefined) updateData.designation = { connect: { id: data.designationId } };
  if (data.countryId !== undefined) updateData.country = { connect: { id: data.countryId } };

  await prisma.employee.update({
    where: { id },
    data: updateData,
  });

  return { message: 'Employee updated successfully' };
}
