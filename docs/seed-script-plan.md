# Seed Data Generation Engine Implementation Plan

The goal is to create an automated seed script (`prisma/seed.ts`) capable of rapidly populating the SQLite database with 10,000 realistic employee records and their associated salary histories, maintaining strong referential integrity.

---

### Scripts

#### [NEW] [seed.ts](file:///d:/node%20js/ACME/backend/prisma/seed.ts)
The script will perform the following routine:

1. **Clean Slate**: Execute `deleteMany` across all tables (SalaryRecords, Employees, Designations, Departments, Countries) to prevent unique constraint clashes.
2. **Master Data Seeding**:
   - Create core **Countries** with realistic `usd_multiplier` values (e.g., India: INR, 0.012 multiplier; USA: USD, 1.0 multiplier; UK: GBP, 1.25 multiplier).
   - Create core **Departments** (Engineering, Sales, HR, etc.).
   - Create nested **Designations** tied to the departments.
3. **Data Generation Loop (10,000 Employees)**:
   - Loop 10,000 times to generate raw objects.
   - Assign random departments, designations, and countries.
   - Auto-generate sequential `employee_code` IDs (e.g., `EMP-00001`).
   - For 100% of employees, create one active `salary_record`.
   - For ~25% of employees, create 1-3 additional historical (inactive) `salary_record` entries representing past promotions or salary bumps.
4. **Chunked Insertion**:
   - Slice the raw Employee and SalaryRecord arrays into chunks of 500.
   - Await `prisma.employee.createMany()` for each chunk.
   - Await `prisma.salaryRecord.createMany()` for each chunk.
   
#### [MODIFY] [package.json](file:///d:/node%20js/ACME/backend/package.json)
- Add `@faker-js/faker` to `devDependencies`.
- Add `"seed": "ts-node prisma/seed.ts"` under scripts.
- Configure Prisma to recognize the seed script:
  ```json
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
  ```

## Verification Plan
1. Run `npm run seed` and verify it completes rapidly.
2. Manually trigger the `/api/analytics` endpoint and verify the total employee count reflects exactly `10,000`, validating that the associations mapped correctly and the multi-currency conversions output logical values.
