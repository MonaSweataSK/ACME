# Backend Planning

## 1. Project Setup

### Tasks
- Initialize Node.js + TypeScript project
- Configure Express
- Configure ESLint and Prettier
- Setup environment variables
- Create folder structure


## 2. Database Setup

### Tasks
- Setup PostgreSQL
- Setup Prisma ORM
- Create database schema
- Create tables:
  - departments
  - countries
  - employees
  - salary_records
- Add database indexes
- Run first migration


## 3. Core Infrastructure

### Tasks
- Prisma singleton setup
- Global error handling
- Request validation middleware
- 404 middleware
- App bootstrap
- Route registration


## 4. Employee Read APIs

### Endpoints
- GET `/employees`
- GET `/employees/:id`

### Features
- Pagination
- Search by employee name, email, employee code
- Filter by department
- Filter by designation
- Filter by country
- Filter by status
- Sorting
- Current salary retrieval
- Salary history retrieval

## 5. Employee Create API

### Endpoint
- POST `/employees`

### Features
- Create employee
- Generate employee code
- Create initial salary record
- Transaction support
- Request validation

## 6. Employee Update API

### Endpoint
- PUT `/employees/:id`

### Features
- Update employee profile
- Change department
- Change designation
- Activate/deactivate employee
- Email uniqueness validation

## 7. Salary Revision API

### Endpoint
- POST `/employees/:id/salary`

### Features
- Add salary revision
- Maintain salary history
- Compute total CTC
- Immutable salary records

## 8. Dashboard APIs

### Purpose
Provide a quick organizational overview for the landing page.

### Endpoints

#### GET `/dashboard/summary`

Returns:
- Total employees
- Active employees
- Inactive employees
- Total payroll cost
- Average salary

#### GET `/dashboard/recent-salary-revisions`

Returns:
- Latest salary revisions
- Employee details
- Revision date

### Features
- High-level KPI cards
- Recent activity section
- Fast-loading overview data


## 9. Analytics APIs

### Purpose
Provide detailed salary and workforce insights.

### Endpoints

#### GET `/analytics/summary`

Returns:
- Employee count
- Active employee count
- Payroll cost
- Average salary
- Median salary
- Highest salary
- Lowest salary

#### GET `/analytics/by-department`

Returns:
- Headcount by department
- Average salary
- Min salary
- Max salary
- Total payroll

#### GET `/analytics/by-country`

Returns:
- Headcount by country
- Average salary
- Total payroll

#### GET `/analytics/by-designation`

Returns:
- Headcount by designation
- Average salary
- Min salary
- Max salary

#### GET `/analytics/salary-distribution`

Returns:
- Salary bands
- Employee count per band

#### GET `/analytics/hiring-trends`

Returns:
- Monthly hiring trends
- Yearly hiring trends

#### GET `/analytics/payroll-trends`

Returns:
- Payroll growth trends over time

#### GET `/analytics/top-earners`

Returns:
- Highest paid employees

### Features
- Department insights
- Country insights
- Designation insights
- Salary distribution analysis
- Hiring trend analysis
- Payroll trend analysis
- Compensation benchmarking


## 10. Seed Data

### Seed Records
- 10 departments
- Countries
- 10,000 employees
- Salary history

### Departments
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

### Example Designations
- Software Engineer
- Senior Software Engineer
- Staff Engineer
- Engineering Manager
- Product Manager
- Senior Product Manager
- Designer
- Sales Executive
- Finance Analyst
- HR Business Partner


## 11. Unit Tests

### Services
- Employee Service
- Salary Service
- Dashboard Service
- Analytics Service


## 12. Integration Tests

### Routes
- Employees APIs
- Salary APIs
- Dashboard APIs
- Analytics APIs
