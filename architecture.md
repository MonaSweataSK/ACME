# ACME HR Salary Management - Backend Architecture

## High-Level Architecture

```text
┌─────────────────┐
│   React Frontend│
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│ Express API     │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────────┐
│         Application Layer          │
├────────────────────────────────────┤
│ Routes                             │
│ Controllers                        │
│ Services                           │
│ Validation (Zod)                   │
│ Error Handling                     │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│            Data Layer              │
├────────────────────────────────────┤
│ Prisma ORM                         │
│ SQLite                      │
└────────────────────────────────────┘
```

---

# Technology Stack

| Layer | Technology |
|---------|------------|
| Backend | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| Database | SQLite |
| ORM | Prisma |
| Validation | Zod |
| Testing | Vitest |
| API Documentation | Swagger/OpenAPI |

---

# Folder Structure

```server/
│
├── prisma/
│   ├── schema.prisma (Configured with the sqlite provider)
│   └── seed.ts (Automated script generating 10,000 employees and logs)
│
├── src/
│   │
│   ├── app.ts
│   ├── index.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts (Singleton Prisma instance container)
│   │   └── errors.ts
│   │
│   ├── middleware/
│   │   ├── validate.ts
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   │
│   ├── routes/
│   │   ├── employee.routes.ts
│   │   ├── salary.routes.ts
│   │   └── analytics.routes.ts (Analytics Router)
│   │
│   ├── controllers/
│   │   ├── employee.controller.ts
│   │   ├── salary.controller.ts
│   │   └── analytics.controller.ts
│   │
│   ├── services/
│   │   ├── employee.service.ts
│   │   ├── salary.service.ts
│   │   └── analytics.service.ts (Compiles all data matrix components)
│   │
│   └── schemas/
│       ├── employee.schema.ts
│       └── salary.schema.ts
│
└── tests/
```

# Database Architecture

The system uses **SQLite** as the database and **Prisma ORM** for data modeling and access.

SQLite uses dynamic type affinity, while Prisma provides a structured schema layer that enforces relationships and constraints. Since the application is designed to support up to **10,000 employees**, indexes are added to frequently queried columns and foreign keys to ensure efficient filtering, searching, sorting, and pagination.

---

# Entity Relationship Diagram

```text
               ┌──────────────┐
               │  countries   │
               └──────┬───────┘
                      │ 1
                      │
                      │ N
┌────────────────┐ 1  │    N ┌──────────────┐
│  departments   ├───┼─────►│  employees   │
└───────┬────────┘    │      └──────┬───────┘
        │ 1           │             │ 1
        │             │             │
        │ N           │             │ N
┌───────▼────────┐    │      ┌──────▼───────┐
│  designations  │◄───┘      │salary_records│
└────────────────┘           └──────────────┘
```

---

# Table: departments

Stores organizational departments.

| Column | Type | Attributes |
|----------|----------|------------|
| id | UUID | Primary Key |
| name | String | Unique |
| created_at | Timestamp | |

### Example Records

- Engineering
- Product
- Design
- Sales
- Marketing
- Finance
- HR
- Operations
- Customer Success
- Data

---

# Table: designations

Stores job titles associated with departments.

| Column | Type | Attributes |
|----------|----------|------------|
| id | UUID | Primary Key |
| name | String | |
| department_id | UUID | Foreign Key |
| created_at | Timestamp | |

### Example Records

- Software Engineer
- Senior Software Engineer
- Staff Engineer
- Engineering Manager
- Product Manager
- UX Designer

---

# Table: countries

Stores country and currency information.

| Column | Type | Attributes |
|----------|----------|------------|
| id | UUID | Primary Key |
| name | String | Unique |
| currency_code | String | |
| usd_multiplier | Decimal | Static exchange rate to USD |
| created_at | Timestamp | |

---

# Table: employees

Stores employee profile and organizational information.

| Column | Type | Attributes |
|----------|----------|------------|
| id | UUID | Primary Key |
| employee_code | String | Unique |
| first_name | String | |
| last_name | String | |
| email | String | Unique |
| department_id | UUID | Foreign Key |
| designation_id | UUID | Foreign Key |
| country_id | UUID | Foreign Key |
| join_date | Date | |
| status | Enum | ACTIVE / INACTIVE |
| created_at | Timestamp | |
| updated_at | Timestamp | |

## Performance Indexes

Indexes are applied on:

- employee_code
- email
- name
- status
- foreign key relationships

These indexes enable efficient:

- Search
- Filtering
- Sorting
- Server-side pagination

---

