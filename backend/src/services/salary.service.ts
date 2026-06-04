import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';
import type { CreateSalaryRevision } from '../schemas/salary.schema';

export async function addSalaryRevision(employeeId: string, data: CreateSalaryRevision) {
  // 1. Verify employee exists and get country for currency_code
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { country: true },
  });

  if (!employee) {
    throw new NotFoundError('Employee');
  }

  const currencyCode = employee.country.currency_code;
  const totalCtc = data.baseSalary + data.bonus + data.allowances;

  // 2. Transactional Promotion
  const result = await prisma.$transaction(async (tx) => {
    // Find the currently active salary record
    const currentActive = await tx.salaryRecord.findFirst({
      where: { employee_id: employeeId, is_active: true },
    });

    // If there is an active record, mark it as inactive
    if (currentActive) {
      await tx.salaryRecord.update({
        where: { id: currentActive.id },
        data: { is_active: false },
      });
    }

    // Insert the new salary version
    const newRecord = await tx.salaryRecord.create({
      data: {
        employee_id: employeeId,
        base_salary: data.baseSalary,
        bonus: data.bonus,
        allowances: data.allowances,
        total_ctc: totalCtc,
        currency_code: currencyCode,
        effective_date: data.effectiveDate,
        reason: data.reason,
        is_active: true,
      },
    });

    return newRecord;
  });

  return {
    id: result.id,
    totalCtc: result.total_ctc,
  };
}
