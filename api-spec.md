# API Structure

## Base URL

```
/api
```

---

## Employee APIs

### Get Employees

**Endpoint**

```http
GET /employees
```

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (Defaults to 1) |
| `limit` | number | Records per page for client virtualization scopes (Defaults to 20) |
| `search` | string | Multi-vector wild-card text search by employee code, name, email |
| `departmentId` | string | Filter by department UUID |
| `designationId` | string | Filter by designation UUID |
| `countryId` | string | Filter by country UUID |
| `status` | string | `ACTIVE` / `INACTIVE` |
| `sortBy` | string | `firstName`, `joinDate`, `totalCtc` |
| `sortOrder` | string | `asc` / `desc` |

**Response**

```json
{
  "data": [
    {
      "id": "c3b8b1a8-8f8d-4e92-a1b2-1234567890ab",
      "employeeCode": "EMP-00001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "department": "Engineering",
      "designation": "Software Engineer",
      "country": "India",
      "status": "ACTIVE",
      "currentSalary": {
        "totalCtc": 1200000,
        "currencyCode": "INR"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 10000,
    "totalPages": 500
  }
}
```

---

### Get Employee Details

**Endpoint**

```http
GET /employees/:id
```

**Description**

Compiles a comprehensive employee master profile container matching the specified structural UUID path parameters alongside their complete historical pay scale timeline.

**Response**

```json
{
  "id": "c3b8b1a8-8f8d-4e92-a1b2-1234567890ab",
  "employeeCode": "EMP-00001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "department": {
    "id": "d1b8b1a8-8f8d-4e92-a1b2-1234567890cd",
    "name": "Engineering"
  },
  "designation": {
    "id": "e1b8b1a8-8f8d-4e92-a1b2-1234567890ef",
    "name": "Software Engineer"
  },
  "country": {
    "id": "f1b8b1a8-8f8d-4e92-a1b2-1234567890gh",
    "name": "India",
    "currencyCode": "INR"
  },
  "salaryHistory": [
    {
      "id": "s1a8b1a8-8f8d-4e92-a1b2-123456789012",
      "effectiveDate": "2025-04-01",
      "baseSalary": 1200000,
      "bonus": 100000,
      "allowances": 50000,
      "totalCtc": 1350000,
      "currencyCode": "INR",
      "reason": "Promotion",
      "isActive": true
    },
    {
      "id": "s2a8b1a8-8f8d-4e92-a1b2-123456789034",
      "effectiveDate": "2025-01-15",
      "baseSalary": 1000000,
      "bonus": 100000,
      "allowances": 50000,
      "totalCtc": 1150000,
      "currencyCode": "INR",
      "reason": "Initial Offer",
      "isActive": false
    }
  ]
}
```

---

### Create Employee

**Endpoint**

```http
POST /employees
```

**Description**

Registers a new hire within the database, auto-generating a unique `employeeCode`. It initializes the employee record and their starting salary contract inside a single, atomic database transaction block.

**Failure Handling Requirement:** The transactional execution window must fail entirely if either the employee profile or the initial salary payload fails Zod schema validations or instantiation. This must throw a clean 400 Bad Request or 422 Unprocessable Entity, ensuring no orphan corporate identities are left dangling.

**Request**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "departmentId": "d1b8b1a8-8f8d-4e92-a1b2-1234567890cd",
  "designationId": "e1b8b1a8-8f8d-4e92-a1b2-1234567890ef",
  "countryId": "f1b8b1a8-8f8d-4e92-a1b2-1234567890gh",
  "joinDate": "2025-06-01",
  "initialSalary": {
    "baseSalary": 1000000,
    "bonus": 100000,
    "allowances": 50000,
    "effectiveDate": "2025-06-01",
    "reason": "Initial Offer"
  }
}
```

**Response**

```json
{
  "id": "c3b8b1a8-8f8d-4e92-a1b2-1234567890ab",
  "employeeCode": "EMP-00001"
}
```

---

### Update Employee

**Endpoint**

```http
PUT /employees/:id
```

**Description**

Modifies basic administrative corporate configuration background vectors. Financial adjustments are blocked to protect historical line data integrity.

**Request**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "departmentId": "d1b8b1a8-8f8d-4e92-a1b2-1234567890cd",
  "designationId": "e1b8b1a8-8f8d-4e92-a1b2-1234567890ef",
  "countryId": "f1b8b1a8-8f8d-4e92-a1b2-1234567890gh",
  "status": "ACTIVE"
}
```

