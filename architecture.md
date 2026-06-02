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
│ PostgreSQL                         │
└────────────────────────────────────┘
```

---

# Technology Stack

| Layer | Technology |
|---------|------------|
| Backend | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Testing | Vitest |
| API Documentation | Swagger/OpenAPI |

---

# Folder Structure

```text
server/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   │
│   ├── app.ts
│   ├── index.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
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
│   │   ├── dashboard.routes.ts
│   │   └── analytics.routes.ts
│   │
│   ├── controllers/
│   │   ├── employee.controller.ts
│   │   ├── salary.controller.ts
│   │   ├── dashboard.controller.ts
│   │   └── analytics.controller.ts
│   │
│   ├── services/
│   │   ├── employee.service.ts
│   │   ├── salary.service.ts
│   │   ├── dashboard.service.ts
│   │   └── analytics.service.ts
│   │
│   └── schemas/
│       ├── employee.schema.ts
│       └── salary.schema.ts
│
└── tests/
```

---

# Database Architecture

## Departments

Stores company departments.

### Table: departments

| Column | Type |
|----------|--------|
| id | UUID |
| name | String |
| created_at | Timestamp |

### Example Departments

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

## Designations

Stores job titles available within departments.

### Table: designations

| Column | Type |
|----------|--------|
| id | UUID |
| name | String |
| department_id | UUID |
| created_at | Timestamp |

### Example Designations

#### Engineering
- Software Engineer
- Senior Software Engineer
- Staff Engineer
- Engineering Manager

#### Product
- Product Manager
- Senior Product Manager

#### Design
- UI Designer
- UX Designer

#### Finance
- Finance Analyst

#### HR
- HR Business Partner

---

## Countries

Stores employee countries and currencies.

### Table: countries

| Column | Type |
|----------|--------|
| id | UUID |
| name | String |
| currency_code | String |
| created_at | Timestamp |

---

## Employees

Stores employee profile information.

### Table: employees

| Column | Type |
|----------|--------|
| id | UUID |
| employee_code | String |
| first_name | String |
| last_name | String |
| email | String |
| department_id | UUID |
| designation_id | UUID |
| country_id | UUID |
| join_date | Date |
| status | Enum |
| created_at | Timestamp |
| updated_at | Timestamp |

### Relationships

```text
Employee
 ├── Department
 ├── Designation
 ├── Country
 └── Salary Records
```

---

## Salary Records

Stores employee salary history.

### Table: salary_records

| Column | Type |
|----------|--------|
| id | UUID |
| employee_id | UUID |
| effective_date | Date |
| base_salary | Decimal |
| bonus | Decimal |
| allowances | Decimal |
| total_ctc | Decimal |
| currency_code | String |
| reason | String |
| created_at | Timestamp |

### Relationship

```text
Employee
    │
    ├── Salary Record 1
    ├── Salary Record 2
    ├── Salary Record 3
    └── Salary Record N
```

---

# API Architecture

## Employee Module

### Endpoints

```http
GET    /employees
GET    /employees/:id

POST   /employees
PUT    /employees/:id
```

### Responsibilities

- Employee listing
- Employee search
- Employee filtering
- Employee creation
- Employee updates
- Salary history retrieval

---

## Salary Module

### Endpoints

```http
POST /employees/:id/salary
```

### Responsibilities

- Salary revisions
- Salary history management
- Total CTC calculation
- Immutable salary records

---

## Dashboard Module

### Endpoint

```http
GET /dashboard/summary
```

### Responsibilities

- Total employees
- Active employees
- Inactive employees
- Total payroll cost
- Average salary

---

## Analytics Module

### Endpoints

```http
GET /analytics/summary
GET /analytics/by-department
GET /analytics/by-country
GET /analytics/by-designation
GET /analytics/salary-distribution
GET /analytics/hiring-trends
GET /analytics/payroll-trends
GET /analytics/top-earners
```

### Responsibilities

- Department analytics
- Country analytics
- Designation analytics
- Salary distribution insights
- Hiring trend analysis
- Payroll trend analysis
- Compensation benchmarking

---

# Request Flow

```text
Request
   │
   ▼
Route
   │
   ▼
Controller
   │
   ▼
Validation
   │
   ▼
Service
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
   │
   ▼
Response
```

---

# Key Design Decisions

- Node.js + TypeScript backend
- Express REST APIs
- PostgreSQL database
- Prisma ORM
- Layered architecture (Route → Controller → Service)
- Salary history is immutable
- Department and Designation stored as separate entities
- Designation belongs to a Department
- Pagination for employee listing
- Search and filtering support
- Database indexing for performance
- Zod validation for request payloads
- Global error handling
- Unit and integration testing
- Seed dataset with 10,000 employees and salary history