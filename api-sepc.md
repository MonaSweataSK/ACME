# API Structure

## Base URL

```http
/api
```

---

# Employee APIs

## Get Employees

### Endpoint

```http
GET /employees
```

### Query Parameters

| Parameter | Type | Description |
|------------|------|-------------|
| page | number | Page number |
| limit | number | Records per page |
| search | string | Search by employee code, name, email |
| departmentId | string | Filter by department |
| designationId | string | Filter by designation |
| countryId | string | Filter by country |
| status | string | ACTIVE / INACTIVE |
| sortBy | string | firstName, joinDate, totalCtc |
| sortOrder | string | asc / desc |

### Response

```json
{
  "data": [
    {
      "id": "uuid",
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

## Get Employee Details

### Endpoint

```http
GET /employees/:id
```

### Response

```json
{
  "id": "uuid",
  "employeeCode": "EMP-00001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "department": {
    "id": "uuid",
    "name": "Engineering"
  },
  "designation": {
    "id": "uuid",
    "name": "Software Engineer"
  },
  "country": {
    "id": "uuid",
    "name": "India",
    "currencyCode": "INR"
  },
  "salaryHistory": []
}
```

---

## Create Employee

### Endpoint

```http
POST /employees
```

### Request

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "departmentId": "uuid",
  "designationId": "uuid",
  "countryId": "uuid",
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

### Response

```json
{
  "id": "uuid",
  "employeeCode": "EMP-00001"
}
```

---

## Update Employee

### Endpoint

```http
PUT /employees/:id
```

### Request

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "departmentId": "uuid",
  "designationId": "uuid",
  "countryId": "uuid",
  "status": "ACTIVE"
}
```

### Response

```json
{
  "message": "Employee updated successfully"
}
```

---

# Salary APIs

## Add Salary Revision

### Endpoint

```http
POST /employees/:id/salary
```

### Request

```json
{
  "effectiveDate": "2025-04-01",
  "baseSalary": 1200000,
  "bonus": 100000,
  "allowances": 50000,
  "reason": "Promotion"
}
```

### Response

```json
{
  "id": "uuid",
  "totalCtc": 1350000
}
```

---

# Dashboard APIs

## Dashboard Summary

### Endpoint

```http
GET /dashboard/summary
```

### Response

```json
{
  "totalEmployees": 10000,
  "activeEmployees": 9700,
  "inactiveEmployees": 300,
  "totalPayroll": 250000000,
  "averageSalary": 25000
}
```

### Purpose

Provides a quick overview of workforce and payroll information for the landing dashboard.

---

# Analytics APIs

## Analytics Summary

### Endpoint

```http
GET /analytics/summary
```

### Response

```json
{
  "totalEmployees": 10000,
  "activeEmployees": 9700,
  "totalPayroll": 250000000,
  "averageSalary": 25000,
  "medianSalary": 22000,
  "highestSalary": 250000,
  "lowestSalary": 12000
}
```

---

## Analytics By Department

### Endpoint

```http
GET /analytics/by-department
```

### Response

```json
{
  "data": [
    {
      "department": "Engineering",
      "headcount": 3000,
      "averageSalary": 40000,
      "minSalary": 15000,
      "maxSalary": 180000,
      "totalPayroll": 120000000
    }
  ]
}
```

---

## Analytics By Country

### Endpoint

```http
GET /analytics/by-country
```

### Response

```json
{
  "data": [
    {
      "country": "India",
      "headcount": 4000,
      "averageSalary": 22000,
      "totalPayroll": 88000000
    }
  ]
}
```

---

## Analytics By Designation

### Endpoint

```http
GET /analytics/by-designation
```

### Response

```json
{
  "data": [
    {
      "designation": "Software Engineer",
      "headcount": 1200,
      "averageSalary": 25000,
      "minSalary": 15000,
      "maxSalary": 45000
    }
  ]
}
```

---

## Salary Distribution

### Endpoint

```http
GET /analytics/salary-distribution
```

### Response

```json
{
  "data": [
    {
      "range": "0-25k",
      "employees": 2500
    },
    {
      "range": "25k-50k",
      "employees": 4200
    }
  ]
}
```

---

## Hiring Trends

### Endpoint

```http
GET /analytics/hiring-trends
```

### Response

```json
{
  "data": [
    {
      "month": "2025-01",
      "hires": 120
    }
  ]
}
```

---

## Payroll Trends

### Endpoint

```http
GET /analytics/payroll-trends
```

### Response

```json
{
  "data": [
    {
      "month": "2025-01",
      "payroll": 21000000
    }
  ]
}
```

---

## Top Earners

### Endpoint

```http
GET /analytics/top-earners?limit=10
```

### Response

```json
{
  "data": [
    {
      "employeeCode": "EMP-00001",
      "name": "John Doe",
      "designation": "Director",
      "department": "Engineering",
      "totalCtc": 250000
    }
  ]
}
```

---

# Master Data APIs

These APIs are used to populate frontend dropdowns and filters.

## Get Departments

### Endpoint

```http
GET /departments
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Engineering"
    }
  ]
}
```

---

## Get Designations

### Endpoint

```http
GET /designations
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Software Engineer",
      "departmentId": "uuid"
    }
  ]
}
```

---

## Get Countries

### Endpoint

```http
GET /countries
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "India",
      "currencyCode": "INR"
    }
  ]
}
```