**Response**

```json
{
  "message": "Employee updated successfully"
}
```

---

## Salary APIs

### Add Salary Revision

**Endpoint**

```http
POST /employees/:id/salary
```

**Description**

Enforces historical compensation data log immutability via sequential execution blocks. It automatically processes total server-side calculations for Total CTC (Base + Bonus + Allowances) while handling transaction boundaries to safely shift active pointer tags.

**Request**

```json
{
  "effectiveDate": "2025-04-01",
  "baseSalary": 1200000,
  "bonus": 100000,
  "allowances": 50000,
  "reason": "Promotion"
}
```

**Response**

```json
{
  "id": "s1a8b1a8-8f8d-4e92-a1b2-123456789012",
  "totalCtc": 1350000
}
```

---

## Analytics API

### Analytics

**Endpoint**

```http
GET /analytics
```

**Description**

Compiles and flattens all high-level summary KPIs, multi-dimension analytical breakdowns, statistical salary band frequencies, and recent salary revision logs into a singular JSON payload.

This single-pass engine uses a localized lookup matrix window on the backend to avoid concurrent query bottlenecking over SQLite's thread footprint, converting regional metrics cleanly into standardized USD for tracking visibility.

**Response**

```json
{
  "summary": {
    "totalEmployees": 10000,
    "activeEmployees": 9700,
    "inactiveEmployees": 300,
    "totalPayrollUSD": 250000000,
    "averageSalaryUSD": 25000,
    "medianSalaryUSD": 22000
  },
  "departmentDistribution": [
    {
      "department": "Engineering",
      "headcount": 3000,
      "averageSalaryUSD": 40000,
      "minSalaryUSD": 15000,
      "maxSalaryUSD": 180000,
      "totalPayrollUSD": 120000000
    }
  ],
  "designationDistribution": [
    {
      "designation": "Software Engineer",
      "headcount": 1200,
      "averageSalaryUSD": 25000,
      "minSalaryUSD": 15000,
      "maxSalaryUSD": 45000
    }
  ],
  "countryDistribution": [
    {
      "country": "India",
      "headcount": 4000,
      "averageSalaryUSD": 22000,
      "totalPayrollUSD": 88000000
    }
  ],
  "salaryBands": [
    {
      "range": "0-25k",
      "employees": 2500
    },
    {
      "range": "25k-50k",
      "employees": 4200
    }
  ],
  "recentRevisions": [
    {
      "employeeCode": "EMP-00001",
      "name": "John Doe",
      "effectiveDate": "2025-04-01",
      "totalCtcUSD": 16265,
      "reason": "Promotion"
    }
  ]
}
```

---



---

### Export Analytics

**Endpoint**

`http
GET /analytics/export
`

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| departmentId | string | Filter export by department UUID |
| countryId | string | Filter export by country UUID |
| status | string | Filter export by ACTIVE / INACTIVE |

**Description**

On-demand export generation translating active analytical configurations into flat CSV formatting for standard reporting workflows. Returns a downloadable .csv file.

**Response**

`csv
Employee Code,Name,Department,Designation,Country,Status,Base Salary,Bonus,Allowances,Total CTC
EMP-00001,John Doe,Engineering,Software Engineer,India,ACTIVE,1200000,100000,50000,1350000
`

## Master Data APIs

These standalone endpoints are explicitly indexed to populate client application filters and configuration dropdown selectors.

### Get Departments

**Endpoint**

```http
GET /departments
```

**Response**

```json
{
  "data": [
    {
      "id": "d1b8b1a8-8f8d-4e92-a1b2-1234567890cd",
      "name": "Engineering"
    }
  ]
}
```

---

### Get Designations

**Endpoint**

```http
GET /designations
```

**Response**

```json
{
  "data": [
    {
      "id": "e1b8b1a8-8f8d-4e92-a1b2-1234567890ef",
      "name": "Software Engineer",
      "departmentId": "d1b8b1a8-8f8d-4e92-a1b2-1234567890cd"
    }
  ]
}
```

---

### Get Countries

**Endpoint**

```http
GET /countries
```

**Response**

```json
{
  "data": [
    {
      "id": "f1b8b1a8-8f8d-4e92-a1b2-1234567890gh",
      "name": "India",
      "currencyCode": "INR"
    }
  ]
}
```