# Table: salary_records

Stores employee salary history as immutable audit records.

| Column | Type | Attributes |
|----------|----------|------------|
| id | UUID | Primary Key |
| employee_id | UUID | Foreign Key |
| effective_date | Date | |
| base_salary | Decimal | |
| bonus | Decimal | |
| allowances | Decimal | |
| total_ctc | Decimal | System Calculated |
| currency_code | String | |
| reason | String | Required Audit Field |
| is_active | Boolean | Indicates Current Salary Record |
| created_at | Timestamp | |

## Performance Indexes

A compound index is applied on:

```text
(employee_id, is_active)
```

This allows the application to instantly retrieve the currently active compensation record for an employee.

---

# Salary History Model

Salary records are maintained as immutable entries to preserve a complete compensation audit trail.

```text
Employee
    │
    ├── Salary Record 1 (is_active: false)
    ├── Salary Record 2 (is_active: false)
    └── Salary Record 3 (is_active: true)
            ▲
            │
            └── Current Active Compensation Record
```

---

# Design Considerations

- All entities use UUID-based primary keys.
- Salary history is preserved for auditability and compliance.
- Employees are linked to departments, designations, and countries through foreign keys.
- Compensation records are versioned rather than updated in place.
- Strategic indexing ensures fast query performance for datasets containing up to 10,000 employees.
- Prisma ORM manages relationships, schema migrations, and type-safe database access.

---

# API Architecture

## 5.1 Employee Module
Endpoints: 
* GET /api/employees
* GET /api/employees/:id
* POST /api/employees
* PUT /api/employees/:id

Responsibilities: Paginated query parsing to match client virtualization scopes, multi-vector wild-card text searches, configuration updates, and relational profile compiling. For `POST /api/employees`, the transactional execution window must fail entirely if either the employee profile or the initial salary payload fails Zod schema validations or instantiation, throwing a clean 400 Bad Request or 422 Unprocessable Entity to prevent orphan corporate identities from leaking.

## 5.2 Salary Module
Endpoints: 
* POST /api/employees/:id/salary

Responsibilities: Enforces historical log immutability via sequential execution blocks, handles automated server-side calculation of Total CTC (Base + Bonus + Allowances), and manages atomic transaction boundaries (marking previous salary logs as inactive while inserting the new record).

## 5.3 Analytics Module
Endpoints: 
* GET /api/analytics
* GET /api/analytics/export

Responsibilities: Compiles and flattens all high-level summary KPIs (Active headcount splits, corporate payroll expenditure, average/median CTC metrics), multi-dimension analytical breakdowns (Department, Designation, Country distributions), statistical salary band frequencies ($0-25k, $25k-50k, etc.), and the 5 most recent salary revision logs into a singular JSON payload (reactive to Country, Department, and Status filters), and providing on-demand flat CSV report exports to prevent concurrent read-lock overhead in SQLite

---

# Request Flow

```text
Client Request (Single Analytics Overview or Paginated List Fetch)
   │
   ▼
Route Routing Gateway
   │
   ▼
Zod Input Schema Verification Middleware
   │
   ▼
Controller Interface Mapping Layer
   │
   ▼
Service Layer (Aggregates Matrix Arrays / Executes Atomic Transactions)
   │
   ▼
Prisma ORM Client Query Compile
   │
   ▼
SQLite Native Execution Pipeline (.db Local File System)
   │
   ▼
Centralized Global Exception Handler (Triggers rollback on application faults)
   │
   ▼
Structured JSON Network Response Transmission
```

---

# Key Design Decisions

- Pivoted to SQLite Engine: Swapped from PostgreSQL to a local file system storage database layer to guarantee the reviewer enjoys a zero-dependency, zero-configuration onboarding experience.

- Consolidated Single-Endpoint Aggregation: Merged separate analytical and dashboard summary endpoints into a singular route payload (/api/analytics) to run gracefully within SQLite's single-threaded nature, minimizing thread-lock overhead and preventing client UI flickering.

- Strict Revision Immutability: Salary adjustments are exclusively write-only inserts rather than destructive inline table adjustments, preserving a complete corporate audit trail.

- Multi-Currency Standardization: All multi-currency benchmarks are converted cleanly on the server into a standard reporting currency profile (USD) using a deterministic, internally seeded translation matrix (via the `usd_multiplier` column in the `countries` table) to protect performance.

- Scale and Memory Guardrails: Coupled server-side query pagination with frontend list virtualization to ensure the application processes the 10,000-employee dataset smoothly without browser thread locks or DOM bloat.