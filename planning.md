# Backend Planning: Salary Management System

## 1. Project Setup
### Tasks
* Initialize Node.js + TypeScript project
* Configure Express framework
* [cite_start]Configure ESLint and Prettier for automated code formatting [cite: 40]
* Setup environment variables (`.env.example`)
* Establish directory structure (Controllers, Services, Repositories, Middlewares, Routes)

---

## 2. Database Setup (SQLite & Prisma)
### Tasks
* [cite_start]Configure Prisma ORM to use the `sqlite` provider [cite: 26]
* Create local SQLite database file (`dev.db`)
* Design database schema with strict relations and cascading rules:
    * `countries`
    * `departments`
    * `employees`
    * `salary_records`
* [cite_start]**Performance Optimization:** Apply database indexes (`@@index`) to search targets and foreign keys to ensure instant lookups across 10,000 records[cite: 14, 52]:
    * `employees(name, email, employee_code)`
    * `employees(department_id, country_id, status)`
    * `salary_records(employee_id, is_active)`
* Generate and run the initial Prisma migration (`npx prisma migrate dev`)

---

## 3. Core Infrastructure
### Tasks
* Prisma client singleton utility setup to prevent connection pooling leaks in SQLite
* Global centralized error handling middleware (handles Prisma target errors, 404s, and unexpected syntax issues)
* [cite_start]Request payload validation middleware using a schema validator (like Zod) [cite: 10]
* Application bootstrap and server initialization routines

---

## 4. Employee Read APIs
### Endpoints
* `GET /employees`
* `GET /employees/:id`

### Implementation Strategy
* [cite_start]**Pagination & Virtualization Alignment:** Implement server-side pagination (`page`, `limit`) to protect the frontend DOM from rendering 10,000 nodes simultaneously[cite: 14, 52].
* **Search Vectors:** Support partial matching text search on employee name, email, and exact matching on employee code.
* [cite_start]**Relational Eager Loading:** Fetch the matching employee alongside their current department, country, and active salary structure in a single query block to eliminate N+1 query overhead[cite: 52].

---

## 5. Employee Create API
### Endpoint
* `POST /employees`

### Implementation Strategy
* [cite_start]Enforce request body validation (Name, Email, Country, Department, Designation, Base Salary, Bonus, Allowances)[cite: 10].
* Generate a unique, sequential/deterministic `employee_code`.
* [cite_start]**SQLite Transaction Isolation:** Wrap the creation of the `employee` record and their initial `salary_record` inside a strict Prisma `$transaction` block to guarantee atomicity (if either step fails, the entire database rollbacks)[cite: 10, 54].

---

## 6. Employee Update API
### Endpoint
* `PUT /employees/:id`

### Implementation Strategy
* [cite_start]Support structural modifications (Department, Designation, operational Country updates)[cite: 51].
* [cite_start]Incorporate status management (Toggle to set an employee as Active or Inactive)[cite: 51].
* Enforce email uniqueness validation rules during processing to avoid SQLite structural constraint violations.

---

## 7. Salary Revision API
### Endpoint
* `POST /employees/:id/salary`

### Implementation Strategy
* [cite_start]**Enforce Immutability:** Instead of updating an existing row, insert a brand-new `salary_record` to capture the audit trail[cite: 11, 51].
* [cite_start]**Transactional Promotion:** Use a sequential Prisma `$transaction` to locate the previous active salary record for the target employee, flag its `is_active` status to false, and insert the new salary version marked as active with the current timestamp and justification text[cite: 10, 54].
* Automatically compute Total CTC (`Base + Bonus + Allowances`) on the server side prior to writing to the database.

---

## 8. Dashboard APIs
### Endpoint
* `GET /dashboard/summary`

### Implementation Strategy
* [cite_start]Provide immediate visibility for the system landing page dashboard[cite: 44].
* [cite_start]Return streamlined organizational high-level states: Active count, Inactive count, global headcounts, and aggregate active payroll totals[cite: 51].
* [cite_start]**Recent Ingest Log:** Incorporate a small, limit-capped slice fetching the 5 most recent salary revisions across the entire company for immediate audit activity insight[cite: 51].

---

## 9. Analytics APIs (Consolidated Performance Engine)
### Endpoint
* `GET /analytics/dashboard-overview`

### Purpose
[cite_start]To avoid network request concurrency bottlenecks and single-threaded SQLite write/read contention, this single endpoint aggregates global enterprise workforce data into a single, unified JSON payload for the UI dashboard widgets[cite: 52, 53].

### Response Shape & Structure
* `summary`: Global aggregations (Headcount, total spend, average salary, and statistical median salary).
* [cite_start]`byDepartment`: Aggregated array grouping headcount, minimum, maximum, average, and total payroll per department[cite: 51].
* [cite_start]`byCountry`: Aggregated array grouping headcount and total payroll, natively converting local parameters into static reporting currency matrices (**USD**)[cite: 51].
* [cite_start]`byDesignation`: Employee clusters categorized across functional job tiers alongside computed average metrics[cite: 51].
* [cite_start]`salaryDistribution`: Binned data counting employee concentrations across explicit salary bands ($0\text{--}25\text{k}$, $25\text{k}\text{--}50\text{k}$, etc.)[cite: 51].
* [cite_start]`topEarners`: A fast, index-optimized query returning the top 5 highest compensated individuals globally for structural benchmarking[cite: 51].

---

## 10. Seed Data Generation Engine
### Tasks
* [cite_start]Create a standalone executable seed script (`prisma/seed.ts`)[cite: 31, 57].
* Seed structural reference lists: 10 core departments and primary international country targets.
* [cite_start]**Deterministic Scale Mocking:** Generate **10,000 employee records** distributed realistically across countries and departments with realistic localized currency brackets[cite: 14, 31].
* [cite_start]Generate multi-tier historical salary timelines for at least 25% of the seeded entities to provide rich analytics data straight out of the box[cite: 31].

---

## 11. Testing Suites (Unit & Integration)
### Unit Tests
* `employee.service.spec.ts`: Core validations, transaction controls, and programmatic code generation routines.
* `salary.service.spec.ts`: Remuneration compounding checks, mathematical edge cases, and compliance flag routines.

### Integration Tests (Fast & Deterministic)
* [cite_start]`api/employees.test.ts`: Route testing pagination schemas, search target parameter limits, and payload verification loops[cite: 39].
* [cite_start]`api/analytics.test.ts`: Testing the payload shape and mathematical aggregations of the consolidated dashboard overview API[cite: 39, 55].
* [cite_start]**Mock Isolation:** Isolate tests from runtime data corruption by utilizing an in-memory or decoupled test-specific SQLite database instance (`test.db`) initialized and destroyed across active lifecycle hooks (`beforeAll`/`afterAll`)[cite: 55].

---

## 12. Architectural Trade-offs & Guardrails
* **Single Connection SQLite Focus:** Because SQLite operates out of a local system file, concurrent write locks could bottleneck performance. [cite_start]Consolidating analytics into a singular database connection pass protects system stability and keeps processing speeds under 150ms[cite: 52, 53].
* [cite_start]**Server-Driven Currency Consolidation:** Rather than pushing complex foreign exchange computations onto frontend UI loops, currency translations into the reference reporting profile (USD) are executed entirely server-side within the unified aggregation block[cite: 52].