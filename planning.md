# Backend Planning: Salary Management System

## 1. Project Setup
### Tasks
* Initialize Node.js + TypeScript project
* Configure Express framework
* Configure ESLint and Prettier for automated code formatting [cite: 40]
* Setup environment variables (`.env.example`)
* Establish directory structure (Controllers, Services, Repositories, Middlewares, Routes)

---

## 2. Database Setup (SQLite & Prisma)
### Tasks
* Configure Prisma ORM to use the `sqlite` provider.
* Create local SQLite database file (`dev.db`)
* Design database schema with strict relations and cascading rules:
    * `countries` (includes `usd_multiplier` for static exchange rates)
    * `departments`
    * `designations`
    * `employees`
    * `salary_records`
* **Performance Optimization:** Apply database indexes (`@@index`) to search targets and foreign keys to ensure instant lookups across 10,000 records:
    * `employees(name, email, employee_code)` - used for search and filtering
    * `employees(department_id, country_id, status)` - used for filtering
    * `salary_records(employee_id, is_active)` - used for filtering
* Generate and run the initial Prisma migration (`npx prisma migrate dev`)

---

## 3. Core Infrastructure
### Tasks
* Prisma client singleton utility setup to prevent connection pooling leaks in SQLite
* Global centralized error handling middleware (handles Prisma target errors, 404s, and unexpected syntax issues)
* Request payload validation middleware using a schema validator (like Zod)

---

## 4. Employee Read APIs
### Endpoints
* `GET /employees`
* `GET /employees/:id`

### Implementation Strategy
* **Pagination & Virtualization Alignment:** Implement server-side pagination (`page`, `limit`) to protect the frontend DOM from rendering 10,000 nodes simultaneously.
* **Search Vectors:** Support partial matching text search on employee name, email, and exact matching on employee code.
***Relational Eager Loading:** Fetch the matching employee alongside their current department, country, and active salary structure in a single query block to eliminate N+1 query overhead.

---

## 5. Employee Create API
### Endpoint
* `POST /employees`

### Implementation Strategy
* Enforce request body validation (Name, Email, Country, Department, Designation, Base Salary, Bonus, Allowances).
* Generate a unique, sequential/deterministic `employee_code`.
**SQLite Transaction Isolation:** Wrap the creation of the `employee` record and their initial `salary_record` inside a strict Prisma `$transaction` block to guarantee atomicity (if either step fails, the entire database rollbacks)

---

## 6. Employee Update API
### Endpoint
* `PUT /employees/:id`

### Implementation Strategy
* Support structural modifications (Department, Designation, operational Country updates)
* Incorporate status management (Toggle to set an employee as Active or Inactive).
* Enforce email uniqueness validation rules during processing to avoid SQLite structural constraint violations.

---

## 7. Salary Revision API
### Endpoint
* `POST /employees/:id/salary`

### Implementation Strategy
**Enforce Immutability:** Instead of updating an existing row, insert a brand-new `salary_record` to capture the audit trail.
**Transactional Promotion:** Use a sequential Prisma `$transaction` to locate the previous active salary record for the target employee, flag its `is_active` status to false, and insert the new salary version marked as active with the current timestamp and justification text.
* Automatically compute Total CTC (`Base + Bonus + Allowances`) on the server side prior to writing to the database.

---

## 8. Analytics API (Consolidated Performance Engine)
### Endpoint
* `GET /analytics`

### Purpose
To avoid network request concurrency bottlenecks and single-threaded SQLite write/read contention, this single endpoint aggregates both dashboard summaries and global enterprise workforce analytics into a single, unified JSON payload for the UI.

### Implementation Strategy & Response Shape
* `summary`: Global aggregations (Active/Inactive counts, total spend, average salary, and statistical median salary).
* `departmentDistribution`: Aggregated array grouping headcount, minimum, maximum, average, and total payroll per department.
* `countryDistribution`: Aggregated array grouping headcount and total payroll, natively converting local parameters into static reporting currency matrices (**USD**).
* `designationDistribution`: Employee clusters categorized across functional job tiers alongside computed average metrics.
* `salaryBands`: Binned data counting employee concentrations across explicit salary bands.
* `recentRevisions`: A fast slice fetching the 5 most recent salary revisions globally for immediate audit activity insight.

---

## 9. Seed Data Generation Engine
### Tasks
* **Create a seed script** (`prisma/seed.ts`) that can be run from the command line.
* **Why we use a static `usd_multiplier`:** The column holds a fixed conversion rate to USD, making conversion deterministic, removing the need for external services, and allowing all calculations to run inside a single Prisma transaction for atomicity and auditability.
* **Generate realistic data:** Create **10,000** employee records spread across countries and departments, using the static `usd_multiplier` to set salaries in local currency and also store the USD value.
* **Add historical salary timelines:** For roughly 25 % of employees, generate multiple salary‑record entries to give the analytics engine a rich data set.

---

## 10. Testing Suites (Unit & Integration)
### Unit Tests
* `employee.service.spec.ts`: Core validations, transaction controls, and programmatic code generation routines.
* `salary.service.spec.ts`: Remuneration compounding checks, mathematical edge cases, and compliance flag routines.

### Integration Tests (Fast & Deterministic)
* `api/employees.test.ts`: Route testing pagination schemas, search target parameter limits, and payload verification loops.
* `api/analytics.test.ts`: Testing the payload shape and mathematical aggregations of the consolidated dashboard overview API.
* **Mock Isolation:** Isolate tests from runtime data corruption by utilizing an in-memory or decoupled test-specific SQLite database instance (`test.db`) initialized and destroyed across active lifecycle hooks (`beforeAll`/`afterAll`).

---

## 11. Architectural Trade-offs & Guardrails
* **Single Connection SQLite Focus:** Because SQLite operates out of a local system file, concurrent write locks could bottleneck performance. Consolidating analytics into a singular database connection pass protects system stability and keeps processing speeds under 150ms.
* **Server-Driven Currency Consolidation:** Rather than pushing complex foreign exchange computations onto frontend UI loops, currency translations into the reference reporting profile (USD) are executed entirely server-side within the unified aggregation block.